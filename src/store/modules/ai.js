import { defineStore } from 'pinia'
import aiService from '@/services/ai'

export const useAIStore = defineStore('ai', {
  state: () => ({
    // 对话相关
    conversationHistory: [],
    currentMessage: '',
    isLoading: false,
    
    // 角色相关
    currentRole: 'project_manager',
    availableRoles: [
      { key: 'project_manager', label: '项目经理', icon: '👨‍💼' },
      { key: 'team_member', label: '团队成员', icon: '👥' },
      { key: 'management', label: '管理层', icon: '🏢' }
    ],
    
    // 设置相关
    settings: {
      autoSave: true,
      maxHistoryLength: 50,
      enableVoice: false,
      enableSuggestions: true
    },
    
    // 建议相关
    suggestions: [],
    
    // 错误信息
    errorMessage: ''
  }),

  getters: {
    // 获取当前角色信息
    currentRoleInfo: (state) => {
      return state.availableRoles.find(role => role.key === state.currentRole)
    },
    
    // 获取对话历史（限制长度）
    limitedHistory: (state) => {
      return state.conversationHistory.slice(-state.settings.maxHistoryLength)
    },
    
    // 是否有未读消息
    hasUnreadMessages: (state) => {
      return state.conversationHistory.some(msg => !msg.read)
    }
  },

  actions: {
    // 设置当前角色
    setRole(role) {
      if (aiService.setRole(role)) {
        this.currentRole = role
        this.loadSuggestions()
        this.clearHistory()
        return true
      }
      return false
    },

    // 发送消息
    async sendMessage(message, context = {}) {
      if (!message.trim()) return
      
      this.isLoading = true
      this.errorMessage = ''
      
      // 添加用户消息到历史
      this.addMessage({
        role: 'user',
        content: message,
        timestamp: new Date(),
        read: true
      })
      
      try {
        const response = await aiService.sendMessage(message, context)
        
        if (response.success) {
          // 添加AI回复到历史
          this.addMessage({
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
            read: false
          })
        } else {
          this.errorMessage = response.message
        }
      } catch (error) {
        this.errorMessage = '发送消息失败，请稍后重试'
        console.error('AI消息发送错误:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 添加消息到历史
    addMessage(message) {
      this.conversationHistory.push(message)
      
      // 限制历史记录长度
      if (this.conversationHistory.length > this.settings.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.settings.maxHistoryLength)
      }
    },

    // 清除对话历史
    clearHistory() {
      this.conversationHistory = []
      aiService.clearHistory()
    },

    // 加载建议
    async loadSuggestions() {
      try {
        this.suggestions = await aiService.getSuggestions()
      } catch (error) {
        console.error('加载建议失败:', error)
        this.suggestions = []
      }
    },

    // 标记消息为已读
    markAsRead(messageIndex) {
      if (this.conversationHistory[messageIndex]) {
        this.conversationHistory[messageIndex].read = true
      }
    },

    // 标记所有消息为已读
    markAllAsRead() {
      this.conversationHistory.forEach(msg => {
        msg.read = true
      })
    },

    // 更新设置
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
    },

    // 导出对话历史
    exportHistory() {
      const history = this.conversationHistory.map(msg => ({
        role: msg.role === 'user' ? '用户' : 'AI助手',
        content: msg.content,
        timestamp: msg.timestamp
      }))
      
      const blob = new Blob([JSON.stringify(history, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AI对话历史_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    },

    // 导入对话历史
    importHistory(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const history = JSON.parse(e.target.result)
            this.conversationHistory = history.map(msg => ({
              ...msg,
              role: msg.role === '用户' ? 'user' : 'assistant',
              read: true
            }))
            resolve(true)
          } catch (error) {
            reject(new Error('文件格式错误'))
          }
        }
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsText(file)
      })
    },

    // 获取对话统计
    getConversationStats() {
      const totalMessages = this.conversationHistory.length
      const userMessages = this.conversationHistory.filter(msg => msg.role === 'user').length
      const aiMessages = this.conversationHistory.filter(msg => msg.role === 'assistant').length
      
      return {
        totalMessages,
        userMessages,
        aiMessages,
        averageResponseTime: this.calculateAverageResponseTime()
      }
    },

    // 计算平均响应时间
    calculateAverageResponseTime() {
      const aiMessages = this.conversationHistory.filter(msg => msg.role === 'assistant')
      if (aiMessages.length === 0) return 0
      
      let totalTime = 0
      let count = 0
      
      for (let i = 1; i < this.conversationHistory.length; i++) {
        const current = this.conversationHistory[i]
        const previous = this.conversationHistory[i - 1]
        
        if (current.role === 'assistant' && previous.role === 'user') {
          const responseTime = current.timestamp - previous.timestamp
          totalTime += responseTime
          count++
        }
      }
      
      return count > 0 ? totalTime / count : 0
    },

    // 搜索对话历史
    searchHistory(keyword) {
      if (!keyword.trim()) return this.conversationHistory
      
      return this.conversationHistory.filter(msg => 
        msg.content.toLowerCase().includes(keyword.toLowerCase())
      )
    },

    // 重置状态
    reset() {
      this.conversationHistory = []
      this.currentMessage = ''
      this.isLoading = false
      this.errorMessage = ''
      this.suggestions = []
      aiService.clearHistory()
    }
  }
}) 