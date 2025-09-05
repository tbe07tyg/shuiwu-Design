<template>
  <div class="ai-assistant-page">
    <div class="page-header">
      <h1>团队成员AI助手</h1>
      <p>智能工作助手，为您提供任务指导、技能提升和工作流程支持</p>
    </div>

    <div class="page-content">
      <!-- 左侧：AI聊天区域 -->
      <div class="chat-section">
        <AIChatBox />
      </div>

      <!-- 右侧：个人信息和工作状态 -->
      <div class="info-section">
        <!-- 个人信息 -->
        <div class="info-card">
          <div class="card-header">
            <h3>👤 个人信息</h3>
            <a-button size="small" @click="editProfile">
              <EditOutlined />
            </a-button>
          </div>
          <div class="profile-info">
            <div class="avatar-section">
              <a-avatar :size="64" src="https://joeschmoe.io/api/v1/random" />
              <div class="user-info">
                <h4>{{ userInfo.name }}</h4>
                <p>{{ userInfo.role }}</p>
                <a-tag :color="getStatusColor(userInfo.status)">
                  {{ userInfo.status }}
                </a-tag>
              </div>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ userStats.totalTasks }}</div>
                <div class="stat-label">总任务</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.completedTasks }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.currentProjects }}</div>
                <div class="stat-label">参与项目</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.performanceScore }}</div>
                <div class="stat-label">绩效评分</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 当前任务 -->
        <div class="info-card">
          <div class="card-header">
            <h3>📋 当前任务</h3>
            <a-button size="small" @click="refreshTasks">
              <ReloadOutlined />
            </a-button>
          </div>
          <div class="tasks-list">
            <div 
              v-for="task in currentTasks" 
              :key="task.id"
              :class="['task-item', task.priority]"
              @click="viewTaskDetail(task)"
            >
              <div class="task-header">
                <div class="task-title">{{ task.title }}</div>
                <a-tag :color="getPriorityColor(task.priority)">
                  {{ task.priority }}
                </a-tag>
              </div>
              <div class="task-desc">{{ task.description }}</div>
              <div class="task-meta">
                <span class="task-project">{{ task.project }}</span>
                <span class="task-deadline">截止: {{ formatDate(task.deadline) }}</span>
                <a-progress :percent="task.progress" size="small" />
              </div>
            </div>
            <div v-if="currentTasks.length === 0" class="no-tasks">
              <p>暂无进行中的任务</p>
            </div>
          </div>
        </div>

        <!-- 技能提升 -->
        <div class="info-card">
          <div class="card-header">
            <h3>🎯 技能提升</h3>
            <a-button size="small" @click="generateLearningPlan">
              <ThunderboltOutlined />
            </a-button>
          </div>
          <div class="skills-content">
            <div v-if="learningPlanLoading" class="loading-plan">
              <a-spin />
              <p>正在生成学习计划...</p>
            </div>
            <div v-else-if="learningPlan" class="learning-plan">
              <div class="skill-item" v-for="(skill, index) in learningPlan" :key="index">
                <div class="skill-header">
                  <div class="skill-name">{{ skill.name }}</div>
                  <div class="skill-level">{{ skill.currentLevel }} → {{ skill.targetLevel }}</div>
                </div>
                <div class="skill-progress">
                  <a-progress :percent="skill.progress" />
                </div>
                <div class="skill-suggestions">
                  <div class="suggestion-item" v-for="suggestion in skill.suggestions" :key="suggestion">
                    • {{ suggestion }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-plan">
              <p>点击按钮生成个性化学习计划</p>
            </div>
          </div>
        </div>

        <!-- 工作流程 -->
        <div class="info-card">
          <div class="card-header">
            <h3>🔄 工作流程</h3>
          </div>
          <div class="workflow-list">
            <div 
              v-for="workflow in workflows" 
              :key="workflow.id"
              class="workflow-item"
              @click="viewWorkflow(workflow)"
            >
              <div class="workflow-icon">{{ workflow.icon }}</div>
              <div class="workflow-content">
                <div class="workflow-title">{{ workflow.title }}</div>
                <div class="workflow-desc">{{ workflow.description }}</div>
              </div>
              <div class="workflow-status">
                <a-tag :color="getWorkflowStatusColor(workflow.status)">
                  {{ workflow.status }}
                </a-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务详情弹窗 -->
    <a-modal
      v-model:open="taskDetailVisible"
      title="任务详情"
      width="600px"
      :footer="null"
    >
      <div v-if="selectedTask" class="task-detail">
        <div class="task-header">
          <h3>{{ selectedTask.title }}</h3>
          <a-tag :color="getPriorityColor(selectedTask.priority)">
            {{ selectedTask.priority }}
          </a-tag>
        </div>
        
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="项目">
            {{ selectedTask.project }}
          </a-descriptions-item>
          <a-descriptions-item label="负责人">
            {{ selectedTask.assignee }}
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">
            {{ selectedTask.startDate }}
          </a-descriptions-item>
          <a-descriptions-item label="截止时间">
            {{ selectedTask.deadline }}
          </a-descriptions-item>
          <a-descriptions-item label="进度">
            <a-progress :percent="selectedTask.progress" />
          </a-descriptions-item>
        </a-descriptions>

        <div class="task-description">
          <h4>任务描述</h4>
          <p>{{ selectedTask.description }}</p>
        </div>

        <div class="task-actions">
          <a-button type="primary" @click="updateTaskProgress">
            更新进度
          </a-button>
          <a-button @click="requestHelp">
            请求帮助
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  EditOutlined,
  ReloadOutlined, 
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import AIChatBox from '@/components/ai/AIChatBox.vue'
import { useAIStore } from '@/store/modules/ai'

// 使用AI Store
const aiStore = useAIStore()

// 响应式数据
const learningPlanLoading = ref(false)
const learningPlan = ref(null)
const taskDetailVisible = ref(false)
const selectedTask = ref(null)

// 用户信息
const userInfo = reactive({
  name: '张三',
  role: '前端开发工程师',
  status: '在线',
  avatar: 'https://joeschmoe.io/api/v1/random'
})

// 用户统计数据
const userStats = reactive({
  totalTasks: 15,
  completedTasks: 12,
  currentProjects: 3,
  performanceScore: 85
})

// 当前任务
const currentTasks = ref([
  {
    id: 1,
    title: '用户界面优化',
    description: '优化登录页面的用户体验，提升页面加载速度',
    project: '科研管理系统',
    priority: 'high',
    deadline: '2024-02-15',
    progress: 75
  },
  {
    id: 2,
    title: '数据可视化组件开发',
    description: '开发项目进度图表组件，支持多种图表类型',
    project: '数据分析平台',
    priority: 'medium',
    deadline: '2024-02-20',
    progress: 45
  },
  {
    id: 3,
    title: 'API接口测试',
    description: '完成用户管理模块的API接口测试',
    project: '科研管理系统',
    priority: 'low',
    deadline: '2024-02-25',
    progress: 90
  }
])

// 工作流程
const workflows = ref([
  {
    id: 1,
    icon: '📝',
    title: '代码提交',
    description: 'Git代码提交和代码审查流程',
    status: 'active'
  },
  {
    id: 2,
    icon: '🧪',
    title: '测试流程',
    description: '单元测试和集成测试流程',
    status: 'active'
  },
  {
    id: 3,
    icon: '🚀',
    title: '部署流程',
    description: '自动化部署和发布流程',
    status: 'pending'
  },
  {
    id: 4,
    icon: '📊',
    title: '性能监控',
    description: '应用性能监控和优化流程',
    status: 'active'
  }
])

// 方法
const editProfile = () => {
  message.info('跳转到个人资料编辑页面')
}

const refreshTasks = () => {
  message.success('任务列表已刷新')
}

const generateLearningPlan = async () => {
  learningPlanLoading.value = true
  
  try {
    // 模拟AI生成学习计划
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    learningPlan.value = [
      {
        name: 'Vue.js 3.0',
        currentLevel: '中级',
        targetLevel: '高级',
        progress: 70,
        suggestions: [
          '深入学习Composition API',
          '掌握Vue 3性能优化技巧',
          '学习TypeScript集成'
        ]
      },
      {
        name: '前端工程化',
        currentLevel: '初级',
        targetLevel: '中级',
        progress: 40,
        suggestions: [
          '学习Webpack配置优化',
          '掌握CI/CD流程',
          '了解微前端架构'
        ]
      },
      {
        name: 'UI/UX设计',
        currentLevel: '初级',
        targetLevel: '中级',
        progress: 60,
        suggestions: [
          '学习设计系统构建',
          '掌握用户研究方法',
          '了解无障碍设计'
        ]
      }
    ]
    
    message.success('个性化学习计划已生成')
  } catch (error) {
    message.error('学习计划生成失败，请重试')
  } finally {
    learningPlanLoading.value = false
  }
}

const viewTaskDetail = (task) => {
  selectedTask.value = {
    ...task,
    assignee: '张三',
    startDate: '2024-01-15'
  }
  taskDetailVisible.value = true
}

const updateTaskProgress = () => {
  message.success('任务进度已更新')
  taskDetailVisible.value = false
}

const requestHelp = () => {
  message.info('已发送帮助请求给项目经理')
  taskDetailVisible.value = false
}

const viewWorkflow = (workflow) => {
  message.info(`查看${workflow.title}流程详情`)
}

const getStatusColor = (status) => {
  const colors = {
    '在线': 'green',
    '离线': 'red',
    '忙碌': 'orange'
  }
  return colors[status] || 'default'
}

const getPriorityColor = (priority) => {
  const colors = {
    'high': 'red',
    'medium': 'orange',
    'low': 'green'
  }
  return colors[priority] || 'default'
}

const getWorkflowStatusColor = (status) => {
  const colors = {
    'active': 'green',
    'pending': 'orange',
    'inactive': 'red'
  }
  return colors[status] || 'default'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  // 设置AI助手角色为团队成员
  aiStore.setRole('team_member')
})
</script>

<style scoped>
.ai-assistant-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header h1 {
  color: #234fa2;
  margin-bottom: 8px;
}

.page-header p {
  color: #666;
  margin: 0;
}

.page-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.chat-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  color: #234fa2;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info h4 {
  margin: 0 0 4px 0;
  color: #234fa2;
}

.user-info p {
  margin: 0 0 8px 0;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.3s;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-item.high {
  background: #fff2f0;
  border-left-color: #ff4d4f;
}

.task-item.medium {
  background: #fff7e6;
  border-left-color: #fa8c16;
}

.task-item.low {
  background: #f6ffed;
  border-left-color: #52c41a;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-title {
  font-weight: bold;
  color: #234fa2;
}

.task-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-project {
  font-size: 12px;
  color: #999;
}

.task-deadline {
  font-size: 12px;
  color: #999;
}

.no-tasks {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.skills-content {
  min-height: 200px;
}

.loading-plan {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.learning-plan {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skill-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.skill-name {
  font-weight: bold;
  color: #234fa2;
}

.skill-level {
  font-size: 12px;
  color: #666;
}

.skill-progress {
  margin-bottom: 8px;
}

.skill-suggestions {
  font-size: 12px;
  color: #666;
}

.suggestion-item {
  margin-bottom: 4px;
}

.no-plan {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workflow-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.workflow-item:hover {
  background: #e6f7ff;
}

.workflow-icon {
  font-size: 20px;
}

.workflow-content {
  flex: 1;
}

.workflow-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #234fa2;
}

.workflow-desc {
  font-size: 12px;
  color: #666;
}

.task-detail {
  padding: 20px 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-header h3 {
  margin: 0;
  color: #234fa2;
}

.task-description {
  margin-top: 20px;
}

.task-description h4 {
  margin-bottom: 8px;
  color: #234fa2;
}

.task-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-content {
    grid-template-columns: 1fr;
  }
  
  .info-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .ai-assistant-page {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style> 