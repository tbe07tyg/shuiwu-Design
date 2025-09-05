<!--
 * @file 任务详情弹窗组件
 * @description 查看和编辑任务详细信息
-->
<template>
  <a-modal
    :open="visible"
    title="任务详情"
    width="700px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="task-detail-content" v-if="task">
      <!-- 任务基本信息 -->
      <div class="task-info">
        <div class="info-header">
          <h3>{{ task.title }}</h3>
          <div class="info-meta">
            <a-tag :color="getPriorityColor(task.priority)" size="small">
              {{ getPriorityText(task.priority) }}
            </a-tag>
            <a-tag :color="getStatusColor(task.status)" size="small">
              {{ getStatusText(task.status) }}
            </a-tag>
          </div>
        </div>
        
        <div class="task-description">
          {{ task.description }}
        </div>

        <div class="task-details">
          <div class="detail-row">
            <span class="label">来源：</span>
            <span class="value">{{ task.sourceName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">分配人：</span>
            <span class="value">{{ task.assignedBy }}</span>
          </div>
          <div class="detail-row">
            <span class="label">截止时间：</span>
            <span class="value">{{ formatDate(task.deadline) }}</span>
          </div>
          <div v-if="task.startedAt" class="detail-row">
            <span class="label">开始时间：</span>
            <span class="value">{{ formatDate(task.startedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 任务要求 -->
      <div class="task-requirements">
        <h4>任务要求</h4>
        <div class="requirements-content">
          <div class="requirement-item">
            <strong>预期产出：</strong>
            <div class="deliverables">
              <a-tag 
                v-for="deliverable in task.requirements?.expectedOutput || []" 
                :key="deliverable"
                color="blue"
              >
                {{ deliverable }}
              </a-tag>
            </div>
          </div>
          <div class="requirement-item">
            <strong>质量标准：</strong>
            <p>{{ task.requirements?.qualityStandards || '暂无' }}</p>
          </div>
        </div>
      </div>

      <!-- 进度更新 -->
      <div class="progress-section">
        <h4>进度更新</h4>
        <div class="progress-content">
          <div class="progress-display">
            <a-progress 
              :percent="task.progress" 
              :status="getProgressStatus(task.status)"
            />
          </div>
          <div class="progress-actions">
            <a-input-number
              v-model:value="newProgress"
              :min="0"
              :max="100"
              :step="5"
              style="width: 100px"
            />
            <span>%</span>
            <a-button type="primary" size="small" @click="handleUpdateProgress">
              更新进度
            </a-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <a-space>
          <a-button @click="handleCancel">
            关闭
          </a-button>
          <a-button 
            v-if="task.status === 'pending'"
            type="primary" 
            @click="handleStartTask"
          >
            <PlayCircleOutlined />
            开始任务
          </a-button>
          <a-button 
            v-if="task.status === 'in_progress' && task.progress >= 100"
            type="primary" 
            @click="handleCompleteTask"
          >
            <CheckCircleOutlined />
            完成任务
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { 
  PlayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'update-task'])

// 响应式数据
const newProgress = ref(0)

// 方法
const handleCancel = () => {
  emit('update:visible', false)
}

const handleUpdateProgress = () => {
  if (newProgress.value < 0 || newProgress.value > 100) {
    message.warning('进度值应在0-100之间')
    return
  }
  
  const updatedTask = {
    ...props.task,
    progress: newProgress.value
  }
  
  emit('update-task', updatedTask)
  message.success('进度更新成功')
}

const handleStartTask = () => {
  const updatedTask = {
    ...props.task,
    status: 'in_progress',
    startedAt: new Date().toISOString()
  }
  
  emit('update-task', updatedTask)
  message.success('任务已开始')
}

const handleCompleteTask = () => {
  const updatedTask = {
    ...props.task,
    status: 'completed',
    progress: 100,
    completedAt: new Date().toISOString()
  }
  
  emit('update-task', updatedTask)
  message.success('任务已完成')
}

// 工具方法
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

const getStatusColor = (status) => {
  const colorMap = {
    'completed': 'success',
    'in_progress': 'processing',
    'pending': 'warning'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'pending': '待开始'
  }
  return textMap[status] || status
}

const getProgressStatus = (status) => {
  const statusMap = {
    'completed': 'success',
    'in_progress': 'active',
    'pending': 'normal'
  }
  return statusMap[status] || 'normal'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 监听任务变化
watch(() => props.task, (newTask) => {
  if (newTask) {
    newProgress.value = newTask.progress || 0
  }
})
</script>

<style scoped>
.task-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-header h3 {
  margin: 0;
  color: #234fa2;
  font-size: 18px;
}

.info-meta {
  display: flex;
  gap: 8px;
}

.task-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row .label {
  color: #8c8c8c;
  min-width: 80px;
  font-size: 14px;
}

.detail-row .value {
  color: #234fa2;
  font-weight: 500;
  font-size: 14px;
}

.task-requirements h4,
.progress-section h4 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.requirements-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.requirement-item {
  margin-bottom: 12px;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

.requirement-item strong {
  color: #234fa2;
  display: block;
  margin-bottom: 8px;
}

.deliverables {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.requirement-item p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.progress-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.progress-display {
  margin-bottom: 16px;
}

.progress-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

/* 响应式 */
@media (max-width: 768px) {
  .info-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .progress-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
