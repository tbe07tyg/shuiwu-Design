<!--
 * @file 研究发现编辑弹窗组件
 * @description 添加或编辑研究发现
-->
<template>
  <a-modal
    :open="visible"
    :title="discovery ? '编辑研究发现' : '记录新发现'"
    width="600px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="discovery-edit-content">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item label="发现标题" name="title">
          <a-input v-model:value="form.title" placeholder="简要描述你的发现" />
        </a-form-item>

        <a-form-item label="详细描述" name="description">
          <a-textarea 
            v-model:value="form.description" 
            placeholder="详细描述你的发现内容"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="发现内容" name="content">
          <a-textarea 
            v-model:value="form.content" 
            placeholder="详细说明发现的技术细节、实现方法等"
            :rows="4"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="重要程度" name="importance">
              <a-select v-model:value="form.importance">
                <a-select-option value="high">重要</a-select-option>
                <a-select-option value="medium">一般</a-select-option>
                <a-select-option value="low">待确认</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发现类别" name="category">
              <a-select v-model:value="form.category">
                <a-select-option value="technical_innovation">技术创新</a-select-option>
                <a-select-option value="user_experience">用户体验</a-select-option>
                <a-select-option value="security">安全防护</a-select-option>
                <a-select-option value="performance">性能优化</a-select-option>
                <a-select-option value="process_improvement">流程改进</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="关联任务" name="relatedTask">
          <a-select v-model:value="form.relatedTask" placeholder="选择相关任务">
            <a-select-option value="T001">系统架构设计</a-select-option>
            <a-select-option value="T002">前端界面开发</a-select-option>
            <a-select-option value="T003">接口联调测试</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="form.tags"
            mode="tags"
            placeholder="添加相关标签"
            :options="tagOptions"
          />
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio value="draft">草稿</a-radio>
            <a-radio value="confirmed">已确认</a-radio>
            <a-radio value="applied">已应用</a-radio>
          </a-radio-group>
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
          <a-button type="primary" @click="handleSave">
            <CheckOutlined />
            确认保存
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { 
  SaveOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  discovery: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'save-discovery'])

// 响应式数据
const formRef = ref()
const form = reactive({
  title: '',
  description: '',
  content: '',
  importance: 'medium',
  category: 'technical_innovation',
  relatedTask: '',
  tags: [],
  status: 'draft'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入发现标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入详细描述', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入发现内容', trigger: 'blur' }
  ]
}

// 标签选项
const tagOptions = [
  { value: '算法优化', label: '算法优化' },
  { value: '性能提升', label: '性能提升' },
  { value: '用户体验', label: '用户体验' },
  { value: '安全防护', label: '安全防护' },
  { value: '代码重构', label: '代码重构' },
  { value: '流程改进', label: '流程改进' }
]

// 方法
const handleCancel = () => {
  emit('update:visible', false)
  resetForm()
}

const handleSaveDraft = () => {
  form.status = 'draft'
  handleSave()
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    const discoveryData = {
      ...form,
      id: props.discovery?.id || null
    }
    
    emit('save-discovery', discoveryData)
    emit('update:visible', false)
    resetForm()
  } catch (error) {
    message.error('请检查表单内容')
  }
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    content: '',
    importance: 'medium',
    category: 'technical_innovation',
    relatedTask: '',
    tags: [],
    status: 'draft'
  })
}

// 监听发现数据变化
watch(() => props.discovery, (newDiscovery) => {
  if (newDiscovery) {
    Object.assign(form, {
      title: newDiscovery.title || '',
      description: newDiscovery.description || '',
      content: newDiscovery.content || '',
      importance: newDiscovery.importance || 'medium',
      category: newDiscovery.category || 'technical_innovation',
      relatedTask: newDiscovery.relatedTask || '',
      tags: newDiscovery.tags || [],
      status: newDiscovery.status || 'draft'
    })
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.discovery-edit-content {
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
