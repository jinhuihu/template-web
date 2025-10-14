/**
 * API请求模块
 * 
 * 负责从后端接口获取数据
 */

const axios = require('axios');
const http = require('http');
const https = require('https');

// 创建自定义的axios实例，禁用代理和keep-alive
const axiosInstance = axios.create({
  proxy: false,
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false })
});

/**
 * 从API获取数据
 * @param {string} endpoint - API端点
 * @param {string} method - 请求方法
 * @param {Object} params - 请求参数
 * @param {Object} apiConfig - API配置
 * @returns {Promise<Object>} API返回的数据
 */
async function fetchData(endpoint, method = 'GET', params = {}, apiConfig) {
  const url = `${apiConfig.baseUrl}${endpoint}`;
  
  const config = {
    method: method.toUpperCase(),
    url,
    timeout: apiConfig.timeout || 10000,
    headers: apiConfig.headers || {}
  };

  // 根据请求方法添加参数
  if (method.toUpperCase() === 'GET') {
    config.params = params;
  } else {
    config.data = params;
  }

  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      // 服务器返回错误状态码
      throw new Error(`API错误 (${error.response.status}): ${error.response.statusText}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      throw new Error(`网络错误: 无法连接到服务器 ${url}`);
    } else {
      // 其他错误
      throw new Error(`请求配置错误: ${error.message}`);
    }
  }
}

/**
 * 批量获取数据
 * @param {Array} endpoints - API端点数组
 * @param {Object} apiConfig - API配置
 * @returns {Promise<Array>} 所有API返回的数据数组
 */
async function fetchBatch(endpoints, apiConfig) {
  const promises = endpoints.map(endpoint => 
    fetchData(endpoint.api, endpoint.method || 'GET', endpoint.params || {}, apiConfig)
  );
  
  return Promise.all(promises);
}

module.exports = {
  fetchData,
  fetchBatch
};

