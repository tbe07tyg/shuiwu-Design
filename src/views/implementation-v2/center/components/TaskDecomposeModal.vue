<!--
 * @file 任务分解弹窗组件
 * @description 基于申报书内容的智能任务分解
-->
<template>
  <a-modal
    :open="visible"
    title="智能任务分解"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="task-decompose-content">
      <!-- 申报书内容概览 -->
      <div class="proposal-overview">
        <h4>申报书内容概览</h4>
        <div class="content-summary">
          <div class="summary-item">
            <span class="label">研究内容：</span>
            <span class="value">{{ proposalContent?.researchContent?.length || 0 }}个模块</span>
          </div>
          <div class="summary-item">
            <span class="label">技术路线：</span>
            <span class="value">4个阶段</span>
          </div>
          <div class="summary-item">
            <span class="label">预期成果：</span>
            <span class="value">8项成果</span>
          </div>
        </div>
      </div>

      <!-- 分解策略选择 -->
      <div class="decompose-strategy">
        <h4>分解策略</h4>
        <a-radio-group v-model:value="selectedStrategy" @change="handleStrategyChange">
          <a-radio value="by_content">按研究内容分解</a-radio>
          <a-radio value="by_phase">按技术路线分解</a-radio>
          <a-radio value="by_deliverable">按预期成果分解</a-radio>
          <a-radio value="hybrid">混合分解</a-radio>
        </a-radio-group>
      </div>

      <!-- 分解结果预览 -->
      <div class="decompose-result">
        <div class="result-header">
          <h4>分解结果预览</h4>
          <div class="result-stats">
            <a-tag color="blue">{{ decomposedTasks.length }}个任务</a-tag>
            <a-tag color="green">{{ getHighPriorityCount() }}个高优先级</a-tag>
          </div>
        </div>

        <div class="tasks-preview">
          <div 
            v-for="(task, index) in decomposedTasks" 
            :key="index"
            class="task-preview-item"
            :class="getPriorityClass(task.priority)"
          >
            <div class="task-header">
              <div class="task-info">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-source">
                  来源：{{ task.sourceName }}
                </div>
              </div>
              <div class="task-meta">
                <a-tag :color="getPriorityColor(task.priority)" size="small">
                  {{ getPriorityText(task.priority) }}
                </a-tag>
                <span class="task-duration">{{ task.estimatedDuration }}个月</span>
              </div>
            </div>

            <div class="task-description">
              {{ task.description }}
            </div>

            <div class="task-deliverables">
              <span class="deliverables-label">预期产出：</span>
              <div class="deliverables-tags">
                <a-tag 
                  v-for="deliverable in task.expectedDeliverables" 
                  :key="deliverable"
                  color="blue"
                  size="small"
                >
                  {{ deliverable }}
                </a-tag>
              </div>
            </div>

            <div class="task-actions">
              <a-button size="small" type="text" @click="handleEditTask(task, index)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button size="small" type="text" @click="handleRemoveTask(index)">
                <DeleteOutlined />
                移除
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分解参数调整 -->
      <div class="decompose-params">
        <h4>分解参数</h4>
        <div class="params-grid">
          <div class="param-item">
            <label>任务粒度：</label>
            <a-slider 
              v-model:value="taskGranularity" 
              :min="1" 
              :max="5" 
              :marks="granularityMarks"
              @change="handleParamChange"
            />
          </div>
          <div class="param-item">
            <label>优先级权重：</label>
            <a-slider 
              v-model:value="priorityWeight" 
              :min="0" 
              :max="100" 
              :step="10"
              @change="handleParamChange"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <a-space>
          <a-button @click="handleRegenerate">
            <ReloadOutlined />
            重新生成
          </a-button>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button type="primary" @click="handleConfirm">
            <CheckOutlined />
            确认分解
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  CheckOutlined 
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  proposalContent: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'confirm'])

// 响应式数据
const selectedStrategy = ref('by_content')
const taskGranularity = ref(3)
const priorityWeight = ref(70)

// 粒度标记
const granularityMarks = {
  1: '粗粒度',
  3: '中等',
  5: '细粒度'
}

// 模拟分解后的任务
const decomposedTasks = ref([
  {
    title: '用户需求调研分析',
    description: '深入调研用户需求，分析业务场景，形成需求规格说明',
    sourceName: '需求分析与系统设计',
    sourceType: 'research_content',
    sourceId: 'RC001',
    priority: 'high',
    estimatedDuration: 1.5,
    expectedDeliverables: ['需求调研报告', '用户画像分析', '业务流程图']
  },
  {
    title: '系统架构设计',
    description: '设计系统整体架构，确定技术选型和实现方案',
    sourceName: '需求分析与系统设计',
    sourceType: 'research_content',
    sourceId: 'RC001',
    priority: 'high',
    estimatedDuration: 2,
    expectedDeliverables: ['架构设计文档', '技术选型报告', '接口规范']
  },
  {
    title: '核心算法原型开发',
    description: '开发核心算法原型，验证技术可行性',
    sourceName: '核心算法研发',
    sourceType: 'research_content',
    sourceId: 'RC002',
    priority: 'high',
    estimatedDuration: 3,
    expectedDeliverables: ['算法原型', '性能测试报告', '优化建议']
  },
  {
    title: '数据库设计与实现',
    description: '设计数据库结构，实现数据存储和访问层',
    sourceName: '系统集成与测试',
    sourceType: 'research_content',
    sourceId: 'RC003',
    priority: 'medium',
    estimatedDuration: 1,
    expectedDeliverables: ['数据库设计文档', '数据访问层代码', '性能优化方案']
  },
  {
    title: '用户界面设计与开发',
    description: '设计用户界面，开发前端交互功能',
    sourceName: '系统集成与测试',
    sourceType: 'research_content',
    sourceId: 'RC003',
    priority: 'medium',
    estimatedDuration: 2,
    expectedDeliverables: ['UI设计稿', '前端代码', '交互原型']
  }
])

// 计算属性
const getHighPriorityCount = () => {
  return decomposedTasks.value.filter(task => task.priority === 'high').length
}

// 方法
const handleCancel = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm', decomposedTasks.value)
  message.success(`成功分解 ${decomposedTasks.value.length} 个任务`)
}

const handleStrategyChange = () => {
  // 根据策略重新生成任务
  generateTasks()
}

const handleParamChange = () => {
  // 参数变化时重新生成任务
  generateTasks()
}

const handleRegenerate = () => {
  generateTasks()
  message.success('任务重新生成完成')
}

const handleEditTask = (task, index) => {
  message.info(`编辑任务：${task.title}`)
  // 实际项目中这里会打开任务编辑对话框
}

const handleRemoveTask = (index) => {
  decomposedTasks.value.splice(index, 1)
  message.success('任务已移除')
}

const generateTasks = () => {
  // 模拟根据不同策略和参数生成任务
  console.log('生成任务:', {
    strategy: selectedStrategy.value,
    granularity: taskGranularity.value,
    priorityWeight: priorityWeight.value
  })
  
  // 实际项目中这里会调用AI算法生成任务
  // 这里只是简单模拟
  if (selectedStrategy.value === 'by_phase') {
    // 按阶段分解的任务会不同
    message.info('按技术路线重新分解任务')
  } else if (selectedStrategy.value === 'by_deliverable') {
    // 按成果分解的任务会不同
    message.info('按预期成果重新分解任务')
  }
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

// 监听属性变化
watch(() => props.proposalContent, (newContent) => {
  if (newContent) {
    generateTasks()
  }
})
</script>

<style scoped>
.task-decompose-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.task-decompose-content h4 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.proposal-overview {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.content-summary {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item .label {
  color: #8c8c8c;
  font-size: 14px;
}

.summary-item .value {
  color: #234fa2;
  font-weight: 500;
  font-size: 14px;
}

.decompose-strategy {
  border: 1px solid #e8e8e8;
  padding: 16px;
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-stats {
  display: flex;
  gap: 8px;
}

.tasks-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.task-preview-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #e8e8e8;
  transition: all 0.3s;
}

.task-preview-item:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

.task-preview-item.priority-high {
  border-left-color: #ff4d4f;
}

.task-preview-item.priority-medium {
  border-left-color: #faad14;
}

.task-preview-item.priority-low {
  border-left-color: #52c41a;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-info {
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 16px;
  margin-bottom: 4px;
}

.task-source {
  color: #8c8c8c;
  font-size: 12px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-duration {
  color: #8c8c8c;
  font-size: 12px;
}

.task-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.task-deliverables {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.deliverables-label {
  color: #8c8c8c;
  font-size: 12px;
  min-width: 60px;
  margin-top: 2px;
}

.deliverables-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.decompose-params {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.params-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item label {
  color: #234fa2;
  font-weight: 500;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

/* 响应式 */
@media (max-width: 768px) {
  .content-summary {
    flex-direction: column;
    gap: 8px;
  }
  
  .result-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .task-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .task-deliverables {
    flex-direction: column;
    gap: 4px;
  }
  
  .deliverables-label {
    min-width: auto;
  }
}
</style>
