# 静态页面打包渲染工具

一个基于 Node.js 和 art-template 的静态页面生成工具，可以从后端API获取数据，填充到HTML模板中，生成可直接部署的静态HTML文件。

## ✨ 特性

- 🚀 **快速构建** - 基于高性能的 art-template 模板引擎
- 📡 **API集成** - 自动从后端接口获取数据
- 🎨 **灵活定制** - 支持多种模板语法
- ⚡️ **高性能** - 极速渲染，批量生成
- 🔄 **热更新** - 开发模式支持文件监听
- 📦 **开箱即用** - 完整的项目结构和示例

## 📦 安装

```bash
# 克隆或下载项目后，安装依赖
npm install
```

## 🚀 快速开始

### 方法1：一键构建（推荐）

```bash
npm run build:full
```

这个命令会自动检查并启动Mock服务器，然后构建页面。

### 方法2：手动启动

**终端1** - 启动Mock API服务器：

```bash
npm start
```

服务器会在 http://localhost:3000 启动，提供测试数据。

**终端2** - 构建静态页面：

```bash
npm run build
```

生成的静态文件会输出到 `dist/` 目录。

### 开发模式（监听文件变化）

```bash
# 确保Mock服务器正在运行
npm run dev
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
# 清理占用端口的进程
npm run kill-ports

# 或者一键清理并启动开发服务器
npm run dev:clean
```

## 📁 项目结构

```
project/
├── src/                    # 源代码目录
│   ├── index.js           # 主入口文件
│   ├── builder.js         # 页面构建器
│   ├── api.js             # API请求模块
│   └── watcher.js         # 文件监听模块
├── templates/             # HTML模板目录
│   ├── index.html         # 首页模板
│   ├── about.html         # 关于页面模板
│   └── product.html       # 产品页面模板
├── assets/                # 静态资源目录
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   └── images/            # 图片文件
├── dist/                  # 输出目录（自动生成）
├── config.js              # 配置文件
├── mock-server.js         # Mock API服务器
├── package.json           # 项目配置
└── README.md              # 项目文档
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
npm run build
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

解决：使用 `npm run build:full` 或先手动启动Mock服务器

**问题2：模板渲染错误**

- 检查模板语法是否正确
- 检查数据结构是否匹配
- 使用 `transform` 函数调试数据

**问题3：文件未生成**

- 检查输出目录权限
- 查看控制台错误信息
- 确认模板文件存在

📖 **详细故障排除**：查看 [故障排除指南](./docs/TROUBLESHOOTING.md)

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

## 💡 提示

1. **开发流程建议**：
   - 先使用 Mock Server 进行开发和测试
   - 确认模板和数据结构正确后，再对接真实API
   - 使用 `--watch` 模式提高开发效率

2. **性能优化**：
   - art-template 已经非常快，无需额外优化
   - 如果有大量页面，可以考虑并行构建
   - 静态资源建议使用CDN

3. **扩展性**：
   - 可以添加图片压缩、CSS/JS压缩等功能
   - 可以集成 PostCSS、Babel 等工具
   - 可以添加sitemap生成等SEO功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受静态网站开发的乐趣！** 🎉

