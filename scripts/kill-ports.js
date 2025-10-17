#!/usr/bin/env node

/**
 * 端口清理脚本
 * 
 * 用于清理占用开发服务器端口的进程
 * 避免端口冲突导致的启动失败
 */

const { exec } = require('child_process');
const chalk = require('chalk');

// 需要清理的端口列表
const PORTS = [3000, 3001];

/**
 * 执行命令并返回Promise
 */
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * 清理指定端口的进程（跨平台）
 */
async function killPortProcesses(port) {
  const platform = process.platform;
  
  try {
    let command;
    let pids = [];
    
    // 根据操作系统使用不同的命令
    if (platform === 'win32') {
      // Windows: 使用 netstat 和 taskkill
      try {
        const { stdout } = await execCommand(`netstat -ano | findstr :${port}`);
        const lines = stdout.trim().split('\n');
        
        // 提取 PID（最后一列）
        const pidSet = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pidSet.add(pid);
          }
        });
        
        pids = Array.from(pidSet);
      } catch (error) {
        // 没有找到占用端口的进程
        if (!error.message.includes('找不到')) {
          throw error;
        }
      }
    } else {
      // macOS/Linux: 使用 lsof
      try {
        const { stdout } = await execCommand(`lsof -ti:${port}`);
        pids = stdout.trim().split('\n').filter(pid => pid);
      } catch (error) {
        // 没有找到占用端口的进程
        if (!error.message.includes('lsof')) {
          throw error;
        }
      }
    }
    
    if (pids.length === 0) {
      console.log(chalk.green(`✓ 端口 ${port} 未被占用`));
      return;
    }
    
    console.log(chalk.yellow(`🔍 发现端口 ${port} 被以下进程占用: ${pids.join(', ')}`));
    
    // 终止进程
    for (const pid of pids) {
      try {
        if (platform === 'win32') {
          // Windows: 使用 taskkill
          await execCommand(`taskkill /F /PID ${pid}`);
        } else {
          // macOS/Linux: 使用 kill
          await execCommand(`kill -9 ${pid}`);
        }
        console.log(chalk.green(`✓ 已终止进程 ${pid}`));
      } catch (error) {
        console.log(chalk.red(`✗ 无法终止进程 ${pid}: ${error.message}`));
      }
    }
    
  } catch (error) {
    console.log(chalk.green(`✓ 端口 ${port} 未被占用`));
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(chalk.blue.bold('\n🧹 开始清理端口...\n'));
  
  for (const port of PORTS) {
    await killPortProcesses(port);
  }
  
  console.log(chalk.green.bold('\n✅ 端口清理完成！\n'));
  console.log(chalk.blue('💡 现在可以重新启动开发服务器: pnpm run dev\n'));
}

// 运行主函数
main().catch(error => {
  console.error(chalk.red('❌ 端口清理失败:'), error.message);
  process.exit(1);
});
