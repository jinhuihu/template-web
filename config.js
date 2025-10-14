/**
 * 静态页面构建配置文件
 * 
 * 配置说明：
 * - templates: 模板配置数组，每个模板对应一个输出文件
 * - apiUrl: 后端API基础URL
 * - timeout: API请求超时时间（毫秒）
 * - templateDir: 模板文件目录
 * - outputDir: 输出目录
 */

module.exports = {
  // 模板配置列表
  templates: [
    {
      // 模板文件名（相对于 templateDir）
      name: 'index.html',
      // 输出文件名（相对于 outputDir）
      output: 'index.html',
      // API端点（相对于 apiUrl）
      api: '/api/home',
      // 可选：请求方法，默认GET
      method: 'GET',
      // 可选：请求参数
      params: {},
      // 可选：数据转换函数，用于处理API返回的数据
      transform: (data) => {
        return data;
      }
    },
    {
      name: 'about.html',
      output: 'about.html',
      api: '/api/about',
      method: 'GET'
    },
    {
      name: 'product.html',
      output: 'product.html',
      api: '/api/products',
      method: 'GET',
      // 示例：数据转换
      transform: (data) => {
        // 可以在这里对API返回的数据进行处理
        return {
          ...data,
          products: data.products || []
        };
      }
    }
  ],

  // API配置
  api: {
    // 后端API基础URL
    baseUrl: 'http://localhost:3001',
    // 请求超时时间（毫秒）
    timeout: 10000,
    // 可选：请求头配置
    headers: {
      'Content-Type': 'application/json'
    }
  },

  // 目录配置
  paths: {
    // 模板文件目录
    templateDir: './templates',
    // 输出目录
    outputDir: './dist',
    // 静态资源目录（会直接复制到输出目录）
    assetsDir: './assets'
  },

  // 开发模式配置
  dev: {
    // 是否启用监听模式
    watch: true,
    // 监听的文件类型
    watchExtensions: ['.html', '.css', '.js'],
    // 开发服务器端口
    port: 3000,
    // Mock服务器端口
    mockPort: 3001,
    // 热更新延迟时间（毫秒）
    hotReloadDelay: 500
  }
};

