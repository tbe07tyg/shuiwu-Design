<!--
 * @file 知识管理面板组件
 * @description 个人知识库和学习计划管理
-->
<template>
  <a-card class="knowledge-management-card" title="📚 知识管理">
    <template #extra>
      <a-button type="primary" size="small" @click="handleAddKnowledge">
        <PlusOutlined />
        添加知识
      </a-button>
    </template>

    <div class="knowledge-content">
      <!-- 学习进度概览 -->
      <div class="learning-overview">
        <h4>学习进度</h4>
        <div class="progress-items">
          <div 
            v-for="plan in learningPlan" 
            :key="plan.id"
            class="progress-item"
          >
            <div class="progress-header">
              <div class="skill-name">{{ plan.skill }}</div>
              <div class="progress-percent">{{ plan.progress }}%</div>
            </div>
            <a-progress 
              :percent="plan.progress" 
              size="small"
              :status="getProgressStatus(plan.status)"
            />
            <div class="progress-details">
              <span class="current-level">{{ plan.currentLevel }}</span>
              <ArrowRightOutlined style="color: #8c8c8c; font-size: 12px;" />
              <span class="target-level">{{ plan.targetLevel }}</span>
              <span class="deadline">{{ formatDate(plan.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识库 -->
      <div class="knowledge-base">
        <div class="section-header">
          <h4>个人知识库</h4>
          <a-select 
            v-model:value="knowledgeFilter" 
            size="small" 
            style="width: 100px"
            @change="handleKnowledgeFilter"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="document">文档</a-select-option>
            <a-select-option value="code">代码</a-select-option>
            <a-select-option value="link">链接</a-select-option>
            <a-select-option value="note">笔记</a-select-option>
          </a-select>
        </div>

        <div class="knowledge-list">
          <div 
            v-for="item in filteredKnowledgeBase" 
            :key="item.id"
            class="knowledge-item"
            @click="handleViewKnowledge(item)"
          >
            <div class="knowledge-header">
              <div class="knowledge-info">
                <div class="knowledge-title">{{ item.title }}</div>
                <div class="knowledge-meta">
                  <a-tag :color="getTypeColor(item.type)" size="small">
                    {{ getTypeText(item.type) }}
                  </a-tag>
                  <a-tag color="blue" size="small">{{ item.category }}</a-tag>
                </div>
              </div>
              <div class="knowledge-actions">
                <a-button size="small" type="text" @click.stop="handleEditKnowledge(item)">
                  <EditOutlined />
                </a-button>
                <a-button size="small" type="text" @click.stop="handleShareKnowledge(item)">
                  <ShareAltOutlined />
                </a-button>
              </div>
            </div>

            <div v-if="item.tags && item.tags.length > 0" class="knowledge-tags">
              <a-tag 
                v-for="tag in item.tags" 
                :key="tag"
                size="small"
                color="blue"
              >
                {{ tag }}
              </a-tag>
            </div>

            <div class="knowledge-time">
              <ClockCircleOutlined />
              <span>{{ formatTime(item.createdTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习计划 -->
      <div class="learning-plan">
        <div class="section-header">
          <h4>学习计划</h4>
          <a-button size="small" type="text" @click="handleUpdateLearningPlan">
            <EditOutlined />
            编辑计划
          </a-button>
        </div>

        <div class="plan-list">
          <div 
            v-for="plan in learningPlan" 
            :key="plan.id"
            class="plan-item"
            :class="getPlanStatusClass(plan.status)"
          >
            <div class="plan-header">
              <div class="plan-skill">{{ plan.skill }}</div>
              <div class="plan-status">
                <a-tag :color="getStatusColor(plan.status)" size="small">
                  {{ getStatusText(plan.status) }}
                </a-tag>
              </div>
            </div>

            <div class="plan-progress">
              <div class="level-info">
                <span class="current">{{ plan.currentLevel }}</span>
                <ArrowRightOutlined />
                <span class="target">{{ plan.targetLevel }}</span>
              </div>
              <a-progress 
                :percent="plan.progress" 
                size="small"
                :status="getProgressStatus(plan.status)"
              />
            </div>

            <div class="plan-deadline">
              <CalendarOutlined />
              <span>目标完成：{{ formatDate(plan.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="knowledgeBase.length === 0 && learningPlan.length === 0" class="empty-state">
        <a-empty description="开始构建你的知识体系">
          <a-space>
            <a-button type="primary" @click="handleAddKnowledge">
              添加知识
            </a-button>
            <a-button @click="handleCreateLearningPlan">
              制定学习计划
            </a-button>
          </a-space>
        </a-empty>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button @click="handleExportKnowledge">
          <ExportOutlined />
          导出知识库
        </a-button>
        <a-button @click="handleKnowledgeStatistics">
          <BarChartOutlined />
          学习统计
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PlusOutlined,
  ArrowRightOutlined,
  EditOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ExportOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  knowledgeBase: {
    type: Array,
    default: () => []
  },
  learningPlan: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['add-knowledge', 'update-learning-plan'])

// 响应式数据
const knowledgeFilter = ref('all')

// 计算属性
const filteredKnowledgeBase = computed(() => {
  if (knowledgeFilter.value === 'all') {
    return props.knowledgeBase.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
  }
  return props.knowledgeBase
    .filter(item => item.type === knowledgeFilter.value)
    .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
})

// 方法
const handleAddKnowledge = () => {
  emit('add-knowledge')
}

const handleKnowledgeFilter = () => {
  console.log('知识筛选:', knowledgeFilter.value)
}

const handleViewKnowledge = (item) => {
  message.info(`查看知识：${item.title}`)
}

const handleEditKnowledge = (item) => {
  message.info(`编辑知识：${item.title}`)
}

const handleShareKnowledge = (item) => {
  message.success(`知识已分享：${item.title}`)
}

const handleUpdateLearningPlan = () => {
  emit('update-learning-plan')
}

const handleCreateLearningPlan = () => {
  message.info('创建学习计划')
}

const handleExportKnowledge = () => {
  message.success('知识库导出成功')
}

const handleKnowledgeStatistics = () => {
  message.info('查看学习统计')
}

// 工具方法
const getProgressStatus = (status) => {
  const statusMap = {
    'completed': 'success',
    'in_progress': 'active',
    'paused': 'exception',
    'pending': 'normal'
  }
  return statusMap[status] || 'normal'
}

const getPlanStatusClass = (status) => {
  return `plan-${status}`
}

const getTypeColor = (type) => {
  const colorMap = {
    'document': 'blue',
    'code': 'green',
    'link': 'orange',
    'note': 'purple'
  }
  return colorMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    'document': '文档',
    'code': '代码',
    'link': '链接',
    'note': '笔记'
  }
  return textMap[type] || type
}

const getStatusColor = (status) => {
  const colorMap = {
    'completed': 'success',
    'in_progress': 'processing',
    'paused': 'warning',
    'pending': 'default'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'paused': '已暂停',
    'pending': '待开始'
  }
  return textMap[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatTime = (timeString) => {
  if (!timeString) return '-'
  const time = new Date(timeString)
  const now = new Date()
  const diffDays = Math.floor((now - time) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return time.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.knowledge-management-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.knowledge-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.knowledge-content h4 {
  color: #234fa2;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.learning-overview {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.progress-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  background: #fff;
  padding: 8px;
  border-radius: 6px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.skill-name {
  font-weight: 500;
  color: #234fa2;
  font-size: 13px;
}

.progress-percent {
  color: #8c8c8c;
  font-size: 12px;
}

.progress-details {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.current-level {
  color: #faad14;
}

.target-level {
  color: #52c41a;
}

.deadline {
  margin-left: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s;
}

.knowledge-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
  border-left-color: #1890ff;
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.knowledge-info {
  flex: 1;
}

.knowledge-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
  margin-bottom: 4px;
}

.knowledge-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.knowledge-actions {
  display: flex;
  gap: 4px;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.knowledge-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #e8e8e8;
  transition: all 0.3s;
}

.plan-item.plan-in_progress {
  border-left-color: #1890ff;
}

.plan-item.plan-completed {
  border-left-color: #52c41a;
}

.plan-item.plan-paused {
  border-left-color: #faad14;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.plan-skill {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
}

.plan-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  min-width: 80px;
}

.level-info .current {
  color: #faad14;
}

.level-info .target {
  color: #52c41a;
}

.plan-deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-buttons .ant-btn {
  flex: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .progress-header,
  .knowledge-header,
  .plan-header {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .progress-details {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .plan-progress {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
