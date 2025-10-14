# 故障排除指南

## 问题：构建时出现 "API错误 (500): Internal Server Error"

### 症状

运行 `npm run build` 时出现错误：

```
❌ API请求详细错误信息:
URL: http://localhost:3000/api/home
Method: GET
错误类型: AxiosError
响应状态: 500
响应数据: Connection error
```

### 原因

Mock API服务器未启动或未完全启动就开始构建。

### 解决方案

#### 方案1：使用自动构建脚本（推荐）

```bash
npm run build:full
# 或
./build.sh
```

这个脚本会：
1. 检查Mock服务器是否运行
2. 如果未运行，自动启动
3. 等待服务器就绪
4. 执行构建

#### 方案2：手动启动Mock服务器

**终端窗口1** - 启动Mock服务器：
```bash
npm start
# 或
node mock-server.js
```

等待看到以下输出：
```
🚀 Mock API 服务器已启动
📡 监听地址: http://localhost:3000
```

**终端窗口2** - 运行构建：
```bash
npm run build
```

#### 方案3：一键启动并构建

```bash
# 启动Mock服务器（后台）并等待2秒后构建
node mock-server.js > /dev/null 2>&1 & sleep 2 && npm run build
```

### 验证Mock服务器是否运行

```bash
# 检查3000端口
lsof -i :3000

# 或测试API
curl http://localhost:3000/api/home
```

### 停止Mock服务器

```bash
# 停止所有Mock服务器进程
pkill -f "node mock-server"

# 或找到PID并停止
lsof -i :3000 | grep LISTEN
kill <PID>
```

---

## 问题：模板渲染失败

### 症状

```
模板渲染失败: ...
```

### 可能原因

1. 模板语法错误
2. 数据结构与模板不匹配
3. 使用了未定义的变量

### 解决方案

#### 1. 检查模板语法

确保art-template语法正确：

```html
<!-- 正确 -->
{{if items}}
  {{each items}}
    <div>{{$value.name}}</div>
  {{/each}}
{{/if}}

<!-- 错误 -->
{{if items}}
  {{each items}}
    <div>{{item.name}}</div>  <!-- 应该用$value -->
  {{/each}}
{{/if}}
```

#### 2. 调试数据结构

在模板中输出完整数据对象：

```html
<pre>{{JSON.stringify($data, null, 2)}}</pre>
```

或使用原始语法：

```html
<% console.log('数据:', $data) %>
```

#### 3. 使用数据转换函数

在 `config.js` 中添加 `transform` 函数处理数据：

```javascript
{
  name: 'index.html',
  output: 'index.html',
  api: '/api/home',
  transform: (data) => {
    console.log('API返回的数据:', data);
    // 确保数据结构正确
    return {
      ...data,
      items: data.items || []
    };
  }
}
```

---

## 问题：静态资源未复制

### 症状

生成的HTML中引用的CSS/JS文件不存在。

### 解决方案

1. 确保 `assets/` 目录存在
2. 检查 `config.js` 中的路径配置：

```javascript
paths: {
  assetsDir: './assets'  // 确保路径正确
}
```

3. 手动复制资源：

```bash
cp -r assets dist/
```

---

## 问题：对接真实API失败

### 症状

```
网络错误: 无法连接到服务器
```

### 解决方案

#### 1. 检查API配置

确保 `config.js` 中的URL正确：

```javascript
api: {
  baseUrl: 'https://your-api.com',  // 检查URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}
```

#### 2. 测试API连接

```bash
curl https://your-api.com/api/home
```

#### 3. 检查跨域和认证

如果API需要认证，添加token：

```javascript
api: {
  baseUrl: 'https://your-api.com',
  headers: {
    'Authorization': 'Bearer your-token'
  }
}
```

#### 4. 增加超时时间

```javascript
api: {
  timeout: 30000  // 30秒
}
```

---

## 问题：生成的HTML为空或内容不完整

### 可能原因

1. API返回的数据为空
2. 模板中的条件判断导致内容被跳过
3. 数据转换函数返回了错误的结构

### 解决方案

#### 1. 检查API返回

```bash
curl http://localhost:3000/api/home | jq .
```

#### 2. 添加调试日志

在 `src/builder.js` 中：

```javascript
console.log('API返回数据:', JSON.stringify(data, null, 2));
```

#### 3. 检查条件判断

确保模板中的条件正确：

```html
<!-- 如果items可能为null，添加检查 -->
{{if items && items.length > 0}}
  ...
{{/if}}
```

---

## 问题：文件权限错误

### 症状

```
EACCES: permission denied
```

### 解决方案

```bash
# 给予执行权限
chmod +x build.sh

# 清理输出目录
rm -rf dist
npm run build
```

---

## 问题：端口被占用

### 症状

```
Error: listen EADDRINUSE: address already in use :::3000
```

### 解决方案

#### 1. 停止占用端口的进程

```bash
# 查找占用3000端口的进程
lsof -i :3000

# 停止进程
kill <PID>
```

#### 2. 修改Mock服务器端口

编辑 `mock-server.js`：

```javascript
const PORT = 3001;  // 改成其他端口
```

同时修改 `config.js`：

```javascript
api: {
  baseUrl: 'http://localhost:3001'
}
```

---

## 常见命令

```bash
# 清理输出目录
npm run clean

# 启动Mock服务器
npm start

# 构建（确保Mock服务器已启动）
npm run build

# 完整构建（自动启动Mock服务器）
npm run build:full

# 开发模式（文件监听）
npm run dev

# 查看Mock服务器状态
lsof -i :3000

# 停止Mock服务器
pkill -f "node mock-server"

# 测试API
curl http://localhost:3000/api/home
```

---

## 获取帮助

如果以上方法都无法解决问题：

1. 检查 `mock.log` 文件查看Mock服务器日志
2. 查看完整的错误堆栈信息
3. 确认Node.js版本（建议v14+）
4. 重新安装依赖：`rm -rf node_modules && npm install`

---

**记住最重要的一点：构建前确保Mock服务器正在运行！**

