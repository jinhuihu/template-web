# 开发模式使用指南

## 功能概述

项目现在支持完整的开发模式，包括：
- 🔥 **热更新**：修改templates下的文件会自动重新构建
- 🌐 **静态服务**：提供本地开发服务器
- 📡 **Mock API**：集成Mock服务器提供测试数据
- 👀 **文件监听**：实时监听文件变化

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发模式
```bash
pnpm run dev
```

这个命令会同时启动：
- Mock API服务器 (端口: 3001)
- 开发服务器 (端口: 3000)

### 3. 访问应用
打开浏览器访问：http://localhost:3000

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm run dev` | 启动完整开发环境（Mock + 开发服务器） |
| `pnpm run dev:server` | 仅启动开发服务器 |
| `pnpm run dev:mock` | 仅启动Mock服务器 |
| `pnpm run dev:watch` | 启动文件监听模式（旧版本） |
| `pnpm run build` | 构建生产版本 |
| `pnpm run clean` | 清理dist目录 |

## 开发流程

### 1. 修改模板文件
在 `templates/` 目录下修改HTML模板文件：
- `index.html` - 首页
- `about.html` - 关于页面  
- `product.html` - 产品页面

### 2. 实时预览
修改文件后，系统会：
1. 自动检测文件变化
2. 重新构建页面
3. 更新dist目录
4. 浏览器可以刷新查看最新内容

### 3. 修改静态资源
在 `assets/` 目录下修改CSS/JS文件也会触发热更新。

## 配置说明

### 开发服务器配置
在 `config.js` 中的 `dev` 部分：
```javascript
dev: {
  watch: true,           // 启用文件监听
  port: 3000,           // 开发服务器端口
  mockPort: 3001,       // Mock服务器端口
  hotReloadDelay: 500   // 热更新延迟时间
}
```

### API配置
Mock服务器提供以下API端点：
- `GET /api/home` - 首页数据
- `GET /api/about` - 关于页面数据
- `GET /api/products` - 产品数据

## 故障排除

### 1. 端口冲突
如果3000或3001端口被占用，可以：
- 修改 `config.js` 中的端口配置
- 或者停止占用端口的进程

### 2. 热更新不工作
检查：
- 文件监听器是否正常启动
- 文件是否在监听的目录中
- 是否有权限问题

### 3. API请求失败
确保：
- Mock服务器正在运行
- 端口3001可访问
- 网络连接正常

## 技术栈

- **Express 4.x** - 开发服务器
- **chokidar** - 文件监听
- **art-template** - 模板引擎
- **axios** - HTTP请求
- **chalk** - 控制台输出美化

## 开发建议

1. **保持Mock服务器运行**：确保API数据可用
2. **使用浏览器开发者工具**：监控网络请求和页面加载
3. **定期清理dist目录**：使用 `pnpm run clean` 清理旧文件
4. **检查控制台输出**：关注构建状态和错误信息

---

🎉 现在你可以愉快地进行开发了！修改templates下的文件，保存后即可在浏览器中看到实时更新。
