<template>
  <div class="task-detail-page">
    <div class="page-header">
      <a-button type="link" @click="goBack">返回</a-button>
      <div class="header-content">
        <h1 class="page-title">{{ taskData.name }}</h1>
        <div class="task-meta">
          <a-tag :color="getPriorityColor(taskData.priority)">
            {{ getPriorityText(taskData.priority) }}
          </a-tag>
          <a-tag :color="getStatusColor(taskData.status)">
            {{ getStatusText(taskData.status) }}
          </a-tag>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <a-row :gutter="24">
        <!-- 左侧：任务详情 -->
        <a-col :span="16">
          <!-- 基本信息 -->
          <a-card title="任务信息" class="info-card">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="任务名称">{{ taskData.name }}</a-descriptions-item>
              <a-descriptions-item label="所属项目">{{ taskData.projectName }}</a-descriptions-item>
              <a-descriptions-item label="任务类型">{{ taskData.type }}</a-descriptions-item>
              <a-descriptions-item label="优先级">
                <a-tag :color="getPriorityColor(taskData.priority)">
                  {{ getPriorityText(taskData.priority) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="分配人">{{ taskData.assignor }}</a-descriptions-item>
              <a-descriptions-item label="负责人">{{ taskData.assignee }}</a-descriptions-item>
              <a-descriptions-item label="开始时间">{{ taskData.startDate }}</a-descriptions-item>
              <a-descriptions-item label="截止时间">{{ taskData.dueDate }}</a-descriptions-item>
              <a-descriptions-item label="预计工时">{{ taskData.estimatedHours }}小时</a-descriptions-item>
              <a-descriptions-item label="实际工时">{{ taskData.actualHours }}小时</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 任务描述 -->
          <a-card title="任务描述" class="info-card">
            <div class="task-description">
              {{ taskData.description }}
            </div>
          </a-card>

          <!-- 验收标准 -->
          <a-card title="验收标准" class="info-card">
            <div class="acceptance-criteria">
              <ul>
                <li v-for="(criteria, index) in taskData.acceptanceCriteria" :key="index">
                  {{ criteria }}
                </li>
              </ul>
            </div>
          </a-card>

          <!-- 进度更新 -->
          <a-card title="进度记录" class="info-card">
            <div class="progress-section">
              <div class="current-progress">
                <label>当前进度:</label>
                <a-progress :percent="taskProgress" />
              </div>
              
              <div class="progress-update" v-if="canUpdateProgress">
                <h4>更新进度</h4>
                <a-form layout="vertical">
                  <a-form-item label="进度百分比">
                    <a-slider v-model:value="newProgress" :min="taskProgress" :max="100" />
                    <span>{{ newProgress }}%</span>
                  </a-form-item>
                  <a-form-item label="工作说明">
                    <a-textarea 
                      v-model:value="progressNote" 
                      placeholder="请描述本次进度更新的工作内容"
                      :rows="3"
                    />
                  </a-form-item>
                  <a-form-item>
                    <a-space>
                      <a-button type="primary" @click="updateProgress" :loading="updating">
                        更新进度
                      </a-button>
                      <a-button v-if="newProgress === 100" type="primary" danger @click="markAsCompleted">
                        标记完成
                      </a-button>
                    </a-space>
                  </a-form-item>
                </a-form>
              </div>
            </div>

            <!-- 进度历史 -->
            <div class="progress-history">
              <h4>进度历史</h4>
              <a-timeline>
                <a-timeline-item 
                  v-for="record in progressHistory" 
                  :key="record.id"
                  :color="record.progress === 100 ? 'green' : 'blue'"
                >
                  <div class="progress-record">
                    <div class="record-header">
                      <span class="progress-value">{{ record.progress }}%</span>
                      <span class="record-time">{{ record.createdAt }}</span>
                    </div>
                    <div class="record-note">{{ record.note }}</div>
                    <div class="record-user">更新人: {{ record.updatedBy }}</div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
          </a-card>

          <!-- 文件附件 -->
          <a-card title="相关文件" class="info-card">
            <div class="files-section">
              <div class="file-upload" v-if="canUploadFiles">
                <a-upload
                  :file-list="fileList"
                  @change="handleFileChange"
                  :before-upload="beforeUpload"
                  multiple
                >
                  <a-button>
                    <UploadOutlined />
                    上传文件
                  </a-button>
                </a-upload>
              </div>
              
              <div class="file-list">
                <div v-for="file in taskData.attachments" :key="file.id" class="file-item">
                  <div class="file-info">
                    <FileOutlined />
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ file.size }}</span>
                  </div>
                  <div class="file-actions">
                    <a-button type="link" size="small" @click="downloadFile(file)">
                      下载
                    </a-button>
                    <a-button type="link" size="small" @click="previewFile(file)">
                      预览
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 右侧：操作和协作 -->
        <a-col :span="8">
          <!-- 快速操作 -->
          <a-card title="快速操作" class="action-card">
            <div class="quick-actions">
              <a-button block type="primary" @click="startWork" v-if="taskData.status === 'pending'">
                开始工作
              </a-button>
              <a-button block @click="requestHelp">
                <QuestionCircleOutlined />
                请求帮助
              </a-button>
              <a-button block @click="reportIssue">
                <ExclamationCircleOutlined />
                报告问题
              </a-button>
              <a-button block @click="viewProject">
                <ProjectOutlined />
                查看项目
              </a-button>
            </div>
          </a-card>

          <!-- 团队协作 -->
          <a-card title="团队成员" class="team-card">
            <div class="team-members">
              <div v-for="member in taskData.teamMembers" :key="member.id" class="member-item">
                <a-avatar :src="member.avatar" :size="32">
                  {{ member.name.charAt(0) }}
                </a-avatar>
                <div class="member-info">
                  <div class="member-name">{{ member.name }}</div>
                  <div class="member-role">{{ member.role }}</div>
                </div>
                <a-button type="link" size="small" @click="contactMember(member)">
                  联系
                </a-button>
              </div>
            </div>
          </a-card>

          <!-- 相关任务 -->
          <a-card title="相关任务" class="related-card">
            <div class="related-tasks">
              <div class="dependency-tasks">
                <h4>依赖任务</h4>
                <div v-for="task in taskData.dependencies" :key="task.id" class="related-task-item">
                  <a @click="goToTask(task.id)">{{ task.name }}</a>
                  <a-tag :color="getStatusColor(task.status)" size="small">
                    {{ getStatusText(task.status) }}
                  </a-tag>
                </div>
              </div>
              
              <div class="blocking-tasks">
                <h4>阻塞任务</h4>
                <div v-for="task in taskData.blockingTasks" :key="task.id" class="related-task-item">
                  <a @click="goToTask(task.id)">{{ task.name }}</a>
                  <a-tag :color="getStatusColor(task.status)" size="small">
                    {{ getStatusText(task.status) }}
                  </a-tag>
                </div>
              </div>
            </div>
          </a-card>

          <!-- 时间统计 -->
          <a-card title="时间统计" class="time-card">
            <div class="time-stats">
              <div class="stat-item">
                <span class="stat-label">预计工时:</span>
                <span class="stat-value">{{ taskData.estimatedHours }}小时</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已用工时:</span>
                <span class="stat-value">{{ taskData.actualHours }}小时</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">剩余工时:</span>
                <span class="stat-value">{{ remainingHours }}小时</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">效率:</span>
                <span class="stat-value" :class="efficiencyClass">{{ efficiency }}%</span>
              </div>
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
  UploadOutlined, 
  FileOutlined, 
  QuestionCircleOutlined, 
  ExclamationCircleOutlined,
  ProjectOutlined 
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const taskId = computed(() => route.params.id)
const updating = ref(false)
const newProgress = ref(0)
const progressNote = ref('')
const fileList = ref([])

// 任务数据
const taskData = reactive({
  id: '',
  name: '',
  projectName: '',
  type: '',
  priority: '',
  status: '',
  assignor: '',
  assignee: '',
  startDate: '',
  dueDate: '',
  estimatedHours: 0,
  actualHours: 0,
  description: '',
  acceptanceCriteria: [],
  attachments: [],
  teamMembers: [],
  dependencies: [],
  blockingTasks: []
})

// 进度历史
const progressHistory = ref([])

// 计算属性
const taskProgress = computed(() => {
  // 从进度历史中获取最新进度
  return progressHistory.value.length > 0 ? 
    progressHistory.value[0].progress : 0
})

const canUpdateProgress = computed(() => {
  return taskData.status === 'active' && taskData.assignee === '当前用户'
})

const canUploadFiles = computed(() => {
  return taskData.status !== 'completed' && taskData.assignee === '当前用户'
})

const remainingHours = computed(() => {
  return Math.max(0, taskData.estimatedHours - taskData.actualHours)
})

const efficiency = computed(() => {
  if (taskData.estimatedHours === 0) return 100
  return Math.round((taskProgress.value / 100) / (taskData.actualHours / taskData.estimatedHours) * 100)
})

const efficiencyClass = computed(() => {
  const eff = efficiency.value
  if (eff >= 100) return 'high-efficiency'
  if (eff >= 80) return 'medium-efficiency'
  return 'low-efficiency'
})

// 状态和优先级映射
const getStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'active': 'blue',
    'completed': 'green',
    'suspended': 'red'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待开始',
    'active': '进行中',
    'completed': '已完成',
    'suspended': '已暂停'
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

// 加载任务数据
const loadTaskData = async () => {
  try {
    // 这里应该调用API获取任务数据
    // const response = await getTaskDetail(taskId.value)
    
    // 模拟数据
    Object.assign(taskData, {
      id: taskId.value,
      name: '用户界面设计优化',
      projectName: '智能办公系统开发',
      type: '设计任务',
      priority: 'high',
      status: 'active',
      assignor: '张三（项目经理）',
      assignee: '当前用户',
      startDate: '2024-01-15',
      dueDate: '2024-01-25',
      estimatedHours: 40,
      actualHours: 25,
      description: '优化系统主要界面的用户体验，包括登录页面、工作台、项目管理等核心模块的界面设计。',
      acceptanceCriteria: [
        '界面设计符合公司品牌规范',
        '响应式设计适配多种设备',
        '用户体验测试通过率达到90%以上',
        '界面加载时间不超过2秒'
      ],
      attachments: [
        { id: 1, name: '界面设计规范.pdf', size: '2.5MB' },
        { id: 2, name: '原型图.sketch', size: '15.2MB' }
      ],
      teamMembers: [
        { id: 1, name: '李四', role: '前端开发', avatar: '' },
        { id: 2, name: '王五', role: 'UI设计师', avatar: '' }
      ],
      dependencies: [
        { id: 1, name: '需求分析', status: 'completed' },
        { id: 2, name: '技术架构设计', status: 'completed' }
      ],
      blockingTasks: [
        { id: 3, name: '前端框架开发', status: 'pending' }
      ]
    })

    // 模拟进度历史
    progressHistory.value = [
      {
        id: 3,
        progress: 65,
        note: '完成了登录页面和工作台的设计，正在进行项目管理界面设计',
        updatedBy: '当前用户',
        createdAt: '2024-01-20 14:30:00'
      },
      {
        id: 2,
        progress: 40,
        note: '完成了整体设计风格定义和主要组件设计',
        updatedBy: '当前用户',
        createdAt: '2024-01-18 10:15:00'
      },
      {
        id: 1,
        progress: 20,
        note: '完成需求分析和设计规划',
        updatedBy: '当前用户',
        createdAt: '2024-01-16 16:45:00'
      }
    ]

    newProgress.value = taskProgress.value

  } catch (error) {
    console.error('加载任务数据失败:', error)
    message.error('加载任务数据失败')
  }
}

// 更新进度
const updateProgress = async () => {
  try {
    updating.value = true
    
    // 这里应该调用API更新进度
    // await updateTaskProgress(taskId.value, newProgress.value, progressNote.value)
    
    // 模拟更新
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 添加新的进度记录
    progressHistory.value.unshift({
      id: Date.now(),
      progress: newProgress.value,
      note: progressNote.value,
      updatedBy: '当前用户',
      createdAt: new Date().toLocaleString()
    })
    
    progressNote.value = ''
    message.success('进度更新成功')
    
  } catch (error) {
    console.error('更新进度失败:', error)
    message.error('更新进度失败')
  } finally {
    updating.value = false
  }
}

// 标记完成
const markAsCompleted = async () => {
  try {
    // 这里应该调用API标记任务完成
    // await markTaskCompleted(taskId.value)
    
    taskData.status = 'completed'
    message.success('任务已标记为完成')
    
  } catch (error) {
    console.error('标记完成失败:', error)
    message.error('标记完成失败')
  }
}

// 其他操作函数
const startWork = () => {
  taskData.status = 'active'
  message.success('任务已开始')
}

const requestHelp = () => {
  message.info('已发送帮助请求给项目经理')
}

const reportIssue = () => {
  message.info('问题报告功能开发中')
}

const viewProject = () => {
  router.push('/team-member/projects/detail')
}

const contactMember = (member) => {
  message.info(`联系${member.name}`)
}

const goToTask = (taskId) => {
  router.push(`/team-member/tasks/${taskId}`)
}

const downloadFile = (file) => {
  message.info(`下载文件: ${file.name}`)
}

const previewFile = (file) => {
  message.info(`预览文件: ${file.name}`)
}

const handleFileChange = (info) => {
  fileList.value = info.fileList
}

const beforeUpload = () => {
  return false // 阻止自动上传
}

const goBack = () => {
  router.go(-1)
}

// 生命周期
onMounted(() => {
  loadTaskData()
})
</script>

<style scoped>
.task-detail-page {
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

.task-meta {
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
.action-card,
.team-card,
.related-card,
.time-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.task-description {
  line-height: 1.6;
  color: #666;
}

.acceptance-criteria ul {
  list-style-type: disc;
  padding-left: 20px;
}

.acceptance-criteria li {
  margin-bottom: 8px;
  color: #666;
}

.progress-section {
  margin-bottom: 24px;
}

.current-progress {
  margin-bottom: 24px;
}

.current-progress label {
  display: inline-block;
  margin-bottom: 8px;
  font-weight: 500;
}

.progress-update {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.progress-update h4 {
  margin-bottom: 16px;
  color: #234fa2;
}

.progress-record {
  margin-bottom: 16px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.progress-value {
  font-weight: bold;
  color: #234fa2;
}

.record-time {
  color: #999;
  font-size: 12px;
}

.record-note {
  color: #666;
  margin-bottom: 4px;
}

.record-user {
  color: #999;
  font-size: 12px;
}

.files-section {
  margin-bottom: 16px;
}

.file-upload {
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  color: #999;
  font-size: 12px;
}

.related-tasks {
  margin-top: 16px;
}

.related-tasks h4 {
  margin-bottom: 12px;
  color: #234fa2;
  font-size: 14px;
}

.related-task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.related-task-item:last-child {
  border-bottom: none;
}

.related-task-item a {
  color: #234fa2;
  text-decoration: none;
}

.related-task-item a:hover {
  text-decoration: underline;
}

.time-stats {
  margin-top: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 500;
}

.high-efficiency {
  color: #52c41a;
}

.medium-efficiency {
  color: #fa8c16;
}

.low-efficiency {
  color: #ff4d4f;
}
</style>