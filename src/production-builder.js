/**
 * 生产环境构建器
 * 
 * 负责：
 * 1. 构建页面（移除热更新脚本）
 * 2. 压缩和混淆文件
 * 3. 优化生产环境输出
 */

const path = require('path');
const fs = require('fs-extra');
const { minify: minifyJS } = require('terser');
const { minify: minifyHTML } = require('html-minifier-terser');
const { buildPages, copyAssets } = require('./builder');
const config = require('../config');

/**
 * 移除HTML中的热更新脚本
 * @param {string} html - HTML内容
 * @returns {string} 处理后的HTML
 */
function removeHotReloadScript(html) {
  // 移除热更新脚本注释和代码
  const hotReloadRegex = /<!-- 开发环境热更新脚本 -->[\s\S]*?<\/script>/g;
  return html.replace(hotReloadRegex, '');
}

/**
 * 压缩HTML文件
 * @param {string} html - HTML内容
 * @returns {Promise<string>} 压缩后的HTML
 */
async function compressHTML(html) {
  try {
    const result = await minifyHTML(html, {
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeEmptyElements: false,
      lint: false,
      keepClosingSlash: false,
      caseSensitive: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true
    });
    return result;
  } catch (error) {
    console.warn('HTML压缩失败，使用原始内容:', error.message);
    return html;
  }
}

/**
 * 压缩JavaScript文件
 * @param {string} js - JavaScript内容
 * @returns {Promise<string>} 压缩后的JavaScript
 */
async function compressJS(js) {
  try {
    const result = await minifyJS(js, {
      compress: {
        drop_console: true, // 移除console语句
        drop_debugger: true, // 移除debugger语句
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 移除指定的纯函数调用
        passes: 2 // 多次压缩以获得更好的效果
      },
      mangle: {
        toplevel: true, // 混淆顶级作用域的变量名
        properties: {
          regex: /^_/ // 混淆以下划线开头的属性名
        }
      },
      format: {
        comments: false // 移除注释
      }
    });
    return result.code;
  } catch (error) {
    console.warn('JavaScript压缩失败，使用原始内容:', error.message);
    return js;
  }
}

/**
 * 压缩CSS文件
 * @param {string} css - CSS内容
 * @returns {string} 压缩后的CSS
 */
function compressCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
    .replace(/\s+/g, ' ') // 合并空白字符
    .replace(/;\s*}/g, '}') // 移除最后一个分号
    .replace(/,\s+/g, ',') // 移除逗号后的空格
    .replace(/:\s+/g, ':') // 移除冒号后的空格
    .replace(/{\s+/g, '{') // 移除左大括号后的空格
    .replace(/;\s+/g, ';') // 移除分号后的空格
    .trim();
}

/**
 * 处理单个HTML文件
 * @param {string} filePath - 文件路径
 */
async function processHTMLFile(filePath) {
  try {
    console.log(`处理HTML文件: ${filePath}`);
    
    // 读取文件内容
    let content = await fs.readFile(filePath, 'utf-8');
    
    // 移除热更新脚本
    content = removeHotReloadScript(content);
    
    // 压缩HTML
    content = await compressHTML(content);
    
    // 写回文件
    await fs.writeFile(filePath, content, 'utf-8');
    
    console.log(`✓ HTML文件处理完成: ${filePath}`);
  } catch (error) {
    console.error(`处理HTML文件失败 ${filePath}:`, error.message);
  }
}

/**
 * 处理JavaScript文件
 * @param {string} filePath - 文件路径
 */
async function processJSFile(filePath) {
  try {
    console.log(`处理JavaScript文件: ${filePath}`);
    
    // 读取文件内容
    let content = await fs.readFile(filePath, 'utf-8');
    
    // 压缩JavaScript
    content = await compressJS(content);
    
    // 写回文件
    await fs.writeFile(filePath, content, 'utf-8');
    
    console.log(`✓ JavaScript文件处理完成: ${filePath}`);
  } catch (error) {
    console.error(`处理JavaScript文件失败 ${filePath}:`, error.message);
  }
}

/**
 * 处理CSS文件
 * @param {string} filePath - 文件路径
 */
async function processCSSFile(filePath) {
  try {
    console.log(`处理CSS文件: ${filePath}`);
    
    // 读取文件内容
    let content = await fs.readFile(filePath, 'utf-8');
    
    // 压缩CSS
    content = compressCSS(content);
    
    // 写回文件
    await fs.writeFile(filePath, content, 'utf-8');
    
    console.log(`✓ CSS文件处理完成: ${filePath}`);
  } catch (error) {
    console.error(`处理CSS文件失败 ${filePath}:`, error.message);
  }
}

/**
 * 递归处理目录中的所有文件
 * @param {string} dirPath - 目录路径
 */
async function processDirectory(dirPath) {
  try {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        // 递归处理子目录
        await processDirectory(itemPath);
      } else if (stat.isFile()) {
        // 根据文件扩展名处理文件
        const ext = path.extname(item).toLowerCase();
        
        switch (ext) {
          case '.html':
            await processHTMLFile(itemPath);
            break;
          case '.js':
            await processJSFile(itemPath);
            break;
          case '.css':
            await processCSSFile(itemPath);
            break;
          default:
            console.log(`跳过文件: ${itemPath} (不支持的文件类型)`);
        }
      }
    }
  } catch (error) {
    console.error(`处理目录失败 ${dirPath}:`, error.message);
  }
}

/**
 * 生产环境构建主函数
 */
async function buildProduction() {
  console.log('🚀 开始生产环境构建...');
  
  try {
    // 1. 确保输出目录存在
    await fs.ensureDir(config.paths.outputDir);
    
    // 2. 构建页面（这会生成包含热更新脚本的HTML）
    console.log('📄 构建页面...');
    const results = await buildPages(config);
    
    // 检查构建结果
    const failedResults = results.filter(result => !result.success);
    if (failedResults.length > 0) {
      console.error('❌ 部分页面构建失败:');
      failedResults.forEach(result => {
        console.error(`  - ${result.template}: ${result.error}`);
      });
      process.exit(1);
    }
    
    console.log('✓ 页面构建完成');
    
    // 3. 复制静态资源
    console.log('📁 复制静态资源...');
    await copyAssets(config);
    console.log('✓ 静态资源复制完成');
    
    // 4. 处理输出目录中的所有文件（移除热更新脚本并压缩）
    console.log('🔧 优化生产环境文件...');
    await processDirectory(config.paths.outputDir);
    
    console.log('✅ 生产环境构建完成！');
    console.log(`📦 输出目录: ${config.paths.outputDir}`);
    
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  buildProduction();
}

module.exports = {
  buildProduction,
  removeHotReloadScript,
  compressHTML,
  compressJS,
  compressCSS
};
