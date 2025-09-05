<template>
  <div class="team-member-task-board">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📋 我的任务看板</h1>
      <div class="header-stats">
        <a-statistic title="待办" :value="taskStats.pending" />
        <a-statistic title="进行中" :value="taskStats.inProgress" />
        <a-statistic title="已完成" :value="taskStats.completed" />
        <a-statistic title="完成率" :value="completionRate" suffix="%" />
      </div>
    </div>

    <!-- 系统说明和筛选器 -->
    <div class="system-info-section">
      <!-- 系统工作原理说明 -->
      <a-alert
        type="info"
        show-icon
        closable
        style="margin-bottom: 16px;">
        <template #message>
          <strong>🔄 实时同步机制</strong>
        </template>
        <template #description>
          <div class="sync-description">
            此任务看板与项目经理监控页面<strong>实时双向同步</strong>：
            <br/>• 您的任务来源于项目经理在监控页面的WBS分配
            <br/>• 您的进度更新、状态变更、材料提交会立即反映到项目经理的甘特图
            <br/>• 支持拖拽切换状态，点击查看详情或快速操作
            <br/>• 系统根据您的登录账号只显示分配给您的任务
          </div>
        </template>
      </a-alert>

      <!-- 任务筛选器 -->
      <div class="task-filters">
        <a-space>
          <a-segmented
            v-model:value="sourceMode"
            :options="[
              { label: '示例数据', value: 'demo' },
              { label: '任务策划(v3)', value: 'planning' }
            ]"
          />
          <a-select 
            v-model:value="projectFilter" 
            placeholder="筛选项目"
            style="width: 200px"
            allow-clear>
            <a-select-option v-for="project in myProjects" 
                            :key="project.id" 
                            :value="project.id">
              {{ project.name }}
            </a-select-option>
          </a-select>
          
          <a-button @click="refreshTasks">
            <ReloadOutlined />
            刷新
          </a-button>
          
          <a-tag color="blue">
            🆔 当前用户: {{ getCurrentUserInfo() }}
          </a-tag>
        </a-space>
      </div>
    </div>

    <!-- 看板主体 - 三列布局 -->
    <div class="kanban-container">
      <!-- 待办列 -->
      <div class="kanban-column pending-column">
        <div class="column-header">
          <h3>🕐 待办</h3>
          <a-badge :count="taskStats.pending" color="#faad14" />
        </div>
        <div 
          class="column-content"
          @drop="onDrop($event, 'pending')"
          @dragover.prevent
          @dragenter.prevent>
          <div 
            v-for="task in pendingTasks" 
            :key="task.id"
            class="task-card pending-card"
            :draggable="!readOnly"
            @dragstart="!readOnly && onDragStart($event, task)"
            @click="openTaskDetail(task)">
            
            <div class="task-header">
              <h4 class="task-title">{{ task.title }}</h4>
              <div class="task-meta">
                <a-tag :color="getPriorityColor(task.priority)" size="small">
                  {{ getPriorityText(task.priority) }}
                </a-tag>
                <a-tag v-if="task.milestoneType" color="gold" size="small">
                  {{ getMilestoneText(task.milestoneType) }}
                </a-tag>
              </div>
            </div>
            
            <div class="task-content">
              <div class="task-description">
                {{ task.description || '暂无描述' }}
              </div>
              <div class="task-deadline">
                <ClockCircleOutlined />
                <span :class="{ 'deadline-warning': isDeadlineNear(task.deadline) }">
                  {{ formatDeadline(task.deadline) }}
                </span>
              </div>
              <div class="task-project">
                <ProjectOutlined />
                <span>{{ task.projectName }}</span>
              </div>
              <div class="task-assignment">
                👤 分配人: {{ task.assignedBy }}
              </div>
            </div>

            <div class="task-actions">
              <a-button 
                type="primary" 
                size="small" 
                :disabled="readOnly"
                @click.stop="startTask(task)">
                开始任务
              </a-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="pendingTasks.length === 0" class="empty-placeholder">
            暂无待办任务
          </div>
        </div>
      </div>

      <!-- 进行中列 -->
      <div class="kanban-column inprogress-column">
        <div class="column-header">
          <h3>🚀 进行中</h3>
          <a-badge :count="taskStats.inProgress" color="#1890ff" />
        </div>
        <div 
          class="column-content"
          @drop="!readOnly && onDrop($event, 'in-progress')"
          @dragover.prevent
          @dragenter.prevent>
          <div 
            v-for="task in inProgressTasks" 
            :key="task.id"
            class="task-card inprogress-card"
            :draggable="!readOnly"
            @dragstart="!readOnly && onDragStart($event, task)"
            @click="openTaskDetail(task)">
            
            <div class="task-header">
              <h4 class="task-title">{{ task.title }}</h4>
              <div class="task-meta">
                <a-tag :color="getPriorityColor(task.priority)" size="small">
                  {{ getPriorityText(task.priority) }}
                </a-tag>
                <a-tag v-if="task.milestoneType" color="gold" size="small">
                  {{ getMilestoneText(task.milestoneType) }}
                </a-tag>
              </div>
            </div>
            
            <div class="task-content">
              <div class="task-description">
                {{ task.description || '暂无描述' }}
              </div>
              
              <!-- 进度条 -->
              <div class="task-progress">
                <a-progress 
                  :percent="task.progress || 0" 
                  size="small"
                  status="active" />
              </div>
              
              <div class="task-deadline">
                <ClockCircleOutlined />
                <span :class="{ 'deadline-warning': isDeadlineNear(task.deadline) }">
                  {{ formatDeadline(task.deadline) }}
                </span>
              </div>
              <div class="task-project">
                <ProjectOutlined />
                <span>{{ task.projectName }}</span>
              </div>
              <div class="task-assignment">
                👤 分配人: {{ task.assignedBy }}
              </div>
            </div>

            <div class="task-actions">
              <a-button 
                size="small"
                :disabled="readOnly"
                @click.stop="updateProgress(task)">
                更新进度
              </a-button>
              <a-button 
                v-if="needMaterialSubmission(task)" 
                type="primary" 
                size="small"
                @click.stop="submitMaterial(task)">
                提交材料
              </a-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="inProgressTasks.length === 0" class="empty-placeholder">
            暂无进行中任务
          </div>
        </div>
      </div>

      <!-- 已完成列 -->
      <div class="kanban-column completed-column">
        <div class="column-header">
          <h3>✅ 已完成</h3>
          <a-badge :count="taskStats.completed" color="#52c41a" />
        </div>
        <div 
          class="column-content"
          @drop="!readOnly && onDrop($event, 'completed')"
          @dragover.prevent
          @dragenter.prevent>
          <div 
            v-for="task in completedTasks" 
            :key="task.id"
            class="task-card completed-card"
            :draggable="!readOnly"
            @dragstart="!readOnly && onDragStart($event, task)"
            @click="openTaskDetail(task)">
            
            <div class="task-header">
              <h4 class="task-title">{{ task.title }}</h4>
              <div class="task-meta">
                <a-tag color="#52c41a" size="small">已完成</a-tag>
                <a-tag v-if="task.milestoneType" color="gold" size="small">
                  {{ getMilestoneText(task.milestoneType) }}
                </a-tag>
              </div>
            </div>
            
            <div class="task-content">
              <div class="task-description">
                {{ task.description || '暂无描述' }}
              </div>
              
              <!-- 完成进度 -->
              <div class="task-progress">
                <a-progress 
                  :percent="100" 
                  size="small"
                  status="success" />
              </div>
              
              <div class="task-completion">
                <CalendarOutlined />
                <span>完成于: {{ formatCompletionDate(task.completedAt) }}</span>
              </div>
              <div class="task-project">
                <ProjectOutlined />
                <span>{{ task.projectName }}</span>
              </div>
              <div class="task-assignment">
                👤 分配人: {{ task.assignedBy }}
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="completedTasks.length === 0" class="empty-placeholder">
            暂无已完成任务
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <TaskDetailDrawer 
      v-model:visible="taskDetailVisible"
      :task="selectedTask"
      @update-progress="handleProgressUpdate"
      @submit-material="handleMaterialSubmission"
      @task-completed="handleTaskCompletion" />

    <ProgressUpdateModal
      v-model:visible="progressModalVisible"
      :task="selectedTask"
      @confirm="handleProgressConfirm" />

    <MaterialSubmissionModal
      v-model:visible="materialModalVisible"
      :task="selectedTask"
      @confirm="handleMaterialConfirm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useTaskSyncStore } from '@/store/taskSync'
import { usePlanningStore } from '@/store/planning'
import { 
  ClockCircleOutlined, ProjectOutlined, CalendarOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import TaskDetailDrawer from './components/TaskDetailDrawer.vue'
import ProgressUpdateModal from './components/ProgressUpdateModal.vue'
import MaterialSubmissionModal from './components/MaterialSubmissionModal.vue'

const router = useRouter()
const taskSyncStore = useTaskSyncStore()
const planning = usePlanningStore()

// 响应式数据
const projectFilter = ref(null)
const selectedTask = ref(null)
const taskDetailVisible = ref(false)
const progressModalVisible = ref(false)
const materialModalVisible = ref(false)
const draggedTask = ref(null)
const sourceMode = ref('demo') // demo | planning
const readOnly = computed(() => sourceMode.value === 'planning')

/* 
==================== 系统架构说明 ====================

【团队成员任务展示逻辑】
1. 用户登录认证：
   - 系统根据登录的团队成员账号识别身份
   - 获取当前用户的ID、姓名、所属项目等基础信息

2. 任务数据获取：
   - 从项目监控页面的WBS任务分配中筛选属于当前用户的任务
   - 根据 assignedTo 字段匹配当前登录用户ID
   - 只显示分配给当前用户的任务，实现数据隔离

3. 项目权限控制：
   - 根据用户的项目参与情况，只显示相关项目的任务
   - 项目筛选器只显示用户有权访问的项目

【实时同步机制】
1. 双向数据同步：
   - 团队成员在看板中的任何操作（拖拽状态、更新进度、提交材料）
   - 通过 taskSyncStore 实时同步到项目经理的监控页面
   - 项目经理在监控页面的任务分配和状态变更也会实时反映到团队成员看板

2. 监控页面联动：
   - 甘特图进度条实时更新
   - WBS任务节点状态同步变更
   - 材料提交通知及时推送给项目经理

【数据流向】
项目经理监控页面 ←→ taskSyncStore ←→ 团队成员任务看板
         ↓                              ↓
    甘特图更新                     看板状态更新
    材料审核                       进度反馈

【将来实现要点】
- getUserTasks(userId): 根据用户ID获取分配的任务
- getUserProjects(userId): 获取用户参与的项目列表  
- realTimeSync(): WebSocket实时同步机制
- permissionCheck(): 用户权限验证
- auditLog(): 操作日志记录

=====================================================
*/

// 当前登录用户（演示环境）
function getCurrentUserInfo() {
  // TODO: 将来从用户store或token中获取当前登录用户信息
  // return userStore.currentUser.name
  return '张三(演示账号)'
}

// 本地持久化键（按当前用户隔离）
const getStorageKey = () => `tm_tasks_${encodeURIComponent(getCurrentUserInfo())}`

// 从本地存储加载
const loadTasksFromStorage = () => {
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch (e) {
    console.warn('加载本地任务失败:', e)
  }
  return null
}

// 保存到本地存储
const saveTasksToStorage = () => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(myTasks.value))
  } catch (e) {
    console.warn('保存本地任务失败:', e)
  }
}

// 任务数据（优先从本地恢复，其次使用初始化示例）
const myTasks = ref(loadTasksFromStorage() || [
  {
    id: 1,
    title: '系统需求分析',
    description: '完成项目需求分析文档，包括功能需求和非功能需求',
    status: 'pending',
    priority: 'high',
    progress: 0,
    deadline: '2025-02-10',
    projectId: 1,
    projectName: '科研管理系统',
    assignedBy: '张经理',
    createdAt: '2025-01-20',
    milestoneType: null
  },
  {
    id: 9001,
    title: '联调-前端集成与验证',
    description: '在看板侧更新进度与评论，验证项目监控侧实时联动',
    status: 'in-progress',
    priority: 'high',
    progress: 30,
    deadline: '2025-02-15',
    projectId: 10001,
    projectName: '互动联调演示项目',
    assignedBy: '张经理',
    createdAt: '2025-01-22',
    milestoneType: null
  },
  {
    id: 9002,
    title: '联调-材料提交流转',
    description: '从模板带出材料，成员提交，PM预审并转管理层',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    deadline: '2025-02-20',
    projectId: 10001,
    projectName: '互动联调演示项目',
    assignedBy: '张经理',
    createdAt: '2025-02-01',
    milestoneType: 'midterm'
  },
  {
    id: 2,
    title: '数据库设计',
    description: '设计系统数据库表结构和关系',
    status: 'in-progress',
    priority: 'high',
    progress: 65,
    deadline: '2025-02-05',
    projectId: 1,
    projectName: '科研管理系统',
    assignedBy: '张经理',
    createdAt: '2025-01-18',
    milestoneType: null
  },
  {
    id: 3,
    title: '项目开题材料准备',
    description: '准备项目开题所需的各类材料文档',
    status: 'in-progress',
    priority: 'medium',
    progress: 30,
    deadline: '2025-02-15',
    projectId: 2,
    projectName: 'AI智能分析平台',
    assignedBy: '李主管',
    createdAt: '2025-01-22',
    milestoneType: 'opening'
  },
  {
    id: 4,
    title: '技术文档撰写',
    description: '完成技术架构和API文档的撰写',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    deadline: '2025-01-30',
    projectId: 1,
    projectName: '科研管理系统',
    assignedBy: '张经理',
    createdAt: '2025-01-15',
    completedAt: '2025-01-28',
    milestoneType: null
  }
])

// 从任务策划(v3)生成“当前用户可见任务”的只读视图
const planningTasks = computed(() => {
  try {
    // 简化：把 planning.tasks 中 assigned 给当前成员的任务映射为团队看板任务结构
    const me = getCurrentUserInfo()
    const assigned = planning.assignments || []
    const visibleTaskIds = new Set(
      assigned
        .filter(a => a.memberId === me || a.memberName === me)
        .map(a => a.taskId)
    )
    return planning.tasks
      .filter(t => visibleTaskIds.has(t.id))
      .map(t => ({
        id: t.id,
        title: t.name,
        description: t.description || '',
        status: 'in-progress',
        priority: t.priority === '高' ? 'high' : (t.priority === '中' ? 'medium' : 'low'),
        progress: 0,
        deadline: t.dueDate || t.endDate || '',
        projectId: 0,
        projectName: '实施v3项目',
        assignedBy: '项目经理',
        milestoneType: t.primaryMilestoneId ? 'midterm' : null,
        reportTemplate: (planning.getActiveReportTemplate && planning.getActiveReportTemplate(t)) || null
      }))
  } catch (e) {
    return []
  }
})

// 模拟项目数据
const myProjects = ref([
  { id: 1, name: '科研管理系统' },
  { id: 2, name: 'AI智能分析平台' },
  { id: 3, name: '数据可视化平台' },
  { id: 10001, name: '互动联调演示项目' }
])

// 计算属性 - 任务统计
const taskStats = computed(() => {
  const filtered = filteredTasks.value
  return {
    pending: filtered.filter(task => task.status === 'pending').length,
    inProgress: filtered.filter(task => task.status === 'in-progress').length,
    completed: filtered.filter(task => task.status === 'completed').length
  }
})

// 计算属性 - 过滤任务
const filteredTasks = computed(() => {
  let tasks = sourceMode.value === 'planning' ? planningTasks.value : myTasks.value
  
  if (projectFilter.value) {
    tasks = tasks.filter(task => task.projectId === projectFilter.value)
  }
  
  return tasks
})

// 计算属性 - 按状态分组的任务
const pendingTasks = computed(() => 
  filteredTasks.value.filter(task => task.status === 'pending')
    .sort((a, b) => {
      // 优先级排序
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      // 截止时间排序
      return new Date(a.deadline) - new Date(b.deadline)
    })
)

const inProgressTasks = computed(() => 
  filteredTasks.value.filter(task => task.status === 'in-progress')
    .sort((a, b) => {
      // 按进度排序，进度高的在前
      return (b.progress || 0) - (a.progress || 0)
    })
)

const completedTasks = computed(() => 
  filteredTasks.value.filter(task => task.status === 'completed')
    .sort((a, b) => {
      // 按完成时间排序，最新完成的在前
      return new Date(b.completedAt || 0) - new Date(a.completedAt || 0)
    })
)

// 计算属性 - 完成率
const completionRate = computed(() => {
  const total = filteredTasks.value.length
  if (total === 0) return 0
  const completed = taskStats.value.completed
  return Math.round((completed / total) * 100)
})

// 拖拽相关方法
const onDragStart = (event, task) => {
  draggedTask.value = task
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target)
}

const onDrop = async (event, newStatus) => {
  event.preventDefault()
  
  if (!draggedTask.value) return
  
  const task = draggedTask.value
  const oldStatus = task.status
  
  if (oldStatus === newStatus) {
    draggedTask.value = null
    return
  }
  
  // 更新任务状态
  task.status = newStatus
  
  // 根据状态更新进度
  if (newStatus === 'pending') {
    task.progress = 0
  } else if (newStatus === 'in-progress' && task.progress === 0) {
    task.progress = 10
  } else if (newStatus === 'completed') {
    task.progress = 100
    task.completedAt = new Date().toISOString()
  }
  
  // 同步到项目经理监控页面
  try {
    await taskSyncStore.updateTask(String(task.projectId), String(task.id), {
      status: newStatus,
      progress: task.progress,
      completedAt: task.completedAt
    })
    
    message.success(`任务已移动到${getStatusText(newStatus)}`)
    saveTasksToStorage()
  } catch (error) {
    console.error('更新任务状态失败:', error)
    message.error('更新任务状态失败')
    // 回滚状态
    task.status = oldStatus
  }
  
  draggedTask.value = null
}

// 任务操作方法
const openTaskDetail = (task) => {
  selectedTask.value = task
  taskDetailVisible.value = true
}

const startTask = async (task) => {
  task.status = 'in-progress'
  task.startedAt = new Date().toISOString()
  task.progress = task.progress || 10
  
  // 同步到项目经理监控页面
  await taskSyncStore.updateTask(String(task.projectId), String(task.id), {
    status: 'in-progress',
    progress: task.progress,
    startedAt: task.startedAt
  })
  
  message.success('任务已开始')
  saveTasksToStorage()
}

const updateProgress = (task) => {
  selectedTask.value = task
  progressModalVisible.value = true
}

const submitMaterial = (task) => {
  selectedTask.value = task
  materialModalVisible.value = true
}

const handleProgressUpdate = (taskData) => {
  updateProgress(taskData)
}

const handleMaterialSubmission = (taskData) => {
  submitMaterial(taskData)
}

const handleTaskCompletion = async (taskData) => {
  const task = myTasks.value.find(t => t.id === taskData.id)
  if (task) {
    task.status = 'completed'
    task.progress = 100
    task.completedAt = new Date().toISOString()
    
    await taskSyncStore.updateTask(String(task.projectId), String(task.id), {
      status: 'completed',
      progress: 100,
      completedAt: task.completedAt
    })
    
    message.success('任务已完成')
  saveTasksToStorage()
  }
}

const handleProgressConfirm = async (progressData) => {
  const task = myTasks.value.find(t => t.id === selectedTask.value.id)
  if (task) {
    const oldProgress = task.progress || 0
    const oldStatus = task.status
    
    task.progress = progressData.progress
    task.note = progressData.note
    task.estimatedCompletion = progressData.estimatedCompletion
    
    // 如果进度达到100%，标记为完成
    if (progressData.progress === 100) {
      task.status = 'completed'
      task.completedAt = new Date().toISOString()
    }
    
    // 创建操作历史记录
    const historyEntry = {
      id: Date.now(),
      type: 'progress_update',
      timestamp: new Date().toISOString(),
      user: getCurrentUserInfo(),
      userId: 'user_001', // TODO: 获取真实用户ID
      data: {
        oldProgress: oldProgress,
        newProgress: progressData.progress,
        note: progressData.note,
        estimatedCompletion: progressData.estimatedCompletion,
        statusChange: oldStatus !== task.status ? {
          from: oldStatus,
          to: task.status
        } : null
      },
      comments: [] // 评论列表
    }
    
    // 添加到任务的操作历史
    if (!task.operationHistory) {
      task.operationHistory = []
    }
    task.operationHistory.push(historyEntry)
    
    await taskSyncStore.updateTask(String(task.projectId), String(task.id), {
      progress: task.progress,
      status: task.status,
      completedAt: task.completedAt,
      note: task.note,
      estimatedCompletion: task.estimatedCompletion,
      operationHistory: task.operationHistory
    })
    
    message.success('进度更新成功')
  saveTasksToStorage()
  }
  progressModalVisible.value = false
}

const handleMaterialConfirm = async (materialData) => {
  const task = myTasks.value.find(t => t.id === selectedTask.value.id)
  if (task) {
    task.submittedMaterials = materialData.materials
    task.submissionNote = materialData.note
    task.submittedAt = new Date().toISOString()
    
    // 创建材料提交操作历史记录
    const historyEntry = {
      id: Date.now(),
      type: 'material_submission',
      timestamp: new Date().toISOString(),
      user: getCurrentUserInfo(),
      userId: 'user_001', // TODO: 获取真实用户ID
      data: {
        materials: materialData.materials,
        note: materialData.note,
        submissionCount: materialData.materials.length
      },
      comments: [] // 评论列表
    }
    
    // 添加到任务的操作历史
    if (!task.operationHistory) {
      task.operationHistory = []
    }
    task.operationHistory.push(historyEntry)
    
    await taskSyncStore.updateTask(String(task.projectId), String(task.id), {
      submittedMaterials: task.submittedMaterials,
      submissionNote: task.submissionNote,
      submittedAt: task.submittedAt,
      operationHistory: task.operationHistory
    })
    
    message.success('材料提交成功')
  saveTasksToStorage()
  }
  materialModalVisible.value = false
}

// 工具方法
const refreshTasks = () => {
  // TODO: 将来这里会调用API重新获取当前用户的任务
  // await taskSyncStore.refreshUserTasks(currentUserId)
  message.success('任务列表已刷新')
}

// 上方已声明 getCurrentUserInfo()，此处不再重复

const needMaterialSubmission = (task) => {
  return task.milestoneType && task.status === 'in-progress' && task.progress >= 80
}

const isDeadlineNear = (deadline) => {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
  return diffDays <= 3 && diffDays >= 0
}

const formatDeadline = (deadline) => {
  return new Date(deadline).toLocaleDateString('zh-CN')
}

const formatCompletionDate = (completedAt) => {
  if (!completedAt) return '-'
  return new Date(completedAt).toLocaleDateString('zh-CN')
}

// 颜色和文本方法
const getPriorityColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  }
  return colors[priority] || 'default'
}

const getPriorityText = (priority) => {
  const texts = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return texts[priority] || priority
}

const getStatusText = (status) => {
  const texts = {
    pending: '待办',
    'in-progress': '进行中',
    completed: '已完成'
  }
  return texts[status] || status
}

const getMilestoneText = (milestoneType) => {
  const texts = {
    opening: '开题',
    midterm: '中期',
    acceptance: '验收'
  }
  return texts[milestoneType] || milestoneType
}

// 初始化
onMounted(() => {
  // 若存在本地持久化但当前为默认数据，则以本地为准
  const persisted = loadTasksFromStorage()
  if (persisted) {
    myTasks.value = persisted
  }
  refreshTasks()

  // 监听来自项目经理端的任务更新广播，同步到本地任务（用于重置等场景）
  const handler = (event) => {
    try {
      const { projectId, taskKey, updates } = event.detail || {}
      if (!projectId || !taskKey || !updates) return
      // 定位当前用户的对应任务
      const target = myTasks.value.find(t => String(t.projectId) === String(projectId) && String(t.id) === String(taskKey))
      if (!target) return
      // 合并允许的字段
      const fields = ['status','progress','completedAt','startedAt','note','estimatedCompletion','submittedMaterials','submissionNote','submittedAt','operationHistory']
      fields.forEach(f => {
        if (updates[f] !== undefined) target[f] = updates[f]
      })
      saveTasksToStorage()
    } catch (e) {
      console.warn('同步外部任务更新失败:', e)
    }
  }
  window.addEventListener('taskDataUpdated', handler)
  // 保存以便卸载时移除
  taskSyncEventHandler.value = handler

  // 首次进入时，从 taskSyncStore 缓存合并（兜底：当本页未打开时PM那边的更新也能被同步）
  mergeFromTaskSyncCache()
})

// 监听任务变化，自动持久化
watch(myTasks, () => {
  saveTasksToStorage()
}, { deep: true })

// 存储事件处理器引用，便于卸载
const taskSyncEventHandler = ref(null)

onUnmounted(() => {
  if (taskSyncEventHandler.value) {
    window.removeEventListener('taskDataUpdated', taskSyncEventHandler.value)
  }
})

// 从 taskSyncStore 缓存合并状态/进度（兜底同步）
function mergeFromTaskSyncCache() {
  try {
    let changed = false
    myTasks.value.forEach(task => {
      const cached = taskSyncStore.getTask(String(task.projectId), String(task.id))
      if (cached) {
        const fields = ['status','progress','completedAt','startedAt','note','estimatedCompletion','submittedMaterials','submissionNote','submittedAt','operationHistory']
        fields.forEach(f => {
          if (cached[f] !== undefined && task[f] !== cached[f]) {
            task[f] = cached[f]
            changed = true
          }
        })
      }
    })
    if (changed) saveTasksToStorage()
  } catch (e) {
    console.warn('合并缓存失败:', e)
  }
}
</script>

<style scoped>
.team-member-task-board {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #1890ff;
  font-size: 24px;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.system-info-section {
  margin-bottom: 24px;
}

.sync-description {
  line-height: 1.6;
  color: #595959;
}

.task-filters {
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 看板容器 */
.kanban-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  height: calc(100vh - 300px);
}

/* 看板列 */
.kanban-column {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.column-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.pending-column .column-header {
  border-left: 4px solid #faad14;
}

.inprogress-column .column-header {
  border-left: 4px solid #1890ff;
}

.completed-column .column-header {
  border-left: 4px solid #52c41a;
}

.column-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 200px;
}

/* 任务卡片 */
.task-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-card:active {
  transform: translateY(0);
}

.pending-card {
  border-left: 4px solid #faad14;
}

.inprogress-card {
  border-left: 4px solid #1890ff;
}

.completed-card {
  border-left: 4px solid #52c41a;
  opacity: 0.8;
}

.task-header {
  margin-bottom: 12px;
}

.task-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.task-content {
  margin-bottom: 12px;
}

.task-description {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-progress {
  margin-bottom: 8px;
}

.task-deadline,
.task-completion,
.task-project,
.task-assignment {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.task-assignment {
  color: #1890ff;
  font-weight: 500;
}

.deadline-warning {
  color: #ff4d4f !important;
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.task-actions .ant-btn {
  height: 28px;
  font-size: 12px;
}

/* 空状态 */
.empty-placeholder {
  text-align: center;
  color: #999;
  padding: 32px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .kanban-container {
    grid-template-columns: 1fr;
    gap: 16px;
    height: auto;
  }
  
  .kanban-column {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-stats {
    gap: 16px;
  }
  
  .task-filters {
    padding: 12px;
  }
}

/* 拖拽效果 */
.column-content:hover {
  background-color: #f9f9f9;
}

.task-card[draggable="true"] {
  user-select: none;
}

.task-card:hover[draggable="true"] {
  cursor: grab;
}

.task-card:active[draggable="true"] {
  cursor: grabbing;
  opacity: 0.8;
}
</style>