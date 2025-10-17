#!/usr/bin/env node

/**
 * 跨平台清理脚本
 * 
 * 用于清理 dist 目录
 * 支持 Windows、macOS 和 Linux
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// 获取项目根目录
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

/**
 * 主函数
 */
async function main() {
  try {
    console.log(chalk.blue.bold('\n🧹 开始清理构建目录...\n'));
    
    // 检查 dist 目录是否存在
    const exists = await fs.pathExists(distDir);
    
    if (!exists) {
      console.log(chalk.yellow('⚠️  dist 目录不存在，无需清理'));
      console.log(chalk.green.bold('\n✅ 清理完成！\n'));
      return;
    }
    
    // 删除 dist 目录
    console.log(chalk.cyan(`📁 删除目录: ${distDir}`));
    await fs.remove(distDir);
    
    console.log(chalk.green.bold('\n✅ 清理完成！\n'));
    
  } catch (error) {
    console.error(chalk.red('❌ 清理失败:'), error.message);
    process.exit(1);
  }
}

// 运行主函数
main();

