# 使用指南

## 基本使用流程

### 第一步：安装依赖

```bash
npm install
```

### 第二步：配置项目

编辑 `config.js` 文件，配置你的模板和API：

```javascript
module.exports = {
  templates: [
    {
      name: 'index.html',      // 模板文件
      output: 'index.html',    // 输出文件
      api: '/api/home',        // API端点
      method: 'GET'            // 请求方法
    }
  ],
  api: {
    baseUrl: 'http://localhost:3000',  // API地址
    timeout: 10000
  },
  paths: {
    templateDir: './templates',
    outputDir: './dist',
    assetsDir: './assets'
  }
};
```

### 第三步：创建模板

在 `templates/` 目录创建 HTML 模板文件：

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
  <h1>{{title}}</h1>
  <p>{{description}}</p>
  
  {{each items}}
  <div>
    <h2>{{$value.name}}</h2>
    <p>{{$value.content}}</p>
  </div>
  {{/each}}
</body>
</html>
```

### 第四步：准备API

确保后端API能够返回正确格式的数据。

测试阶段可以使用提供的 Mock Server：

```bash
node mock-server.js
```

### 第五步：构建

```bash
npm run build
```

生成的文件会保存在 `dist/` 目录。

## art-template 模板语法详解

### 1. 输出变量

```html
<!-- 普通输出 -->
{{title}}

<!-- 输出HTML（不转义） -->
{{@html}}

<!-- 输出并转义 -->
{{content}}
```

### 2. 条件判断

```html
<!-- if 语句 -->
{{if condition}}
  <p>条件为真</p>
{{/if}}

<!-- if-else -->
{{if user}}
  <p>欢迎, {{user.name}}</p>
{{else}}
  <p>请登录</p>
{{/if}}

<!-- if-else if-else -->
{{if score >= 90}}
  <p>优秀</p>
{{else if score >= 60}}
  <p>及格</p>
{{else}}
  <p>不及格</p>
{{/if}}
```

### 3. 循环遍历

```html
<!-- 遍历数组 -->
{{each list}}
  <li>{{$index}}: {{$value}}</li>
{{/each}}

<!-- 遍历对象 -->
{{each user}}
  <p>{{$index}}: {{$value}}</p>
{{/each}}

<!-- 使用自定义变量名 -->
{{each products as product index}}
  <div>{{index}}: {{product.name}}</div>
{{/each}}
```

### 4. 变量赋值

```html
{{set temp = title + ' - ' + subtitle}}
<h1>{{temp}}</h1>
```

### 5. 包含子模板

```html
{{include './header.html'}}
<main>
  内容
</main>
{{include './footer.html'}}

<!-- 传递数据 -->
{{include './header.html' menuData}}
```

### 6. 过滤器

```html
<!-- 内置过滤器 -->
{{date | dateFormat 'yyyy-MM-dd'}}

<!-- 自定义过滤器 -->
{{text | truncate 100}}
```

### 7. 原始JavaScript语法

```html
<% if (user) { %>
  <p>Hello, <%= user.name %></p>
<% } %>

<% products.forEach(function(item) { %>
  <div><%= item.name %></div>
<% }) %>
```

## 配置详解

### templates 配置

```javascript
{
  // 模板文件名（相对于 templateDir）
  name: 'index.html',
  
  // 输出文件名（相对于 outputDir）
  output: 'index.html',
  
  // API端点（相对于 api.baseUrl）
  api: '/api/home',
  
  // 请求方法：GET, POST, PUT, DELETE
  method: 'GET',
  
  // 请求参数
  params: {
    page: 1,
    limit: 10
  },
  
  // 数据转换函数
  transform: (data) => {
    // 处理API返回的数据
    return {
      ...data,
      processedItems: data.items.map(item => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString()
      }))
    };
  }
}
```

### API 配置

```javascript
api: {
  // API基础URL
  baseUrl: 'http://localhost:3000',
  
  // 超时时间（毫秒）
  timeout: 10000,
  
  // 请求头
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  }
}
```

### 路径配置

```javascript
paths: {
  // 模板文件目录
  templateDir: './templates',
  
  // 输出目录
  outputDir: './dist',
  
  // 静态资源目录（会自动复制到输出目录）
  assetsDir: './assets'
}
```

## 实战示例

### 示例1：博客列表页

**模板 (templates/blog.html):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{blogTitle}}</title>
</head>
<body>
  <header>
    <h1>{{blogTitle}}</h1>
    <p>{{blogDescription}}</p>
  </header>
  
  <main>
    {{each posts}}
    <article>
      <h2>{{$value.title}}</h2>
      <div class="meta">
        <span>作者: {{$value.author}}</span>
        <span>日期: {{$value.date}}</span>
        <span>分类: {{$value.category}}</span>
      </div>
      <p>{{$value.excerpt}}</p>
      <a href="{{$value.url}}">阅读更多</a>
    </article>
    {{/each}}
  </main>
  
  <!-- 分页 -->
  {{if pagination}}
  <div class="pagination">
    {{if pagination.hasPrev}}
    <a href="?page={{pagination.prevPage}}">上一页</a>
    {{/if}}
    
    <span>第 {{pagination.currentPage}} / {{pagination.totalPages}} 页</span>
    
    {{if pagination.hasNext}}
    <a href="?page={{pagination.nextPage}}">下一页</a>
    {{/if}}
  </div>
  {{/if}}
</body>
</html>
```

**配置:**

```javascript
{
  name: 'blog.html',
  output: 'blog.html',
  api: '/api/blog/posts',
  method: 'GET',
  params: {
    page: 1,
    limit: 10
  },
  transform: (data) => {
    return {
      blogTitle: data.title,
      blogDescription: data.description,
      posts: data.items.map(post => ({
        ...post,
        date: new Date(post.publishDate).toLocaleDateString('zh-CN')
      })),
      pagination: {
        currentPage: data.page,
        totalPages: Math.ceil(data.total / data.limit),
        hasPrev: data.page > 1,
        hasNext: data.page < Math.ceil(data.total / data.limit),
        prevPage: data.page - 1,
        nextPage: data.page + 1
      }
    };
  }
}
```

### 示例2：产品详情页

**模板 (templates/product-detail.html):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{product.name}} - 产品详情</title>
</head>
<body>
  <div class="product-detail">
    <div class="product-images">
      <img src="{{product.mainImage}}" alt="{{product.name}}">
      
      {{if product.gallery && product.gallery.length > 0}}
      <div class="gallery">
        {{each product.gallery}}
        <img src="{{$value}}" alt="{{product.name}}">
        {{/each}}
      </div>
      {{/if}}
    </div>
    
    <div class="product-info">
      <h1>{{product.name}}</h1>
      <div class="price">¥{{product.price}}</div>
      
      {{if product.discount}}
      <div class="discount">
        <span class="original-price">¥{{product.originalPrice}}</span>
        <span class="discount-tag">{{product.discount}}折</span>
      </div>
      {{/if}}
      
      <div class="description">
        {{@product.description}}
      </div>
      
      <!-- 规格选择 -->
      {{if product.specs && product.specs.length > 0}}
      <div class="specs">
        {{each product.specs}}
        <div class="spec-group">
          <label>{{$value.name}}</label>
          <div class="options">
            {{each $value.options}}
            <button>{{$value}}</button>
            {{/each}}
          </div>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      <button class="buy-btn">立即购买</button>
    </div>
  </div>
  
  <!-- 评价 -->
  {{if reviews && reviews.length > 0}}
  <section class="reviews">
    <h2>用户评价</h2>
    {{each reviews}}
    <div class="review-item">
      <div class="reviewer">{{$value.userName}}</div>
      <div class="rating">
        {{set stars = $value.rating}}
        {{each [1,2,3,4,5]}}
          {{if $value <= stars}}★{{else}}☆{{/if}}
        {{/each}}
      </div>
      <p>{{$value.comment}}</p>
      <span class="date">{{$value.date}}</span>
    </div>
    {{/each}}
  </section>
  {{/if}}
</body>
</html>
```

### 示例3：多语言支持

**模板:**

```html
<html lang="{{lang}}">
<head>
  <title>{{i18n.title}}</title>
</head>
<body>
  <nav>
    <a href="/">{{i18n.nav.home}}</a>
    <a href="/about">{{i18n.nav.about}}</a>
    <a href="/products">{{i18n.nav.products}}</a>
  </nav>
  
  <h1>{{i18n.welcome}}</h1>
  <p>{{i18n.description}}</p>
</body>
</html>
```

**配置:**

```javascript
{
  name: 'index.html',
  output: 'index.html',
  api: '/api/content',
  params: {
    lang: 'zh-CN'
  },
  transform: (data) => {
    // 根据语言加载对应的文本
    const translations = {
      'zh-CN': {
        title: '欢迎访问',
        welcome: '欢迎',
        description: '这是描述',
        nav: {
          home: '首页',
          about: '关于',
          products: '产品'
        }
      },
      'en-US': {
        title: 'Welcome',
        welcome: 'Welcome',
        description: 'Description',
        nav: {
          home: 'Home',
          about: 'About',
          products: 'Products'
        }
      }
    };
    
    return {
      ...data,
      lang: data.lang,
      i18n: translations[data.lang] || translations['zh-CN']
    };
  }
}
```

## 常见问题

### Q: 如何调试模板？

A: 可以在模板中输出变量查看数据：

```html
<!-- 输出整个数据对象 -->
<pre>{{JSON.stringify($data, null, 2)}}</pre>

<!-- 或者使用原始语法 -->
<% console.log('数据:', $data) %>
```

### Q: 如何处理异步数据？

A: 在 `transform` 函数中可以使用 async/await（需要修改builder.js支持）：

```javascript
transform: async (data) => {
  // 获取额外数据
  const extraData = await fetchExtraData(data.id);
  return {
    ...data,
    extra: extraData
  };
}
```

### Q: 如何优化大量页面的构建速度？

A: 可以使用并行构建（需要修改代码）：

```javascript
// 并行构建多个页面
const results = await Promise.all(
  config.templates.map(template => buildPage(template, config))
);
```

### Q: 生成的HTML如何压缩？

A: 可以在构建后使用 html-minifier：

```bash
npm install html-minifier --save-dev
```

然后在构建脚本中添加压缩步骤。

## 进阶技巧

### 1. 自定义过滤器

可以扩展art-template添加自定义过滤器：

```javascript
const template = require('art-template');

// 添加日期格式化过滤器
template.defaults.imports.dateFormat = function(date, format) {
  // 实现日期格式化逻辑
  return formattedDate;
};

// 在模板中使用
// {{date | dateFormat 'yyyy-MM-dd'}}
```

### 2. 全局数据

可以为所有模板添加全局数据：

```javascript
// 在builder.js中
const globalData = {
  siteName: '我的网站',
  year: new Date().getFullYear(),
  version: '1.0.0'
};

// 渲染时合并
const render = template.compile(templateContent);
renderedHtml = render({
  ...globalData,  // 全局数据
  ...data         // 页面数据
});
```

### 3. 增量构建

可以实现只构建变化的文件，提高效率。

### 4. 集成其他工具

可以集成 PostCSS、Babel、图片压缩等工具，构建完整的静态站点生成器。

---

有问题？查看 [README.md](../README.md) 或提交 Issue。

