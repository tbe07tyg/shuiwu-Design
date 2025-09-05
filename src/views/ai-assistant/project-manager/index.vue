<template>
  <div class="ai-assistant-page">
    <div class="page-header">
      <h1>项目经理AI助手</h1>
      <p>智能项目管理助手，为您提供专业的项目建议和决策支持</p>
    </div>

    <div class="page-content">
      <!-- 左侧：AI聊天区域 -->
      <div class="chat-section">
        <AIChatBox />
      </div>

      <!-- 右侧：项目信息和智能分析 -->
      <div class="info-section">
        <!-- 项目概览 -->
        <div class="info-card">
          <div class="card-header">
            <h3>📊 项目概览</h3>
            <a-button size="small" @click="refreshProjectInfo">
              <ReloadOutlined />
            </a-button>
          </div>
          <div class="project-stats">
            <div class="stat-item">
              <div class="stat-number">{{ projectStats.totalProjects }}</div>
              <div class="stat-label">总项目数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ projectStats.activeProjects }}</div>
              <div class="stat-label">进行中</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ projectStats.completedProjects }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ projectStats.overdueProjects }}</div>
              <div class="stat-label">逾期项目</div>
            </div>
          </div>
        </div>

        <!-- 智能分析 -->
        <div class="info-card">
          <div class="card-header">
            <h3>🤖 智能分析</h3>
            <a-button size="small" @click="generateAnalysis">
              <ThunderboltOutlined />
            </a-button>
          </div>
          <div class="analysis-content">
            <div v-if="analysisLoading" class="loading-analysis">
              <a-spin />
              <p>正在生成分析报告...</p>
            </div>
            <div v-else-if="analysisResult" class="analysis-result">
              <div class="analysis-item" v-for="(item, index) in analysisResult" :key="index">
                <div class="analysis-icon">{{ item.icon }}</div>
                <div class="analysis-text">
                  <div class="analysis-title">{{ item.title }}</div>
                  <div class="analysis-desc">{{ item.description }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-analysis">
              <p>点击按钮生成智能分析报告</p>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="info-card">
          <div class="card-header">
            <h3>⚡ 快速操作</h3>
          </div>
          <div class="quick-actions">
            <a-button 
              v-for="action in quickActions" 
              :key="action.key"
              :type="action.type"
              :icon="action.icon"
              @click="handleQuickAction(action)"
              class="action-btn"
            >
              {{ action.label }}
            </a-button>
          </div>
        </div>

        <!-- 项目预警 -->
        <div class="info-card">
          <div class="card-header">
            <h3>⚠️ 项目预警</h3>
            <a-badge :count="alerts.length" />
          </div>
          <div class="alerts-list">
            <div 
              v-for="alert in alerts" 
              :key="alert.id"
              :class="['alert-item', alert.level]"
            >
              <div class="alert-icon">{{ alert.icon }}</div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-desc">{{ alert.description }}</div>
                <div class="alert-time">{{ formatTime(alert.time) }}</div>
              </div>
            </div>
            <div v-if="alerts.length === 0" class="no-alerts">
              <p>暂无预警信息</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="projectDetailVisible"
      title="项目详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedProject" class="project-detail">
        <div class="project-header">
          <h3>{{ selectedProject.name }}</h3>
          <a-tag :color="getStatusColor(selectedProject.status)">
            {{ selectedProject.status }}
          </a-tag>
        </div>
        
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="项目编号">
            {{ selectedProject.id }}
          </a-descriptions-item>
          <a-descriptions-item label="项目经理">
            {{ selectedProject.manager }}
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">
            {{ selectedProject.startDate }}
          </a-descriptions-item>
          <a-descriptions-item label="预计完成">
            {{ selectedProject.endDate }}
          </a-descriptions-item>
          <a-descriptions-item label="进度">
            <a-progress :percent="selectedProject.progress" />
          </a-descriptions-item>
          <a-descriptions-item label="预算">
            ¥{{ selectedProject.budget }}
          </a-descriptions-item>
        </a-descriptions>

        <div class="project-tasks">
          <h4>任务列表</h4>
          <a-list :data-source="selectedProject.tasks" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>{{ item.name }}</template>
                  <template #description>
                    <a-tag size="small" :color="getTaskStatusColor(item.status)">
                      {{ item.status }}
                    </a-tag>
                    <span class="task-assignee">{{ item.assignee }}</span>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-progress :percent="item.progress" size="small" />
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  ReloadOutlined, 
  ThunderboltOutlined,
  ProjectOutlined,
  TeamOutlined,
  ScheduleOutlined,
  AlertOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import AIChatBox from '@/components/ai/AIChatBox.vue'
import { useAIStore } from '@/store/modules/ai'

// 使用AI Store
const aiStore = useAIStore()

// 响应式数据
const analysisLoading = ref(false)
const analysisResult = ref(null)
const projectDetailVisible = ref(false)
const selectedProject = ref(null)

// 项目统计数据
const projectStats = reactive({
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 3,
  overdueProjects: 1
})

// 快速操作
const quickActions = [
  {
    key: 'create-project',
    label: '创建项目',
    icon: ProjectOutlined,
    type: 'primary'
  },
  {
    key: 'manage-team',
    label: '团队管理',
    icon: TeamOutlined,
    type: 'default'
  },
  {
    key: 'schedule-review',
    label: '进度审查',
    icon: ScheduleOutlined,
    type: 'default'
  },
  {
    key: 'risk-assessment',
    label: '风险评估',
    icon: AlertOutlined,
    type: 'default'
  }
]

// 预警信息
const alerts = ref([
  {
    id: 1,
    level: 'high',
    icon: '🚨',
    title: '项目A进度滞后',
    description: '项目A当前进度为60%，预计无法按时完成',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    level: 'medium',
    icon: '⚠️',
    title: '资源分配不均',
    description: '团队成员张三工作负载过高，建议重新分配任务',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 3,
    level: 'low',
    icon: '💡',
    title: '预算使用提醒',
    description: '项目B预算使用率达到80%，请注意控制成本',
    time: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
])

// 方法
const refreshProjectInfo = () => {
  // 模拟刷新项目信息
  message.success('项目信息已刷新')
}

const generateAnalysis = async () => {
  analysisLoading.value = true
  
  try {
    // 模拟AI分析
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    analysisResult.value = [
      {
        icon: '📈',
        title: '项目进度分析',
        description: '当前项目整体进度良好，但存在3个项目的进度风险，建议重点关注项目A、B、C的进度管理。'
      },
      {
        icon: '👥',
        title: '团队绩效分析',
        description: '团队整体绩效稳定，张三、李四表现优秀，建议给予适当激励。王五需要更多指导和支持。'
      },
      {
        icon: '💰',
        title: '成本控制分析',
        description: '预算使用情况正常，但项目B成本增长较快，建议优化资源配置，控制不必要的支出。'
      },
      {
        icon: '⚠️',
        title: '风险预警',
        description: '发现2个潜在风险：技术难点可能影响进度，供应商交付可能延期。建议制定应急预案。'
      }
    ]
    
    message.success('智能分析报告已生成')
  } catch (error) {
    message.error('分析生成失败，请重试')
  } finally {
    analysisLoading.value = false
  }
}

const handleQuickAction = (action) => {
  switch (action.key) {
    case 'create-project':
      message.info('跳转到项目创建页面')
      break
    case 'manage-team':
      message.info('跳转到团队管理页面')
      break
    case 'schedule-review':
      message.info('跳转到进度审查页面')
      break
    case 'risk-assessment':
      message.info('跳转到风险评估页面')
      break
  }
}

const getStatusColor = (status) => {
  const colors = {
    '进行中': 'blue',
    '已完成': 'green',
    '已暂停': 'orange',
    '已取消': 'red'
  }
  return colors[status] || 'default'
}

const getTaskStatusColor = (status) => {
  const colors = {
    '进行中': 'blue',
    '已完成': 'green',
    '待开始': 'orange',
    '已暂停': 'red'
  }
  return colors[status] || 'default'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  // 设置AI助手角色为项目经理
  aiStore.setRole('project_manager')
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

.project-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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
  font-size: 14px;
  color: #666;
}

.analysis-content {
  min-height: 200px;
}

.loading-analysis {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.analysis-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.analysis-icon {
  font-size: 20px;
}

.analysis-text {
  flex: 1;
}

.analysis-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #234fa2;
}

.analysis-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.no-analysis {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  height: 40px;
}

.alerts-list {
  max-height: 300px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid;
}

.alert-item.high {
  background: #fff2f0;
  border-left-color: #ff4d4f;
}

.alert-item.medium {
  background: #fff7e6;
  border-left-color: #fa8c16;
}

.alert-item.low {
  background: #f6ffed;
  border-left-color: #52c41a;
}

.alert-icon {
  font-size: 16px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.alert-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 12px;
  color: #999;
}

.no-alerts {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.project-detail {
  padding: 20px 0;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.project-header h3 {
  margin: 0;
  color: #234fa2;
}

.project-tasks {
  margin-top: 20px;
}

.project-tasks h4 {
  margin-bottom: 12px;
  color: #234fa2;
}

.task-assignee {
  margin-left: 8px;
  color: #666;
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
  
  .project-stats {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style> 