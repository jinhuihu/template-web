/**
 * Mock API 服务器
 * 
 * 用于测试静态页面构建工具
 * 提供示例API端点返回测试数据
 * 
 * 运行方式: node mock-server.js
 */

const http = require('http');
const url = require('url');

// Mock数据
const mockData = {
  '/api/home': {
    title: '欢迎使用静态页面生成器',
    description: '高效、简单、强大的静态网站构建工具',
    features: [
      {
        title: '🚀 快速构建',
        description: '使用art-template模板引擎，快速渲染页面，支持批量生成多个页面'
      },
      {
        title: '📡 API集成',
        description: '轻松对接后端API，自动获取数据并填充到模板中，实现数据驱动'
      },
      {
        title: '🎨 灵活定制',
        description: '支持多种模板语法，可以根据需求自由定制页面样式和结构'
      },
      {
        title: '⚡️ 高性能',
        description: 'art-template拥有接近JavaScript极限的性能表现，渲染速度极快'
      },
      {
        title: '🔄 热更新',
        description: '开发模式下支持文件监听，自动重新构建，提升开发效率'
      },
      {
        title: '📦 开箱即用',
        description: '提供完整的项目结构和示例，安装依赖即可开始使用'
      }
    ],
    stats: [
      {
        value: '10x',
        label: '构建速度提升'
      },
      {
        value: '100%',
        label: '静态资源'
      },
      {
        value: '∞',
        label: '可扩展性'
      }
    ],
    year: 2025,
    company: '静态页面生成器'
  },

  '/api/about': {
    title: '关于我们',
    introduction: '我们是一个专注于前端开发工具的团队，致力于提供高效、易用的开发工具和解决方案。我们相信好的工具可以让开发者专注于创造，而不是被繁琐的配置所困扰。',
    mission: '让静态网站开发更简单、更高效',
    vision: '成为最受欢迎的静态网站生成工具',
    team: [
      {
        name: '张三',
        role: '产品负责人',
        bio: '10年前端开发经验，专注于开发者工具和体验优化',
        avatar: 'https://i.pravatar.cc/120?img=1'
      },
      {
        name: '李四',
        role: '技术架构师',
        bio: '全栈工程师，热衷于性能优化和技术创新',
        avatar: 'https://i.pravatar.cc/120?img=2'
      },
      {
        name: '王五',
        role: '前端工程师',
        bio: '资深前端开发者，擅长UI/UX设计和交互开发',
        avatar: 'https://i.pravatar.cc/120?img=3'
      },
      {
        name: '赵六',
        role: '后端工程师',
        bio: 'Node.js专家，专注于高性能服务端开发',
        avatar: 'https://i.pravatar.cc/120?img=4'
      }
    ],
    timeline: [
      {
        year: '2024',
        event: '项目启动',
        description: '团队成立，开始项目的初步规划和技术选型'
      },
      {
        year: '2024.6',
        event: 'Beta版本发布',
        description: '完成核心功能开发，发布Beta测试版本'
      },
      {
        year: '2024.12',
        event: 'v1.0正式发布',
        description: '正式版本发布，功能完善，性能优化'
      },
      {
        year: '2025',
        event: '持续迭代',
        description: '根据用户反馈持续优化，添加新功能'
      }
    ]
  },

  '/api/products': {
    title: '产品展示',
    subtitle: '发现我们的精选产品系列',
    categories: ['科技', '生活', '办公', '娱乐'],
    products: [
      {
        name: '智能手表Pro',
        category: '科技',
        description: '全天候健康监测，50+运动模式，超长续航',
        price: 1999,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
      },
      {
        name: '无线耳机Max',
        category: '科技',
        description: '主动降噪，HiFi音质，30小时续航',
        price: 899,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
      },
      {
        name: '智能咖啡机',
        category: '生活',
        description: '一键萃取，多种口味，APP远程控制',
        price: 2599,
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400'
      },
      {
        name: '人体工学椅',
        category: '办公',
        description: '舒适护脊，多维度调节，透气网布',
        price: 3299,
        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400'
      },
      {
        name: '4K显示器',
        category: '办公',
        description: 'HDR10，Type-C一线通，99% sRGB',
        price: 2999,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'
      },
      {
        name: '机械键盘',
        category: '办公',
        description: '青轴手感，RGB背光，全键无冲',
        price: 699,
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400'
      },
      {
        name: '游戏手柄',
        category: '娱乐',
        description: '低延迟，震动反馈，跨平台兼容',
        price: 399,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'
      },
      {
        name: '智能音箱',
        category: '生活',
        description: '语音助手，全屋智能中枢，360度音效',
        price: 599,
        image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400'
      }
    ]
  }
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`[${new Date().toLocaleString()}] ${req.method} ${pathname}`);

  // 查找对应的mock数据
  if (mockData[pathname]) {
    res.writeHead(200);
    res.end(JSON.stringify(mockData[pathname], null, 2));
  } else {
    // 404
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `API端点 ${pathname} 不存在`,
      availableEndpoints: Object.keys(mockData)
    }, null, 2));
  }
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log('\n==============================================');
  console.log(`🚀 Mock API 服务器已启动`);
  console.log(`📡 监听地址: http://localhost:${PORT}`);
  console.log(`\n可用的API端点:`);
  Object.keys(mockData).forEach(endpoint => {
    console.log(`  - http://localhost:${PORT}${endpoint}`);
  });
  console.log('==============================================\n');
  console.log('💡 提示: 按 Ctrl+C 停止服务器\n');
});

// 处理端口占用错误
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用`);
    console.error('💡 解决方案:');
    console.error(`   1. 终止占用端口的进程: lsof -ti:${PORT} | xargs kill -9`);
    console.error(`   2. 或者修改配置文件中的端口号`);
    process.exit(1);
  } else {
    console.error('❌ Mock服务器启动失败:', error.message);
    process.exit(1);
  }
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n👋 服务器正在关闭...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

