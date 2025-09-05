<!--
 * @file 成果提交面板组件
 * @description 管理阶段性成果的提交和状态跟踪
-->
<template>
  <a-card class="achievement-submission-card" title="📊 成果提交">
    <template #extra>
      <a-badge :count="pendingAchievements.length" :offset="[10, 0]">
        <a-button type="primary" size="small" @click="handleQuickSubmit">
          <SendOutlined />
          快速提交
        </a-button>
      </a-badge>
    </template>

    <div class="submission-content">
      <!-- 提交统计 -->
      <div class="submission-stats">
        <div class="stat-item">
          <div class="stat-number">{{ getSubmissionCount('approved') }}</div>
          <div class="stat-label">已通过</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ getSubmissionCount('under_review') }}</div>
          <div class="stat-label">审查中</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ pendingAchievements.length }}</div>
          <div class="stat-label">待提交</div>
        </div>
      </div>

      <!-- 待提交成果 -->
      <div v-if="pendingAchievements.length > 0" class="pending-achievements">
        <h4>待提交成果</h4>
        <div class="pending-list">
          <div 
            v-for="achievement in pendingAchievements" 
            :key="achievement.id"
            class="pending-item"
            :class="getUrgencyClass(achievement.deadline)"
          >
            <div class="pending-header">
              <div class="pending-info">
                <div class="pending-title">{{ achievement.title }}</div>
                <div class="pending-description">{{ achievement.description }}</div>
              </div>
              <div class="pending-actions">
                <a-button 
                  type="primary" 
                  size="small" 
                  @click="handleSubmitAchievement(achievement)"
                >
                  立即提交
                </a-button>
              </div>
            </div>
            <div class="pending-details">
              <div class="detail-item">
                <CalendarOutlined />
                <span>截止：{{ formatDate(achievement.deadline) }}</span>
                <span v-if="isUrgent(achievement.deadline)" class="urgent-warning">紧急</span>
              </div>
              <div class="detail-item">
                <FileTextOutlined />
                <span>类型：{{ getTypeText(achievement.type) }}</span>
              </div>
              <div class="detail-item">
                <LinkOutlined />
                <span>关联任务：{{ getTaskTitle(achievement.taskId) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 提交历史 -->
      <div class="submission-history">
        <div class="section-header">
          <h4>提交历史</h4>
          <a-select 
            v-model:value="historyFilter" 
            size="small" 
            style="width: 100px"
            @change="handleHistoryFilter"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="under_review">审查中</a-select-option>
            <a-select-option value="revision_required">需修改</a-select-option>
          </a-select>
        </div>

        <div class="history-list">
          <div 
            v-for="submission in filteredSubmissions" 
            :key="submission.id"
            class="submission-item"
            :class="getSubmissionStatusClass(submission.status)"
          >
            <div class="submission-header">
              <div class="submission-info">
                <div class="submission-title">{{ submission.title }}</div>
                <div class="submission-summary">{{ submission.summary }}</div>
              </div>
              <div class="submission-status">
                <component :is="getStatusIcon(submission.status)" />
                <span>{{ getStatusText(submission.status) }}</span>
              </div>
            </div>

            <div class="submission-details">
              <div class="detail-item">
                <ClockCircleOutlined />
                <span>提交时间：{{ formatTime(submission.submittedTime) }}</span>
              </div>
              <div v-if="submission.reviewTime" class="detail-item">
                <CheckCircleOutlined />
                <span>审查时间：{{ formatTime(submission.reviewTime) }}</span>
              </div>
              <div v-if="submission.reviewer" class="detail-item">
                <UserOutlined />
                <span>审查人：{{ submission.reviewer }}</span>
              </div>
              <div class="detail-item">
                <TagOutlined />
                <span>类型：{{ getTypeText(submission.type) }}</span>
              </div>
            </div>

            <div v-if="submission.rating" class="submission-rating">
              <span class="rating-label">评价：</span>
              <a-rate 
                :value="getRatingValue(submission.rating)" 
                disabled 
                :count="3" 
                style="font-size: 14px;"
              />
              <span class="rating-text">{{ getRatingText(submission.rating) }}</span>
            </div>

            <div class="submission-actions">
              <a-button size="small" type="text" @click="handleViewSubmission(submission)">
                <EyeOutlined />
                查看详情
              </a-button>
              <a-button 
                v-if="submission.status === 'revision_required'"
                size="small" 
                type="text" 
                @click="handleResubmit(submission)"
              >
                <EditOutlined />
                重新提交
              </a-button>
              <a-button size="small" type="text" @click="handleDownloadSubmission(submission)">
                <DownloadOutlined />
                下载
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="submissions.length === 0 && pendingAchievements.length === 0" class="empty-state">
        <a-empty description="暂无成果提交">
          <a-button type="primary" @click="handleQuickSubmit">
            <SendOutlined />
            提交第一个成果
          </a-button>
        </a-empty>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button @click="handleExportSubmissions">
          <ExportOutlined />
          导出记录
        </a-button>
        <a-button @click="handleSubmissionStatistics">
          <BarChartOutlined />
          提交统计
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  SendOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TagOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  ExportOutlined,
  BarChartOutlined,
  SyncOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  submissions: {
    type: Array,
    default: () => []
  },
  pendingAchievements: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['submit-achievement', 'view-submission'])

// 响应式数据
const historyFilter = ref('all')

// 计算属性
const filteredSubmissions = computed(() => {
  if (historyFilter.value === 'all') {
    return props.submissions.sort((a, b) => new Date(b.submittedTime) - new Date(a.submittedTime))
  }
  return props.submissions
    .filter(submission => submission.status === historyFilter.value)
    .sort((a, b) => new Date(b.submittedTime) - new Date(a.submittedTime))
})

// 方法
const handleQuickSubmit = () => {
  if (props.pendingAchievements.length > 0) {
    handleSubmitAchievement(props.pendingAchievements[0])
  } else {
    message.info('暂无待提交的成果')
  }
}

const handleSubmitAchievement = (achievement) => {
  emit('submit-achievement', achievement)
}

const handleViewSubmission = (submission) => {
  emit('view-submission', submission)
}

const handleHistoryFilter = () => {
  console.log('历史筛选:', historyFilter.value)
}

const handleResubmit = (submission) => {
  message.info(`重新提交：${submission.title}`)
}

const handleDownloadSubmission = (submission) => {
  message.success(`下载成果：${submission.title}`)
}

const handleExportSubmissions = () => {
  message.success('提交记录导出成功')
}

const handleSubmissionStatistics = () => {
  message.info('查看提交统计')
}

// 工具方法
const getSubmissionCount = (status) => {
  return props.submissions.filter(submission => submission.status === status).length
}

const getUrgencyClass = (deadline) => {
  if (isUrgent(deadline)) {
    return 'urgent'
  }
  return ''
}

const getSubmissionStatusClass = (status) => {
  return `submission-${status}`
}

const getStatusIcon = (status) => {
  const iconMap = {
    'approved': CheckCircleOutlined,
    'under_review': SyncOutlined,
    'revision_required': ExclamationCircleOutlined,
    'rejected': ExclamationCircleOutlined
  }
  return iconMap[status] || SyncOutlined
}

const getStatusText = (status) => {
  const textMap = {
    'approved': '已通过',
    'under_review': '审查中',
    'revision_required': '需修改',
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}

const getTypeText = (type) => {
  const textMap = {
    'document': '文档',
    'report': '报告',
    'summary': '总结',
    'code': '代码',
    'presentation': '演示'
  }
  return textMap[type] || type
}

const getRatingValue = (rating) => {
  const ratingMap = {
    'excellent': 3,
    'good': 2,
    'fair': 1,
    'poor': 0
  }
  return ratingMap[rating] || 0
}

const getRatingText = (rating) => {
  const textMap = {
    'excellent': '优秀',
    'good': '良好',
    'fair': '一般',
    'poor': '较差'
  }
  return textMap[rating] || rating
}

const getTaskTitle = (taskId) => {
  const taskMap = {
    'T001': '系统架构设计',
    'T002': '前端界面开发',
    'T003': '接口联调测试'
  }
  return taskMap[taskId] || '未知任务'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatTime = (timeString) => {
  if (!timeString) return '-'
  return new Date(timeString).toLocaleString('zh-CN')
}

const isUrgent = (deadline) => {
  if (!deadline) return false
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
  return diffDays <= 3 && diffDays >= 0
}
</script>

<style scoped>
.achievement-submission-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.submission-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.submission-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.stat-item {
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #e6f7ff;
  transform: translateY(-1px);
}

.stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

.pending-achievements h4 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.pending-item {
  background: #fff7e6;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #faad14;
  transition: all 0.3s;
}

.pending-item.urgent {
  background: #fff2f0;
  border-left-color: #ff4d4f;
}

.pending-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pending-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.pending-info {
  flex: 1;
}

.pending-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
  margin-bottom: 4px;
}

.pending-description {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.pending-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;
  font-size: 12px;
}

.urgent-warning {
  color: #ff4d4f !important;
  font-weight: 600;
  margin-left: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  color: #234fa2;
  margin: 0;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submission-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #e8e8e8;
  transition: all 0.3s;
}

.submission-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

.submission-item.submission-approved {
  border-left-color: #52c41a;
}

.submission-item.submission-under_review {
  border-left-color: #1890ff;
}

.submission-item.submission-revision_required {
  border-left-color: #faad14;
}

.submission-item.submission-rejected {
  border-left-color: #ff4d4f;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.submission-info {
  flex: 1;
}

.submission-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
  margin-bottom: 4px;
}

.submission-summary {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.submission-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.submission-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.submission-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rating-label {
  color: #8c8c8c;
  font-size: 12px;
}

.rating-text {
  color: #8c8c8c;
  font-size: 12px;
}

.submission-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-buttons .ant-btn {
  flex: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .submission-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pending-header,
  .submission-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .pending-actions,
  .submission-status {
    width: 100%;
    justify-content: flex-start;
  }
  
  .submission-rating {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>

