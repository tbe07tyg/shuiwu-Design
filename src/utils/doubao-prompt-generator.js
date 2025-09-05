/**
 * @file 豆包提示词生成器
 * @description 生成包含任务提取功能的增强版豆包提示词
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-29
 */

/**
 * 增强版豆包提示词生成器
 */
export class EnhancedDoubaoPromptGenerator {
  constructor() {
    this.baseTemplate = this.createBaseTemplate()
  }

  /**
   * 生成包含任务提取的完整提示词
   * @param {string} documentContent - 申报书内容
   * @returns {string} 增强版提示词
   */
  generateEnhancedPrompt(documentContent) {
    return this.baseTemplate.replace('{申报书完整内容}', documentContent)
  }

  /**
   * 创建基础提示词模板
   * @returns {string} 提示词模板
   */
  createBaseTemplate() {
    return `请解析以下研发项目申请书内容，提取关键信息并进行智能任务拆解，以JSON格式返回：

【申报书内容】
{申报书完整内容}

【解析要求】
请按照以下JSON结构提取信息并智能拆解项目任务：

\`\`\`json
{
  "basicInfo": {
    "projectName": "项目名称",
    "applicantUnit": "申请单位",
    "leader": "项目负责人",
    "cooperativeUnit": "协作单位（如有）",
    "applicationDate": "申报时间"
  },
  "researchContent": {
    "basisAndSignificance": "申请项目的依据和意义",
    "implementation": {
      "plan": "从'一、实施方案'部分提取",
      "keyTechnologies": "从'二、技术关键'部分提取",
      "technicalRoute": "从'三、技术路线'部分提取",
      "expectedResults": "从'四、预期成果'部分提取"
    },
    "existingConditions": "从'实施本项目已具备的条件'部分提取",
    "expectedBenefits": "从'项目实施的经济、社会和环境预期效益'部分提取",
    "schedule": "从'项目实施的计划进度'部分提取"
  },
  "taskExtraction": {
    "implementationTasks": [
      {
        "id": "impl_001",
        "name": "任务名称",
        "description": "详细描述",
        "type": "implementation",
        "priority": "high|medium|low",
        "estimatedDuration": "预估工期（天）",
        "dependencies": ["依赖的其他任务ID"],
        "deliverables": ["交付物1", "交付物2"],
        "source": "实施方案"
      }
    ],
    "technicalTasks": [
      {
        "id": "tech_001",
        "name": "技术任务名称",
        "description": "技术任务详细描述",
        "type": "technical",
        "priority": "high|medium|low",
        "estimatedDuration": "预估工期（天）",
        "dependencies": ["依赖的其他任务ID"],
        "technicalDifficulty": "high|medium|low",
        "keyTechnologies": ["关键技术1", "关键技术2"],
        "source": "技术路线"
      }
    ],
    "milestoneTasks": [
      {
        "id": "mile_001",
        "name": "里程碑名称",
        "description": "里程碑描述",
        "type": "milestone",
        "priority": "high",
        "plannedDate": "计划完成日期",
        "dependencies": ["依赖的任务ID"],
        "criteria": ["验收标准1", "验收标准2"],
        "source": "进度计划"
      }
    ],
    "researchTasks": [
      {
        "id": "research_001",
        "name": "研究任务名称",
        "description": "研究任务描述",
        "type": "research",
        "priority": "medium|high",
        "estimatedDuration": "预估工期（天）",
        "researchMethod": "研究方法",
        "expectedOutcome": "预期成果",
        "source": "技术关键"
      }
    ]
  },
  "taskSummary": {
    "totalTasks": "任务总数",
    "tasksByType": {
      "implementation": "实施任务数量",
      "technical": "技术任务数量",
      "milestone": "里程碑数量",
      "research": "研究任务数量"
    },
    "estimatedTotalDuration": "项目总工期（天）",
    "criticalPath": ["关键路径上的任务ID"],
    "riskTasks": ["高风险任务ID"]
  }
}
\`\`\`

【任务提取指南】
1. **实施任务**：从实施方案中识别具体的工作包、开发任务、建设任务
2. **技术任务**：从技术路线中提取技术攻关、算法开发、系统集成等技术性工作
3. **里程碑任务**：从进度计划中识别关键节点、阶段性目标、验收点
4. **研究任务**：从技术关键中提取需要深入研究的理论问题、技术难点

【任务拆解原则】
- 每个任务应该是可执行的具体工作
- 任务粒度适中（1-30天工期）
- 明确任务间的依赖关系
- 识别关键路径和风险点
- 为每个任务指定优先级和类型

【特别注意】
1. 任务ID使用前缀区分类型（impl_、tech_、mile_、research_）
2. 依赖关系要准确，形成合理的任务网络
3. 优先级要基于项目目标和技术难度综合判断
4. 交付物要具体明确，便于后续验收
5. 如果某个部分内容不足以提取任务，请设置为空数组[]
6. 请确保返回的是有效的JSON格式，不要包含任何额外的文字说明`
  }

  /**
   * 生成简化版提示词（仅基础解析）
   * @param {string} documentContent - 申报书内容
   * @returns {string} 简化版提示词
   */
  generateBasicPrompt(documentContent) {
    return `请解析以下研发项目申请书内容，提取关键信息并以JSON格式返回：

【申报书内容】
${documentContent}

【解析要求】
请按照以下JSON结构提取信息：

\`\`\`json
{
  "basicInfo": {
    "projectName": "项目名称",
    "applicantUnit": "申请单位",
    "leader": "项目负责人",
    "cooperativeUnit": "协作单位（如有）",
    "applicationDate": "申报时间"
  },
  "researchContent": {
    "basisAndSignificance": "申请项目的依据和意义",
    "implementation": {
      "plan": "从'一、实施方案'部分提取",
      "keyTechnologies": "从'二、技术关键'部分提取",
      "technicalRoute": "从'三、技术路线'部分提取",
      "expectedResults": "从'四、预期成果'部分提取"
    },
    "existingConditions": "从'实施本项目已具备的条件'部分提取",
    "expectedBenefits": "从'项目实施的经济、社会和环境预期效益'部分提取",
    "schedule": "从'项目实施的计划进度'部分提取"
  }
}
\`\`\`

【注意事项】
1. 如果某个字段在文档中找不到对应信息，请设置为null
2. 确保返回的是有效的JSON格式
3. 请仔细阅读文档内容，准确提取信息`
  }

  /**
   * 生成任务提取专用提示词
   * @param {Object} basicResult - 基础解析结果
   * @returns {string} 任务提取提示词
   */
  generateTaskExtractionPrompt(basicResult) {
    return `基于以下已解析的申报书内容，请智能提取和拆解项目任务：

【已解析内容】
${JSON.stringify(basicResult, null, 2)}

【任务提取要求】
请按照以下结构提取项目任务：

\`\`\`json
{
  "taskExtraction": {
    "implementationTasks": [
      {
        "id": "impl_001",
        "name": "任务名称",
        "description": "详细描述",
        "type": "implementation",
        "priority": "high|medium|low",
        "estimatedDuration": "预估工期（天）",
        "dependencies": ["依赖的其他任务ID"],
        "deliverables": ["交付物1", "交付物2"],
        "source": "实施方案"
      }
    ],
    "technicalTasks": [...],
    "milestoneTasks": [...],
    "researchTasks": [...]
  },
  "taskSummary": {
    "totalTasks": "任务总数",
    "tasksByType": {
      "implementation": "实施任务数量",
      "technical": "技术任务数量",
      "milestone": "里程碑数量",
      "research": "研究任务数量"
    },
    "estimatedTotalDuration": "项目总工期（天）",
    "criticalPath": ["关键路径上的任务ID"],
    "riskTasks": ["高风险任务ID"]
  }
}
\`\`\`

【任务拆解重点】
1. 从实施方案中提取具体的工作包和开发任务
2. 从技术路线中识别技术攻关和系统集成任务
3. 从进度计划中提取里程碑和关键节点
4. 从技术关键中识别研究和攻关任务
5. 建立合理的任务依赖关系网络
6. 评估任务优先级和技术难度`
  }

  /**
   * 获取提示词统计信息
   * @param {string} prompt - 提示词内容
   * @returns {Object} 统计信息
   */
  getPromptStats(prompt) {
    return {
      characterCount: prompt.length,
      wordCount: prompt.split(/\s+/).length,
      lineCount: prompt.split('\n').length,
      estimatedTokens: Math.ceil(prompt.length / 4), // 粗略估算
      estimatedProcessingTime: Math.ceil(prompt.length / 1000) // 秒
    }
  }

  /**
   * 验证提示词格式
   * @param {string} prompt - 提示词内容
   * @returns {Object} 验证结果
   */
  validatePrompt(prompt) {
    const issues = []
    
    // 检查必要的占位符
    if (!prompt.includes('{申报书完整内容}') && !prompt.includes('【申报书内容】')) {
      issues.push('缺少申报书内容占位符')
    }
    
    // 检查JSON结构标记
    if (!prompt.includes('```json')) {
      issues.push('缺少JSON格式标记')
    }
    
    // 检查关键字段
    const requiredFields = ['basicInfo', 'researchContent', 'taskExtraction']
    requiredFields.forEach(field => {
      if (!prompt.includes(field)) {
        issues.push(`缺少必要字段: ${field}`)
      }
    })
    
    return {
      valid: issues.length === 0,
      issues,
      score: Math.max(0, 100 - issues.length * 20)
    }
  }

  /**
   * 优化提示词
   * @param {string} prompt - 原始提示词
   * @param {Object} options - 优化选项
   * @returns {string} 优化后的提示词
   */
  optimizePrompt(prompt, options = {}) {
    let optimized = prompt
    
    // 添加强调标记
    if (options.emphasizeTaskExtraction) {
      optimized = optimized.replace(
        '【任务提取指南】',
        '【🎯 重点：任务提取指南】'
      )
    }
    
    // 添加示例
    if (options.includeExamples) {
      const examples = this.getTaskExamples()
      optimized = optimized.replace(
        '【特别注意】',
        `【任务示例】\n${examples}\n\n【特别注意】`
      )
    }
    
    // 简化语言
    if (options.simplifyLanguage) {
      optimized = optimized
        .replace(/请按照以下JSON结构/g, '按以下格式')
        .replace(/详细描述/g, '简要说明')
    }
    
    return optimized
  }

  /**
   * 获取任务示例
   * @returns {string} 任务示例
   */
  getTaskExamples() {
    return `实施任务示例：
- "需求分析和系统设计"（15天，交付物：需求文档、设计方案）
- "数据库设计与实现"（10天，依赖：系统设计）

技术任务示例：
- "核心算法研发"（30天，难度：高，技术：机器学习）
- "API接口开发"（20天，依赖：数据库实现）

里程碑示例：
- "原型系统完成"（验收标准：功能演示通过）
- "系统测试完成"（验收标准：性能指标达标）`
  }
}

/**
 * 默认导出实例
 */
export default new EnhancedDoubaoPromptGenerator()
