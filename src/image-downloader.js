/**
 * 图片下载和本地化模块
 * 
 * 功能：
 * 1. 解析HTML中的图片URL
 * 2. 下载远程图片到本地
 * 3. 替换HTML中的URL为本地路径
 * 
 * 仅在生产构建时使用
 */

const path = require('path');
const fs = require('fs-extra');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

/**
 * 提取HTML中的图片URL
 * @param {string} html - HTML内容
 * @returns {Array<Object>} 图片URL列表
 */
function extractImageUrls(html) {
  const urls = new Set();
  
  // 匹配 <img src="...">
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  
  while ((match = imgSrcRegex.exec(html)) !== null) {
    const url = match[1];
    // 只处理http/https的远程图片
    if (url.startsWith('http://') || url.startsWith('https://')) {
      urls.add(url);
    }
  }
  
  // 匹配 background-image: url(...)
  const bgImageRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  
  while ((match = bgImageRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.startsWith('http://') || url.startsWith('https://')) {
      urls.add(url);
    }
  }
  
  // 匹配 style="background: url(...)"
  const styleBgRegex = /style=["'][^"']*background[^"']*url\(["']?([^"')]+)["']?\)[^"']*["']/gi;
  
  while ((match = styleBgRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.startsWith('http://') || url.startsWith('https://')) {
      urls.add(url);
    }
  }
  
  return Array.from(urls);
}

/**
 * 下载单个图片
 * @param {string} url - 图片URL
 * @param {string} savePath - 保存路径
 * @returns {Promise<void>}
 */
function downloadImage(url, savePath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        downloadImage(redirectUrl, savePath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${response.statusCode}`));
        return;
      }
      
      // 创建文件写入流
      const fileStream = fs.createWriteStream(savePath);
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', (error) => {
        fs.unlink(savePath, () => {}); // 删除不完整的文件
        reject(error);
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    // 设置超时
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('下载超时'));
    });
  });
}

/**
 * 生成本地文件名
 * @param {string} url - 图片URL
 * @returns {string} 文件名
 */
function generateLocalFileName(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname) || '.jpg';
    
    // 使用URL的hash作为文件名，避免重复和特殊字符
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 12);
    
    // 尝试保留原始文件名（如果有）
    const basename = path.basename(pathname, ext);
    if (basename && basename.length > 0 && basename.length < 50) {
      // 清理文件名中的特殊字符
      const cleanName = basename.replace(/[^a-zA-Z0-9_-]/g, '_');
      return `${cleanName}_${hash}${ext}`;
    }
    
    return `image_${hash}${ext}`;
  } catch (error) {
    // URL解析失败，使用hash作为文件名
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 12);
    return `image_${hash}.jpg`;
  }
}

/**
 * 处理HTML中的图片，下载并替换URL
 * @param {string} html - HTML内容
 * @param {string} pageName - 页面名称（不含扩展名）
 * @param {string} outputDir - 输出目录
 * @returns {Promise<string>} 处理后的HTML
 */
async function processImages(html, pageName, outputDir) {
  // 提取所有图片URL
  const imageUrls = extractImageUrls(html);
  
  if (imageUrls.length === 0) {
    console.log(`  未找到远程图片URL`);
    return html;
  }
  
  console.log(`  找到 ${imageUrls.length} 个远程图片URL`);
  
  // 创建图片保存目录
  const imageDir = path.join(outputDir, 'assets', 'images', pageName);
  await fs.ensureDir(imageDir);
  
  // URL映射表：原始URL -> 本地路径
  const urlMap = new Map();
  
  // 下载所有图片
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    
    try {
      console.log(`  [${i + 1}/${imageUrls.length}] 下载: ${url.substring(0, 60)}...`);
      
      const fileName = generateLocalFileName(url);
      const localPath = path.join(imageDir, fileName);
      const relativePath = `assets/images/${pageName}/${fileName}`;
      
      // 下载图片
      await downloadImage(url, localPath);
      
      // 记录映射关系
      urlMap.set(url, relativePath);
      
      console.log(`  ✓ 已保存: ${relativePath}`);
      
    } catch (error) {
      console.warn(`  ⚠️  下载失败: ${url}`);
      console.warn(`     错误: ${error.message}`);
      // 下载失败时不替换URL，保留原始链接
    }
  }
  
  // 替换HTML中的URL
  let processedHtml = html;
  
  urlMap.forEach((localPath, originalUrl) => {
    // 替换所有出现的URL（考虑单引号、双引号、无引号）
    const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // <img src="url">
    processedHtml = processedHtml.replace(
      new RegExp(`(<img[^>]+src=["'])${escapedUrl}(["'])`, 'gi'),
      `$1${localPath}$2`
    );
    
    // background-image: url(...)
    processedHtml = processedHtml.replace(
      new RegExp(`(background-image:\\s*url\\(["']?)${escapedUrl}(["']?\\))`, 'gi'),
      `$1${localPath}$2`
    );
    
    // style="background: url(...)"
    processedHtml = processedHtml.replace(
      new RegExp(`(background[^:]*:\\s*[^;]*url\\(["']?)${escapedUrl}(["']?\\))`, 'gi'),
      `$1${localPath}$2`
    );
  });
  
  console.log(`  ✓ 已替换 ${urlMap.size} 个图片URL为本地路径`);
  
  return processedHtml;
}

/**
 * 检查URL是否为远程图片
 * @param {string} url - URL
 * @returns {boolean}
 */
function isRemoteImageUrl(url) {
  if (!url) return false;
  
  // 检查是否为http/https URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  // 检查是否为图片扩展名
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const lowerUrl = url.toLowerCase();
  
  // 检查扩展名或查询参数
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('image') || 
         lowerUrl.includes('img') ||
         lowerUrl.includes('photo');
}

module.exports = {
  extractImageUrls,
  downloadImage,
  processImages,
  generateLocalFileName,
  isRemoteImageUrl
};

