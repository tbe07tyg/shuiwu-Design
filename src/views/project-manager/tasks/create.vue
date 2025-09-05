<template>
  <div class="task-create-page">
    <div class="page-header">
      <a-button type="link" @click="goBack">返回</a-button>
      <h1 class="page-title">新建任务</h1>
    </div>

    <div class="create-content">
      <!-- 创建步骤提示 -->
      <a-alert
        message="任务创建流程"
        description="请完整填写任务信息，创建成功后将自动分配给指定成员。"
        type="info"
        show-icon
        style="margin-bottom: 32px;"
      />

      <a-form 
        :model="form" 
        :rules="rules" 
        @finish="handleSubmit"
        ref="formRef"
        layout="horizontal"
        :label-col="{span:4}"
        :wrapper-col="{span:16}"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">任务基本信息</h3>
          
          <a-form-item label="任务名称" name="name">
            <a-input 
              v-model:value="form.name" 
              placeholder="请输入任务名称"
              :maxlength="100"
              show-count
            />
          </a-form-item>
          
          <a-form-item label="所属项目" name="projectId">
            <a-select 
              v-model:value="form.projectId" 
              :options="projectOptions" 
              placeholder="请选择所属项目"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
          
          <a-form-item label="任务类型" name="type">
            <a-select v-model:value="form.type" :options="typeOptions" placeholder="请选择任务类型" />
          </a-form-item>
          
          <a-form-item label="任务优先级" name="priority">
            <a-select v-model:value="form.priority" :options="priorityOptions" placeholder="请选择优先级" />
          </a-form-item>
          
          <a-form-item label="任务描述" name="description">
            <a-textarea 
              v-model:value="form.description" 
              placeholder="请详细描述任务目标、要求和预期成果"
              :rows="5" 
              :maxlength="1000"
              show-count
            />
          </a-form-item>
        </div>

        <!-- 时间安排 -->
        <div class="form-section">
          <h3 class="section-title">时间安排</h3>
          
          <a-form-item label="计划开始时间" name="startDate">
            <a-date-picker 
              v-model:value="form.startDate" 
              placeholder="请选择开始时间" 
              style="width: 100%;" 
              :disabled-date="disabledStartDate"
            />
          </a-form-item>
          
          <a-form-item label="计划结束时间" name="endDate">
            <a-date-picker 
              v-model:value="form.endDate" 
              placeholder="请选择结束时间" 
              style="width: 100%;"
              :disabled-date="disabledEndDate"
            />
          </a-form-item>
          
          <a-form-item label="预计工时" name="estimatedHours">
            <a-input-number 
              v-model:value="form.estimatedHours" 
              :min="0.5" 
              :max="1000"
              :precision="1"
              :step="0.5"
              style="width: 200px;" 
              placeholder="请输入预计工时"
              addon-after="小时"
            />
          </a-form-item>
        </div>

        <!-- 任务分配 -->
        <div class="form-section">
          <h3 class="section-title">任务分配</h3>
          
          <a-form-item label="任务负责人" name="assignee">
            <a-select 
              v-model:value="form.assignee" 
              :options="memberOptions" 
              placeholder="请选择任务负责人"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
          
          <a-form-item label="参与成员" name="participants">
            <a-select 
              v-model:value="form.participants" 
              mode="multiple"
              :options="memberOptions" 
              placeholder="请选择参与成员"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
          
          <a-form-item label="审核人" name="reviewer">
            <a-select 
              v-model:value="form.reviewer" 
              :options="reviewerOptions" 
              placeholder="请选择审核人"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
        </div>

        <!-- 任务要求 -->
        <div class="form-section">
          <h3 class="section-title">任务要求</h3>
          
          <a-form-item label="交付成果" name="deliverables">
            <a-textarea 
              v-model:value="form.deliverables" 
              placeholder="请描述需要交付的成果和文档"
              :rows="3" 
              :maxlength="500"
              show-count
            />
          </a-form-item>
          
          <a-form-item label="验收标准" name="acceptanceCriteria">
            <a-textarea 
              v-model:value="form.acceptanceCriteria" 
              placeholder="请描述任务完成的验收标准"
              :rows="3" 
              :maxlength="500"
              show-count
            />
          </a-form-item>
          
          <a-form-item label="依赖任务" name="dependencies">
            <a-select 
              v-model:value="form.dependencies" 
              mode="multiple"
              :options="taskOptions" 
              placeholder="请选择依赖的任务"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
        </div>

        <!-- 附加信息 -->
        <div class="form-section">
          <h3 class="section-title">附加信息</h3>
          
          <a-form-item label="任务标签" name="tags">
            <a-select 
              v-model:value="form.tags" 
              mode="tags"
              :options="tagOptions" 
              placeholder="请输入或选择标签"
            />
          </a-form-item>
          
          <a-form-item label="备注" name="remarks">
            <a-textarea 
              v-model:value="form.remarks" 
              placeholder="其他备注信息"
              :rows="3" 
              :maxlength="500"
              show-count
            />
          </a-form-item>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <a-space>
            <a-button type="primary" html-type="submit" :loading="saving">
              创建任务
            </a-button>
            <a-button @click="resetForm">重置</a-button>
            <a-button @click="goBack">取消</a-button>
          </a-space>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const router = useRouter()
const formRef = ref()
const saving = ref(false)

// 表单数据
const form = reactive({
  name: '',
  projectId: '',
  type: '',
  priority: '',
  description: '',
  startDate: null,
  endDate: null,
  estimatedHours: null,
  assignee: '',
  participants: [],
  reviewer: '',
  deliverables: '',
  acceptanceCriteria: '',
  dependencies: [],
  tags: [],
  remarks: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 100, message: '任务名称长度在2-100个字符', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  assignee: [
    { required: true, message: '请选择任务负责人', trigger: 'change' }
  ],
  estimatedHours: [
    { required: true, message: '请输入预计工时', trigger: 'blur' },
    { type: 'number', min: 0.5, message: '工时必须大于0.5小时', trigger: 'blur' }
  ]
}

// 项目选项（模拟数据）
const projectOptions = [
  { label: '智能办公系统开发', value: 'project1' },
  { label: '数据分析平台', value: 'project2' },
  { label: '移动应用开发', value: 'project3' },
  { label: '系统集成项目', value: 'project4' }
]

// 任务类型选项
const typeOptions = [
  { label: '开发任务', value: 'development' },
  { label: '测试任务', value: 'testing' },
  { label: '设计任务', value: 'design' },
  { label: '文档任务', value: 'documentation' },
  { label: '调研任务', value: 'research' },
  { label: '部署任务', value: 'deployment' }
]

// 优先级选项
const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
]

// 团队成员选项（模拟数据）
const memberOptions = [
  { label: '张三（前端开发）', value: 'zhangsan' },
  { label: '李四（后端开发）', value: 'lisi' },
  { label: '王五（UI设计师）', value: 'wangwu' },
  { label: '赵六（测试工程师）', value: 'zhaoliu' },
  { label: '钱七（产品经理）', value: 'qianqi' },
  { label: '孙八（运维工程师）', value: 'sunba' }
]

// 审核人选项（模拟数据）
const reviewerOptions = [
  { label: '项目经理-张三', value: 'pm_zhangsan' },
  { label: '技术总监-李四', value: 'tech_lisi' },
  { label: '产品总监-王五', value: 'product_wangwu' }
]

// 依赖任务选项（模拟数据）
const taskOptions = [
  { label: '需求分析', value: 'task1' },
  { label: '架构设计', value: 'task2' },
  { label: '数据库设计', value: 'task3' },
  { label: 'UI设计', value: 'task4' }
]

// 标签选项
const tagOptions = [
  { label: '紧急', value: 'urgent' },
  { label: '重要', value: 'important' },
  { label: '优化', value: 'optimization' },
  { label: 'bug修复', value: 'bugfix' },
  { label: '新功能', value: 'feature' },
  { label: '测试', value: 'test' }
]

// 过滤选项
const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 日期禁用逻辑
const disabledStartDate = (current) => {
  return current && current < dayjs().startOf('day')
}

const disabledEndDate = (current) => {
  if (!form.startDate) return false
  return current && current < dayjs(form.startDate)
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 这里应该调用API创建任务
    // await createTask(form)
    
    // 模拟创建
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('任务创建成功')
    goBack()
  } catch (error) {
    console.error('创建失败:', error)
    message.error('创建失败，请检查表单信息')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
}

// 返回
const goBack = () => {
  router.go(-1)
}

// 生命周期
onMounted(() => {
  // 可以在这里加载项目列表、成员列表等数据
})
</script>

<style scoped>
.task-create-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #234fa2;
  margin: 8px 0;
}

.create-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #234fa2;
  margin: 0 0 24px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e6f7ff;
}

.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.ant-form-item {
  margin-bottom: 24px;
}

.ant-input,
.ant-input-number,
.ant-select,
.ant-date-picker,
.ant-textarea {
  border-radius: 6px;
}

.ant-btn {
  border-radius: 6px;
  height: 40px;
  padding: 0 24px;
  font-weight: 500;
}

.ant-btn-primary {
  background: #234fa2;
  border-color: #234fa2;
}

.ant-btn-primary:hover {
  background: #1a3877;
  border-color: #1a3877;
}
</style>