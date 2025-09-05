<template>
  <div class="task-board">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>我的任务看板</h1>
      <p class="subtitle">任务管理与进展跟踪</p>
    </div>

    <!-- 任务统计概览 -->
    <div class="task-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="overview-card todo-card">
            <a-statistic title="待办任务" :value="taskStats.todo" />
            <div class="card-trend">
              <ArrowUpOutlined style="color: #cf1322" />
              <span>新增 {{ taskStats.newTasks }} 个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card progress-card">
            <a-statistic title="进行中" :value="taskStats.inProgress" />
            <div class="card-trend">
              <SyncOutlined style="color: #1890ff" />
              <span>专注执行中</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card done-card">
            <a-statistic title="已完成" :value="taskStats.done" />
            <div class="card-trend">
              <ArrowUpOutlined style="color: #52c41a" />
              <span>本周完成 {{ taskStats.weeklyDone }} 个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card efficiency-card">
            <a-statistic title="完成率" :value="taskStats.completionRate" suffix="%" />
            <div class="card-trend">
              <TrophyOutlined style="color: #fa8c16" />
              <span>效率优秀</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 快速操作和筛选 -->
    <div class="quick-actions">
      <a-card class="actions-card">
        <a-row justify="space-between" align="middle">
          <a-col>
            <a-space>
              <a-input-search
                v-model:value="searchKeyword"
                placeholder="搜索任务..."
                style="width: 250px"
                @search="handleSearch"
              />
              <a-select
                v-model:value="filterProject"
                placeholder="选择项目"
                style="width: 150px"
                allow-clear
              >
                <a-select-option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </a-select-option>
              </a-select>
              <a-select
                v-model:value="filterPriority"
                placeholder="任务优先级"
                style="width: 120px"
                allow-clear
              >
                <a-select-option value="urgent">紧急</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-space>
          </a-col>
          <a-col>
            <a-space>
              <a-button @click="startPomodoro" :type="pomodoroActive ? 'primary' : 'default'">
                <ClockCircleOutlined />
                {{ pomodoroActive ? '番茄计时中' : '开始番茄工作法' }}
              </a-button>
              <a-button @click="showTimeRecord">
                <FieldTimeOutlined />
                工时记录
              </a-button>
              <a-dropdown>
                <a-button>
                  <SettingOutlined />
                  视图设置
                  <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="changeView('kanban')">看板视图</a-menu-item>
                    <a-menu-item @click="changeView('list')">列表视图</a-menu-item>
                    <a-menu-item @click="changeView('calendar')">日历视图</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 看板视图 -->
    <div v-if="currentView === 'kanban'" class="kanban-view">
      <a-row :gutter="16">
        <!-- 待办列 -->
        <a-col :span="8">
          <div class="kanban-column todo-column">
            <div class="column-header">
              <h3>
                <InboxOutlined />
                待办任务
                <a-badge :count="todoTasks.length" :number-style="{ backgroundColor: '#f50' }" />
              </h3>
              <a-button type="text" size="small" @click="addTask">
                <PlusOutlined />
              </a-button>
            </div>
            <div class="column-content">
              <draggable
                v-model="todoTasks"
                group="tasks"
                item-key="id"
                @change="handleTaskMove"
                class="task-list"
              >
                <template #item="{ element }">
                  <div class="task-card" @click="viewTaskDetail(element)">
                    <div class="task-header">
                      <span class="task-title">{{ element.title }}</span>
                      <a-tag :color="getPriorityColor(element.priority)" size="small">
                        {{ getPriorityText(element.priority) }}
                      </a-tag>
                    </div>
                    <div class="task-content">
                      <p class="task-description">{{ element.description }}</p>
                      <div class="task-meta">
                        <span class="task-project">{{ element.projectName }}</span>
                        <span class="task-deadline" :class="{ 'overdue': isOverdue(element.deadline) }">
                          <CalendarOutlined />
                          {{ formatDate(element.deadline) }}
                        </span>
                      </div>
                    </div>
                    <div class="task-footer">
                      <a-avatar-group size="small" :max-count="2">
                        <a-avatar v-for="member in element.collaborators" :key="member.id" :title="member.name">
                          {{ member.name.substring(0, 1) }}
                        </a-avatar>
                      </a-avatar-group>
                      <div class="task-actions">
                        <a-button type="text" size="small" @click.stop="startTask(element)">
                          <PlayCircleOutlined />
                        </a-button>
                        <a-button type="text" size="small" @click.stop="editTask(element)">
                          <EditOutlined />
                        </a-button>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </a-col>

        <!-- 进行中列 -->
        <a-col :span="8">
          <div class="kanban-column progress-column">
            <div class="column-header">
              <h3>
                <SyncOutlined />
                进行中
                <a-badge :count="progressTasks.length" :number-style="{ backgroundColor: '#1890ff' }" />
              </h3>
            </div>
            <div class="column-content">
              <draggable
                v-model="progressTasks"
                group="tasks"
                item-key="id"
                @change="handleTaskMove"
                class="task-list"
              >
                <template #item="{ element }">
                  <div class="task-card active-task" @click="viewTaskDetail(element)">
                    <div class="task-header">
                      <span class="task-title">{{ element.title }}</span>
                      <a-tag :color="getPriorityColor(element.priority)" size="small">
                        {{ getPriorityText(element.priority) }}
                      </a-tag>
                    </div>
                    <div class="task-content">
                      <p class="task-description">{{ element.description }}</p>
                      <div class="task-progress">
                        <a-progress 
                          :percent="element.progress" 
                          size="small" 
                          :stroke-color="getProgressColor(element.progress)"
                        />
                      </div>
                      <div class="task-meta">
                        <span class="task-project">{{ element.projectName }}</span>
                        <span class="task-time">
                          <ClockCircleOutlined />
                          已耗时: {{ element.timeSpent }}h
                        </span>
                      </div>
                    </div>
                    <div class="task-footer">
                      <a-avatar-group size="small" :max-count="2">
                        <a-avatar v-for="member in element.collaborators" :key="member.id" :title="member.name">
                          {{ member.name.substring(0, 1) }}
                        </a-avatar>
                      </a-avatar-group>
                      <div class="task-actions">
                        <a-button type="text" size="small" @click.stop="updateProgress(element)">
                          <PercentageOutlined />
                        </a-button>
                        <a-button type="text" size="small" @click.stop="pauseTask(element)">
                          <PauseCircleOutlined />
                        </a-button>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </a-col>

        <!-- 已完成列 -->
        <a-col :span="8">
          <div class="kanban-column done-column">
            <div class="column-header">
              <h3>
                <CheckCircleOutlined />
                已完成
                <a-badge :count="doneTasks.length" :number-style="{ backgroundColor: '#52c41a' }" />
              </h3>
              <a-button type="text" size="small" @click="archiveDoneTasks">
                <InboxOutlined />
                归档
              </a-button>
            </div>
            <div class="column-content">
              <draggable
                v-model="doneTasks"
                group="tasks"
                item-key="id"
                @change="handleTaskMove"
                class="task-list"
              >
                <template #item="{ element }">
                  <div class="task-card completed-task" @click="viewTaskDetail(element)">
                    <div class="task-header">
                      <span class="task-title">{{ element.title }}</span>
                      <a-tag color="green" size="small">已完成</a-tag>
                    </div>
                    <div class="task-content">
                      <p class="task-description">{{ element.description }}</p>
                      <div class="task-meta">
                        <span class="task-project">{{ element.projectName }}</span>
                        <span class="task-completed">
                          <CheckOutlined />
                          {{ formatDate(element.completedAt) }}
                        </span>
                      </div>
                    </div>
                    <div class="task-footer">
                      <div class="task-rating">
                        <a-rate :value="element.rating" :count="5" size="small" disabled />
                      </div>
                      <div class="task-actions">
                        <a-button type="text" size="small" @click.stop="shareTask(element)">
                          <ShareAltOutlined />
                        </a-button>
                        <a-button type="text" size="small" @click.stop="archiveTask(element)">
                          <InboxOutlined />
                        </a-button>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 任务详情抽屉 -->
    <a-drawer
      v-model:open="taskDetailVisible"
      title="任务详情"
      width="600"
      placement="right"
    >
      <div v-if="selectedTask" class="task-detail">
        <!-- 任务基本信息 -->
        <div class="detail-section">
          <h3>{{ selectedTask.title }}</h3>
          <a-space>
            <a-tag :color="getPriorityColor(selectedTask.priority)">
              {{ getPriorityText(selectedTask.priority) }}
            </a-tag>
            <a-tag :color="getStatusColor(selectedTask.status)">
              {{ getStatusText(selectedTask.status) }}
            </a-tag>
          </a-space>
        </div>

        <!-- 任务描述 -->
        <div class="detail-section">
          <h4>任务描述</h4>
          <p>{{ selectedTask.description }}</p>
        </div>

        <!-- 任务进度 -->
        <div class="detail-section" v-if="selectedTask.status === 'in_progress'">
          <h4>任务进度</h4>
          <a-progress :percent="selectedTask.progress" />
          <a-button type="primary" size="small" @click="updateTaskProgress" style="margin-top: 8px">
            更新进度
          </a-button>
        </div>

        <!-- 时间信息 -->
        <div class="detail-section">
          <h4>时间信息</h4>
          <a-descriptions size="small" :column="1">
            <a-descriptions-item label="创建时间">{{ formatDateTime(selectedTask.createdAt) }}</a-descriptions-item>
            <a-descriptions-item label="截止时间" :label-style="{ color: isOverdue(selectedTask.deadline) ? '#f50' : '' }">
              {{ formatDateTime(selectedTask.deadline) }}
            </a-descriptions-item>
            <a-descriptions-item label="预估工时">{{ selectedTask.estimatedHours }}小时</a-descriptions-item>
            <a-descriptions-item label="实际工时" v-if="selectedTask.timeSpent">{{ selectedTask.timeSpent }}小时</a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 协作成员 -->
        <div class="detail-section">
          <h4>协作成员</h4>
          <a-space>
            <a-avatar v-for="member in selectedTask.collaborators" :key="member.id" :title="member.name">
              {{ member.name.substring(0, 1) }}
            </a-avatar>
          </a-space>
        </div>

        <!-- 任务讨论 -->
        <div class="detail-section">
          <h4>任务讨论</h4>
          <div class="discussion-list">
            <div v-for="comment in selectedTask.comments" :key="comment.id" class="comment-item">
              <a-comment>
                <template #avatar>
                  <a-avatar>{{ comment.author.substring(0, 1) }}</a-avatar>
                </template>
                <template #content>
                  <p>{{ comment.content }}</p>
                </template>
                <template #datetime>
                  <span>{{ formatDateTime(comment.createdAt) }}</span>
                </template>
              </a-comment>
            </div>
          </div>
          <div class="add-comment">
            <a-textarea 
              v-model:value="newComment" 
              placeholder="添加讨论..." 
              :rows="3"
              style="margin-bottom: 8px"
            />
            <a-button type="primary" size="small" @click="addComment">发布</a-button>
          </div>
        </div>

        <!-- 任务操作 -->
        <div class="detail-actions">
          <a-space>
            <a-button v-if="selectedTask.status === 'todo'" type="primary" @click="startSelectedTask">
              开始任务
            </a-button>
            <a-button v-if="selectedTask.status === 'in_progress'" @click="pauseSelectedTask">
              暂停任务
            </a-button>
            <a-button v-if="selectedTask.status === 'in_progress'" type="primary" @click="completeSelectedTask">
              完成任务
            </a-button>
            <a-button @click="editSelectedTask">编辑任务</a-button>
          </a-space>
        </div>
      </div>
    </a-drawer>

    <!-- 番茄工作法计时器 -->
    <div v-if="pomodoroActive" class="pomodoro-timer">
      <a-card size="small" class="timer-card">
        <div class="timer-content">
          <ClockCircleOutlined />
          <span class="timer-text">{{ formatTime(pomodoroTime) }}</span>
          <a-button type="text" size="small" @click="stopPomodoro">
            <CloseOutlined />
          </a-button>
        </div>
      </a-card>
    </div>

    <!-- 进度更新弹窗 -->
    <a-modal
      v-model:open="progressUpdateVisible"
      title="更新任务进度"
      @ok="submitProgressUpdate"
      @cancel="progressUpdateVisible = false"
      width="600px"
    >
      <div v-if="currentTaskForUpdate" class="progress-update-form">
        <div class="task-info-section">
          <h4>{{ currentTaskForUpdate.title }}</h4>
          <p class="task-description">{{ currentTaskForUpdate.description }}</p>
        </div>
        
        <a-form layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="任务进度 (%)">
                <a-slider
                  v-model:value="progressForm.progress"
                  :min="0"
                  :max="100"
                  :step="1"
                  :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
                />
                <a-input-number
                  v-model:value="progressForm.progress"
                  :min="0"
                  :max="100"
                  formatter="value => `${value}%`"
                  parser="value => value.replace('%', '')"
                  style="width: 100%; margin-top: 8px;"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="任务状态">
                <a-select v-model:value="progressForm.status" style="width: 100%">
                  <a-select-option value="todo">待开始</a-select-option>
                  <a-select-option value="in_progress">进行中</a-select-option>
                  <a-select-option value="done">已完成</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="本次工时 (小时)">
            <a-input-number
              v-model:value="progressForm.workHours"
              :min="0"
              :max="24"
              :step="0.5"
              placeholder="请输入本次工作时长"
              style="width: 100%"
            />
          </a-form-item>
          
          <a-form-item label="工作内容说明">
            <a-textarea
              v-model:value="progressForm.comment"
              placeholder="请描述本次完成的工作内容..."
              :rows="3"
            />
          </a-form-item>
          
          <a-form-item label="遇到的问题 (可选)">
            <a-textarea
              v-model:value="progressForm.issues"
              placeholder="如有遇到问题或需要协助的地方，请描述..."
              :rows="2"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import draggable from 'vuedraggable'
import dayjs from 'dayjs'
import { useTaskSyncStore } from '@/store/taskSync'
import {
  ArrowUpOutlined,
  SyncOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  DownOutlined,
  InboxOutlined,
  PlusOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PercentageOutlined,
  CheckOutlined,
  ShareAltOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

// 任务同步store
const taskSyncStore = useTaskSyncStore()

// 响应式数据
const currentView = ref('kanban')
const searchKeyword = ref('')
const filterProject = ref(undefined)
const filterPriority = ref(undefined)
const taskDetailVisible = ref(false)
const selectedTask = ref(null)
const newComment = ref('')
const pomodoroActive = ref(false)
const pomodoroTime = ref(25 * 60) // 25分钟
const pomodoroTimer = ref(null)
const progressUpdateVisible = ref(false)
const currentTaskForUpdate = ref(null)
const progressForm = reactive({
  progress: 0,
  status: '',
  workHours: 0,
  comment: '',
  issues: ''
})

// 任务统计
const taskStats = reactive({
  todo: 8,
  inProgress: 3,
  done: 12,
  newTasks: 2,
  weeklyDone: 5,
  completionRate: 85
})

// 项目列表
const projects = ref([
  { id: 1, name: '智能科研管理系统' },
  { id: 2, name: 'AI助手集成项目' },
  { id: 3, name: '数据分析平台' }
])

// 任务数据
const todoTasks = ref([
  {
    id: 1,
    title: '用户登录模块开发',
    description: '实现用户登录、注册、密码重置功能',
    priority: 'high',
    status: 'todo',
    projectName: '智能科研管理系统',
    deadline: '2024-02-15',
    estimatedHours: 8,
    collaborators: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ],
    createdAt: '2024-01-20 09:00:00',
    comments: []
  },
  {
    id: 2,
    title: '数据库设计优化',
    description: '优化数据库表结构，提升查询性能',
    priority: 'medium',
    status: 'todo',
    projectName: '智能科研管理系统',
    deadline: '2024-02-20',
    estimatedHours: 12,
    collaborators: [
      { id: 3, name: '王五' }
    ],
    createdAt: '2024-01-22 14:30:00',
    comments: []
  }
])

const progressTasks = ref([
  {
    id: 3,
    title: 'API接口开发',
    description: '开发项目管理相关的REST API接口',
    priority: 'urgent',
    status: 'in_progress',
    projectName: '智能科研管理系统',
    deadline: '2024-02-10',
    progress: 65,
    timeSpent: 15,
    estimatedHours: 20,
    collaborators: [
      { id: 1, name: '张三' }
    ],
    createdAt: '2024-01-15 10:00:00',
    comments: [
      {
        id: 1,
        author: '张三',
        content: '已完成用户认证相关接口',
        createdAt: '2024-01-25 16:30:00'
      }
    ]
  }
])

const doneTasks = ref([
  {
    id: 4,
    title: '需求分析文档',
    description: '完成项目需求分析和技术方案设计',
    priority: 'high',
    status: 'done',
    projectName: '智能科研管理系统',
    deadline: '2024-01-30',
    completedAt: '2024-01-28',
    rating: 5,
    collaborators: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ],
    createdAt: '2024-01-10 09:00:00',
    comments: []
  }
])

// 计算属性
const allTasks = computed(() => [
  ...todoTasks.value,
  ...progressTasks.value,
  ...doneTasks.value
])

// 工具方法
const getPriorityColor = (priority) => {
  const colors = {
    'urgent': 'red',
    'high': 'orange',
    'medium': 'blue',
    'low': 'green'
  }
  return colors[priority] || 'default'
}

const getPriorityText = (priority) => {
  const texts = {
    'urgent': '紧急',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return texts[priority] || '未知'
}

const getStatusColor = (status) => {
  const colors = {
    'todo': 'default',
    'in_progress': 'blue',
    'done': 'green'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    'todo': '待办',
    'in_progress': '进行中',
    'done': '已完成'
  }
  return texts[status] || '未知'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 50) return '#1890ff'
  if (progress >= 30) return '#faad14'
  return '#f5222d'
}

const isOverdue = (deadline) => {
  return dayjs().isAfter(dayjs(deadline))
}

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

const formatDateTime = (datetime) => {
  return dayjs(datetime).format('YYYY-MM-DD HH:mm')
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 事件处理方法
const handleSearch = () => {
  message.info(`搜索: ${searchKeyword.value}`)
}

const changeView = (view) => {
  currentView.value = view
  message.info(`切换到${view}视图`)
}

const handleTaskMove = (evt) => {
  console.log('任务移动:', evt)
  // 这里可以实现任务状态自动更新
}

const addTask = () => {
  message.info('添加新任务')
}

const viewTaskDetail = (task) => {
  selectedTask.value = task
  taskDetailVisible.value = true
}

const startTask = (task) => {
  message.success(`开始任务: ${task.title}`)
}

const editTask = (task) => {
  message.info(`编辑任务: ${task.title}`)
}

const updateProgress = async (task) => {
  // 显示进度更新弹窗
  progressUpdateVisible.value = true
  currentTaskForUpdate.value = task
  
  // 初始化表单数据
  progressForm.progress = task.progress || 0
  progressForm.status = task.status || 'todo'
  progressForm.workHours = 0
  progressForm.comment = ''
  progressForm.issues = ''
}

// 提交进度更新
const submitProgressUpdate = async () => {
  try {
    const task = currentTaskForUpdate.value
    if (!task) return
    
    // 构建更新数据
    const updateData = {
      progress: progressForm.progress,
      status: progressForm.status,
      lastUpdated: new Date().toISOString(),
      updateHistory: [
        ...(task.updateHistory || []),
        {
          id: Date.now(),
          userId: 'current_user', // 实际应用中从用户状态获取
          userName: '当前用户', // 实际应用中从用户状态获取
          timestamp: new Date().toISOString(),
          action: 'progress_update',
          oldProgress: task.progress || 0,
          newProgress: progressForm.progress,
          comment: progressForm.comment,
          workHours: progressForm.workHours,
          issues: progressForm.issues
        }
      ]
    }
    
    // 如果进度达到100%，自动设置为完成状态
    if (progressForm.progress >= 100) {
      updateData.status = 'done'
      updateData.completedAt = new Date().toISOString()
    }
    
    // 使用任务同步store更新任务
    await taskSyncStore.updateTask(task.projectName, task.id, updateData)
    
    // 更新本地任务数据
    Object.assign(task, updateData)
    
    // 如果状态发生变化，需要在看板间移动任务
    updateTaskLocation(task)
    
    message.success('任务进度更新成功')
    progressUpdateVisible.value = false
    currentTaskForUpdate.value = null
    
  } catch (error) {
    console.error('进度更新失败:', error)
    message.error('进度更新失败，请重试')
  }
}

// 更新任务在看板中的位置
const updateTaskLocation = (updatedTask) => {
  // 从所有列表中移除任务
  todoTasks.value = todoTasks.value.filter(t => t.id !== updatedTask.id)
  inProgressTasks.value = inProgressTasks.value.filter(t => t.id !== updatedTask.id)
  doneTasks.value = doneTasks.value.filter(t => t.id !== updatedTask.id)
  
  // 根据新状态添加到对应列表
  switch (updatedTask.status) {
    case 'todo':
      todoTasks.value.push(updatedTask)
      break
    case 'in_progress':
      inProgressTasks.value.push(updatedTask)
      break
    case 'done':
      doneTasks.value.push(updatedTask)
      break
  }
}

const pauseTask = (task) => {
  message.info(`暂停任务: ${task.title}`)
}

const shareTask = (task) => {
  message.info(`分享任务: ${task.title}`)
}

const archiveTask = (task) => {
  message.info(`归档任务: ${task.title}`)
}

const archiveDoneTasks = () => {
  message.info('批量归档已完成任务')
}

// 番茄工作法
const startPomodoro = () => {
  if (pomodoroActive.value) {
    stopPomodoro()
    return
  }
  
  pomodoroActive.value = true
  pomodoroTime.value = 25 * 60
  
  pomodoroTimer.value = setInterval(() => {
    pomodoroTime.value--
    if (pomodoroTime.value <= 0) {
      stopPomodoro()
      message.success('番茄时间结束！休息一下吧')
    }
  }, 1000)
  
  message.success('番茄工作法开始，专注25分钟！')
}

const stopPomodoro = () => {
  pomodoroActive.value = false
  if (pomodoroTimer.value) {
    clearInterval(pomodoroTimer.value)
    pomodoroTimer.value = null
  }
}

// 任务详情操作
const updateTaskProgress = () => {
  message.info('更新任务进度')
}

const addComment = () => {
  if (!newComment.value.trim()) return
  
  const comment = {
    id: Date.now(),
    author: '当前用户',
    content: newComment.value,
    createdAt: new Date().toISOString()
  }
  
  selectedTask.value.comments.push(comment)
  newComment.value = ''
  message.success('评论已添加')
}

const startSelectedTask = () => {
  selectedTask.value.status = 'in_progress'
  message.success('任务已开始')
}

const pauseSelectedTask = () => {
  message.info('任务已暂停')
}

const completeSelectedTask = () => {
  selectedTask.value.status = 'done'
  selectedTask.value.completedAt = new Date().toISOString()
  message.success('任务已完成')
}

const editSelectedTask = () => {
  message.info('编辑任务')
}

const showTimeRecord = () => {
  message.info('显示工时记录')
}

// 生命周期
onMounted(() => {
  // 初始化数据
})

onUnmounted(() => {
  if (pomodoroTimer.value) {
    clearInterval(pomodoroTimer.value)
  }
})
</script>

<style scoped>
.task-board {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  color: #234fa2;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.task-overview {
  margin-bottom: 24px;
}

.overview-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-trend {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.quick-actions {
  margin-bottom: 24px;
}

.actions-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.kanban-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.kanban-column {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.todo-column .column-header {
  background: #fff2e8;
  color: #fa8c16;
}

.progress-column .column-header {
  background: #e6f7ff;
  color: #1890ff;
}

.done-column .column-header {
  background: #f6ffed;
  color: #52c41a;
}

.column-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.task-list {
  min-height: 100px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.task-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.active-task {
  border-left-color: #1890ff;
}

.completed-task {
  border-left-color: #52c41a;
  opacity: 0.8;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  font-weight: 600;
  font-size: 14px;
  flex: 1;
  margin-right: 8px;
}

.task-content {
  margin-bottom: 12px;
}

.task-description {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.task-progress {
  margin: 8px 0;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999;
}

.task-project {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.task-deadline.overdue {
  color: #f50;
  font-weight: bold;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.task-detail {
  padding: 16px 0;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section h3,
.detail-section h4 {
  margin-bottom: 12px;
  color: #234fa2;
}

.discussion-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.add-comment {
  margin-top: 16px;
}

.detail-actions {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.pomodoro-timer {
  position: fixed;
  top: 100px;
  right: 24px;
  z-index: 1000;
}

.timer-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.timer-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f50;
  font-weight: bold;
}

.timer-text {
  font-family: 'Courier New', monospace;
  font-size: 16px;
}

/* 自定义滚动条 */
.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>