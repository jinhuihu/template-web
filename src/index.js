/**
 * 静态页面构建工具 - 主入口
 * 
 * 功能：
 * 1. 从后端API获取数据
 * 2. 使用art-template渲染HTML模板
 * 3. 生成静态HTML文件
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { buildPages, copyAssets } = require('./builder');
const { watchFiles } = require('./watcher');

// 加载配置文件
const config = require('../config');

/**
 * 主函数
 */
async function main() {
  console.log(chalk.blue.bold('\n🚀 开始构建静态页面...\n'));

  try {
    // 清理并创建输出目录
    await fs.emptyDir(config.paths.outputDir);
    console.log(chalk.green(`✓ 输出目录已清理: ${config.paths.outputDir}`));

    // 构建所有页面
    const results = await buildPages(config);
    
    // 输出构建结果
    console.log(chalk.blue.bold('\n📊 构建结果:'));
    results.forEach(result => {
      if (result.success) {
        console.log(chalk.green(`  ✓ ${result.template} -> ${result.output}`));
      } else {
        console.log(chalk.red(`  ✗ ${result.template}: ${result.error}`));
      }
    });

    // 复制静态资源
    if (await fs.pathExists(config.paths.assetsDir)) {
      await copyAssets(config);
      console.log(chalk.green(`\n✓ 静态资源已复制`));
    }

    // 统计
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(chalk.blue.bold('\n📈 构建统计:'));
    console.log(chalk.green(`  成功: ${successCount} 个页面`));
    if (failCount > 0) {
      console.log(chalk.red(`  失败: ${failCount} 个页面`));
    }
    
    console.log(chalk.blue.bold(`\n✨ 构建完成！输出目录: ${config.paths.outputDir}\n`));

    // 检查是否启用监听模式
    const watchMode = process.argv.includes('--watch') || config.dev.watch;
    if (watchMode) {
      console.log(chalk.yellow('👀 监听模式已启用，正在监听文件变化...\n'));
      watchFiles(config, async () => {
        try {
          // 重新构建所有页面
          const results = await buildPages(config);
          
          // 重新复制静态资源
          if (await fs.pathExists(config.paths.assetsDir)) {
            await copyAssets(config);
          }
          
          // 输出构建结果
          const successCount = results.filter(r => r.success).length;
          const failCount = results.filter(r => !r.success).length;
          
          if (failCount > 0) {
            console.log(chalk.red(`⚠️  构建完成，但有 ${failCount} 个页面失败`));
          } else {
            console.log(chalk.green(`✓ 构建完成，成功构建 ${successCount} 个页面`));
          }
        } catch (error) {
          console.error(chalk.red('❌ 重新构建失败:'), error.message);
        }
      });
    }

  } catch (error) {
    console.error(chalk.red('\n❌ 构建失败:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
main();

