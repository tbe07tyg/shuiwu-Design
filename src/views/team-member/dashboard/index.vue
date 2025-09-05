<template>
  <div class="team-member-workbench">
    <div class="page-header">
      <h1>团队成员工作台</h1>
      <p>个人工作管理中心，高效管理任务、提升技能、协作团队</p>
    </div>

    <div class="workbench-content">
      <!-- 左侧：个人工作区域 -->
      <div class="main-section">
        <!-- 个人概览卡片 -->
        <div class="overview-card">
          <div class="overview-header">
            <div class="user-info">
              <a-avatar :size="64" src="https://joeschmoe.io/api/v1/random" />
              <div class="user-details">
                <h3>{{ userInfo.name }}</h3>
                <p>{{ userInfo.role }}</p>
                <a-tag :color="getStatusColor(userInfo.status)">
                  {{ userInfo.status }}
                </a-tag>
              </div>
            </div>
            <div class="quick-stats">
              <div class="stat-item">
                <div class="stat-number">{{ personalStats.totalTasks }}</div>
                <div class="stat-label">总任务</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ personalStats.completedTasks }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ personalStats.currentProjects }}</div>
                <div class="stat-label">参与项目</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ personalStats.performanceScore }}</div>
                <div class="stat-label">绩效评分</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 任务管理区域 -->
        <div class="tasks-section">
          <div class="section-header">
            <h2>📋 我的任务</h2>
            <div class="header-actions">
              <a-button type="primary" @click="createNewTask">
                <PlusOutlined />
                新建任务
              </a-button>
              <a-button @click="refreshTasks">
                <ReloadOutlined />
                刷新
              </a-button>
            </div>
          </div>

          <!-- 任务筛选 -->
          <div class="task-filters">
            <a-radio-group v-model:value="taskFilter" @change="filterTasks">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="todo">待处理</a-radio-button>
              <a-radio-button value="in-progress">进行中</a-radio-button>
              <a-radio-button value="completed">已完成</a-radio-button>
            </a-radio-group>
          </div>

          <!-- 任务列表 -->
          <div class="tasks-list">
            <div 
              v-for="task in filteredTasks" 
              :key="task.id"
              :class="['task-card', task.priority, task.status]"
              @click="viewTaskDetail(task)"
            >
              <div class="task-header">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <a-tag :color="getPriorityColor(task.priority)">
                    {{ task.priority }}
                  </a-tag>
                  <a-tag :color="getStatusColor(task.status)">
                    {{ task.status }}
                  </a-tag>
                </div>
              </div>
              <div class="task-description">{{ task.description }}</div>
              <div class="task-footer">
                <div class="task-project">{{ task.project }}</div>
                <div class="task-deadline">截止: {{ formatDate(task.deadline) }}</div>
                <a-progress :percent="task.progress" size="small" />
              </div>
            </div>
          </div>
        </div>

        <!-- 项目参与区域 -->
        <div class="projects-section">
          <div class="section-header">
            <h2>🏢 参与项目</h2>
          </div>
          <div class="projects-grid">
            <div 
              v-for="project in participatedProjects" 
              :key="project.id"
              class="project-card"
              @click="viewProjectDetail(project)"
            >
              <div class="project-header">
                <h4>{{ project.name }}</h4>
                <a-tag :color="getProjectStatusColor(project.status)">
                  {{ project.status }}
                </a-tag>
              </div>
              <div class="project-info">
                <p>{{ project.description }}</p>
                <div class="project-meta">
                  <span>角色: {{ project.role }}</span>
                  <span>参与度: {{ project.participation }}%</span>
                </div>
                <a-progress :percent="project.progress" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：AI助手和工具区域 -->
      <div class="sidebar-section">
        <!-- AI助手 -->
        <div class="ai-assistant-card">
          <div class="card-header">
            <h3>🤖 AI助手</h3>
            <a-button size="small" @click="openAIAssistant">
              <RobotOutlined />
              打开助手
            </a-button>
          </div>
          <div class="ai-suggestions">
            <div class="suggestion-item" v-for="suggestion in aiSuggestions" :key="suggestion.id">
              <div class="suggestion-icon">{{ suggestion.icon }}</div>
              <div class="suggestion-content">
                <div class="suggestion-title">{{ suggestion.title }}</div>
                <div class="suggestion-desc">{{ suggestion.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 技能提升 -->
        <div class="skills-card">
          <div class="card-header">
            <h3>🎯 技能提升</h3>
            <a-button size="small" @click="generateLearningPlan">
              <ThunderboltOutlined />
              生成计划
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
                <a-progress :percent="skill.progress" />
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
        <div class="workflow-card">
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

        <!-- 团队协作 -->
        <div class="collaboration-card">
          <div class="card-header">
            <h3>👥 团队协作</h3>
          </div>
          <div class="team-members">
            <div 
              v-for="member in teamMembers" 
              :key="member.id"
              class="member-item"
            >
              <a-avatar :size="32" :src="member.avatar" />
              <div class="member-info">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-role">{{ member.role }}</div>
              </div>
              <div class="member-status">
                <a-tag :color="getMemberStatusColor(member.status)">
                  {{ member.status }}
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
          <div class="task-tags">
            <a-tag :color="getPriorityColor(selectedTask.priority)">
              {{ selectedTask.priority }}
            </a-tag>
            <a-tag :color="getStatusColor(selectedTask.status)">
              {{ selectedTask.status }}
            </a-tag>
          </div>
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
          <a-button @click="markAsCompleted">
            标记完成
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- AI助手弹窗 -->
    <a-modal
      v-model:open="aiAssistantVisible"
      title="AI助手"
      width="800px"
      :footer="null"
    >
      <AIChatBox />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  PlusOutlined,
  ReloadOutlined, 
  ThunderboltOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import AIChatBox from '@/components/ai/AIChatBox.vue'
import { useAIStore } from '@/store/modules/ai'

// 使用AI Store
const aiStore = useAIStore()

// 响应式数据
const taskFilter = ref('all')
const taskDetailVisible = ref(false)
const selectedTask = ref(null)
const aiAssistantVisible = ref(false)
const learningPlanLoading = ref(false)
const learningPlan = ref(null)

// 用户信息
const userInfo = reactive({
  name: '张三',
  role: '前端开发工程师',
  status: '在线',
  avatar: 'https://joeschmoe.io/api/v1/random'
})

// 个人统计数据
const personalStats = reactive({
  totalTasks: 15,
  completedTasks: 12,
  currentProjects: 3,
  performanceScore: 85
})

// 任务列表
const tasks = ref([
  {
    id: 1,
    title: '用户界面优化',
    description: '优化登录页面的用户体验，提升页面加载速度',
    project: '科研管理系统',
    priority: 'high',
    status: 'in-progress',
    deadline: '2024-02-15',
    progress: 75,
    assignee: '张三',
    startDate: '2024-01-15'
  },
  {
    id: 2,
    title: '数据可视化组件开发',
    description: '开发项目进度图表组件，支持多种图表类型',
    project: '数据分析平台',
    priority: 'medium',
    status: 'todo',
    deadline: '2024-02-20',
    progress: 0,
    assignee: '张三',
    startDate: '2024-02-01'
  },
  {
    id: 3,
    title: 'API接口测试',
    description: '完成用户管理模块的API接口测试',
    project: '科研管理系统',
    priority: 'low',
    status: 'completed',
    deadline: '2024-02-25',
    progress: 100,
    assignee: '张三',
    startDate: '2024-01-20'
  }
])

// 参与的项目
const participatedProjects = ref([
  {
    id: 1,
    name: '科研管理系统',
    description: '企业级科研项目管理系统',
    status: '进行中',
    role: '前端开发',
    participation: 80,
    progress: 65
  },
  {
    id: 2,
    name: '数据分析平台',
    description: '数据可视化和分析平台',
    status: '进行中',
    role: '前端开发',
    participation: 60,
    progress: 45
  },
  {
    id: 3,
    name: '移动端应用',
    description: '科研管理移动端应用',
    status: '规划中',
    role: '前端开发',
    participation: 30,
    progress: 20
  }
])

// AI建议
const aiSuggestions = ref([
  {
    id: 1,
    icon: '💡',
    title: '任务优化建议',
    description: '建议优先处理高优先级任务，提高工作效率'
  },
  {
    id: 2,
    icon: '📚',
    title: '技能提升',
    description: '建议学习Vue 3新特性，提升技术能力'
  },
  {
    id: 3,
    icon: '🤝',
    title: '团队协作',
    description: '建议与后端同事沟通API接口规范'
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
  }
])

// 团队成员
const teamMembers = ref([
  {
    id: 1,
    name: '李四',
    role: '后端开发',
    status: '在线',
    avatar: 'https://joeschmoe.io/api/v1/random'
  },
  {
    id: 2,
    name: '王五',
    role: '产品经理',
    status: '忙碌',
    avatar: 'https://joeschmoe.io/api/v1/random'
  },
  {
    id: 3,
    name: '赵六',
    role: 'UI设计师',
    status: '在线',
    avatar: 'https://joeschmoe.io/api/v1/random'
  }
])

// 计算属性
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(task => {
    if (taskFilter.value === 'todo') return task.status === 'todo'
    if (taskFilter.value === 'in-progress') return task.status === 'in-progress'
    if (taskFilter.value === 'completed') return task.status === 'completed'
    return true
  })
})

// 方法
const createNewTask = () => {
  message.info('跳转到任务创建页面')
}

const refreshTasks = () => {
  message.success('任务列表已刷新')
}

const filterTasks = () => {
  // 任务筛选逻辑已在计算属性中处理
}

const viewTaskDetail = (task) => {
  // 跳转到任务详情页面
  router.push(`/team-member/tasks/${task.id}`)
}

const updateTaskProgress = () => {
  message.success('任务进度已更新')
  taskDetailVisible.value = false
}

const requestHelp = () => {
  message.info('已发送帮助请求给项目经理')
  taskDetailVisible.value = false
}

const markAsCompleted = () => {
  message.success('任务已标记为完成')
  taskDetailVisible.value = false
}

const viewProjectDetail = (project) => {
  // 跳转到项目详情页面
  router.push('/team-member/projects/detail')
}

const openAIAssistant = () => {
  aiAssistantVisible.value = true
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

const viewWorkflow = (workflow) => {
  message.info(`查看${workflow.title}流程详情`)
}

const getStatusColor = (status) => {
  const colors = {
    '在线': 'green',
    '离线': 'red',
    '忙碌': 'orange',
    'todo': 'orange',
    'in-progress': 'blue',
    'completed': 'green'
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

const getProjectStatusColor = (status) => {
  const colors = {
    '进行中': 'blue',
    '已完成': 'green',
    '规划中': 'orange',
    '已暂停': 'red'
  }
  return colors[status] || 'default'
}

const getWorkflowStatusColor = (status) => {
  const colors = {
    'active': 'green',
    'pending': 'orange',
    'inactive': 'red'
  }
  return colors[status] || 'default'
}

const getMemberStatusColor = (status) => {
  const colors = {
    '在线': 'green',
    '忙碌': 'orange',
    '离线': 'red'
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
.team-member-workbench {
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

.workbench-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details h3 {
  margin: 0 0 4px 0;
  color: #234fa2;
}

.user-details p {
  margin: 0 0 8px 0;
  color: #666;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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

.tasks-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #234fa2;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.task-filters {
  margin-bottom: 20px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  border: 1px solid #e8e8e8;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-card.high {
  border-left-color: #ff4d4f;
}

.task-card.medium {
  border-left-color: #fa8c16;
}

.task-card.low {
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

.task-meta {
  display: flex;
  gap: 8px;
}

.task-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.task-footer {
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

.projects-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.project-card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-header h4 {
  margin: 0;
  color: #234fa2;
}

.project-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-assistant-card,
.skills-card,
.workflow-card,
.collaboration-card {
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

.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.suggestion-icon {
  font-size: 20px;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #234fa2;
}

.suggestion-desc {
  font-size: 12px;
  color: #666;
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

.skill-suggestions {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
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

.team-members {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: bold;
  margin-bottom: 2px;
  color: #234fa2;
}

.member-role {
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

.task-tags {
  display: flex;
  gap: 8px;
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
  .workbench-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .team-member-workbench {
    padding: 16px;
  }
  
  .overview-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
  }
}
</style> 