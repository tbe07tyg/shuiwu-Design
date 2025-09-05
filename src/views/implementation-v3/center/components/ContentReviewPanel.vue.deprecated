<!--
 * @file 内容审查台组件
 * @description 成员提交内容的实质性审查管理
-->
<template>
  <a-card class="content-review-card" title="🔍 内容审查台">
    <template #extra>
      <a-badge :count="pendingReviews.length" :offset="[10, 0]">
        <a-button size="small" @click="handleBatchReview">
          <CheckOutlined />
          批量审查
        </a-button>
      </a-badge>
    </template>

    <div class="review-content">
      <!-- 审查统计 -->
      <div class="review-stats">
        <div class="stat-item">
          <div class="stat-number">{{ pendingReviews.length }}</div>
          <div class="stat-label">待审查</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ reviewHistory.filter(r => r.status === 'approved').length }}</div>
          <div class="stat-label">已通过</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ reviewHistory.filter(r => r.status === 'revision_required').length }}</div>
          <div class="stat-label">需修改</div>
        </div>
      </div>

      <!-- 待审查列表 -->
      <div class="pending-reviews">
        <div class="section-header">
          <h4>待审查内容</h4>
          <a-select 
            v-model:value="sortBy" 
            size="small" 
            style="width: 120px"
            @change="handleSortChange"
          >
            <a-select-option value="time">按时间</a-select-option>
            <a-select-option value="priority">按优先级</a-select-option>
            <a-select-option value="type">按类型</a-select-option>
          </a-select>
        </div>

        <div class="review-list">
          <div 
            v-for="review in sortedPendingReviews" 
            :key="review.id"
            class="review-item"
            :class="getPriorityClass(review.priority)"
          >
            <div class="review-header">
              <div class="review-info">
                <div class="review-title">{{ review.title }}</div>
                <div class="review-meta">
                  <a-tag :color="getTypeColor(review.type)" size="small">
                    {{ getTypeText(review.type) }}
                  </a-tag>
                  <a-tag :color="getPriorityColor(review.priority)" size="small">
                    {{ getPriorityText(review.priority) }}
                  </a-tag>
                </div>
              </div>
              <div class="review-actions">
                <a-button 
                  type="primary" 
                  size="small" 
                  @click="handleStartReview(review)"
                >
                  立即审查
                </a-button>
              </div>
            </div>

            <div class="review-details">
              <div class="detail-item">
                <UserOutlined />
                <span>提交人：{{ review.submittedBy }}</span>
              </div>
              <div class="detail-item">
                <ClockCircleOutlined />
                <span>提交时间：{{ formatTime(review.submitTime) }}</span>
              </div>
              <div class="detail-item">
                <FileTextOutlined />
                <span>关联任务：{{ getTaskTitle(review.taskId) }}</span>
              </div>
            </div>

            <!-- 快速操作 -->
            <div class="quick-actions">
              <a-button 
                size="small" 
                type="text" 
                @click="handleQuickApprove(review)"
              >
                <CheckCircleOutlined />
                快速通过
              </a-button>
              <a-button 
                size="small" 
                type="text" 
                @click="handleQuickReject(review)"
              >
                <CloseCircleOutlined />
                快速拒绝
              </a-button>
              <a-button 
                size="small" 
                type="text" 
                @click="handleViewDetail(review)"
              >
                <EyeOutlined />
                查看详情
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 审查历史 -->
      <div class="review-history">
        <div class="section-header">
          <h4>最近审查</h4>
          <a-button size="small" type="text" @click="handleViewAllHistory">
            查看全部
            <ArrowRightOutlined />
          </a-button>
        </div>

        <div class="history-list">
          <div 
            v-for="history in recentHistory" 
            :key="history.id"
            class="history-item"
            :class="getHistoryStatusClass(history.status)"
          >
            <div class="history-content">
              <div class="history-title">{{ history.title }}</div>
              <div class="history-meta">
                <span class="reviewer">{{ history.reviewedBy }}</span>
                <span class="review-time">{{ formatTime(history.reviewTime) }}</span>
                <a-tag :color="getStatusColor(history.status)" size="small">
                  {{ getStatusText(history.status) }}
                </a-tag>
                <a-rate 
                  v-if="history.rating" 
                  :value="getRatingValue(history.rating)" 
                  disabled 
                  :count="3" 
                  style="font-size: 12px;"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleReviewStatistics">
          <BarChartOutlined />
          审查统计
        </a-button>
        <a-button @click="handleExportReviews">
          <ExportOutlined />
          导出记录
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  CheckOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  pendingReviews: {
    type: Array,
    default: () => []
  },
  reviewHistory: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['start-review', 'batch-review'])

// 响应式数据
const sortBy = ref('time')

// 计算属性
const sortedPendingReviews = computed(() => {
  const reviews = [...props.pendingReviews]
  
  switch (sortBy.value) {
    case 'priority':
      return reviews.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    case 'type':
      return reviews.sort((a, b) => a.type.localeCompare(b.type))
    case 'time':
    default:
      return reviews.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime))
  }
})

const recentHistory = computed(() => {
  return props.reviewHistory
    .sort((a, b) => new Date(b.reviewTime) - new Date(a.reviewTime))
    .slice(0, 3)
})

// 方法
const handleBatchReview = () => {
  emit('batch-review', props.pendingReviews)
}

const handleStartReview = (review) => {
  emit('start-review', review)
}

const handleSortChange = (value) => {
  console.log('排序方式改变:', value)
}

const handleQuickApprove = (review) => {
  message.success(`${review.title} 已快速通过`)
  // 实际项目中这里会调用API
}

const handleQuickReject = (review) => {
  message.warning(`${review.title} 已快速拒绝`)
  // 实际项目中这里会调用API
}

const handleViewDetail = (review) => {
  message.info(`查看详情：${review.title}`)
}

const handleViewAllHistory = () => {
  message.info('跳转到审查历史页面')
}

const handleReviewStatistics = () => {
  message.info('查看审查统计')
}

const handleExportReviews = () => {
  message.success('审查记录导出成功')
}

// 工具方法
const getPriorityClass = (priority) => {
  return `priority-${priority}`
}

const getPriorityColor = (priority) => {
  const colorMap = {
    'high': 'red',
    'medium': 'orange',
    'low': 'blue'
  }
  return colorMap[priority] || 'default'
}

const getPriorityText = (priority) => {
  const textMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return textMap[priority] || priority
}

const getTypeColor = (type) => {
  const colorMap = {
    'document': 'blue',
    'report': 'green',
    'test_result': 'purple',
    'code': 'orange'
  }
  return colorMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    'document': '文档',
    'report': '报告',
    'test_result': '测试结果',
    'code': '代码'
  }
  return textMap[type] || type
}

const getStatusColor = (status) => {
  const colorMap = {
    'approved': 'success',
    'revision_required': 'warning',
    'rejected': 'error'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'approved': '已通过',
    'revision_required': '需修改',
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}

const getHistoryStatusClass = (status) => {
  return `history-${status}`
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

const getTaskTitle = (taskId) => {
  // 模拟获取任务标题
  const taskMap = {
    'T001': '系统架构设计',
    'T003': '前端界面开发',
    'T004': '接口联调测试'
  }
  return taskMap[taskId] || '未知任务'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped>
.content-review-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.review-stats {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h4 {
  color: #234fa2;
  margin: 0;
  font-size: 14px;
}

.review-list,
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #e8e8e8;
  transition: all 0.3s;
}

.review-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

.review-item.priority-high {
  border-left-color: #ff4d4f;
}

.review-item.priority-medium {
  border-left-color: #faad14;
}

.review-item.priority-low {
  border-left-color: #52c41a;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.review-info {
  flex: 1;
}

.review-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
  margin-bottom: 4px;
}

.review-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.review-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;
  font-size: 12px;
}

.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
  border-left: 3px solid #e8e8e8;
}

.history-item.history-approved {
  border-left-color: #52c41a;
}

.history-item.history-revision_required {
  border-left-color: #faad14;
}

.history-item.history-rejected {
  border-left-color: #ff4d4f;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 13px;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.reviewer,
.review-time {
  color: #8c8c8c;
  font-size: 11px;
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
  .review-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .review-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .review-actions {
    width: 100%;
  }
  
  .quick-actions {
    justify-content: flex-start;
  }
  
  .history-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>

