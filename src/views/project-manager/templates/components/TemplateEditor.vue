<template>
  <div class="template-editor">
    <a-form :model="formData" layout="vertical">
      <!-- 基本信息 -->
      <div class="section">
        <h3>📋 基本信息</h3>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="模板名称" required>
              <a-input v-model:value="formData.name" placeholder="请输入模板名称" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="模板图标">
              <a-select v-model:value="formData.icon" style="width: 100%">
                <a-select-option value="📊">📊 标准</a-select-option>
                <a-select-option value="⚡">⚡ 敏捷</a-select-option>
                <a-select-option value="🏗️">🏗️ 瀑布</a-select-option>
                <a-select-option value="🔬">🔬 科研</a-select-option>
                <a-select-option value="🎯">🎯 目标</a-select-option>
                <a-select-option value="💼">💼 商务</a-select-option>
                <a-select-option value="🛠️">🛠️ 工程</a-select-option>
                <a-select-option value="📈">📈 分析</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="适用类别">
              <a-input v-model:value="formData.category" placeholder="如：软件开发、科研管理等" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="模板描述">
          <a-textarea v-model:value="formData.description" :rows="3" placeholder="描述此模板的适用场景和特点" />
        </a-form-item>
        
        <a-form-item label="标签">
          <a-select
            v-model:value="formData.tags"
            mode="tags"
            style="width: 100%"
            placeholder="添加标签，便于搜索和分类"
            :tokenSeparators="[',']"
          />
        </a-form-item>
      </div>

      <!-- 阶段管理 -->
      <div class="section">
        <div class="section-header">
          <h3>🔄 项目阶段</h3>
          <a-button type="primary" size="small" @click="addPhase">
            <PlusOutlined />
            添加阶段
          </a-button>
        </div>
        
        <div class="phases-list">
          <div v-for="(phase, phaseIndex) in formData.structure.phases" :key="phaseIndex" class="phase-item">
            <a-card size="small">
              <template #title>
                <a-input 
                  v-model:value="phase.name" 
                  placeholder="阶段名称"
                  style="border: none; background: transparent; font-weight: 600;"
                />
              </template>
              <template #extra>
                <a-space>
                  <a-input-number 
                    v-model:value="phase.duration" 
                    :min="1" 
                    addon-after="天"
                    size="small"
                  />
                  <a-button type="text" danger size="small" @click="removePhase(phaseIndex)">
                    <DeleteOutlined />
                  </a-button>
                </a-space>
              </template>
              
              <!-- 任务列表 -->
              <div class="tasks-section">
                <div class="tasks-header">
                  <span>任务列表</span>
                  <a-button type="link" size="small" @click="addTask(phaseIndex)">
                    <PlusOutlined />
                    添加任务
                  </a-button>
                </div>
                
                <div class="tasks-list">
                  <div v-for="(task, taskIndex) in phase.tasks" :key="taskIndex" class="task-item">
                    <a-input 
                      v-model:value="phase.tasks[taskIndex]" 
                      size="small"
                      placeholder="任务名称"
                    />
                    <a-button 
                      type="text" 
                      danger 
                      size="small" 
                      @click="removeTask(phaseIndex, taskIndex)"
                    >
                      <DeleteOutlined />
                    </a-button>
                  </div>
                </div>
              </div>
            </a-card>
          </div>
        </div>
      </div>

      <!-- 里程碑管理 -->
      <div class="section">
        <div class="section-header">
          <h3>🎯 里程碑节点</h3>
          <a-button type="primary" size="small" @click="addMilestone">
            <PlusOutlined />
            添加里程碑
          </a-button>
        </div>
        
        <div class="milestones-list">
          <div v-for="(milestone, index) in formData.structure.milestones" :key="index" class="milestone-item">
            <a-row :gutter="12" align="middle">
              <a-col :span="8">
                <a-input v-model:value="milestone.name" placeholder="里程碑名称" size="small" />
              </a-col>
              <a-col :span="8">
                <a-select v-model:value="milestone.phase" placeholder="关联阶段" size="small" style="width: 100%">
                  <a-select-option v-for="phase in formData.structure.phases" :key="phase.name" :value="phase.name">
                    {{ phase.name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-select v-model:value="milestone.type" placeholder="里程碑类型" size="small" style="width: 100%">
                  <a-select-option value="review">评审节点</a-select-option>
                  <a-select-option value="delivery">交付节点</a-select-option>
                  <a-select-option value="checkpoint">检查节点</a-select-option>
                  <a-select-option value="approval">审批节点</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="2">
                <a-button type="text" danger size="small" @click="removeMilestone(index)">
                  <DeleteOutlined />
                </a-button>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleSave">保存模板</a-button>
        </a-space>
      </div>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  template: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['save', 'cancel'])

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  icon: '📋',
  description: '',
  category: '',
  tags: [],
  isDefault: false,
  structure: {
    phases: [],
    milestones: []
  }
})

// 监听props变化
watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    Object.assign(formData, {
      ...newTemplate,
      structure: {
        phases: newTemplate.structure?.phases || [],
        milestones: newTemplate.structure?.milestones || []
      }
    })
  }
}, { immediate: true, deep: true })

// 阶段管理方法
const addPhase = () => {
  formData.structure.phases.push({
    name: '',
    tasks: [],
    duration: 10
  })
}

const removePhase = (index) => {
  formData.structure.phases.splice(index, 1)
}

const addTask = (phaseIndex) => {
  formData.structure.phases[phaseIndex].tasks.push('')
}

const removeTask = (phaseIndex, taskIndex) => {
  formData.structure.phases[phaseIndex].tasks.splice(taskIndex, 1)
}

// 里程碑管理方法
const addMilestone = () => {
  formData.structure.milestones.push({
    name: '',
    phase: '',
    type: 'checkpoint'
  })
}

const removeMilestone = (index) => {
  formData.structure.milestones.splice(index, 1)
}

// 操作方法
const handleSave = () => {
  if (!formData.name) {
    message.error('请输入模板名称')
    return
  }
  
  if (formData.structure.phases.length === 0) {
    message.error('至少添加一个项目阶段')
    return
  }
  
  // 计算统计数据
  const taskCount = formData.structure.phases.reduce((total, phase) => total + phase.tasks.length, 0)
  const milestoneCount = formData.structure.milestones.length
  
  const templateData = {
    ...formData,
    taskCount,
    milestoneCount
  }
  
  emit('save', templateData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.template-editor {
  max-height: 70vh;
  overflow-y: auto;
  padding: 16px;
}

.section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.section:last-child {
  border-bottom: none;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.phase-item {
  margin-bottom: 16px;
}

.tasks-section {
  margin-top: 12px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.milestone-item {
  margin-bottom: 12px;
}

.actions {
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>