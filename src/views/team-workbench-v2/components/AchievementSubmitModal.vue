<!--
 * @file 成果提交弹窗组件
 * @description 提交阶段性成果
-->
<template>
  <a-modal
    :open="visible"
    title="提交成果"
    width="600px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="achievement-submit-content">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item label="成果标题" name="title">
          <a-input v-model:value="form.title" placeholder="输入成果标题" />
        </a-form-item>

        <a-form-item label="成果摘要" name="summary">
          <a-textarea 
            v-model:value="form.summary" 
            placeholder="简要描述成果内容和价值"
            :rows="3"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="成果类型" name="type">
              <a-select v-model:value="form.type">
                <a-select-option value="document">文档</a-select-option>
                <a-select-option value="report">报告</a-select-option>
                <a-select-option value="code">代码</a-select-option>
                <a-select-option value="presentation">演示</a-select-option>
                <a-select-option value="summary">总结</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关联任务" name="taskId">
              <a-select v-model:value="form.taskId" placeholder="选择关联任务">
                <a-select-option value="T001">系统架构设计</a-select-option>
                <a-select-option value="T002">前端界面开发</a-select-option>
                <a-select-option value="T003">接口联调测试</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="详细内容" name="content">
          <a-textarea 
            v-model:value="form.content" 
            placeholder="详细描述成果内容、技术要点、创新之处等"
            :rows="5"
          />
        </a-form-item>

        <a-form-item label="附件上传">
          <a-upload
            v-model:file-list="fileList"
            :before-upload="beforeUpload"
            multiple
          >
            <a-button>
              <UploadOutlined />
              选择文件
            </a-button>
          </a-upload>
        </a-form-item>

        <a-form-item label="自评等级" name="selfRating">
          <a-rate v-model:value="form.selfRating" :count="5" />
          <span style="margin-left: 8px; color: #8c8c8c;">
            {{ getRatingText(form.selfRating) }}
          </span>
        </a-form-item>

        <a-form-item label="备注说明">
          <a-textarea 
            v-model:value="form.remarks" 
            placeholder="其他需要说明的内容"
            :rows="2"
          />
        </a-form-item>
      </a-form>

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
          <a-button type="primary" @click="handleSubmit">
            <SendOutlined />
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
  UploadOutlined,
  SaveOutlined,
  SendOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  achievement: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'submit-complete'])

// 响应式数据
const formRef = ref()
const fileList = ref([])
const form = reactive({
  title: '',
  summary: '',
  type: 'document',
  taskId: '',
  content: '',
  selfRating: 3,
  remarks: ''
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入成果标题', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入成果摘要', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入详细内容', trigger: 'blur' }
  ],
  taskId: [
    { required: true, message: '请选择关联任务', trigger: 'change' }
  ]
}

// 方法
const handleCancel = () => {
  emit('update:visible', false)
  resetForm()
}

const handleSaveDraft = () => {
  message.success('草稿已保存')
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    const submissionData = {
      ...form,
      achievementId: props.achievement?.id,
      attachments: fileList.value.map(file => file.name),
      submittedTime: new Date().toISOString()
    }
    
    emit('submit-complete', submissionData)
    emit('update:visible', false)
    resetForm()
  } catch (error) {
    message.error('请检查表单内容')
  }
}

const beforeUpload = (file) => {
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'].includes(file.type)
  if (!isValidType) {
    message.error('只能上传 PDF、Word、图片格式的文件')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB')
    return false
  }
  
  return false // 阻止自动上传
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    summary: '',
    type: 'document',
    taskId: '',
    content: '',
    selfRating: 3,
    remarks: ''
  })
  fileList.value = []
}

const getRatingText = (rating) => {
  const textMap = {
    1: '需要改进',
    2: '基本达标',
    3: '符合要求',
    4: '超出预期',
    5: '卓越表现'
  }
  return textMap[rating] || ''
}

// 监听成果数据变化
watch(() => props.achievement, (newAchievement) => {
  if (newAchievement) {
    Object.assign(form, {
      title: newAchievement.title || '',
      summary: '',
      type: newAchievement.type || 'document',
      taskId: newAchievement.taskId || '',
      content: '',
      selfRating: 3,
      remarks: ''
    })
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.achievement-submit-content {
  max-height: 600px;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
  margin-top: 16px;
}
</style>
