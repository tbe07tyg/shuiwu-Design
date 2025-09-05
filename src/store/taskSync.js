/**
 * @file 任务数据同步管理
 * @description 统一管理监控页面和任务管理页面的数据同步，确保所有修改都能实时同步
 * @author 科研管理系统
 * @version 1.0.0
 */

import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

export const useTaskSyncStore = defineStore('taskSync', () => {
  // === 数据状态 ===
  
  // 任务数据缓存
  const taskCache = ref(new Map())
  
  // WBS项目数据
  const wbsProjects = ref(new Map())
  
  // 任务同步状态
  const syncStatus = reactive({
    isUpdating: false,
    lastSyncTime: null,
    pendingUpdates: new Set()
  })

  // 未读提醒计数
  const unreadByProject = ref(new Map()) // projectId -> count
  const unreadByTask = ref(new Map()) // `${projectId}_${taskKey}` -> count

  // === 数据同步方法 ===

  /**
   * 注册WBS项目数据
   * @param {string} projectId 项目ID
   * @param {Array} wbsData WBS树形数据
   */
  const registerWBSProject = (projectId, wbsData) => {
    // 记录注册前该项目在缓存中的最新条目，用于稍后合并
    const previousCache = new Map()
    for (const [fullKey, task] of taskCache.value.entries()) {
      if (task.projectId === projectId) {
        previousCache.set(fullKey, { ...task })
      }
    }

    wbsProjects.value.set(projectId, {
      data: wbsData,
      lastUpdate: Date.now()
    })
    
    // 将WBS数据扁平化并存入任务缓存（覆盖为WBS基线数据）
    flattenWBSToTaskCache(projectId, wbsData)

    // 合并先前缓存的动态更新到当前WBS与缓存（确保跨页面切换不丢失：进度/状态/操作历史等）
    if (previousCache.size > 0) {
      const mergeFields = [
        'status','progress','completedAt','startedAt','note','estimatedCompletion',
        'submittedMaterials','submissionNote','submittedAt','operationHistory'
      ]
      const findNode = (nodes, key) => {
        for (const node of nodes) {
          if (String(node.key) === String(key)) return node
          if (node.children) {
            const found = findNode(node.children, key)
            if (found) return found
          }
        }
        return null
      }
      for (const [fullKey, cached] of previousCache.entries()) {
        const [, taskKey] = fullKey.split('_')
        const node = findNode(wbsData, taskKey)
        if (!node) continue
        const currentCache = taskCache.value.get(fullKey)
        if (!currentCache) continue
        mergeFields.forEach(f => {
          if (cached[f] !== undefined) {
            node[f] = cached[f]
            currentCache[f] = cached[f]
          }
        })
      }
      wbsProjects.value.set(projectId, {
        data: wbsData,
        lastUpdate: Date.now()
      })
    }
  }

  /**
   * 将WBS树形数据扁平化存入任务缓存
   * @param {string} projectId 项目ID
   * @param {Array} wbsData WBS数据
   */
  const flattenWBSToTaskCache = (projectId, wbsData) => {
    const flatten = (nodes, parentPath = '') => {
      nodes.forEach(node => {
        const taskKey = `${projectId}_${String(node.key)}`
        taskCache.value.set(taskKey, {
          ...node,
          projectId,
          taskKey,
          parentPath,
          lastUpdate: Date.now()
        })
        
        if (node.children && node.children.length > 0) {
          flatten(node.children, parentPath ? `${parentPath}.${node.key}` : node.key)
        }
      })
    }
    
    flatten(wbsData)
  }

  /**
   * 更新任务数据
   * @param {string} projectId 项目ID
   * @param {string} taskKey 任务键
   * @param {Object} updates 更新数据
   */
  const updateTask = async (projectId, taskKey, updates) => {
    const fullTaskKey = `${projectId}_${String(taskKey)}`
    
    try {
      syncStatus.isUpdating = true
      syncStatus.pendingUpdates.add(fullTaskKey)
      
      // 更新任务缓存
      let cachedTask = taskCache.value.get(fullTaskKey)
      if (!cachedTask) {
        // 若缓存中不存在，先创建一条记录，避免跨页面时丢失数据
        cachedTask = { projectId, taskKey, operationHistory: [], lastUpdate: Date.now() }
        taskCache.value.set(fullTaskKey, cachedTask)
      }
      // 合并操作历史：若传入有 operationHistory，进行合并去重
      const toAssign = { ...updates }
      if (updates && Array.isArray(updates.operationHistory)) {
        const existing = Array.isArray(cachedTask.operationHistory) ? cachedTask.operationHistory : []
        const merged = [...existing]
        updates.operationHistory.forEach(entry => {
          if (!merged.find(x => x.id === entry.id)) merged.push(entry)
        })
        toAssign.operationHistory = merged
      }
      Object.assign(cachedTask, toAssign, { lastUpdate: Date.now() })
      
      // 更新WBS项目数据
      const project = wbsProjects.value.get(projectId)
      if (project) {
        updateWBSNode(project.data, String(taskKey), toAssign)
        project.lastUpdate = Date.now()
      }
      
      // 通知其他页面数据已更新
      await broadcastTaskUpdate(projectId, taskKey, updates)
      
      syncStatus.lastSyncTime = Date.now()
      
      console.log(`✅ 任务数据同步成功: ${fullTaskKey}`, updates)
      
    } catch (error) {
      console.error(`❌ 任务数据同步失败: ${fullTaskKey}`, error)
      message.error('任务数据同步失败，请重试')
      throw error
    } finally {
      syncStatus.pendingUpdates.delete(fullTaskKey)
      
      // 如果没有待处理的更新，则重置更新状态
      if (syncStatus.pendingUpdates.size === 0) {
        syncStatus.isUpdating = false
      }
    }
  }

  /**
   * 递归更新WBS节点数据
   * @param {Array} nodes WBS节点数组
   * @param {string} targetKey 目标节点键
   * @param {Object} updates 更新数据
   */
  const updateWBSNode = (nodes, targetKey, updates) => {
    for (const node of nodes) {
      if (node.key === targetKey) {
        Object.assign(node, updates)
        return true
      }
      
      if (node.children && node.children.length > 0) {
        if (updateWBSNode(node.children, targetKey, updates)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * 广播任务更新事件
   * @param {string} projectId 项目ID
   * @param {string} taskKey 任务键
   * @param {Object} updates 更新数据
   */
  const broadcastTaskUpdate = async (projectId, taskKey, updates) => {
    // 发送自定义事件，其他页面可以监听此事件
    const event = new CustomEvent('taskDataUpdated', {
      detail: {
        projectId,
        taskKey,
        updates,
        timestamp: Date.now()
      }
    })
    
    window.dispatchEvent(event)

    // 记录未读计数
    const pid = String(projectId)
    const tkey = String(taskKey)
    const fullKey = `${pid}_${tkey}`
    // 任务级未读
    const taskCount = (unreadByTask.value.get(fullKey) || 0) + 1
    unreadByTask.value.set(fullKey, taskCount)
    // 项目级未读
    const projCount = (unreadByProject.value.get(pid) || 0) + 1
    unreadByProject.value.set(pid, projCount)
    
    // 模拟API调用
    if (typeof window !== 'undefined' && window.taskSyncAPI) {
      await window.taskSyncAPI.updateTask(projectId, taskKey, updates)
    }
  }

  /**
   * 获取任务数据
   * @param {string} projectId 项目ID
   * @param {string} taskKey 任务键
   */
  const getTask = (projectId, taskKey) => {
    const fullTaskKey = `${projectId}_${String(taskKey)}`
    return taskCache.value.get(fullTaskKey)
  }

  /**
   * 获取项目的所有任务
   * @param {string} projectId 项目ID
   */
  const getProjectTasks = (projectId) => {
    const tasks = []
    for (const [key, task] of taskCache.value) {
      if (task.projectId === projectId) {
        tasks.push(task)
      }
    }
    return tasks
  }

  /**
   * 基于WBS的统一进度计算
   * - 规则：叶子节点为可执行单元，按叶子节点平均权重计算；若叶子节点有自带progress，直接使用；
   *   非叶子节点进度 = 子节点进度平均值；任务标记completed计入100%。
   * - 返回 0-100 的整数
   */
  const computeProjectProgress = (projectId) => {
    const project = wbsProjects.value.get(projectId)
    if (!project) return 0
    const data = project.data || []

    const computeNode = (node) => {
      if (!node || !Array.isArray(node.children) || node.children.length === 0) {
        // 叶子
        if (node && typeof node.progress === 'number') return Math.max(0, Math.min(100, Math.round(node.progress)))
        if (node && node.status === 'completed') return 100
        return 0
      }
      // 非叶子：子节点平均
      const childValues = node.children.map(computeNode)
      if (childValues.length === 0) return 0
      return Math.round(childValues.reduce((a, b) => a + b, 0) / childValues.length)
    }

    if (data.length === 0) return 0
    const values = data.map(computeNode)
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  }

  // === 未读计数 API ===
  const getUnreadCountForProject = (projectId) => {
    return unreadByProject.value.get(String(projectId)) || 0
  }

  const getUnreadCountForTask = (projectId, taskKey) => {
    return unreadByTask.value.get(`${String(projectId)}_${String(taskKey)}`) || 0
  }

  const getTotalUnreadCount = () => {
    let total = 0
    for (const c of unreadByProject.value.values()) total += c
    return total
  }

  const markProjectUpdatesRead = (projectId) => {
    const pid = String(projectId)
    unreadByProject.value.set(pid, 0)
    // 清除该项目下所有任务的未读
    for (const key of unreadByTask.value.keys()) {
      if (key.startsWith(pid + '_')) unreadByTask.value.set(key, 0)
    }
  }

  const markTaskUpdateRead = (projectId, taskKey) => {
    const pid = String(projectId)
    const fullKey = `${pid}_${String(taskKey)}`
    const current = unreadByTask.value.get(fullKey) || 0
    if (current > 0) {
      unreadByTask.value.set(fullKey, 0)
      const projCurrent = unreadByProject.value.get(pid) || 0
      const next = Math.max(0, projCurrent - current)
      unreadByProject.value.set(pid, next)
    }
  }

  /**
   * 获取WBS项目数据
   * @param {string} projectId 项目ID
   */
  const getWBSProject = (projectId) => {
    return wbsProjects.value.get(projectId)
  }

  /**
   * 批量更新任务
   * @param {Array} taskUpdates 任务更新列表
   */
  const batchUpdateTasks = async (taskUpdates) => {
    const updatePromises = taskUpdates.map(update => 
      updateTask(update.projectId, update.taskKey, update.data)
    )
    
    try {
      await Promise.all(updatePromises)
      message.success(`批量更新 ${taskUpdates.length} 个任务成功`)
    } catch (error) {
      message.error('批量更新任务失败')
      throw error
    }
  }

  /**
   * 清除项目缓存
   * @param {string} projectId 项目ID
   */
  const clearProjectCache = (projectId) => {
    // 清除任务缓存
    for (const [key, task] of taskCache.value) {
      if (task.projectId === projectId) {
        taskCache.value.delete(key)
      }
    }
    
    // 清除WBS项目缓存
    wbsProjects.value.delete(projectId)
    
    console.log(`🗑️ 清除项目缓存: ${projectId}`)
  }

  // === 计算属性 ===

  /**
   * 是否有待同步的任务
   */
  const hasPendingUpdates = computed(() => {
    return syncStatus.pendingUpdates.size > 0
  })

  /**
   * 任务总数统计
   */
  const taskStats = computed(() => {
    const stats = {
      total: 0,
      byStatus: {
        completed: 0,
        active: 0,
        pending: 0,
        delayed: 0
      },
      byProject: new Map()
    }
    
    for (const task of taskCache.value.values()) {
      stats.total++
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1
      
      const projectStats = stats.byProject.get(task.projectId) || { total: 0, byStatus: {} }
      projectStats.total++
      projectStats.byStatus[task.status] = (projectStats.byStatus[task.status] || 0) + 1
      stats.byProject.set(task.projectId, projectStats)
    }
    
    return stats
  })

  return {
    // 数据状态
    taskCache,
    wbsProjects,
    syncStatus,
    unreadByProject,
    unreadByTask,
    
    // 数据操作方法
    registerWBSProject,
    updateTask,
    getTask,
    getProjectTasks,
    getWBSProject,
    batchUpdateTasks,
    clearProjectCache,
    computeProjectProgress,
    
    // 计算属性
    hasPendingUpdates,
    taskStats,

    // 未读相关
    getUnreadCountForProject,
    getUnreadCountForTask,
    getTotalUnreadCount,
    markProjectUpdatesRead,
    markTaskUpdateRead
  }
})

// === 全局事件监听器 ===

/**
 * 设置全局任务数据同步监听器
 */
export const setupTaskSyncListener = () => {
  if (typeof window === 'undefined') return
  
  // 监听任务数据更新事件
  window.addEventListener('taskDataUpdated', (event) => {
    const { projectId, taskKey, updates, timestamp } = event.detail
    console.log(`📡 接收到任务更新广播: ${projectId}_${taskKey}`, {
      updates,
      timestamp: new Date(timestamp).toLocaleString()
    })
  })
  
  // 监听页面可见性变化，重新同步数据
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('📱 页面重新可见，检查数据同步状态')
      // 这里可以添加重新同步数据的逻辑
    }
  })
}
