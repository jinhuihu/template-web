/**
 * 文件监听模块
 * 
 * 在开发模式下监听文件变化并自动重新构建
 * 支持热更新和浏览器自动刷新
 */

const chokidar = require('chokidar');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const crypto = require('crypto');

// 全局文件哈希Map，在监听器重启时保持
const globalFileHashes = new Map();

/**
 * 监听文件变化
 * @param {Object} config - 配置对象
 * @param {Function} callback - 文件变化时的回调函数
 */
function watchFiles(config, callback) {
  const watchPaths = [
    config.paths.templateDir,
    config.paths.assetsDir,
    './config.js'
  ].filter(p => p); // 过滤掉空路径

  console.log(chalk.blue('📁 监听目录:'));
  watchPaths.forEach(p => {
    console.log(chalk.gray(`  - ${p}`));
  });
  console.log('');

  const watcher = chokidar.watch(watchPaths, {
    persistent: true,
    ignoreInitial: true,
    usePolling: false,  // 使用原生fs事件
    ignorePermissionErrors: true,  // 忽略权限错误
    atomic: 300,  // 原子写入检测
    awaitWriteFinish: {
      stabilityThreshold: 300,  // 文件停止变化300ms后触发（平衡响应速度和稳定性）
      pollInterval: 100
    },
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/*.log',
      '**/.temp-*/**'  // 忽略所有临时目录
    ],
    depth: 10
  });

  // 防抖处理
  let timeout;
  let isProcessing = false;
  
  // 计算文件哈希
  const getFileHash = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  };
  
  const debouncedCallback = async (eventType, filePath) => {
    if (isProcessing) {
      console.log(chalk.yellow('⚠️  构建正在进行中，跳过此次文件变化'));
      return;
    }

    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      // 检查文件内容是否真的变化了（使用全局哈希Map）
      const currentHash = getFileHash(filePath);
      const previousHash = globalFileHashes.get(filePath);
      
      if (currentHash && currentHash === previousHash) {
        // 内容未变化，静默跳过（不打印日志，避免刷屏）
        return;
      }
      
      // 更新全局哈希
      if (currentHash) {
        globalFileHashes.set(filePath, currentHash);
      }
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(chalk.cyan(`📝 文件变化: ${eventType} ${relativePath}`));
      
      // 设置构建标志
      isProcessing = true;
      
      try {
        await callback();
      } catch (error) {
        console.error(chalk.red('❌ 构建失败:'), error.message);
      } finally {
        // 重置构建标志，添加延迟避免过快触发下一次构建
        setTimeout(() => {
          isProcessing = false;
        }, 2000); // 增加到2秒
      }
    }, 800); // 增加防抖延迟到800ms
  };

  watcher
    .on('change', (filePath) => debouncedCallback('修改', filePath))
    .on('add', (filePath) => {
      // 新文件添加时，记录其哈希
      const hash = getFileHash(filePath);
      if (hash) {
        globalFileHashes.set(filePath, hash);
      }
      debouncedCallback('添加', filePath);
    })
    .on('unlink', (filePath) => {
      // 文件删除时，移除哈希记录
      globalFileHashes.delete(filePath);
      debouncedCallback('删除', filePath);
    })
    .on('error', error => {
      console.error(chalk.red('❌ 文件监听错误:'), error);
    })
    .on('ready', () => {
      // 监听器就绪时，初始化所有文件的哈希
      console.log(chalk.gray('[Watcher] 初始化文件哈希...'));
      const watched = watcher.getWatched();
      let fileCount = 0;
      
      Object.keys(watched).forEach(dir => {
        watched[dir].forEach(file => {
          const filePath = path.join(dir, file);
          const hash = getFileHash(filePath);
          if (hash) {
            globalFileHashes.set(filePath, hash);
            fileCount++;
          }
        });
      });
      
      console.log(chalk.gray(`[Watcher] 已记录 ${fileCount} 个文件的哈希`));
      console.log(chalk.green('✅ 文件监听器已就绪\n'));
    });

  return watcher;
}

module.exports = {
  watchFiles
};

