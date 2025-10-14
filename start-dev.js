/**
 * 开发环境启动脚本
 * 
 * 功能：
 * 1. 同时启动Mock API服务器和开发服务器
 * 2. 使用concurrently管理多个进程
 * 3. 提供统一的开发环境入口
 */

const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');

console.log(chalk.blue.bold('\n🚀 启动开发环境...\n'));

// 启动Mock API服务器
const mockServer = spawn('node', ['mock-server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// 等待一秒后启动开发服务器
setTimeout(() => {
  const devServer = spawn('node', ['src/dev-server.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  // 处理进程退出
  const cleanup = () => {
    console.log(chalk.yellow('\n\n👋 正在关闭开发环境...'));
    
    if (mockServer && !mockServer.killed) {
      mockServer.kill('SIGTERM');
    }
    
    if (devServer && !devServer.killed) {
      devServer.kill('SIGTERM');
    }
    
    setTimeout(() => {
      console.log(chalk.green('✅ 开发环境已关闭'));
      process.exit(0);
    }, 1000);
  };

  // 监听退出信号
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // 监听子进程退出
  mockServer.on('exit', (code) => {
    console.log(chalk.red(`Mock服务器退出，代码: ${code}`));
    if (devServer && !devServer.killed) {
      devServer.kill('SIGTERM');
    }
  });

  devServer.on('exit', (code) => {
    console.log(chalk.red(`开发服务器退出，代码: ${code}`));
    if (mockServer && !mockServer.killed) {
      mockServer.kill('SIGTERM');
    }
  });

}, 1000);

// 处理启动错误
mockServer.on('error', (error) => {
  console.error(chalk.red('❌ Mock服务器启动失败:'), error.message);
  process.exit(1);
});
