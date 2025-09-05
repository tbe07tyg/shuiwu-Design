<!--
 * @file 第三步：智能任务拆解步骤组件
 * @description 根据技术路线智能拆解任务，支持分镜式分解，设定提报格式要求
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="task-decomposition-step">
    <!-- 步骤说明 -->
    <div class="step-description">
      <h3>第三步：智能任务拆解</h3>
      <p>根据技术路线智能拆解任务，支持任务的二次分解（分镜拆解方式），设定任务完成计划和截止时间，配置提报格式要求。</p>
    </div>

    <!-- 拆解操作区 -->
    <a-card title="任务拆解操作" class="decompose-actions-card" :bordered="false">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-button type="primary" size="large" block @click="handleIntelligentDecompose" :loading="decomposing">
            <ThunderboltOutlined />
            {{ decomposing ? '智能拆解中...' : '智能拆解' }}
          </a-button>
        </a-col>
        <a-col :span="8">
          <a-button size="large" block @click="handleManualAddTask">
            <PlusOutlined />
            手动添加任务
          </a-button>
        </a-col>
        <a-col :span="8">
          <a-button size="large" block @click="handleBatchSetDeadline">
            <CalendarOutlined />
            批量设置截止时间
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 任务拆解结果 -->
    <a-card title="基于技术路线的任务拆解" class="task-tree-card" :bordered="false">
      <template #extra>
        <a-space>
          <a-switch v-model:checked="showDeadlines" checked-children="显示截止时间" un-checked-children="隐藏截止时间" />
          <a-switch v-model:checked="showRequirements" checked-children="显示提报要求" un-checked-children="隐藏提报要求" />
        </a-space>
      </template>

      <div v-if="decompositionData.phases && decompositionData.phases.length > 0" class="task-tree">
        <div 
          v-for="phase in decompositionData.phases" 
          :key="phase.id"
          class="phase-section"
        >
          <div class="phase-header">
            <h4>{{ phase.name }}</h4>
            <a-button type="text" size="small" @click="handleAddTaskToPhase(phase.id)">
              <PlusOutlined />
              添加任务
            </a-button>
          </div>

          <div class="tasks-container">
            <div 
              v-for="task in phase.tasks" 
              :key="task.id"
              class="task-item"
              :class="{ 'has-subtasks': task.subTasks && task.subTasks.length > 0 }"
            >
              <!-- 主任务 -->
              <div class="task-main">
                <div class="task-info">
                  <div class="task-title">
                    <span class="task-level-indicator" :class="`level-${task.level}`"></span>
                    <span class="task-name">{{ task.title }}</span>
                    <a-tag v-if="showDeadlines && getTaskDeadline(task)" size="small" color="orange">
                      {{ getTaskDeadline(task) }}
                    </a-tag>
                  </div>
                  <div v-if="showRequirements && task.submissionRequirements" class="task-requirements">
                    <a-tag size="small" color="blue">
                      {{ task.submissionRequirements.format }}
                    </a-tag>
                    <a-tag v-if="task.submissionRequirements.needAttachment" size="small" color="green">
                      需要附件
                    </a-tag>
                  </div>
                </div>
                <div class="task-actions">
                  <a-button type="text" size="small" @click="handleEditTask(task)">
                    <EditOutlined />
                  </a-button>
                  <a-button type="text" size="small" @click="handleDecomposeTask(task.id)">
                    <BranchesOutlined />
                    分解
                  </a-button>
                  <a-button type="text" size="small" danger @click="handleDeleteTask(task.id)">
                    <DeleteOutlined />
                  </a-button>
                </div>
              </div>

              <!-- 子任务 -->
              <div v-if="task.subTasks && task.subTasks.length > 0" class="subtasks-container">
                <div 
                  v-for="subTask in task.subTasks" 
                  :key="subTask.id"
                  class="subtask-item"
                >
                  <div class="subtask-info">
                    <div class="subtask-title">
                      <span class="subtask-level-indicator" :class="`level-${subTask.level}`"></span>
                      <span class="subtask-name">{{ subTask.title }}</span>
                      <a-tag v-if="showDeadlines && subTask.deadline" size="small" color="orange">
                        {{ subTask.deadline }}
                      </a-tag>
                      <a-tag v-if="subTask.estimatedHours" size="small" color="purple">
                        {{ subTask.estimatedHours }}h
                      </a-tag>
                    </div>
                    <div v-if="showRequirements && subTask.submissionRequirements" class="subtask-requirements">
                      <a-tag size="small" color="blue">
                        {{ subTask.submissionRequirements.format }}
                      </a-tag>
                      <a-tag v-if="subTask.submissionRequirements.needAttachment" size="small" color="green">
                        需要附件
                      </a-tag>
                    </div>
                  </div>
                  <div class="subtask-actions">
                    <a-button type="text" size="small" @click="handleEditSubTask(subTask)">
                      <EditOutlined />
                    </a-button>
                    <a-button type="text" size="small" @click="handleDecomposeTask(subTask.id)">
                      <BranchesOutlined />
                    </a-button>
                    <a-button type="text" size="small" danger @click="handleDeleteTask(subTask.id)">
                      <DeleteOutlined />
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-tasks">
        <a-empty description="暂无任务拆解数据">
          <a-button type="primary" @click="handleIntelligentDecompose">
            开始智能拆解
          </a-button>
        </a-empty>
      </div>
    </a-card>

    <!-- 拆解统计 -->
    <a-card title="拆解统计" class="stats-card" :bordered="false">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-statistic 
            title="总任务数" 
            :value="decompositionStats.totalTasks"
            :value-style="{ color: '#234fa2' }"
          >
            <template #suffix>个</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic 
            title="子任务数" 
            :value="decompositionStats.totalSubTasks"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>个</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic 
            title="预计总工时" 
            :value="decompositionStats.totalHours"
            :value-style="{ color: '#faad14' }"
          >
            <template #suffix>小时</template>
          </a-statistic>
        </a-col>

      </a-row>
    </a-card>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <a-space>
        <a-button size="large" @click="handleSaveDecomposition">
          <SaveOutlined />
          保存拆解结果
        </a-button>
        <a-button type="primary" size="large" @click="handleNextStep">
          下一步：任务分配
          <ArrowRightOutlined />
        </a-button>
      </a-space>
    </div>

    <!-- 任务编辑弹窗 -->
    <a-modal
      v-model:open="taskModalVisible"
      :title="editingTask ? '编辑任务' : '添加任务'"
      width="800px"
      @ok="handleTaskModalOk"
      @cancel="handleTaskModalCancel"
    >
      <a-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskFormRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="任务标题" name="title">
              <a-input v-model:value="taskForm.title" placeholder="请输入任务标题" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="任务层级" name="level">
              <a-select v-model:value="taskForm.level">
                <a-select-option :value="1">一级任务</a-select-option>
                <a-select-option :value="2">二级任务</a-select-option>
                <a-select-option :value="3">三级任务</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="任务描述" name="description">
          <a-textarea 
            v-model:value="taskForm.description" 
            placeholder="请描述任务的具体内容和要求"
            :rows="3"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="截止时间" name="deadline">
              <a-date-picker 
                v-model:value="taskForm.deadline" 
                style="width: 100%"
                placeholder="选择截止时间"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="预计工时" name="estimatedHours">
              <a-input-number 
                v-model:value="taskForm.estimatedHours" 
                :min="1" 
                :max="200"
                style="width: 100%"
                placeholder="小时"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="优先级" name="priority">
              <a-select v-model:value="taskForm.priority">
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider>提报格式要求</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="提报格式" name="submissionFormat">
              <a-input 
                v-model:value="taskForm.submissionFormat" 
                placeholder="如：调研报告+数据分析"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否需要附件" name="needAttachment">
              <a-switch v-model:checked="taskForm.needAttachment" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="提报模板配置" name="templateSections">
          <div class="template-sections">
            <div 
              v-for="(section, index) in taskForm.templateSections" 
              :key="index"
              class="template-section"
            >
              <a-row :gutter="8" align="middle">
                <a-col :span="8">
                  <a-input 
                    v-model:value="section.title" 
                    placeholder="标题"
                  />
                </a-col>
                <a-col :span="6">
                  <a-select v-model:value="section.type">
                    <a-select-option value="richtext">富文本</a-select-option>
                    <a-select-option value="attachment">附件</a-select-option>
                    <a-select-option value="text">纯文本</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="6">
                  <a-switch 
                    v-model:checked="section.required" 
                    checked-children="必填" 
                    un-checked-children="选填"
                  />
                </a-col>
                <a-col :span="4">
                  <a-button 
                    type="text" 
                    danger 
                    size="small" 
                    @click="removeTemplateSection(index)"
                  >
                    <DeleteOutlined />
                  </a-button>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" block @click="addTemplateSection">
              <PlusOutlined />
              添加模板字段
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  ThunderboltOutlined,
  PlusOutlined,
  CalendarOutlined,
  EditOutlined,
  BranchesOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'

// Props
const props = defineProps({
  decompositionData: {
    type: Object,
    default: () => ({
      phases: []
    })
  }
})

// Emits
const emit = defineEmits([
  'intelligent-decompose',
  'manual-add-task',
  'edit-task',
  'decompose-task',
  'set-deadline',
  'save-decomposition'
])

// 响应式数据
const decomposing = ref(false)
const showDeadlines = ref(true)
const showRequirements = ref(true)
const taskModalVisible = ref(false)
const editingTask = ref(null)
const taskFormRef = ref()

// 任务表单数据
const taskForm = reactive({
  title: '',
  description: '',
  level: 1,
  deadline: null,
  estimatedHours: 16,
  priority: 'medium',
  submissionFormat: '',
  needAttachment: false,
  templateSections: [
    {
      title: '工作内容',
      type: 'richtext',
      required: true
    }
  ]
})

// 表单验证规则
const taskFormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' }
  ],
  submissionFormat: [
    { required: true, message: '请输入提报格式', trigger: 'blur' }
  ]
}

// 计算属性
const decompositionStats = computed(() => {
  const phases = props.decompositionData.phases || []
  let totalTasks = 0
  let totalSubTasks = 0
  let totalHours = 0
  let complexitySum = 0

  phases.forEach(phase => {
    if (phase.tasks) {
      totalTasks += phase.tasks.length
      phase.tasks.forEach(task => {
        if (task.subTasks) {
          totalSubTasks += task.subTasks.length
          task.subTasks.forEach(subTask => {
            totalHours += subTask.estimatedHours || 0
          })
        }
        complexitySum += task.level || 1
      })
    }
  })

  const averageComplexity = totalTasks > 0 ? Math.round(complexitySum / totalTasks * 10) / 10 : 0

  return {
    totalTasks,
    totalSubTasks,
    totalHours,
    averageComplexity
  }
})

// 方法定义
const getTaskDeadline = (task) => {
  if (task.subTasks && task.subTasks.length > 0) {
    // 返回最早的子任务截止时间
    const deadlines = task.subTasks
      .map(sub => sub.deadline)
      .filter(Boolean)
      .sort()
    return deadlines[0] || null
  }
  return task.deadline || null
}

const handleIntelligentDecompose = async () => {
  decomposing.value = true
  
  try {
    // 模拟智能拆解过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    message.success('智能任务拆解完成')
    emit('intelligent-decompose')
  } catch (error) {
    message.error('智能拆解失败')
  } finally {
    decomposing.value = false
  }
}

const handleManualAddTask = () => {
  editingTask.value = null
  resetTaskForm()
  taskModalVisible.value = true
}

const handleAddTaskToPhase = (phaseId) => {
  console.log('添加任务到阶段:', phaseId)
  handleManualAddTask()
}

const handleEditTask = (task) => {
  editingTask.value = task
  taskForm.title = task.title
  taskForm.description = task.description || ''
  taskForm.level = task.level || 1
  taskForm.deadline = task.deadline ? dayjs(task.deadline) : null
  taskForm.estimatedHours = task.estimatedHours || 16
  taskForm.priority = task.priority || 'medium'
  taskForm.submissionFormat = task.submissionRequirements?.format || ''
  taskForm.needAttachment = task.submissionRequirements?.needAttachment || false
  taskForm.templateSections = task.submissionRequirements?.template?.sections || [
    { title: '工作内容', type: 'richtext', required: true }
  ]
  taskModalVisible.value = true
}

const handleEditSubTask = (subTask) => {
  handleEditTask(subTask)
}

const handleDecomposeTask = (taskId) => {
  console.log('分解任务:', taskId)
  emit('decompose-task', taskId)
  message.info('任务分解功能开发中')
}

const handleDeleteTask = (taskId) => {
  console.log('删除任务:', taskId)
  message.success('任务已删除')
}

const handleBatchSetDeadline = () => {
  message.info('批量设置截止时间功能开发中')
}

const handleSaveDecomposition = () => {
  const decompositionData = {
    ...props.decompositionData,
    lastModified: new Date().toISOString()
  }
  emit('save-decomposition', decompositionData)
}

const handleNextStep = () => {
  handleSaveDecomposition()
  message.success('任务拆解结果已保存，进入下一步')
}

const resetTaskForm = () => {
  taskForm.title = ''
  taskForm.description = ''
  taskForm.level = 1
  taskForm.deadline = null
  taskForm.estimatedHours = 16
  taskForm.priority = 'medium'
  taskForm.submissionFormat = ''
  taskForm.needAttachment = false
  taskForm.templateSections = [
    { title: '工作内容', type: 'richtext', required: true }
  ]
}

const addTemplateSection = () => {
  taskForm.templateSections.push({
    title: '',
    type: 'richtext',
    required: false
  })
}

const removeTemplateSection = (index) => {
  if (taskForm.templateSections.length > 1) {
    taskForm.templateSections.splice(index, 1)
  } else {
    message.warning('至少需要保留一个模板字段')
  }
}

const handleTaskModalOk = async () => {
  try {
    await taskFormRef.value.validate()
    
    const taskData = {
      id: editingTask.value?.id || `T${Date.now()}`,
      title: taskForm.title,
      description: taskForm.description,
      level: taskForm.level,
      deadline: taskForm.deadline ? taskForm.deadline.format('YYYY-MM-DD') : null,
      estimatedHours: taskForm.estimatedHours,
      priority: taskForm.priority,
      submissionRequirements: {
        format: taskForm.submissionFormat,
        needAttachment: taskForm.needAttachment,
        template: {
          sections: taskForm.templateSections.filter(section => section.title)
        }
      }
    }

    if (editingTask.value) {
      emit('edit-task', taskData)
      message.success('任务已更新')
    } else {
      emit('manual-add-task', taskData)
      message.success('任务添加成功')
    }

    taskModalVisible.value = false
    resetTaskForm()
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const handleTaskModalCancel = () => {
  taskModalVisible.value = false
  resetTaskForm()
}
</script>

<style scoped>
.task-decomposition-step {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-description {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  border: 1px solid #d6e4ff;
}

.step-description h3 {
  color: #234fa2;
  font-size: 20px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.step-description p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.decompose-actions-card,
.task-tree-card,
.stats-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.task-tree {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.phase-section {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  overflow: hidden;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e6eaf2;
}

.phase-header h4 {
  margin: 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.tasks-container {
  padding: 16px;
}

.task-item {
  border: 1px solid #e6eaf2;
  border-radius: 6px;
  margin-bottom: 16px;
  background: #fff;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-item.has-subtasks {
  border-left: 3px solid #234fa2;
}

.task-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.task-info {
  flex: 1;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.task-level-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-level-indicator.level-1 {
  background: #234fa2;
}

.task-level-indicator.level-2 {
  background: #52c41a;
}

.task-level-indicator.level-3 {
  background: #faad14;
}

.task-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.task-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.subtasks-container {
  padding: 0 16px 16px 16px;
  background: #fafbfc;
}

.subtask-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e6eaf2;
  border-radius: 4px;
  background: #fff;
}

.subtask-item:last-child {
  margin-bottom: 0;
}

.subtask-info {
  flex: 1;
}

.subtask-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.subtask-level-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.subtask-level-indicator.level-2 {
  background: #52c41a;
}

.subtask-level-indicator.level-3 {
  background: #faad14;
}

.subtask-name {
  font-size: 13px;
  color: #333;
}

.subtask-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.subtask-actions {
  display: flex;
  gap: 4px;
}

.empty-tasks {
  text-align: center;
  padding: 40px;
}

.template-sections {
  border: 1px solid #e6eaf2;
  border-radius: 6px;
  padding: 16px;
  background: #fafbfc;
}

.template-section {
  margin-bottom: 12px;
}

.template-section:last-child {
  margin-bottom: 0;
}

.step-actions {
  display: flex;
  justify-content: center;
  padding: 24px;
  border-top: 1px solid #e6eaf2;
  background: #fafbfc;
  border-radius: 0 0 12px 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-main,
  .subtask-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .task-actions,
  .subtask-actions {
    align-self: flex-start;
  }

  .step-actions {
    padding: 16px;
  }

  .step-actions :deep(.ant-space) {
    width: 100%;
    justify-content: center;
  }

  .step-actions :deep(.ant-btn) {
    flex: 1;
  }
}
</style>
