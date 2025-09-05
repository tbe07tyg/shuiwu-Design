<!--
 * @file 成果管理中心组件
 * @description 阶段性成果归档和质量管理
-->
<template>
  <a-card class="achievement-center-card" title="📊 成果管理中心">
    <template #extra>
      <a-button size="small" @click="handleArchiveAll">
        <InboxOutlined />
        批量归档
      </a-button>
    </template>

    <div class="achievement-content">
      <!-- 本月成果统计 -->
      <div class="monthly-stats">
        <h4>本月成果统计</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
              <div class="stat-number">{{ monthlyStats.technicalReports }}</div>
              <div class="stat-label">技术报告</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
              <div class="stat-number">{{ monthlyStats.stageSummaries }}</div>
              <div class="stat-label">阶段总结</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🧪</div>
            <div class="stat-info">
              <div class="stat-number">{{ monthlyStats.testDocuments }}</div>
              <div class="stat-label">测试文档</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📎</div>
            <div class="stat-info">
              <div class="stat-number">{{ monthlyStats.otherAttachments }}</div>
              <div class="stat-label">其他附件</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新成果 -->
      <div class="latest-achievements">
        <div class="section-header">
          <h4>最新成果</h4>
          <a-select 
            v-model:value="filterStatus" 
            size="small" 
            style="width: 100px"
            @change="handleFilterChange"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="pending">审查中</a-select-option>
            <a-select-option value="revision_required">需修改</a-select-option>
          </a-select>
        </div>

        <div class="achievement-list">
          <div 
            v-for="achievement in filteredAchievements" 
            :key="achievement.id"
            class="achievement-item"
            :class="getStatusClass(achievement.status)"
          >
            <div class="achievement-header">
              <div class="achievement-info">
                <div class="achievement-title">{{ achievement.title }}</div>
                <div class="achievement-meta">
                  <a-tag :color="getTypeColor(achievement.type)" size="small">
                    {{ getTypeText(achievement.type) }}
                  </a-tag>
                  <a-tag :color="getQualityColor(achievement.quality)" size="small">
                    {{ getQualityText(achievement.quality) }}
                  </a-tag>
                </div>
              </div>
              <div class="achievement-status">
                <component :is="getStatusIcon(achievement.status)" />
                <span>{{ getStatusText(achievement.status) }}</span>
              </div>
            </div>

            <div class="achievement-details">
              <div class="detail-item">
                <UserOutlined />
                <span>提交人：{{ achievement.submittedBy }}</span>
              </div>
              <div class="detail-item">
                <ClockCircleOutlined />
                <span>提交时间：{{ formatTime(achievement.submitTime) }}</span>
              </div>
            </div>

            <div class="achievement-actions">
              <a-button 
                size="small" 
                type="text" 
                @click="handleViewAchievement(achievement)"
              >
                <EyeOutlined />
                查看
              </a-button>
              <a-button 
                size="small" 
                type="text" 
                @click="handleDownloadAchievement(achievement)"
              >
                <DownloadOutlined />
                下载
              </a-button>
              <a-button 
                v-if="achievement.status === 'approved'"
                size="small" 
                type="text" 
                @click="handleArchiveAchievement(achievement)"
              >
                <InboxOutlined />
                归档
              </a-button>
              <a-button 
                size="small" 
                type="text" 
                @click="handleQualityAssess(achievement)"
              >
                <StarOutlined />
                评估
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 质量分布 -->
      <div class="quality-distribution">
        <h4>成果质量分布</h4>
        <div class="quality-chart">
          <div class="quality-bar">
            <div class="quality-segment excellent" :style="{ width: getQualityPercentage('excellent') + '%' }">
              <span v-if="getQualityCount('excellent') > 0">优秀 {{ getQualityCount('excellent') }}</span>
            </div>
            <div class="quality-segment good" :style="{ width: getQualityPercentage('good') + '%' }">
              <span v-if="getQualityCount('good') > 0">良好 {{ getQualityCount('good') }}</span>
            </div>
            <div class="quality-segment fair" :style="{ width: getQualityPercentage('fair') + '%' }">
              <span v-if="getQualityCount('fair') > 0">一般 {{ getQualityCount('fair') }}</span>
            </div>
            <div class="quality-segment poor" :style="{ width: getQualityPercentage('poor') + '%' }">
              <span v-if="getQualityCount('poor') > 0">较差 {{ getQualityCount('poor') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">

        <a-button @click="handleQualityAnalysis">
          <BarChartOutlined />
          质量分析
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  InboxOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  StarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  achievements: {
    type: Array,
    default: () => []
  },
  monthlyStats: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['archive-achievement', 'quality-assess'])

// 响应式数据
const filterStatus = ref('all')

// 计算属性
const filteredAchievements = computed(() => {
  if (filterStatus.value === 'all') {
    return props.achievements
  }
  return props.achievements.filter(achievement => achievement.status === filterStatus.value)
})

// 方法
const handleArchiveAll = () => {
  const approvedAchievements = props.achievements.filter(a => a.status === 'approved')
  message.success(`批量归档 ${approvedAchievements.length} 个成果`)
  emit('archive-achievement', { action: 'batch', achievements: approvedAchievements })
}

const handleFilterChange = (value) => {
  console.log('筛选状态改变:', value)
}

const handleViewAchievement = (achievement) => {
  message.info(`查看成果：${achievement.title}`)
}

const handleDownloadAchievement = (achievement) => {
  message.success(`下载成果：${achievement.title}`)
}

const handleArchiveAchievement = (achievement) => {
  message.success(`成果已归档：${achievement.title}`)
  emit('archive-achievement', { action: 'single', achievement })
}

const handleQualityAssess = (achievement) => {
  message.info(`质量评估：${achievement.title}`)
  emit('quality-assess', achievement)
}

const handleExportReport = () => {
  message.success('成果报告导出成功')
}

const handleQualityAnalysis = () => {
  message.info('跳转到质量分析页面')
}

// 工具方法
const getStatusClass = (status) => {
  return `status-${status}`
}

const getStatusIcon = (status) => {
  const iconMap = {
    'approved': CheckCircleOutlined,
    'pending': SyncOutlined,
    'revision_required': ExclamationCircleOutlined
  }
  return iconMap[status] || SyncOutlined
}

const getStatusText = (status) => {
  const textMap = {
    'approved': '已通过',
    'pending': '审查中',
    'revision_required': '需修改'
  }
  return textMap[status] || status
}

const getTypeColor = (type) => {
  const colorMap = {
    'document': 'blue',
    'report': 'green',
    'code': 'purple'
  }
  return colorMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    'document': '文档',
    'report': '报告',
    'code': '代码'
  }
  return textMap[type] || type
}

const getQualityColor = (quality) => {
  const colorMap = {
    'excellent': 'success',
    'good': 'processing',
    'fair': 'warning',
    'poor': 'error'
  }
  return colorMap[quality] || 'default'
}

const getQualityText = (quality) => {
  const textMap = {
    'excellent': '优秀',
    'good': '良好',
    'fair': '一般',
    'poor': '较差'
  }
  return textMap[quality] || quality
}

const getQualityCount = (quality) => {
  return props.achievements.filter(a => a.quality === quality).length
}

const getQualityPercentage = (quality) => {
  const total = props.achievements.length
  if (total === 0) return 0
  const count = getQualityCount(quality)
  return Math.round((count / total) * 100)
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped>
.achievement-center-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.achievement-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.monthly-stats h4 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.stat-card:hover {
  background: #e6f7ff;
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 16px;
  font-weight: bold;
  color: #234fa2;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #8c8c8c;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h4 {
  color: #234fa2;
  margin: 0;
  font-size: 14px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.achievement-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #e8e8e8;
  transition: all 0.3s;
}

.achievement-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

.achievement-item.status-approved {
  border-left-color: #52c41a;
}

.achievement-item.status-pending {
  border-left-color: #1890ff;
}

.achievement-item.status-revision_required {
  border-left-color: #faad14;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
  margin-bottom: 4px;
}

.achievement-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.achievement-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.achievement-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;
  font-size: 12px;
}

.achievement-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quality-distribution h4 {
  color: #234fa2;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.quality-chart {
  margin-bottom: 8px;
}

.quality-bar {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;
}

.quality-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s;
}

.quality-segment.excellent {
  background: #52c41a;
}

.quality-segment.good {
  background: #1890ff;
}

.quality-segment.fair {
  background: #faad14;
}

.quality-segment.poor {
  background: #ff4d4f;
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
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .achievement-actions {
    justify-content: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .quality-segment span {
    display: none;
  }
}
</style>

