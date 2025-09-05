<template>
  <div class="project-edit-page">
    <div class="page-header">
      <a-button type="link" @click="goBack">返回</a-button>
      <h1 class="page-title">编辑项目</h1>
      <p class="subtitle">项目ID: {{ projectId }}</p>
    </div>

    <div class="edit-content">
      <!-- 编辑提示 -->
      <a-alert
        message="项目编辑"
        description="修改项目信息，保存后将更新项目数据。请谨慎修改关键信息。"
        type="warning"
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
          <h3 class="section-title">项目基本信息</h3>
          
          <a-form-item label="项目名称" name="name">
            <a-input 
              v-model:value="form.name" 
              placeholder="请输入项目名称"
              :maxlength="100"
              show-count
            />
          </a-form-item>
          
          <a-form-item label="项目类型" name="type">
            <a-select v-model:value="form.type" :options="typeOptions" placeholder="请选择项目类型" />
          </a-form-item>
          
          <a-form-item label="项目状态" name="status">
            <a-select v-model:value="form.status" :options="statusOptions" placeholder="请选择项目状态" />
          </a-form-item>
          
          <a-form-item label="项目负责人" name="leader">
            <a-select 
              v-model:value="form.leader" 
              :options="leaderOptions" 
              placeholder="请选择项目负责人"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
          
          <a-form-item label="所属部门" name="dept">
            <a-select v-model:value="form.dept" :options="deptOptions" placeholder="请选择所属部门" />
          </a-form-item>
          
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
          
          <a-form-item label="实际开始时间" name="actualStartDate">
            <a-date-picker 
              v-model:value="form.actualStartDate" 
              placeholder="请选择实际开始时间" 
              style="width: 100%;"
            />
          </a-form-item>
          
          <a-form-item label="实际结束时间" name="actualEndDate">
            <a-date-picker 
              v-model:value="form.actualEndDate" 
              placeholder="请选择实际结束时间" 
              style="width: 100%;"
            />
          </a-form-item>
          
          <a-form-item label="项目简介" name="description">
            <a-textarea 
              v-model:value="form.description" 
              placeholder="请简要描述项目背景、目标、主要内容和预期成果等"
              :rows="5" 
              :maxlength="1000"
              show-count
            />
          </a-form-item>
        </div>

        <!-- 预算信息 -->
        <div class="form-section">
          <h3 class="section-title">预算信息</h3>
          
          <a-form-item label="申请预算" name="budget">
            <a-input-number 
              v-model:value="form.budget" 
              :min="0" 
              :max="999999"
              :precision="2"
              style="width: 300px;" 
              placeholder="请输入申请预算"
              addon-after="万元"
            />
          </a-form-item>
          
          <a-form-item label="已用预算" name="usedBudget">
            <a-input-number 
              v-model:value="form.usedBudget" 
              :min="0" 
              :max="form.budget || 999999"
              :precision="2"
              style="width: 300px;" 
              placeholder="请输入已使用预算"
              addon-after="万元"
              disabled
            />
          </a-form-item>
          
          <a-form-item label="剩余预算" name="remainingBudget">
            <a-input-number 
              :value="remainingBudget" 
              :precision="2"
              style="width: 300px;" 
              addon-after="万元"
              disabled
            />
          </a-form-item>
        </div>

        <!-- 进度信息 -->
        <div class="form-section">
          <h3 class="section-title">进度信息</h3>
          
          <a-form-item label="项目进度" name="progress">
            <a-slider 
              v-model:value="form.progress" 
              :min="0" 
              :max="100"
              :tooltip-formatter="value => `${value}%`"
              style="width: 300px;"
            />
            <span style="margin-left: 16px; color: #666;">{{ form.progress }}%</span>
          </a-form-item>
          
          <a-form-item label="项目优先级" name="priority">
            <a-select v-model:value="form.priority" :options="priorityOptions" placeholder="请选择优先级" />
          </a-form-item>
        </div>

        <!-- 团队信息 -->
        <div class="form-section">
          <h3 class="section-title">团队信息</h3>
          
          <a-form-item label="团队成员" name="teamMembers">
            <a-select 
              v-model:value="form.teamMembers" 
              mode="multiple"
              :options="memberOptions" 
              placeholder="请选择团队成员"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
        </div>

        <!-- 备注信息 -->
        <div class="form-section">
          <h3 class="section-title">备注信息</h3>
          
          <a-form-item label="修改原因" name="editReason">
            <a-textarea 
              v-model:value="form.editReason" 
              placeholder="请说明本次修改的原因"
              :rows="3" 
              :maxlength="500"
              show-count
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
              保存修改
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const saving = ref(false)

// 获取项目ID
const projectId = computed(() => route.params.id)

// 表单数据
const form = reactive({
  name: '',
  type: '',
  status: '',
  leader: '',
  dept: '',
  startDate: null,
  endDate: null,
  actualStartDate: null,
  actualEndDate: null,
  description: '',
  budget: null,
  usedBudget: 0,
  progress: 0,
  priority: '',
  teamMembers: [],
  editReason: '',
  remarks: ''
})

// 计算剩余预算
const remainingBudget = computed(() => {
  return (form.budget || 0) - (form.usedBudget || 0)
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 100, message: '项目名称长度在2-100个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ],
  leader: [
    { required: true, message: '请选择项目负责人', trigger: 'change' }
  ],
  dept: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  budget: [
    { required: true, message: '请输入申请预算', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '预算必须大于0', trigger: 'blur' }
  ],
  editReason: [
    { required: true, message: '请说明修改原因', trigger: 'blur' }
  ]
}

// 项目类型选项
const typeOptions = [
  { label: '研发项目', value: 'research' },
  { label: '工程项目', value: 'engineering' },
  { label: '咨询项目', value: 'consulting' },
  { label: '培训项目', value: 'training' }
]

// 项目状态选项
const statusOptions = [
  { label: '规划中', value: 'planning' },
  { label: '进行中', value: 'active' },
  { label: '已暂停', value: 'suspended' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

// 优先级选项
const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
]

// 部门选项（模拟数据）
const deptOptions = [
  { label: '技术研发部', value: 'tech' },
  { label: '市场部', value: 'marketing' },
  { label: '产品部', value: 'product' },
  { label: '财务部', value: 'finance' },
  { label: '人力资源部', value: 'hr' }
]

// 负责人选项（模拟数据）
const leaderOptions = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' }
]

// 团队成员选项（模拟数据）
const memberOptions = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' },
  { label: '钱七', value: 'qianqi' },
  { label: '孙八', value: 'sunba' }
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

// 加载项目数据
const loadProjectData = async () => {
  try {
    // 这里应该调用API获取项目数据
    // const response = await getProject(projectId.value)
    
    // 模拟加载项目数据
    const mockProjectData = {
      name: '智能办公系统开发',
      type: 'research',
      status: 'active',
      leader: 'zhangsan',
      dept: 'tech',
      startDate: dayjs('2024-01-01'),
      endDate: dayjs('2024-12-31'),
      actualStartDate: dayjs('2024-01-05'),
      actualEndDate: null,
      description: '开发一套智能化的办公管理系统，提高工作效率',
      budget: 100,
      usedBudget: 35,
      progress: 45,
      priority: 'high',
      teamMembers: ['lisi', 'wangwu'],
      remarks: '项目进展顺利'
    }
    
    // 填充表单数据
    Object.assign(form, mockProjectData)
    
    message.success('项目数据加载成功')
  } catch (error) {
    console.error('加载项目数据失败:', error)
    message.error('加载项目数据失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 这里应该调用API保存项目数据
    // await updateProject(projectId.value, form)
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('项目信息更新成功')
    goBack()
  } catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败，请检查表单信息')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  loadProjectData() // 重新加载原始数据
}

// 返回
const goBack = () => {
  router.go(-1)
}

// 生命周期
onMounted(() => {
  loadProjectData()
})
</script>

<style scoped>
.project-edit-page {
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

.subtitle {
  color: #8c8c8c;
  font-size: 14px;
  margin: 0;
}

.edit-content {
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