/**
 * @file 任务管理器
 * @description 管理豆包提取的项目任务，包括依赖关系分析和关键路径计算
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-29
 */

/**
 * 任务管理器
 */
export class TaskManager {
  constructor() {
    this.tasks = new Map()
    this.dependencies = new Map()
    this.reverseDependencies = new Map()
  }

  /**
   * 导入豆包提取的任务
   * @param {Object} taskExtraction - 任务提取结果
   */
  importDoubaoTasks(taskExtraction) {
    console.log('🚀 导入豆包提取的任务:', taskExtraction)
    
    // 清空现有任务
    this.tasks.clear()
    this.dependencies.clear()
    this.reverseDependencies.clear()
    
    // 导入各类型任务
    const allTasks = [
      ...(taskExtraction.implementationTasks || []),
      ...(taskExtraction.technicalTasks || []),
      ...(taskExtraction.milestoneTasks || []),
      ...(taskExtraction.researchTasks || [])
    ]
    
    // 构建任务映射
    allTasks.forEach(task => {
      this.tasks.set(task.id, task)
      
      // 构建依赖关系
      if (task.dependencies && task.dependencies.length > 0) {
        this.dependencies.set(task.id, task.dependencies)
        
        // 构建反向依赖关系
        task.dependencies.forEach(depId => {
          if (!this.reverseDependencies.has(depId)) {
            this.reverseDependencies.set(depId, [])
          }
          this.reverseDependencies.get(depId).push(task.id)
        })
      }
    })
    
    console.log(`✅ 导入${allTasks.length}个豆包提取的任务`)
    console.log('📊 任务统计:', this.getTaskStatistics())
  }

  /**
   * 获取任务统计信息
   * @returns {Object} 统计信息
   */
  getTaskStatistics() {
    const allTasks = Array.from(this.tasks.values())
    
    return {
      totalTasks: allTasks.length,
      tasksByType: this.countByField(allTasks, 'type'),
      tasksByPriority: this.countByField(allTasks, 'priority'),
      tasksWithDependencies: this.dependencies.size,
      averageDuration: this.calculateAverageDuration(allTasks),
      totalEstimatedDuration: this.calculateTotalDuration(allTasks)
    }
  }

  /**
   * 按字段统计
   * @param {Array} tasks - 任务数组
   * @param {string} field - 字段名
   * @returns {Object} 统计结果
   */
  countByField(tasks, field) {
    return tasks.reduce((acc, task) => {
      const value = task[field] || 'unknown'
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})
  }

  /**
   * 计算平均工期
   * @param {Array} tasks - 任务数组
   * @returns {number} 平均工期
   */
  calculateAverageDuration(tasks) {
    const tasksWithDuration = tasks.filter(task => task.estimatedDuration > 0)
    if (tasksWithDuration.length === 0) return 0
    
    const totalDuration = tasksWithDuration.reduce((sum, task) => sum + task.estimatedDuration, 0)
    return Math.round(totalDuration / tasksWithDuration.length)
  }

  /**
   * 计算总工期
   * @param {Array} tasks - 任务数组
   * @returns {number} 总工期
   */
  calculateTotalDuration(tasks) {
    return tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0)
  }

  /**
   * 获取任务的直接依赖
   * @param {string} taskId - 任务ID
   * @returns {Array} 依赖任务ID列表
   */
  getDirectDependencies(taskId) {
    return this.dependencies.get(taskId) || []
  }

  /**
   * 获取任务的所有依赖（递归）
   * @param {string} taskId - 任务ID
   * @returns {Array} 所有依赖任务ID列表
   */
  getAllDependencies(taskId) {
    const visited = new Set()
    const dependencies = []
    
    const traverse = (id) => {
      if (visited.has(id)) return
      visited.add(id)
      
      const deps = this.dependencies.get(id) || []
      deps.forEach(depId => {
        dependencies.push(depId)
        traverse(depId)
      })
    }
    
    traverse(taskId)
    return [...new Set(dependencies)] // 去重
  }

  /**
   * 获取任务的依赖链
   * @param {string} taskId - 任务ID
   * @returns {Array} 依赖链
   */
  getDependencyChain(taskId) {
    const visited = new Set()
    const chain = []
    
    const traverse = (id, path = []) => {
      if (visited.has(id) || path.includes(id)) {
        // 检测到循环依赖
        return
      }
      
      visited.add(id)
      const currentPath = [...path, id]
      
      const deps = this.dependencies.get(id) || []
      if (deps.length === 0) {
        // 叶子节点，记录路径
        chain.push(currentPath)
      } else {
        deps.forEach(depId => {
          traverse(depId, currentPath)
        })
      }
    }
    
    traverse(taskId)
    return chain
  }

  /**
   * 获取任务的反向依赖
   * @param {string} taskId - 任务ID
   * @returns {Array} 依赖此任务的任务ID列表
   */
  getReverseDependencies(taskId) {
    return this.reverseDependencies.get(taskId) || []
  }

  /**
   * 检测循环依赖
   * @returns {Array} 循环依赖的任务组
   */
  detectCircularDependencies() {
    const visited = new Set()
    const recursionStack = new Set()
    const cycles = []
    
    const dfs = (taskId, path = []) => {
      if (recursionStack.has(taskId)) {
        // 找到循环
        const cycleStart = path.indexOf(taskId)
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart))
        }
        return
      }
      
      if (visited.has(taskId)) return
      
      visited.add(taskId)
      recursionStack.add(taskId)
      
      const deps = this.dependencies.get(taskId) || []
      deps.forEach(depId => {
        dfs(depId, [...path, taskId])
      })
      
      recursionStack.delete(taskId)
    }
    
    // 检查所有任务
    this.tasks.forEach((task, taskId) => {
      if (!visited.has(taskId)) {
        dfs(taskId)
      }
    })
    
    return cycles
  }

  /**
   * 拓扑排序
   * @returns {Array} 排序后的任务ID列表
   */
  topologicalSort() {
    const inDegree = new Map()
    const result = []
    const queue = []
    
    // 计算入度
    this.tasks.forEach((task, taskId) => {
      inDegree.set(taskId, 0)
    })
    
    this.dependencies.forEach((deps, taskId) => {
      deps.forEach(depId => {
        if (inDegree.has(depId)) {
          inDegree.set(depId, inDegree.get(depId) + 1)
        }
      })
    })
    
    // 找到入度为0的任务
    inDegree.forEach((degree, taskId) => {
      if (degree === 0) {
        queue.push(taskId)
      }
    })
    
    // 拓扑排序
    while (queue.length > 0) {
      const taskId = queue.shift()
      result.push(taskId)
      
      const dependents = this.reverseDependencies.get(taskId) || []
      dependents.forEach(depTaskId => {
        const newDegree = inDegree.get(depTaskId) - 1
        inDegree.set(depTaskId, newDegree)
        
        if (newDegree === 0) {
          queue.push(depTaskId)
        }
      })
    }
    
    return result
  }

  /**
   * 计算关键路径
   * @returns {Object} 关键路径信息
   */
  calculateCriticalPath() {
    const sortedTasks = this.topologicalSort()
    const earliestStart = new Map()
    const latestStart = new Map()
    const taskDurations = new Map()
    
    // 初始化任务工期
    this.tasks.forEach((task, taskId) => {
      taskDurations.set(taskId, task.estimatedDuration || 0)
    })
    
    // 计算最早开始时间
    sortedTasks.forEach(taskId => {
      const deps = this.dependencies.get(taskId) || []
      let maxEarliestFinish = 0
      
      deps.forEach(depId => {
        const depEarliestStart = earliestStart.get(depId) || 0
        const depDuration = taskDurations.get(depId) || 0
        maxEarliestFinish = Math.max(maxEarliestFinish, depEarliestStart + depDuration)
      })
      
      earliestStart.set(taskId, maxEarliestFinish)
    })
    
    // 计算项目总工期
    let projectDuration = 0
    sortedTasks.forEach(taskId => {
      const taskStart = earliestStart.get(taskId) || 0
      const taskDuration = taskDurations.get(taskId) || 0
      projectDuration = Math.max(projectDuration, taskStart + taskDuration)
    })
    
    // 计算最晚开始时间
    const reversedTasks = [...sortedTasks].reverse()
    reversedTasks.forEach(taskId => {
      const dependents = this.reverseDependencies.get(taskId) || []
      
      if (dependents.length === 0) {
        // 项目结束任务
        const taskDuration = taskDurations.get(taskId) || 0
        latestStart.set(taskId, projectDuration - taskDuration)
      } else {
        let minLatestStart = Infinity
        
        dependents.forEach(depTaskId => {
          const depLatestStart = latestStart.get(depTaskId) || 0
          minLatestStart = Math.min(minLatestStart, depLatestStart)
        })
        
        const taskDuration = taskDurations.get(taskId) || 0
        latestStart.set(taskId, minLatestStart - taskDuration)
      }
    })
    
    // 找到关键路径上的任务（浮动时间为0）
    const criticalTasks = []
    this.tasks.forEach((task, taskId) => {
      const earliest = earliestStart.get(taskId) || 0
      const latest = latestStart.get(taskId) || 0
      const float = latest - earliest
      
      if (Math.abs(float) < 0.01) { // 考虑浮点数精度
        criticalTasks.push({
          taskId,
          task,
          earliestStart: earliest,
          latestStart: latest,
          float: 0
        })
      }
    })
    
    return {
      criticalTasks,
      projectDuration,
      criticalPath: criticalTasks.map(item => item.taskId),
      totalFloat: this.calculateTotalFloat(earliestStart, latestStart, taskDurations)
    }
  }

  /**
   * 计算所有任务的浮动时间
   * @param {Map} earliestStart - 最早开始时间
   * @param {Map} latestStart - 最晚开始时间
   * @param {Map} taskDurations - 任务工期
   * @returns {Map} 浮动时间映射
   */
  calculateTotalFloat(earliestStart, latestStart, taskDurations) {
    const totalFloat = new Map()
    
    this.tasks.forEach((task, taskId) => {
      const earliest = earliestStart.get(taskId) || 0
      const latest = latestStart.get(taskId) || 0
      totalFloat.set(taskId, latest - earliest)
    })
    
    return totalFloat
  }

  /**
   * 识别高风险任务
   * @returns {Array} 高风险任务列表
   */
  identifyRiskTasks() {
    const riskTasks = []
    
    this.tasks.forEach((task, taskId) => {
      let riskScore = 0
      const riskFactors = []
      
      // 高优先级任务
      if (task.priority === 'high') {
        riskScore += 30
        riskFactors.push('高优先级')
      }
      
      // 技术难度高
      if (task.technicalDifficulty === 'high') {
        riskScore += 40
        riskFactors.push('技术难度高')
      }
      
      // 工期长
      if (task.estimatedDuration > 20) {
        riskScore += 20
        riskFactors.push('工期较长')
      }
      
      // 依赖多
      const deps = this.dependencies.get(taskId) || []
      if (deps.length > 2) {
        riskScore += 15
        riskFactors.push('依赖任务多')
      }
      
      // 被依赖多
      const reverseDeps = this.reverseDependencies.get(taskId) || []
      if (reverseDeps.length > 2) {
        riskScore += 15
        riskFactors.push('被依赖任务多')
      }
      
      // 关键技术多
      if (task.keyTechnologies && task.keyTechnologies.length > 3) {
        riskScore += 10
        riskFactors.push('涉及技术多')
      }
      
      if (riskScore >= 50) {
        riskTasks.push({
          taskId,
          task,
          riskScore,
          riskFactors
        })
      }
    })
    
    // 按风险分数排序
    return riskTasks.sort((a, b) => b.riskScore - a.riskScore)
  }

  /**
   * 获取任务详细信息
   * @param {string} taskId - 任务ID
   * @returns {Object} 任务详细信息
   */
  getTaskDetails(taskId) {
    const task = this.tasks.get(taskId)
    if (!task) return null
    
    return {
      ...task,
      directDependencies: this.getDirectDependencies(taskId),
      allDependencies: this.getAllDependencies(taskId),
      reverseDependencies: this.getReverseDependencies(taskId),
      dependencyChain: this.getDependencyChain(taskId)
    }
  }

  /**
   * 更新任务
   * @param {string} taskId - 任务ID
   * @param {Object} updates - 更新内容
   * @returns {boolean} 更新是否成功
   */
  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId)
    if (!task) return false
    
    // 更新任务信息
    const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() }
    this.tasks.set(taskId, updatedTask)
    
    // 如果依赖关系发生变化，更新依赖映射
    if (updates.dependencies !== undefined) {
      // 清除旧的依赖关系
      const oldDeps = this.dependencies.get(taskId) || []
      oldDeps.forEach(depId => {
        const reverseDeps = this.reverseDependencies.get(depId) || []
        const index = reverseDeps.indexOf(taskId)
        if (index !== -1) {
          reverseDeps.splice(index, 1)
        }
      })
      
      // 设置新的依赖关系
      if (updates.dependencies.length > 0) {
        this.dependencies.set(taskId, updates.dependencies)
        updates.dependencies.forEach(depId => {
          if (!this.reverseDependencies.has(depId)) {
            this.reverseDependencies.set(depId, [])
          }
          this.reverseDependencies.get(depId).push(taskId)
        })
      } else {
        this.dependencies.delete(taskId)
      }
    }
    
    return true
  }

  /**
   * 删除任务
   * @param {string} taskId - 任务ID
   * @returns {boolean} 删除是否成功
   */
  deleteTask(taskId) {
    if (!this.tasks.has(taskId)) return false
    
    // 删除任务
    this.tasks.delete(taskId)
    
    // 清除依赖关系
    const deps = this.dependencies.get(taskId) || []
    deps.forEach(depId => {
      const reverseDeps = this.reverseDependencies.get(depId) || []
      const index = reverseDeps.indexOf(taskId)
      if (index !== -1) {
        reverseDeps.splice(index, 1)
      }
    })
    this.dependencies.delete(taskId)
    
    // 清除反向依赖关系
    this.reverseDependencies.delete(taskId)
    
    return true
  }

  /**
   * 导出任务数据
   * @returns {Object} 任务数据
   */
  exportTasks() {
    return {
      tasks: Object.fromEntries(this.tasks),
      dependencies: Object.fromEntries(this.dependencies),
      statistics: this.getTaskStatistics(),
      criticalPath: this.calculateCriticalPath(),
      riskTasks: this.identifyRiskTasks(),
      exportTime: new Date().toISOString()
    }
  }

  /**
   * 清空所有任务
   */
  clear() {
    this.tasks.clear()
    this.dependencies.clear()
    this.reverseDependencies.clear()
  }
}

/**
 * 默认导出实例
 */
export default new TaskManager()
