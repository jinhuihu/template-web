/**
 * 文件监听模块
 * 
 * 在开发模式下监听文件变化并自动重新构建
 * 支持热更新和浏览器自动刷新
 */

const chokidar = require('chokidar');
const path = require('path');
const chalk = require('chalk');

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
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    },
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/*.log'
    ]
  });

  // 防抖处理
  let timeout;
  let isProcessing = false;
  
  const debouncedCallback = (eventType, filePath) => {
    if (isProcessing) {
      console.log(chalk.yellow('⚠️  构建正在进行中，跳过此次文件变化'));
      return;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(chalk.cyan(`📝 文件变化: ${eventType} ${relativePath}`));
      callback();
    }, 500);
  };

  watcher
    .on('change', (filePath) => debouncedCallback('修改', filePath))
    .on('add', (filePath) => debouncedCallback('添加', filePath))
    .on('unlink', (filePath) => debouncedCallback('删除', filePath))
    .on('error', error => {
      console.error(chalk.red('❌ 文件监听错误:'), error);
    })
    .on('ready', () => {
      console.log(chalk.green('✅ 文件监听器已就绪\n'));
    });

  return watcher;
}

module.exports = {
  watchFiles
};

