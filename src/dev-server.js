/**
 * 开发服务器
 * 
 * 功能：
 * 1. 提供静态文件服务
 * 2. 集成热更新功能
 * 3. 支持文件变化时自动重新构建
 * 4. 提供浏览器自动刷新
 */

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { buildPages, copyAssets } = require('./builder');
const { watchFiles } = require('./watcher');

// 加载配置文件
const config = require('../config');

class DevServer {
  constructor() {
    this.app = express();
    this.port = 3000;
    this.isBuilding = false;
    this.clients = []; // 存储SSE连接的客户端
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * 设置中间件
   */
  setupMiddleware() {
    // 静态文件服务
    this.app.use(express.static(config.paths.outputDir));
    
    // 日志中间件
    this.app.use((req, res, next) => {
      console.log(chalk.cyan(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`));
      next();
    });
  }

  /**
   * 设置路由
   */
  setupRoutes() {
    // 健康检查端点
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        building: this.isBuilding 
      });
    });

    // 热更新脚本端点
    this.app.get('/hot-reload.js', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.send(`
        (function() {
          const eventSource = new EventSource('/hot-reload-events');
          
          eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            switch(data.type) {
              case 'build-start':
                console.log('🔨 开始重新构建...');
                break;
              case 'build-complete':
                console.log('✅ 构建完成');
                break;
              case 'reload':
                console.log('🔄 检测到文件变化，正在刷新页面...');
                setTimeout(() => {
                  window.location.reload();
                }, 100);
                break;
              case 'build-error':
                console.error('❌ 构建失败:', data.error);
                break;
            }
          };
          
          eventSource.onerror = function(event) {
            console.log('🔌 热更新连接断开，尝试重连...');
          };
          
          console.log('🔌 热更新连接已建立');
        })();
      `);
    });

    // Server-Sent Events端点
    this.app.get('/hot-reload-events', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // 发送连接确认
      res.write('data: {"type":"connected"}\n\n');

      // 将客户端添加到列表
      this.clients.push(res);

      // 处理客户端断开连接
      req.on('close', () => {
        const index = this.clients.indexOf(res);
        if (index > -1) {
          this.clients.splice(index, 1);
        }
        console.log(chalk.gray(`🔌 客户端已断开 (${this.clients.length} 个连接)`));
      });

      console.log(chalk.cyan(`🔌 客户端已连接 (${this.clients.length} 个连接)`));
    });

    // 重新构建端点
    this.app.post('/rebuild', async (req, res) => {
      try {
        await this.rebuild();
        res.json({ success: true, message: '重新构建完成' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 处理SPA路由 - 所有未匹配的路由都返回index.html
    this.app.get('*', (req, res) => {
      const indexPath = path.resolve(config.paths.outputDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send(`
          <html>
            <head><title>页面未找到</title></head>
            <body>
              <h1>404 - 页面未找到</h1>
              <p>请确保已经构建了项目，运行 <code>npm run build</code></p>
            </body>
          </html>
        `);
      }
    });
  }

  /**
   * 重新构建项目
   */
  async rebuild() {
    if (this.isBuilding) {
      console.log(chalk.yellow('⚠️  构建正在进行中，跳过此次请求'));
      return;
    }

    this.isBuilding = true;
    console.log(chalk.blue('🔄 开始重新构建...'));

    try {
      // 清理并创建输出目录
      await fs.emptyDir(config.paths.outputDir);
      
      // 构建所有页面
      const results = await buildPages(config);
      
      // 复制静态资源
      if (await fs.pathExists(config.paths.assetsDir)) {
        await copyAssets(config);
      }
      
      // 输出构建结果
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount > 0) {
        console.log(chalk.red(`⚠️  构建完成，但有 ${failCount} 个页面失败`));
        results.forEach(result => {
          if (!result.success) {
            console.log(chalk.red(`  ✗ ${result.template}: ${result.error}`));
          }
        });
      } else {
        console.log(chalk.green(`✓ 构建完成，成功构建 ${successCount} 个页面`));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 重新构建失败:'), error.message);
      throw error;
    } finally {
      this.isBuilding = false;
    }
  }

  /**
   * 启动开发服务器
   */
  async start() {
    try {
      // 初始构建
      console.log(chalk.blue.bold('\n🚀 启动开发服务器...\n'));
      await this.rebuild();

      // 启动HTTP服务器
      this.server = this.app.listen(this.port, () => {
        console.log(chalk.green.bold('\n=============================================='));
        console.log(chalk.green.bold(`🌐 开发服务器已启动`));
        console.log(chalk.green.bold(`📡 访问地址: http://localhost:${this.port}`));
        console.log(chalk.green.bold(`📁 静态文件目录: ${config.paths.outputDir}`));
        console.log(chalk.green.bold(`🔄 热更新: 已启用 (SSE)`));
        console.log(chalk.green.bold('==============================================\n'));
      });

      // 处理端口占用错误
      this.server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(chalk.red(`❌ 端口 ${this.port} 已被占用`));
          console.error(chalk.yellow('💡 解决方案:'));
          console.error(chalk.yellow(`   1. 终止占用端口的进程: lsof -ti:${this.port} | xargs kill -9`));
          console.error(chalk.yellow(`   2. 或者修改配置文件中的端口号`));
          process.exit(1);
        } else {
          console.error(chalk.red('❌ 服务器启动失败:'), error.message);
          process.exit(1);
        }
      });

      // 设置文件监听
      console.log(chalk.yellow('👀 开始监听文件变化...\n'));
      this.watcher = watchFiles(config, async () => {
        console.log(chalk.blue('📝 检测到文件变化，开始重新构建...'));
        
        // 通知客户端开始构建
        this.broadcastSSE({ type: 'build-start' });
        
        try {
          await this.rebuild();
          console.log(chalk.green('✅ 热更新完成！\n'));
          
          // 通知客户端构建完成并刷新页面
          this.broadcastSSE({ type: 'build-complete' });
          setTimeout(() => {
            this.broadcastSSE({ type: 'reload' });
          }, 100); // 稍微延迟确保文件写入完成
          
        } catch (error) {
          console.error(chalk.red('❌ 热更新失败:'), error.message);
          this.broadcastSSE({ type: 'build-error', error: error.message });
        }
      });

      // 优雅退出处理
      this.setupGracefulShutdown();

    } catch (error) {
      console.error(chalk.red('\n❌ 开发服务器启动失败:'), error.message);
      process.exit(1);
    }
  }

  /**
   * 广播SSE消息给所有连接的客户端
   */
  broadcastSSE(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(client => {
      try {
        client.write(message);
      } catch (error) {
        // 客户端可能已断开连接，从列表中移除
        const index = this.clients.indexOf(client);
        if (index > -1) {
          this.clients.splice(index, 1);
        }
      }
    });
  }

  /**
   * 设置优雅退出
   */
  setupGracefulShutdown() {
    const shutdown = () => {
      console.log(chalk.yellow('\n\n👋 正在关闭开发服务器...'));
      
      if (this.watcher) {
        this.watcher.close();
      }
      
      // 关闭所有SSE连接
      this.clients.forEach(client => {
        try {
          client.end();
        } catch (error) {
          // 忽略错误
        }
      });
      
      if (this.server) {
        this.server.close(() => {
          console.log(chalk.green('✅ 开发服务器已关闭'));
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  /**
   * 停止服务器
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
    }
    if (this.clients.length > 0) {
      this.clients.forEach(client => {
        try {
          client.end();
        } catch (error) {
          // 忽略错误
        }
      });
    }
    if (this.server) {
      this.server.close();
    }
  }
}

// 如果直接运行此文件，启动开发服务器
if (require.main === module) {
  const devServer = new DevServer();
  devServer.start();
}

module.exports = DevServer;
