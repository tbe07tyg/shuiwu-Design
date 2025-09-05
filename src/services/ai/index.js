import axios from 'axios'

// AI服务配置
const AI_CONFIG = {
  // Deepseek API配置
  DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
  DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  
  // 角色配置
  ROLES: {
    PROJECT_MANAGER: 'project_manager',
    TEAM_MEMBER: 'team_member', 
    MANAGEMENT: 'management'
  },
  
  // 角色提示词模板
  ROLE_PROMPTS: {
    project_manager: `你是一个专业的项目经理AI助手，专门协助项目经理进行项目管理。
    
主要职责：
1. 项目进度监控和风险预警
2. 任务分配和资源优化建议
3. 团队协作和沟通协调
4. 项目决策支持和数据分析
5. 项目文档和报告生成

请根据项目经理的具体需求提供专业、实用的建议和解决方案。`,
    
    team_member: `你是一个专业的团队成员AI助手，专门协助团队成员完成工作任务。
    
主要职责：
1. 任务执行指导和问题解决
2. 工作流程和规范说明
3. 技能提升和学习建议
4. 团队协作和沟通支持
5. 个人绩效和工作总结

请根据团队成员的具体需求提供专业、实用的指导和支持。`,
    
    management: `你是一个专业的管理层AI助手，专门协助管理层进行战略决策和业务管理。
    
主要职责：
1. 战略规划和决策支持
2. 业务分析和趋势预测
3. 绩效评估和优化建议
4. 风险管理和合规指导
5. 资源配置和投资决策

请根据管理层的具体需求提供专业、战略性的建议和决策支持。`
  }
}

// AI服务类
class AIService {
  constructor() {
    this.config = AI_CONFIG
    this.currentRole = AI_CONFIG.ROLES.PROJECT_MANAGER
    this.conversationHistory = []
  }

  // 设置当前角色
  setRole(role) {
    if (this.config.ROLES[role.toUpperCase()]) {
      this.currentRole = this.config.ROLES[role.toUpperCase()]
      return true
    }
    return false
  }

  // 获取角色提示词
  getRolePrompt() {
    return this.config.ROLE_PROMPTS[this.currentRole] || this.config.ROLE_PROMPTS.project_manager
  }

  // 构建对话消息
  buildMessages(userMessage, context = {}) {
    const messages = [
      {
        role: 'system',
        content: this.getRolePrompt()
      }
    ]

    // 添加上下文信息
    if (context.projectInfo) {
      messages.push({
        role: 'system',
        content: `当前项目信息：${JSON.stringify(context.projectInfo)}`
      })
    }

    if (context.userInfo) {
      messages.push({
        role: 'system',
        content: `用户信息：${JSON.stringify(context.userInfo)}`
      })
    }

    // 添加对话历史
    this.conversationHistory.forEach(msg => {
      messages.push(msg)
    })

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: userMessage
    })

    return messages
  }

  // 发送消息到AI
  async sendMessage(message, context = {}) {
    try {
      const messages = this.buildMessages(message, context)
      
      const response = await axios.post(this.config.DEEPSEEK_API_URL, {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const aiResponse = response.data.choices[0].message.content

      // 保存对话历史
      this.conversationHistory.push({
        role: 'user',
        content: message
      })
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      })

      // 限制历史记录长度
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20)
      }

      return {
        success: true,
        message: aiResponse,
        role: this.currentRole
      }
    } catch (error) {
      console.error('AI服务错误:', error)
      return {
        success: false,
        message: '抱歉，AI服务暂时不可用，请稍后重试。',
        error: error.message
      }
    }
  }

  // 获取建议（预设问题）
  async getSuggestions(context = {}) {
    const suggestions = {
      project_manager: [
        '如何优化项目进度？',
        '团队成员绩效如何评估？',
        '项目风险如何识别和应对？',
        '如何提高团队协作效率？',
        '项目预算如何合理分配？'
      ],
      team_member: [
        '如何提高工作效率？',
        '遇到技术问题如何解决？',
        '如何与团队成员更好协作？',
        '如何提升专业技能？',
        '如何平衡工作与学习？'
      ],
      management: [
        '如何制定项目战略？',
        '如何评估项目投资回报？',
        '如何优化资源配置？',
        '如何提升团队整体绩效？',
        '如何应对市场变化？'
      ]
    }

    return suggestions[this.currentRole] || suggestions.project_manager
  }

  // 清除对话历史
  clearHistory() {
    this.conversationHistory = []
  }

  // 获取对话历史
  getHistory() {
    return this.conversationHistory
  }
}

// 创建AI服务实例
const aiService = new AIService()

export default aiService
export { AI_CONFIG } 