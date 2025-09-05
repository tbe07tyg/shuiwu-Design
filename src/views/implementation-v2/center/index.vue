<!--
 * @file 项目实施管理v2页面 - 项目负责人端
 * @description 基于申报书内容的分步骤项目管理系统
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
 * @reference 严格遵循《页面统一风格设计规范.md》和《项目实施管理v2页面设计文档.md》
-->
<template>
  <div class="implementation-v2-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <ExperimentOutlined />
          项目实施管理v2
        </h1>
        <p class="page-desc">基于申报书内容的分步骤项目管理</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="refreshData">
          <ReloadOutlined />
          刷新数据
        </a-button>

      </div>
    </div>

    <!-- 项目选择区 -->
    <div class="project-selector-section">
      <a-card :bordered="false" class="selector-card">
        <div class="selector-content">
          <div class="project-select">
            <label>当前项目：</label>
            <a-select 
              v-model:value="selectedProjectId" 
              placeholder="请选择项目"
              style="width: 300px"
              @change="handleProjectChange"
            >
              <a-select-option 
                v-for="project in projectList" 
                :key="project.id" 
                :value="project.id"
              >
                {{ project.name }}
              </a-select-option>
            </a-select>
          </div>
          
          <div v-if="selectedProject" class="project-info">
            <div class="info-item">
              <span class="label">当前步骤：</span>
              <a-tag color="blue">第{{ currentStep }}步 - {{ stepNames[currentStep - 1] }}</a-tag>
            </div>
            <div class="info-item">
              <span class="label">整体完成度：</span>
              <a-progress :percent="overallProgress" size="small" style="width: 120px" />
            </div>
            <div class="info-item">
              <span class="label">快速跳转：</span>
              <a-dropdown>
                <a-button size="small">
                  跳转步骤 <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu @click="jumpToStep">
                    <a-menu-item v-for="(name, index) in stepNames" :key="index + 1">
                      第{{ index + 1 }}步：{{ name }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 主要内容区 -->
    <div v-if="selectedProject" class="main-content">
      <!-- 横向选项卡导航 -->
      <div class="step-tabs-container">
        <a-tabs 
          v-model:activeKey="currentStep" 
          type="card" 
          size="large"
          @change="onStepChange"
          class="step-tabs"
        >
          <a-tab-pane 
            v-for="(stepName, index) in stepNames" 
            :key="index + 1" 
            :tab="getTabTitle(index + 1, stepName)"
          >
            <!-- 选项卡内容区 -->
            <div class="tab-content">
              <!-- 第一步：团队配置 -->
              <TeamConfigurationStep 
                v-if="currentStep === 1"
                :team-data="mockTeamData"
                @save-config="handleSaveTeamConfig"
                @add-member="handleAddMember"
                @edit-member="handleEditMember"
                @remove-member="handleRemoveMember"
              />

              <!-- 第二步：申报书内容解析 -->
              <ProposalAnalysisStep 
                v-if="currentStep === 2"
                :proposal-data="mockProposalData"
                @parse-proposal="handleParseProposal"
                @edit-tech-route="handleEditTechRoute"
                @save-analysis="handleSaveAnalysis"
                @view-original="handleViewOriginal"
                @update-tech-route="handleUpdateTechRoute"
                @update-project-info="handleUpdateProjectInfo"
                @update-expected-results="handleUpdateExpectedResults"
                @update-team-config="handleUpdateTeamConfig"
              />

              <!-- 第三步：智能任务拆解 -->
              <TaskDecompositionStep 
                v-if="currentStep === 3"
                :decomposition-data="mockDecompositionData"
                @intelligent-decompose="handleIntelligentDecompose"
                @manual-add-task="handleManualAddTask"
                @edit-task="handleEditTask"
                @decompose-task="handleDecomposeTask"
                @set-deadline="handleSetDeadline"
                @save-decomposition="handleSaveDecomposition"
              />

              <!-- 第四步：任务分配 -->
              <TaskAssignmentStep 
                v-if="currentStep === 4"
                :assignment-data="mockAssignmentData"
                @assign-task="handleAssignTask"
                @intelligent-assign="handleIntelligentAssign"
                @batch-assign="handleBatchAssign"
                @send-notification="handleSendNotification"
                @view-gantt="handleViewGantt"
              />

              <!-- 第五步：进展监控与审查 -->
              <ProgressMonitoringStep 
                v-if="currentStep === 5"
                :monitoring-data="mockMonitoringData"
                @review-submission="handleReviewSubmission"
                @batch-review="handleBatchReview"
                @export-report="handleExportProgressReport"
                @send-reminder="handleSendReminder"
                @view-statistics="handleViewStatistics"
              />
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <a-empty description="请选择一个项目开始管理">
        <a-button type="primary" @click="handleCreateProject">
          创建新项目
        </a-button>
      </a-empty>
    </div>

    <!-- 弹窗组件 -->
    <ReviewDetailModal 
      v-model:visible="reviewDetailVisible"
      :review-item="currentReviewItem"
      @review-complete="handleReviewComplete"
    />

    <ProposalViewModal 
      v-model:visible="proposalViewVisible"
      :proposal="selectedProject?.proposalDocument"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  ReloadOutlined, 
  ExportOutlined,
  ExperimentOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 导入步骤组件
import TeamConfigurationStep from './components/TeamConfigurationStep.vue'
import ProposalAnalysisStep from './components/ProposalAnalysisStep.vue'
import TaskDecompositionStep from './components/TaskDecompositionStep.vue'
import TaskAssignmentStep from './components/TaskAssignmentStep.vue'
import ProgressMonitoringStep from './components/ProgressMonitoringStep.vue'

// 导入弹窗组件
import ReviewDetailModal from './components/ReviewDetailModal.vue'
import ProposalViewModal from './components/ProposalViewModal.vue'

const router = useRouter()

// 响应式数据
const selectedProjectId = ref(null)
const currentStep = ref(1) // 当前步骤
const reviewDetailVisible = ref(false)
const proposalViewVisible = ref(false)
const currentReviewItem = ref(null)

// 步骤名称
const stepNames = ref([
  '团队配置',
  '申报书解析', 
  '任务拆解',
  '任务分配',
  '进展监控'
])

// 整体完成度
const overallProgress = ref(35)

// 模拟项目列表数据
const projectList = ref([
  {
    id: 'P001',
    name: 'XXX科研项目',
    proposalStatus: 'parsed',
    techRouteCount: 4,
    memberCount: 6,
    lastUpdate: '2025-01-29 14:30',
    currentStep: 3,
    overallProgress: 35
  },
  {
    id: 'P002',
    name: 'YYY技术研发项目',
    proposalStatus: 'parsing',
    techRouteCount: 3,
    memberCount: 4,
    lastUpdate: '2025-01-28 16:20',
    currentStep: 2,
    overallProgress: 20
  },
  {
    id: 'P003',
    name: 'ZZZ创新研究',
    proposalStatus: 'failed',
    techRouteCount: 0,
    memberCount: 3,
    lastUpdate: '2025-01-27 09:15',
    currentStep: 1,
    overallProgress: 10
  }
])

// 计算属性
const selectedProject = computed(() => {
  return projectList.value.find(p => p.id === selectedProjectId.value)
})

// 模拟数据
const mockTeamData = ref({
  projectManager: {
    id: 'PL001',
    name: '张三',
    role: '项目负责人'
  },
  members: [
    {
      id: 'M001',
      name: '李四',
      role: '任务负责人',
      skills: ['系统架构', '算法设计'],
      workload: 80,
      capacity: 40
    },
    {
      id: 'M002',
      name: '王五',
      role: '团队成员',
      skills: ['前端开发', '接口开发'],
      workload: 60,
      capacity: 40
    },
    {
      id: 'M003',
      name: '赵六',
      role: '团队成员',
      skills: ['质量保证', '性能测试'],
      workload: 70,
      capacity: 40
    }
  ]
})

const mockProposalData = ref({
  title: 'XXX科研项目申报书',
  researchPeriod: '24个月',
  totalBudget: '100万元',
  technicalRoute: [
    {
      id: 'TR001',
      phase: '需求分析与调研',
      duration: 3,
      description: '用户需求调研、技术可行性分析、竞品分析报告',
      subTasks: ['用户需求调研', '技术可行性分析', '竞品分析报告']
    },
    {
      id: 'TR002',
      phase: '系统设计与架构',
      duration: 4,
      description: '系统架构设计、数据库设计、接口设计',
      subTasks: ['系统架构设计', '数据库设计', '接口设计']
    }
  ]
})

const mockDecompositionData = ref({
  phases: [
    {
      id: 'P001',
      name: '需求分析与调研',
      tasks: [
        {
          id: 'T001',
          title: '用户需求调研',
          level: 1,
          subTasks: [
            {
              id: 'T001-1',
              title: '问卷设计',
              deadline: '2025-02-15',
              estimatedHours: 16,
              submissionRequirements: {
                needAttachment: true,
                format: '调研问卷+设计说明',
                template: {
                  sections: [
                    {
                      title: '问卷设计思路',
                      type: 'richtext',
                      required: true
                    },
                    {
                      title: '问卷内容',
                      type: 'attachment',
                      required: true
                    }
                  ]
                }
              }
            },
            {
              id: 'T001-2',
              title: '用户访谈',
              deadline: '2025-02-28',
              estimatedHours: 24,
              submissionRequirements: {
                needAttachment: true,
                format: '访谈记录+分析报告'
              }
            }
          ]
        }
      ]
    }
  ]
})

const mockAssignmentData = ref({
  unassignedTasks: [
    {
      id: 'T001-1',
      title: '问卷设计',
      estimatedHours: 16,
      deadline: '2025-02-15',
      priority: 'high'
    },
    {
      id: 'T001-2',
      title: '用户访谈',
      estimatedHours: 24,
      deadline: '2025-02-28',
      priority: 'medium'
    }
  ],
  assignedTasks: [
    {
      id: 'T002-1',
      title: '技术调研',
      assignedTo: 'M001',
      assignedToName: '李四',
      status: 'assigned',
      priority: 'high'
    }
  ],
  memberWorkload: [
    { id: 'M001', name: '李四', workload: 85 },
    { id: 'M002', name: '王五', workload: 70 },
    { id: 'M003', name: '赵六', workload: 60 }
  ]
})

const mockMonitoringData = ref({
  overallStats: {
    totalTasks: 24,
    completedTasks: 8,
    inProgressTasks: 6,
    pendingTasks: 10,
    overallProgress: 33
  },
  weeklySubmissions: [
    {
      id: 'SUB001',
      submittedBy: 'M001',
      submittedByName: '李四',
      memberRole: '任务负责人',
      taskId: 'T001',
      taskTitle: '系统架构设计进展',
      submitTime: '2025-08-20 14:30',
      contentSummary: '完成了核心模块的架构设计，包含用户管理、权限控制、数据流转等关键组件的详细设计。',
      attachments: ['架构设计文档v2.0.pdf', '技术选型报告.docx'],
      status: 'pending',
      formattedContent: {
        findings: '完成了核心模块的架构设计，确定了系统的整体技术方案和实现路径。通过深入分析业务需求，设计了可扩展的微服务架构，为后续开发奠定了坚实基础。',
        details: '本周主要完成了用户管理、权限控制、数据流转等关键组件的详细设计。采用Spring Boot + Vue3技术栈，设计了RESTful API接口规范，确保前后端分离架构的高效协作。完成了数据库表结构设计，包括用户表、角色表、权限表等核心业务表。',
        sources: '通过对现有系统的深入分析，结合业务需求调研结果，参考了Spring官方文档、阿里巴巴Java开发手册等业界最佳实践。主要依据包括：需求分析文档v1.2、技术调研报告、现有系统架构评估报告。',
        nextSteps: '1. 完成详细的API接口设计文档；2. 搭建开发环境和CI/CD流程；3. 开始用户管理模块的编码实现；4. 与前端团队对接接口规范和数据格式。预计下周完成接口设计，两周内开始核心模块编码。',
        difficulties: '在技术选型过程中遇到了一些挑战：1. 微服务拆分粒度需要进一步权衡；2. 分布式事务处理方案需要深入研究；3. 团队成员对Spring Cloud组件的熟悉程度有待提升。已制定相应的技术培训计划和解决方案。'
      }
    },
    {
      id: 'SUB002',
      submittedBy: 'M002',
      submittedByName: '王五',
      memberRole: '团队成员',
      taskId: 'T002',
      taskTitle: '前端开发进展',
      submitTime: '2025-08-21 16:45',
      contentSummary: '完成了用户登录模块，正在进行主界面的开发，预计本周内完成基础框架搭建。',
      attachments: ['登录模块演示视频.mp4'],
      status: 'reviewed',
      rating: 'excellent',
      formattedContent: {
        findings: '成功完成了用户登录模块的开发和测试，实现了安全的身份认证机制。登录界面美观实用，用户体验良好，为整个系统的前端开发奠定了基础。',
        details: '本周完成了登录页面的UI设计和功能实现，包括用户名密码验证、记住密码、忘记密码等功能。采用Vue3 + Ant Design Vue技术栈，实现了响应式布局，支持PC端和移动端访问。集成了JWT token认证机制，确保用户会话安全。',
        sources: '参考了Ant Design官方设计规范、Vue3官方文档，以及公司现有系统的UI风格指南。主要依据包括：前端开发规范v2.1、UI设计稿、用户体验测试报告。',
        nextSteps: '1. 完成主界面框架搭建；2. 实现用户权限控制组件；3. 开发通用的表格和表单组件；4. 进行跨浏览器兼容性测试。预计下周完成主界面开发，本月底完成基础组件库。',
        difficulties: '在开发过程中遇到的主要问题：1. Vue3的组合式API学习曲线较陡；2. 移动端适配需要额外的调试时间；3. 与后端API接口联调时发现数据格式不一致。已通过技术分享和团队协作逐步解决。'
      }
    },
    {
      id: 'SUB003',
      submittedBy: 'M003',
      submittedByName: '赵六',
      memberRole: '团队成员',
      taskId: 'T003',
      taskTitle: '测试用例编写',
      submitTime: '2025-08-22 10:20',
      contentSummary: '编写了核心功能的测试用例，覆盖率达到85%，发现并记录了3个潜在问题。',
      attachments: ['测试报告.xlsx', '缺陷记录表.docx'],
      status: 'reviewed',
      rating: 'good',
      formattedContent: {
        findings: '完成了核心功能模块的测试用例设计和编写，测试覆盖率达到85%。通过系统性的测试发现了3个潜在问题，为系统质量提升提供了重要依据。',
        details: '本周主要完成了用户管理、权限控制、数据处理等核心模块的测试用例编写。采用黑盒测试和白盒测试相结合的方法，设计了功能测试、边界测试、异常测试等多种测试场景。使用JUnit5和Mockito框架编写了单元测试，确保代码质量。',
        sources: '参考了软件测试标准规范、公司测试流程文档，以及业界测试最佳实践。主要依据包括：测试计划v1.3、需求规格说明书、系统设计文档、测试规范手册。',
        nextSteps: '1. 完善剩余15%的测试用例覆盖；2. 执行集成测试和系统测试；3. 建立自动化测试框架；4. 协助开发团队修复发现的问题。预计下周完成全部测试用例，两周内建立自动化测试环境。',
        difficulties: '在测试过程中遇到的主要困难：1. 部分业务逻辑复杂，测试场景设计困难；2. 测试环境搭建耗时较长；3. 与开发团队的沟通协调需要进一步加强。已制定详细的解决方案和改进计划。'
      }
    },
    {
      id: 'SUB004',
      submittedBy: 'M001',
      submittedByName: '李四',
      memberRole: '任务负责人',
      taskId: 'T004',
      taskTitle: '数据库设计优化',
      submitTime: '2025-08-19 09:15',
      contentSummary: '对数据库表结构进行了优化，提升了查询性能，完成了索引设计和分区策略。',
      attachments: ['数据库优化报告.pdf', 'SQL脚本.sql'],
      status: 'pending',
      formattedContent: {
        findings: '通过数据库性能分析和优化，成功提升了系统查询性能30%以上。完成了核心业务表的索引优化和分区设计，为系统高并发访问奠定了基础。',
        details: '本周主要完成了用户表、订单表、日志表等核心业务表的结构优化。重新设计了索引策略，包括联合索引、覆盖索引的合理使用。实施了表分区方案，按时间维度对大数据量表进行分区存储。优化了慢查询SQL，平均查询时间从500ms降低到150ms。',
        sources: '参考了MySQL官方性能优化指南、《高性能MySQL》技术书籍，以及公司DBA团队的优化经验。主要依据包括：数据库性能测试报告、慢查询日志分析、业务访问量统计数据。',
        nextSteps: '1. 完成剩余业务表的优化工作；2. 建立数据库监控和告警机制；3. 制定数据备份和恢复策略；4. 进行压力测试验证优化效果。预计下周完成全部优化工作，建立完整的数据库运维体系。',
        difficulties: '在优化过程中遇到的主要挑战：1. 历史数据迁移风险较高，需要谨慎操作；2. 部分复杂查询的优化需要业务逻辑配合调整；3. 分区策略的选择需要综合考虑多个因素。已制定详细的风险控制和回滚方案。'
      }
    },
    {
      id: 'SUB005',
      submittedBy: 'M002',
      submittedByName: '王五',
      memberRole: '团队成员',
      taskId: 'T002',
      taskTitle: '前端开发进展',
      submitTime: '2025-08-18 15:30',
      contentSummary: '完成了响应式布局的调整，修复了移动端兼容性问题，优化了页面加载速度。',
      attachments: ['移动端测试截图.zip', '性能优化报告.pdf'],
      status: 'reviewed',
      rating: 'good',
      formattedContent: {
        findings: '成功完成了系统的响应式布局优化，解决了移动端兼容性问题。页面加载速度提升了40%，用户体验显著改善，为系统的移动端推广奠定了基础。',
        details: '本周主要完成了CSS媒体查询的优化，实现了在不同屏幕尺寸下的自适应布局。修复了iOS Safari和Android Chrome浏览器的兼容性问题。通过代码分割、懒加载、图片压缩等技术手段，将首屏加载时间从3.2秒优化到1.9秒。',
        sources: '参考了Google Web性能优化指南、MDN响应式设计文档，以及移动端开发最佳实践。主要依据包括：移动端设计规范、性能测试报告、用户体验调研结果。',
        nextSteps: '1. 完成剩余页面的响应式适配；2. 进行更多设备的兼容性测试；3. 实施PWA技术提升用户体验；4. 建立前端性能监控体系。预计下周完成全部页面适配，月底实现PWA功能。',
        difficulties: '在优化过程中遇到的主要问题：1. 不同浏览器的CSS支持差异较大；2. 图片资源优化需要平衡质量和大小；3. 第三方组件库的移动端适配存在局限性。已通过polyfill、CDN加速等技术手段逐步解决。'
      }
    }
  ]
})

// 方法定义
const handleProjectChange = (projectId) => {
  console.log('项目切换:', projectId)
  const project = projectList.value.find(p => p.id === projectId)
  if (project) {
    currentStep.value = project.currentStep || 1
    overallProgress.value = project.overallProgress || 0
  }
  loadProjectData(projectId)
}

const loadProjectData = (projectId) => {
  console.log('加载项目数据:', projectId)
}

const refreshData = () => {
  message.success('数据刷新成功')
  if (selectedProjectId.value) {
    loadProjectData(selectedProjectId.value)
  }
}

const exportReport = () => {
  message.success('报告导出成功')
}

const handleCreateProject = () => {
  router.push('/project/create')
}

// 选项卡相关方法
const onStepChange = (step) => {
  console.log('步骤切换:', step)
  currentStep.value = step
}

const jumpToStep = ({ key }) => {
  currentStep.value = parseInt(key)
  message.info(`跳转到第${key}步：${stepNames.value[key - 1]}`)
}

const getTabTitle = (stepNumber, stepName) => {
  const status = getStepStatus(stepNumber)
  const icon = getStepIcon(status)
  return `${icon} ${stepNumber}.${stepName}`
}

const getStepStatus = (stepNumber) => {
  if (stepNumber < currentStep.value) return 'completed'
  if (stepNumber === currentStep.value) return 'current'
  return 'pending'
}

const getStepIcon = (status) => {
  const iconMap = {
    'completed': '✅',
    'current': '🔄',
    'pending': '⏳'
  }
  return iconMap[status] || '⏳'
}

// 第一步：团队配置相关方法
const handleSaveTeamConfig = (teamConfig) => {
  console.log('保存团队配置:', teamConfig)
  message.success('团队配置已保存')
}

const handleAddMember = (memberData) => {
  console.log('添加成员:', memberData)
  message.success('成员添加成功')
}

const handleEditMember = (memberData) => {
  console.log('编辑成员:', memberData)
  message.success('成员信息已更新')
}

const handleRemoveMember = (memberId) => {
  console.log('移除成员:', memberId)
  message.success('成员已移除')
}

// 第二步：申报书解析相关方法
const handleParseProposal = () => {
  console.log('解析申报书')
  message.success('申报书解析完成')
}

const handleEditTechRoute = (routeData) => {
  console.log('编辑技术路线:', routeData)
  message.success('技术路线已更新')
}

const handleSaveAnalysis = (analysisData) => {
  console.log('保存解析结果:', analysisData)
  message.success('解析结果已保存')
}

const handleViewOriginal = () => {
  proposalViewVisible.value = true
}

// 豆包JSON解析结果处理方法
const handleUpdateTechRoute = (techRouteData) => {
  console.log('更新技术路线数据:', techRouteData)
  // 确保数据格式正确并触发响应式更新
  const formattedData = techRouteData.map((route, index) => ({
    id: route.id || `TR${String(index + 1).padStart(3, '0')}`,
    phase: route.phase || '未命名阶段',
    duration: route.duration || 0,
    description: route.description || '',
    subTasks: Array.isArray(route.subTasks) ? route.subTasks : [],
    difficulty: route.difficulty || 'medium',
    riskLevel: route.riskLevel || 'medium'
  }))
  
  // 使用Vue的响应式更新方式
  mockProposalData.value = {
    ...mockProposalData.value,
    technicalRoute: formattedData
  }
  
  console.log('技术路线更新后的数据:', mockProposalData.value.technicalRoute)
  message.success(`技术路线已更新，包含 ${formattedData.length} 个阶段`)
}

const handleUpdateProjectInfo = (projectInfo) => {
  console.log('更新项目基本信息:', projectInfo)
  // 更新项目基本信息
  Object.assign(mockProposalData.value, {
    title: projectInfo.title || mockProposalData.value.title,
    researchPeriod: projectInfo.researchPeriod || mockProposalData.value.researchPeriod,
    totalBudget: projectInfo.totalBudget || mockProposalData.value.totalBudget,
    projectType: projectInfo.projectType,
    field: projectInfo.field,
    leader: projectInfo.leader,
    organization: projectInfo.organization
  })
  message.success('项目基本信息已更新')
}

const handleUpdateExpectedResults = (expectedResults) => {
  console.log('更新预期成果信息:', expectedResults)
  // 更新预期成果数据
  mockProposalData.value.expectedResults = expectedResults
  message.success('预期成果信息已更新')
}

const handleUpdateTeamConfig = (teamConfig) => {
  console.log('更新团队配置信息:', teamConfig)
  // 更新团队配置数据到 mockTeamData
  if (teamConfig.projectManager) {
    mockTeamData.value.projectManager = teamConfig.projectManager
  }
  if (teamConfig.members && Array.isArray(teamConfig.members)) {
    // 合并新的团队成员数据
    teamConfig.members.forEach(newMember => {
      const existingIndex = mockTeamData.value.members.findIndex(m => m.name === newMember.name)
      if (existingIndex >= 0) {
        // 更新现有成员
        Object.assign(mockTeamData.value.members[existingIndex], newMember)
      } else {
        // 添加新成员
        mockTeamData.value.members.push({
          id: `M${String(mockTeamData.value.members.length + 1).padStart(3, '0')}`,
          ...newMember
        })
      }
    })
  }
  message.success('团队配置信息已更新')
}

// 第三步：任务拆解相关方法
const handleIntelligentDecompose = () => {
  console.log('智能拆解任务')
  message.success('任务智能拆解完成')
}

const handleManualAddTask = (taskData) => {
  console.log('手动添加任务:', taskData)
  message.success('任务添加成功')
}

const handleEditTask = (taskData) => {
  console.log('编辑任务:', taskData)
  message.success('任务已更新')
}

const handleDecomposeTask = (taskId) => {
  console.log('分解任务:', taskId)
  message.success('任务分解完成')
}

const handleSetDeadline = (taskId, deadline) => {
  console.log('设置截止时间:', taskId, deadline)
  message.success('截止时间已设置')
}

const handleSaveDecomposition = (decompositionData) => {
  console.log('保存拆解结果:', decompositionData)
  message.success('拆解结果已保存')
}

// 第四步：任务分配相关方法
const handleAssignTask = (assignmentData) => {
  console.log('分配任务:', assignmentData)
  message.success('任务分配成功')
}

const handleIntelligentAssign = () => {
  console.log('智能分配任务')
  message.success('智能分配完成')
}

const handleBatchAssign = (assignments) => {
  console.log('批量分配:', assignments)
  message.success(`批量分配 ${assignments.length} 个任务`)
}

const handleSendNotification = (taskIds) => {
  console.log('发送通知:', taskIds)
  message.success('任务通知已发送')
}

const handleViewGantt = () => {
  console.log('查看甘特图')
  message.info('跳转到甘特图页面')
}

// 第五步：进展监控相关方法
const handleReviewSubmission = (submission) => {
  currentReviewItem.value = submission
  reviewDetailVisible.value = true
}

const handleBatchReview = (submissions) => {
  console.log('批量审查:', submissions)
  message.success(`批量审查 ${submissions.length} 项提交`)
}

const handleExportProgressReport = () => {
  console.log('导出进展报告')
  message.success('进展报告导出成功')
}

const handleSendReminder = (memberIds) => {
  console.log('发送提醒:', memberIds)
  message.success('提醒已发送')
}

const handleViewStatistics = () => {
  console.log('查看统计分析')
  message.info('跳转到统计分析页面')
}

const handleReviewComplete = (reviewResult) => {
  console.log('审查完成:', reviewResult)
  message.success('审查完成')
  reviewDetailVisible.value = false
}

// 生命周期
onMounted(() => {
  if (projectList.value.length > 0) {
    selectedProjectId.value = projectList.value[0].id
    handleProjectChange(selectedProjectId.value)
  }
})

// 监听项目变化
watch(selectedProjectId, (newProjectId) => {
  if (newProjectId) {
    handleProjectChange(newProjectId)
  }
})
</script>

<style scoped>
.implementation-v2-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  color: #234fa2;
  margin: 0 0 8px 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-desc {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.project-selector-section {
  margin-bottom: 24px;
}

.selector-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.selector-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.project-select {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-select label {
  font-weight: 500;
  color: #234fa2;
  white-space: nowrap;
}

.project-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  color: #8c8c8c;
  font-size: 14px;
}

.main-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
  overflow: hidden;
}

.step-tabs-container {
  width: 100%;
}

.step-tabs {
  width: 100%;
}

.step-tabs :deep(.ant-tabs-nav) {
  background: #f8fafc;
  margin: 0;
  padding: 0 24px;
}

.step-tabs :deep(.ant-tabs-tab) {
  font-weight: 500;
  font-size: 16px;
  padding: 16px 24px;
  border-radius: 8px 8px 0 0;
  margin-right: 8px;
}

.step-tabs :deep(.ant-tabs-tab-active) {
  background: #fff;
  border-bottom: 2px solid #234fa2;
}

.step-tabs :deep(.ant-tabs-content-holder) {
  background: #fff;
}

.tab-content {
  padding: 24px;
  min-height: 600px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .step-tabs :deep(.ant-tabs-tab) {
    font-size: 14px;
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .implementation-v2-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .selector-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .project-info {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .step-tabs :deep(.ant-tabs-nav) {
    padding: 0 16px;
  }

  .step-tabs :deep(.ant-tabs-tab) {
    font-size: 12px;
    padding: 8px 12px;
    margin-right: 4px;
  }

  .tab-content {
    padding: 16px;
  }
}
</style>