<!--
 * @file 成员任务分配组件
 * @description 项目成员列表和任务分配管理
-->
<template>
  <a-card class="member-assignment-card" title="👥 成员任务分配">
    <template #extra>
      <a-button size="small" @click="handleAssignNew">
        <PlusOutlined />
        分配新任务
      </a-button>
    </template>

    <div class="assignment-content">
      <!-- 成员列表 -->
      <div class="member-list">
        <div 
          v-for="member in members" 
          :key="member.id"
          class="member-item"
          :class="getWorkloadClass(member.workload)"
        >
          <div class="member-header">
            <div class="member-info">
              <a-avatar :size="32" :style="{ backgroundColor: getMemberColor(member.id) }">
                {{ member.name.charAt(0) }}
              </a-avatar>
              <div class="member-details">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-role">{{ member.role }}</div>
              </div>
            </div>
            <div class="workload-indicator">
              <a-progress 
                type="circle" 
                :percent="member.workload" 
                :size="40"
                :status="getWorkloadStatus(member.workload)"
              />
            </div>
          </div>

          <!-- 专长标签 -->
          <div class="expertise-tags">
            <a-tag 
              v-for="skill in member.expertise" 
              :key="skill"
              color="blue"
              size="small"
            >
              {{ skill }}
            </a-tag>
          </div>

          <!-- 任务列表 -->
          <div class="member-tasks">
            <div class="tasks-header">
              <span class="tasks-title">当前任务 ({{ member.tasks.length }})</span>
              <a-button 
                size="small" 
                type="text" 
                @click="handleAssignToMember(member)"
              >
                <PlusOutlined />
              </a-button>
            </div>
            <div class="tasks-list">
              <div 
                v-for="task in member.tasks" 
                :key="task.id"
                class="task-item"
                :class="getTaskStatusClass(task.status)"
              >
                <div class="task-content">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-status">
                    <component :is="getTaskStatusIcon(task.status)" />
                    <span>{{ getTaskStatusText(task.status) }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <a-button 
                    size="small" 
                    type="text" 
                    @click="handleViewTask(task)"
                  >
                    <EyeOutlined />
                  </a-button>
                  <a-button 
                    size="small" 
                    type="text" 
                    @click="handleReassignTask(task)"
                  >
                    <SwapOutlined />
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未分配任务 -->
      <div v-if="unassignedTasks.length > 0" class="unassigned-tasks">
        <h4>待分配任务 ({{ unassignedTasks.length }})</h4>
        <div class="unassigned-list">
          <div 
            v-for="task in unassignedTasks" 
            :key="task.id"
            class="unassigned-item"
            draggable="true"
            @dragstart="handleDragStart($event, task)"
          >
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-meta">
                <a-tag :color="getPriorityColor(task.priority)" size="small">
                  {{ getPriorityText(task.priority) }}
                </a-tag>
                <span class="deadline">{{ formatDeadline(task.deadline) }}</span>
              </div>
            </div>
            <a-button 
              size="small" 
              type="primary" 
              @click="handleQuickAssign(task)"
            >
              快速分配
            </a-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleBatchAssign">
          <ThunderboltOutlined />
          智能分配
        </a-button>
        <a-button @click="handleAdjustAssignment">
          <SettingOutlined />
          调整分配
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import { 
  PlusOutlined,
  EyeOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  members: {
    type: Array,
    default: () => []
  },
  tasks: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['assign-task', 'adjust-assignment'])

// 计算属性
const unassignedTasks = computed(() => {
  // 模拟未分配的任务
  return [
    {
      id: 'T_UNASSIGNED_001',
      title: '数据库优化方案设计',
      priority: 'high',
      deadline: '2025-02-20',
      sourceType: 'research_content',
      sourceId: 'RC003'
    },
    {
      id: 'T_UNASSIGNED_002',
      title: '用户界面原型设计',
      priority: 'medium',
      deadline: '2025-03-01',
      sourceType: 'research_content',
      sourceId: 'RC001'
    }
  ]
})

// 方法
const handleAssignNew = () => {
  message.info('打开任务分配对话框')
  emit('assign-task', { action: 'new' })
}

const handleAssignToMember = (member) => {
  message.info(`为 ${member.name} 分配新任务`)
  emit('assign-task', { action: 'assign_to_member', member })
}

const handleViewTask = (task) => {
  message.info(`查看任务：${task.title}`)
}

const handleReassignTask = (task) => {
  message.info(`重新分配任务：${task.title}`)
  emit('adjust-assignment', { action: 'reassign', task })
}

const handleQuickAssign = (task) => {
  message.info(`快速分配任务：${task.title}`)
  emit('assign-task', { action: 'quick_assign', task })
}

const handleBatchAssign = () => {
  message.info('启动智能分配算法')
  emit('assign-task', { action: 'batch_assign' })
}

const handleAdjustAssignment = () => {
  message.info('打开分配调整面板')
  emit('adjust-assignment', { action: 'adjust_all' })
}

const handleDragStart = (event, task) => {
  event.dataTransfer.setData('text/plain', JSON.stringify(task))
}

// 工具方法
const getMemberColor = (memberId) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96']
  const index = memberId.charCodeAt(memberId.length - 1) % colors.length
  return colors[index]
}

const getWorkloadClass = (workload) => {
  if (workload >= 90) return 'workload-overload'
  if (workload >= 75) return 'workload-high'
  if (workload >= 50) return 'workload-medium'
  return 'workload-low'
}

const getWorkloadStatus = (workload) => {
  if (workload >= 90) return 'exception'
  if (workload >= 75) return 'active'
  return 'success'
}

const getTaskStatusClass = (status) => {
  return `task-${status}`
}

const getTaskStatusIcon = (status) => {
  const iconMap = {
    'completed': CheckCircleOutlined,
    'in_progress': SyncOutlined,
    'pending': ClockCircleOutlined
  }
  return iconMap[status] || ClockCircleOutlined
}

const getTaskStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'pending': '待开始'
  }
  return textMap[status] || status
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

const formatDeadline = (deadline) => {
  return new Date(deadline).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.member-assignment-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.assignment-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #e8e8e8;
  transition: all 0.3s;
}

.member-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

.member-item.workload-low {
  border-left-color: #52c41a;
}

.member-item.workload-medium {
  border-left-color: #faad14;
}

.member-item.workload-high {
  border-left-color: #ff7a45;
}

.member-item.workload-overload {
  border-left-color: #ff4d4f;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-details {
  display: flex;
  flex-direction: column;
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

.expertise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.member-tasks {
  margin-top: 8px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tasks-title {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.task-item.task-completed {
  background: #f6ffed;
  border-color: #52c41a;
}

.task-item.task-in_progress {
  background: #e6f7ff;
  border-color: #1890ff;
}

.task-item.task-pending {
  background: #fff7e6;
  border-color: #faad14;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 12px;
  color: #234fa2;
  font-weight: 500;
  margin-bottom: 2px;
}

.task-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #8c8c8c;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.unassigned-tasks {
  background: #fff2f0;
  padding: 12px;
  border-radius: 8px;
  border: 1px dashed #ff4d4f;
}

.unassigned-tasks h4 {
  color: #ff4d4f;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.unassigned-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unassigned-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #ffccc7;
  cursor: grab;
}

.unassigned-item:active {
  cursor: grabbing;
}

.task-info {
  flex: 1;
}

.task-info .task-title {
  color: #234fa2;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.deadline {
  font-size: 11px;
  color: #8c8c8c;
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
  .member-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .unassigned-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>

