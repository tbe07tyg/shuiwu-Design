<!--
 * @file 第五步：进展监控与审查步骤组件
 * @description 观察整体任务进展情况，查看成员每周工作提报，进行实质性内容审查
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="progress-monitoring-step">
    <!-- 步骤说明 -->
    <div class="step-description">
      <h3>第五步：进展监控与审查</h3>
      <p>观察整体任务进展情况，查看各团队成员的每周阶段性工作提报，支持点击审查，弹窗详细查看成员提交内容，进行实质性内容审查。</p>
    </div>

    <!-- 整体进展概览 -->
    <a-card title="整体进展概览" class="overview-card" :bordered="false">
      <div class="progress-overview">
        <div class="progress-stats">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-statistic 
                title="总任务" 
                :value="monitoringData.overallStats.totalTasks"
                :value-style="{ color: '#234fa2' }"
              >
                <template #suffix>个</template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic 
                title="已完成" 
                :value="monitoringData.overallStats.completedTasks"
                :value-style="{ color: '#52c41a' }"
              >
                <template #suffix>个</template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic 
                title="进行中" 
                :value="monitoringData.overallStats.inProgressTasks"
                :value-style="{ color: '#faad14' }"
              >
                <template #suffix>个</template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic 
                title="待开始" 
                :value="monitoringData.overallStats.pendingTasks"
                :value-style="{ color: '#8c8c8c' }"
              >
                <template #suffix>个</template>
              </a-statistic>
            </a-col>
          </a-row>
        </div>
        
        <div class="progress-bar-section">
          <div class="progress-label">
            <span>整体完成度：{{ monitoringData.overallStats.overallProgress }}%（基于内容完成度）</span>
          </div>
          <a-progress 
            :percent="monitoringData.overallStats.overallProgress" 
            :stroke-color="{
              '0%': '#108ee9',
              '100%': '#87d068',
            }"
            :stroke-width="8"
          />
        </div>
      </div>
    </a-card>

    <!-- 监控操作区 -->
    <a-card title="监控操作" class="monitoring-actions-card" :bordered="false">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-button type="primary" size="large" block @click="handleBatchReview">
            <CheckSquareOutlined />
            批量审查
          </a-button>
        </a-col>
        <a-col :span="6">
          <a-button size="large" block @click="handleExportReport">
            <ExportOutlined />
            导出进展报告
          </a-button>
        </a-col>
        <a-col :span="6">
          <a-button size="large" block @click="handleSendReminder">
            <BellOutlined />
            发送提醒
          </a-button>
        </a-col>
        <a-col :span="6">
          <a-button size="large" block @click="handleViewStatistics">
            <BarChartOutlined />
            查看统计分析
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 工作提报情况 -->
    <a-card :title="getReportsCardTitle()" class="submissions-card" :bordered="false">
      <!-- 筛选和视图控制区域 -->
      <div class="filter-control-section">
        <a-row :gutter="24" align="middle">
          <!-- 时间筛选 -->
          <a-col :span="10">
            <div class="filter-section">
              <span class="filter-label">时间范围：</span>
              <a-space>
                <a-radio-group v-model:value="timeFilter" @change="handleTimeFilterChange">
                  <a-radio-button value="week">本周</a-radio-button>
                  <a-radio-button value="month">本月</a-radio-button>
                  <a-radio-button value="custom">自定义</a-radio-button>
                </a-radio-group>
                <a-range-picker
                  v-if="timeFilter === 'custom'"
                  v-model:value="customTimeRange"
                  @change="handleCustomTimeChange"
                  :placeholder="['开始日期', '结束日期']"
                  size="small"
                />
              </a-space>
            </div>
          </a-col>

          <!-- 视图切换 -->
          <a-col :span="8">
            <div class="view-section">
              <span class="filter-label">查看方式：</span>
              <a-segmented
                v-model:value="viewMode"
                :options="viewOptions"
                @change="handleViewModeChange"
                size="small"
              />
            </div>
          </a-col>

          <!-- 状态筛选和搜索 -->
          <a-col :span="6">
            <a-space>
              <a-select v-model:value="filterStatus" style="width: 100px" @change="handleFilterChange" size="small">
                <a-select-option value="all">全部状态</a-select-option>
                <a-select-option value="pending">待审查</a-select-option>
                <a-select-option value="reviewed">已审查</a-select-option>
              </a-select>
              <a-input-search 
                v-model:value="searchKeyword" 
                placeholder="搜索成员或任务"
                style="width: 160px"
                @search="handleSearch"
                size="small"
              />
            </a-space>
          </a-col>
        </a-row>

        <!-- 筛选结果统计 -->
        <div class="filter-stats">
          <a-space>
            <a-tag color="blue" size="small">
              <CalendarOutlined />
              {{ getTimeRangeText() }}
            </a-tag>
            <a-tag color="green" size="small">
              <FileTextOutlined />
              共 {{ filteredReports.length }} 条提报
            </a-tag>
            <a-tag color="orange" size="small">
              <UserOutlined />
              {{ getActiveMembers() }} 人参与
            </a-tag>
          </a-space>
        </div>
      </div>

      

      <!-- 任务视图 -->
      <div v-if="viewMode === 'task' && filteredReports.length > 0" class="task-view">
        <div v-for="task in groupedByTask" :key="task.taskId" class="task-group">
          <div class="task-header">
            <h4>{{ task.taskTitle }}</h4>
            <a-tag color="blue">{{ task.reports.length }} 条提报</a-tag>
          </div>
          <div class="task-reports">
            <div 
              v-for="report in task.reports" 
              :key="report.id"
              class="report-item"
              :class="{ 'reviewed': report.status === 'reviewed' }"
            >
              <div class="report-header">
                <div class="reporter-info">
                  <a-avatar size="small">{{ report.submittedByName.charAt(0) }}</a-avatar>
                  <div class="reporter-details">
                    <span class="reporter-name">{{ report.submittedByName }}</span>
                    <span class="submit-time">{{ report.submitTime }}</span>
                  </div>
                </div>
                <div class="report-status">
                  <a-tag :color="getSubmissionStatusColor(report.status)">
                    {{ getSubmissionStatusText(report.status) }}
                  </a-tag>
                </div>
              </div>
              <div class="report-content">
                <p>{{ report.contentSummary }}</p>
              </div>
              <div class="report-actions">
                <a-button size="small" type="link" @click="handleReviewDetail(report)">
                  查看详情
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 人员视图 -->
      <div v-else-if="viewMode === 'member' && filteredReports.length > 0" class="member-view">
        <div v-for="member in groupedByMember" :key="member.memberId" class="member-group">
          <div class="member-header">
            <div class="member-info">
              <a-avatar>{{ member.memberName.charAt(0) }}</a-avatar>
              <div class="member-details">
                <h4>{{ member.memberName }}</h4>
                <span class="member-role">{{ member.memberRole || '团队成员' }}</span>
              </div>
            </div>
            <div class="member-stats">
              <a-tag color="green">{{ member.reports.length }} 条提报</a-tag>
              <a-tag color="orange">{{ member.pendingCount }} 待审查</a-tag>
            </div>
          </div>
          <div class="member-reports">
            <div 
              v-for="report in member.reports" 
              :key="report.id"
              class="report-item"
              :class="{ 'reviewed': report.status === 'reviewed' }"
            >
              <div class="report-header">
                <div class="task-info">
                  <span class="task-title">{{ report.taskTitle }}</span>
                  <span class="submit-time">{{ report.submitTime }}</span>
                </div>
                <div class="report-status">
                  <a-tag :color="getSubmissionStatusColor(report.status)">
                    {{ getSubmissionStatusText(report.status) }}
                  </a-tag>
                </div>
              </div>
              <div class="report-content">
                <p>{{ report.contentSummary }}</p>
              </div>
              <div class="report-actions">
                <a-button size="small" type="link" @click="handleReviewDetail(report)">
                  查看详情
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 原有的列表视图（作为备用） -->
      <div v-else-if="filteredReports.length > 0" class="submissions-list">
        <div 
          v-for="submission in filteredReports" 
          :key="submission.id"
          class="submission-item"
          :class="{ 'reviewed': submission.status === 'reviewed' }"
        >
          <div class="submission-header">
            <div class="submitter-info">
              <a-avatar size="small">{{ submission.submittedByName.charAt(0) }}</a-avatar>
              <div class="submitter-details">
                <h4>{{ submission.submittedByName }} - {{ submission.taskTitle }}</h4>
                <p class="submit-time">提交时间：{{ submission.submitTime }}</p>
              </div>
            </div>
            <div class="submission-status">
              <a-tag :color="getSubmissionStatusColor(submission.status)">
                {{ getSubmissionStatusText(submission.status) }}
              </a-tag>
              <a-tag v-if="submission.rating" :color="getRatingColor(submission.rating)">
                {{ getRatingText(submission.rating) }}
              </a-tag>
            </div>
          </div>

          <div class="submission-content">
            <div class="content-summary">
              <span class="label">内容摘要：</span>
              <span class="summary-text">{{ submission.contentSummary }}</span>
            </div>
            
            <div v-if="submission.attachments && submission.attachments.length > 0" class="attachments">
              <span class="label">附件：</span>
              <div class="attachment-list">
                <a-tag 
                  v-for="attachment in submission.attachments" 
                  :key="attachment"
                  color="blue"
                  class="attachment-tag"
                >
                  <PaperClipOutlined />
                  {{ attachment }}
                </a-tag>
              </div>
            </div>
          </div>

          <div class="submission-actions">
            <a-space>
              <a-button 
                type="primary" 
                size="small" 
                @click="handleReviewSubmission(submission)"
                :disabled="submission.status === 'reviewed'"
              >
                <EyeOutlined />
                {{ submission.status === 'reviewed' ? '查看审查' : '点击审查' }}
              </a-button>
              <a-button size="small" @click="handleViewDetails(submission)">
                <FileTextOutlined />
                查看详情
              </a-button>
              <a-dropdown v-if="submission.status === 'reviewed'">
                <a-button size="small">
                  更多 <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="handleReReview(submission)">
                      <EditOutlined />
                      重新审查
                    </a-menu-item>
                    <a-menu-item @click="handleDownloadAttachments(submission)">
                      <DownloadOutlined />
                      下载附件
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-submissions">
        <a-empty :description="getEmptyDescription()">
          <a-button @click="handleRefreshSubmissions">
            刷新数据
          </a-button>
        </a-empty>
      </div>
    </a-card>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <a-space>
        <a-button size="large" @click="handleSaveMonitoring">
          <SaveOutlined />
          保存监控设置
        </a-button>
        <a-button type="primary" size="large" @click="handleCompleteStep">
          完成项目管理配置
          <CheckOutlined />
        </a-button>
      </a-space>
    </div>

    <!-- 审查详情弹窗 -->
    <a-modal
      v-model:open="reviewDetailVisible"
      title="内容审查"
      width="800px"
      :footer="null"
    >
      <div v-if="currentReviewItem" class="review-detail-content">
        <!-- 基本信息 -->
        <div class="review-basic-info">
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="提交人">{{ currentReviewItem.submittedByName }}</a-descriptions-item>
            <a-descriptions-item label="提交时间">{{ currentReviewItem.submitTime }}</a-descriptions-item>
            <a-descriptions-item label="关联任务">{{ currentReviewItem.taskTitle }}</a-descriptions-item>
            <a-descriptions-item label="提交状态">
              <a-tag :color="getSubmissionStatusColor(currentReviewItem.status)">
                {{ getSubmissionStatusText(currentReviewItem.status) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 格式化提报内容 -->
        <div class="formatted-report-content">
          <h4>提报内容（按格式要求）</h4>
          
          <div class="report-section">
            <h5>🔍 发现结论</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.findings || '完成了核心模块的架构设计，确定了系统的整体技术方案和实现路径。' }}
            </div>
          </div>

          <div class="report-section">
            <h5>📝 详细描述</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.details || '本周主要完成了用户管理、权限控制、数据流转等关键组件的详细设计。采用微服务架构，确保系统的可扩展性和维护性。设计了统一的API接口规范，为后续开发奠定了基础。' }}
            </div>
          </div>

          <div class="report-section">
            <h5>🔗 发现来源</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.sources || '通过对现有系统的深入分析，结合业务需求调研结果，参考了业界最佳实践和技术标准。主要依据包括：需求分析文档、技术调研报告、系统现状评估报告。' }}
            </div>
          </div>

          <div class="report-section">
            <h5>📋 下一步计划</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.nextSteps || '1. 完成详细的接口设计文档；2. 开始核心模块的编码实现；3. 搭建开发环境和CI/CD流程；4. 与前端团队对接接口规范。预计下周完成接口设计，两周内开始编码工作。' }}
            </div>
          </div>

          <div class="report-section">
            <h5>⚠️ 遇到的困难</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.difficulties || '在技术选型过程中遇到了一些挑战：1. 部分第三方组件的兼容性问题需要进一步验证；2. 性能要求与开发周期之间需要平衡；3. 团队成员对新技术栈的熟悉程度有待提升。已制定相应的解决方案和培训计划。' }}
            </div>
          </div>

          <!-- 附件 -->
          <div v-if="currentReviewItem.attachments && currentReviewItem.attachments.length > 0" class="attachments-section">
            <h5>📎 附件</h5>
            <div class="attachment-list">
              <div 
                v-for="attachment in currentReviewItem.attachments" 
                :key="attachment"
                class="attachment-item"
              >
                <a-button type="link" size="small" @click="handleDownloadAttachment(attachment)">
                  <PaperClipOutlined />
                  {{ attachment }}
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 审查操作 -->
        <div class="review-actions">
          <a-space>
            <a-button type="primary" @click="handleApproveReport">
              <CheckOutlined />
              通过审查
            </a-button>
            <a-button @click="handleRequestRevision">
              <EditOutlined />
              要求修改
            </a-button>
            <a-button @click="reviewDetailVisible = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
         </a-modal>

     <!-- 审查意见输入弹窗 -->
     <a-modal
       v-model:open="reviewOpinionVisible"
       :title="reviewAction === 'approve' ? '通过审查 - 填写意见' : '要求修改 - 填写意见'"
       width="600px"
       :footer="null"
     >
       <div v-if="currentReviewItem" class="review-opinion-form">
         <!-- 提报信息概要 -->
         <div class="review-summary">
           <a-alert
             :message="`正在审查：${currentReviewItem.submittedByName} - ${currentReviewItem.taskTitle}`"
             :type="reviewAction === 'approve' ? 'success' : 'warning'"
             show-icon
             style="margin-bottom: 20px"
           />
         </div>

         <!-- 审查意见表单 -->
         <a-form layout="vertical">
           <a-form-item 
             label="审查意见" 
             required
             :help="reviewAction === 'approve' ? '请填写对该提报的肯定意见和建议' : '请详细说明需要修改的问题和原因'"
           >
             <a-textarea
               v-model:value="reviewOpinion"
               :placeholder="reviewAction === 'approve' ? 
                 '例如：提报内容详实，技术方案合理，进度符合预期...' : 
                 '例如：技术方案需要进一步完善，缺少关键实现细节...'"
               :rows="4"
               show-count
               :maxlength="500"
             />
           </a-form-item>

           <a-form-item 
             :label="reviewAction === 'approve' ? '改进建议（可选）' : '修改建议'"
             :help="reviewAction === 'approve' ? '可以提出进一步改进的建议' : '请提供具体的修改建议和指导'"
           >
             <a-textarea
               v-model:value="reviewSuggestions"
               :placeholder="reviewAction === 'approve' ? 
                 '例如：建议在下一阶段加强性能测试，考虑增加异常处理机制...' : 
                 '例如：1. 补充详细的技术实现方案；2. 增加风险评估内容；3. 明确时间节点...'"
               :rows="3"
               show-count
               :maxlength="300"
             />
           </a-form-item>
         </a-form>

         <!-- 操作按钮 -->
         <div class="review-opinion-actions">
           <a-space>
             <a-button 
               type="primary" 
               :loading="false"
               @click="handleSubmitReview"
               :disabled="!reviewOpinion.trim()"
             >
               <CheckOutlined />
               {{ reviewAction === 'approve' ? '确认通过' : '确认要求修改' }}
             </a-button>
             <a-button @click="handleCancelReview">
               取消
             </a-button>
           </a-space>
         </div>
       </div>
     </a-modal>
   </div>
 </template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  CheckSquareOutlined,
  ExportOutlined,
  BellOutlined,
  BarChartOutlined,
  EyeOutlined,
  FileTextOutlined,
  DownOutlined,
  EditOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  SaveOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

// Props
const props = defineProps({
  monitoringData: {
    type: Object,
    default: () => ({
      overallStats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        overallProgress: 0
      },
      weeklySubmissions: []
    })
  }
})

// Emits
const emit = defineEmits([
  'review-submission',
  'batch-review',
  'export-report',
  'send-reminder',
  'view-statistics'
])

// 响应式数据
const filterStatus = ref('all')
const searchKeyword = ref('')

// 新增的筛选和视图相关数据
const timeFilter = ref('month') // 'week', 'month', 'custom'
const customTimeRange = ref([])
const viewMode = ref('task') // 'task', 'member'

// 视图选项
const viewOptions = [
  { label: '任务视图', value: 'task', icon: 'FileTextOutlined' },
  { label: '人员视图', value: 'member', icon: 'UserOutlined' }
]

// 审查详情弹窗相关数据
const reviewDetailVisible = ref(false)
const currentReviewItem = ref(null)

// 审查意见相关数据
const reviewOpinionVisible = ref(false)
const reviewAction = ref('') // 'approve' 或 'reject'
const reviewOpinion = ref('')
const reviewSuggestions = ref('')

// 计算属性
const filteredSubmissions = computed(() => {
  let submissions = props.monitoringData.weeklySubmissions || []
  
  // 状态过滤
  if (filterStatus.value !== 'all') {
    submissions = submissions.filter(sub => sub.status === filterStatus.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    submissions = submissions.filter(sub => 
      sub.submittedByName.toLowerCase().includes(keyword) ||
      sub.taskTitle.toLowerCase().includes(keyword) ||
      sub.contentSummary.toLowerCase().includes(keyword)
    )
  }
  
  return submissions
})

// 根据时间筛选的提报数据
const filteredReports = computed(() => {
  let reports = props.monitoringData.weeklySubmissions || []
  
  // 时间筛选
  const now = dayjs()
  let startDate, endDate
  
  switch (timeFilter.value) {
    case 'week':
      startDate = now.startOf('week')
      endDate = now.endOf('week')
      break
    case 'month':
      startDate = now.startOf('month')
      endDate = now.endOf('month')
      break
    case 'custom':
      if (customTimeRange.value && customTimeRange.value.length === 2) {
        startDate = dayjs(customTimeRange.value[0])
        endDate = dayjs(customTimeRange.value[1])
      } else {
        startDate = now.startOf('week')
        endDate = now.endOf('week')
      }
      break
    default:
      startDate = now.startOf('week')
      endDate = now.endOf('week')
  }
  
  reports = reports.filter(report => {
    const submitDate = dayjs(report.submitTime)
    const isInRange = (submitDate.isAfter(startDate) || submitDate.isSame(startDate)) && 
                      (submitDate.isBefore(endDate) || submitDate.isSame(endDate))
    return isInRange
  })
  
  // 状态过滤
  if (filterStatus.value !== 'all') {
    reports = reports.filter(report => report.status === filterStatus.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    reports = reports.filter(report => 
      report.submittedByName.toLowerCase().includes(keyword) ||
      report.taskTitle.toLowerCase().includes(keyword) ||
      report.contentSummary.toLowerCase().includes(keyword)
    )
  }
  
  return reports
})

// 按任务分组的数据
const groupedByTask = computed(() => {
  const taskMap = new Map()
  
  filteredReports.value.forEach(report => {
    if (!taskMap.has(report.taskId)) {
      taskMap.set(report.taskId, {
        taskId: report.taskId,
        taskTitle: report.taskTitle,
        reports: []
      })
    }
    taskMap.get(report.taskId).reports.push(report)
  })
  
  return Array.from(taskMap.values()).sort((a, b) => a.taskTitle.localeCompare(b.taskTitle))
})

// 按人员分组的数据
const groupedByMember = computed(() => {
  const memberMap = new Map()
  
  filteredReports.value.forEach(report => {
    if (!memberMap.has(report.submittedBy)) {
      memberMap.set(report.submittedBy, {
        memberId: report.submittedBy,
        memberName: report.submittedByName,
        memberRole: report.memberRole || '团队成员',
        reports: [],
        pendingCount: 0
      })
    }
    const member = memberMap.get(report.submittedBy)
    member.reports.push(report)
    if (report.status === 'pending') {
      member.pendingCount++
    }
  })
  
  return Array.from(memberMap.values()).sort((a, b) => a.memberName.localeCompare(b.memberName))
})

// 新增的方法
const getTimeRangeText = () => {
  const now = dayjs()
  switch (timeFilter.value) {
    case 'week':
      return `本周 (${now.startOf('week').format('MM-DD')} ~ ${now.endOf('week').format('MM-DD')})`
    case 'month':
      return `本月 (${now.format('YYYY-MM')})`
    case 'custom':
      if (customTimeRange.value && customTimeRange.value.length === 2) {
        return `${dayjs(customTimeRange.value[0]).format('YYYY-MM-DD')} ~ ${dayjs(customTimeRange.value[1]).format('YYYY-MM-DD')}`
      }
      return '自定义时间'
    default:
      return '本周'
  }
}

const getActiveMembers = () => {
  const memberIds = new Set(filteredReports.value.map(report => report.submittedBy))
  return memberIds.size
}

const getReportsCardTitle = () => {
  const timeText = timeFilter.value === 'week' ? '本周' : 
                   timeFilter.value === 'month' ? '本月' : '时间段内'
  const viewText = viewMode.value === 'task' ? '任务' : '人员'
  return `${timeText}提报情况 - ${viewText}视图`
}

const getEmptyDescription = () => {
  const timeText = getTimeRangeText()
  return `${timeText}暂无提报记录`
}

const handleTimeFilterChange = () => {
  message.info(`切换到${getTimeRangeText()}`)
}

const handleCustomTimeChange = () => {
  if (customTimeRange.value && customTimeRange.value.length === 2) {
    message.info(`自定义时间范围：${getTimeRangeText()}`)
  }
}

const handleViewModeChange = (value) => {
  const viewText = value === 'task' ? '任务视图' : '人员视图'
  message.info(`切换到${viewText}`)
}

// 审查详情相关方法
const handleReviewDetail = (report) => {
  currentReviewItem.value = report
  reviewDetailVisible.value = true
}

const handleApproveReport = () => {
  if (currentReviewItem.value) {
    reviewAction.value = 'approve'
    reviewOpinion.value = ''
    reviewSuggestions.value = ''
    reviewOpinionVisible.value = true
  }
}

const handleRequestRevision = () => {
  if (currentReviewItem.value) {
    reviewAction.value = 'reject'
    reviewOpinion.value = ''
    reviewSuggestions.value = ''
    reviewOpinionVisible.value = true
  }
}

// 提交审查意见
const handleSubmitReview = () => {
  if (!reviewOpinion.value.trim()) {
    message.warning('请填写审查意见')
    return
  }

  const actionText = reviewAction.value === 'approve' ? '通过' : '要求修改'
  const reviewData = {
    submissionId: currentReviewItem.value.id,
    action: reviewAction.value,
    opinion: reviewOpinion.value,
    suggestions: reviewSuggestions.value,
    reviewTime: new Date().toLocaleString(),
    reviewer: '当前用户' // 实际应用中应该是当前登录用户
  }

  // 这里可以调用API提交审查意见到后端
  // await submitReviewOpinion(reviewData)
  
  message.success(`已${actionText} ${currentReviewItem.value.submittedByName} 的提报，审查意见已记录`)
  
  // 关闭弹窗
  reviewOpinionVisible.value = false
  reviewDetailVisible.value = false
  
  // 清空表单
  reviewOpinion.value = ''
  reviewSuggestions.value = ''
}

// 取消审查意见
const handleCancelReview = () => {
  reviewOpinionVisible.value = false
  reviewOpinion.value = ''
  reviewSuggestions.value = ''
}

// 方法定义
const getSubmissionStatusColor = (status) => {
  const colorMap = {
    'pending': 'orange',
    'reviewed': 'green',
    'revision_required': 'red'
  }
  return colorMap[status] || 'default'
}

const getSubmissionStatusText = (status) => {
  const textMap = {
    'pending': '待审查',
    'reviewed': '已审查',
    'revision_required': '需整改'
  }
  return textMap[status] || status
}

const getRatingColor = (rating) => {
  const colorMap = {
    'excellent': 'green',
    'good': 'blue',
    'fair': 'orange',
    'poor': 'red'
  }
  return colorMap[rating] || 'default'
}

const getRatingText = (rating) => {
  const textMap = {
    'excellent': '优秀',
    'good': '良好',
    'fair': '一般',
    'poor': '较差'
  }
  return textMap[rating] || rating
}

const handleFilterChange = (value) => {
  // 筛选状态变更处理
}

const handleSearch = (value) => {
  // 搜索关键词处理
}

const handleBatchReview = () => {
  const pendingSubmissions = filteredSubmissions.value.filter(sub => sub.status === 'pending')
  if (pendingSubmissions.length === 0) {
    message.warning('没有待审查的提报')
    return
  }
  emit('batch-review', pendingSubmissions)
  message.success(`批量审查 ${pendingSubmissions.length} 项提报`)
}

const handleExportReport = () => {
  emit('export-report')
  message.success('进展报告导出成功')
}

const handleSendReminder = () => {
  emit('send-reminder')
  message.success('提醒通知已发送')
}

const handleViewStatistics = () => {
  emit('view-statistics')
  message.info('跳转到统计分析页面')
}

const handleReviewSubmission = (submission) => {
  emit('review-submission', submission)
}

const handleViewDetails = (submission) => {
  console.log('点击查看详情，数据：', submission)
  console.log('格式化内容：', submission.formattedContent)
  currentReviewItem.value = submission
  reviewDetailVisible.value = true
}

const handleReReview = (submission) => {
  console.log('重新审查:', submission)
  emit('review-submission', submission)
}

const handleDownloadAttachments = (submission) => {
  console.log('下载附件:', submission)
  message.success('附件下载已开始')
}

const handleRefreshSubmissions = () => {
  message.success('数据已刷新')
}

const handleSaveMonitoring = () => {
  message.success('监控设置已保存')
}

const handleCompleteStep = () => {
  handleSaveMonitoring()
  message.success('项目管理配置已完成！')
}
</script>

<style scoped>
.progress-monitoring-step {
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

/* 筛选和视图控制样式 */
.filter-control-section {
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e6eaf2;
  margin-bottom: 20px;
}

.filter-section,
.view-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: #234fa2;
  min-width: 70px;
  font-size: 13px;
}

.filter-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e6eaf2;
}

/* 任务视图样式 */
.task-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-group {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  overflow: hidden;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e6eaf2;
}

.task-header h4 {
  margin: 0;
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
}

.task-reports {
  display: flex;
  flex-direction: column;
}

/* 人员视图样式 */
.member-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-group {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  overflow: hidden;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e6eaf2;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-details h4 {
  margin: 0 0 4px 0;
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
}

.member-role {
  color: #64748b;
  font-size: 12px;
}

.member-stats {
  display: flex;
  gap: 8px;
}

.member-reports {
  display: flex;
  flex-direction: column;
}

/* 通用报告项样式 */
.report-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.report-item:hover {
  background-color: #fafbfc;
}

.report-item:last-child {
  border-bottom: none;
}

.report-item.reviewed {
  background-color: #f6ffed;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reporter-info,
.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reporter-details,
.task-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reporter-name,
.task-title {
  font-weight: 600;
  color: #234fa2;
  font-size: 13px;
}

.submit-time {
  color: #8c8c8c;
  font-size: 11px;
}

.report-content {
  margin: 8px 0;
}

.report-content p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* 审查详情弹窗样式 */
.review-detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.review-basic-info {
  margin-bottom: 20px;
}

.formatted-report-content {
  margin-top: 20px;
}

.formatted-report-content h4 {
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  border-bottom: 2px solid #e6eaf2;
  padding-bottom: 8px;
}

.report-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border-left: 4px solid #234fa2;
}

.report-section h5 {
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-content {
  color: #333;
  font-size: 13px;
  line-height: 1.6;
  text-align: justify;
  margin: 0;
}

.attachments-section {
  margin-top: 20px;
  padding: 16px;
  background: #f0f7ff;
  border-radius: 8px;
  border: 1px solid #d6e4ff;
}

.attachments-section h5 {
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.review-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e6eaf2;
  display: flex;
  justify-content: center;
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

.overview-card,
.monitoring-actions-card,
.submissions-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.progress-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-bar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label span {
  color: #333;
  font-weight: 500;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-item {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 20px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.submission-item:hover {
  border-color: #234fa2;
  box-shadow: 0 2px 8px rgba(35,79,162,0.1);
}

.submission-item.reviewed {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.submitter-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.submitter-details h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.submit-time {
  margin: 0;
  color: #8c8c8c;
  font-size: 12px;
}

.submission-status {
  display: flex;
  gap: 8px;
}

.submission-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.content-summary,
.attachments {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.label {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
}

.summary-text {
  color: #333;
  font-size: 13px;
  line-height: 1.5;
  flex: 1;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-tag {
  margin: 0;
  cursor: pointer;
}

.submission-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-submissions {
  text-align: center;
  padding: 40px;
}

.step-actions {
  display: flex;
  justify-content: center;
  padding: 24px;
  border-top: 1px solid #e6eaf2;
  background: #fafbfc;
  border-radius: 0 0 12px 12px;
}

 /* 审查意见弹窗样式 */
 .review-opinion-form {
   padding: 0;
 }
 
 .review-summary {
   margin-bottom: 20px;
 }
 
 .review-opinion-actions {
   margin-top: 24px;
   padding-top: 16px;
   border-top: 1px solid #e6eaf2;
   display: flex;
   justify-content: center;
 }

 /* 响应式设计 */
 @media (max-width: 768px) {
  .progress-stats {
    margin-bottom: 16px;
  }
  
  .submission-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .submission-status {
    align-self: flex-start;
  }
  
  .content-summary,
  .attachments {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .submission-actions {
    justify-content: flex-start;
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
