<!--
 * @file 我的任务面板组件
 * @description 显示和管理分配给当前用户的任务
-->
<template>
  <a-card class="my-tasks-card" title="📋 我的任务">
    <template #extra>
      <a-select 
        v-model:value="filterStatus" 
        size="small" 
        style="width: 100px"
        @change="handleFilterChange"
      >
        <a-select-option value="all">全部</a-select-option>
        <a-select-option value="pending">待开始</a-select-option>
        <a-select-option value="in_progress">进行中</a-select-option>
        <a-select-option value="completed">已完成</a-select-option>
      </a-select>
    </template>

    <div class="tasks-content">
      <!-- 任务统计 -->
      <div class="task-stats">
        <div class="stat-item">
          <div class="stat-number">{{ getTaskCount('pending') }}</div>
          <div class="stat-label">待开始</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ getTaskCount('in_progress') }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ getTaskCount('completed') }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-list">
        <div 
          v-for="task in filteredTasks" 
          :key="task.id"
          class="task-item"
          :class="getTaskStatusClass(task.status)"
          @click="handleViewTask(task)"
        >
          <div class="task-header">
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-source">
                来源：{{ task.sourceName }}
              </div>
            </div>
            <div class="task-meta">
              <a-tag :color="getPriorityColor(task.priority)" size="small">
                {{ getPriorityText(task.priority) }}
              </a-tag>
              <component :is="getStatusIcon(task.status)" />
            </div>
          </div>

          <div class="task-description">
            {{ task.description }}
          </div>

          <div class="task-progress" v-if="task.status !== 'pending'">
            <a-progress 
              :percent="task.progress" 
              size="small"
              :status="getProgressStatus(task.status)"
            />
          </div>

          <div class="task-details">
            <div class="detail-item">
              <CalendarOutlined />
              <span>截止：{{ formatDate(task.deadline) }}</span>
              <span v-if="isOverdue(task.deadline)" class="overdue-warning">已逾期</span>
            </div>
            <div class="detail-item">
              <UserOutlined />
              <span>分配人：{{ task.assignedBy }}</span>
            </div>
            <div v-if="task.startedAt" class="detail-item">
              <PlayCircleOutlined />
              <span>开始：{{ formatDate(task.startedAt) }}</span>
            </div>
          </div>

          <div class="task-actions">
            <a-button 
              v-if="task.status === 'pending'"
              type="primary" 
              size="small" 
              @click.stop="handleStartTask(task)"
            >
              <PlayCircleOutlined />
              开始任务
            </a-button>
            <a-button 
              v-if="task.status === 'in_progress'"
              size="small" 
              @click.stop="handleUpdateProgress(task)"
            >
              <EditOutlined />
              更新进度
            </a-button>
            <a-button 
              size="small" 
              @click.stop="handleViewTask(task)"
            >
              <EyeOutlined />
              查看详情
            </a-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <a-empty description="暂无任务">
          <a-button type="primary" @click="handleRefreshTasks">
            刷新任务
          </a-button>
        </a-empty>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  CalendarOutlined,
  UserOutlined,
  PlayCircleOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['start-task', 'view-task', 'update-progress'])

// 响应式数据
const filterStatus = ref('all')

// 计算属性
const filteredTasks = computed(() => {
  if (filterStatus.value === 'all') {
    return props.tasks
  }
  return props.tasks.filter(task => task.status === filterStatus.value)
})

// 方法
const handleFilterChange = (value) => {
  console.log('任务筛选:', value)
}

const handleStartTask = (task) => {
  emit('start-task', task)
}

const handleViewTask = (task) => {
  emit('view-task', task)
}

const handleUpdateProgress = (task) => {
  emit('update-progress', task)
}

const handleRefreshTasks = () => {
  message.success('任务列表已刷新')
}

// 工具方法
const getTaskCount = (status) => {
  return props.tasks.filter(task => task.status === status).length
}

const getTaskStatusClass = (status) => {
  return `task-${status}`
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

const getStatusIcon = (status) => {
  const iconMap = {
    'completed': CheckCircleOutlined,
    'in_progress': SyncOutlined,
    'pending': ClockCircleOutlined
  }
  return iconMap[status] || ClockCircleOutlined
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
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const isOverdue = (deadline) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}
</script>

<style scoped>
.my-tasks-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tasks-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.task-stats {
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

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s;
}

.task-item:hover {
  background: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.task-item.task-pending {
  border-left-color: #faad14;
}

.task-item.task-in_progress {
  border-left-color: #1890ff;
}

.task-item.task-completed {
  border-left-color: #52c41a;
  opacity: 0.8;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-info {
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 16px;
  margin-bottom: 4px;
}

.task-source {
  color: #8c8c8c;
  font-size: 12px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-progress {
  margin-bottom: 12px;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;
  font-size: 12px;
}

.overdue-warning {
  color: #ff4d4f !important;
  font-weight: 600;
  margin-left: 8px;
}

.task-actions {
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

/* 响应式 */
@media (max-width: 768px) {
  .task-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .task-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .task-actions {
    justify-content: flex-start;
  }
  
  .detail-item {
    flex-wrap: wrap;
  }
}
</style>

