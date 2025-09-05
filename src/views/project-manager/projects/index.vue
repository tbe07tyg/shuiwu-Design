<template>
  <div class="project-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>项目管理</h1>
      <p class="subtitle">项目列表与详情管理</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <a-card class="search-card">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="项目名称">
            <a-input
              v-model:value="searchForm.name"
              placeholder="请输入项目名称"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="项目状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              allow-clear
              style="width: 150px"
            >
              <a-select-option value="active">进行中</a-select-option>
              <a-select-option value="planning">规划中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="项目经理">
            <a-input
              v-model:value="searchForm.manager"
              placeholder="请输入项目经理"
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

            <!-- 项目来源说明和状态操作逻辑 -->
        <div class="info-section">
          <a-alert 
            message="项目来源说明" 
            description="项目由立项审批通过后自动创建，项目经理无需手动添加项目。所有项目均来自已通过审批的立项申请。"
            type="info" 
            show-icon 
            style="margin-bottom: 16px;"
          />
          
          <!-- 状态和操作逻辑说明 - 可折叠面板 -->
          <a-collapse 
            v-model:activeKey="flowPanelActiveKey"
            size="small" 
            style="margin-bottom: 16px;"
            :bordered="false"
            class="flow-collapse"
          >
            <a-collapse-panel key="flow" header="📋 项目状态与操作流程">
              <a-row :gutter="[16, 16]">
                <a-col :span="12">
                  <div class="status-flow">
                    <h4 style="color: #234fa2; margin-bottom: 12px;">
                      <RocketOutlined /> 项目状态流程
                    </h4>
                    <div class="flow-steps">
                      <div class="flow-item">
                        <a-tag color="orange">1. 规划中</a-tag>
                        <span class="flow-desc">立项通过 → 等待配置</span>
                      </div>
                      <div class="flow-arrow">↓</div>
                      <div class="flow-item">
                        <a-tag color="cyan">2. 已配置</a-tag>
                        <span class="flow-desc">配置完成 → 等待启动</span>
                      </div>
                      <div class="flow-arrow">↓</div>
                      <div class="flow-item">
                        <a-tag color="blue">3. 进行中</a-tag>
                        <span class="flow-desc">项目启动 → 执行监控</span>
                      </div>
                      <div class="flow-arrow">↓</div>
                      <div class="flow-item">
                        <a-tag color="green">4. 已完成</a-tag>
                        <span class="flow-desc">项目结束 → 成果归档</span>
                      </div>
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="operation-guide">
                    <h4 style="color: #234fa2; margin-bottom: 12px;">
                      <SettingOutlined /> 对应操作说明
                    </h4>
                    <div class="operation-list">
                      <div class="operation-item">
                        <a-tag color="orange">1. 立即配置</a-tag>
                        <span>设置WBS任务、分配团队成员</span>
                      </div>
                      <div class="flow-arrow">↓</div>
                      <div class="operation-item">
                        <a-tag color="cyan">2. 启动项目</a-tag>
                        <span>验证团队&任务 → 正式启动</span>
                      </div>
                      <div class="flow-arrow">↓</div>
                      <div class="operation-item">
                        <a-tag color="blue">3. 项目监控</a-tag>
                        <span>查看进度甘特图和任务管理</span>
                      </div>
                      <div class="flow-arrow">↓</div>
                      <div class="operation-item">
                        <a-tag color="green">4. 项目归档</a-tag>
                        <span>成果整理和文档归档</span>
                        <a-button type="link" size="small" @click="goToArchive" style="padding: 0; margin-left: 8px;">
                          查看归档 →
                        </a-button>
                      </div>
                    </div>
                  </div>
                </a-col>
              </a-row>
              
              <a-divider style="margin: 16px 0;" />
              
              <div class="sort-info">
                <h4 style="color: #234fa2; margin-bottom: 8px;">
                  <FileTextOutlined /> 列表排序规则
                </h4>
                <p style="color: #666; margin: 0 0 12px 0;">
                  项目列表按照 <strong>状态流程顺序</strong> 和 <strong>操作紧急度</strong> 从上往下排序：
                </p>
                <div class="sort-flow">
                  <div class="sort-step">
                    <a-tag color="orange" size="small">规划中</a-tag>
                    <span class="sort-desc">需要立即配置 (最高优先级)</span>
                  </div>
                  <RightOutlined class="sort-arrow" />
                  <div class="sort-step">
                    <a-tag color="cyan" size="small">已配置</a-tag>
                    <span class="sort-desc">等待启动</span>
                  </div>
                  <RightOutlined class="sort-arrow" />
                  <div class="sort-step">
                    <a-tag color="blue" size="small">进行中</a-tag>
                    <span class="sort-desc">持续监控</span>
                  </div>
                  <RightOutlined class="sort-arrow" />
                  <div class="sort-step">
                    <a-tag color="green" size="small">已完成</a-tag>
                    <span class="sort-desc">进行归档</span>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>

        </div>

    <!-- 操作按钮区域 -->
    <div class="actions-section">
      <a-space>
        <a-button @click="batchExport">
          <DownloadOutlined />
          批量导出
        </a-button>
        <a-button @click="refreshData">
          <ReloadOutlined />
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 项目列表 -->
    <div class="projects-section">
      <a-card class="projects-card">
        <a-table
          :dataSource="sortedProjectList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          rowKey="id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'progress'">
              <div class="progress-with-unread">
                <a-progress
                  :percent="getUnifiedProgress(record)"
                  :stroke-color="getProgressColor(getUnifiedProgress(record))"
                  size="small"
                />
                <a-badge
                  v-if="getProjectUnread(record.id) > 0"
                  :count="getProjectUnread(record.id)"
                  :overflow-count="99"
                  class="progress-unread-badge"
                />
              </div>
            </template>
            <template v-else-if="column.key === 'priority'">
              <a-tag :color="getPriorityColor(record.priority)">
                {{ getPriorityText(record.priority) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'statusHint'">
              <span class="status-hint" :class="`hint-${record.detailStatus}`">
                {{ getStatusHint(record) }}
              </span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <!-- 智能主操作按钮 -->
                <a-button 
                  :type="getMainButtonType(record.detailStatus)"
                  size="small" 
                  @click="handleMainAction(record)"
                  :class="`btn-${record.detailStatus}`"
                >
                  <component :is="getMainButtonIcon(record.detailStatus)" />
                  {{ getMainButtonText(record.detailStatus) }}
                </a-button>
                
                <!-- 辅助操作 -->
                <a-button type="link" size="small" @click="viewProject(record)">
                  <EyeOutlined />
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editProject(record)">
                  <EditOutlined />
                  编辑
                </a-button>
                <a-dropdown>
                  <a-button type="link" size="small">
                    更多
                    <DownOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="duplicateProject(record)">
                        <CopyOutlined />
                        复制项目
                      </a-menu-item>
                      <a-menu-item @click="archiveProject(record)">
                        <InboxOutlined />
                        归档项目
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item danger @click="deleteProject(record)">
                        <DeleteOutlined />
                        删除项目
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

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="项目详情"
      width="800px"
      :footer="null"
      destroy-on-close
    >
      <div v-if="currentProject" class="project-detail">
        <a-descriptions title="基本信息" :column="2" bordered>
          <a-descriptions-item label="项目名称">
            {{ currentProject.name }}
          </a-descriptions-item>
          <a-descriptions-item label="项目编号">
            {{ currentProject.code }}
          </a-descriptions-item>
          <a-descriptions-item label="项目经理">
            {{ currentProject.manager }}
          </a-descriptions-item>
          <a-descriptions-item label="项目状态">
            <a-tag :color="getStatusColor(currentProject.status)">
              {{ getStatusText(currentProject.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(currentProject.priority)">
              {{ getPriorityText(currentProject.priority) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="项目进度">
            <a-progress
              :percent="currentProject.progress"
              :stroke-color="getProgressColor(currentProject.progress)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="开始日期">
            {{ currentProject.startDate }}
          </a-descriptions-item>
          <a-descriptions-item label="结束日期">
            {{ currentProject.endDate }}
          </a-descriptions-item>
          <a-descriptions-item label="项目描述" :span="2">
            {{ currentProject.description }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="tasks" tab="任务列表">
            <a-table
              :dataSource="currentProject.tasks"
              :columns="taskColumns"
              :pagination="false"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <div class="task-name-with-unread">
                    <span>{{ record.name }}</span>
                    <a-badge
                      v-if="getTaskUnread(currentProject.id, record.id) > 0"
                      :count="getTaskUnread(currentProject.id, record.id)"
                      :overflow-count="99"
                      class="task-unread-badge"
                    />
                  </div>
                </template>
                <template v-if="column.key === 'assignedTo'">
                  <div class="task-assignee">
                    <a-select
                      :value="record.assignedTo?.id"
                      placeholder="选择成员"
                      style="width: 120px"
                      size="small"
                      allow-clear
                      @change="(value) => handleTaskAssign(record, value)"
                    >
                      <a-select-option v-for="member in availableTeamMembers" :key="member.id" :value="member.id">
                        <div class="member-option">
                          <span>{{ member.name }}</span>
                          <small style="color: #999; margin-left: 8px">{{ member.role }}</small>
                        </div>
                      </a-select-option>
                    </a-select>
                  </div>
                </template>
                <template v-else-if="column.key === 'status'">
                  <a-tag :color="getTaskStatusColor(record.status)">
                    {{ getTaskStatusText(record.status) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'progress'">
                  <a-progress
                    :percent="record.progress"
                    size="small"
                  />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space size="small">
                    <a-button type="link" size="small" @click="editTask(record)">
                      <EditOutlined />
                    </a-button>
                    <a-button type="link" size="small" danger @click="removeTask(record)">
                      <DeleteOutlined />
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="team" tab="团队成员">
            <a-list
              :dataSource="currentProject.teamMembers"
              item-layout="horizontal"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar>{{ item.name.charAt(0) }}</a-avatar>
                    </template>
                    <template #title>{{ item.name }}</template>
                    <template #description>{{ item.role }}</template>
                  </a-list-item-meta>
                  <template #actions>
                    <a-tag :color="item.status === 'active' ? 'green' : 'orange'">
                      {{ item.status === 'active' ? '在线' : '离线' }}
                    </a-tag>
                  </template>
                </a-list-item>
              </template>
            </a-list>
          </a-tab-pane>
          <a-tab-pane key="files" tab="项目文件">
            <a-upload
              :file-list="currentProject.files"
              :show-upload-list="{ showPreviewIcon: true, showRemoveIcon: true }"
            >
              <a-button>
                <UploadOutlined />
                上传文件
              </a-button>
            </a-upload>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useTaskSyncStore } from '@/store/taskSync'
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CopyOutlined,
  InboxOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  UploadOutlined,
  DownOutlined,
  RocketOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  RightOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const taskSyncStore = useTaskSyncStore()

// 统一进度：优先使用基于WBS的计算结果
const getUnifiedProgress = (project) => {
  const pid = String(project.id)
  const wbsProgress = taskSyncStore.computeProjectProgress?.(pid)
  if (typeof wbsProgress === 'number' && !Number.isNaN(wbsProgress)) {
    return wbsProgress
  }
  return Number.isFinite(project.progress) ? Math.round(project.progress) : 0
}

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const currentProject = ref(null)
const activeTab = ref('tasks')
const flowPanelActiveKey = ref(['flow']) // 流程面板默认展开

// 搜索表单
const searchForm = reactive({
  name: '',
  status: undefined,
  manager: ''
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

// 项目列表数据
const projectList = ref([
  // 新增：互动联调演示项目（进行中），便于验证团队成员与项目经理监控的互动
  {
    id: 10001,
    name: '互动联调演示项目',
    code: 'PRJ-2025-DEMO-001',
    status: 'active',
    detailStatus: 'active',
    priority: 'high',
    progress: 45,
    manager: '张经理',
    startDate: '2025-01-20',
    endDate: '2025-12-31',
    description: '用于验证团队成员更新进度/评论/操作历史在项目监控中的实时联动',
    nextMilestone: '中期检查',
    milestoneDate: '2025-08-31',
    isConfigured: true,
    tasks: [
      {
        id: 9001,
        name: '联调-前端集成与验证',
        status: 'active',
        progress: 30,
        assignedTo: { id: 99, name: '张三(演示账号)', role: 'developer' },
        startDate: '2025-01-22',
        endDate: '2025-02-15',
        description: '在团队成员看板侧更新进度与评论，观察项目监控侧的同步效果'
      },
      {
        id: 9002,
        name: '联调-材料提交流转',
        status: 'pending',
        progress: 0,
        assignedTo: { id: 99, name: '张三(演示账号)', role: 'developer' },
        startDate: '2025-02-01',
        endDate: '2025-02-20',
        description: '从模板带出材料，成员提交，PM预审并转管理层'
      }
    ],
    teamMembers: [
      { name: '张经理', role: '项目经理', status: 'active' },
      { name: '张三(演示账号)', role: '前端开发', status: 'active' }
    ],
    files: []
  },
  {
    id: 1,
    name: '智能科研管理系统开发',
    code: 'PRJ-2024-001',
    status: 'active',
    detailStatus: 'active', // 智能状态
    priority: 'high',
    progress: 75,
    manager: '张经理',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    description: '开发一套智能化的科研管理系统，提升科研项目管理效率',
    nextMilestone: '中期检查',
    milestoneDate: '2024-03-15',
    isConfigured: true,
    tasks: [
      { id: 1, name: '需求分析', status: 'completed', progress: 100 },
      { id: 2, name: '系统设计', status: 'completed', progress: 100 },
      { id: 3, name: '前端开发', status: 'active', progress: 80 },
      { id: 4, name: '后端开发', status: 'active', progress: 60 },
      { id: 5, name: '系统测试', status: 'pending', progress: 0 }
    ],
    teamMembers: [
      { name: '张经理', role: '项目经理', status: 'active' },
      { name: '李开发', role: '前端开发', status: 'active' },
      { name: '王后端', role: '后端开发', status: 'active' },
      { name: '赵测试', role: '测试工程师', status: 'active' }
    ],
    files: []
  },
  {
    id: 2,
    name: '数据分析平台建设',
    code: 'PRJ-2024-002',
    status: 'planning',
    detailStatus: 'configured',
    priority: 'high',
    progress: 30,
    manager: '李经理',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    description: '构建企业级数据分析平台，支持大数据处理和分析',
    nextMilestone: '项目开题',
    milestoneDate: '2024-02-15',
    isConfigured: false,
    tasks: [
      { 
        id: 1, 
        name: '需求调研', 
        status: 'completed', 
        progress: 100,
        assignedTo: { id: 1, name: '张经理', role: 'manager' },
        startDate: '2024-02-01',
        endDate: '2024-02-10',
        description: '调研用户需求和业务流程'
      },
      { 
        id: 2, 
        name: '技术选型', 
        status: 'active', 
        progress: 80,
        assignedTo: { id: 3, name: '王后端', role: 'developer' },
        startDate: '2024-02-05',
        endDate: '2024-02-15',
        description: '选择合适的技术栈和架构方案'
      },
      { 
        id: 3, 
        name: '架构设计', 
        status: 'pending', 
        progress: 0,
        assignedTo: null,
        startDate: '2024-02-12',
        endDate: '2024-02-20',
        description: '设计系统整体架构'
      }
    ],
    teamMembers: [
      { name: '李经理', role: '项目经理', status: 'active' },
      { name: '陈架构', role: '架构师', status: 'active' }
    ],
    files: []
  },
  {
    id: 4,
    name: '区块链存证系统',
    code: 'PRJ-2024-004',
    status: 'planning',
    detailStatus: 'just_approved',
    priority: 'high',
    progress: 0,
    manager: '赵经理',
    startDate: '2024-02-10',
    endDate: '2024-07-30',
    description: '基于区块链技术的数据存证系统开发',
    nextMilestone: '需要配置',
    milestoneDate: null,
    isConfigured: false,
    tasks: [],
    teamMembers: [],
    files: []
  },
  {
    id: 5,
    name: '（占位，待新增项目）',
    code: 'PRJ-PLACEHOLDER-001',
    status: 'planning',
    detailStatus: 'just_approved',
    priority: 'medium',
    progress: 0,
    manager: '待定',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    description: '请通过新增项目功能录入真实项目',
    nextMilestone: '项目开题',
    milestoneDate: null,
    isConfigured: false,
    tasks: [],
    teamMembers: [],
    files: []
  },
  {
    id: 6,
    name: '区块链存证系统',
    code: 'PRJ-2024-004',
    status: 'planning',
    detailStatus: 'just_approved',
    priority: 'medium',
    progress: 0,
    manager: '赵经理',
    startDate: '2024-02-10',
    endDate: '2024-07-30',
    description: '需要完成项目配置',
    nextMilestone: '需要完成配置',
    milestoneDate: '2024-02-15',
    isConfigured: false,
    tasks: [],
    teamMembers: [],
    files: []
  },
  
])

// 项目状态排序优先级
const getStatusSortOrder = (status) => {
  const sortOrder = {
    'planning': 1,    // 规划中（最高优先级，需要配置）
    'active': 2,      // 进行中（次高优先级，正在执行）
    'completed': 3    // 已完成（最低优先级，已归档）
  }
  return sortOrder[status] || 999
}

// 排序后的项目列表
const sortedProjectList = computed(() => {
  return [...projectList.value].sort((a, b) => {
    // 首先按状态优先级排序
    const statusOrderA = getStatusSortOrder(a.status)
    const statusOrderB = getStatusSortOrder(b.status)
    
    if (statusOrderA !== statusOrderB) {
      return statusOrderA - statusOrderB
    }
    
    // 状态相同时，按优先级排序
    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 }
    const priorityA = priorityOrder[a.priority] || 4
    const priorityB = priorityOrder[b.priority] || 4
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    // 优先级也相同时，按开始日期排序（最新的在前）
    return new Date(b.startDate) - new Date(a.startDate)
  })
})

// 表格列定义
const columns = [
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    fixed: 'left'
  },
  {
    title: '项目编号',
    dataIndex: 'code',
    key: 'code',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '状态提示',
    key: 'statusHint',
    width: 160
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
    title: '项目经理',
    dataIndex: 'manager',
    key: 'manager',
    width: 120
  },
  {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 120
  },
  {
    title: '结束日期',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 任务表格列定义
const taskColumns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '分配给',
    dataIndex: 'assignedTo',
    key: 'assignedTo',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 120
  }
]

// 状态颜色映射
const getStatusColor = (status) => {
  const colorMap = {
    active: 'blue',
    planning: 'orange',
    completed: 'green',
    suspended: 'red'
  }
  return colorMap[status] || 'default'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    active: '进行中',
    planning: '规划中',
    completed: '已完成'
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

// 从团队管理获取可用成员列表
const availableTeamMembers = computed(() => {
  // 这里应该从团队管理模块获取数据，现在先使用模拟数据
  return [
    { id: 1, name: '张经理', role: 'manager' },
    { id: 2, name: '李开发', role: 'developer' },
    { id: 3, name: '王后端', role: 'developer' },
    { id: 4, name: '赵测试', role: 'tester' },
    { id: 5, name: '钱设计', role: 'designer' },
    { id: 6, name: '孙产品', role: 'product' },
    { id: 7, name: '周架构', role: 'architect' }
  ]
})

// 处理任务分配
const handleTaskAssign = (task, memberId) => {
  if (!memberId) {
    task.assignedTo = null
    message.info('已取消任务分配')
    return
  }
  
  const member = availableTeamMembers.value.find(m => m.id === memberId)
  if (member) {
    task.assignedTo = member
    message.success(`任务"${task.name}"已分配给${member.name}`)
  }
}

// 编辑任务
const editTask = (task) => {
  console.log('编辑任务:', task)
  message.info('任务编辑功能开发中...')
}

// 删除任务
const removeTask = (task) => {
  console.log('删除任务:', task)
  // 这里应该实现删除任务的逻辑
  message.warning('确认删除此任务吗？')
}

// 进度颜色映射
const getProgressColor = (progress) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 60) return '#1890ff'
  if (progress >= 40) return '#faad14'
  return '#f5222d'
}

// 任务状态颜色映射
const getTaskStatusColor = (status) => {
  const colorMap = {
    completed: 'green',
    active: 'blue',
    pending: 'orange',
    suspended: 'red'
  }
  return colorMap[status] || 'default'
}

// 任务状态文本映射
const getTaskStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    active: '进行中',
    pending: '待开始',
    suspended: '已暂停'
  }
  return textMap[status] || '未知'
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  // 这里可以调用API进行搜索
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
    manager: ''
  })
  handleSearch()
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // 这里可以调用API获取数据
}

// 查看项目详情
const viewProject = (record) => {
  currentProject.value = record
  detailVisible.value = true
}

// 编辑项目
const editProject = (record) => {
  console.log('编辑项目:', record)
  router.push(`/project-manager/projects/${record.id}/edit`)
}

// 注释：导入和创建项目功能已移除，项目将从立项审批自动创建

// 复制项目
const duplicateProject = (record) => {
  console.log('复制项目:', record)
  // 这里可以实现复制项目的逻辑
}

// 归档项目
const archiveProject = (record) => {
  console.log('归档项目:', record)
  // 这里可以实现归档项目的逻辑
}

// 删除项目
const deleteProject = (record) => {
  console.log('删除项目:', record)
  // 这里可以实现删除项目的逻辑
}

// 批量导出
const batchExport = () => {
  console.log('批量导出')
  // 这里可以实现批量导出的逻辑
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 未读计数（项目级）
const getProjectUnread = (projectId) => taskSyncStore.getUnreadCountForProject(String(projectId))
// 未读计数（任务级）
const getTaskUnread = (projectId, taskId) => taskSyncStore.getUnreadCountForTask(String(projectId), String(taskId))

// 跳转到项目归档
const goToArchive = () => {
  router.push('/project/archive/completed')
}

// 智能按钮逻辑方法

// 获取状态提示文案
const getStatusHint = (project) => {
  const hints = {
    just_approved: '需要完成项目配置',
    configured: '可以启动项目执行',
    active: '项目正常进行中',
    milestone_due: `${project.nextMilestone}即将到期`,
    completed: '项目已完成可归档'
  }
  return hints[project.detailStatus] || '状态未知'
}

// 获取主按钮类型
const getMainButtonType = (detailStatus) => {
  const types = {
    just_approved: 'primary',
    configured: 'primary', 
    active: 'primary',
    milestone_due: 'primary',
    completed: 'default'
  }
  return types[detailStatus] || 'default'
}

// 获取主按钮文案
const getMainButtonText = (detailStatus) => {
  const texts = {
    just_approved: '立即配置',
    configured: '启动项目',
    active: '项目监控',
    milestone_due: '准备材料',
    completed: '项目归档'
  }
  return texts[detailStatus] || '操作'
}

// 获取主按钮图标
const getMainButtonIcon = (detailStatus) => {
  const icons = {
    just_approved: SettingOutlined,
    configured: RocketOutlined,
    active: DashboardOutlined,
    milestone_due: FileTextOutlined,
    completed: FolderOpenOutlined
  }
  return icons[detailStatus] || SettingOutlined
}

// 处理主操作点击
const handleMainAction = (project) => {
  switch (project.detailStatus) {
    case 'just_approved':
      configProject(project)
      break
    case 'configured':
      startProject(project)
      break
    case 'active':
      monitorProject(project)
      break
    case 'milestone_due':
      prepareMilestone(project)
      break
    case 'completed':
      archiveProject(project)
      break
    default:
      message.info('操作功能开发中')
  }
}

// 配置项目
const configProject = (project) => {
  router.push({
    path: '/project-manager/projects/config-wizard',
    query: {
      projectId: project.id,
      projectName: project.name,
      projectCode: project.code
    }
  })
}

// 更新项目状态
const updateProjectStatus = (projectId, newStatus) => {
  // 找到项目并更新状态
  const projectIndex = projectList.value.findIndex(p => p.id === projectId)
  if (projectIndex !== -1) {
    // 更新主状态
    projectList.value[projectIndex].status = newStatus
    
    // 更新详细状态
    if (newStatus === 'active') {
      projectList.value[projectIndex].detailStatus = 'active'
    }
    
    console.log('项目状态已更新:', projectId, newStatus)
  }
}

// 启动项目
const startProject = (project) => {
  // 检查是否已分配团队成员
  if (!project.teamMembers || project.teamMembers.length === 0) {
    message.warning('请先分配团队成员再启动项目！')
    // 自动打开项目详情页面的团队成员标签页
    currentProject.value = project
    activeTab.value = 'members'
    detailVisible.value = true
    return
  }
  
  // 检查是否已配置WBS任务
  if (!project.tasks || project.tasks.length === 0) {
    message.warning('请先配置项目任务结构再启动项目！')
    // 自动打开项目详情页面的任务标签页
    currentProject.value = project
    activeTab.value = 'tasks'
    detailVisible.value = true
    return
  }
  
  // 确认启动
  const confirm = window.confirm(`确认启动项目"${project.name}"吗？\n\n启动后项目将进入执行阶段，团队成员将开始按照WBS计划执行任务。`)
  if (!confirm) {
    return
  }
  
  // 更新项目状态为进行中
  updateProjectStatus(project.id, 'active')
  
  router.push({
    path: `/project-manager/projects/monitor/${project.id}`
  })
  message.success(`项目"${project.name}"已成功启动！进入项目监控页面`)
}

// 监控项目
const monitorProject = (project) => {
  router.push({
    path: `/project-manager/projects/monitor/${project.id}`,
    query: {
      name: project.name,
      code: project.code,
      progress: project.progress,
      startDate: project.startDate,
      endDate: project.endDate
    }
  })
  message.info(`进入项目监控: ${project.name}`)
}

// 准备里程碑材料 - 增强版联动机制
const prepareMilestone = (project) => {
  // 构建跳转参数，携带项目信息以便材料页面回填
  const queryParams = {
    projectId: project.id,
    projectName: project.name,
    projectCode: project.code,
    fromPM: 'true', // 标识来源为项目经理后台
    milestoneType: project.nextMilestone
  }
  
  // 根据里程碑类型跳转到不同页面
  if (project.nextMilestone.includes('开题')) {
    router.push({
      path: '/opening/application/submit',
      query: queryParams
    })
    message.info(`正在跳转到开题材料提交页面...`)
  } else if (project.nextMilestone.includes('中期')) {
    router.push({
      path: '/midterm/application/submit', 
      query: queryParams
    })
    message.info(`正在跳转到中期材料提交页面...`)
  } else if (project.nextMilestone.includes('验收')) {
    router.push({
      path: '/acceptance/application/submit',
      query: queryParams
    })
    message.info(`正在跳转到验收材料提交页面...`)
  } else {
    // 未知里程碑类型，提供通用材料准备界面
    message.warning(`未识别的里程碑类型：${project.nextMilestone}`)
    // 可以考虑添加通用材料管理页面
    console.log('需要为未知里程碑类型提供通用材料管理界面')
  }
  
  // 记录操作日志，用于后续状态同步
  console.log('里程碑材料准备操作:', {
    projectId: project.id,
    milestoneType: project.nextMilestone,
    timestamp: new Date().toISOString(),
    action: 'prepare_milestone_materials'
  })
}



// 生命周期
onMounted(() => {
  // 初始化数据
  pagination.total = projectList.value.length
  
  // 🎯 检查是否从立项自动跳转而来
  checkAutoCreatedProject()
})

// 🎯 检查是否从立项自动创建跳转而来
const checkAutoCreatedProject = () => {
  const { fromApproval, projectId, autoCreated } = route.query
  
  if (fromApproval === 'true' && autoCreated === 'true' && projectId) {
    // 显示自动创建成功的提醒
    message.success({
      content: `项目立项通过！项目已自动添加到管理列表中，项目ID: ${projectId}`,
      duration: 5
    })
    
    // 模拟自动创建的项目数据（实际应该从API获取）
    const autoCreatedProject = {
      id: projectId,
      name: `立项项目-${projectId}`,
      status: 'active',
      manager: '当前用户',
      progress: 0,
      budget: '待确定',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '待确定',
      description: '来自立项自动创建的项目',
      isAutoCreated: true,
      fromApproval: true
    }
    
    // 添加到项目列表顶部
    projectList.value.unshift(autoCreatedProject)
    pagination.total = projectList.value.length
    
    // 清理URL参数，避免刷新页面时重复处理
    router.replace({ path: '/project-manager/projects' })
  }
}
</script>

<style scoped>
.project-management {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 进度列 + 未读小标样式 */
.progress-with-unread {
  position: relative;
  padding-right: 32px; /* 为小标留出空间 */
}

.progress-unread-badge :deep(.ant-badge-count) {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
  border: 1px solid rgba(255,255,255,0.8);
}

.progress-unread-badge {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
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

.projects-section {
  margin-bottom: 24px;
}

.projects-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-detail {
  max-height: 600px;
  overflow-y: auto;
}

/* 任务名 + 未读小标样式 */
.task-name-with-unread {
  position: relative;
  padding-right: 28px;
}

.task-unread-badge :deep(.ant-badge-count) {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
  border: 1px solid rgba(255,255,255,0.85);
}

.task-unread-badge {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

/* 智能按钮样式 */
.btn-just_approved {
  background: #fa8c16 !important;
  border-color: #fa8c16 !important;
  color: white !important;
}

.btn-just_approved:hover {
  background: #d46b08 !important;
  border-color: #d46b08 !important;
}

.btn-configured {
  background: #52c41a !important;
  border-color: #52c41a !important;
  color: white !important;
}

.btn-configured:hover {
  background: #389e0d !important;
  border-color: #389e0d !important;
}

.btn-active {
  background: #1890ff !important;
  border-color: #1890ff !important;
  color: white !important;
}

.btn-active:hover {
  background: #096dd9 !important;
  border-color: #096dd9 !important;
}

.btn-milestone_due {
  background: #722ed1 !important;
  border-color: #722ed1 !important;
  color: white !important;
}

.btn-milestone_due:hover {
  background: #531dab !important;
  border-color: #531dab !important;
}

.btn-completed {
  background: #8c8c8c !important;
  border-color: #8c8c8c !important;
  color: white !important;
}

.btn-completed:hover {
  background: #595959 !important;
  border-color: #595959 !important;
}

/* 状态提示样式 */
.status-hint {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.hint-just_approved {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.hint-configured {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.hint-active {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.hint-milestone_due {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.hint-completed {
  background: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

/* 状态流程样式 */
.status-flow .flow-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-item, .flow-side {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flow-desc {
  color: #666;
  font-size: 12px;
}

.flow-arrow {
  color: #1890ff;
  font-weight: bold;
}

/* 折叠面板样式 */
.flow-collapse {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.flow-collapse :deep(.ant-collapse-header) {
  font-weight: 600;
  color: #234fa2;
  padding: 12px 16px !important;
}

.flow-collapse :deep(.ant-collapse-content-box) {
  padding: 16px !important;
}

/* 排序流程样式 */
.sort-flow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.sort-step {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-desc {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.sort-arrow {
  color: #1890ff;
  font-size: 12px;
}

@media (max-width: 768px) {
  .sort-flow {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .sort-arrow {
    transform: rotate(90deg);
  }
}

.flow-side {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #d9d9d9;
}

/* 操作逻辑样式 */
.operation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.operation-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operation-item span {
  color: #666;
  font-size: 12px;
}

/* 排序说明样式 */
.sort-info {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
}

.sort-info p {
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-management {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .status-flow, .operation-guide {
    margin-bottom: 16px;
  }
  
  .flow-steps, .operation-list {
    gap: 6px;
  }
}
</style> 