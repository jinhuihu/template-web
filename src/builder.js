/**
 * 页面构建器
 * 
 * 负责：
 * 1. 调用API获取数据
 * 2. 渲染HTML模板
 * 3. 输出静态文件
 * 4. 提取子模板的style和script到独立文件
 */

const path = require('path');
const fs = require('fs-extra');
const template = require('art-template');
const { fetchData } = require('./api');

/**
 * 配置art-template
 */
template.defaults.extname = '.html';
template.defaults.minimize = false;
template.defaults.cache = true;  // 启用缓存，避免每次都重新读取文件

/**
 * 配置模板根目录，用于include子模板
 */
template.defaults.root = path.join(__dirname, '../templates');

/**
 * 构建单个页面
 * @param {Object} templateConfig - 模板配置
 * @param {Object} config - 全局配置
 * @returns {Promise<Object>} 构建结果
 */
async function buildPage(templateConfig, config) {
  const result = {
    template: templateConfig.name,
    output: templateConfig.output,
    success: false,
    error: null
  };

  try {
    // 1. 读取模板文件
    const templatePath = path.join(config.paths.templateDir, templateConfig.name);
    
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`模板文件不存在: ${templatePath}`);
    }

    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // 2. 从API获取数据
    let data = {};
    if (templateConfig.api) {
      try {
        data = await fetchData(
          templateConfig.api,
          templateConfig.method || 'GET',
          templateConfig.params || {},
          config.api
        );

        // 3. 应用数据转换函数（如果有）
        if (typeof templateConfig.transform === 'function') {
          data = templateConfig.transform(data);
        }
      } catch (apiError) {
        throw new Error(`API请求失败: ${apiError.message}`);
      }
    }

    // 4. 解析模板中的include，找出所有子模板
    const subTemplates = parseIncludes(templateContent);
    
    // 5. 处理子模板，提取style和script
    const cssFiles = [];
    const jsFiles = [];
    const subTemplatesWithAssets = []; // 记录有 style/script 的子模板
    let renderedHtml;
    
    // 先处理所有子模板，检查是否需要创建临时目录
    for (const subTemplate of subTemplates) {
      const assets = await processSubTemplate(subTemplate, config);
      
      if (assets.cssPath) cssFiles.push(assets.cssPath);
      if (assets.jsPath) jsFiles.push(assets.jsPath);
      
      if (assets.cleanedContent) {
        subTemplatesWithAssets.push({
          name: subTemplate,
          cleanedContent: assets.cleanedContent
        });
      }
    }
    
    // 6. 渲染模板
    // 只在有需要清理的子模板时才使用临时目录
    if (subTemplatesWithAssets.length > 0) {
      const tempTemplateDir = path.join(config.paths.outputDir, '.temp-templates');
      
      try {
        // 创建临时目录
        await fs.ensureDir(tempTemplateDir);
        
        // 写入清理后的子模板
        for (const item of subTemplatesWithAssets) {
          const tempPath = path.join(tempTemplateDir, `${item.name}.html`);
          await fs.writeFile(tempPath, item.cleanedContent, 'utf-8');
        }
        
        // 复制其他子模板（没有 style/script 的）
        for (const subTemplate of subTemplates) {
          const hasAssets = subTemplatesWithAssets.some(item => item.name === subTemplate);
          if (!hasAssets) {
            const originalPath = path.join(config.paths.templateDir, `${subTemplate}.html`);
            const tempPath = path.join(tempTemplateDir, `${subTemplate}.html`);
            if (await fs.pathExists(originalPath)) {
              await fs.copy(originalPath, tempPath);
            }
          }
        }
        
        // 临时切换模板根目录
        const originalRoot = template.defaults.root;
        template.defaults.root = tempTemplateDir;
        
        try {
          const render = template.compile(templateContent);
          renderedHtml = render(data);
        } finally {
          // 恢复原始模板根目录
          template.defaults.root = originalRoot;
          // 立即清理临时目录
          await fs.remove(tempTemplateDir);
        }
        
      } catch (error) {
        // 确保清理临时目录
        const tempTemplateDir = path.join(config.paths.outputDir, '.temp-templates');
        if (await fs.pathExists(tempTemplateDir)) {
          await fs.remove(tempTemplateDir);
        }
        throw error;
      }
    } else {
      // 没有需要处理的子模板，直接渲染
      try {
        const render = template.compile(templateContent);
        renderedHtml = render(data);
      } catch (renderError) {
        throw new Error(`模板渲染失败: ${renderError.message}`);
      }
    }

    // 7. 注入子模板的CSS和JS引用
    if (cssFiles.length > 0 || jsFiles.length > 0) {
      renderedHtml = injectAssets(renderedHtml, cssFiles, jsFiles);
    }

    // 9. 输出文件
    const outputPath = path.join(config.paths.outputDir, templateConfig.output);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, renderedHtml, 'utf-8');

    result.success = true;
    return result;

  } catch (error) {
    result.error = error.message;
    return result;
  }
}

/**
 * 解析模板中的include语句，找出所有子模板
 * @param {string} templateContent - 模板内容
 * @returns {Array<string>} 子模板名称数组
 */
function parseIncludes(templateContent) {
  const includePattern = /\{\{include\s+['"]([^'"]+)['"]\s*\}\}/g;
  const includes = [];
  let match;
  
  while ((match = includePattern.exec(templateContent)) !== null) {
    includes.push(match[1]);
  }
  
  return includes;
}

/**
 * 提取HTML中的style标签内容
 * @param {string} html - HTML内容
 * @returns {Object} { styles: Array<string>, cleanedHtml: string }
 */
function extractStyles(html) {
  const stylePattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styles = [];
  let match;
  
  while ((match = stylePattern.exec(html)) !== null) {
    styles.push(match[1].trim());
  }
  
  const cleanedHtml = html.replace(stylePattern, '');
  
  return { styles, cleanedHtml };
}

/**
 * 提取HTML中的script标签内容（只提取内联script，不包括src引用）
 * @param {string} html - HTML内容
 * @returns {Object} { scripts: Array<string>, cleanedHtml: string }
 */
function extractScripts(html) {
  const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  const scripts = [];
  let match;
  
  while ((match = scriptPattern.exec(html)) !== null) {
    scripts.push(match[1].trim());
  }
  
  const cleanedHtml = html.replace(scriptPattern, '');
  
  return { scripts, cleanedHtml };
}

/**
 * 处理子模板，提取style和script并保存到独立文件
 * @param {string} subTemplateName - 子模板名称
 * @param {Object} config - 全局配置
 * @returns {Promise<Object>} { cssPath: string|null, jsPath: string|null, cleanedContent: string }
 */
async function processSubTemplate(subTemplateName, config) {
  const result = { cssPath: null, jsPath: null, cleanedContent: null };
  
  // 读取子模板文件
  const subTemplatePath = path.join(config.paths.templateDir, `${subTemplateName}.html`);
  
  if (!await fs.pathExists(subTemplatePath)) {
    return result;
  }
  
  let subTemplateContent = await fs.readFile(subTemplatePath, 'utf-8');
  
  // 提取styles
  const { styles, cleanedHtml: htmlWithoutStyles } = extractStyles(subTemplateContent);
  
  // 提取scripts
  const { scripts, cleanedHtml: finalCleanedHtml } = extractScripts(htmlWithoutStyles);
  
  // 如果有提取的内容，保存到独立文件
  if (styles.length > 0 || scripts.length > 0) {
    const componentDir = path.join(config.paths.outputDir, 'assets', 'components', subTemplateName);
    await fs.ensureDir(componentDir);
    
    // 保存CSS文件
    if (styles.length > 0) {
      const cssContent = styles.join('\n\n');
      const cssPath = path.join(componentDir, `${subTemplateName}.css`);
      await fs.writeFile(cssPath, cssContent, 'utf-8');
      result.cssPath = `assets/components/${subTemplateName}/${subTemplateName}.css`;
    }
    
    // 保存JS文件
    if (scripts.length > 0) {
      const jsContent = scripts.join('\n\n');
      const jsPath = path.join(componentDir, `${subTemplateName}.js`);
      await fs.writeFile(jsPath, jsContent, 'utf-8');
      result.jsPath = `assets/components/${subTemplateName}/${subTemplateName}.js`;
    }
    
    // 保存清理后的内容（用于临时模板文件）
    result.cleanedContent = finalCleanedHtml;
  }
  
  return result;
}

/**
 * 在HTML中注入CSS和JS引用
 * @param {string} html - 原始HTML
 * @param {Array<string>} cssFiles - CSS文件路径数组
 * @param {Array<string>} jsFiles - JS文件路径数组
 * @returns {string} 注入后的HTML
 */
function injectAssets(html, cssFiles, jsFiles) {
  let result = html;
  
  // 在</head>之前注入CSS
  if (cssFiles.length > 0) {
    const cssLinks = cssFiles
      .map(file => `  <link rel="stylesheet" href="${file}">`)
      .join('\n');
    result = result.replace('</head>', `${cssLinks}\n</head>`);
  }
  
  // 在</body>之前注入JS
  if (jsFiles.length > 0) {
    const scriptTags = jsFiles
      .map(file => `  <script src="${file}"></script>`)
      .join('\n');
    result = result.replace('</body>', `${scriptTags}\n</body>`);
  }
  
  return result;
}

/**
 * 构建所有页面
 * @param {Object} config - 全局配置
 * @returns {Promise<Array>} 所有页面的构建结果
 */
async function buildPages(config) {
  const results = [];

  for (const templateConfig of config.templates) {
    const result = await buildPage(templateConfig, config);
    results.push(result);
  }

  return results;
}

/**
 * 复制静态资源文件
 * @param {Object} config - 全局配置
 */
async function copyAssets(config) {
  const assetsDir = config.paths.assetsDir;
  const outputDir = config.paths.outputDir;

  if (await fs.pathExists(assetsDir)) {
    const assetsOutputDir = path.join(outputDir, 'assets');
    await fs.copy(assetsDir, assetsOutputDir);
  }
}

module.exports = {
  buildPage,
  buildPages,
  copyAssets
};

