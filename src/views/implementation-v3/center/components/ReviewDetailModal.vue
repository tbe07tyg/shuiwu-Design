<!--
 * @file 审查详情弹窗组件
 * @description 内容审查的详细界面
-->
<template>
  <a-modal
    :open="visible"
    title="内容审查"
    width="900px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="review-detail-content">
      <!-- 提交内容信息 -->
      <div class="submission-info">
        <div class="info-header">
          <h4>{{ reviewItem?.title }}</h4>
          <div class="info-meta">
            <a-tag :color="getTypeColor(reviewItem?.type)" size="small">
              {{ getTypeText(reviewItem?.type) }}
            </a-tag>
            <a-tag :color="getPriorityColor(reviewItem?.priority)" size="small">
              {{ getPriorityText(reviewItem?.priority) }}
            </a-tag>
          </div>
        </div>
        
        <div class="submission-details">
          <div class="detail-row">
            <span class="label">提交人：</span>
            <span class="value">{{ reviewItem?.submittedBy }}</span>
          </div>
          <div class="detail-row">
            <span class="label">提交时间：</span>
            <span class="value">{{ formatTime(reviewItem?.submitTime) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">关联任务：</span>
            <span class="value">{{ getTaskTitle(reviewItem?.taskId) }}</span>
          </div>
        </div>
      </div>

      <!-- 内容预览 -->
      <div class="content-preview">
        <h4>内容预览</h4>
        <div class="preview-container">
          <!-- 模拟文档预览 -->
          <div class="document-preview">
            <div class="preview-header">
              <FileTextOutlined />
              <span>{{ reviewItem?.title }}</span>
              <a-button size="small" type="text" @click="handleDownload">
                <DownloadOutlined />
                下载
              </a-button>
            </div>
            <div class="preview-content">
              <div class="content-section">
                <h5>1. 项目概述</h5>
                <p>本项目旨在开发一套完整的科研管理系统，通过智能化的项目管理流程，提升科研项目的执行效率和成果质量。系统采用现代化的技术架构，支持多角色协作和实时数据同步。</p>
              </div>
              <div class="content-section">
                <h5>2. 技术方案</h5>
                <p>系统采用前后端分离的架构设计，前端使用Vue 3 + Ant Design Vue，后端使用Spring Boot + MySQL。通过RESTful API进行数据交互，支持高并发访问和数据安全。</p>
              </div>
              <div class="content-section">
                <h5>3. 创新点</h5>
                <ul>
                  <li>基于申报书内容的智能任务分解算法</li>
                  <li>实时协作的项目监控机制</li>
                  <li>多维度的成果质量评估体系</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 质量评估 -->
      <div class="quality-assessment">
        <h4>质量评估</h4>
        <div class="assessment-form">
          <div class="assessment-item">
            <label>内容完整度：</label>
            <a-rate v-model:value="assessment.completeness" :count="5" />
            <span class="rate-text">{{ getRateText(assessment.completeness) }}</span>
          </div>
          <div class="assessment-item">
            <label>技术准确性：</label>
            <a-rate v-model:value="assessment.accuracy" :count="5" />
            <span class="rate-text">{{ getRateText(assessment.accuracy) }}</span>
          </div>
          <div class="assessment-item">
            <label>创新水平：</label>
            <a-rate v-model:value="assessment.innovation" :count="5" />
            <span class="rate-text">{{ getRateText(assessment.innovation) }}</span>
          </div>
          <div class="assessment-item">
            <label>实用价值：</label>
            <a-rate v-model:value="assessment.practicality" :count="5" />
            <span class="rate-text">{{ getRateText(assessment.practicality) }}</span>
          </div>
        </div>
        
        <div class="overall-rating">
          <label>综合评价：</label>
          <a-select v-model:value="overallRating" style="width: 120px">
            <a-select-option value="excellent">优秀</a-select-option>
            <a-select-option value="good">良好</a-select-option>
            <a-select-option value="fair">一般</a-select-option>
            <a-select-option value="poor">较差</a-select-option>
          </a-select>
        </div>
      </div>

      <!-- 审查意见 -->
      <div class="review-comments">
        <h4>审查意见</h4>
        <a-textarea
          v-model:value="reviewComments"
          placeholder="请输入详细的审查意见和建议..."
          :rows="4"
          show-count
          :maxlength="500"
        />
      </div>

      <!-- 改进建议 -->
      <div class="improvement-suggestions">
        <h4>改进建议</h4>
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="suggestion-item"
          >
            <a-input 
              v-model:value="suggestion.text" 
              placeholder="输入具体的改进建议"
            />
            <a-button 
              size="small" 
              type="text" 
              danger 
              @click="removeSuggestion(index)"
            >
              <DeleteOutlined />
            </a-button>
          </div>
          <a-button 
            type="dashed" 
            @click="addSuggestion"
            style="width: 100%"
          >
            <PlusOutlined />
            添加建议
          </a-button>
        </div>
      </div>

      <!-- 后续行动 -->
      <div class="next-actions">
        <h4>后续行动</h4>
        <a-radio-group v-model:value="nextAction">
          <a-radio value="approve">直接通过</a-radio>
          <a-radio value="revision">需要修改</a-radio>
          <a-radio value="reject">拒绝通过</a-radio>
          <a-radio value="discuss">需要讨论</a-radio>
        </a-radio-group>
        
        <div v-if="nextAction === 'revision'" class="revision-deadline">
          <label>修改截止时间：</label>
          <a-date-picker v-model:value="revisionDeadline" />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <a-space>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button @click="handleSaveDraft">
            <SaveOutlined />
            保存草稿
          </a-button>
          <a-button type="primary" @click="handleSubmitReview">
            <CheckOutlined />
            提交审查
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { 
  FileTextOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  reviewItem: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'review-complete'])

// 响应式数据
const assessment = reactive({
  completeness: 4,
  accuracy: 4,
  innovation: 3,
  practicality: 4
})

const overallRating = ref('good')
const reviewComments = ref('')
const suggestions = ref([
  { text: '建议在技术方案中增加安全性考虑' },
  { text: '可以进一步完善性能优化策略' }
])
const nextAction = ref('approve')
const revisionDeadline = ref(null)

// 方法
const handleCancel = () => {
  emit('update:visible', false)
}

const handleDownload = () => {
  message.success('文件下载开始')
}

const handleSaveDraft = () => {
  message.success('审查草稿已保存')
}

const handleSubmitReview = () => {
  const reviewResult = {
    reviewItem: props.reviewItem,
    assessment: assessment,
    overallRating: overallRating.value,
    comments: reviewComments.value,
    suggestions: suggestions.value.filter(s => s.text.trim()),
    nextAction: nextAction.value,
    revisionDeadline: revisionDeadline.value,
    reviewTime: new Date().toISOString()
  }
  
  emit('review-complete', reviewResult)
  message.success('审查结果已提交')
}

const addSuggestion = () => {
  suggestions.value.push({ text: '' })
}

const removeSuggestion = (index) => {
  suggestions.value.splice(index, 1)
}

// 工具方法
const getTypeColor = (type) => {
  const colorMap = {
    'document': 'blue',
    'report': 'green',
    'test_result': 'purple',
    'code': 'orange'
  }
  return colorMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    'document': '文档',
    'report': '报告',
    'test_result': '测试结果',
    'code': '代码'
  }
  return textMap[type] || type
}

const getPriorityColor = (priority) => {
  const colorMap = {
    'high': 'red',
    'medium': 'orange',
    'low': 'blue'
  }
  return colorMap[priority] || 'default'
}

const getPriorityText = (priority) => {
  const textMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return textMap[priority] || priority
}

const getTaskTitle = (taskId) => {
  const taskMap = {
    'T001': '系统架构设计',
    'T003': '前端界面开发',
    'T004': '接口联调测试'
  }
  return taskMap[taskId] || '未知任务'
}

const getRateText = (rate) => {
  const textMap = {
    1: '较差',
    2: '一般',
    3: '良好',
    4: '优秀',
    5: '卓越'
  }
  return textMap[rate] || ''
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 监听审查项变化，重置表单
watch(() => props.reviewItem, (newItem) => {
  if (newItem) {
    // 重置表单数据
    assessment.completeness = 4
    assessment.accuracy = 4
    assessment.innovation = 3
    assessment.practicality = 4
    overallRating.value = 'good'
    reviewComments.value = ''
    nextAction.value = 'approve'
    revisionDeadline.value = null
  }
})
</script>

<style scoped>
.review-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 700px;
  overflow-y: auto;
}

.review-detail-content h4 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.submission-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-header h4 {
  margin: 0;
  color: #234fa2;
  font-size: 18px;
}

.info-meta {
  display: flex;
  gap: 8px;
}

.submission-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row .label {
  color: #8c8c8c;
  min-width: 80px;
  font-size: 14px;
}

.detail-row .value {
  color: #234fa2;
  font-weight: 500;
  font-size: 14px;
}

.content-preview {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.preview-container {
  max-height: 300px;
  overflow-y: auto;
}

.document-preview {
  background: #fff;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
}

.preview-header span {
  flex: 1;
  font-weight: 500;
  color: #234fa2;
}

.preview-content {
  padding: 16px;
}

.content-section {
  margin-bottom: 20px;
}

.content-section h5 {
  color: #234fa2;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.content-section p {
  color: #666;
  line-height: 1.6;
  margin: 0 0 8px 0;
}

.content-section ul {
  color: #666;
  margin: 0;
  padding-left: 20px;
}

.quality-assessment {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.assessment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.assessment-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assessment-item label {
  min-width: 100px;
  color: #234fa2;
  font-weight: 500;
}

.rate-text {
  color: #8c8c8c;
  font-size: 12px;
  min-width: 40px;
}

.overall-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overall-rating label {
  color: #234fa2;
  font-weight: 500;
}

.review-comments {
  border: 1px solid #e8e8e8;
  padding: 16px;
  border-radius: 8px;
}

.improvement-suggestions {
  border: 1px solid #e8e8e8;
  padding: 16px;
  border-radius: 8px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.next-actions {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.revision-deadline {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.revision-deadline label {
  color: #234fa2;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

/* 响应式 */
@media (max-width: 768px) {
  .info-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .assessment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .assessment-item label {
    min-width: auto;
  }
  
  .overall-rating,
  .revision-deadline {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .suggestion-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
