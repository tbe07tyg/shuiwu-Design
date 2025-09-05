<!--
 * @file 申报书解析组件
 * @description 显示申报书解析状态和结构化内容
-->
<template>
  <a-card class="proposal-analysis-card" title="📋 申报书解析">
    <template #extra>
      <a-button size="small" @click="handleReparse">
        <ReloadOutlined />
        重新解析
      </a-button>
    </template>

    <div class="analysis-content">
      <!-- 项目基本信息 -->
      <div class="project-info">
        <div class="info-row">
          <span class="label">项目名称：</span>
          <span class="value">{{ project.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">研究周期：</span>
          <span class="value">24个月</span>
        </div>
      </div>

      <!-- 研究内容展示 -->
      <div class="research-content">
        <h4>主要研究内容：</h4>
        <div class="content-list">
          <div 
            v-for="content in project.proposalContent?.researchContent || []" 
            :key="content.id"
            class="content-item"
            :class="getPriorityClass(content.priority)"
          >
            <div class="content-header">
              <span class="content-title">{{ content.title }}</span>
              <a-tag :color="getPriorityColor(content.priority)" size="small">
                {{ getPriorityText(content.priority) }}
              </a-tag>
            </div>
            <div class="content-desc">{{ content.description }}</div>
            <div class="content-output">
              <span class="output-label">预期产出：</span>
              <a-tag 
                v-for="output in content.expectedOutput" 
                :key="output"
                color="blue"
                size="small"
              >
                {{ output }}
              </a-tag>
            </div>
            <div class="content-duration">
              <ClockCircleOutlined />
              <span>{{ content.duration }}个月</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleTaskDecompose">
          <ThunderboltOutlined />
          智能分解任务
        </a-button>
        <a-button @click="handleViewProposal">
          <FileTextOutlined />
          查看完整申报书
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { 
  ReloadOutlined, 
  ClockCircleOutlined, 
  ThunderboltOutlined, 
  FileTextOutlined 
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['task-decompose', 'view-proposal'])

// 方法
const handleReparse = () => {
  message.info('正在重新解析申报书...')
  // 模拟重新解析
  setTimeout(() => {
    message.success('申报书解析完成')
  }, 2000)
}

const handleTaskDecompose = () => {
  emit('task-decompose')
}

const handleViewProposal = () => {
  emit('view-proposal')
}

// 工具方法
const getPriorityClass = (priority) => {
  return `priority-${priority}`
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
</script>

<style scoped>
.proposal-analysis-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #8c8c8c;
  min-width: 80px;
}

.value {
  color: #234fa2;
  font-weight: 500;
}

.research-content h4 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-item {
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #e8e8e8;
  background: #fafafa;
  transition: all 0.3s;
}

.content-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

.content-item.priority-high {
  border-left-color: #ff4d4f;
}

.content-item.priority-medium {
  border-left-color: #faad14;
}

.content-item.priority-low {
  border-left-color: #52c41a;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.content-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 14px;
}

.content-desc {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.content-output {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.output-label {
  color: #8c8c8c;
  font-size: 12px;
  min-width: 60px;
}

.content-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 12px;
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
  .action-buttons {
    flex-direction: column;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .content-output {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>

