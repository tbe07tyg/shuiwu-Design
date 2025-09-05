<template>
  <a-drawer
    :visible="visible"
    title="任务详情"
    placement="right"
    width="600"
    @update:visible="$emit('update:visible', $event)">
    
    <div class="task-detail-content">
      <!-- 任务基础信息 -->
      <div class="task-basic-info">
        <h2>{{ task?.title }}</h2>
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="所属项目">
            {{ task?.projectName }}
          </a-descriptions-item>
          <a-descriptions-item label="任务状态">
            <a-tag :color="getStatusColor(task?.status)">
              {{ getStatusText(task?.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(task?.priority)">
              {{ getPriorityText(task?.priority) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="截止时间">
            <span :class="{ 'text-red': isOverdue(task) }">
              {{ formatDateTime(task?.deadline) }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="分配人">
            {{ task?.assignedByName || '项目经理' }}
          </a-descriptions-item>
          <a-descriptions-item label="分配时间">
            {{ formatDateTime(task?.assignedAt) }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 任务描述 -->
      <div class="task-description">
        <h3>任务描述</h3>
        <div class="description-content">
          {{ task?.description }}
        </div>
      </div>

      <!-- 进度跟踪 -->
      <div class="progress-tracking">
        <h3>进度跟踪</h3>
        <a-progress 
          :percent="task?.progress || 0" 
          :status="getProgressStatus(task)"
          :stroke-width="8" />
        
        <div class="progress-actions">
          <a-space>
            <a-button 
              type="primary" 
              @click="$emit('update-progress', task)"
              :disabled="task?.status === 'completed'">
              更新进度
            </a-button>
            <a-button 
              v-if="task?.progress === 100 && task?.status !== 'completed'"
              type="primary" 
              @click="markCompleted">
              标记完成
            </a-button>
          </a-space>
        </div>
      </div>

      <!-- 材料提交 (仅里程碑任务显示) -->
      <div v-if="task?.milestoneType" class="material-submission">
        <h3>材料提交</h3>
        <div class="material-requirements">
          <div v-for="requirement in materialRequirements" 
               :key="requirement.id"
               class="requirement-item">
            <div class="requirement-header">
              <span class="requirement-name">{{ requirement.name }}</span>
              <a-tag v-if="requirement.required" color="red">必需</a-tag>
            </div>
            <div class="requirement-status">
              <a-tag v-if="requirement.submitted" color="green">
                已提交
              </a-tag>
              <a-tag v-else color="orange">
                待提交
              </a-tag>
            </div>
          </div>
        </div>
        
        <div class="material-actions">
          <a-button 
            type="primary" 
            @click="$emit('submit-material', task)"
            :disabled="task?.status === 'completed'">
            <UploadOutlined />
            提交材料
          </a-button>
        </div>
      </div>

      <!-- 操作历史 -->
      <div class="task-history">
        <h3>操作历史</h3>
        <div v-if="operationHistory.length === 0" class="no-history">
          暂无操作历史
        </div>
        <a-timeline v-else>
          <a-timeline-item 
            v-for="history in operationHistory" 
            :key="history.id"
            :color="getHistoryColor(history.type)">
            <template #dot>
              <component :is="getHistoryIcon(history.type)" />
            </template>
            <div class="history-content">
              <div class="history-header">
                <span class="history-user">{{ history.user }}</span>
                <span class="history-action">{{ getHistoryActionText(history.type) }}</span>
                <span class="history-time">{{ formatHistoryTime(history.timestamp) }}</span>
                <a-button 
                  type="link" 
                  size="small"
                  @click="showHistoryDetail(history)">
                  查看详情
                </a-button>
              </div>
              <div class="history-detail">
                {{ getHistoryDetailText(history) }}
              </div>
              
              <!-- 评论区域 -->
              <div class="history-comments" v-if="history.comments && history.comments.length > 0">
                <div class="comments-list">
                  <div 
                    v-for="comment in history.comments" 
                    :key="comment.id"
                    class="comment-item">
                    <div class="comment-header">
                      <span class="comment-user">{{ comment.user }}</span>
                      <span class="comment-time">{{ formatHistoryTime(comment.timestamp) }}</span>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 添加评论 -->
              <div class="add-comment">
                <a-input-group compact>
                  <a-input 
                    v-model:value="commentTexts[history.id]"
                    placeholder="添加评论..."
                    @pressEnter="addComment(history)"
                    style="width: calc(100% - 80px)" />
                  <a-button 
                    type="primary" 
                    @click="addComment(history)"
                    style="width: 80px">
                    评论
                  </a-button>
                </a-input-group>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { 
  UploadOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  FileTextOutlined,
  EditOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  visible: Boolean,
  task: Object
})

const emit = defineEmits(['update:visible', 'update-progress', 'submit-material', 'task-completed'])

// 响应式数据
const commentTexts = ref({})
const historyDetailVisible = ref(false)
const selectedHistory = ref(null)

// 计算属性
const operationHistory = computed(() => {
  return props.task?.operationHistory || []
})

const materialRequirements = computed(() => {
  if (!props.task?.milestoneType) return []
  
  // 根据里程碑类型返回不同的材料需求
  const requirements = {
    opening: [
      { id: 1, name: '开题报告', required: true, submitted: false },
      { id: 2, name: '文献综述', required: true, submitted: false },
      { id: 3, name: '技术路线图', required: false, submitted: false }
    ],
    midterm: [
      { id: 1, name: '中期检查报告', required: true, submitted: false },
      { id: 2, name: '阶段性成果', required: true, submitted: false },
      { id: 3, name: '进度总结', required: false, submitted: false }
    ],
    acceptance: [
      { id: 1, name: '验收报告', required: true, submitted: false },
      { id: 2, name: '项目总结', required: true, submitted: false },
      { id: 3, name: '成果展示', required: false, submitted: false }
    ]
  }
  
  return requirements[props.task.milestoneType] || []
})

const taskHistory = computed(() => {
  // 模拟任务历史数据
  return [
    {
      id: 1,
      type: 'assign',
      action: '任务已分配',
      createdAt: props.task?.assignedAt,
      note: '项目经理分配了此任务'
    },
    {
      id: 2,
      type: 'start',
      action: '开始执行任务',
      createdAt: props.task?.startedAt,
      note: null
    },
    {
      id: 3,
      type: 'progress',
      action: '更新任务进度',
      createdAt: props.task?.lastUpdateAt,
      note: props.task?.progressNote
    }
  ].filter(item => item.createdAt) // 只显示已发生的历史
})

// 方法
const markCompleted = () => {
  emit('task-completed', props.task)
}

const isOverdue = (task) => {
  if (!task?.deadline) return false
  return new Date(task.deadline) < new Date() && task.status !== 'completed'
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    'in-progress': 'blue',
    review: 'purple',
    completed: 'green'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    'in-progress': '进行中',
    review: '待审核',
    completed: '已完成'
  }
  return texts[status] || status
}

const getPriorityColor = (priority) => {
  const colors = { high: 'red', medium: 'orange', low: 'green' }
  return colors[priority] || 'default'
}

const getPriorityText = (priority) => {
  const texts = { high: '高优先级', medium: '中优先级', low: '低优先级' }
  return texts[priority] || priority
}

const getProgressStatus = (task) => {
  if (!task) return 'active'
  if (task.status === 'completed') return 'success'
  if (isOverdue(task)) return 'exception'
  return 'active'
}

const getHistoryColor = (type) => {
  const colors = {
    assign: 'blue',
    start: 'green',
    progress: 'orange',
    complete: 'green',
    material: 'purple'
  }
  return colors[type] || 'blue'
}

const getHistoryIcon = (type) => {
  const icons = {
    assign: UserOutlined,
    start: ClockCircleOutlined,
    progress: ClockCircleOutlined,
    complete: CheckCircleOutlined,
    material: UploadOutlined
  }
  return icons[type] || ClockCircleOutlined
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 操作历史相关方法
const getHistoryActionText = (type) => {
  const texts = {
    progress_update: '更新了任务进度',
    material_submission: '提交了材料',
    status_change: '变更了任务状态',
    task_start: '开始了任务',
    task_complete: '完成了任务'
  }
  return texts[type] || '执行了操作'
}

const getHistoryDetailText = (history) => {
  switch (history.type) {
    case 'progress_update':
      const { oldProgress, newProgress, statusChange } = history.data
      let text = `进度从 ${oldProgress}% 更新到 ${newProgress}%`
      if (statusChange) {
        text += `，状态从 ${getStatusText(statusChange.from)} 变更为 ${getStatusText(statusChange.to)}`
      }
      if (history.data.note) {
        text += `\n备注：${history.data.note}`
      }
      return text
    case 'material_submission':
      return `提交了 ${history.data.submissionCount} 个材料文件`
    default:
      return '详细信息'
  }
}

const formatHistoryTime = (timestamp) => {
  if (!timestamp) return ''
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return time.toLocaleDateString('zh-CN')
}

const showHistoryDetail = (history) => {
  selectedHistory.value = history
  historyDetailVisible.value = true
}

const addComment = async (history) => {
  const commentText = commentTexts.value[history.id]
  if (!commentText || !commentText.trim()) {
    message.warning('请输入评论内容')
    return
  }
  
  const comment = {
    id: Date.now(),
    user: '张三(演示账号)', // TODO: 获取当前用户
    userId: 'user_001',
    content: commentText.trim(),
    timestamp: new Date().toISOString()
  }
  
  // 添加评论到历史记录
  if (!history.comments) {
    history.comments = []
  }
  history.comments.push(comment)
  
  // 清空输入框
  commentTexts.value[history.id] = ''
  
  // TODO: 同步到后端和项目经理页面
  message.success('评论添加成功')
}

</script>

<style scoped>
.task-detail-content {
  padding: 0;
}

.task-basic-info {
  margin-bottom: 24px;
}

.task-basic-info h2 {
  color: #234fa2;
  margin-bottom: 16px;
}

.task-description {
  margin-bottom: 24px;
}

.task-description h3 {
  color: #234fa2;
  margin-bottom: 12px;
}

.description-content {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  color: #666;
  line-height: 1.6;
}

.progress-tracking {
  margin-bottom: 24px;
}

.progress-tracking h3 {
  color: #234fa2;
  margin-bottom: 12px;
}

.progress-actions {
  margin-top: 16px;
}

.material-submission {
  margin-bottom: 24px;
}

.material-submission h3 {
  color: #234fa2;
  margin-bottom: 12px;
}

.material-requirements {
  margin-bottom: 16px;
}

.requirement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.requirement-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.requirement-name {
  font-weight: 500;
}

.task-history h3 {
  color: #234fa2;
  margin-bottom: 12px;
}

.history-content {
  padding-left: 8px;
}

.history-action {
  font-weight: 500;
  color: #234fa2;
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.history-note {
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 6px 8px;
  border-radius: 4px;
}

.text-red {
  color: #ff4d4f;
  font-weight: 600;
}

/* 操作历史相关样式 */
.no-history {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

.history-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.history-user {
  font-weight: 600;
  color: #1890ff;
}

.history-action {
  color: #666;
}

.history-time {
  color: #999;
  font-size: 12px;
}

.history-detail {
  color: #333;
  line-height: 1.5;
  white-space: pre-line;
  margin-bottom: 12px;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
}

.history-comments {
  background: #fff;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #e8e8e8;
}

.comment-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-user {
  font-weight: 500;
  color: #1890ff;
  font-size: 12px;
}

.comment-time {
  color: #999;
  font-size: 11px;
}

.comment-content {
  color: #333;
  font-size: 13px;
  line-height: 1.4;
}

.add-comment {
  margin-top: 8px;
}
</style>
