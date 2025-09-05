<!--
 * @file 进展记录弹窗组件
 * @description 记录详细的工作进展
-->
<template>
  <a-modal
    :open="visible"
    title="记录工作进展"
    width="700px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="progress-record-content">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="记录类型" name="type">
              <a-select v-model:value="form.type">
                <a-select-option value="daily">日报</a-select-option>
                <a-select-option value="weekly">周报</a-select-option>
                <a-select-option value="milestone">里程碑</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="工作心情" name="mood">
              <a-select v-model:value="form.mood">
                <a-select-option value="positive">😊 积极</a-select-option>
                <a-select-option value="neutral">😐 一般</a-select-option>
                <a-select-option value="negative">😔 低落</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="完成事项" name="accomplished">
          <div class="dynamic-list">
            <div 
              v-for="(item, index) in form.accomplished" 
              :key="index"
              class="list-item"
            >
              <a-input 
                v-model:value="form.accomplished[index]" 
                placeholder="描述完成的工作"
              />
              <a-button 
                type="text" 
                danger 
                @click="removeAccomplished(index)"
              >
                <DeleteOutlined />
              </a-button>
            </div>
            <a-button 
              type="dashed" 
              @click="addAccomplished"
              style="width: 100%"
            >
              <PlusOutlined />
              添加完成事项
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="遇到的挑战">
          <div class="challenges-section">
            <div 
              v-for="(challenge, index) in form.challenges" 
              :key="index"
              class="challenge-item"
            >
              <a-input 
                v-model:value="challenge.issue" 
                placeholder="问题描述"
                style="margin-bottom: 8px"
              />
              <a-input 
                v-model:value="challenge.impact" 
                placeholder="影响程度"
                style="margin-bottom: 8px"
              />
              <a-input 
                v-model:value="challenge.status" 
                placeholder="处理状态"
                style="margin-bottom: 8px"
              />
              <a-button 
                type="text" 
                danger 
                @click="removeChallenge(index)"
              >
                <DeleteOutlined />
                移除
              </a-button>
            </div>
            <a-button 
              type="dashed" 
              @click="addChallenge"
              style="width: 100%"
            >
              <PlusOutlined />
              添加挑战
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="下一步计划">
          <div class="dynamic-list">
            <div 
              v-for="(plan, index) in form.nextPlans" 
              :key="index"
              class="list-item"
            >
              <a-input 
                v-model:value="form.nextPlans[index]" 
                placeholder="描述下一步计划"
              />
              <a-button 
                type="text" 
                danger 
                @click="removeNextPlan(index)"
              >
                <DeleteOutlined />
              </a-button>
            </div>
            <a-button 
              type="dashed" 
              @click="addNextPlan"
              style="width: 100%"
            >
              <PlusOutlined />
              添加计划
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="时间分配（小时）">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="研究" name="research">
                <a-input-number 
                  v-model:value="form.timeSpent.research" 
                  :min="0" 
                  :max="24" 
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="开发" name="development">
                <a-input-number 
                  v-model:value="form.timeSpent.development" 
                  :min="0" 
                  :max="24" 
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="文档" name="documentation">
                <a-input-number 
                  v-model:value="form.timeSpent.documentation" 
                  :min="0" 
                  :max="24" 
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="沟通" name="communication">
                <a-input-number 
                  v-model:value="form.timeSpent.communication" 
                  :min="0" 
                  :max="24" 
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item label="信心度" name="confidence">
          <a-slider 
            v-model:value="form.confidence" 
            :min="0" 
            :max="100" 
            :marks="confidenceMarks"
          />
        </a-form-item>
      </a-form>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <a-space>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button type="primary" @click="handleSave">
            <SaveOutlined />
            保存记录
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'save-progress'])

// 响应式数据
const formRef = ref()
const form = reactive({
  type: 'daily',
  mood: 'positive',
  accomplished: [''],
  challenges: [],
  nextPlans: [''],
  timeSpent: {
    research: 0,
    development: 0,
    documentation: 0,
    communication: 0
  },
  confidence: 80
})

// 表单验证规则
const rules = {
  accomplished: [
    { required: true, message: '请至少添加一项完成事项', trigger: 'blur' }
  ]
}

// 信心度标记
const confidenceMarks = {
  0: '很低',
  25: '较低',
  50: '一般',
  75: '较高',
  100: '很高'
}

// 方法
const handleCancel = () => {
  emit('update:visible', false)
  resetForm()
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    // 过滤空的完成事项和计划
    const progressData = {
      ...form,
      accomplished: form.accomplished.filter(item => item.trim()),
      nextPlans: form.nextPlans.filter(plan => plan.trim())
    }
    
    emit('save-progress', progressData)
    emit('update:visible', false)
    resetForm()
  } catch (error) {
    message.error('请检查表单内容')
  }
}

const addAccomplished = () => {
  form.accomplished.push('')
}

const removeAccomplished = (index) => {
  if (form.accomplished.length > 1) {
    form.accomplished.splice(index, 1)
  }
}

const addChallenge = () => {
  form.challenges.push({
    issue: '',
    impact: '',
    status: ''
  })
}

const removeChallenge = (index) => {
  form.challenges.splice(index, 1)
}

const addNextPlan = () => {
  form.nextPlans.push('')
}

const removeNextPlan = (index) => {
  if (form.nextPlans.length > 1) {
    form.nextPlans.splice(index, 1)
  }
}

const resetForm = () => {
  Object.assign(form, {
    type: 'daily',
    mood: 'positive',
    accomplished: [''],
    challenges: [],
    nextPlans: [''],
    timeSpent: {
      research: 0,
      development: 0,
      documentation: 0,
      communication: 0
    },
    confidence: 80
  })
}
</script>

<style scoped>
.progress-record-content {
  max-height: 600px;
  overflow-y: auto;
}

.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.challenges-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.challenge-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #faad14;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
  margin-top: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .list-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
