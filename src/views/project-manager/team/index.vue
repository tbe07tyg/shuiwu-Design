<template>
  <div class="team-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>团队管理</h1>
      <p class="subtitle">团队成员与权限管理</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <TeamOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalMembers }}</div>
                <div class="stat-label">团队成员</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <UserOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.activeMembers }}</div>
                <div class="stat-label">在线成员</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <ProjectOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalProjects }}</div>
                <div class="stat-label">参与项目</div>
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
                <div class="stat-label">完成任务</div>
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
          <a-form-item label="成员姓名">
            <a-input
              v-model:value="searchForm.name"
              placeholder="请输入成员姓名"
              allow-clear
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="角色">
            <a-select
              v-model:value="searchForm.role"
              placeholder="请选择角色"
              allow-clear
              style="width: 120px"
            >
              <a-select-option value="manager">项目经理</a-select-option>
              <a-select-option value="developer">开发工程师</a-select-option>
              <a-select-option value="designer">设计师</a-select-option>
              <a-select-option value="tester">测试工程师</a-select-option>
              <a-select-option value="architect">架构师</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              allow-clear
              style="width: 120px"
            >
              <a-select-option value="active">在线</a-select-option>
              <a-select-option value="offline">离线</a-select-option>
              <a-select-option value="busy">忙碌</a-select-option>
            </a-select>
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
        <a-button type="primary" @click="addMember">
          <PlusOutlined />
          添加成员
        </a-button>
        <a-button @click="batchInvite">
          <MailOutlined />
          批量邀请
        </a-button>
        <a-button @click="exportTeam">
          <DownloadOutlined />
          导出团队
        </a-button>
        <a-button @click="refreshData">
          <ReloadOutlined />
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 团队成员列表 -->
    <div class="team-section">
      <a-card class="team-card">
        <a-table
          :dataSource="teamList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          rowKey="id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'avatar'">
              <a-avatar :src="record.avatar" :size="40">
                {{ record.name.charAt(0) }}
              </a-avatar>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'role'">
              <a-tag :color="getRoleColor(record.role)">
                {{ getRoleText(record.role) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'performance'">
              <a-progress
                :percent="record.performance"
                :stroke-color="getPerformanceColor(record.performance)"
                size="small"
              />
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewMember(record)">
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editMember(record)">
                  编辑
                </a-button>
                <a-dropdown>
                  <a-button type="link" size="small">
                    更多
                    <DownOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="assignProject(record)">
                        <ProjectOutlined />
                        分配项目
                      </a-menu-item>
                      <a-menu-item @click="viewPerformance(record)">
                        <BarChartOutlined />
                        查看绩效
                      </a-menu-item>
                      
                      <a-menu-divider />
                      <a-menu-item danger @click="removeMember(record)">
                        <DeleteOutlined />
                        移除成员
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

    <!-- 成员详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="成员详情"
      width="700px"
      :footer="null"
      destroy-on-close
    >
      <div v-if="currentMember" class="member-detail">
        <a-row :gutter="24">
          <a-col :span="8">
            <div class="member-avatar">
              <a-avatar :src="currentMember.avatar" :size="120">
                {{ currentMember.name.charAt(0) }}
              </a-avatar>
              <h3>{{ currentMember.name }}</h3>
              <p>{{ getRoleText(currentMember.role) }}</p>
            </div>
          </a-col>
          <a-col :span="16">
            <a-descriptions title="基本信息" :column="1" bordered>
              <a-descriptions-item label="姓名">
                {{ currentMember.name }}
              </a-descriptions-item>
              <a-descriptions-item label="邮箱">
                {{ currentMember.email }}
              </a-descriptions-item>
              <a-descriptions-item label="电话">
                {{ currentMember.phone }}
              </a-descriptions-item>
              <a-descriptions-item label="部门">
                {{ currentMember.department }}
              </a-descriptions-item>
              <a-descriptions-item label="入职时间">
                {{ currentMember.joinDate }}
              </a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-tag :color="getStatusColor(currentMember.status)">
                  {{ getStatusText(currentMember.status) }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>

        <a-divider />

        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="projects" tab="参与项目">
            <a-list
              :dataSource="currentMember.projects"
              item-layout="horizontal"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>{{ item.name }}</template>
                    <template #description>{{ item.role }}</template>
                  </a-list-item-meta>
                  <template #actions>
                    <a-tag :color="getProjectStatusColor(item.status)">
                      {{ getProjectStatusText(item.status) }}
                    </a-tag>
                  </template>
                </a-list-item>
              </template>
            </a-list>
          </a-tab-pane>
          <a-tab-pane key="performance" tab="绩效统计">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-statistic
                  title="完成任务"
                  :value="currentMember.stats.completedTasks"
                  :value-style="{ color: '#3f8600' }"
                />
              </a-col>
              <a-col :span="12">
                <a-statistic
                  title="进行中任务"
                  :value="currentMember.stats.activeTasks"
                  :value-style="{ color: '#1890ff' }"
                />
              </a-col>
            </a-row>
            <a-divider />
            <a-tooltip :title="kpiTooltip">
              <a-progress
                :percent="currentMember.performance"
                :stroke-color="getPerformanceColor(currentMember.performance)"
                :format="percent => `绩效评分: ${percent}%`"
              />
            </a-tooltip>

            <a-divider />

            <a-descriptions title="分项评分（当前周期）" :column="3" bordered size="small">
              <a-descriptions-item label="按时交付(30)">
                {{ kpiDetail.timeliness.score }}
              </a-descriptions-item>
              <a-descriptions-item label="质量合格(20)">
                {{ kpiDetail.quality.score }}
              </a-descriptions-item>
              <a-descriptions-item label="材料完整(10)">
                {{ kpiDetail.completeness.score }}
              </a-descriptions-item>
              <a-descriptions-item label="响应及时(10)">
                {{ kpiDetail.responsiveness.score }}
              </a-descriptions-item>
              <a-descriptions-item label="同步透明(10)">
                {{ kpiDetail.transparency.score }}
              </a-descriptions-item>
              <a-descriptions-item label="流程合规(5)">
                {{ kpiDetail.compliance.score }}
              </a-descriptions-item>
              <a-descriptions-item label="协作助攻(10)">
                {{ kpiDetail.collaboration.score }}
              </a-descriptions-item>
              <a-descriptions-item label="改进建议(5)">
                {{ kpiDetail.improvement.score }}
              </a-descriptions-item>
              <a-descriptions-item label="总分(100)">
                {{ currentMember.performance }}
              </a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <a-collapse>
              <a-collapse-panel key="calc" header="计算方式说明（点击展开）">
                <ul style="margin:0; padding-left: 20px; line-height: 1.8;">
                  <li><b>交付结果(60)</b> = 按时交付(30) + 质量合格(20) + 材料完整(10)</li>
                  <li><b>流程行为(25)</b> = 响应及时(10) + 同步透明(10) + 流程合规(5)</li>
                  <li><b>团队贡献(15)</b> = 协作助攻(10) + 改进建议(5)</li>
                </ul>
                <a-divider />
                <ul style="margin:0; padding-left: 20px; line-height: 1.8;">
                  <li><b>按时交付</b>：基于完成/进行中占比近似衡量（前端口径），接入任务完成时间后按“延迟天数”精确计算。</li>
                  <li><b>质量合格/材料完整</b>：当前以基准分展示，接入“打回/一次通过/模板缺失”后自动替换真实得分。</li>
                  <li><b>响应及时/同步透明/合规/协作/改进</b>：当前以基准分展示，接入“操作历史/评论/流程节点”后按周期统计。</li>
                </ul>
              </a-collapse-panel>
            </a-collapse>
          </a-tab-pane>
          <a-tab-pane key="skills" tab="技能标签">
            <a-space wrap>
              <a-tag v-for="skill in currentMember.skills" :key="skill" color="blue">
                {{ skill }}
              </a-tag>
            </a-space>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>

    <!-- 添加成员弹窗 -->
    <a-modal
      v-model:open="addVisible"
      title="添加团队成员"
      @ok="handleAddMember"
      @cancel="addVisible = false"
    >
      <a-form :model="memberForm" layout="vertical">
        <a-form-item label="姓名" required>
          <a-input v-model:value="memberForm.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="邮箱" required>
          <a-input v-model:value="memberForm.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="电话">
          <a-input v-model:value="memberForm.phone" placeholder="请输入电话" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model:value="memberForm.role" placeholder="请选择角色">
            <a-select-option value="manager">项目经理</a-select-option>
            <a-select-option value="developer">开发工程师</a-select-option>
            <a-select-option value="designer">设计师</a-select-option>
            <a-select-option value="tester">测试工程师</a-select-option>
            <a-select-option value="architect">架构师</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="部门">
          <a-input v-model:value="memberForm.department" placeholder="请输入部门" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  MailOutlined,
  DownloadOutlined,
  DownOutlined,
  BarChartOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const addVisible = ref(false)
const currentMember = ref(null)
const activeTab = ref('projects')

// 统计数据
const stats = reactive({
  totalMembers: 24,
  activeMembers: 18,
  totalProjects: 8,
  completedTasks: 156
})

// 搜索表单
const searchForm = reactive({
  name: '',
  role: undefined,
  status: undefined
})

// 成员表单
const memberForm = reactive({
  name: '',
  email: '',
  phone: '',
  role: undefined,
  department: ''
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

// 团队成员数据
const teamList = ref([
  {
    id: 1,
    name: '张经理',
    email: 'zhang@company.com',
    phone: '13800138001',
    avatar: '',
    role: 'manager',
    department: '项目管理部',
    status: 'active',
    performance: 95,
    joinDate: '2023-01-15',
    skills: ['项目管理', '团队协作', '风险控制'],
    projects: [
      { name: '智能科研管理系统开发', role: '项目经理', status: 'active' },
      { name: '数据分析平台建设', role: '项目经理', status: 'planning' }
    ],
    stats: {
      completedTasks: 45,
      activeTasks: 8
    }
  },
  {
    id: 2,
    name: '李开发',
    email: 'li@company.com',
    phone: '13800138002',
    avatar: '',
    role: 'developer',
    department: '技术开发部',
    status: 'active',
    performance: 88,
    joinDate: '2023-03-20',
    skills: ['Vue.js', 'React', 'Node.js', 'Python'],
    projects: [
      { name: '智能科研管理系统开发', role: '前端开发', status: 'active' }
    ],
    stats: {
      completedTasks: 32,
      activeTasks: 5
    }
  },
  {
    id: 3,
    name: '王后端',
    email: 'wang@company.com',
    phone: '13800138003',
    avatar: '',
    role: 'developer',
    department: '技术开发部',
    status: 'busy',
    performance: 92,
    joinDate: '2023-02-10',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
    projects: [
      { name: '智能科研管理系统开发', role: '后端开发', status: 'active' }
    ],
    stats: {
      completedTasks: 38,
      activeTasks: 6
    }
  },
  {
    id: 4,
    name: '赵测试',
    email: 'zhao@company.com',
    phone: '13800138004',
    avatar: '',
    role: 'tester',
    department: '质量保证部',
    status: 'active',
    performance: 85,
    joinDate: '2023-04-05',
    skills: ['自动化测试', '性能测试', '接口测试'],
    projects: [
      { name: '智能科研管理系统开发', role: '测试工程师', status: 'active' }
    ],
    stats: {
      completedTasks: 28,
      activeTasks: 4
    }
  },
  {
    id: 5,
    name: '陈架构',
    email: 'chen@company.com',
    phone: '13800138005',
    avatar: '',
    role: 'architect',
    department: '技术架构部',
    status: 'offline',
    performance: 98,
    joinDate: '2022-11-15',
    skills: ['系统架构', '微服务', '云原生', 'DevOps'],
    projects: [
      { name: '数据分析平台建设', role: '架构师', status: 'planning' }
    ],
    stats: {
      completedTasks: 52,
      activeTasks: 3
    }
  }
])

// 表格列定义
const columns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    width: 80
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 120
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: 120
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '绩效评分',
    dataIndex: 'performance',
    key: 'performance',
    width: 150
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 200
  },
  {
    title: '入职时间',
    dataIndex: 'joinDate',
    key: 'joinDate',
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
    active: 'green',
    offline: 'gray',
    busy: 'orange'
  }
  return colorMap[status] || 'default'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    active: '在线',
    offline: '离线',
    busy: '忙碌'
  }
  return textMap[status] || '未知'
}

// 角色颜色映射
const getRoleColor = (role) => {
  const colorMap = {
    manager: 'blue',
    developer: 'green',
    designer: 'purple',
    tester: 'orange',
    architect: 'red'
  }
  return colorMap[role] || 'default'
}

// 角色文本映射
const getRoleText = (role) => {
  const textMap = {
    manager: '项目经理',
    developer: '开发工程师',
    designer: '设计师',
    tester: '测试工程师',
    architect: '架构师'
  }
  return textMap[role] || '未知'
}

// 绩效颜色映射
const getPerformanceColor = (performance) => {
  if (performance >= 90) return '#52c41a'
  if (performance >= 80) return '#1890ff'
  if (performance >= 70) return '#faad14'
  return '#f5222d'
}

// 项目状态颜色映射
const getProjectStatusColor = (status) => {
  const colorMap = {
    active: 'blue',
    planning: 'orange',
    completed: 'green',
    suspended: 'red'
  }
  return colorMap[status] || 'default'
}

// 项目状态文本映射
const getProjectStatusText = (status) => {
  const textMap = {
    active: '进行中',
    planning: '规划中',
    completed: '已完成',
    suspended: '已暂停'
  }
  return textMap[status] || '未知'
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
    role: undefined,
    status: undefined
  })
  handleSearch()
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 查看成员详情
const viewMember = (record) => {
  currentMember.value = record
  detailVisible.value = true
}

// 编辑成员
const editMember = (record) => {
  console.log('编辑成员:', record)
  // 这里可以实现编辑成员的逻辑
}

// 添加成员
const addMember = () => {
  addVisible.value = true
}

// 处理添加成员
const handleAddMember = () => {
  console.log('添加成员:', memberForm)
  addVisible.value = false
  // 这里可以实现添加成员的逻辑
}

// 分配项目
const assignProject = (record) => {
  console.log('分配项目:', record)
  // 这里可以实现分配项目的逻辑
}

// 绩效计算（前端预估版，无后端时用于演示与管理）
const computeMemberPerformance = (member) => {
  const completed = Number(member?.stats?.completedTasks || 0)
  const active = Number(member?.stats?.activeTasks || 0)
  const total = completed + active

  // 1) 任务完成率（权重70%）
  const completionRate = total > 0 ? (completed / total) * 100 : 0
  const taskScore = Math.max(0, Math.min(100, completionRate))

  // 2) 工作量均衡（权重10%）：活跃任务≤5更佳，超出则按件数降低
  const workloadBalanceScore = Math.max(40, 100 - Math.max(0, active - 5) * 8)

  // 3) 在线活跃度（权重10%）
  const activityScoreMap = { active: 100, busy: 85, offline: 70 }
  const activityScore = activityScoreMap[member?.status] ?? 80

  // 4) 项目参与度（权重10%）：项目数越多，经验越丰富（上限100）
  const projectCount = Array.isArray(member?.projects) ? member.projects.length : 0
  const projectEngagementScore = Math.max(60, Math.min(100, projectCount * 15 + 70))

  const finalScore = Math.round(
    taskScore * 0.7 +
    workloadBalanceScore * 0.1 +
    activityScore * 0.1 +
    projectEngagementScore * 0.1
  )
  return Math.max(0, Math.min(100, finalScore))
}

const refreshPerformanceScores = () => {
  teamList.value.forEach(m => {
    m.performance = computeMemberPerformance(m)
  })
}

// 查看绩效：打开成员详情并定位到“绩效统计”页签，同时刷新其绩效分
const viewPerformance = (record) => {
  if (!record) return
  record.performance = computeMemberPerformance(record)
  currentMember.value = record
  activeTab.value = 'performance'
  detailVisible.value = true
}

// 移除成员
const removeMember = (record) => {
  console.log('移除成员:', record)
  // 这里可以实现移除成员的逻辑
}

// 批量邀请
const batchInvite = () => {
  console.log('批量邀请')
  // 这里可以实现批量邀请的逻辑
}

// 导出团队
const exportTeam = () => {
  console.log('导出团队')
  // 这里可以实现导出团队的逻辑
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 生命周期
onMounted(() => {
  pagination.total = teamList.value.length
  // 初始化刷新一次绩效评分
  refreshPerformanceScores()
})

// KPI 分项（演示口径：基于当前可用数据填充，待后端/更多前端数据接入后替换）
const kpiDetail = computed(() => {
  if (!currentMember.value) {
    return defaultKpiDetail()
  }
  // 可用数据：completedTasks / activeTasks / status / projects
  const completed = Number(currentMember.value?.stats?.completedTasks || 0)
  const active = Number(currentMember.value?.stats?.activeTasks || 0)
  const total = completed + active

  // timeliness: 用完成占比近似（作为前端过渡口径）
  const completionRate = total > 0 ? (completed / total) * 100 : 0
  const timelinessScore = Math.round(Math.max(0, Math.min(100, completionRate)))

  // 其余分项：当前以基准分先展示（可逐步替换为真实统计）
  const qualityScore = 85
  const completenessScore = 90
  const responsivenessScore = ({ active: 100, busy: 85, offline: 70 })[currentMember.value.status] ?? 80
  const transparencyScore = 90
  const complianceScore = 95
  const collaborationScore = Math.min(100, 70 + (currentMember.value.projects?.length || 0) * 5)
  const improvementScore = 80

  // 汇总得分（与 computeMemberPerformance 保持同向，不强制一致，用作分项展示）
  const final = Math.round(
    timelinessScore * 0.3 +
    qualityScore * 0.2 +
    completenessScore * 0.1 +
    responsivenessScore * 0.1 +
    transparencyScore * 0.1 +
    complianceScore * 0.05 +
    collaborationScore * 0.1 +
    improvementScore * 0.05
  )

  return {
    timeliness: { score: timelinessScore },
    quality: { score: qualityScore },
    completeness: { score: completenessScore },
    responsiveness: { score: responsivenessScore },
    transparency: { score: transparencyScore },
    compliance: { score: complianceScore },
    collaboration: { score: collaborationScore },
    improvement: { score: improvementScore },
    final
  }
})

const defaultKpiDetail = () => ({
  timeliness: { score: 0 },
  quality: { score: 0 },
  completeness: { score: 0 },
  responsiveness: { score: 0 },
  transparency: { score: 0 },
  compliance: { score: 0 },
  collaboration: { score: 0 },
  improvement: { score: 0 },
  final: 0
})

// 顶部评分的Tooltip说明
const kpiTooltip = computed(() => {
  return '评分口径：交付(60)=按时(30)+质量(20)+材料(10); 流程(25)=响应(10)+同步(10)+合规(5); 贡献(15)=协作(10)+改进(5)。当前部分分项为演示基准分，接入打回/一次通过/模板缺失/响应统计后将自动替换为真实得分。'
})
</script>

<style scoped>
.team-management {
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

.team-section {
  margin-bottom: 24px;
}

.team-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.member-detail {
  max-height: 600px;
  overflow-y: auto;
}

.member-avatar {
  text-align: center;
  padding: 20px;
}

.member-avatar h3 {
  margin: 16px 0 8px 0;
  color: #234fa2;
}

.member-avatar p {
  color: #666;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .team-management {
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