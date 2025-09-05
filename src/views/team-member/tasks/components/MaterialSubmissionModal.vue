<template>
  <a-modal
    :visible="visible"
    title="提交任务材料"
    width="800px"
    @ok="handleConfirm"
    @cancel="handleCancel"
    @update:visible="$emit('update:visible', $event)"
    :ok-loading="loading">
    
    <div class="material-submission-content">
      <!-- 任务信息 -->
      <div class="task-info">
        <h3>{{ task?.title }}</h3>
        <a-tag :color="getMilestoneColor(task?.milestoneType)">
          {{ getMilestoneText(task?.milestoneType) }}
        </a-tag>
      </div>
      
      <!-- 提报模板（来自任务或默认模板） -->
      <div class="report-template" v-if="activeTemplate">
        <h4>
          提报模板：{{ activeTemplate.title || activeTemplate.name }}
          <a-tag v-if="activeTemplate.requireAttachment" color="red" size="small" style="margin-left:6px">需附件</a-tag>
        </h4>
        <div class="rtpl-sections">
          <div v-for="(sec, i) in activeTemplate.sections" :key="i" class="rtpl-section">
            <div class="rtpl-sec-h">
              <span class="t">{{ sec.title }}</span>
              <a-tag v-if="sec.required" color="red" size="small">必填</a-tag>
            </div>
            <a-textarea v-model:value="reportForm[i]" :rows="4" :placeholder="'请填写‘'+sec.title+'’内容'" />
          </div>
        </div>
      </div>

      <!-- 材料需求列表（里程碑内置清单，可与模板同时使用） -->
      <div class="material-requirements">
        <h4>材料需求清单</h4>
        <div v-for="(requirement, index) in materialRequirements" 
             :key="requirement.id"
             class="requirement-section">
          
          <div class="requirement-header">
            <span class="requirement-name">
              {{ requirement.name }}
              <a-tag v-if="requirement.required" color="red" size="small">必需</a-tag>
            </span>
            <span class="requirement-format">{{ requirement.format }}</span>
          </div>
          
          <div class="requirement-description">
            {{ requirement.description }}
          </div>
          
          <!-- 文件上传区域 -->
          <a-upload
            v-model:file-list="fileUploadLists[index]"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            @change="handleUploadChange"
            multiple
            :show-upload-list="{
              showDownloadIcon: true,
              showRemoveIcon: true,
              showPreviewIcon: true
            }"
            @preview="handlePreview">
            
            <a-button>
              <UploadOutlined />
              选择文件
            </a-button>
            
            <template #itemRender="{ file, actions }">
              <div class="upload-item">
                <div class="file-info">
                  <FileOutlined />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">({{ formatFileSize(file.size) }})</span>
                </div>
                <div class="file-actions">
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="actions.preview">
                    <EyeOutlined />
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="actions.remove">
                    <DeleteOutlined />
                  </a-button>
                </div>
              </div>
            </template>
          </a-upload>
        </div>
      </div>

      <!-- 提交说明 -->
      <div class="submission-note">
        <h4>提交说明</h4>
        <a-textarea 
          v-model:value="submissionNote"
          placeholder="请说明材料完成情况、主要内容概述、需要特别说明的问题等..."
          :rows="4" />
      </div>

      <!-- 完成确认 -->
      <div class="completion-checklist">
        <h4>完成确认</h4>
        <a-checkbox-group v-model:value="completionChecks">
          <div class="checklist-items">
            <a-checkbox value="content-complete">材料内容完整，符合要求</a-checkbox>
            <a-checkbox value="format-correct">文件格式正确，可正常打开</a-checkbox>
            <a-checkbox value="quality-check">已进行质量检查，无明显错误</a-checkbox>
            <a-checkbox value="deadline-aware">了解截止时间，按时提交</a-checkbox>
          </div>
        </a-checkbox-group>
      </div>

      <!-- 提交提示 -->
      <div v-if="submitWarning" class="submit-warning">
        <a-alert 
          :message="submitWarning.title"
          :description="submitWarning.content"
          :type="submitWarning.type"
          show-icon
          closable />
      </div>
    </div>

    <!-- 文件预览模态框 -->
    <a-modal
      v-model:visible="previewVisible"
      title="文件预览"
      :footer="null"
      width="80%">
      <div v-if="previewFile" class="file-preview">
        <!-- 图片预览 -->
        <img 
          v-if="isImageFile(previewFile)"
          :src="previewFile.url || previewFile.response?.url"
          style="width: 100%" />
        
        <!-- PDF预览 -->
        <iframe 
          v-else-if="isPdfFile(previewFile)"
          :src="previewFile.url || previewFile.response?.url"
          style="width: 100%; height: 600px; border: none;">
        </iframe>
        
        <!-- 其他文件类型 -->
        <div v-else class="unsupported-preview">
          <FileOutlined style="font-size: 48px; color: #999;" />
          <p>此文件类型暂不支持预览</p>
          <a-button type="primary" @click="downloadFile(previewFile)">
            下载查看
          </a-button>
        </div>
      </div>
    </a-modal>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { usePlanningStore } from '@/store/planning'
import { 
  UploadOutlined, 
  FileOutlined, 
  EyeOutlined, 
  DeleteOutlined 
} from '@ant-design/icons-vue'

const props = defineProps({
  visible: Boolean,
  task: Object
})

const emit = defineEmits(['update:visible', 'confirm'])

const loading = ref(false)
const previewVisible = ref(false)
const previewFile = ref(null)
const submissionNote = ref('')
const completionChecks = ref([])

// 文件上传相关
const uploadUrl = '/api/upload'
const uploadHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// 文件上传列表（每个材料需求对应一个）
const fileUploadLists = reactive({})

// 提报模板联动
const planning = usePlanningStore()
const activeTemplate = computed(() => planning.getActiveReportTemplate(props.task))
const reportForm = reactive({})
watch(activeTemplate, (tpl) => {
  // 初始化/清理表单
  Object.keys(reportForm).forEach(k => delete reportForm[k])
  if (tpl && Array.isArray(tpl.sections)) {
    tpl.sections.forEach((s, idx) => { reportForm[idx] = '' })
  }
}, { immediate: true })

// 材料需求配置
const materialRequirements = computed(() => {
  if (!props.task?.milestoneType) return []
  
  const requirements = {
    opening: [
      {
        id: 'opening_report',
        name: '开题报告',
        required: true,
        format: 'Word文档 (.docx)',
        description: '包含研究背景、目标、方法、预期成果等内容的完整开题报告'
      },
      {
        id: 'literature_review',
        name: '文献综述',
        required: true,
        format: 'Word文档 (.docx)',
        description: '相关领域的文献调研和综述分析'
      },
      {
        id: 'technical_route',
        name: '技术路线图',
        required: false,
        format: '图片或PDF (.png, .jpg, .pdf)',
        description: '项目实施的技术路线和流程图'
      }
    ],
    midterm: [
      {
        id: 'midterm_report',
        name: '中期检查报告',
        required: true,
        format: 'Word文档 (.docx)',
        description: '项目中期进展情况、阶段性成果和后续计划'
      },
      {
        id: 'stage_results',
        name: '阶段性成果',
        required: true,
        format: '多种格式',
        description: '已完成的研究成果、原型、代码或实验数据'
      }
    ],
    acceptance: [
      {
        id: 'acceptance_report',
        name: '验收报告',
        required: true,
        format: 'Word文档 (.docx)',
        description: '项目完整的验收报告和成果总结'
      },
      {
        id: 'final_results',
        name: '最终成果',
        required: true,
        format: '多种格式',
        description: '项目的最终交付成果和相关材料'
      }
    ]
  }
  
  return requirements[props.task.milestoneType] || []
})

// 提交警告信息
const submitWarning = computed(() => {
  // 模板必填校验
  if (activeTemplate.value && Array.isArray(activeTemplate.value.sections)) {
    const requiredSecs = activeTemplate.value.sections.filter(s => s.required)
    const missing = requiredSecs.filter((s, idx) => !reportForm[idx] || !String(reportForm[idx]).trim())
    if (missing.length > 0) {
      return {
        type: 'warning',
        title: '模板必填项未填写',
        content: `还有 ${missing.length} 个模板分段未填写，请完善后再提交。`
      }
    }
  }

  const requiredFiles = materialRequirements.value.filter(req => req.required)
  const uploadedRequired = requiredFiles.filter(req => 
    fileUploadLists[materialRequirements.value.indexOf(req)]?.length > 0
  )
  
  if (uploadedRequired.length < requiredFiles.length) {
    return {
      type: 'warning',
      title: '必需材料未完成',
      content: `还有 ${requiredFiles.length - uploadedRequired.length} 个必需材料未上传，请确保所有必需材料都已上传。`
    }
  }
  // 模板要求附件时，至少上传一个
  if (activeTemplate.value?.requireAttachment) {
    const anyFiles = Object.values(fileUploadLists).some(list => Array.isArray(list) && list.length > 0)
    if (!anyFiles) {
      return { type: 'warning', title: '需上传附件', content: '当前模板要求必须上传至少一个附件，请先上传后再提交。' }
    }
  }
  
  if (completionChecks.value.length < 4) {
    return {
      type: 'info',
      title: '请确认完成情况',
      content: '请确认所有完成项目，确保材料质量符合要求。'
    }
  }
  
  return null
})

// 监听任务变化，初始化文件上传列表
watch(() => props.task, (newTask) => {
  if (newTask) {
    materialRequirements.value.forEach((req, index) => {
      if (!fileUploadLists[index]) {
        fileUploadLists[index] = []
      }
    })
  }
})

// 文件上传相关方法
const beforeUpload = (file) => {
  const isValidSize = file.size / 1024 / 1024 < 50 // 限制50MB
  if (!isValidSize) {
    message.error('文件大小不能超过50MB')
  }
  return isValidSize
}

const handleUploadChange = (info) => {
  if (info.file.status === 'done') {
    message.success(`${info.file.name} 上传成功`)
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 上传失败`)
  }
}

const handlePreview = (file) => {
  previewFile.value = file
  previewVisible.value = true
}

const isImageFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp']
  return imageTypes.includes(file.type) || /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.name)
}

const isPdfFile = (file) => {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

const downloadFile = (file) => {
  const url = file.url || file.response?.url
  if (url) {
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
  }
}

const formatFileSize = (size) => {
  if (!size) return ''
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / 1024 / 1024).toFixed(1) + ' MB'
}

// 工具方法
const getMilestoneColor = (milestoneType) => {
  const colors = { 
    opening: 'blue', 
    midterm: 'purple', 
    acceptance: 'cyan' 
  }
  return colors[milestoneType] || 'default'
}

const getMilestoneText = (milestoneType) => {
  const texts = { 
    opening: '项目开题', 
    midterm: '项目中期', 
    acceptance: '项目验收' 
  }
  return texts[milestoneType] || milestoneType
}

// 提交处理
const handleConfirm = async () => {
  // 验证必需材料
  // 模板必填校验
  if (activeTemplate.value && Array.isArray(activeTemplate.value.sections)) {
    const requiredSecs = activeTemplate.value.sections.filter(s => s.required)
    const missing = requiredSecs.filter((s, idx) => !reportForm[idx] || !String(reportForm[idx]).trim())
    if (missing.length > 0) {
      message.error('请完善模板必填内容')
      return
    }
  }
  const requiredFiles = materialRequirements.value.filter(req => req.required)
  const uploadedRequired = requiredFiles.filter(req => {
    const index = materialRequirements.value.indexOf(req)
    return fileUploadLists[index]?.length > 0
  })
  
  if (uploadedRequired.length < requiredFiles.length) {
    message.error('请上传所有必需材料')
    return
  }
  if (activeTemplate.value?.requireAttachment) {
    const anyFiles = Object.values(fileUploadLists).some(list => Array.isArray(list) && list.length > 0)
    if (!anyFiles) { message.error('该模板要求必须上传附件'); return }
  }
  
  // 验证完成确认
  if (completionChecks.value.length < 3) {
    message.error('请确认至少3项完成检查')
    return
  }
  
  loading.value = true
  
  try {
    // 整理提交数据
    const submissionData = {
      taskId: props.task.id,
      milestoneType: props.task.milestoneType,
      reportTemplate: activeTemplate.value ? {
        id: activeTemplate.value.id || '',
        title: activeTemplate.value.title || activeTemplate.value.name,
        requireAttachment: !!activeTemplate.value.requireAttachment,
        sections: (activeTemplate.value.sections || []).map((s, idx) => ({ title: s.title, required: !!s.required, content: reportForm[idx] || '' }))
      } : null,
      materials: materialRequirements.value.map((req, index) => ({
        requirementId: req.id,
        name: req.name,
        files: fileUploadLists[index] || []
      })),
      note: submissionNote.value,
      completionChecks: completionChecks.value,
      submittedAt: new Date().toISOString()
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('confirm', submissionData)
    
    // 重置表单
    submissionNote.value = ''
    completionChecks.value = []
    Object.keys(fileUploadLists).forEach(key => {
      fileUploadLists[key] = []
    })
    
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.material-submission-content {
  max-height: 70vh;
  overflow-y: auto;
}

.task-info {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.task-info h3 {
  color: #234fa2;
  margin: 0 0 8px 0;
}

.material-requirements h4,
.submission-note h4,
.completion-checklist h4 {
  color: #234fa2;
  margin-bottom: 12px;
}

.requirement-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.requirement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.requirement-name {
  font-weight: 600;
  color: #234fa2;
}

.requirement-format {
  font-size: 12px;
  color: #999;
}

.requirement-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.upload-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 4px;
}

.submission-note {
  margin: 24px 0;
}

.completion-checklist {
  margin: 24px 0;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submit-warning {
  margin-top: 16px;
}

.file-preview {
  text-align: center;
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
}
</style>

