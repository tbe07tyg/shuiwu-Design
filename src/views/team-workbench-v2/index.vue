<!--
 * @file 团队成员工作台v2页面
 * @description 简化的待办事项列表，支持格式化提报和审查意见查看
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="team-workbench-v2">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>团队成员工作台 v2.0</h2>
      <p>我的待办事项管理，支持格式化提报和进度更新</p>
    </div>

    <!-- 待办事项列表 -->
    <a-card title="我的待办事项" :bordered="false" class="todo-card">
      <!-- 筛选器 -->
      <div class="todo-filters">
        <a-space>
          <a-segmented
            v-model:value="sourceMode"
            :options="[
              { label: '示例数据', value: 'demo' },
              { label: '任务策划(v3)', value: 'planning' }
            ]"
          />
          <a-select v-if="sourceMode==='planning'" v-model:value="currentMember" style="width: 160px" placeholder="选择成员(可选)">
            <a-select-option :value="''">全部成员</a-select-option>
            <a-select-option v-for="m in planningMembers" :key="m" :value="m">{{ memberNameMap[m] || m }}</a-select-option>
          </a-select>
          <a-select v-model:value="statusFilter" style="width: 120px">
            <a-select-option value="all">全部状态</a-select-option>
            <a-select-option value="pending">待办</a-select-option>
            <a-select-option value="in_progress">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="revision_required">需要重新提报</a-select-option>
          </a-select>
          <a-input-search 
            v-model:value="searchKeyword" 
            placeholder="搜索任务"
            style="width: 200px"
          />
        </a-space>
      </div>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedRowKeys.length > 0" class="batch-actions" style="margin-bottom: 16px;">
        <a-alert 
          :message="`已选择 ${selectedRowKeys.length} 个任务`" 
          type="info" 
          show-icon 
          style="margin-bottom: 8px;"
        />
        <a-space>
          <a-button size="small" @click="batchUpdateStatus('in_progress')">批量标记为进行中</a-button>
          <a-button size="small" @click="batchUpdateStatus('completed')">批量标记为已完成</a-button>
          <a-button size="small" @click="clearSelection">取消选择</a-button>
        </a-space>
      </div>

      <!-- 待办事项表格 -->
      <a-table 
        :dataSource="filteredTodos" 
        :columns="columns"
        rowKey="id"
        :pagination="{ pageSize: 10 }"
        size="middle"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      >
        <!-- 自定义单元格渲染 -->
        <template #bodyCell="{ column, record }">
          <!-- 任务标题 -->
          <template v-if="column.key === 'title'">
            <div class="task-title-cell">
              <h4>{{ record?.title || '未知任务' }}</h4>
              <p class="task-description">{{ record?.description || '' }}</p>
              <div class="task-meta">
                <a-space size="small">
                  <span class="meta-item">
                    <CalendarOutlined />
                    截止：{{ record?.deadline || '未设置' }}
                  </span>
                  <span class="meta-item">
                    <ClockCircleOutlined />
                    预计：{{ record?.estimatedHours || 0 }}小时
                  </span>
                </a-space>
              </div>
            </div>
          </template>

          <!-- 状态 -->
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record?.status || 'pending')">
              {{ getStatusText(record?.status || 'pending') }}
            </a-tag>
          </template>

          <!-- 操作 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button 
                size="small" 
                type="primary" 
                @click="handleSubmitReport(record)"
                :disabled="record?.status === 'completed'"
              >
                提报
              </a-button>
              <a-button 
                size="small" 
                @click="handleUpdateProgress(record)"
                :disabled="record?.status === 'completed'"
              >
                更新进度
              </a-button>
              <a-button 
                size="small" 
                @click="handleViewHistory(record)"
                v-if="record?.hasReviewHistory"
              >
                历史审查意见
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 格式化提报弹窗（支持模板驱动 in planning 模式） -->
    <a-modal
      v-model:open="reportModalVisible"
      title="任务提报"
      width="800px"
      :footer="null"
    >
      <div v-if="currentTodo" class="report-form">
        <!-- 任务信息 -->
        <div class="task-info-section">
          <a-alert
            :message="`正在提报：${currentTodo.title}`"
            type="info"
            show-icon
            style="margin-bottom: 20px"
          />
          <a-alert
            v-if="activeReportTemplate"
            :message="`模板：${activeReportTemplate.title || activeReportTemplate.name || '未命名模板'}`"
            type="success"
            show-icon
            style="margin-bottom: 12px"
          />
        </div>

        <!-- 模板驱动的格式化提报表单（planning 模式） -->
        <a-form v-if="activeReportTemplate" layout="vertical">
          <a-form-item
            v-for="(sec, idx) in reportForm.sections"
            :key="idx"
            :label="sec.title"
            :required="sec.required"
          >
            <a-textarea
              v-model:value="sec.value"
              :rows="3"
              show-count
              :maxlength="500"
              :placeholder="`请填写：${sec.title}`"
            />
          </a-form-item>

          <a-form-item label="📎 附件上传" :required="!!reportForm.requireAttachment">
            <a-upload
              v-model:file-list="reportForm.attachments"
              :before-upload="() => false"
              multiple
            >
              <a-button>
                <UploadOutlined />
                选择文件
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form>

        <!-- 旧版样例表单（demo 模式回退） -->
        <a-form v-else layout="vertical">
          <a-form-item label="🔍 发现结论" required>
            <a-textarea v-model:value="reportForm.findings" placeholder="请描述本阶段的主要发现和结论..." :rows="3" show-count :maxlength="300" />
          </a-form-item>
          <a-form-item label="📝 详细描述" required>
            <a-textarea v-model:value="reportForm.details" placeholder="请详细描述工作内容、实施过程、技术方案等..." :rows="4" show-count :maxlength="500" />
          </a-form-item>
          <a-form-item label="🔗 发现来源" required>
            <a-textarea v-model:value="reportForm.sources" placeholder="请说明发现的来源、依据、参考资料等..." :rows="3" show-count :maxlength="300" />
          </a-form-item>
          <a-form-item label="📋 下一步计划" required>
            <a-textarea v-model:value="reportForm.nextSteps" placeholder="请描述下一阶段的工作计划和时间安排..." :rows="3" show-count :maxlength="300" />
          </a-form-item>
          <a-form-item label="⚠️ 遇到的困难">
            <a-textarea v-model:value="reportForm.difficulties" placeholder="请描述遇到的问题、困难和需要的支持..." :rows="3" show-count :maxlength="300" />
          </a-form-item>
          <a-form-item label="📎 附件上传">
            <a-upload v-model:file-list="reportForm.attachments" :before-upload="() => false" multiple>
              <a-button>
                <UploadOutlined />
                选择文件
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form>

        <!-- 操作按钮 -->
        <div class="report-actions">
          <a-space>
            <a-button 
              type="primary" 
              @click="handleSubmitReportForm"
              :disabled="!isReportFormValid"
            >
              <CheckOutlined />
              提交提报
            </a-button>
            <a-button @click="reportModalVisible = false">
              取消
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 进度更新弹窗 -->
    <a-modal
      v-model:open="progressModalVisible"
      title="更新进度"
      width="500px"
      :footer="null"
    >
      <div v-if="currentTodo" class="progress-form">
        <a-form layout="vertical">
          <a-form-item label="任务进度">
            <a-slider
              v-model:value="progressForm.progress"
              :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
              :tooltip-formatter="(value) => `${value}%`"
            />
          </a-form-item>

          <a-form-item label="状态更新">
            <a-select v-model:value="progressForm.status" style="width: 100%">
              <a-select-option value="pending">待办</a-select-option>
              <a-select-option value="in_progress">进行中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="进度说明">
            <a-textarea
              v-model:value="progressForm.notes"
              placeholder="请简要说明进度变更的原因..."
              :rows="3"
            />
          </a-form-item>
        </a-form>

        <div class="progress-actions">
          <a-space>
            <a-button type="primary" @click="handleUpdateProgressForm">
              <CheckOutlined />
              更新进度
            </a-button>
            <a-button @click="progressModalVisible = false">
              取消
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 历史审查意见弹窗（增强版：显示对应提交内容） -->
    <a-modal
      v-model:open="historyModalVisible"
      title="历史审查意见与提交记录"
      width="900px"
      :footer="null"
    >
      <div v-if="currentTodo" class="history-content">
        <div class="history-timeline">
          <div 
            v-for="(review, index) in enhancedReviewHistory" 
            :key="review.id"
            class="timeline-item"
          >
            <!-- 提交版本信息 -->
            <div class="submission-version">
              <div class="version-header">
                <div class="version-info">
                  <a-tag color="blue">📝 {{ review.submissionVersion }}</a-tag>
                  <span class="submission-time">{{ review.submissionTime }}</span>
                  <span class="version-note">{{ review.versionNote }}</span>
                </div>
                <a-button 
                  type="link" 
                  size="small"
                  @click="toggleSubmissionContent(index)"
                >
                  {{ review.showSubmissionContent ? '收起内容' : '查看提交内容' }}
                </a-button>
              </div>
              
              <!-- 可折叠的提交内容 -->
              <div v-if="review.showSubmissionContent" class="submission-content">
                <div class="content-section">
                  <h6>🔍 主要内容：</h6>
                  <p class="content-text">{{ review.submissionContent?.summary || '数据库设计优化方案v2.0，包含表结构设计、索引策略、性能优化建议等内容。' }}</p>
                </div>
                
                <div v-if="review.submissionContent?.keyPoints" class="content-section">
                  <h6>✨ 关键要点：</h6>
                  <ul class="key-points-list">
                    <li v-for="point in review.submissionContent.keyPoints" :key="point">{{ point }}</li>
                  </ul>
                </div>
                
                <div v-if="review.submissionContent?.attachments" class="content-section">
                  <h6>📎 提交附件：</h6>
                  <div class="attachment-tags">
                    <a-tag v-for="file in review.submissionContent.attachments" :key="file" color="geekblue">{{ file }}</a-tag>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 审查意见 -->
            <div class="review-section">
              <div class="review-header">
                <div class="reviewer-info">
                  <a-avatar size="small">{{ review.reviewer.charAt(0) }}</a-avatar>
                  <div class="reviewer-details">
                    <span class="reviewer-name">{{ review.reviewer }}</span>
                    <span class="review-time">{{ review.reviewTime }}</span>
                  </div>
                </div>
                <a-tag :color="review.action === 'approve' ? 'green' : 'orange'">
                  {{ review.action === 'approve' ? '✅ 通过' : '❌ 要求修改' }}
                </a-tag>
              </div>
              
              <div class="review-content">
                <div class="review-opinion">
                  <strong>审查意见：</strong>
                  <p>{{ review.opinion }}</p>
                </div>
                <div v-if="review.suggestions" class="review-suggestions">
                  <strong>{{ review.action === 'approve' ? '改进建议：' : '修改建议：' }}</strong>
                  <p>{{ review.suggestions }}</p>
                </div>
              </div>
            </div>
            
            <!-- 连接线（除最后一个） -->
            <div v-if="index < enhancedReviewHistory.length - 1" class="timeline-connector"></div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { usePlanningStore } from '@/store/planning'
import { useTeamMembersStore } from '@/stores/teamMembers'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const statusFilter = ref('all')
const searchKeyword = ref('')
const sourceMode = ref('demo') // demo | planning
const reportModalVisible = ref(false)
const progressModalVisible = ref(false)
const historyModalVisible = ref(false)
const currentTodo = ref(null)
// 当前任务对应的“活动提报模板”（planning 模式从 store 获取），用于驱动弹窗表单
const activeReportTemplate = ref(null)

// 表单数据
// 统一的提报表单数据结构：
// planning 模式：{ sections:[{title,required,value}], requireAttachment:boolean, attachments:UploadFile[] }
// demo 模式回退：保留旧字段
const reportForm = ref({ sections: [], requireAttachment: false, attachments: [], findings: '', details: '', sources: '', nextSteps: '', difficulties: '' })

const progressForm = ref({
  progress: 0,
  status: 'pending',
  notes: ''
})

// 模拟待办事项数据
const todos = ref([
  {
    id: 'T001',
    title: '系统架构设计',
    description: '设计系统整体架构，包括前端、后端、数据库等组件',
    status: 'in_progress',
    deadline: '2025-08-25',
    estimatedHours: 40,
    progress: 60,
    hasReviewHistory: true
  },
  {
    id: 'T002',
    title: '前端界面开发',
    description: '开发用户界面，实现响应式设计和用户交互功能',
    status: 'pending',
    deadline: '2025-08-30',
    estimatedHours: 60,
    progress: 0,
    hasReviewHistory: false
  },
  {
    id: 'T003',
    title: '数据库设计优化',
    description: '优化数据库表结构，提升查询性能',
    status: 'revision_required',
    deadline: '2025-08-28',
    estimatedHours: 30,
    progress: 80,
    hasReviewHistory: true
  },
  {
    id: 'T004',
    title: '测试用例编写',
    description: '编写单元测试和集成测试用例',
    status: 'completed',
    deadline: '2025-08-22',
    estimatedHours: 20,
    progress: 100,
    hasReviewHistory: true
  },
  {
    id: 'T005',
    title: 'API接口设计',
    description: '设计RESTful API接口，定义数据格式和交互规范',
    status: 'pending',
    deadline: '2025-08-26',
    estimatedHours: 25,
    progress: 0,
    hasReviewHistory: false
  }
])

// 读取任务策划(v3)的分配，映射为当前页的只读任务视图
const planning = usePlanningStore()
const membersStore = useTeamMembersStore()
const currentUserName = '张三(演示账号)'
const currentMember = ref('')

// 批量操作相关
const selectedRowKeys = ref([])
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}
const clearSelection = () => {
  selectedRowKeys.value = []
}
const batchUpdateStatus = (newStatus) => {
  if (sourceMode.value === 'demo') {
    // demo模式：直接更新本地数据
    selectedRowKeys.value.forEach(id => {
      const todo = todos.value.find(t => t.id === id)
      if (todo) {
        todo.status = newStatus
        if (newStatus === 'completed') todo.progress = 100
      }
    })
    message.success(`已批量更新 ${selectedRowKeys.value.length} 个任务状态`)
  } else {
    // planning模式：这里可以扩展为调用store方法或API
    message.info('planning模式下的批量操作功能待实现')
  }
  clearSelection()
}
// 成员显示名映射（id -> 姓名）
const memberNameMap = computed(() => {
  const map = {}
  ;(membersStore.activeMembers || []).forEach(m => { map[m.id] = m.name })
  return map
})
// 下拉成员列表使用分配中的成员ID去重，展示姓名
const planningMembers = computed(() => {
  const set = new Set()
  ;(planning.assignments || []).forEach(a => {
    if (a.memberId) set.add(a.memberId)
    else if (a.memberName) set.add(a.memberName)
  })
  return Array.from(set)
})
const planningTodos = computed(() => {
  try {
    const assigned = planning.assignments || []
    const visibleTaskIds = new Set(
      assigned
        .filter(a => {
          if (!currentMember.value) return true
          return a.memberName === currentMember.value || a.memberId === currentMember.value
        })
        .map(a => a.taskId)
    )
    return (planning.tasks || [])
      .filter(t => visibleTaskIds.has(t.id))
      .map(t => ({
        id: t.id,
        title: t.name,
        description: t.description || '',
        status: 'in_progress',
        deadline: t.dueDate || t.endDate || '',
        estimatedHours: t.estimate || 0,
        progress: 0,
        hasReviewHistory: false
      }))
  } catch (e) { return [] }
})

// 增强版审查历史数据（包含对应的提交内容）
const mockEnhancedReviewHistory = ref([
  {
    id: 'R001',
    // 审查信息
    reviewer: '项目负责人',
    reviewTime: '2025-08-21 14:30',
    action: 'reject',
    opinion: '数据库设计方案需要进一步完善，缺少关键的性能优化考虑。',
    suggestions: '1. 补充索引设计方案；2. 增加分区策略；3. 考虑读写分离架构。',
    // 对应的提交版本信息
    submissionVersion: 'v2.0',
    submissionTime: '2025-08-21 10:00',
    versionNote: '根据初次反馈修改的版本',
    showSubmissionContent: false,
    submissionContent: {
      summary: '数据库设计优化方案v2.0，完善了表结构设计，增加了基础索引策略，但性能优化部分仍需完善。',
      keyPoints: [
        '重新设计了用户表和订单表的关系',
        '添加了常用查询的复合索引',
        '优化了部分查询语句的执行计划',
        '初步考虑了分表策略'
      ],
      attachments: ['数据库设计文档v2.0.docx', 'ER图v2.png', '基础索引策略.xlsx']
    }
  },
  {
    id: 'R002',
    // 审查信息
    reviewer: '技术专家',
    reviewTime: '2025-08-20 16:45',
    action: 'approve',
    opinion: '初步设计方案合理，技术路线清晰。',
    suggestions: '建议在下一阶段加强性能测试验证。',
    // 对应的提交版本信息
    submissionVersion: 'v1.0',
    submissionTime: '2025-08-20 14:00',
    versionNote: '初始版本提交',
    showSubmissionContent: false,
    submissionContent: {
      summary: '数据库设计初版方案，包含基础的表结构设计和简单的数据关系建模。',
      keyPoints: [
        '完成了核心业务表的结构设计',
        '建立了基本的外键关系',
        '设计了用户权限相关的表结构',
        '提供了初步的数据字典'
      ],
      attachments: ['数据库设计文档v1.0.docx', 'ER图初版.png']
    }
  }
])

// 增强版历史记录计算属性
const enhancedReviewHistory = computed(() => {
  return mockEnhancedReviewHistory.value.map(review => ({
    ...review,
    showSubmissionContent: review.showSubmissionContent || false
  }))
})

// 表格列定义
const columns = [
  {
    title: '任务信息',
    key: 'title',
    width: '40%'
  },
  {
    title: '状态',
    key: 'status',
    width: '15%'
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: '15%',
    customRender: ({ text }) => `${text}%`
  },
  {
    title: '操作',
    key: 'action',
    width: '30%'
  }
]

// 计算属性
const filteredTodos = computed(() => {
  const base = sourceMode.value === 'planning' ? planningTodos.value : todos.value
  let filtered = base
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(todo => todo.status === statusFilter.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(todo => 
      todo.title.toLowerCase().includes(keyword) ||
      todo.description.toLowerCase().includes(keyword)
    )
  }
  
  return filtered
})

onMounted(() => {
  // 仅当内存中无数据时再从本地恢复，避免覆盖刚刚在实施v3界面做的分配但尚未保存的内存状态
  try {
    const hasMemory = (planning.tasks && planning.tasks.length > 0) || (planning.assignments && planning.assignments.length > 0)
    if (!hasMemory) {
      planning.loadFromLocal && planning.loadFromLocal()
    }
  } catch {}
  
  // 添加定时检查，每30秒检查一次是否有新的任务分配（仅在planning模式下）
  const syncInterval = setInterval(() => {
    if (sourceMode.value === 'planning') {
      // 静默检查本地存储是否有更新
      const currentCount = planning.assignments?.length || 0
      const lastKnownCount = parseInt(localStorage.getItem('tw2-last-assignment-count') || '0')
      if (currentCount !== lastKnownCount) {
        console.log(`🔄 检测到任务分配变化: ${lastKnownCount} → ${currentCount}`)
        localStorage.setItem('tw2-last-assignment-count', currentCount.toString())
        // 可选：显示提示
        if (currentCount > lastKnownCount) {
          message.info('检测到新的任务分配')
        }
      }
    }
  }, 30000)
  
  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(syncInterval)
  })
})

const isReportFormValid = computed(() => {
  // planning 模式：校验必填分段与附件
  if (sourceMode.value === 'planning' && activeReportTemplate.value) {
    const sections = Array.isArray(reportForm.value.sections) ? reportForm.value.sections : []
    const hasMissing = sections.some(s => s && s.required && !String(s.value || '').trim())
    if (hasMissing) return false
    const needAttach = !!reportForm.value.requireAttachment
    if (needAttach) {
      const files = Array.isArray(reportForm.value.attachments) ? reportForm.value.attachments : []
      if (files.length === 0) return false
    }
    return true
  }
  // demo 模式回退：校验旧字段
  const rf = reportForm.value || {}
  const f1 = String(rf.findings || '').trim()
  const f2 = String(rf.details || '').trim()
  const f3 = String(rf.sources || '').trim()
  const f4 = String(rf.nextSteps || '').trim()
  return !!(f1 && f2 && f3 && f4)
})

// 方法定义
const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'orange',
    'in_progress': 'blue',
    'completed': 'green',
    'revision_required': 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待办',
    'in_progress': '进行中',
    'completed': '已完成',
    'revision_required': '需要重新提报'
  }
  return textMap[status] || status
}

const handleSubmitReport = (todo) => {
  currentTodo.value = todo
  // 根据模式初始化表单：
  if (sourceMode.value === 'planning') {
    try {
      const tpl = (planning.getActiveReportTemplate && planning.getActiveReportTemplateByTaskId)
        ? planning.getActiveReportTemplateByTaskId(todo.id)
        : (planning.getActiveReportTemplate ? planning.getActiveReportTemplate({ id: todo.id }) : null)
      activeReportTemplate.value = tpl || null
      if (tpl) {
        const sections = Array.isArray(tpl.sections) ? tpl.sections.map(s => ({ title: s.title || '未命名分段', required: !!s.required, value: '' })) : []
        reportForm.value = { sections, requireAttachment: !!tpl.requireAttachment, attachments: [] }
      } else {
        // 无模板时回到旧结构
        activeReportTemplate.value = null
        reportForm.value = { sections: [], requireAttachment: false, attachments: [], findings: '', details: '', sources: '', nextSteps: '', difficulties: '' }
      }
    } catch {
      activeReportTemplate.value = null
      reportForm.value = { sections: [], requireAttachment: false, attachments: [], findings: '', details: '', sources: '', nextSteps: '', difficulties: '' }
    }
  } else {
    activeReportTemplate.value = null
    reportForm.value = { sections: [], requireAttachment: false, attachments: [], findings: '', details: '', sources: '', nextSteps: '', difficulties: '' }
  }
  reportModalVisible.value = true
}

const handleUpdateProgress = (todo) => {
  currentTodo.value = todo
  progressForm.value = {
    progress: todo.progress,
    status: todo.status,
    notes: ''
  }
  progressModalVisible.value = true
}

const handleViewHistory = (todo) => {
  currentTodo.value = todo
  // 重置所有展开状态
  mockEnhancedReviewHistory.value.forEach(review => {
    review.showSubmissionContent = false
  })
  historyModalVisible.value = true
}

// 切换提交内容的显示状态
const toggleSubmissionContent = (index) => {
  mockEnhancedReviewHistory.value[index].showSubmissionContent = 
    !mockEnhancedReviewHistory.value[index].showSubmissionContent
}

const handleSubmitReportForm = () => {
  // planning 模式校验：必填分段+附件要求
  if (sourceMode.value === 'planning' && activeReportTemplate.value) {
    const missing = (reportForm.value.sections || []).find(s => s.required && !String(s.value || '').trim())
    if (missing) return message.error(`请完善必填分段：${missing.title}`)
    if (reportForm.value.requireAttachment && (!Array.isArray(reportForm.value.attachments) || reportForm.value.attachments.length === 0)) {
      return message.error('该模板要求上传至少一个附件')
    }
  }

  const payload = sourceMode.value === 'planning' && activeReportTemplate.value
    ? {
        mode: 'planning',
        todoId: currentTodo.value.id,
        templateId: activeReportTemplate.value.id || null,
        sections: (reportForm.value.sections || []).map(s => ({ title: s.title, required: !!s.required, value: s.value })),
        attachments: reportForm.value.attachments,
        submitTime: new Date().toLocaleString()
      }
    : {
        mode: 'demo',
        todoId: currentTodo.value.id,
        findings: reportForm.value.findings,
        details: reportForm.value.details,
        sources: reportForm.value.sources,
        nextSteps: reportForm.value.nextSteps,
        difficulties: reportForm.value.difficulties,
        attachments: reportForm.value.attachments,
        submitTime: new Date().toLocaleString()
      }

  console.log('提交提报数据：', payload)
  message.success('提报提交成功，等待审查')
  reportModalVisible.value = false
}

const handleUpdateProgressForm = () => {
  const progressData = {
    todoId: currentTodo.value.id,
    ...progressForm.value,
    updateTime: new Date().toLocaleString()
  }
  
  // 更新本地数据
  const todo = todos.value.find(t => t.id === currentTodo.value.id)
  if (todo) {
    todo.progress = progressForm.value.progress
    todo.status = progressForm.value.status
  }
  
  console.log('更新进度数据：', progressData)
  message.success('进度更新成功')
  progressModalVisible.value = false
}
</script>

<style scoped>
.team-workbench-v2 {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  border: 1px solid #d6e4ff;
}

.page-header h2 {
  color: #234fa2;
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.page-header p {
  color: #64748b;
  margin: 0;
  font-size: 16px;
}

.todo-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.todo-filters {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6eaf2;
}

.task-title-cell h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.task-description {
  margin: 0 0 8px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.task-meta {
  margin: 0;
}

.meta-item {
  color: #8c8c8c;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 弹窗样式 */
.report-form,
.progress-form {
  max-height: 70vh;
  overflow-y: auto;
}

.task-info-section {
  margin-bottom: 20px;
}

.report-actions,
.progress-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e6eaf2;
  display: flex;
  justify-content: center;
}

/* 增强版历史审查意见样式 */
.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.timeline-item {
  position: relative;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.timeline-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

/* 提交版本区域 */
.submission-version {
  background: #f0f5ff;
  border-bottom: 1px solid #d6e4ff;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.submission-time {
  font-size: 12px;
  color: #8c8c8c;
}

.version-note {
  font-size: 12px;
  color: #1890ff;
  font-style: italic;
}

.submission-content {
  padding: 16px;
  background: white;
  border-top: 1px solid #e6f7ff;
}

.content-section {
  margin-bottom: 16px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.content-section h6 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #234fa2;
}

.content-text {
  margin: 0;
  color: #595959;
  line-height: 1.6;
  font-size: 13px;
}

.key-points-list {
  margin: 0;
  padding-left: 16px;
  color: #595959;
  font-size: 13px;
}

.key-points-list li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.attachment-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 审查意见区域 */
.review-section {
  padding: 16px;
  background: white;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reviewer-name {
  font-weight: 600;
  color: #234fa2;
  font-size: 14px;
}

.review-time {
  color: #8c8c8c;
  font-size: 12px;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-opinion,
.review-suggestions {
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #234fa2;
}

.review-opinion strong,
.review-suggestions strong {
  color: #234fa2;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.review-opinion p,
.review-suggestions p {
  margin: 0;
  color: #333;
  font-size: 13px;
  line-height: 1.6;
}

/* 时间线连接器 */
.timeline-connector {
  height: 16px;
  width: 2px;
  background: linear-gradient(to bottom, #d9d9d9, transparent);
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .team-workbench-v2 {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .todo-filters {
    flex-direction: column;
    gap: 12px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.timeline-item {
  position: relative;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.timeline-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

/* 提交版本区域 */
.submission-version {
  background: #f0f5ff;
  border-bottom: 1px solid #d6e4ff;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.submission-time {
  font-size: 12px;
  color: #8c8c8c;
}

.version-note {
  font-size: 12px;
  color: #1890ff;
  font-style: italic;
}

.submission-content {
  padding: 16px;
  background: white;
  border-top: 1px solid #e6f7ff;
}

.content-section {
  margin-bottom: 16px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.content-section h6 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #234fa2;
}

.content-text {
  margin: 0;
  color: #595959;
  line-height: 1.6;
  font-size: 13px;
}

.key-points-list {
  margin: 0;
  padding-left: 16px;
  color: #595959;
  font-size: 13px;
}

.key-points-list li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.attachment-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 审查意见区域 */
.review-section {
  padding: 16px;
  background: white;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reviewer-name {
  font-weight: 600;
  color: #234fa2;
  font-size: 14px;
}

.review-time {
  color: #8c8c8c;
  font-size: 12px;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-opinion,
.review-suggestions {
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #234fa2;
}

.review-opinion strong,
.review-suggestions strong {
  color: #234fa2;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.review-opinion p,
.review-suggestions p {
  margin: 0;
  color: #333;
  font-size: 13px;
  line-height: 1.6;
}

/* 时间线连接器 */
.timeline-connector {
  height: 16px;
  width: 2px;
  background: linear-gradient(to bottom, #d9d9d9, transparent);
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .team-workbench-v2 {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .todo-filters {
    flex-direction: column;
    gap: 12px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.timeline-item {
  position: relative;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.timeline-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

/* 提交版本区域 */
.submission-version {
  background: #f0f5ff;
  border-bottom: 1px solid #d6e4ff;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.submission-time {
  font-size: 12px;
  color: #8c8c8c;
}

.version-note {
  font-size: 12px;
  color: #1890ff;
  font-style: italic;
}

.submission-content {
  padding: 16px;
  background: white;
  border-top: 1px solid #e6f7ff;
}

.content-section {
  margin-bottom: 16px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.content-section h6 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #234fa2;
}

.content-text {
  margin: 0;
  color: #595959;
  line-height: 1.6;
  font-size: 13px;
}

.key-points-list {
  margin: 0;
  padding-left: 16px;
  color: #595959;
  font-size: 13px;
}

.key-points-list li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.attachment-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 审查意见区域 */
.review-section {
  padding: 16px;
  background: white;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reviewer-name {
  font-weight: 600;
  color: #234fa2;
  font-size: 14px;
}

.review-time {
  color: #8c8c8c;
  font-size: 12px;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-opinion,
.review-suggestions {
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #234fa2;
}

.review-opinion strong,
.review-suggestions strong {
  color: #234fa2;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.review-opinion p,
.review-suggestions p {
  margin: 0;
  color: #333;
  font-size: 13px;
  line-height: 1.6;
}

/* 时间线连接器 */
.timeline-connector {
  height: 16px;
  width: 2px;
  background: linear-gradient(to bottom, #d9d9d9, transparent);
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .team-workbench-v2 {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .todo-filters {
    flex-direction: column;
    gap: 12px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>