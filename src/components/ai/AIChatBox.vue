<template>
  <div class="ai-chat-box">
    <!-- 头部区域 -->
    <div class="chat-header">
      <div class="header-left">
        <h3>AI助手</h3>
        <a-tag :color="getRoleColor()">{{ currentRoleInfo?.label }}</a-tag>
      </div>
      <div class="header-right">
        <a-button-group>
          <a-button size="small" @click="showSettings = true">
            <SettingOutlined />
          </a-button>
          <a-button size="small" @click="clearHistory">
            <DeleteOutlined />
          </a-button>
        </a-button-group>
      </div>
    </div>

    <!-- 角色切换 -->
    <div class="role-selector">
      <a-radio-group v-model:value="currentRole" @change="handleRoleChange">
        <a-radio-button 
          v-for="role in availableRoles" 
          :key="role.key" 
          :value="role.key"
        >
          <span class="role-icon">{{ role.icon }}</span>
          {{ role.label }}
        </a-radio-button>
      </a-radio-group>
    </div>

    <!-- 对话区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in limitedHistory" 
        :key="index"
        :class="['message', message.role]"
        @click="markAsRead(index)"
      >
        <div class="message-avatar">
          <a-avatar :size="32">
            <template #icon>
              <UserOutlined v-if="message.role === 'user'" />
              <RobotOutlined v-else />
            </template>
          </a-avatar>
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(message.content)"></div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="message assistant">
        <div class="message-avatar">
          <a-avatar :size="32">
            <template #icon>
              <RobotOutlined />
            </template>
          </a-avatar>
        </div>
        <div class="message-content">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 建议区域 -->
    <div v-if="settings.enableSuggestions && suggestions.length > 0" class="suggestions">
      <div class="suggestions-title">💡 建议问题</div>
      <div class="suggestions-list">
        <a-tag 
          v-for="suggestion in suggestions" 
          :key="suggestion"
          class="suggestion-tag"
          @click="sendSuggestion(suggestion)"
        >
          {{ suggestion }}
        </a-tag>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <div class="input-wrapper">
        <a-textarea
          v-model:value="currentMessage"
          placeholder="请输入您的问题..."
          :rows="3"
          :disabled="isLoading"
          @keydown.enter.prevent="handleSend"
          @keydown.ctrl.enter="handleSend"
        />
        <div class="input-actions">
          <a-button 
            type="primary" 
            :loading="isLoading"
            @click="handleSend"
          >
            发送
          </a-button>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <a-modal
      v-model:open="showSettings"
      title="AI助手设置"
      width="500px"
      @ok="saveSettings"
    >
      <a-form :model="settings" layout="vertical">
        <a-form-item label="自动保存对话">
          <a-switch v-model:checked="settings.autoSave" />
        </a-form-item>
        <a-form-item label="最大历史记录数">
          <a-input-number 
            v-model:value="settings.maxHistoryLength" 
            :min="10" 
            :max="100" 
          />
        </a-form-item>
        <a-form-item label="启用语音功能">
          <a-switch v-model:checked="settings.enableVoice" />
        </a-form-item>
        <a-form-item label="显示建议问题">
          <a-switch v-model:checked="settings.enableSuggestions" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 错误提示 -->
    <a-modal
      v-model:open="showError"
      title="错误提示"
      @ok="showError = false"
    >
      <p>{{ errorMessage }}</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { 
  SettingOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  RobotOutlined 
} from '@ant-design/icons-vue'
import { useAIStore } from '@/store/modules/ai'
import { message } from 'ant-design-vue'

// 使用AI Store
const aiStore = useAIStore()

// 响应式数据
const showSettings = ref(false)
const showError = ref(false)
const messagesContainer = ref(null)

// 计算属性
const currentRole = computed({
  get: () => aiStore.currentRole,
  set: (value) => aiStore.setRole(value)
})

const currentRoleInfo = computed(() => aiStore.currentRoleInfo)
const availableRoles = computed(() => aiStore.availableRoles)
const limitedHistory = computed(() => aiStore.limitedHistory)
const isLoading = computed(() => aiStore.isLoading)
const settings = computed(() => aiStore.settings)
const suggestions = computed(() => aiStore.suggestions)
const errorMessage = computed(() => aiStore.errorMessage)

// 当前消息
const currentMessage = ref('')

// 监听错误信息
watch(errorMessage, (newError) => {
  if (newError) {
    showError.value = true
  }
})

// 监听对话历史变化，自动滚动到底部
watch(limitedHistory, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 方法
const handleRoleChange = (e) => {
  const role = e.target.value
  if (aiStore.setRole(role)) {
    message.success(`已切换到${aiStore.currentRoleInfo?.label}模式`)
  }
}

const handleSend = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return
  
  const message = currentMessage.value
  currentMessage.value = ''
  
  await aiStore.sendMessage(message)
}

const sendSuggestion = async (suggestion) => {
  currentMessage.value = suggestion
  await handleSend()
}

const clearHistory = () => {
  aiStore.clearHistory()
  message.success('对话历史已清除')
}

const markAsRead = (index) => {
  aiStore.markAsRead(index)
}

const saveSettings = () => {
  aiStore.updateSettings(settings.value)
  showSettings.value = false
  message.success('设置已保存')
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatMessage = (content) => {
  // 简单的消息格式化，支持换行和链接
  return content
    .replace(/\n/g, '<br>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getRoleColor = () => {
  const colors = {
    project_manager: 'blue',
    team_member: 'green',
    management: 'purple'
  }
  return colors[currentRole.value] || 'blue'
}

// 初始化
aiStore.loadSuggestions()
</script>

<style scoped>
.ai-chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  color: #234fa2;
}

.role-selector {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.role-icon {
  margin-right: 4px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
}

.message {
  display: flex;
  margin-bottom: 16px;
  gap: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.message.user .message-content {
  align-items: flex-end;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
  line-height: 1.5;
}

.message.user .message-text {
  background: #234fa2;
  color: white;
}

.message.assistant .message-text {
  background: white;
  color: #333;
  border: 1px solid #e8e8e8;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.loading-dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  animation: loading 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.suggestions {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.suggestions-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-tag:hover {
  background: #234fa2;
  color: white;
}

.chat-input {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-wrapper .ant-input {
  flex: 1;
}

.input-actions {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-header {
    padding: 12px 16px;
  }
  
  .role-selector {
    padding: 8px 16px;
  }
  
  .chat-messages {
    padding: 16px;
  }
  
  .suggestions {
    padding: 12px 16px;
  }
  
  .chat-input {
    padding: 12px 16px;
  }
  
  .message-content {
    max-width: 85%;
  }
}
</style> 