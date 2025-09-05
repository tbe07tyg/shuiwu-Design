/**
 * @file HTTP请求工具
 * @description 基于axios的HTTP请求封装，支持请求拦截、响应拦截和错误处理
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-29
 */

import axios from 'axios'
import { message } from 'ant-design-vue'

// 创建axios实例
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = generateRequestId()
    
    // 开发环境下打印请求信息
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.params
      })
    }
    
    return config
  },
  error => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data, config } = response
    
    // 开发环境下打印响应信息
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        url: config.url,
        status: response.status,
        data: data
      })
    }
    
    // 统一处理响应格式
    if (data && typeof data === 'object') {
      // 标准响应格式：{ code, msg, data }
      if (data.code !== undefined) {
        if (data.code === 200 || data.code === 0) {
          return data
        } else {
          // 业务错误
          const errorMsg = data.msg || data.message || '请求失败'
          message.error(errorMsg)
          return Promise.reject(new Error(errorMsg))
        }
      }
      
      // 直接返回数据对象
      return { code: 200, data: data, msg: 'success' }
    }
    
    // 其他情况直接返回
    return { code: 200, data: response.data, msg: 'success' }
  },
  error => {
    console.error('❌ Response Error:', error)
    
    let errorMessage = '网络请求失败'
    
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = data?.msg || '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          // 这里可以添加路由跳转逻辑
          break
        case 403:
          errorMessage = '拒绝访问，权限不足'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务不可用'
          break
        default:
          errorMessage = data?.msg || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 网络错误
      errorMessage = '网络连接失败，请检查网络'
    } else {
      // 其他错误
      errorMessage = error.message || '请求配置错误'
    }
    
    // 显示错误消息
    message.error(errorMessage)
    
    return Promise.reject(error)
  }
)

/**
 * 生成请求ID
 * @returns {string} 请求ID
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {Object} params - 请求参数
 * @param {Object} config - 请求配置
 * @returns {Promise} 请求Promise
 */
export function get(url, params = {}, config = {}) {
  return request({
    method: 'GET',
    url,
    params,
    ...config
  })
}

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} config - 请求配置
 * @returns {Promise} 请求Promise
 */
export function post(url, data = {}, config = {}) {
  return request({
    method: 'POST',
    url,
    data,
    ...config
  })
}

/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} config - 请求配置
 * @returns {Promise} 请求Promise
 */
export function put(url, data = {}, config = {}) {
  return request({
    method: 'PUT',
    url,
    data,
    ...config
  })
}

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @param {Object} config - 请求配置
 * @returns {Promise} 请求Promise
 */
export function del(url, config = {}) {
  return request({
    method: 'DELETE',
    url,
    ...config
  })
}

/**
 * 文件上传请求
 * @param {string} url - 上传URL
 * @param {FormData} formData - 文件数据
 * @param {Object} config - 请求配置
 * @returns {Promise} 请求Promise
 */
export function upload(url, formData, config = {}) {
  return request({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

/**
 * 文件下载请求
 * @param {string} url - 下载URL
 * @param {Object} params - 请求参数
 * @param {string} filename - 文件名
 * @returns {Promise} 请求Promise
 */
export function download(url, params = {}, filename = '') {
  return request({
    method: 'GET',
    url,
    params,
    responseType: 'blob'
  }).then(response => {
    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || getFilenameFromResponse(response) || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return response
  })
}

/**
 * 从响应头中获取文件名
 * @param {Object} response - 响应对象
 * @returns {string} 文件名
 */
function getFilenameFromResponse(response) {
  const contentDisposition = response.headers['content-disposition']
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1].replace(/['"]/g, '')
    }
  }
  return ''
}

/**
 * 批量请求
 * @param {Array} requests - 请求数组
 * @returns {Promise} 批量请求Promise
 */
export function batch(requests) {
  return Promise.all(requests.map(req => {
    if (typeof req === 'function') {
      return req()
    }
    return request(req)
  }))
}

/**
 * 请求重试
 * @param {Function} requestFn - 请求函数
 * @param {number} retries - 重试次数
 * @param {number} delay - 重试延迟(ms)
 * @returns {Promise} 请求Promise
 */
export function retry(requestFn, retries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (remainingRetries) => {
      requestFn()
        .then(resolve)
        .catch(error => {
          if (remainingRetries > 0) {
            console.warn(`请求失败，${delay}ms后重试，剩余重试次数：${remainingRetries}`)
            setTimeout(() => attempt(remainingRetries - 1), delay)
          } else {
            reject(error)
          }
        })
    }
    
    attempt(retries)
  })
}

// 默认导出request实例
export default request
