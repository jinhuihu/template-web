# 子模板组件化功能

## 📖 功能介绍

子模板组件化功能允许您在子模板（如 `header.html`、`footer.html`）中编写 `<style>` 和 `<script>` 标签，构建时会自动：

1. **提取** 子模板中的 `<style>` 和 `<script>` 标签
2. **保存** 到独立的 CSS/JS 文件
3. **注入** `<link>` 和 `<script>` 引用到主页面
4. **清理** 子模板内容（移除已提取的标签）
5. **保护** 原始模板文件不被修改

## ✨ 特性

- 🧩 **组件化开发** - 子模板独立管理样式和脚本
- 🔄 **自动提取** - 无需手动分离CSS/JS
- 📦 **自动注入** - 自动添加引用到页面
- 🚫 **不修改源文件** - 原始模板保持完整
- ⚡ **开发友好** - 支持热更新

## 🚀 快速开始

### 1. 创建子模板

创建 `templates/header.html`：

```html
<style>
  /* 头部组件样式 */
  header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
  }
  
  header h1 {
    margin: 0;
    font-size: 24px;
  }
  
  header nav a {
    color: white;
    margin: 0 1rem;
    text-decoration: none;
  }
</style>

<header>
  <h1>{{title}}</h1>
  <nav>
    <a href="/">首页</a>
    <a href="/about.html">关于</a>
    <a href="/product.html">产品</a>
  </nav>
</header>

<script>
  // 头部组件脚本
  console.log('Header component loaded');
  
  // 高亮当前页面
  const currentPath = window.location.pathname;
  document.querySelectorAll('header nav a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.style.fontWeight = 'bold';
      link.style.textDecoration = 'underline';
    }
  });
</script>
```

### 2. 在主模板中引入

编辑 `templates/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <!-- CSS会自动注入到这里 -->
</head>
<body>
  <!-- 引入子模板 -->
  {{include 'header'}}
  
  <main>
    <h2>欢迎来到首页</h2>
    <p>这是主要内容区域</p>
  </main>
  
  <!-- JS会自动注入到这里 -->
</body>
</html>
```

### 3. 运行构建

```bash
npm run build
```

### 4. 查看结果

构建后，生成的文件结构：

```
dist/
├── index.html                          # 主页面
└── assets/
    └── components/
        └── header/                     # header组件资源
            ├── header.css              # 提取的样式
            └── header.js               # 提取的脚本
```

**生成的 `dist/index.html`**：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的网站</title>
  <!-- 自动注入的CSS -->
  <link rel="stylesheet" href="assets/components/header/header.css">
</head>
<body>
  <!-- 清理后的子模板内容（只有HTML） -->
  <header>
    <h1>我的网站</h1>
    <nav>
      <a href="/">首页</a>
      <a href="/about.html">关于</a>
      <a href="/product.html">产品</a>
    </nav>
  </header>
  
  <main>
    <h2>欢迎来到首页</h2>
    <p>这是主要内容区域</p>
  </main>
  
  <!-- 自动注入的JS -->
  <script src="assets/components/header/header.js"></script>
</body>
</html>
```

## 📝 使用示例

### 示例1：公共头部组件

```html
<!-- templates/header.html -->
<style>
  .site-header {
    background: #333;
    color: white;
    padding: 1rem;
  }
</style>

<header class="site-header">
  <h1>{{siteName}}</h1>
</header>

<script>
  console.log('Header loaded');
</script>
```

### 示例2：公共底部组件

```html
<!-- templates/footer.html -->
<style>
  .site-footer {
    background: #f5f5f5;
    padding: 2rem;
    text-align: center;
    margin-top: 2rem;
  }
  
  .footer-links a {
    margin: 0 1rem;
    color: #666;
  }
</style>

<footer class="site-footer">
  <div class="footer-links">
    <a href="/privacy.html">隐私政策</a>
    <a href="/terms.html">使用条款</a>
    <a href="/contact.html">联系我们</a>
  </div>
  <p>&copy; 2024 {{siteName}}. All rights reserved.</p>
</footer>

<script>
  // 底部组件脚本
  const year = new Date().getFullYear();
  document.querySelector('.site-footer p').textContent = 
    document.querySelector('.site-footer p').textContent.replace('2024', year);
</script>
```

### 示例3：侧边栏组件

```html
<!-- templates/sidebar.html -->
<style>
  .sidebar {
    width: 300px;
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .sidebar h3 {
    margin-top: 0;
    color: #333;
  }
  
  .sidebar ul {
    list-style: none;
    padding: 0;
  }
  
  .sidebar li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
</style>

<aside class="sidebar">
  <h3>最新文章</h3>
  <ul>
    {{each recentPosts}}
    <li>
      <a href="/post/{{$value.id}}.html">{{$value.title}}</a>
    </li>
    {{/each}}
  </ul>
</aside>

<script>
  // 侧边栏交互
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', function(e) {
      console.log('Navigating to:', this.href);
    });
  });
</script>
```

## 🔧 工作原理

### 构建流程

```
1. 解析主模板
   ↓
2. 发现 {{include 'header'}} 等引入语句
   ↓
3. 读取子模板 templates/header.html
   ↓
4. 提取 <style> 和 <script> 标签
   ↓
5. 保存到 dist/assets/components/header/
   ├── header.css
   └── header.js
   ↓
6. 创建临时目录，存放清理后的子模板
   ↓
7. 渲染主模板（使用清理后的子模板）
   ↓
8. 在渲染结果中注入资源引用
   ├── <link> 注入到 </head> 之前
   └── <script> 注入到 </body> 之前
   ↓
9. 清理临时文件
   ↓
10. 输出最终HTML
```

### 技术实现

**核心代码逻辑**：

1. **解析引入** - 使用正则表达式查找 `{{include 'xxx'}}`
2. **提取资源** - 正则提取 `<style>` 和 `<script>` 内容
3. **临时目录** - 创建 `dist/.temp-templates/` 存放清理后的模板
4. **模板渲染** - 临时修改 `art-template` 的 root 路径
5. **注入引用** - 在 `</head>` 和 `</body>` 前插入引用标签
6. **清理恢复** - 删除临时目录，恢复 template root

**关键特性**：

- ✅ 原始文件不被修改
- ✅ 支持多个子模板
- ✅ 自动去重（同一子模板只提取一次）
- ✅ 开发模式和生产模式都支持
- ✅ 支持嵌套引入

## ⚙️ 配置说明

### 输出目录结构

```javascript
// config.js
module.exports = {
  paths: {
    outputDir: './dist',              // 输出根目录
    // 组件资源会自动保存到：
    // dist/assets/components/[子模板名]/
  }
};
```

### 支持的标签

**会被提取的标签**：

```html
<!-- ✅ 支持：内联样式 -->
<style>
  .class { color: red; }
</style>

<!-- ✅ 支持：内联脚本 -->
<script>
  console.log('hello');
</script>

<!-- ❌ 不提取：外部引用 -->
<script src="external.js"></script>
<link rel="stylesheet" href="external.css">
```

## 💡 最佳实践

### 1. 命名规范

```
templates/
├── header.html           # 公共头部
├── footer.html           # 公共底部
├── sidebar.html          # 侧边栏
├── nav.html              # 导航栏
├── card-product.html     # 产品卡片组件
└── modal-login.html      # 登录弹窗组件
```

### 2. 样式作用域

使用特定的类名前缀避免冲突：

```html
<!-- templates/header.html -->
<style>
  /* 使用 .header- 前缀 */
  .header-container { ... }
  .header-nav { ... }
  .header-logo { ... }
</style>
```

### 3. 脚本封装

使用 IIFE 避免全局污染：

```html
<script>
  (function() {
    // 组件内部变量
    const headerEl = document.querySelector('header');
    
    // 组件方法
    function init() {
      console.log('Header initialized');
    }
    
    init();
  })();
</script>
```

### 4. 组件参数

通过模板数据传递参数：

```html
<!-- templates/header.html -->
<style>
  .header { background: {{headerBg || '#333'}}; }
</style>

<header class="header">
  <h1>{{title}}</h1>
</header>
```

## 🔍 常见问题

### Q1: 原始模板文件会被修改吗？

**A:** 不会！构建过程使用临时目录，原始文件保持完整。

### Q2: 开发模式支持吗？

**A:** 支持！使用 `npm run dev` 时也会自动提取组件资源。

### Q3: 可以嵌套引入吗？

**A:** 可以！子模板可以引入其他子模板。

```html
<!-- templates/header.html -->
{{include 'nav'}}
<div class="header-content">...</div>
```

### Q4: 多个页面引入同一组件会重复提取吗？

**A:** 组件资源只会生成一次，多个页面共享同一个 CSS/JS 文件。

### Q5: 如何调试提取的代码？

**A:** 查看生成的文件：

```bash
# 查看提取的CSS
cat dist/assets/components/header/header.css

# 查看提取的JS
cat dist/assets/components/header/header.js
```

## 📚 相关文档

- 📖 [项目README](../README.md)
- 📖 [使用说明](./USAGE.md)
- 📖 [快速开始](./QUICK-START.md)
- 🔧 [故障排查](./TROUBLESHOOTING.md)

## 🎯 下一步

- 创建更多可复用的子模板组件
- 学习 [移动端适配方案](./移动端适配-快速上手.md)
- 了解 [图片本地化功能](./图片本地化-快速指南.md)

---

**享受组件化开发的便利！** 🎉
