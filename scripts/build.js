#!/usr/bin/env node

/**
 * 跨平台构建脚本
 * 
 * 替代 build.sh，支持 Windows、macOS 和 Linux
 * 
 * 功能：
 * 1. 检查 Mock 服务器是否运行
 * 2. 如果未运行，自动启动
 * 3. 执行构建
 * 4. 提供构建结果反馈
 */

const { spawn } = require('child_process');
const chalk = require('chalk');
const net = require('net');

// Mock 服务器端口
const MOCK_PORT = 3000;
let mockServerProcess = null;
let autoStarted = false;

/**
 * 检查端口是否被占用
 * @param {number} port - 端口号
 * @returns {Promise<boolean>} 端口是否被占用
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // 端口被占用
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // 端口未被占用
    });
    
    server.listen(port);
  });
}

/**
 * 等待指定时间
 * @param {number} ms - 毫秒数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 启动 Mock 服务器
 * @returns {Promise<boolean>} 是否启动成功
 */
async function startMockServer() {
  return new Promise((resolve) => {
    console.log(chalk.cyan('🚀 启动Mock服务器...'));
    
    mockServerProcess = spawn('node', ['mock-server.js'], {
      stdio: 'ignore',
      detached: true
    });
    
    mockServerProcess.unref();
    
    // 等待服务器启动
    setTimeout(async () => {
      const isRunning = await checkPort(MOCK_PORT);
      if (isRunning) {
        console.log(chalk.green(`   ✓ Mock服务器启动成功 (PID: ${mockServerProcess.pid})`));
        resolve(true);
      } else {
        console.log(chalk.red('   ✗ Mock服务器启动失败'));
        resolve(false);
      }
    }, 2000);
  });
}

/**
 * 执行构建
 * @returns {Promise<boolean>} 构建是否成功
 */
function runBuild() {
  return new Promise((resolve) => {
    console.log(chalk.blue('\n📦 开始构建...\n'));
    
    const buildProcess = spawn('node', ['src/production-builder.js'], {
      stdio: 'inherit'
    });
    
    buildProcess.on('exit', (code) => {
      resolve(code === 0);
    });
    
    buildProcess.on('error', (error) => {
      console.error(chalk.red('❌ 构建进程启动失败:'), error.message);
      resolve(false);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log(chalk.blue.bold('=========================================='));
  console.log(chalk.blue.bold('  静态页面构建工具'));
  console.log(chalk.blue.bold('=========================================='));
  console.log();
  
  try {
    // 1. 检查 Mock 服务器
    const mockServerRunning = await checkPort(MOCK_PORT);
    
    if (!mockServerRunning) {
      console.log(chalk.yellow('⚠️  警告: Mock API服务器未运行！'));
      console.log();
      console.log('请先在另一个终端窗口启动Mock服务器：');
      console.log(chalk.cyan('  node mock-server.js'));
      console.log();
      console.log('或者等待自动启动...');
      
      await sleep(1000);
      
      // 尝试启动 Mock 服务器
      const started = await startMockServer();
      
      if (!started) {
        console.log(chalk.red('\n❌ 无法启动Mock服务器，构建终止'));
        process.exit(1);
      }
      
      autoStarted = true;
    } else {
      console.log(chalk.green('✓ Mock API服务器正在运行\n'));
    }
    
    // 2. 执行构建
    const buildSuccess = await runBuild();
    
    // 3. 显示结果
    console.log();
    if (buildSuccess) {
      console.log(chalk.green.bold('=========================================='));
      console.log(chalk.green.bold('  ✅ 构建成功！'));
      console.log(chalk.green.bold('=========================================='));
      console.log();
      console.log('生成的文件在 dist/ 目录中');
      console.log();
      console.log('你可以：');
      console.log('  1. 用浏览器打开 dist/index.html 查看效果');
      console.log('  2. 将 dist/ 目录部署到静态服务器');
      console.log();
    } else {
      console.log(chalk.red.bold('=========================================='));
      console.log(chalk.red.bold('  ❌ 构建失败'));
      console.log(chalk.red.bold('=========================================='));
      console.log();
      console.log('请检查错误信息并重试');
      console.log();
      process.exit(1);
    }
    
    // 4. 提示 Mock 服务器状态
    if (autoStarted && mockServerProcess) {
      console.log(chalk.yellow(`Mock服务器仍在后台运行 (PID: ${mockServerProcess.pid})`));
      console.log(chalk.yellow('如需停止，可以运行: pnpm run kill-ports'));
      console.log();
    }
    
  } catch (error) {
    console.error(chalk.red('❌ 构建过程出错:'), error.message);
    process.exit(1);
  }
}

// 处理中断信号
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 构建已取消'));
  if (mockServerProcess && !mockServerProcess.killed) {
    mockServerProcess.kill();
  }
  process.exit(0);
});

// 运行主函数
main();

