<template>
  <div class="budget-reporter-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <DollarOutlined /> 经费执行进度 - 填报页面
        </h1>
        <div class="user-role">
          <a-tag color="blue">
            <UserOutlined /> 我的权限：填报员
          </a-tag>
        </div>
      </div>
      <div class="header-actions">
        <a-select 
          v-model:value="selectedProject" 
          placeholder="选择项目" 
          style="width: 280px; margin-right: 12px;"
          @change="handleProjectChange"
        >
          <a-select-option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </a-select-option>
        </a-select>
        <a-button 
          v-if="canSwitchToManager" 
          type="default" 
          @click="switchToManager"
          style="border-color: #fa8c16; color: #fa8c16;"
        >
          <CrownOutlined /> 切换到管理视图
        </a-button>
      </div>
    </div>

    <!-- 项目信息卡片 -->
    <a-card v-if="currentProject" class="project-info-card">
      <div class="project-info">
        <div class="info-item">
          <span class="label">项目名称：</span>
          <span class="value">{{ currentProject.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">预算总额：</span>
          <span class="value budget-amount">¥{{ formatMoney(currentProject.totalBudget) }}</span>
        </div>
        <div class="info-item">
          <span class="label">已使用：</span>
          <span class="value used-amount">¥{{ formatMoney(currentProject.usedAmount) }} ({{ executionRate }}%)</span>
        </div>
        <div class="info-item">
          <span class="label">剩余：</span>
          <span class="value remaining-amount">¥{{ formatMoney(currentProject.remainingAmount) }} ({{ 100 - executionRate }}%)</span>
        </div>
      </div>
      <div class="progress-section">
        <a-progress 
          :percent="executionRate" 
          :stroke-color="progressColor"
          :stroke-width="8"
          style="margin-top: 16px;"
        />
      </div>
    </a-card>

    <!-- 主要内容区域 -->
    <div v-if="currentProject" class="main-content">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <!-- 预算明细 -->
        <a-tab-pane key="budget" tab="预算明细">
          <a-table 
            :columns="budgetColumns" 
            :data-source="budgetDetails" 
            :pagination="false"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'executionRate'">
                <a-progress 
                  :percent="record.executionRate" 
                  size="small" 
                  :stroke-color="getProgressColor(record.executionRate)"
                />
              </template>
              <template v-else-if="column.key === 'budgetAmount'">
                ¥{{ formatMoney(record.budgetAmount) }}
              </template>
              <template v-else-if="column.key === 'usedAmount'">
                ¥{{ formatMoney(record.usedAmount) }}
              </template>
              <template v-else-if="column.key === 'remainingAmount'">
                ¥{{ formatMoney(record.remainingAmount) }}
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 经费填报 -->
        <a-tab-pane key="report" tab="经费填报">
          <div class="report-section">
            <div style="margin-bottom: 16px;">
              <a-space>
                <a-button type="primary" @click="showAddModal">
                  <PlusOutlined /> 手动填报
                </a-button>
                <a-button type="default" @click="showSmartModal" style="border-color: #52c41a; color: #52c41a;">
                  <ScanOutlined /> 智能凭证填报
                </a-button>
              </a-space>
            </div>
            
            <a-table 
              :columns="reportColumns" 
              :data-source="reportRecords" 
              :pagination="{ pageSize: 10 }"
              bordered
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'description'">
                  <div>
                    {{ record.description }}
                    <a-tag v-if="record.isSmartFilled" color="green" size="small" style="margin-left: 8px;">
                      <ScanOutlined /> 智能填报
                    </a-tag>
                  </div>
                </template>
                <template v-else-if="column.key === 'amount'">
                  ¥{{ formatMoney(record.amount) }}
                </template>
                <template v-else-if="column.key === 'actions'">
                  <a-button 
                    type="link" 
                    size="small" 
                    @click="editRecord(record)"
                  >
                    编辑
                  </a-button>
                  <a-button 
                    type="link" 
                    size="small" 
                    danger 
                    @click="deleteRecord(record)"
                  >
                    删除
                  </a-button>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 使用记录 -->
        <a-tab-pane key="records" tab="使用记录">
          <a-table 
            :columns="recordColumns" 
            :data-source="allRecords" 
            :pagination="{ pageSize: 15 }"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'amount'">
                ¥{{ formatMoney(record.amount) }}
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 执行分析 -->
        <a-tab-pane key="analysis" tab="执行分析">
          <div class="analysis-section">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="月度使用趋势" size="small">
                  <div class="chart-container">
                    图表加载中...
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="科目分布" size="small">
                  <div class="chart-container">
                    图表加载中...
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 智能凭证填报弹窗 -->
    <a-modal
      v-model:open="smartModalVisible"
      title="智能凭证填报"
      width="700px"
      :footer="null"
      @cancel="handleSmartCancel"
    >
      <div class="smart-upload-container">
        <!-- 步骤指示器 -->
        <a-steps :current="smartStep" style="margin-bottom: 24px;">
          <a-step title="上传凭证" />
          <a-step title="智能识别" />
          <a-step title="确认信息" />
        </a-steps>

        <!-- 步骤1：上传凭证 -->
        <div v-if="smartStep === 0" class="upload-step">
          <a-alert 
            message="凭证要求" 
            type="info" 
            show-icon 
            style="margin-bottom: 16px;"
          >
            <template #description>
              <div class="voucher-requirements">
                <p><strong>请确保凭证图片包含以下信息：</strong></p>
                <ul>
                  <li>📅 <strong>消费日期</strong>：明确的交易时间</li>
                  <li>💰 <strong>消费金额</strong>：清晰的数字金额</li>
                  <li>🏪 <strong>商家信息</strong>：商户名称或经营范围</li>
                  <li>📝 <strong>消费项目</strong>：具体的商品或服务名称</li>
                  <li>🧾 <strong>发票类型</strong>：增值税发票、收据等</li>
                </ul>
                <p class="tip">💡 <em>支持发票、收据、购物小票等各类消费凭证</em></p>
              </div>
            </template>
          </a-alert>

          <a-upload-dragger
            v-model:file-list="smartFileList"
            :before-upload="beforeSmartUpload"
            accept="image/*"
            :max-count="1"
            @change="handleSmartUploadChange"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽凭证图片到此区域上传</p>
            <p class="ant-upload-hint">
              支持 JPG、PNG、JPEG 格式，文件大小不超过 10MB
            </p>
          </a-upload-dragger>

          <div style="margin-top: 16px; text-align: right;">
            <a-button 
              type="primary" 
              @click="startRecognition" 
              :disabled="smartFileList.length === 0"
              :loading="recognizing"
            >
              <ScanOutlined /> 开始识别
            </a-button>
          </div>
        </div>

        <!-- 步骤2：智能识别 -->
        <div v-if="smartStep === 1" class="recognition-step">
          <div class="recognition-content">
            <a-spin :spinning="recognizing" tip="正在智能识别凭证信息...">
              <div class="preview-container">
                <div class="image-preview">
                  <img v-if="previewImage" :src="previewImage" alt="凭证预览" />
                </div>
                <div class="recognition-progress">
                  <a-progress 
                    :percent="recognitionProgress" 
                    :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }"
                  />
                  <p class="progress-text">{{ recognitionText }}</p>
                </div>
              </div>
            </a-spin>
          </div>
        </div>

        <!-- 步骤3：确认信息 -->
        <div v-if="smartStep === 2" class="confirm-step">
          <a-alert 
            message="请仔细核对识别结果" 
            type="warning" 
            show-icon 
            style="margin-bottom: 16px;"
            description="系统已自动识别凭证信息，请核对准确性并进行必要的修正。"
          />

          <a-row :gutter="16">
            <a-col :span="10">
              <div class="image-preview-small">
                <img v-if="previewImage" :src="previewImage" alt="凭证预览" />
              </div>
            </a-col>
            <a-col :span="14">
              <a-form :model="recognizedData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="识别状态">
                  <a-tag :color="recognitionResult.success ? 'green' : 'red'">
                    {{ recognitionResult.success ? '识别成功' : '识别失败' }}
                  </a-tag>
                  <span v-if="recognitionResult.confidence" style="margin-left: 8px;">
                    置信度: {{ recognitionResult.confidence }}%
                  </span>
                </a-form-item>
                
                <a-form-item label="消费日期" required>
                  <a-date-picker 
                    v-model:value="recognizedData.date" 
                    style="width: 100%;" 
                    :status="recognizedData.date ? '' : 'warning'"
                  />
                  <div v-if="!recognizedData.date" class="field-warning">
                    ⚠️ 未能识别到日期，请手动选择
                  </div>
                </a-form-item>

                <a-form-item label="预算科目" required>
                  <a-select 
                    v-model:value="recognizedData.categoryId" 
                    placeholder="请选择或确认科目"
                    :status="recognizedData.categoryId ? '' : 'warning'"
                  >
                    <a-select-option v-for="category in budgetCategories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </a-select-option>
                  </a-select>
                  <div v-if="recognizedData.suggestedCategory" class="ai-suggestion">
                    💡 AI建议: {{ recognizedData.suggestedCategory }}
                  </div>
                </a-form-item>

                <a-form-item label="消费金额" required>
                  <a-input-number 
                    v-model:value="recognizedData.amount" 
                    :min="0" 
                    :precision="2"
                    style="width: 100%;"
                    placeholder="请确认金额"
                    :status="recognizedData.amount ? '' : 'warning'"
                  />
                  <div v-if="!recognizedData.amount" class="field-warning">
                    ⚠️ 未能识别到金额，请手动输入
                  </div>
                </a-form-item>

                <a-form-item label="用途说明" required>
                  <a-textarea 
                    v-model:value="recognizedData.description" 
                    :rows="3"
                    placeholder="请确认或补充用途说明"
                    :status="recognizedData.description ? '' : 'warning'"
                  />
                  <div v-if="recognizedData.merchantInfo" class="ai-info">
                    🏪 识别商家: {{ recognizedData.merchantInfo }}
                  </div>
                </a-form-item>
              </a-form>
            </a-col>
          </a-row>

          <div style="margin-top: 24px; text-align: right;">
            <a-space>
              <a-button @click="resetSmart">重新上传</a-button>
              <a-button type="primary" @click="confirmSmartData" :disabled="!isSmartDataValid">
                确认提交
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 添加/编辑经费记录弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingRecord ? '编辑经费使用记录' : '手动填报经费记录'"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="使用日期" required>
          <a-date-picker v-model:value="formData.date" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="预算科目" required>
          <a-select v-model:value="formData.categoryId" placeholder="请选择科目">
            <a-select-option v-for="category in budgetCategories" :key="category.id" :value="category.id">
              {{ category.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="使用金额" required>
          <a-input-number 
            v-model:value="formData.amount" 
            :min="0" 
            :precision="2"
            style="width: 100%;"
            placeholder="请输入金额"
          />
        </a-form-item>
        <a-form-item label="用途说明" required>
          <a-textarea 
            v-model:value="formData.description" 
            :rows="3"
            placeholder="请详细说明经费使用用途"
          />
        </a-form-item>
        <a-form-item label="发票附件">
          <a-upload
            v-model:file-list="formData.fileList"
            :before-upload="beforeUpload"
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <a-button>
              <UploadOutlined /> 选择文件
            </a-button>
          </a-upload>
          <div style="margin-top: 8px; color: #666; font-size: 12px;">
            支持格式：PDF、JPG、PNG，文件大小不超过5MB
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  DollarOutlined, 
  UserOutlined, 
  PlusOutlined, 
  UploadOutlined,
  CrownOutlined,
  ScanOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// 接收props
const props = defineProps({
  userPermissions: {
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['switch-role'])

// 计算是否可以切换到管理角色
const canSwitchToManager = computed(() => {
  return props.userPermissions.roles && props.userPermissions.roles.includes('manager')
})

// 切换到管理角色
const switchToManager = () => {
  emit('switch-role', 'manager')
}

// 智能填报数据验证
const isSmartDataValid = computed(() => {
  return recognizedData.value.date && 
         recognizedData.value.categoryId && 
         recognizedData.value.amount && 
         recognizedData.value.description
})

// 数据状态
const activeTab = ref('budget')
const selectedProject = ref('')
const modalVisible = ref(false)
const editingRecord = ref(null)

// 智能填报相关状态
const smartModalVisible = ref(false)
const smartStep = ref(0)
const smartFileList = ref([])
const recognizing = ref(false)
const recognitionProgress = ref(0)
const recognitionText = ref('')
const previewImage = ref('')
const recognizedData = ref({
  date: null,
  categoryId: '',
  amount: null,
  description: '',
  suggestedCategory: '',
  merchantInfo: ''
})
const recognitionResult = ref({
  success: false,
  confidence: 0
})

// 项目数据
const projects = ref([
  { 
    id: 'P001', 
    name: 'XXX科研项目', 
    totalBudget: 500000, 
    usedAmount: 320000,
    remainingAmount: 180000
  },
  { 
    id: 'P002', 
    name: 'YYY技术研发项目', 
    totalBudget: 800000, 
    usedAmount: 480000,
    remainingAmount: 320000
  }
])

const currentProject = computed(() => {
  return projects.value.find(p => p.id === selectedProject.value)
})

const executionRate = computed(() => {
  if (!currentProject.value) return 0
  return Math.round((currentProject.value.usedAmount / currentProject.value.totalBudget) * 100)
})

const progressColor = computed(() => {
  const rate = executionRate.value
  if (rate >= 95) return '#ff4d4f'
  if (rate >= 90) return '#fa8c16'
  if (rate >= 70) return '#52c41a'
  return '#1890ff'
})

// 预算科目数据
const budgetCategories = ref([
  { id: 'equipment', name: '设备费' },
  { id: 'material', name: '材料费' },
  { id: 'personnel', name: '人员费' },
  { id: 'other', name: '其他费用' }
])

const budgetDetails = ref([
  { 
    id: 1, 
    category: '设备费', 
    budgetAmount: 200000, 
    usedAmount: 120000, 
    remainingAmount: 80000, 
    executionRate: 60 
  },
  { 
    id: 2, 
    category: '材料费', 
    budgetAmount: 150000, 
    usedAmount: 100000, 
    remainingAmount: 50000, 
    executionRate: 67 
  },
  { 
    id: 3, 
    category: '人员费', 
    budgetAmount: 100000, 
    usedAmount: 80000, 
    remainingAmount: 20000, 
    executionRate: 80 
  },
  { 
    id: 4, 
    category: '其他费用', 
    budgetAmount: 50000, 
    usedAmount: 20000, 
    remainingAmount: 30000, 
    executionRate: 40 
  }
])

// 填报记录数据
const reportRecords = ref([
  {
    id: 1,
    date: '2024-01-15',
    category: '设备费',
    amount: 15000,
    description: '购买实验设备XXX',
    submitter: '张三'
  },
  {
    id: 2,
    date: '2024-01-10',
    category: '材料费',
    amount: 8000,
    description: '采购实验材料',
    submitter: '张三'
  }
])

const allRecords = ref([
  ...reportRecords.value,
  {
    id: 3,
    date: '2024-01-05',
    category: '人员费',
    amount: 12000,
    description: '研究人员劳务费',
    submitter: '李四'
  }
])

// 表单数据
const formData = ref({
  date: null,
  categoryId: '',
  amount: null,
  description: '',
  fileList: []
})

// 表格列定义
const budgetColumns = [
  { title: '预算科目', dataIndex: 'category', key: 'category' },
  { title: '预算金额', dataIndex: 'budgetAmount', key: 'budgetAmount' },
  { title: '已使用', dataIndex: 'usedAmount', key: 'usedAmount' },
  { title: '剩余', dataIndex: 'remainingAmount', key: 'remainingAmount' },
  { title: '执行率', dataIndex: 'executionRate', key: 'executionRate' }
]

const reportColumns = [
  { title: '使用日期', dataIndex: 'date', key: 'date' },
  { title: '科目', dataIndex: 'category', key: 'category' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '用途说明', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'actions' }
]

const recordColumns = [
  { title: '使用日期', dataIndex: 'date', key: 'date' },
  { title: '科目', dataIndex: 'category', key: 'category' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '用途说明', dataIndex: 'description', key: 'description' },
  { title: '填报人', dataIndex: 'submitter', key: 'submitter' }
]

// 方法
const formatMoney = (amount) => {
  return amount.toLocaleString()
}

const getProgressColor = (rate) => {
  if (rate >= 95) return '#ff4d4f'
  if (rate >= 90) return '#fa8c16'
  if (rate >= 70) return '#52c41a'
  return '#1890ff'
}


const handleProjectChange = (projectId) => {
  console.log('选择项目:', projectId)
}

const showAddModal = () => {
  editingRecord.value = null
  formData.value = {
    date: null,
    categoryId: '',
    amount: null,
    description: '',
    fileList: []
  }
  modalVisible.value = true
}

const editRecord = (record) => {
  editingRecord.value = record
  formData.value = {
    date: dayjs(record.date),
    categoryId: budgetCategories.value.find(c => c.name === record.category)?.id || '',
    amount: record.amount,
    description: record.description,
    fileList: []
  }
  modalVisible.value = true
}

const deleteRecord = (record) => {
  const index = reportRecords.value.findIndex(r => r.id === record.id)
  if (index > -1) {
    reportRecords.value.splice(index, 1)
    message.success('删除成功')
  }
}

const handleSubmit = () => {
  if (!formData.value.date || !formData.value.categoryId || !formData.value.amount || !formData.value.description) {
    message.error('请填写完整信息')
    return
  }

  const categoryName = budgetCategories.value.find(c => c.id === formData.value.categoryId)?.name || ''
  
  if (editingRecord.value) {
    const index = reportRecords.value.findIndex(r => r.id === editingRecord.value.id)
    if (index > -1) {
      reportRecords.value[index] = {
        ...reportRecords.value[index],
        date: formData.value.date.format('YYYY-MM-DD'),
        category: categoryName,
        amount: formData.value.amount,
        description: formData.value.description
      }
    }
    message.success('修改成功')
  } else {
    const newRecord = {
      id: Date.now(),
      date: formData.value.date.format('YYYY-MM-DD'),
      category: categoryName,
      amount: formData.value.amount,
      description: formData.value.description,
      submitter: '张三'
    }
    reportRecords.value.unshift(newRecord)
    message.success('提交成功')
  }
  
  modalVisible.value = false
}

const handleCancel = () => {
  modalVisible.value = false
}

const beforeUpload = (file) => {
  const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
  if (!isValidType) {
    message.error('只能上传PDF、JPG、PNG格式的文件')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('文件大小不能超过5MB')
    return false
  }
  return false
}

// 智能填报相关方法
const showSmartModal = () => {
  smartModalVisible.value = true
  smartStep.value = 0
  resetSmartData()
}

const handleSmartCancel = () => {
  smartModalVisible.value = false
  resetSmartData()
}

const resetSmartData = () => {
  smartStep.value = 0
  smartFileList.value = []
  recognizing.value = false
  recognitionProgress.value = 0
  recognitionText.value = ''
  previewImage.value = ''
  recognizedData.value = {
    date: null,
    categoryId: '',
    amount: null,
    description: '',
    suggestedCategory: '',
    merchantInfo: ''
  }
  recognitionResult.value = {
    success: false,
    confidence: 0
  }
}

const beforeSmartUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片格式的文件')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('图片大小不能超过10MB')
    return false
  }
  return false
}

const handleSmartUploadChange = (info) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    // 生成预览图片
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(info.file.originFileObj || info.file)
  }
}

const startRecognition = async () => {
  if (smartFileList.value.length === 0) {
    message.error('请先上传凭证图片')
    return
  }

  recognizing.value = true
  smartStep.value = 1
  recognitionProgress.value = 0
  
  // 模拟识别过程
  const steps = [
    { progress: 20, text: '正在预处理图片...' },
    { progress: 40, text: '正在识别文字信息...' },
    { progress: 60, text: '正在提取关键数据...' },
    { progress: 80, text: '正在智能分析内容...' },
    { progress: 100, text: '识别完成！' }
  ]

  for (let step of steps) {
    await new Promise(resolve => setTimeout(resolve, 800))
    recognitionProgress.value = step.progress
    recognitionText.value = step.text
  }

  // 模拟识别结果
  await simulateRecognition()
  
  recognizing.value = false
  smartStep.value = 2
}

const simulateRecognition = async () => {
  // 模拟AI识别结果
  const mockResults = [
    {
      success: true,
      confidence: 92,
      date: dayjs('2024-01-15'),
      amount: 2500.00,
      description: '购买实验设备 - 数字万用表',
      suggestedCategory: '设备费',
      categoryId: 'equipment',
      merchantInfo: '北京科技器材有限公司'
    },
    {
      success: true,
      confidence: 88,
      date: dayjs('2024-01-12'),
      amount: 850.00,
      description: '采购实验材料 - 化学试剂',
      suggestedCategory: '材料费',
      categoryId: 'material',
      merchantInfo: '上海化工材料商城'
    },
    {
      success: true,
      confidence: 95,
      date: dayjs('2024-01-10'),
      amount: 1200.00,
      description: '研究人员交通费报销',
      suggestedCategory: '其他费用',
      categoryId: 'other',
      merchantInfo: '滴滴出行'
    }
  ]

  // 随机选择一个结果
  const result = mockResults[Math.floor(Math.random() * mockResults.length)]
  
  recognitionResult.value = {
    success: result.success,
    confidence: result.confidence
  }
  
  recognizedData.value = {
    date: result.date,
    categoryId: result.categoryId,
    amount: result.amount,
    description: result.description,
    suggestedCategory: result.suggestedCategory,
    merchantInfo: result.merchantInfo
  }

  message.success(`识别成功！置信度: ${result.confidence}%`)
}

const resetSmart = () => {
  resetSmartData()
  smartModalVisible.value = true
}

const confirmSmartData = () => {
  if (!isSmartDataValid.value) {
    message.error('请完善必填信息')
    return
  }

  const categoryName = budgetCategories.value.find(c => c.id === recognizedData.value.categoryId)?.name || ''
  
  const newRecord = {
    id: Date.now(),
    date: recognizedData.value.date.format('YYYY-MM-DD'),
    category: categoryName,
    amount: recognizedData.value.amount,
    description: recognizedData.value.description,
    submitter: '张三',
    isSmartFilled: true // 标记为智能填报
  }
  
  reportRecords.value.unshift(newRecord)
  smartModalVisible.value = false
  message.success('智能填报成功！')
  
  // 重置数据
  resetSmartData()
}

onMounted(() => {
  selectedProject.value = 'P001'
})
</script>

<style scoped>
.budget-reporter-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: #234fa2;
  margin: 0;
}

.project-info-card {
  margin-bottom: 24px;
}

.project-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.value {
  font-weight: 600;
}

.budget-amount {
  color: #1890ff;
  font-size: 18px;
}

.used-amount {
  color: #52c41a;
}

.remaining-amount {
  color: #fa8c16;
}

.main-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.report-section {
  padding: 16px;
}

.analysis-section {
  padding: 16px;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #666;
}

.switch-role-btn {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 智能填报样式 */
.smart-upload-container {
  .voucher-requirements {
    ul {
      margin: 8px 0;
      padding-left: 20px;
      
      li {
        margin: 6px 0;
        line-height: 1.6;
      }
    }
    
    .tip {
      margin-top: 12px;
      font-style: italic;
      color: #666;
    }
  }
  
  .preview-container {
    text-align: center;
    padding: 20px;
    
    .image-preview {
      margin-bottom: 20px;
      
      img {
        max-width: 100%;
        max-height: 300px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    .recognition-progress {
      .progress-text {
        margin-top: 8px;
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .image-preview-small {
    img {
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .field-warning {
    color: #faad14;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .ai-suggestion {
    color: #52c41a;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .ai-info {
    color: #1890ff;
    font-size: 12px;
    margin-top: 4px;
  }
}
</style> 