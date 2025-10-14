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
 * 清理指定端口的进程
 */
async function killPortProcesses(port) {
  try {
    // 查找占用端口的进程
    const { stdout } = await execCommand(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length === 0) {
      console.log(chalk.green(`✓ 端口 ${port} 未被占用`));
      return;
    }
    
    console.log(chalk.yellow(`🔍 发现端口 ${port} 被以下进程占用: ${pids.join(', ')}`));
    
    // 终止进程
    for (const pid of pids) {
      try {
        await execCommand(`kill -9 ${pid}`);
        console.log(chalk.green(`✓ 已终止进程 ${pid}`));
      } catch (error) {
        console.log(chalk.red(`✗ 无法终止进程 ${pid}: ${error.message}`));
      }
    }
    
  } catch (error) {
    if (error.message.includes('lsof: no processes found')) {
      console.log(chalk.green(`✓ 端口 ${port} 未被占用`));
    } else {
      console.log(chalk.red(`✗ 检查端口 ${port} 时出错: ${error.message}`));
    }
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
  console.log(chalk.blue('💡 现在可以重新启动开发服务器: npm run dev\n'));
}

// 运行主函数
main().catch(error => {
  console.error(chalk.red('❌ 端口清理失败:'), error.message);
  process.exit(1);
});
