<!--
 * @file 进展描述面板组件
 * @description 记录和管理个人工作进展
-->
<template>
  <a-card class="progress-description-card" title="📝 进展描述">
    <template #extra>
      <a-button type="primary" size="small" @click="handleAddProgress">
        <PlusOutlined />
        记录进展
      </a-button>
    </template>

    <div class="progress-content">
      <!-- 进展统计 -->
      <div class="progress-stats">
        <div class="stat-item">
          <div class="stat-number">{{ getTodayProgress() }}</div>
          <div class="stat-label">今日进展</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ getWeeklyProgress() }}</div>
          <div class="stat-label">本周记录</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ getAverageConfidence() }}%</div>
          <div class="stat-label">平均信心度</div>
        </div>
      </div>

      <!-- 快速记录 -->
      <div class="quick-record">
        <h4>快速记录今日进展</h4>
        <a-textarea
          v-model:value="quickProgressText"
          placeholder="简要描述今天的工作进展和收获..."
          :rows="2"
          show-count
          :maxlength="200"
        />
        <div class="quick-actions">
          <a-button size="small" @click="handleQuickSave">
            <SaveOutlined />
            快速保存
          </a-button>
          <a-button size="small" @click="handleDetailedRecord">
            <EditOutlined />
            详细记录
          </a-button>
        </div>
      </div>

      <!-- 进展记录列表 -->
      <div class="progress-records">
        <div class="section-header">
          <h4>进展记录</h4>
          <a-select 
            v-model:value="recordFilter" 
            size="small" 
            style="width: 100px"
            @change="handleRecordFilter"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="daily">日报</a-select-option>
            <a-select-option value="weekly">周报</a-select-option>
            <a-select-option value="milestone">里程碑</a-select-option>
          </a-select>
        </div>

        <div class="records-list">
          <div 
            v-for="record in filteredRecords" 
            :key="record.id"
            class="record-item"
            :class="getRecordTypeClass(record.type)"
          >
            <div class="record-header">
              <div class="record-info">
                <div class="record-date">{{ formatDate(record.date) }}</div>
                <div class="record-type">
                  <a-tag :color="getTypeColor(record.type)" size="small">
                    {{ getTypeText(record.type) }}
                  </a-tag>
                  <component :is="getMoodIcon(record.mood)" />
                </div>
              </div>
              <div class="record-confidence">
                <span class="confidence-label">信心度：</span>
                <a-progress 
                  :percent="record.confidence" 
                  size="small"
                  :status="getConfidenceStatus(record.confidence)"
                  style="width: 60px;"
                />
              </div>
            </div>

            <div class="record-content">
              <!-- 完成事项 -->
              <div v-if="record.accomplished && record.accomplished.length > 0" class="content-section">
                <h5>✅ 完成事项</h5>
                <ul class="accomplished-list">
                  <li v-for="item in record.accomplished" :key="item">{{ item }}</li>
                </ul>
              </div>

              <!-- 遇到的挑战 -->
              <div v-if="record.challenges && record.challenges.length > 0" class="content-section">
                <h5>⚠️ 遇到的挑战</h5>
                <div class="challenges-list">
                  <div v-for="challenge in record.challenges" :key="challenge.issue" class="challenge-item">
                    <div class="challenge-issue">{{ challenge.issue }}</div>
                    <div class="challenge-impact">影响：{{ challenge.impact }}</div>
                    <div class="challenge-status">状态：{{ challenge.status }}</div>
                  </div>
                </div>
              </div>

              <!-- 下一步计划 -->
              <div v-if="record.nextPlans && record.nextPlans.length > 0" class="content-section">
                <h5>📋 下一步计划</h5>
                <ul class="plans-list">
                  <li v-for="plan in record.nextPlans" :key="plan">{{ plan }}</li>
                </ul>
              </div>

              <!-- 时间分配 -->
              <div v-if="record.timeSpent" class="content-section">
                <h5>⏰ 时间分配</h5>
                <div class="time-distribution">
                  <div class="time-item">
                    <span class="time-label">研究：</span>
                    <span class="time-value">{{ record.timeSpent.research }}小时</span>
                  </div>
                  <div class="time-item">
                    <span class="time-label">开发：</span>
                    <span class="time-value">{{ record.timeSpent.development }}小时</span>
                  </div>
                  <div class="time-item">
                    <span class="time-label">文档：</span>
                    <span class="time-value">{{ record.timeSpent.documentation }}小时</span>
                  </div>
                  <div class="time-item">
                    <span class="time-label">沟通：</span>
                    <span class="time-value">{{ record.timeSpent.communication }}小时</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="record-actions">
              <a-button size="small" type="text" @click="handleEditRecord(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button size="small" type="text" @click="handleViewRecord(record)">
                <EyeOutlined />
                详情
              </a-button>
              <a-button size="small" type="text" @click="handleShareRecord(record)">
                <ShareAltOutlined />
                分享
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="progressRecords.length === 0" class="empty-state">
        <a-empty description="暂无进展记录">
          <a-button type="primary" @click="handleAddProgress">
            <PlusOutlined />
            记录第一个进展
          </a-button>
        </a-empty>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button @click="handleGenerateWeeklyReport">
          <FileTextOutlined />
          生成周报
        </a-button>
        <a-button @click="handleExportProgress">
          <ExportOutlined />
          导出记录
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PlusOutlined,
  SaveOutlined,
  EditOutlined,
  EyeOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  ExportOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  progressRecords: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['add-progress', 'generate-weekly-report'])

// 响应式数据
const quickProgressText = ref('')
const recordFilter = ref('all')

// 计算属性
const filteredRecords = computed(() => {
  if (recordFilter.value === 'all') {
    return props.progressRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  return props.progressRecords
    .filter(record => record.type === recordFilter.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 方法
const handleAddProgress = () => {
  emit('add-progress')
}

const handleQuickSave = () => {
  if (!quickProgressText.value.trim()) {
    message.warning('请输入进展内容')
    return
  }
  
  const quickRecord = {
    type: 'daily',
    accomplished: [quickProgressText.value.trim()],
    challenges: [],
    nextPlans: [],
    mood: 'positive',
    confidence: 80
  }
  
  emit('add-progress', quickRecord)
  quickProgressText.value = ''
  message.success('进展记录保存成功')
}

const handleDetailedRecord = () => {
  emit('add-progress')
}

const handleRecordFilter = () => {
  console.log('记录筛选:', recordFilter.value)
}

const handleEditRecord = (record) => {
  message.info(`编辑记录：${record.date}`)
}

const handleViewRecord = (record) => {
  message.info(`查看记录：${record.date}`)
}

const handleShareRecord = (record) => {
  message.success(`记录已分享：${record.date}`)
}

const handleGenerateWeeklyReport = () => {
  emit('generate-weekly-report')
}

const handleExportProgress = () => {
  message.success('进展记录导出成功')
}

// 工具方法
const getTodayProgress = () => {
  const today = new Date().toISOString().split('T')[0]
  return props.progressRecords.filter(record => record.date === today).length
}

const getWeeklyProgress = () => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return props.progressRecords.filter(record => new Date(record.date) >= oneWeekAgo).length
}

const getAverageConfidence = () => {
  if (props.progressRecords.length === 0) return 0
  const total = props.progressRecords.reduce((sum, record) => sum + (record.confidence || 0), 0)
  return Math.round(total / props.progressRecords.length)
}

const getRecordTypeClass = (type) => {
  return `record-${type}`
}

const getTypeColor = (type) => {
  const colorMap = {
    'daily': 'blue',
    'weekly': 'green',
    'milestone': 'purple'
  }
  return colorMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    'daily': '日报',
    'weekly': '周报',
    'milestone': '里程碑'
  }
  return textMap[type] || type
}

const getMoodIcon = (mood) => {
  const iconMap = {
    'positive': SmileOutlined,
    'neutral': MehOutlined,
    'negative': FrownOutlined
  }
  return iconMap[mood] || MehOutlined
}

const getConfidenceStatus = (confidence) => {
  if (confidence >= 80) return 'success'
  if (confidence >= 60) return 'active'
  if (confidence >= 40) return 'normal'
  return 'exception'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.progress-description-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.stat-item {
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #e6f7ff;
  transform: translateY(-1px);
}

.stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

.quick-record {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.quick-record h4 {
  color: #234fa2;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  color: #234fa2;
  margin: 0;
  font-size: 14px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #e8e8e8;
  transition: all 0.3s;
}

.record-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

.record-item.record-daily {
  border-left-color: #1890ff;
}

.record-item.record-weekly {
  border-left-color: #52c41a;
}

.record-item.record-milestone {
  border-left-color: #722ed1;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.record-info {
  flex: 1;
}

.record-date {
  font-weight: 500;
  color: #234fa2;
  font-size: 16px;
  margin-bottom: 4px;
}

.record-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-confidence {
  display: flex;
  align-items: center;
  gap: 8px;
}

.confidence-label {
  color: #8c8c8c;
  font-size: 12px;
}

.record-content {
  margin-bottom: 12px;
}

.content-section {
  margin-bottom: 12px;
}

.content-section h5 {
  color: #234fa2;
  margin: 0 0 6px 0;
  font-size: 13px;
}

.accomplished-list,
.plans-list {
  margin: 0;
  padding-left: 16px;
  color: #666;
}

.accomplished-list li,
.plans-list li {
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.4;
}

.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.challenge-item {
  background: #fff7e6;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #faad14;
}

.challenge-issue {
  color: #234fa2;
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 2px;
}

.challenge-impact,
.challenge-status {
  color: #666;
  font-size: 12px;
  margin-bottom: 2px;
}

.time-distribution {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
}

.time-label {
  color: #8c8c8c;
  font-size: 12px;
}

.time-value {
  color: #234fa2;
  font-weight: 500;
  font-size: 12px;
}

.record-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  .progress-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .record-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .record-confidence {
    width: 100%;
    justify-content: flex-start;
  }
  
  .time-distribution {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>

