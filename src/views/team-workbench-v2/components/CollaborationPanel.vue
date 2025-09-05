<!--
 * @file 协作交流面板组件
 * @description 团队协作和沟通交流
-->
<template>
  <a-card class="collaboration-card" title="💬 协作交流">
    <template #extra>
      <a-badge :count="unreadCount" :offset="[10, 0]">
        <a-button type="primary" size="small" @click="handleNewMessage">
          <MessageOutlined />
          发消息
        </a-button>
      </a-badge>
    </template>

    <div class="collaboration-content">
      <!-- 团队成员状态 -->
      <div class="team-status">
        <h4>团队成员</h4>
        <div class="members-list">
          <div 
            v-for="member in teamMembers" 
            :key="member.id"
            class="member-item"
            @click="handleChatWithMember(member)"
          >
            <a-avatar :size="32" :style="{ backgroundColor: getMemberColor(member.id) }">
              {{ member.name.charAt(0) }}
            </a-avatar>
            <div class="member-info">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-role">{{ member.role }}</div>
            </div>
            <div class="member-status">
              <a-badge 
                :status="getStatusType(member.status)" 
                :text="getStatusText(member.status)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="messages-section">
        <div class="section-header">
          <h4>最新消息</h4>
          <a-button size="small" type="text" @click="handleViewAllMessages">
            查看全部
            <ArrowRightOutlined />
          </a-button>
        </div>

        <div class="messages-list">
          <div 
            v-for="message in recentMessages" 
            :key="message.id"
            class="message-item"
            :class="getMessageStatusClass(message.status)"
            @click="handleViewMessage(message)"
          >
            <div class="message-header">
              <div class="message-info">
                <div class="message-from">{{ message.from }}</div>
                <div class="message-type">
                  <a-tag :color="getMessageTypeColor(message.type)" size="small">
                    {{ getMessageTypeText(message.type) }}
                  </a-tag>
                </div>
              </div>
              <div class="message-time">{{ formatTime(message.time) }}</div>
            </div>

            <div class="message-title">{{ message.title }}</div>
            <div class="message-content">{{ message.content }}</div>

            <div class="message-actions">
              <a-button size="small" type="text" @click.stop="handleReplyMessage(message)">
                <MessageOutlined />
                回复
              </a-button>
              <a-button 
                v-if="message.status === 'unread'"
                size="small" 
                type="text" 
                @click.stop="handleMarkRead(message)"
              >
                <CheckOutlined />
                标记已读
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <h4>快速操作</h4>
        <div class="actions-grid">
          <a-button 
            class="action-btn"
            @click="handleRequestHelp"
          >
            <QuestionCircleOutlined />
            请求帮助
          </a-button>
          <a-button 
            class="action-btn"
            @click="handleScheduleMeeting"
          >
            <CalendarOutlined />
            安排会议
          </a-button>
          <a-button 
            class="action-btn"
            @click="handleShareProgress"
          >
            <ShareAltOutlined />
            分享进展
          </a-button>
          <a-button 
            class="action-btn"
            @click="handleFeedback"
          >
            <CommentOutlined />
            意见反馈
          </a-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="empty-state">
        <a-empty description="暂无消息">
          <a-button type="primary" @click="handleNewMessage">
            发送第一条消息
          </a-button>
        </a-empty>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import { 
  MessageOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  ShareAltOutlined,
  CommentOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  teamMembers: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['send-message', 'request-help'])

// 计算属性
const unreadCount = computed(() => {
  return props.messages.filter(msg => msg.status === 'unread').length
})

const recentMessages = computed(() => {
  return props.messages
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5)
})

// 方法
const handleNewMessage = () => {
  message.info('打开消息编辑器')
}

const handleChatWithMember = (member) => {
  message.info(`与 ${member.name} 开始对话`)
}

const handleViewAllMessages = () => {
  message.info('查看所有消息')
}

const handleViewMessage = (msg) => {
  message.info(`查看消息：${msg.title}`)
}

const handleReplyMessage = (msg) => {
  message.info(`回复消息：${msg.title}`)
}

const handleMarkRead = (msg) => {
  msg.status = 'read'
  message.success('已标记为已读')
}

const handleRequestHelp = () => {
  emit('request-help', { type: 'general' })
}

const handleScheduleMeeting = () => {
  message.info('安排会议')
}

const handleShareProgress = () => {
  message.info('分享工作进展')
}

const handleFeedback = () => {
  message.info('提交意见反馈')
}

// 工具方法
const getMemberColor = (memberId) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96']
  const index = memberId.charCodeAt(memberId.length - 1) % colors.length
  return colors[index]
}

const getStatusType = (status) => {
  const typeMap = {
    'online': 'success',
    'busy': 'warning',
    'offline': 'default'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'online': '在线',
    'busy': '忙碌',
    'offline': '离线'
  }
  return textMap[status] || status
}

const getMessageStatusClass = (status) => {
  return `message-${status}`
}

const getMessageTypeColor = (type) => {
  const colorMap = {
    'review_feedback': 'blue',
    'collaboration': 'green',
    'notification': 'orange',
    'meeting': 'purple'
  }
  return colorMap[type] || 'default'
}

const getMessageTypeText = (type) => {
  const textMap = {
    'review_feedback': '审查反馈',
    'collaboration': '协作消息',
    'notification': '系统通知',
    'meeting': '会议通知'
  }
  return textMap[type] || type
}

const formatTime = (timeString) => {
  if (!timeString) return '-'
  const time = new Date(timeString)
  const now = new Date()
  const diffHours = Math.floor((now - time) / (1000 * 60 * 60))
  
  if (diffHours < 1) {
    return '刚刚'
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else {
    return time.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.collaboration-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.collaboration-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.collaboration-content h4 {
  color: #234fa2;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.team-status {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.member-item:hover {
  background: #e6f7ff;
  transform: translateY(-1px);
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
}

.member-role {
  color: #8c8c8c;
  font-size: 12px;
}

.member-status {
  font-size: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s;
}

.message-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

.message-item.message-unread {
  border-left-color: #1890ff;
  background: #e6f7ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.message-info {
  flex: 1;
}

.message-from {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
  margin-bottom: 2px;
}

.message-type {
  display: flex;
  gap: 4px;
}

.message-time {
  color: #8c8c8c;
  font-size: 12px;
}

.message-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
  margin-bottom: 4px;
}

.message-content {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.quick-actions {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: auto;
  padding: 12px 8px;
  font-size: 12px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* 响应式 */
@media (max-width: 768px) {
  .message-header {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-btn {
    flex-direction: row;
    justify-content: flex-start;
  }
}
</style>

