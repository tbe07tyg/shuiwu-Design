/**
 * @file 豆包结果解析器
 * @description 解析豆包返回的申报书解析结果，包含任务提取功能
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-29
 */

/**
 * 增强版豆包结果解析器
 */
export class EnhancedDoubaoResultParser {
  constructor() {
    this.requiredFields = [
      'basicInfo',
      'researchContent',
      'taskExtraction'
    ]
  }

  /**
   * 解析豆包返回的完整结果
   * @param {Object} doubaoResult - 豆包解析结果
   * @returns {Object} 结构化的解析结果
   */
  parseEnhancedResult(doubaoResult) {
    try {
      console.log('🚀 开始解析豆包结果:', doubaoResult)
      
      // 1. 验证基本结构
      this.validateBasicStructure(doubaoResult)
      
      // 2. 解析基础信息
      const basicInfo = this.parseBasicInfo(doubaoResult.basicInfo)
      
      // 3. 解析研究内容
      const researchContent = this.parseResearchContent(doubaoResult.researchContent)
      
      // 4. 解析任务提取结果
      const taskExtraction = this.parseTaskExtraction(doubaoResult.taskExtraction)
      
      // 5. 解析任务摘要
      const taskSummary = this.parseTaskSummary(doubaoResult.taskSummary)
      
      // 6. 构建完整的解析结果
      const result = {
        basicInfo,
        researchContent,
        taskExtraction,
        taskSummary,
        // 为了兼容现有界面，将任务按区域分组
        sectionTasks: this.groupTasksBySection(taskExtraction),
        parseStatus: 'completed',
        parseTime: new Date().toISOString(),
        statistics: this.generateStatistics(taskExtraction, taskSummary)
      }
      
      console.log('✅ 豆包结果解析成功:', result)
      return result
      
    } catch (error) {
      console.error('❌ 豆包结果解析失败:', error)
      throw new Error(`解析失败: ${error.message}`)
    }
  }

  /**
   * 验证基本结构
   * @param {Object} result - 解析结果
   */
  validateBasicStructure(result) {
    if (!result || typeof result !== 'object') {
      throw new Error('解析结果不是有效的对象')
    }

    const missingFields = this.requiredFields.filter(field => !result[field])
    if (missingFields.length > 0) {
      throw new Error(`缺少必要字段: ${missingFields.join(', ')}`)
    }
  }

  /**
   * 验证完整结构
   * @param {Object} result - 解析结果
   * @returns {Object} 验证结果
   */
  validateStructure(result) {
    try {
      this.validateBasicStructure(result)
      
      // 验证任务提取结构
      if (result.taskExtraction) {
        const taskTypes = ['implementationTasks', 'technicalTasks', 'milestoneTasks', 'researchTasks']
        const invalidTasks = []
        
        taskTypes.forEach(type => {
          if (result.taskExtraction[type] && Array.isArray(result.taskExtraction[type])) {
            result.taskExtraction[type].forEach((task, index) => {
              const taskValidation = this.validateTask(task)
              if (!taskValidation.valid) {
                invalidTasks.push(`${type}[${index}]: ${taskValidation.message}`)
              }
            })
          }
        })
        
        if (invalidTasks.length > 0) {
          return {
            valid: false,
            message: '任务数据验证失败: ' + invalidTasks.slice(0, 3).join('; ')
          }
        }
      }
      
      return { valid: true, message: '结构验证通过' }
    } catch (error) {
      return { valid: false, message: error.message }
    }
  }

  /**
   * 验证单个任务
   * @param {Object} task - 任务对象
   * @returns {Object} 验证结果
   */
  validateTask(task) {
    const requiredTaskFields = ['id', 'name', 'type']
    const missingFields = requiredTaskFields.filter(field => !task[field])
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `缺少必要字段: ${missingFields.join(', ')}`
      }
    }
    
    // 验证任务类型
    const validTypes = ['implementation', 'technical', 'milestone', 'research']
    if (!validTypes.includes(task.type)) {
      return {
        valid: false,
        message: `无效的任务类型: ${task.type}`
      }
    }
    
    // 验证优先级
    if (task.priority) {
      const validPriorities = ['high', 'medium', 'low']
      if (!validPriorities.includes(task.priority)) {
        return {
          valid: false,
          message: `无效的优先级: ${task.priority}`
        }
      }
    }
    
    return { valid: true, message: '任务验证通过' }
  }

  /**
   * 解析基础信息
   * @param {Object} basicInfo - 基础信息
   * @returns {Object} 解析后的基础信息
   */
  parseBasicInfo(basicInfo) {
    if (!basicInfo) return {}
    
    return {
      projectName: basicInfo.projectName || '',
      applicantUnit: basicInfo.applicantUnit || '',
      leader: basicInfo.leader || '',
      cooperativeUnit: basicInfo.cooperativeUnit || '',
      applicationDate: basicInfo.applicationDate || ''
    }
  }

  /**
   * 解析研究内容
   * @param {Object} researchContent - 研究内容
   * @returns {Object} 解析后的研究内容
   */
  parseResearchContent(researchContent) {
    if (!researchContent) return {}
    
    return {
      basisAndSignificance: researchContent.basisAndSignificance || '',
      implementation: {
        plan: researchContent.implementation?.plan || '',
        keyTechnologies: researchContent.implementation?.keyTechnologies || '',
        technicalRoute: researchContent.implementation?.technicalRoute || '',
        expectedResults: researchContent.implementation?.expectedResults || ''
      },
      existingConditions: researchContent.existingConditions || '',
      expectedBenefits: researchContent.expectedBenefits || '',
      schedule: researchContent.schedule || ''
    }
  }

  /**
   * 解析任务提取结果
   * @param {Object} taskExtraction - 任务提取结果
   * @returns {Object} 解析后的任务数据
   */
  parseTaskExtraction(taskExtraction) {
    if (!taskExtraction) {
      return {
        implementationTasks: [],
        technicalTasks: [],
        milestoneTasks: [],
        researchTasks: []
      }
    }
    
    return {
      implementationTasks: this.validateTasks(taskExtraction.implementationTasks || []),
      technicalTasks: this.validateTasks(taskExtraction.technicalTasks || []),
      milestoneTasks: this.validateTasks(taskExtraction.milestoneTasks || []),
      researchTasks: this.validateTasks(taskExtraction.researchTasks || [])
    }
  }

  /**
   * 解析任务摘要
   * @param {Object} taskSummary - 任务摘要
   * @returns {Object} 解析后的任务摘要
   */
  parseTaskSummary(taskSummary) {
    if (!taskSummary) {
      return {
        totalTasks: 0,
        tasksByType: {},
        estimatedTotalDuration: 0,
        criticalPath: [],
        riskTasks: []
      }
    }
    
    return {
      totalTasks: parseInt(taskSummary.totalTasks) || 0,
      tasksByType: taskSummary.tasksByType || {},
      estimatedTotalDuration: parseInt(taskSummary.estimatedTotalDuration) || 0,
      criticalPath: Array.isArray(taskSummary.criticalPath) ? taskSummary.criticalPath : [],
      riskTasks: Array.isArray(taskSummary.riskTasks) ? taskSummary.riskTasks : []
    }
  }

  /**
   * 验证和标准化任务数据
   * @param {Array} tasks - 任务数组
   * @returns {Array} 标准化后的任务数组
   */
  validateTasks(tasks) {
    if (!Array.isArray(tasks)) return []
    
    return tasks.map(task => ({
      id: task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: task.name || '未命名任务',
      description: task.description || '',
      type: task.type || 'general',
      priority: this.validatePriority(task.priority),
      estimatedDuration: this.parseNumber(task.estimatedDuration),
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
      deliverables: Array.isArray(task.deliverables) ? task.deliverables : [],
      source: task.source || 'unknown',
      // 技术任务特有字段
      technicalDifficulty: task.technicalDifficulty,
      keyTechnologies: Array.isArray(task.keyTechnologies) ? task.keyTechnologies : [],
      // 里程碑任务特有字段
      plannedDate: task.plannedDate,
      criteria: Array.isArray(task.criteria) ? task.criteria : [],
      // 研究任务特有字段
      researchMethod: task.researchMethod,
      expectedOutcome: task.expectedOutcome,
      // 元数据
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  }

  /**
   * 验证优先级
   * @param {string} priority - 优先级
   * @returns {string} 标准化的优先级
   */
  validatePriority(priority) {
    const validPriorities = ['high', 'medium', 'low']
    return validPriorities.includes(priority) ? priority : 'medium'
  }

  /**
   * 解析数字
   * @param {*} value - 数值
   * @returns {number} 解析后的数字
   */
  parseNumber(value) {
    const num = parseInt(value)
    return isNaN(num) ? 0 : Math.max(0, num)
  }

  /**
   * 将任务按区域分组
   * @param {Object} taskExtraction - 任务提取结果
   * @returns {Object} 按区域分组的任务
   */
  groupTasksBySection(taskExtraction) {
    return {
      implementationPlan: {
        content: '', // 将在后续填充
        tasks: taskExtraction.implementationTasks || []
      },
      technicalRoute: {
        content: '',
        tasks: taskExtraction.technicalTasks || []
      },
      schedule: {
        content: '',
        tasks: taskExtraction.milestoneTasks || []
      },
      keyTechnologies: {
        content: '',
        tasks: taskExtraction.researchTasks || []
      },
      projectOverview: {
        content: '',
        tasks: []
      },
      teamInfo: {
        content: '',
        tasks: []
      },
      expectedBenefits: {
        content: '',
        tasks: []
      }
    }
  }

  /**
   * 生成统计信息
   * @param {Object} taskExtraction - 任务提取结果
   * @param {Object} taskSummary - 任务摘要
   * @returns {Object} 统计信息
   */
  generateStatistics(taskExtraction, taskSummary) {
    const allTasks = [
      ...(taskExtraction.implementationTasks || []),
      ...(taskExtraction.technicalTasks || []),
      ...(taskExtraction.milestoneTasks || []),
      ...(taskExtraction.researchTasks || [])
    ]
    
    return {
      totalTasks: allTasks.length,
      tasksByPriority: this.countByPriority(allTasks),
      tasksByType: this.countByType(allTasks),
      averageDuration: this.calculateAverageDuration(allTasks),
      tasksWithDependencies: allTasks.filter(task => task.dependencies && task.dependencies.length > 0).length,
      tasksWithDeliverables: allTasks.filter(task => task.deliverables && task.deliverables.length > 0).length,
      estimatedTotalDuration: taskSummary.estimatedTotalDuration || 0
    }
  }

  /**
   * 按优先级统计
   * @param {Array} tasks - 任务数组
   * @returns {Object} 优先级统计
   */
  countByPriority(tasks) {
    return tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})
  }

  /**
   * 按类型统计
   * @param {Array} tasks - 任务数组
   * @returns {Object} 类型统计
   */
  countByType(tasks) {
    return tasks.reduce((acc, task) => {
      const type = task.type || 'general'
      acc[type] = (acc[type] || 0) + 1
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
   * 提取项目概况内容
   * @param {Object} result - 解析结果
   * @returns {string} 项目概况内容
   */
  extractProjectOverview(result) {
    const basicInfo = result.basicInfo || {}
    
    const parts = []
    if (basicInfo.projectName) parts.push(`项目名称：${basicInfo.projectName}`)
    if (basicInfo.applicantUnit) parts.push(`申请单位：${basicInfo.applicantUnit}`)
    if (basicInfo.leader) parts.push(`项目负责人：${basicInfo.leader}`)
    if (basicInfo.cooperativeUnit) parts.push(`协作单位：${basicInfo.cooperativeUnit}`)
    if (basicInfo.applicationDate) parts.push(`申报时间：${basicInfo.applicationDate}`)
    
    return parts.length > 0 ? parts.join('\n') : '项目概况信息待完善'
  }

  /**
   * 提取实施方案内容
   * @param {Object} result - 解析结果
   * @returns {string} 实施方案内容
   */
  extractImplementationPlan(result) {
    const implementation = result.researchContent?.implementation
    return implementation?.plan || '实施方案内容待完善'
  }

  /**
   * 提取技术路线内容
   * @param {Object} result - 解析结果
   * @returns {string} 技术路线内容
   */
  extractTechnicalRoute(result) {
    const implementation = result.researchContent?.implementation
    return implementation?.technicalRoute || '技术路线内容待完善'
  }

  /**
   * 提取进度计划内容
   * @param {Object} result - 解析结果
   * @returns {string} 进度计划内容
   */
  extractSchedule(result) {
    const schedule = result.researchContent?.schedule
    return schedule || '进度计划内容待完善'
  }

  /**
   * 提取技术关键内容
   * @param {Object} result - 解析结果
   * @returns {string} 技术关键内容
   */
  extractKeyTechnologies(result) {
    const implementation = result.researchContent?.implementation
    return implementation?.keyTechnologies || '技术关键内容待完善'
  }

  /**
   * 提取团队信息内容
   * @param {Object} result - 解析结果
   * @returns {string} 团队信息内容
   */
  extractTeamInfo(result) {
    // 这里可以根据实际需要从不同字段提取团队信息
    return '团队信息内容待完善'
  }

  /**
   * 提取效益预期内容
   * @param {Object} result - 解析结果
   * @returns {string} 效益预期内容
   */
  extractExpectedBenefits(result) {
    const benefits = result.researchContent?.expectedBenefits
    return benefits || '效益预期内容待完善'
  }
}

/**
 * 默认导出实例
 */
export default new EnhancedDoubaoResultParser()
