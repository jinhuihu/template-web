#!/usr/bin/env node

/**
 * 跨平台兼容性验证脚本
 * 
 * 用于验证项目在当前平台上的运行环境
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log(chalk.blue.bold('\n🔍 项目跨平台兼容性检查\n'));
console.log(chalk.gray('='.repeat(50)));

// 检查项
const checks = [];

// 1. 检查操作系统
console.log(chalk.cyan('\n1️⃣  检查操作系统'));
const platform = process.platform;
const platformName = {
  'win32': 'Windows',
  'darwin': 'macOS',
  'linux': 'Linux'
}[platform] || platform;

console.log(`   操作系统: ${chalk.green(platformName)}`);
console.log(`   架构: ${chalk.green(process.arch)}`);
checks.push({ name: '操作系统识别', passed: true });

// 2. 检查 Node.js 版本
console.log(chalk.cyan('\n2️⃣  检查 Node.js 版本'));
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 16) {
  console.log(`   版本: ${chalk.green(nodeVersion)} ✓`);
  checks.push({ name: 'Node.js 版本', passed: true });
} else {
  console.log(`   版本: ${chalk.red(nodeVersion)} ✗`);
  console.log(`   ${chalk.yellow('建议升级到 Node.js 16 或更高版本')}`);
  checks.push({ name: 'Node.js 版本', passed: false });
}

// 3. 检查必要的依赖
console.log(chalk.cyan('\n3️⃣  检查项目依赖'));
const packageJsonPath = path.join(rootDir, 'package.json');

if (fs.existsSync(packageJsonPath)) {
  console.log(`   package.json: ${chalk.green('存在')} ✓`);
  checks.push({ name: 'package.json', passed: true });
  
  // 检查 node_modules
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log(`   node_modules: ${chalk.green('已安装')} ✓`);
    checks.push({ name: '依赖安装', passed: true });
  } else {
    console.log(`   node_modules: ${chalk.yellow('未安装')}`);
    console.log(`   ${chalk.yellow('请运行: pnpm install')}`);
    checks.push({ name: '依赖安装', passed: false });
  }
} else {
  console.log(`   package.json: ${chalk.red('不存在')} ✗`);
  checks.push({ name: 'package.json', passed: false });
}

// 4. 检查必要的目录
console.log(chalk.cyan('\n4️⃣  检查项目结构'));
const requiredDirs = ['templates', 'assets', 'src', 'scripts'];
let allDirsExist = true;

requiredDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`   ${dir}/: ${chalk.green('存在')} ✓`);
  } else {
    console.log(`   ${dir}/: ${chalk.red('不存在')} ✗`);
    allDirsExist = false;
  }
});

checks.push({ name: '项目结构', passed: allDirsExist });

// 5. 检查跨平台脚本
console.log(chalk.cyan('\n5️⃣  检查跨平台脚本'));
const requiredScripts = ['clean.js', 'build.js', 'kill-ports.js'];
let allScriptsExist = true;

requiredScripts.forEach(script => {
  const scriptPath = path.join(rootDir, 'scripts', script);
  if (fs.existsSync(scriptPath)) {
    console.log(`   ${script}: ${chalk.green('存在')} ✓`);
  } else {
    console.log(`   ${script}: ${chalk.red('不存在')} ✗`);
    allScriptsExist = false;
  }
});

checks.push({ name: '跨平台脚本', passed: allScriptsExist });

// 6. 检查文档
console.log(chalk.cyan('\n6️⃣  检查文档'));
const docs = [
  { file: 'README.md', name: '主文档' },
  { file: 'WINDOWS-GUIDE.md', name: 'Windows 指南' },
  { file: 'DEV-GUIDE.md', name: '开发指南' }
];

docs.forEach(doc => {
  const docPath = path.join(rootDir, doc.file);
  if (fs.existsSync(docPath)) {
    console.log(`   ${doc.name}: ${chalk.green('存在')} ✓`);
  } else {
    console.log(`   ${doc.name}: ${chalk.yellow('不存在')}`);
  }
});

checks.push({ name: '文档完整性', passed: true });

// 7. 平台特定建议
console.log(chalk.cyan('\n7️⃣  平台特定建议'));

if (platform === 'win32') {
  console.log(chalk.yellow('   Windows 用户建议：'));
  console.log('   • 使用 Windows Terminal 或 PowerShell 7+');
  console.log('   • 查看 WINDOWS-GUIDE.md 了解详细说明');
  console.log('   • 遇到端口占用使用: pnpm run kill-ports');
} else if (platform === 'darwin') {
  console.log(chalk.green('   macOS 用户建议：'));
  console.log('   • 推荐使用 iTerm2 或系统终端');
  console.log('   • 所有功能完全兼容');
} else if (platform === 'linux') {
  console.log(chalk.green('   Linux 用户建议：'));
  console.log('   • 确保有执行权限: chmod +x scripts/*.js');
  console.log('   • 所有功能完全兼容');
}

// 总结
console.log(chalk.cyan('\n' + '='.repeat(50)));
console.log(chalk.blue.bold('\n📊 检查结果汇总\n'));

const passedChecks = checks.filter(c => c.passed).length;
const totalChecks = checks.length;

checks.forEach(check => {
  const icon = check.passed ? '✅' : '❌';
  const color = check.passed ? chalk.green : chalk.red;
  console.log(`   ${icon} ${color(check.name)}`);
});

console.log();
console.log(chalk.blue(`   通过: ${passedChecks}/${totalChecks}`));

if (passedChecks === totalChecks) {
  console.log(chalk.green.bold('\n🎉 所有检查通过！项目可以正常运行。\n'));
  console.log(chalk.blue('💡 快速开始：'));
  console.log(chalk.gray('   1. pnpm install     # 安装依赖（如未安装）'));
  console.log(chalk.gray('   2. pnpm run dev     # 启动开发服务器'));
  console.log(chalk.gray('   3. pnpm run build   # 生产构建'));
  console.log();
} else {
  console.log(chalk.yellow.bold('\n⚠️  部分检查未通过，请查看上方详情。\n'));
  
  if (!fs.existsSync(path.join(rootDir, 'node_modules'))) {
    console.log(chalk.yellow('💡 首先运行: pnpm install\n'));
  }
}

console.log(chalk.gray('📚 更多信息：'));
console.log(chalk.gray('   • README.md - 项目主文档'));
console.log(chalk.gray('   • WINDOWS-GUIDE.md - Windows 使用指南'));
console.log(chalk.gray('   • DEV-GUIDE.md - 开发模式指南\n'));

