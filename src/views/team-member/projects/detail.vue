<template>
  <div class="project-detail-page">
    <div class="page-header">
      <a-button type="link" @click="goBack">返回</a-button>
      <div class="header-content">
        <h1 class="page-title">{{ projectData.name }}</h1>
        <div class="project-meta">
          <a-tag :color="getStatusColor(projectData.status)">
            {{ getStatusText(projectData.status) }}
          </a-tag>
          <a-tag :color="getPriorityColor(projectData.priority)">
            {{ getPriorityText(projectData.priority) }}
          </a-tag>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <a-row :gutter="24">
        <!-- 左侧：项目详情 -->
        <a-col :span="16">
          <!-- 项目概览 -->
          <a-card title="项目概览" class="info-card">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="项目名称">{{ projectData.name }}</a-descriptions-item>
              <a-descriptions-item label="项目类型">{{ projectData.type }}</a-descriptions-item>
              <a-descriptions-item label="项目状态">
                <a-tag :color="getStatusColor(projectData.status)">
                  {{ getStatusText(projectData.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="优先级">
                <a-tag :color="getPriorityColor(projectData.priority)">
                  {{ getPriorityText(projectData.priority) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="项目经理">{{ projectData.manager }}</a-descriptions-item>
              <a-descriptions-item label="我的角色">{{ projectData.myRole }}</a-descriptions-item>
              <a-descriptions-item label="开始时间">{{ projectData.startDate }}</a-descriptions-item>
              <a-descriptions-item label="预计结束">{{ projectData.endDate }}</a-descriptions-item>
              <a-descriptions-item label="项目预算">{{ projectData.budget }}万元</a-descriptions-item>
              <a-descriptions-item label="当前进度">
                <a-progress :percent="projectData.progress" />
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 项目描述 -->
          <a-card title="项目描述" class="info-card">
            <div class="project-description">
              {{ projectData.description }}
            </div>
          </a-card>

          <!-- 我的任务 -->
          <a-card title="我的任务" class="info-card">
            <div class="task-stats">
              <a-row :gutter="16">
                <a-col :span="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ myTaskStats.total }}</div>
                    <div class="stat-label">总任务</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ myTaskStats.active }}</div>
                    <div class="stat-label">进行中</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ myTaskStats.completed }}</div>
                    <div class="stat-label">已完成</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ myTaskStats.overdue }}</div>
                    <div class="stat-label">逾期</div>
                  </div>
                </a-col>
              </a-row>
            </div>

            <div class="task-list">
              <div class="task-filters">
                <a-radio-group v-model:value="taskFilter" button-style="solid" size="small">
                  <a-radio-button value="all">全部</a-radio-button>
                  <a-radio-button value="active">进行中</a-radio-button>
                  <a-radio-button value="pending">待开始</a-radio-button>
                  <a-radio-button value="completed">已完成</a-radio-button>
                </a-radio-group>
              </div>

              <div class="task-items">
                <div 
                  v-for="task in filteredTasks" 
                  :key="task.id"
                  class="task-item"
                  @click="viewTaskDetail(task)"
                >
                  <div class="task-info">
                    <div class="task-name">{{ task.name }}</div>
                    <div class="task-meta">
                      <a-tag :color="getStatusColor(task.status)" size="small">
                        {{ getStatusText(task.status) }}
                      </a-tag>
                      <a-tag :color="getPriorityColor(task.priority)" size="small">
                        {{ getPriorityText(task.priority) }}
                      </a-tag>
                      <span class="task-due">截止: {{ task.dueDate }}</span>
                    </div>
                  </div>
                  <div class="task-progress">
                    <a-progress :percent="task.progress" size="small" />
                  </div>
                </div>
              </div>
            </div>
          </a-card>

          <!-- 项目文档 -->
          <a-card title="项目文档" class="info-card">
            <div class="documents-section">
              <div class="document-categories">
                <a-tabs v-model:activeKey="documentTab">
                  <a-tab-pane key="requirements" tab="需求文档">
                    <div class="document-list">
                      <div v-for="doc in projectDocuments.requirements" :key="doc.id" class="document-item">
                        <FileOutlined />
                        <span class="document-name">{{ doc.name }}</span>
                        <div class="document-actions">
                          <a-button type="link" size="small" @click="viewDocument(doc)">查看</a-button>
                          <a-button type="link" size="small" @click="downloadDocument(doc)">下载</a-button>
                        </div>
                      </div>
                    </div>
                  </a-tab-pane>
                  <a-tab-pane key="design" tab="设计文档">
                    <div class="document-list">
                      <div v-for="doc in projectDocuments.design" :key="doc.id" class="document-item">
                        <FileOutlined />
                        <span class="document-name">{{ doc.name }}</span>
                        <div class="document-actions">
                          <a-button type="link" size="small" @click="viewDocument(doc)">查看</a-button>
                          <a-button type="link" size="small" @click="downloadDocument(doc)">下载</a-button>
                        </div>
                      </div>
                    </div>
                  </a-tab-pane>
                  <a-tab-pane key="technical" tab="技术文档">
                    <div class="document-list">
                      <div v-for="doc in projectDocuments.technical" :key="doc.id" class="document-item">
                        <FileOutlined />
                        <span class="document-name">{{ doc.name }}</span>
                        <div class="document-actions">
                          <a-button type="link" size="small" @click="viewDocument(doc)">查看</a-button>
                          <a-button type="link" size="small" @click="downloadDocument(doc)">下载</a-button>
                        </div>
                      </div>
                    </div>
                  </a-tab-pane>
                </a-tabs>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 右侧：团队和工具 -->
        <a-col :span="8">
          <!-- 项目团队 -->
          <a-card title="项目团队" class="team-card">
            <div class="team-members">
              <div v-for="member in projectData.teamMembers" :key="member.id" class="member-item">
                <a-avatar :src="member.avatar" :size="40">
                  {{ member.name.charAt(0) }}
                </a-avatar>
                <div class="member-info">
                  <div class="member-name">{{ member.name }}</div>
                  <div class="member-role">{{ member.role }}</div>
                  <div class="member-status">{{ member.status }}</div>
                </div>
                <div class="member-actions">
                  <a-button type="link" size="small" @click="contactMember(member)">
                    <MessageOutlined />
                  </a-button>
                </div>
              </div>
            </div>
          </a-card>

          <!-- 项目进度 -->
          <a-card title="进度统计" class="progress-card">
            <div class="progress-stats">
              <div class="overall-progress">
                <h4>整体进度</h4>
                <a-progress 
                  type="circle" 
                  :percent="projectData.progress" 
                  :width="100"
                />
              </div>
              
              <div class="phase-progress">
                <h4>阶段进度</h4>
                <div v-for="phase in projectData.phases" :key="phase.id" class="phase-item">
                  <div class="phase-info">
                    <span class="phase-name">{{ phase.name }}</span>
                    <span class="phase-percent">{{ phase.progress }}%</span>
                  </div>
                  <a-progress :percent="phase.progress" size="small" />
                </div>
              </div>
            </div>
          </a-card>

          <!-- 快速操作 -->
          <a-card title="快速操作" class="action-card">
            <div class="quick-actions">
              <a-button block @click="createWorkLog">
                <EditOutlined />
                记录工作日志
              </a-button>
              <a-button block @click="requestResource">
                <ToolOutlined />
                申请资源
              </a-button>
              <a-button block @click="reportProgress">
                <BarChartOutlined />
                汇报进度
              </a-button>
              <a-button block @click="contactManager">
                <PhoneOutlined />
                联系项目经理
              </a-button>
            </div>
          </a-card>

          <!-- 项目公告 -->
          <a-card title="项目公告" class="announcement-card">
            <div class="announcements">
              <div v-for="announcement in projectData.announcements" :key="announcement.id" class="announcement-item">
                <div class="announcement-header">
                  <span class="announcement-title">{{ announcement.title }}</span>
                  <span class="announcement-time">{{ announcement.createdAt }}</span>
                </div>
                <div class="announcement-content">{{ announcement.content }}</div>
                <div class="announcement-author">发布人: {{ announcement.author }}</div>
              </div>
            </div>
          </a-card>

          <!-- 里程碑 -->
          <a-card title="项目里程碑" class="milestone-card">
            <div class="milestones">
              <a-timeline>
                <a-timeline-item 
                  v-for="milestone in projectData.milestones" 
                  :key="milestone.id"
                  :color="milestone.completed ? 'green' : 'blue'"
                >
                  <div class="milestone-item">
                    <div class="milestone-name">{{ milestone.name }}</div>
                    <div class="milestone-date">{{ milestone.dueDate }}</div>
                    <div class="milestone-status">
                      <a-tag :color="milestone.completed ? 'green' : 'orange'" size="small">
                        {{ milestone.completed ? '已完成' : '进行中' }}
                      </a-tag>
                    </div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  FileOutlined, 
  MessageOutlined, 
  EditOutlined,
  ToolOutlined,
  BarChartOutlined,
  PhoneOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const projectId = computed(() => route.params.id || 'default')
const taskFilter = ref('all')
const documentTab = ref('requirements')

// 项目数据
const projectData = reactive({
  id: '',
  name: '',
  type: '',
  status: '',
  priority: '',
  manager: '',
  myRole: '',
  startDate: '',
  endDate: '',
  budget: 0,
  progress: 0,
  description: '',
  teamMembers: [],
  phases: [],
  announcements: [],
  milestones: []
})

// 我的任务统计
const myTaskStats = reactive({
  total: 0,
  active: 0,
  completed: 0,
  overdue: 0
})

// 我的任务列表
const myTasks = ref([])

// 项目文档
const projectDocuments = reactive({
  requirements: [],
  design: [],
  technical: []
})

// 计算属性
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') return myTasks.value
  return myTasks.value.filter(task => task.status === taskFilter.value)
})

// 状态和优先级映射
const getStatusColor = (status) => {
  const colors = {
    'planning': 'orange',
    'active': 'blue',
    'completed': 'green',
    'suspended': 'red',
    'pending': 'orange'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    'planning': '规划中',
    'active': '进行中',
    'completed': '已完成',
    'suspended': '已暂停',
    'pending': '待开始'
  }
  return texts[status] || status
}

const getPriorityColor = (priority) => {
  const colors = {
    'low': 'blue',
    'medium': 'orange',
    'high': 'red',
    'urgent': 'purple'
  }
  return colors[priority] || 'default'
}

const getPriorityText = (priority) => {
  const texts = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急'
  }
  return texts[priority] || priority
}

// 加载项目数据
const loadProjectData = async () => {
  try {
    // 这里应该调用API获取项目数据
    // const response = await getProjectDetail(projectId.value)
    
    // 模拟数据
    Object.assign(projectData, {
      id: projectId.value,
      name: '智能办公系统开发',
      type: '研发项目',
      status: 'active',
      priority: 'high',
      manager: '张三',
      myRole: 'UI设计师',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      budget: 150,
      progress: 65,
      description: '开发一套智能化的办公管理系统，包括项目管理、任务分配、进度跟踪、团队协作等核心功能模块。',
      teamMembers: [
        { id: 1, name: '张三', role: '项目经理', status: '在线', avatar: '' },
        { id: 2, name: '李四', role: '前端开发', status: '忙碌', avatar: '' },
        { id: 3, name: '王五', role: 'UI设计师', status: '在线', avatar: '' },
        { id: 4, name: '赵六', role: '后端开发', status: '离线', avatar: '' },
        { id: 5, name: '钱七', role: '测试工程师', status: '在线', avatar: '' }
      ],
      phases: [
        { id: 1, name: '需求分析', progress: 100 },
        { id: 2, name: '设计阶段', progress: 80 },
        { id: 3, name: '开发阶段', progress: 60 },
        { id: 4, name: '测试阶段', progress: 20 },
        { id: 5, name: '部署上线', progress: 0 }
      ],
      announcements: [
        {
          id: 1,
          title: '设计规范更新',
          content: '请大家关注最新的设计规范文档，确保界面风格一致性。',
          author: '张三',
          createdAt: '2024-01-20'
        },
        {
          id: 2,
          title: '周例会调整',
          content: '本周例会改为周三下午3点，请大家调整时间。',
          author: '张三',
          createdAt: '2024-01-18'
        }
      ],
      milestones: [
        { id: 1, name: '需求确认', dueDate: '2024-01-15', completed: true },
        { id: 2, name: '原型设计', dueDate: '2024-02-01', completed: true },
        { id: 3, name: '核心功能开发', dueDate: '2024-06-30', completed: false },
        { id: 4, name: '系统测试', dueDate: '2024-10-31', completed: false },
        { id: 5, name: '正式上线', dueDate: '2024-12-31', completed: false }
      ]
    })

    // 模拟我的任务统计
    Object.assign(myTaskStats, {
      total: 8,
      active: 3,
      completed: 4,
      overdue: 1
    })

    // 模拟我的任务列表
    myTasks.value = [
      {
        id: 1,
        name: '用户界面设计优化',
        status: 'active',
        priority: 'high',
        progress: 65,
        dueDate: '2024-01-25'
      },
      {
        id: 2,
        name: '图标设计',
        status: 'completed',
        priority: 'medium',
        progress: 100,
        dueDate: '2024-01-20'
      },
      {
        id: 3,
        name: '移动端适配设计',
        status: 'pending',
        priority: 'medium',
        progress: 0,
        dueDate: '2024-02-05'
      }
    ]

    // 模拟项目文档
    Object.assign(projectDocuments, {
      requirements: [
        { id: 1, name: '项目需求规格说明书.docx' },
        { id: 2, name: '用户故事汇总.xlsx' }
      ],
      design: [
        { id: 3, name: '界面设计规范.pdf' },
        { id: 4, name: '交互设计文档.sketch' }
      ],
      technical: [
        { id: 5, name: '技术架构设计.pdf' },
        { id: 6, name: 'API接口文档.html' }
      ]
    })

  } catch (error) {
    console.error('加载项目数据失败:', error)
    message.error('加载项目数据失败')
  }
}

// 操作函数
const viewTaskDetail = (task) => {
  router.push(`/team-member/tasks/${task.id}`)
}

const viewDocument = (doc) => {
  message.info(`查看文档: ${doc.name}`)
}

const downloadDocument = (doc) => {
  message.info(`下载文档: ${doc.name}`)
}

const contactMember = (member) => {
  message.info(`联系${member.name}`)
}

const createWorkLog = () => {
  message.info('工作日志功能开发中')
}

const requestResource = () => {
  message.info('资源申请功能开发中')
}

const reportProgress = () => {
  message.info('进度汇报功能开发中')
}

const contactManager = () => {
  message.info(`联系项目经理: ${projectData.manager}`)
}

const goBack = () => {
  router.go(-1)
}

// 生命周期
onMounted(() => {
  loadProjectData()
})
</script>

<style scoped>
.project-detail-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #234fa2;
  margin: 0;
}

.project-meta {
  display: flex;
  gap: 8px;
}

.detail-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.info-card,
.team-card,
.progress-card,
.action-card,
.announcement-card,
.milestone-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.project-description {
  line-height: 1.6;
  color: #666;
}

.task-stats {
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 12px;
}

.task-filters {
  margin-bottom: 16px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.task-item:hover {
  background: #e6f7ff;
}

.task-info {
  flex: 1;
}

.task-name {
  font-weight: 500;
  margin-bottom: 8px;
  color: #234fa2;
}

.task-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.task-due {
  color: #999;
  font-size: 12px;
}

.task-progress {
  width: 120px;
}

.document-list {
  margin-top: 16px;
}

.document-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.document-name {
  flex: 1;
  margin-left: 8px;
  font-weight: 500;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.member-item:last-child {
  border-bottom: none;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.member-role {
  color: #666;
  font-size: 12px;
  margin-bottom: 2px;
}

.member-status {
  color: #999;
  font-size: 12px;
}

.progress-stats {
  text-align: center;
}

.overall-progress {
  margin-bottom: 24px;
}

.overall-progress h4 {
  margin-bottom: 16px;
  color: #234fa2;
}

.phase-progress h4 {
  margin-bottom: 16px;
  color: #234fa2;
  text-align: left;
}

.phase-item {
  margin-bottom: 16px;
}

.phase-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.phase-name {
  font-weight: 500;
}

.phase-percent {
  color: #666;
  font-size: 12px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 12px;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.announcement-title {
  font-weight: 500;
  color: #234fa2;
}

.announcement-time {
  color: #999;
  font-size: 12px;
}

.announcement-content {
  color: #666;
  margin-bottom: 4px;
  line-height: 1.4;
}

.announcement-author {
  color: #999;
  font-size: 12px;
}

.milestone-item {
  margin-bottom: 8px;
}

.milestone-name {
  font-weight: 500;
  margin-bottom: 2px;
  color: #234fa2;
}

.milestone-date {
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
}
</style>