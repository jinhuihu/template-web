# 快速开始教程

## 3分钟快速体验

### 步骤1：安装依赖（30秒）

```bash
npm install
```

### 步骤2：启动测试API（10秒）

打开一个终端窗口，运行：

```bash
node mock-server.js
```

你会看到：

```
🚀 Mock API 服务器已启动
📡 监听地址: http://localhost:3000

可用的API端点:
  - http://localhost:3000/api/home
  - http://localhost:3000/api/about
  - http://localhost:3000/api/products
```

### 步骤3：构建页面（10秒）

打开另一个终端窗口，运行：

```bash
npm run build
```

你会看到：

```
🚀 开始构建静态页面...

✓ 输出目录已清理: ./dist

📊 构建结果:
  ✓ index.html -> index.html
  ✓ about.html -> about.html
  ✓ product.html -> product.html

✓ 静态资源已复制

📈 构建统计:
  成功: 3 个页面

✨ 构建完成！输出目录: ./dist
```

### 步骤4：查看结果

打开 `dist/` 目录，你会看到生成的静态HTML文件：

- `index.html` - 首页
- `about.html` - 关于页面
- `product.html` - 产品展示页
- `assets/` - 静态资源

用浏览器打开这些HTML文件即可查看效果！

## 理解工作流程

### 1. API返回数据

当你访问 `http://localhost:3000/api/home` 时，会得到：

```json
{
  "title": "欢迎使用静态页面生成器",
  "description": "高效、简单、强大的静态网站构建工具",
  "features": [
    {
      "title": "🚀 快速构建",
      "description": "使用art-template模板引擎..."
    },
    ...
  ]
}
```

### 2. 模板使用数据

`templates/index.html` 中：

```html
<h1>{{title}}</h1>
<p>{{description}}</p>

{{each features}}
<div>
  <h3>{{$value.title}}</h3>
  <p>{{$value.description}}</p>
</div>
{{/each}}
```

### 3. 生成静态HTML

构建工具会：
1. 调用API获取数据
2. 将数据填充到模板
3. 生成完整的HTML文件

最终生成的 `dist/index.html` 是纯静态的HTML，可以直接部署。

## 自定义你的第一个页面

### 1. 创建模板

创建 `templates/custom.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>{{pageTitle}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #333; }
    .item {
      background: #f5f5f5;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>{{pageTitle}}</h1>
  
  {{if items && items.length > 0}}
  <div>
    {{each items}}
    <div class="item">
      <h3>{{$value.name}}</h3>
      <p>{{$value.description}}</p>
    </div>
    {{/each}}
  </div>
  {{else}}
  <p>暂无数据</p>
  {{/if}}
</body>
</html>
```

### 2. 添加Mock数据

编辑 `mock-server.js`，在 `mockData` 对象中添加：

```javascript
'/api/custom': {
  pageTitle: '我的自定义页面',
  items: [
    {
      name: '项目一',
      description: '这是第一个项目的描述'
    },
    {
      name: '项目二',
      description: '这是第二个项目的描述'
    }
  ]
}
```

### 3. 配置构建

编辑 `config.js`，在 `templates` 数组中添加：

```javascript
{
  name: 'custom.html',
  output: 'custom.html',
  api: '/api/custom',
  method: 'GET'
}
```

### 4. 重新构建

```bash
# 重启Mock服务器（如果你修改了它）
node mock-server.js

# 重新构建
npm run build
```

### 5. 查看结果

打开 `dist/custom.html` 查看你的自定义页面！

## 开发模式

使用监听模式，文件变化时自动重新构建：

```bash
npm run dev
```

现在你可以：
1. 修改模板文件
2. 保存
3. 自动重新构建
4. 刷新浏览器查看效果

## 对接真实API

当你准备好对接真实的后端API时：

### 1. 修改配置

编辑 `config.js`：

```javascript
api: {
  baseUrl: 'https://your-api.com',  // 改成你的真实API地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'  // 如果需要认证
  }
}
```

### 2. 更新API端点

```javascript
templates: [
  {
    name: 'index.html',
    output: 'index.html',
    api: '/api/v1/home',  // 真实的API路径
    method: 'GET'
  }
]
```

### 3. 构建

```bash
npm run build
```

就这么简单！

## 部署到生产环境

### 使用Nginx

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 使用GitHub Pages

```bash
# 将dist目录推送到gh-pages分支
cd dist
git init
git add .
git commit -m "Deploy"
git push -f git@github.com:username/repo.git master:gh-pages
```

### 使用Vercel

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
cd dist
vercel
```

## 常见场景示例

### 场景1：新闻网站

1. 创建新闻列表模板
2. 创建新闻详情模板
3. API返回新闻数据
4. 批量生成所有新闻页面

### 场景2：产品展示站

1. 创建产品列表模板
2. 创建产品详情模板
3. API返回产品数据
4. 生成产品目录和详情页

### 场景3：活动落地页

1. 创建活动页模板
2. API返回活动信息
3. 生成活动页面
4. 定时更新内容

### 场景4：文档站点

1. 创建文档模板
2. API返回文档内容
3. 生成文档页面
4. 自动生成导航

## 下一步

现在你已经掌握了基础用法，可以：

1. 📖 阅读 [完整使用指南](./USAGE.md)
2. 🎨 学习更多 art-template 模板语法
3. 🔧 探索高级配置选项
4. 🚀 构建你的项目

## 需要帮助？

- 查看 [README.md](../README.md)
- 查看 [USAGE.md](./USAGE.md)
- 查看 [art-template 文档](https://aui.github.io/art-template/)

祝你使用愉快！🎉

