/**
 * 页面构建器
 * 
 * 负责：
 * 1. 调用API获取数据
 * 2. 渲染HTML模板
 * 3. 输出静态文件
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

    // 4. 渲染模板
    let renderedHtml;
    try {
      // 使用art-template的compile方法
      const render = template.compile(templateContent);
      renderedHtml = render(data);
    } catch (renderError) {
      throw new Error(`模板渲染失败: ${renderError.message}`);
    }

    // 5. 输出文件
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

