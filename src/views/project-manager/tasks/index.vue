<template>
  <div class="task-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>任务管理</h1>
      <p class="subtitle">任务分配与进度跟踪</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <UnorderedListOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalTasks }}</div>
                <div class="stat-label">总任务数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <ClockCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.activeTasks }}</div>
                <div class="stat-label">进行中任务</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <ExclamationCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.overdueTasks }}</div>
                <div class="stat-label">逾期任务</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <CheckCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.completedTasks }}</div>
                <div class="stat-label">已完成任务</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <a-card class="search-card">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="任务名称">
            <a-input
              v-model:value="searchForm.name"
              placeholder="请输入任务名称"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="任务状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              allow-clear
              style="width: 150px"
            >
              <a-select-option value="pending">待开始</a-select-option>
              <a-select-option value="active">进行中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="suspended">已暂停</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="优先级">
            <a-select
              v-model:value="searchForm.priority"
              placeholder="请选择优先级"
              allow-clear
              style="width: 120px"
            >
              <a-select-option value="high">高</a-select-option>
              <a-select-option value="medium">中</a-select-option>
              <a-select-option value="low">低</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="负责人">
            <a-input
              v-model:value="searchForm.assignee"
              placeholder="请输入负责人"
              allow-clear
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined />
              搜索
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              <ReloadOutlined />
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 操作按钮区域 -->
    <div class="actions-section">
      <a-space>
        <a-button type="primary" @click="createTask">
          <PlusOutlined />
          新建任务
        </a-button>
        <a-button @click="batchAssign">
          <TeamOutlined />
          批量分配
        </a-button>
        <a-button @click="exportTasks">
          <DownloadOutlined />
          导出任务
        </a-button>
        <a-button @click="refreshData">
          <ReloadOutlined />
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-section">
      <a-card class="tasks-card">
        <a-table
          :dataSource="taskList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          rowKey="id"
          @change="handleTableChange"
          :row-selection="rowSelection"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'priority'">
              <a-tag :color="getPriorityColor(record.priority)">
                {{ getPriorityText(record.priority) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'progress'">
              <a-progress
                :percent="record.progress"
                :stroke-color="getProgressColor(record.progress)"
                size="small"
              />
            </template>
            <template v-else-if="column.key === 'deadline'">
              <span :class="{ 'overdue': isOverdue(record.deadline) }">
                {{ record.deadline }}
              </span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewTask(record)">
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editTask(record)">
                  编辑
                </a-button>
                <a-dropdown>
                  <a-button type="link" size="small">
                    更多
                    <DownOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="assignTask(record)">
                        <UserOutlined />
                        分配任务
                      </a-menu-item>
                      <a-menu-item @click="updateProgress(record)">
                        <EditOutlined />
                        更新进度
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item danger @click="deleteTask(record)">
                        <DeleteOutlined />
                        删除任务
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 任务详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="任务详情"
      width="700px"
      :footer="null"
      destroy-on-close
    >
      <div v-if="currentTask" class="task-detail">
        <a-descriptions title="基本信息" :column="2" bordered>
          <a-descriptions-item label="任务名称">
            {{ currentTask.name }}
          </a-descriptions-item>
          <a-descriptions-item label="任务编号">
            {{ currentTask.code }}
          </a-descriptions-item>
          <a-descriptions-item label="所属项目">
            {{ currentTask.project }}
          </a-descriptions-item>
          <a-descriptions-item label="任务状态">
            <a-tag :color="getStatusColor(currentTask.status)">
              {{ getStatusText(currentTask.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(currentTask.priority)">
              {{ getPriorityText(currentTask.priority) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="任务进度">
            <a-progress
              :percent="currentTask.progress"
              :stroke-color="getProgressColor(currentTask.progress)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="负责人">
            {{ currentTask.assignee }}
          </a-descriptions-item>
          <a-descriptions-item label="截止日期">
            <span :class="{ 'overdue': isOverdue(currentTask.deadline) }">
              {{ currentTask.deadline }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="任务描述" :span="2">
            {{ currentTask.description }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="comments" tab="任务评论">
            <a-list
              :dataSource="currentTask.comments"
              item-layout="horizontal"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar>{{ item.user.charAt(0) }}</a-avatar>
                    </template>
                    <template #title>{{ item.user }}</template>
                    <template #description>{{ item.time }}</template>
                  </a-list-item-meta>
                  <div class="comment-content">{{ item.content }}</div>
                </a-list-item>
              </template>
            </a-list>
            <a-divider />
            <a-textarea
              v-model:value="newComment"
              placeholder="添加评论..."
              :rows="3"
            />
            <a-button type="primary" style="margin-top: 8px" @click="addComment">
              发表评论
            </a-button>
          </a-tab-pane>
          <a-tab-pane key="history" tab="任务历史">
            <a-timeline>
              <a-timeline-item v-for="item in currentTask.history" :key="item.id">
                <template #dot>
                  <component :is="getTimelineIcon(item.icon)" />
                </template>
                <p>{{ item.action }}</p>
                <p class="timeline-time">{{ item.time }}</p>
              </a-timeline-item>
            </a-timeline>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>

    <!-- 新建/编辑任务弹窗 -->
    <a-modal
      v-model:open="editVisible"
      :title="editForm.id ? '编辑任务' : '新建任务'"
      @ok="handleEditOk"
      @cancel="editVisible = false"
      width="700px"
    >
      <a-form :model="editForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="任务名称" required>
              <a-input v-model:value="editForm.name" placeholder="请输入任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="任务编号" required>
              <a-input v-model:value="editForm.code" placeholder="请输入任务编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属项目">
              <a-input v-model:value="editForm.project" placeholder="请输入所属项目" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人">
              <a-input v-model:value="editForm.assignee" placeholder="请输入负责人" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select v-model:value="editForm.status">
                <a-select-option value="pending">待开始</a-select-option>
                <a-select-option value="active">进行中</a-select-option>
                <a-select-option value="completed">已完成</a-select-option>
                <a-select-option value="suspended">已暂停</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="优先级">
              <a-select v-model:value="editForm.priority">
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="进度(%)">
              <a-input-number v-model:value="editForm.progress" :min="0" :max="100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="截止日期">
              <a-date-picker
                v-model:value="editForm.deadline"
                valueFormat="YYYY-MM-DD"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="任务描述">
              <a-textarea v-model:value="editForm.description" :rows="3" placeholder="请输入任务描述" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 更新进度弹窗 -->
    <a-modal
      v-model:open="progressVisible"
      title="更新任务进度"
      @ok="handleProgressOk"
      @cancel="progressVisible = false"
      width="520px"
    >
      <a-form :model="progressForm" layout="vertical">
        <a-form-item label="进度(%)">
          <a-input-number v-model:value="progressForm.progress" :min="0" :max="100" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="progressForm.status">
            <a-select-option value="active">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="suspended">已暂停</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="progressForm.note" :rows="3" placeholder="可填写备注" />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 批量分配弹窗 -->
    <a-modal
      v-model:open="assignVisible"
      title="批量分配任务"
      @ok="handleBatchAssign"
      @cancel="assignVisible = false"
    >
      <a-form :model="assignForm" layout="vertical">
        <a-form-item label="选择负责人">
          <a-select
            v-model:value="assignForm.assignee"
            placeholder="请选择负责人"
            style="width: 100%"
          >
            <a-select-option value="张开发">张开发</a-select-option>
            <a-select-option value="李测试">李测试</a-select-option>
            <a-select-option value="王设计">王设计</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分配说明">
          <a-textarea
            v-model:value="assignForm.note"
            placeholder="请输入分配说明"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { useTaskSyncStore } from '@/store/taskSync'
import {
  UnorderedListOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  TeamOutlined,
  DownloadOutlined,
  DownOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined as PlusIcon,
  UserOutlined as UserIcon,
  PlayCircleOutlined,
  CheckCircleOutlined as CheckIcon,
  EditOutlined as EditIcon
} from '@ant-design/icons-vue'

const router = useRouter()

// 任务数据同步store
const taskSyncStore = useTaskSyncStore()

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const assignVisible = ref(false)
const editVisible = ref(false)
const progressVisible = ref(false)
const currentTask = ref(null)
const singleAssignTarget = ref(null) // 区分单个分配与批量分配
const activeTab = ref('comments')
const newComment = ref('')
const selectedRowKeys = ref([])

// 统计数据
const stats = reactive({
  totalTasks: 45,
  activeTasks: 18,
  overdueTasks: 3,
  completedTasks: 24
})

// 搜索表单
const searchForm = reactive({
  name: '',
  status: undefined,
  priority: undefined,
  assignee: ''
})

// 分配表单
const assignForm = reactive({
  assignee: '',
  note: ''
})

// 编辑表单（用于新建/编辑）
const editForm = reactive({
  id: null,
  name: '',
  code: '',
  project: '',
  status: 'pending',
  priority: 'medium',
  progress: 0,
  assignee: '',
  deadline: null,
  description: ''
})

// 进度更新表单
const progressForm = reactive({
  progress: 0,
  status: 'active',
  note: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
})

// 行选择配置
const rowSelection = reactive({
  selectedRowKeys: selectedRowKeys,
  onChange: (selectedRowKeys, selectedRows) => {
    selectedRowKeys.value = selectedRowKeys
  }
})

// 任务列表数据
const taskList = ref([
  {
    id: 1,
    name: '需求分析文档编写',
    code: 'TASK-001',
    project: '智能科研管理系统开发',
    status: 'active',
    priority: 'high',
    progress: 80,
    assignee: '张开发',
    deadline: '2024-02-15',
    description: '编写详细的需求分析文档，包括功能需求和非功能需求',
    comments: [
      { user: '张开发', time: '2024-02-10 14:30', content: '已完成80%的需求分析' },
      { user: '李经理', time: '2024-02-10 15:00', content: '请加快进度，下周需要评审' }
    ],
    history: [
      { id: 1, action: '任务创建', time: '2024-02-01 09:00', icon: 'plus' },
      { id: 2, action: '分配给张开发', time: '2024-02-01 10:00', icon: 'user' },
      { id: 3, action: '开始执行', time: '2024-02-02 09:00', icon: 'play' }
    ]
  },
  {
    id: 2,
    name: '系统架构设计',
    code: 'TASK-002',
    project: '智能科研管理系统开发',
    status: 'pending',
    priority: 'high',
    progress: 0,
    assignee: '王架构',
    deadline: '2024-02-20',
    description: '设计系统整体架构，包括技术选型和架构图',
    comments: [],
    history: [
      { id: 1, action: '任务创建', time: '2024-02-05 09:00', icon: 'plus' }
    ]
  },
  {
    id: 3,
    name: '前端界面开发',
    code: 'TASK-003',
    project: '智能科研管理系统开发',
    status: 'active',
    priority: 'medium',
    progress: 60,
    assignee: '李前端',
    deadline: '2024-03-01',
    description: '开发系统前端界面，包括用户界面和交互逻辑',
    comments: [
      { user: '李前端', time: '2024-02-08 16:00', content: '已完成登录和主页面开发' }
    ],
    history: [
      { id: 1, action: '任务创建', time: '2024-02-01 09:00', icon: 'plus' },
      { id: 2, action: '分配给李前端', time: '2024-02-01 11:00', icon: 'user' },
      { id: 3, action: '开始执行', time: '2024-02-03 09:00', icon: 'play' }
    ]
  },
  {
    id: 4,
    name: '数据库设计',
    code: 'TASK-004',
    project: '数据分析平台建设',
    status: 'completed',
    priority: 'high',
    progress: 100,
    assignee: '赵数据库',
    deadline: '2024-01-31',
    description: '设计数据库结构，包括表设计和关系图',
    comments: [
      { user: '赵数据库', time: '2024-01-30 17:00', content: '数据库设计已完成，等待评审' },
      { user: '陈架构', time: '2024-01-31 10:00', content: '设计合理，可以开始实施' }
    ],
    history: [
      { id: 1, action: '任务创建', time: '2024-01-15 09:00', icon: 'plus' },
      { id: 2, action: '分配给赵数据库', time: '2024-01-15 10:00', icon: 'user' },
      { id: 3, action: '开始执行', time: '2024-01-16 09:00', icon: 'play' },
      { id: 4, action: '任务完成', time: '2024-01-31 16:00', icon: 'check' }
    ]
  }
])

// 表格列定义
const columns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    fixed: 'left'
  },
  {
    title: '任务编号',
    dataIndex: 'code',
    key: 'code',
    width: 120
  },
  {
    title: '所属项目',
    dataIndex: 'project',
    key: 'project',
    width: 180
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 150
  },
  {
    title: '负责人',
    dataIndex: 'assignee',
    key: 'assignee',
    width: 120
  },
  {
    title: '截止日期',
    dataIndex: 'deadline',
    key: 'deadline',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 状态颜色映射
const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    active: 'blue',
    completed: 'green',
    suspended: 'red'
  }
  return colorMap[status] || 'default'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    pending: '待开始',
    active: '进行中',
    completed: '已完成',
    suspended: '已暂停'
  }
  return textMap[status] || '未知'
}

// 优先级颜色映射
const getPriorityColor = (priority) => {
  const colorMap = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colorMap[priority] || 'default'
}

// 优先级文本映射
const getPriorityText = (priority) => {
  const textMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || '未知'
}

// 进度颜色映射
const getProgressColor = (progress) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 60) return '#1890ff'
  if (progress >= 40) return '#faad14'
  return '#f5222d'
}

// 检查是否逾期
const isOverdue = (deadline) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  return deadlineDate < today
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: undefined,
    priority: undefined,
    assignee: ''
  })
  handleSearch()
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 查看任务详情
const viewTask = (record) => {
  currentTask.value = record
  detailVisible.value = true
}

// 编辑任务（打开弹窗）
const editTask = (record) => {
  if (!record) return
  console.log('🔧 打开编辑任务弹窗:', record)
  Object.assign(editForm, {
    id: record.id,
    name: record.name,
    code: record.code,
    project: record.project,
    status: record.status,
    priority: record.priority,
    progress: record.progress,
    assignee: record.assignee,
    deadline: record.deadline ? (typeof record.deadline === 'string' ? record.deadline : record.deadline) : null,
    description: record.description
  })
  editVisible.value = true
  message.info(`正在编辑：${record.name}`)
}

// 创建任务（打开编辑弹窗并重置表单）
const createTask = () => {
  Object.assign(editForm, {
    id: null,
    name: '',
    code: '',
    project: '',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    assignee: '',
    deadline: '',
    description: ''
  })
  editVisible.value = true
}

// 分配任务（单个）
const assignTask = (record) => {
  singleAssignTarget.value = record
  assignForm.assignee = record.assignee || ''
  assignForm.note = ''
  assignVisible.value = true
}

// 更新进度（打开弹窗）
const updateProgress = (record) => {
  currentTask.value = record
  progressForm.progress = record.progress
  progressForm.status = record.status === 'completed' ? 'completed' : (record.status || 'active')
  progressForm.note = ''
  progressVisible.value = true
}

// 删除任务
const deleteTask = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除任务 “${record.name}” 吗？此操作不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      const idx = taskList.value.findIndex(t => t.id === record.id)
      if (idx !== -1) {
        taskList.value.splice(idx, 1)
        pagination.total = taskList.value.length
        message.success('删除成功')
      }
    }
  })
}

// 批量分配
const batchAssign = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择需要分配的任务')
    return
  }
  singleAssignTarget.value = null
  assignForm.assignee = ''
  assignForm.note = ''
  assignVisible.value = true
}

// 处理分配（支持单个或批量）
const handleBatchAssign = () => {
  const applyAssign = (task) => {
    task.assignee = assignForm.assignee
    if (!task.history) task.history = []
    task.history.push({
      id: Date.now(),
      action: `分配任务给 ${assignForm.assignee}`,
      time: new Date().toLocaleString(),
      icon: 'user'
    })
  }
  if (singleAssignTarget.value) {
    applyAssign(singleAssignTarget.value)
  } else {
    const keySet = new Set(selectedRowKeys.value)
    taskList.value.forEach(t => {
      if (keySet.has(t.id)) applyAssign(t)
    })
  }
  assignVisible.value = false
  message.success('分配成功')
}

// 导出任务（CSV）
const exportTasks = () => {
  const headers = ['任务名称','任务编号','所属项目','状态','优先级','进度','负责人','截止日期']
  const rows = taskList.value.map(t => [
    t.name, t.code, t.project, getStatusText(t.status), getPriorityText(t.priority), `${t.progress}%`, t.assignee, t.deadline
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(x => `"${(x||'').toString().replace(/"/g,'""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `任务列表_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 添加评论
const addComment = () => {
  if (!newComment.value.trim()) return
  
  const comment = {
    user: '当前用户',
    time: new Date().toLocaleString(),
    content: newComment.value
  }
  
  currentTask.value.comments.push(comment)
  newComment.value = ''
}

// 保存编辑（新建或编辑）
const handleEditOk = () => {
  if (!editForm.name || !editForm.code) {
    message.warning('请填写任务名称和任务编号')
    return
  }
  if (editForm.id == null) {
    // 新建
    const newId = Math.max(0, ...taskList.value.map(t => Number(t.id))) + 1
    const newTask = {
      ...editForm,
      id: newId,
      progress: editForm.progress || 0,
      deadline: editForm.deadline || '',
      comments: [],
      history: []
    }
    taskList.value.unshift(newTask)
    pagination.total = taskList.value.length
    message.success('新建任务成功')
  } else {
    // 更新
    const idx = taskList.value.findIndex(t => t.id === editForm.id)
    if (idx !== -1) {
      taskList.value[idx] = {
        ...taskList.value[idx],
        ...editForm,
        deadline: editForm.deadline || ''
      }
      message.success('任务更新成功')
    }
  }
  editVisible.value = false
}

// 确认更新进度
const handleProgressOk = () => {
  if (!currentTask.value) return
  const newProgress = Math.max(0, Math.min(100, Number(progressForm.progress) || 0))
  const newStatus = progressForm.status || (newProgress >= 100 ? 'completed' : 'active')
  currentTask.value.progress = newProgress
  currentTask.value.status = newStatus
  if (!currentTask.value.history) currentTask.value.history = []
  currentTask.value.history.push({
    id: Date.now(),
    action: `更新进度到 ${newProgress}%（状态：${getStatusText(newStatus)}）`,
    time: new Date().toLocaleString(),
    icon: 'edit'
  })
  progressVisible.value = false
  message.success('进度已更新')
}

// 处理任务数据更新事件
const handleTaskDataUpdated = (event) => {
  const { projectId, taskKey, updates } = event.detail
  
  console.log(`📥 任务管理页面接收到任务更新: ${projectId}_${taskKey}`, updates)
  
  // 查找并更新对应的任务数据
  const task = taskList.value.find(t => t.code === taskKey)
  if (task) {
    Object.assign(task, updates)
    message.info(`任务 "${task.name}" 已同步更新`)
  }
  
  // 如果是当前查看的任务详情，也要更新
  if (currentTask.value && currentTask.value.code === taskKey) {
    Object.assign(currentTask.value, updates)
  }
}

// 生命周期
onMounted(() => {
  pagination.total = taskList.value.length
  
  console.log('🚀 任务管理页面已挂载，开始监听任务数据同步')
  
  // 监听任务数据更新事件
  window.addEventListener('taskDataUpdated', handleTaskDataUpdated)
})

onUnmounted(() => {
  console.log('🔚 任务管理页面已卸载，停止监听任务数据同步')
  
  // 清理事件监听器
  window.removeEventListener('taskDataUpdated', handleTaskDataUpdated)
})

// 时间线图标映射
const getTimelineIcon = (type) => {
  const map = {
    plus: PlusIcon,
    user: UserIcon,
    play: PlayCircleOutlined,
    check: CheckIcon,
    edit: EditIcon
  }
  return map[type] || 'span'
}
</script>

<style scoped>
.task-management {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #234fa2;
  margin: 0 0 8px 0;
}

.page-header .subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #234fa2;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.search-section {
  margin-bottom: 16px;
}

.search-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.actions-section {
  margin-bottom: 16px;
}

.tasks-section {
  margin-bottom: 24px;
}

.tasks-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-detail {
  max-height: 600px;
  overflow-y: auto;
}

.comment-content {
  margin-top: 8px;
  color: #666;
}

.timeline-time {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

.overdue {
  color: #f5222d;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-management {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}
</style> 