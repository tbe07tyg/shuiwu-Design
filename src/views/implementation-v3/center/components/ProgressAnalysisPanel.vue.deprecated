<!--
 * @file 进度分析面板组件
 * @description 整体进度趋势分析和风险预警
-->
<template>
  <a-card class="progress-analysis-card" title="📈 进度分析面板">
    <template #extra>
      <a-button size="small" @click="handleRefreshAnalysis">
        <ReloadOutlined />
        刷新分析
      </a-button>
    </template>

    <div class="analysis-content">
      <!-- 整体进度 -->
      <div class="overall-progress">
        <h4>整体进度</h4>
        <div class="progress-display">
          <div class="progress-circle">
            <a-progress 
              type="circle" 
              :percent="progressData.overallProgress" 
              :size="80"
              :status="getProgressStatus(progressData.overallProgress)"
            />
          </div>
          <div class="progress-info">
            <div class="progress-text">
              基于内容完成度计算
            </div>
            <div class="progress-note">
              相比传统进度条，更关注实质性成果
            </div>
          </div>
        </div>
      </div>

      <!-- 关键指标 -->
      <div class="key-indicators">
        <h4>关键指标</h4>
        <div class="indicators-grid">
          <div class="indicator-item">
            <div class="indicator-label">内容完成质量</div>
            <div class="indicator-value excellent">
              <component :is="getQualityIcon(progressData.contentQuality)" />
              <span>{{ getQualityText(progressData.contentQuality) }}</span>
            </div>
          </div>
          <div class="indicator-item">
            <div class="indicator-label">成员参与度</div>
            <div class="indicator-value">
              <TeamOutlined />
              <span>{{ progressData.memberParticipation }}%</span>
            </div>
          </div>
          <div class="indicator-item">
            <div class="indicator-label">里程碑达成率</div>
            <div class="indicator-value">
              <FlagOutlined />
              <span>{{ progressData.milestoneAchievement }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 风险提醒 -->
      <div class="risk-alerts">
        <h4>风险提醒</h4>
        <div class="alerts-list">
          <div 
            v-for="alert in riskAlerts" 
            :key="alert.id"
            class="alert-item"
            :class="getRiskLevelClass(alert.level)"
          >
            <div class="alert-header">
              <div class="alert-icon">
                <component :is="getRiskIcon(alert.level)" />
              </div>
              <div class="alert-content">
                <div class="alert-message">{{ alert.message }}</div>
                <div class="alert-type">{{ getRiskTypeText(alert.type) }}</div>
              </div>
            </div>
            <div class="alert-suggestion">
              <span class="suggestion-label">建议：</span>
              <span class="suggestion-text">{{ alert.suggestion }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 趋势分析 -->
      <div class="trend-analysis">
        <h4>进度趋势</h4>
        <div class="trend-chart">
          <!-- 简化的趋势图 -->
          <div class="trend-line">
            <div class="trend-point" v-for="(point, index) in trendData" :key="index" 
                 :style="{ left: (index * 20) + '%', bottom: point + '%' }">
              <div class="point-dot"></div>
              <div class="point-label">{{ getTrendLabel(index) }}</div>
            </div>
            <svg class="trend-svg" viewBox="0 0 100 50">
              <polyline 
                :points="getTrendPoints()" 
                fill="none" 
                stroke="#1890ff" 
                stroke-width="2"
              />
            </svg>
          </div>
        </div>
        <div class="trend-summary">
          <div class="summary-item">
            <ArrowUpOutlined />
            <span>整体趋势向好，按计划推进</span>
          </div>
        </div>
      </div>

      <!-- 智能建议 -->
      <div class="smart-suggestions">
        <h4>智能建议</h4>
        <div class="suggestions-list">
          <div class="suggestion-item">
            <div class="suggestion-icon">💡</div>
            <div class="suggestion-content">
              <div class="suggestion-title">优化资源配置</div>
              <div class="suggestion-desc">建议将部分资源从已完成任务转移到关键路径任务</div>
            </div>
          </div>
          <div class="suggestion-item">
            <div class="suggestion-icon">⚡</div>
            <div class="suggestion-content">
              <div class="suggestion-title">加强协作沟通</div>
              <div class="suggestion-desc">检测到跨团队协作频率较低，建议增加沟通会议</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleDetailedAnalysis">
          <BarChartOutlined />
          详细分析
        </a-button>
        <a-button @click="handleGenerateReport">
          <FileTextOutlined />
          生成报告
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import { 
  ReloadOutlined,
  TeamOutlined,
  FlagOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  progressData: {
    type: Object,
    default: () => ({})
  },
  riskAlerts: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['detailed-analysis', 'generate-report'])

// 模拟趋势数据
const trendData = [20, 35, 45, 60, 65] // 对应5个时间点的进度百分比

// 方法
const handleRefreshAnalysis = () => {
  message.success('分析数据已刷新')
}

const handleDetailedAnalysis = () => {
  emit('detailed-analysis')
}

const handleGenerateReport = () => {
  emit('generate-report')
}

// 工具方法
const getProgressStatus = (progress) => {
  if (progress >= 80) return 'success'
  if (progress >= 60) return 'active'
  if (progress >= 40) return 'normal'
  return 'exception'
}

const getQualityIcon = (quality) => {
  const iconMap = {
    'excellent': StarOutlined,
    'good': CheckCircleOutlined,
    'fair': InfoCircleOutlined,
    'poor': ExclamationCircleOutlined
  }
  return iconMap[quality] || InfoCircleOutlined
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

const getRiskLevelClass = (level) => {
  return `risk-${level}`
}

const getRiskIcon = (level) => {
  const iconMap = {
    'warning': WarningOutlined,
    'error': ExclamationCircleOutlined,
    'info': InfoCircleOutlined
  }
  return iconMap[level] || InfoCircleOutlined
}

const getRiskTypeText = (type) => {
  const textMap = {
    'schedule': '进度风险',
    'resource': '资源风险',
    'quality': '质量风险',
    'communication': '沟通风险'
  }
  return textMap[type] || type
}

const getTrendLabel = (index) => {
  const labels = ['1月', '2月', '3月', '4月', '5月']
  return labels[index] || ''
}

const getTrendPoints = () => {
  return trendData.map((value, index) => {
    const x = (index * 20)
    const y = (50 - value * 0.5) // 反转Y轴，因为SVG坐标系
    return `${x},${y}`
  }).join(' ')
}
</script>

<style scoped>
.progress-analysis-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.analysis-content h4 {
  color: #234fa2;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.overall-progress {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.progress-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-info {
  flex: 1;
}

.progress-text {
  color: #234fa2;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.progress-note {
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.4;
}

.indicators-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.indicator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.indicator-label {
  color: #8c8c8c;
  font-size: 12px;
}

.indicator-value {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #234fa2;
  font-weight: 500;
  font-size: 12px;
}

.indicator-value.excellent {
  color: #52c41a;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  padding: 8px;
  border-radius: 6px;
  border-left: 4px solid #e8e8e8;
}

.alert-item.risk-warning {
  background: #fff7e6;
  border-left-color: #faad14;
}

.alert-item.risk-error {
  background: #fff2f0;
  border-left-color: #ff4d4f;
}

.alert-item.risk-info {
  background: #e6f7ff;
  border-left-color: #1890ff;
}

.alert-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.alert-icon {
  color: #faad14;
  margin-top: 2px;
}

.alert-item.risk-error .alert-icon {
  color: #ff4d4f;
}

.alert-item.risk-info .alert-icon {
  color: #1890ff;
}

.alert-content {
  flex: 1;
}

.alert-message {
  color: #234fa2;
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 2px;
}

.alert-type {
  color: #8c8c8c;
  font-size: 11px;
}

.alert-suggestion {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.suggestion-label {
  color: #8c8c8c;
}

.suggestion-text {
  color: #234fa2;
}

.trend-analysis {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.trend-chart {
  position: relative;
  height: 80px;
  margin-bottom: 8px;
}

.trend-line {
  position: relative;
  width: 100%;
  height: 100%;
}

.trend-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.trend-point {
  position: absolute;
  transform: translateX(-50%);
}

.point-dot {
  width: 6px;
  height: 6px;
  background: #1890ff;
  border-radius: 50%;
  margin: 0 auto 4px;
}

.point-label {
  font-size: 10px;
  color: #8c8c8c;
  text-align: center;
  white-space: nowrap;
}

.trend-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #52c41a;
  font-size: 12px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.suggestion-icon {
  font-size: 16px;
  margin-top: 2px;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  color: #234fa2;
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 2px;
}

.suggestion-desc {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
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
  .progress-display {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .indicator-item {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
  
  .alert-header {
    flex-direction: column;
    gap: 4px;
  }
  
  .suggestion-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
