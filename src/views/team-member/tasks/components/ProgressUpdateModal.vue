<template>
  <a-modal
    :visible="visible"
    title="更新任务进度"
    @ok="handleConfirm"
    @cancel="handleCancel"
    @update:visible="$emit('update:visible', $event)"
    :ok-loading="loading">
    
    <a-form :model="form" layout="vertical">
      <a-form-item label="当前进度" required>
        <a-slider 
          v-model:value="form.progress"
          :marks="progressMarks"
          :tip-formatter="val => `${val}%`" />
        <div class="progress-display">
          当前进度：<strong>{{ form.progress }}%</strong>
        </div>
      </a-form-item>
      
      <a-form-item label="进度说明">
        <a-textarea 
          v-model:value="form.note"
          placeholder="请描述当前进展情况、遇到的问题或需要的支持..."
          :rows="4" />
      </a-form-item>
      
      <a-form-item label="预计完成时间">
        <a-date-picker 
          v-model:value="form.estimatedCompletion"
          style="width: 100%"
          :disabled-date="disabledDate" />
      </a-form-item>

      <a-form-item label="完成情况详述">
        <a-checkbox-group v-model:value="form.completedItems">
          <div class="completion-items">
            <a-checkbox value="analysis">需求分析</a-checkbox>
            <a-checkbox value="design">方案设计</a-checkbox>
            <a-checkbox value="implementation">代码实现</a-checkbox>
            <a-checkbox value="testing">功能测试</a-checkbox>
            <a-checkbox value="documentation">文档编写</a-checkbox>
            <a-checkbox value="review">代码审查</a-checkbox>
          </div>
        </a-checkbox-group>
      </a-form-item>

      <a-form-item label="遇到的问题">
        <a-select 
          v-model:value="form.issues"
          mode="multiple"
          placeholder="选择遇到的问题（可选）"
          allow-clear>
          <a-select-option value="technical">技术难题</a-select-option>
          <a-select-option value="resource">资源不足</a-select-option>
          <a-select-option value="coordination">协调问题</a-select-option>
          <a-select-option value="requirement">需求不明确</a-select-option>
          <a-select-option value="schedule">时间紧张</a-select-option>
          <a-select-option value="other">其他问题</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="需要的支持">
        <a-input 
          v-model:value="form.supportNeeded"
          placeholder="描述需要项目经理或团队提供的支持..." />
      </a-form-item>
    </a-form>

    <!-- 进度建议提示 -->
    <div v-if="progressSuggestion" class="progress-suggestion">
      <a-alert 
        :message="progressSuggestion.title"
        :description="progressSuggestion.content"
        :type="progressSuggestion.type"
        show-icon />
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const props = defineProps({
  visible: Boolean,
  task: Object
})

const emit = defineEmits(['update:visible', 'confirm'])

const loading = ref(false)

const form = reactive({
  progress: 0,
  note: '',
  estimatedCompletion: null,
  completedItems: [],
  issues: [],
  supportNeeded: ''
})

const progressMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

// 进度建议计算
const progressSuggestion = computed(() => {
  if (!props.task || form.progress <= (props.task.progress || 0)) {
    return null
  }

  const progressIncrease = form.progress - (props.task.progress || 0)
  
  if (form.progress === 100) {
    return {
      type: 'success',
      title: '任务即将完成',
      content: '恭喜！任务进度已达到100%，请确保所有工作项都已完成，然后可以标记任务为完成状态。'
    }
  }
  
  if (progressIncrease >= 30) {
    return {
      type: 'success',
      title: '进度提升显著',
      content: `本次进度提升了${progressIncrease}%，工作效率很高！请继续保持。`
    }
  }
  
  if (form.progress >= 80 && props.task?.milestoneType) {
    return {
      type: 'info',
      title: '可以开始准备材料',
      content: '任务进度已超过80%，如果这是里程碑任务，建议开始准备相关材料的提交。'
    }
  }
  
  return null
})

// 监听任务变化，初始化表单
watch(() => props.task, (newTask) => {
  if (newTask) {
    form.progress = newTask.progress || 0
    form.note = ''
    form.estimatedCompletion = null
    form.completedItems = []
    form.issues = []
    form.supportNeeded = ''
  }
})

// 监听visible变化，重置表单
watch(() => props.visible, (visible) => {
  if (visible && props.task) {
    form.progress = props.task.progress || 0
  }
})

const disabledDate = (current) => {
  // 不能选择过去的日期
  return current && current < dayjs().startOf('day')
}

const handleConfirm = async () => {
  // 验证进度不能倒退
  if (form.progress < (props.task?.progress || 0)) {
    message.error('进度不能倒退')
    return
  }

  // 验证进度说明
  if (form.progress > (props.task?.progress || 0) + 20 && !form.note.trim()) {
    message.warning('进度提升较大，建议填写进度说明')
    return
  }

  loading.value = true
  
  try {
    const updateData = {
      progress: form.progress,
      note: form.note,
      estimatedCompletion: form.estimatedCompletion ? form.estimatedCompletion.format('YYYY-MM-DD') : null,
      completedItems: form.completedItems,
      issues: form.issues,
      supportNeeded: form.supportNeeded,
      updateTime: new Date().toISOString()
    }
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    emit('confirm', updateData)
    
    // 重置表单
    Object.assign(form, {
      progress: 0,
      note: '',
      estimatedCompletion: null,
      completedItems: [],
      issues: [],
      supportNeeded: ''
    })
    
  } catch (error) {
    message.error('更新失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.progress-display {
  text-align: center;
  margin-top: 12px;
  font-size: 16px;
  color: #234fa2;
}

.completion-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.progress-suggestion {
  margin-top: 16px;
}
</style>

