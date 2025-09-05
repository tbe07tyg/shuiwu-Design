/**
 * @file 申报书解析API服务
 * @description 提供申报书解析相关的API接口
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-29
 */

import request from '@/utils/request'

/**
 * 获取申报书内容
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function getProposalContent(projectId) {
  return request({
    url: `/proposal/content/${projectId}`,
    method: 'get'
  })
}

/**
 * 将申报书转换为PDF
 * @param {Object} data - 转换参数
 * @returns {Promise} API响应
 */
export function convertToPdf(data) {
  return request({
    url: '/proposal/convert-to-pdf',
    method: 'post',
    data
  })
}

/**
 * 获取PDF信息
 * @param {Object} data - PDF URL等参数
 * @returns {Promise} API响应
 */
export function getPdfInfo(data) {
  return request({
    url: '/proposal/pdf-info',
    method: 'post',
    data
  })
}

/**
 * 上传申报书文件
 * @param {FormData} formData - 文件数据
 * @returns {Promise} API响应
 */
export function uploadProposal(formData) {
  return request({
    url: '/proposal/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 检查申报书是否存在
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function checkProposalExists(projectId) {
  return request({
    url: `/proposal/exists/${projectId}`,
    method: 'get'
  })
}

/**
 * 保存申报书解析结果
 * @param {Object} data - 解析结果数据
 * @returns {Promise} API响应
 */
export function saveAnalysisResult(data) {
  return request({
    url: '/proposal/analysis/save',
    method: 'post',
    data
  })
}

/**
 * 获取申报书解析结果
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function getAnalysisResult(projectId) {
  return request({
    url: `/proposal/analysis/${projectId}`,
    method: 'get'
  })
}

/**
 * 删除申报书解析结果
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function deleteAnalysisResult(projectId) {
  return request({
    url: `/proposal/analysis/${projectId}`,
    method: 'delete'
  })
}

/**
 * 导出申报书解析结果
 * @param {string} projectId - 项目ID
 * @param {string} format - 导出格式 (json, excel, word)
 * @returns {Promise} API响应
 */
export function exportAnalysisResult(projectId, format = 'json') {
  return request({
    url: `/proposal/analysis/export/${projectId}`,
    method: 'get',
    params: { format },
    responseType: format === 'json' ? 'json' : 'blob'
  })
}

/**
 * 验证豆包解析结果
 * @param {Object} data - 豆包解析的JSON数据
 * @returns {Promise} API响应
 */
export function validateDoubaoResult(data) {
  return request({
    url: '/proposal/analysis/validate',
    method: 'post',
    data
  })
}

/**
 * 获取解析历史记录
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function getAnalysisHistory(projectId) {
  return request({
    url: `/proposal/analysis/history/${projectId}`,
    method: 'get'
  })
}

/**
 * 恢复历史解析结果
 * @param {string} historyId - 历史记录ID
 * @returns {Promise} API响应
 */
export function restoreAnalysisHistory(historyId) {
  return request({
    url: `/proposal/analysis/restore/${historyId}`,
    method: 'post'
  })
}

/**
 * 生成豆包提示词
 * @param {Object} data - 生成参数
 * @returns {Promise} API响应
 */
export function generateDoubaoPrompt(data) {
  return request({
    url: '/proposal/doubao/generate-prompt',
    method: 'post',
    data
  })
}

/**
 * 解析豆包返回结果
 * @param {Object} data - 豆包返回的JSON数据
 * @returns {Promise} API响应
 */
export function parseDoubaoResult(data) {
  return request({
    url: '/proposal/doubao/parse-result',
    method: 'post',
    data
  })
}

/**
 * 获取任务统计信息
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function getTaskStatistics(projectId) {
  return request({
    url: `/proposal/tasks/statistics/${projectId}`,
    method: 'get'
  })
}

/**
 * 更新任务信息
 * @param {Object} data - 任务数据
 * @returns {Promise} API响应
 */
export function updateTask(data) {
  return request({
    url: '/proposal/tasks/update',
    method: 'post',
    data
  })
}

/**
 * 删除任务
 * @param {string} taskId - 任务ID
 * @returns {Promise} API响应
 */
export function deleteTask(taskId) {
  return request({
    url: `/proposal/tasks/${taskId}`,
    method: 'delete'
  })
}

/**
 * 批量操作任务
 * @param {Object} data - 批量操作数据
 * @returns {Promise} API响应
 */
export function batchOperateTasks(data) {
  return request({
    url: '/proposal/tasks/batch',
    method: 'post',
    data
  })
}

/**
 * 计算关键路径
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function calculateCriticalPath(projectId) {
  return request({
    url: `/proposal/tasks/critical-path/${projectId}`,
    method: 'get'
  })
}

/**
 * 分析任务依赖关系
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function analyzeDependencies(projectId) {
  return request({
    url: `/proposal/tasks/dependencies/${projectId}`,
    method: 'get'
  })
}

/**
 * 优化任务安排
 * @param {Object} data - 优化参数
 * @returns {Promise} API响应
 */
export function optimizeTaskSchedule(data) {
  return request({
    url: '/proposal/tasks/optimize',
    method: 'post',
    data
  })
}

/**
 * 生成甘特图数据
 * @param {string} projectId - 项目ID
 * @returns {Promise} API响应
 */
export function generateGanttData(projectId) {
  return request({
    url: `/proposal/tasks/gantt/${projectId}`,
    method: 'get'
  })
}

/**
 * 导出任务列表
 * @param {string} projectId - 项目ID
 * @param {string} format - 导出格式
 * @returns {Promise} API响应
 */
export function exportTasks(projectId, format = 'excel') {
  return request({
    url: `/proposal/tasks/export/${projectId}`,
    method: 'get',
    params: { format },
    responseType: 'blob'
  })
}
