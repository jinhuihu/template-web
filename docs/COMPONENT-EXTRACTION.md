# 子模板组件资源提取功能

## 功能简介

在使用子模板开发时，子模板中可以包含独立的 `<style>` 和 `<script>` 标签。构建时，系统会自动提取这些内容，保存到独立的文件中，并在使用该子模板的页面中自动引入。

## 功能特性

1. **自动提取**：自动识别并提取子模板中的 `<style>` 和 `<script>` 标签内容
2. **独立文件**：将提取的内容保存到 `/dist/assets/components/[子模板名]/` 目录下
3. **自动引入**：在使用子模板的页面中自动注入 CSS 和 JS 引用
4. **保留原文件**：构建完成后，原始子模板文件保持不变

## 使用示例

### 1. 创建带有样式和脚本的子模板

在 `templates/header.html` 中：

```html
<style>
  /* Header 组件专属样式 */
  header {
    position: relative;
    overflow: hidden;
  }
  
  header h1 {
    animation: fadeInDown 0.8s ease-out;
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

<header>
  <h1>{{title}}</h1>
  <p class="subtitle">{{subtitle}}</p>
</header>

<script>
  // Header 组件专属脚本
  (function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
      const header = document.querySelector('header');
      if (header) {
        console.log('Header component initialized');
      }
    });
  })();
</script>
```

### 2. 在主模板中使用子模板

在 `templates/index.html` 中：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>首页</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  {{include 'header'}}
  
  <main>
    <!-- 页面内容 -->
  </main>
  
  <script src="assets/js/main.js"></script>
</body>
</html>
```

### 3. 构建后的结果

运行 `npm run build` 后：

#### 生成的文件结构：
```
dist/
  ├── index.html
  └── assets/
      ├── css/
      │   └── style.css
      ├── js/
      │   └── main.js
      └── components/
          └── header/
              ├── header.css  (提取的样式)
              └── header.js   (提取的脚本)
```

#### 生成的 `index.html`：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>首页</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <!-- 自动注入的子模板CSS -->
  <link rel="stylesheet" href="assets/components/header/header.css">
</head>
<body>
  <header>
    <h1>欢迎使用</h1>
    <p class="subtitle">子标题</p>
  </header>
  
  <main>
    <!-- 页面内容 -->
  </main>
  
  <script src="assets/js/main.js"></script>
  <!-- 自动注入的子模板JS -->
  <script src="assets/components/header/header.js"></script>
</body>
</html>
```

## 工作原理

1. **解析阶段**：构建器解析主模板，找出所有 `{{include 'xxx'}}` 语句
2. **提取阶段**：读取每个子模板文件，提取其中的 `<style>` 和 `<script>` 标签内容
3. **保存阶段**：将提取的内容保存到 `/dist/assets/components/[子模板名]/` 目录
4. **渲染阶段**：临时移除子模板中的 style 和 script 标签，渲染主模板
5. **注入阶段**：在渲染后的 HTML 中自动注入组件资源引用
   - CSS 文件引入到 `</head>` 之前
   - JS 文件引入到 `</body>` 之前
6. **恢复阶段**：构建完成后，恢复原始子模板文件

## 注意事项

1. **只提取内联样式和脚本**：只会提取 `<style>` 和 `<script>` 标签中的内容，不会提取带 `src` 属性的 script 标签

2. **文件命名规则**：
   - 子模板名为 `header.html`
   - 生成的文件为 `header.css` 和 `header.js`
   - 保存路径为 `/dist/assets/components/header/`

3. **多个 style/script 标签**：如果子模板包含多个 `<style>` 或 `<script>` 标签，它们的内容会被合并到一个文件中

4. **开发模式**：在开发模式（`npm run dev`）下，每次文件变化都会重新提取和生成组件资源

5. **生产构建**：在生产构建（`npm run build`）时，提取的组件文件也会经过压缩优化

## 最佳实践

1. **组件化思维**：将可复用的页面部分（如 header、footer、导航等）创建为子模板
2. **样式隔离**：在子模板的样式中使用特定的选择器，避免样式冲突
3. **脚本封装**：使用 IIFE（立即执行函数表达式）封装子模板的脚本，避免全局污染
4. **命名规范**：子模板文件使用有意义的名称，如 `header.html`、`footer.html`、`nav.html` 等

## 示例

完整示例请参考项目中的 `templates/header.html` 和 `templates/index.html` 文件。

