# 静态页面打包渲染工具

一个基于 Node.js 和 art-template 的静态页面生成工具，可以从后端API获取数据，填充到HTML模板中，生成可直接部署的静态HTML文件。

## 📑 目录

- [✨ 特性](#-特性)
- [📦 安装](#-安装)
- [🚀 快速开始](#-快速开始)
- [📁 项目结构](#-项目结构)
- [⚙️ 配置说明](#️-配置说明)
- [📝 模板语法](#-模板语法)
- [🆕 新功能使用](#-新功能使用)
  - [📱 移动端适配方案](#-移动端适配方案)
  - [🧩 子模板组件化](#-子模板组件化)
  - [📷 图片本地化](#-图片本地化)
- [📚 完整文档](#-完整文档)
- [💡 最佳实践](#-最佳实践)
- [🎯 快速链接](#-快速链接)
- [📊 功能总览](#-功能总览)

---

## ✨ 特性

### 核心功能

- 🚀 **快速构建** - 基于高性能的 art-template 模板引擎
- 📡 **API集成** - 自动从后端接口获取数据
- 🎨 **灵活定制** - 支持多种模板语法
- ⚡️ **高性能** - 极速渲染，批量生成
- 🔄 **热更新** - 开发模式支持文件监听
- 📦 **开箱即用** - 完整的项目结构和示例

### 🆕 新增功能

- 🧩 **子模板组件化** - 自动提取子模板的 style 和 script 到独立文件 [查看文档 →](./docs/COMPONENT-EXTRACTION.md)
- 📱 **移动端适配** - 基于750px设计稿的rem自适应方案，PC端620px居中容器 [查看文档 →](./docs/移动端适配-快速上手.md)
- 📷 **图片本地化** - 生产构建时自动下载远程图片到本地 [查看文档 →](./docs/图片本地化-快速指南.md)
- 🔍 **文件哈希检测** - 防止开发模式无限构建，智能识别文件内容变化
- 📝 **日志优化** - 清爽的控制台输出，减少刷屏

## 📦 安装

> **✅ 跨平台支持**：本项目完全兼容 Windows、macOS 和 Linux  
> **Windows 用户**：请查看 [Windows 使用指南](./WINDOWS-GUIDE.md) 了解详细说明

```bash
# 克隆或下载项目后，使用 pnpm 安装依赖（推荐）
pnpm install

# 或使用 npm
npm install
```

## 🚀 快速开始

### 方法1：一键构建（推荐）

```bash
pnpm run build:full
```

这个命令会自动检查并启动Mock服务器，然后构建页面。

### 方法2：手动启动

**终端1** - 启动Mock API服务器：

```bash
pnpm run start
```

服务器会在 http://localhost:3000 启动，提供测试数据。

**终端2** - 构建静态页面：

```bash
pnpm run build
```

生成的静态文件会输出到 `dist/` 目录。

### 开发模式（监听文件变化）

```bash
# 确保Mock服务器正在运行
pnpm run dev
```

⚠️ **重要提示**：构建前必须确保Mock API服务器正在运行！否则会出现连接错误。

### 开发服务器（推荐）

开发服务器提供完整的开发环境：
- 静态文件服务
- 热更新功能
- 浏览器自动刷新
- 文件变化监听

**访问地址：** http://localhost:3000

### 端口冲突解决

如果遇到端口被占用的错误，可以使用以下命令清理：

```bash
# 清理占用端口的进程（跨平台兼容）
pnpm run kill-ports

# 或者一键清理并启动开发服务器
pnpm run dev:clean
```

> **Windows 提示**：端口清理工具已完全兼容 Windows 系统

## 📁 项目结构

```
project/
├── src/                    # 源代码目录
│   ├── index.js           # 主入口文件
│   ├── builder.js         # 页面构建器（含子模板组件化）
│   ├── api.js             # API请求模块
│   ├── watcher.js         # 文件监听模块（含哈希检测）
│   ├── dev-server.js      # 开发服务器
│   ├── production-builder.js  # 生产构建（含图片本地化）
│   └── image-downloader.js    # 图片下载模块
├── templates/             # HTML模板目录
│   ├── index.html         # 首页模板
│   ├── about.html         # 关于页面模板
│   ├── product.html       # 产品页面模板
│   ├── header.html        # 子模板示例
│   ├── mobile-demo.html   # 移动端适配演示
│   └── image-test.html    # 图片本地化测试
├── assets/                # 静态资源目录
│   ├── css/               # 样式文件
│   │   ├── style.css
│   │   └── mobile-adapter.css  # 移动端适配样式
│   ├── js/                # JavaScript文件
│   │   ├── main.js
│   │   └── flexible.js    # rem适配脚本
│   └── images/            # 图片文件
├── docs/                  # 📚 完整文档目录
│   ├── README.md          # 文档索引
│   ├── COMPONENT-EXTRACTION.md      # 子模板组件化
│   ├── 图片本地化功能.md             # 图片本地化完整说明
│   ├── 图片本地化-快速指南.md        # 图片本地化快速开始
│   ├── 移动端适配-团队规范.md        # 移动端团队规范
│   ├── 移动端适配-设计规范.md        # 设计师手册
│   ├── 移动端适配-开发指南.md        # 开发教程
│   ├── 移动端适配-示例代码.md        # 代码示例库
│   ├── 移动端适配-快速参考.md        # 速查表
│   └── ... 更多文档
├── dist/                  # 输出目录（自动生成）
│   └── assets/
│       ├── components/    # 子模板组件资源
│       └── images/        # 本地化的图片
├── config.js              # 配置文件
├── mock-server.js         # Mock API服务器
├── package.json           # 项目配置
└── README.md              # 项目文档（本文件）
```

## ⚙️ 配置说明

编辑 `config.js` 文件来配置你的项目：

```javascript
module.exports = {
  // 模板配置列表
  templates: [
    {
      name: 'index.html',        // 模板文件名
      output: 'index.html',      // 输出文件名
      api: '/api/home',          // API端点
      method: 'GET',             // 请求方法
      params: {},                // 请求参数
      transform: (data) => data  // 数据转换函数（可选）
    }
  ],

  // API配置
  api: {
    baseUrl: 'http://localhost:3000',  // API基础URL
    timeout: 10000,                     // 超时时间
    headers: {                          // 请求头
      'Content-Type': 'application/json'
    }
  },

  // 目录配置
  paths: {
    templateDir: './templates',   // 模板目录
    outputDir: './dist',          // 输出目录
    assetsDir: './assets'         // 静态资源目录
  }
};
```

## 📝 模板语法

本工具使用 [art-template](https://aui.github.io/art-template/) 作为模板引擎，支持两种语法：

### 标准语法

```html
<!-- 输出变量 -->
<h1>{{title}}</h1>

<!-- 条件判断 -->
{{if user}}
  <p>欢迎, {{user.name}}</p>
{{/if}}

<!-- 循环 -->
{{each products}}
  <div>{{$value.name}}</div>
{{/each}}
```

### 原始语法

```html
<!-- 输出变量 -->
<h1><%= title %></h1>

<!-- 条件判断 -->
<% if (user) { %>
  <p>欢迎, <%= user.name %></p>
<% } %>

<!-- 循环 -->
<% products.forEach(function(product) { %>
  <div><%= product.name %></div>
<% }) %>
```

## 🔧 使用示例

### 1. 创建模板

在 `templates/` 目录下创建 HTML 模板文件：

```html
<!-- templates/blog.html -->
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
  <h1>{{title}}</h1>
  
  {{each posts}}
  <article>
    <h2>{{$value.title}}</h2>
    <p>{{$value.content}}</p>
    <span>作者: {{$value.author}}</span>
  </article>
  {{/each}}
</body>
</html>
```

### 2. 配置模板

在 `config.js` 中添加配置：

```javascript
templates: [
  {
    name: 'blog.html',
    output: 'blog.html',
    api: '/api/blog-posts',
    method: 'GET',
    transform: (data) => {
      // 可以对API返回的数据进行处理
      return {
        title: data.blogTitle,
        posts: data.items.slice(0, 10) // 只取前10篇
      };
    }
  }
]
```

### 3. 运行构建

```bash
pnpm run build
```

生成的静态文件会保存在 `dist/blog.html`。

## 🌐 对接真实API

修改 `config.js` 中的 `api.baseUrl`：

```javascript
api: {
  baseUrl: 'https://your-api-domain.com',  // 你的真实API地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'  // 如果需要认证
  }
}
```

## 📊 数据转换

使用 `transform` 函数处理API返回的数据：

```javascript
{
  name: 'index.html',
  output: 'index.html',
  api: '/api/data',
  transform: (data) => {
    // 重命名字段
    return {
      pageTitle: data.title,
      items: data.list.map(item => ({
        id: item.id,
        name: item.title,
        desc: item.description
      }))
    };
  }
}
```

## 🎯 高级用法

### 批量生成页面

可以配置多个模板，一次性生成多个页面：

```javascript
templates: [
  { name: 'index.html', output: 'index.html', api: '/api/home' },
  { name: 'about.html', output: 'about.html', api: '/api/about' },
  { name: 'blog.html', output: 'blog.html', api: '/api/blog' },
  { name: 'contact.html', output: 'contact.html', api: '/api/contact' }
]
```

### POST请求

支持POST方法传递参数：

```javascript
{
  name: 'search.html',
  output: 'search-results.html',
  api: '/api/search',
  method: 'POST',
  params: {
    keyword: '关键词',
    limit: 20
  }
}
```

### 动态生成多个文件

如果需要根据数据动态生成多个文件（如产品详情页），可以扩展配置：

```javascript
// 可以编写自定义脚本实现
// 例如：先获取产品列表，然后为每个产品生成详情页
```

## 🔍 故障排查

### 常见问题

**问题1：构建时出现 "API错误 (500)"**

原因：Mock服务器未启动或未就绪

解决：使用 `pnpm run build:full` 或先手动启动Mock服务器

**问题2：模板渲染错误**

- 检查模板语法是否正确
- 检查数据结构是否匹配
- 使用 `transform` 函数调试数据

**问题3：文件未生成**

- 检查输出目录权限
- 查看控制台错误信息
- 确认模板文件存在

📖 **详细故障排除**：查看 [故障排除指南](./docs/TROUBLESHOOTING.md)

## 🆕 新功能使用

### 📱 移动端适配方案

基于**750px设计稿**的rem自适应方案，PC端显示**620px居中容器**。

#### 快速上手

设计稿转代码：**rem = 设计稿px ÷ 100**

```css
/* 设计稿标注690px，代码这样写： */
.container {
  width: 6.9rem;        /* 690 ÷ 100 */
  padding: 0.3rem;      /* 30 ÷ 100 */
  font-size: 14px;      /* 字体用px，不用rem */
  border: 1px solid #ddd; /* 边框用px，不用rem */
}
```

#### 查看演示

```bash
pnpm run dev
# 然后在浏览器打开 http://localhost:3001/mobile-demo.html
```

- **PC端**：620px居中容器（全高度，可滚动）
- **移动端**：全屏自适应

#### 完整文档

- 📖 [快速上手（5分钟）](./docs/移动端适配-快速上手.md)
- 📋 [团队使用规范](./docs/移动端适配-团队规范.md) ⭐ 必读
- 🎨 [设计师手册](./docs/移动端适配-设计规范.md)
- 💻 [开发指南](./docs/移动端适配-开发指南.md)
- 📖 [示例代码库](./docs/移动端适配-示例代码.md)
- 📋 [快速参考速查表](./docs/移动端适配-快速参考.md)
- 🗺️ [文档索引](./docs/移动端适配-文档索引.md)

---

### 🧩 子模板组件化

子模板中的 `<style>` 和 `<script>` 会自动提取到独立文件。

#### 使用示例

**创建子模板** `templates/header.html`：

```html
<style>
  /* header组件样式 - 会被提取 */
  header { background: #667eea; }
</style>

<header>
  <h1>{{title}}</h1>
</header>

<script>
  // header组件脚本 - 会被提取
  console.log('Header loaded');
</script>
```

**在主模板中使用**：

```html
<!-- templates/index.html -->
<body>
  {{include 'header'}}
</body>
```

**构建后自动生成**：
- `dist/assets/components/header/header.css`
- `dist/assets/components/header/header.js`
- 自动在页面中引入

#### 完整文档

- 📖 [子模板组件化功能](./docs/COMPONENT-EXTRACTION.md)

---

### 📷 图片本地化

生产构建时，自动下载HTML中的远程图片到本地。

#### 使用示例

**模板中使用远程图片**：

```html
<img src="https://cdn.example.com/banner.jpg" alt="Banner">

<div style="background-image: url('https://cdn.example.com/bg.png')">
  内容
</div>
```

**运行生产构建**：

```bash
pnpm run build
```

**自动处理**：
- 下载图片到 `dist/assets/images/index/`
- 替换URL为本地路径：`assets/images/index/banner_xxx.jpg`

#### 完整文档

- 📖 [图片本地化快速指南](./docs/图片本地化-快速指南.md)
- 📖 [图片本地化完整说明](./docs/图片本地化功能.md)

#### 查看测试

```bash
pnpm run dev
# 然后在浏览器打开 http://localhost:3001/image-test.html
```

---

## 📚 完整文档

### 📂 文档导航

**所有文档都在 [`docs/`](./docs/) 目录下：**

#### 快速开始
- 📖 [项目快速开始](./docs/QUICK-START.md)
- 📖 [使用说明](./docs/USAGE.md)
- 📖 [文档索引](./docs/README.md) - 查找所有文档

#### 移动端适配（7份文档）
- ⚡ [快速上手（5分钟）](./docs/移动端适配-快速上手.md)
- 📋 [团队使用规范](./docs/移动端适配-团队规范.md) ⭐ 必读
- 🎨 [设计师手册](./docs/移动端适配-设计规范.md)
- 💻 [开发指南](./docs/移动端适配-开发指南.md)
- 📖 [示例代码库](./docs/移动端适配-示例代码.md)
- 📋 [快速参考](./docs/移动端适配-快速参考.md) - 可打印
- 🗺️ [文档索引](./docs/移动端适配-文档索引.md)

#### 功能文档
- 🧩 [子模板组件化](./docs/COMPONENT-EXTRACTION.md)
- 📷 [图片本地化功能](./docs/图片本地化功能.md)
- 📷 [图片本地化快速指南](./docs/图片本地化-快速指南.md)

#### 项目文档
- 📖 [生产构建](./docs/PRODUCTION-BUILD.md)
- 🔧 [问题排查](./docs/TROUBLESHOOTING.md)

---

## 📚 art-template 文档

更多模板语法和高级用法，请参考：

- [art-template 官方文档](https://aui.github.io/art-template/)
- [art-template GitHub](https://github.com/aui/art-template)

## 🚀 部署

构建完成后，将 `dist/` 目录下的所有文件部署到静态服务器即可：

- Nginx
- Apache
- GitHub Pages
- Vercel
- Netlify
- 阿里云 OSS
- 腾讯云 COS

## 📄 License

MIT

## 💡 最佳实践

### 📱 移动端开发

1. **设计师交接**：
   - 确认设计稿基准：750px
   - 标注单位：直接标注px即可
   - 开发转换：**rem = px ÷ 100**

2. **代码规范**：
   - ✅ 布局尺寸用 `rem`（宽、高、内外边距）
   - ✅ 字体大小用 `px`（保持清晰）
   - ✅ 边框用 `px`（避免0.5px问题）

3. **测试检查**：
   - PC端：检查620px容器显示
   - 移动端：检查375px、414px适配
   - 查看演示：`pnpm run dev` → `/mobile-demo.html`

### 🧩 组件化开发

1. **子模板使用**：
   - 公共头部：`header.html`
   - 公共底部：`footer.html`
   - 复用组件：独立style和script

2. **引入方式**：
   ```html
   {{include 'header'}}  <!-- 自动提取CSS/JS -->
   ```

### 📷 图片处理

1. **开发阶段**：
   - 使用CDN或远程图片URL
   - `pnpm run dev` 不下载图片

2. **生产构建**：
   - `pnpm run build` 自动下载图片
   - 自动替换为本地路径
   - 查看测试：`/image-test.html`

### 🚀 开发流程建议

1. **初始化**：
   - 先使用 Mock Server 进行开发和测试
   - 确认模板和数据结构正确后，再对接真实API

2. **开发模式**：
   - 使用 `pnpm run dev` 启动开发服务器
   - 支持热更新，文件保存自动刷新
   - 智能哈希检测，避免无限构建

3. **生产构建**：
   - `pnpm run build` 生成最终文件
   - 自动提取组件资源
   - 自动下载远程图片
   - 优化压缩HTML/CSS/JS

### ⚡ 性能优化

- art-template 已经非常快，无需额外优化
- 如果有大量页面，可以考虑并行构建
- 静态资源建议使用CDN
- 图片本地化后可减少外部请求

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 🎯 快速链接

### 📚 文档中心
- 📖 **[完整文档索引](./docs/README.md)** - 查找所有文档

### ⚡ 快速开始
- 📖 [项目快速开始](./docs/QUICK-START.md)
- 📖 [使用说明](./docs/USAGE.md)

### 🆕 新功能
- 📱 [移动端适配 - 团队规范](./docs/移动端适配-团队规范.md) ⭐ 必读
- 📱 [移动端适配 - 快速上手](./docs/移动端适配-快速上手.md)
- 🧩 [子模板组件化](./docs/COMPONENT-EXTRACTION.md)
- 📷 [图片本地化快速指南](./docs/图片本地化-快速指南.md)

### 🛠️ 开发指南
- 💻 [移动端开发指南](./docs/移动端适配-开发指南.md)
- 📖 [示例代码库](./docs/移动端适配-示例代码.md)
- 🔧 [问题排查](./docs/TROUBLESHOOTING.md)

### 🎨 设计师
- 🎨 [移动端设计规范](./docs/移动端适配-设计规范.md)
- 📋 [快速参考（可打印）](./docs/移动端适配-快速参考.md)

---

## 📊 功能总览

| 功能 | 开发模式 | 生产模式 | 说明 |
|------|---------|---------|------|
| 模板渲染 | ✅ | ✅ | art-template高性能渲染 |
| API数据获取 | ✅ | ✅ | 支持GET/POST请求 |
| 热更新 | ✅ | ❌ | 文件变化自动刷新 |
| 子模板组件化 | ✅ | ✅ | 自动提取style/script |
| 图片本地化 | ❌ | ✅ | 下载远程图片到本地 |
| 代码压缩 | ❌ | ✅ | HTML/CSS/JS压缩 |
| 移动端适配 | ✅ | ✅ | rem自适应+PC容器 |
| 文件哈希检测 | ✅ | ❌ | 避免无限构建 |

---

**享受静态网站开发的乐趣！** 🎉

有问题？查看 [完整文档](./docs/README.md) 或 [故障排除指南](./docs/TROUBLESHOOTING.md)

