<!--
 * @file 项目实施管理v3页面 - 项目负责人端
 * @description 基于申报书内容的分步骤项目管理系统
 * @author 科研管理系统
 * @version 6.1.0
 * @date 2025-01-29
 * @reference 严格遵循《页面统一风格设计规范.md》和《项目实施管理v3页面设计文档.md》
-->
<template>
  <div class="implementation-v3-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <ExperimentOutlined />
          项目实施管理v3 - 双维度任务展示版本
        </h1>
        <p class="page-desc">基于申报书内容的分步骤项目管理 - 支持当前项目和跨项目任务统计</p>
      </div>
      <div class="header-actions">
        <!-- 刷新按钮已移除：目前使用本地数据，无需刷新功能 -->
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
              <a-select-option value="ALL_PROJECTS">
                <span style="color: #722ed1; font-weight: 600;">📊 全部项目</span>
              </a-select-option>
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
            <div v-if="currentStep !== 3" class="info-item">
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
            <!-- 选项卡内容区（每个面板渲染自己的组件，避免所有面板都显示同一步内容） -->
            <div class="tab-content">
              <template v-if="index + 1 === 1">
                <TeamConfigurationStep 
                  :team-data="getTeamDataForProject(selectedProjectId)"
                  :selected-project="selectedProject"
                  :active-member-ids="teamMembersStore.getProjectActiveMembers(selectedProjectId)"
                  @save-config="handleSaveTeamConfig"
                  @add-member="handleAddMember"
                  @edit-member="handleEditMember"
                  @remove-member="handleRemoveMember"
                  @add-to-project="handleAddToProject"
                  @remove-from-project="handleRemoveFromProject"
                />
              </template>

              <template v-else-if="index + 1 === 2">
                <ProposalAnalysisStep 
                  :selected-project="selectedProject"
                  :proposal-data="mockProposalData"
                  @parse-proposal="handleParseProposal"
                  @edit-tech-route="handleEditTechRoute"
                  @save-analysis="handleSaveAnalysis"
                  @view-original="handleViewOriginal"
                  @update-tech-route="handleUpdateTechRoute"
                  @update-project-info="handleUpdateProjectInfo"
                  @update-expected-results="handleUpdateExpectedResults"
                  @update-team-config="handleUpdateTeamConfig"
                  @next="handleNextFromAnalysis"
                />
              </template>

              <template v-else-if="index + 1 === 3">
                <TaskPlanning 
                  :extracted-tasks="analysisTaskData.extractedTasks"
                  :analysis-data="analysisTaskData.analysisData"
                  @next-step="handleNextStep" 
                />
              </template>

              <template v-else-if="index + 1 === 4">
                <ProgressMonitoringStep 
                  :monitoring-data="mockMonitoringData"
                  :planning-tasks="planningTasks"
                  @review-submission="handleReviewSubmission"
                  @batch-review="handleBatchReview"
                  @export-report="handleExportProgressReport"
                  @send-reminder="handleSendReminder"
                  @view-statistics="handleViewStatistics"
                />
              </template>
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
import { useTeamMembersStore } from '@/stores/teamMembers'
import { usePlanningStore } from '@/store/planning'
import { 
  ExportOutlined,
  ExperimentOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 导入步骤组件
import TeamConfigurationStep from './components/TeamConfigurationStep.vue'
import ProposalAnalysisStep from './components/ProposalAnalysisStep-Simple.vue'
import TaskPlanning from './pages/TaskPlanning.vue'
import ProgressMonitoringStep from './components/ProgressMonitoringStep.vue'

// 导入弹窗组件
import ReviewDetailModal from './components/ReviewDetailModal.vue'
import ProposalViewModal from './components/ProposalViewModal.vue'

const router = useRouter()

// 响应式数据
const selectedProjectId = ref('P001')
const currentStep = ref(1) // 当前步骤
const reviewDetailVisible = ref(false)
const proposalViewVisible = ref(false)
const currentReviewItem = ref(null)

// 步骤名称
const stepNames = ref([
  '团队配置',
  '申报书解析',
  '任务计划与分配',
  '进展监控'
])

// 整体完成度
const overallProgress = ref(35)

// 全局团队成员管理
const teamMembersStore = useTeamMembersStore()

// 任务策划数据管理
const planningStore = usePlanningStore()

// 获取任务策划数据，供进展监控使用
const planningTasks = computed(() => {
  return planningStore.tasks || []
})

// 模拟项目列表数据
const projectList = ref([
  {
    id: 'P001',
    name: 'XXX科研项目',
    proposalStatus: 'parsed',
    techRouteCount: 4,
    memberCount: 6,
    lastUpdate: '2025-01-29 14:30',
    currentStep: 1,
    overallProgress: 35
  },
  {
    id: 'P002',
    name: 'YYY技术研发项目',
    proposalStatus: 'parsing',
    techRouteCount: 3,
    memberCount: 4,
    lastUpdate: '2025-01-28 16:20',
    currentStep: 1,
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
  if (selectedProjectId.value === 'ALL_PROJECTS') {
    return {
      id: 'ALL_PROJECTS',
      name: '全部项目',
      proposalStatus: 'all',
      techRouteCount: 0,
      memberCount: 0,
      lastUpdate: '',
      currentStep: 1,
      overallProgress: 0
    }
  }
  return projectList.value.find(p => p.id === selectedProjectId.value)
})

// 获取项目的团队数据（兼容原有格式）
const getTeamDataForProject = (projectId) => {
  const projectMembers = teamMembersStore.getProjectMembers(projectId)
  return {
    projectManager: {
      id: 'PL001',
      name: '张三',
      role: '项目负责人'
    },
    members: projectMembers
  }
}

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
      skills: ['系统架构', '算法设计']
    },
    {
      id: 'M002',
      name: '王五',
      role: '团队成员',
      skills: ['前端开发', '接口开发']
    },
    {
      id: 'M003',
      name: '赵六',
      role: '团队成员',
      skills: ['质量保证', '性能测试']
    },
    {
      id: 'M004',
      name: '孙七',
      role: '研究员',
      skills: []
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
    // ========== 待审查提报（不同时间、不同类型） ==========
    {
      id: 'SUB001',
      submittedBy: 'M001',
      submittedByName: '李四',
      memberRole: '任务负责人',
      taskId: 'T001',
      taskTitle: '系统架构设计进展',
      submitTime: '2025-09-02 14:30',
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
      submittedBy: 'M004',
      submittedByName: '钱七',
      memberRole: '团队成员',
      taskId: 'T004',
      taskTitle: '数据库设计与优化',
      submitTime: '2025-09-03 09:15',
      contentSummary: '完成了数据库E-R图设计，优化了查询性能，建立了索引策略，提升查询效率约40%。',
      attachments: ['数据库设计文档.docx', '性能测试报告.pdf', '索引优化方案.xlsx'],
      status: 'pending',
      formattedContent: {
        findings: '通过深入的数据库设计和性能优化，成功提升了系统的整体响应速度。建立了规范的数据模型，为业务扩展提供了良好的数据基础支撑。',
        details: '本周完成了完整的E-R图设计，包含15张核心业务表和相关关联关系。针对高频查询场景建立了复合索引，优化了连接查询语句，通过explain分析确保查询执行计划最优。同时建立了数据库监控和备份策略。',
        sources: '参考了MySQL官方优化指南、《高性能MySQL》等专业资料，结合项目业务特点和数据访问模式进行针对性设计。主要依据：系统需求规格说明书、数据流程图、业务规则文档。',
        nextSteps: '1. 完成数据库物理部署和环境配置；2. 实施数据迁移方案和验证；3. 建立数据库备份恢复流程；4. 与开发团队对接ORM映射配置。计划本周完成部署，下周开始数据迁移测试。',
        difficulties: '在设计过程中主要遇到：1. 业务规则复杂度较高，部分表关联设计需要反复优化；2. 历史数据迁移方案需要详细验证；3. 并发访问控制策略需要进一步完善。已制定详细的解决方案和测试计划。'
      }
    },
    {
      id: 'SUB003',
      submittedBy: 'M005',
      submittedByName: '孙八',
      memberRole: '团队成员',
      taskId: 'T005',
      taskTitle: '用户需求调研分析',
      submitTime: '2025-09-03 16:22',
      contentSummary: '完成了200份用户问卷调研，进行了15场深度访谈，梳理出核心需求89项，优先级分析完成。',
      attachments: ['用户调研报告.pdf', '需求清单.xlsx', '用户画像分析.pptx'],
      status: 'pending',
      formattedContent: {
        findings: '通过广泛的用户调研和深度访谈，深入了解了目标用户的真实需求和使用习惯。识别出关键痛点，为产品设计提供了有力的数据支撑。',
        details: '本周完成了用户问卷设计、发放和回收，有效问卷200份，回收率85%。组织了3个用户群体共15场深度访谈，每场45-60分钟。通过数据分析，梳理出核心功能需求89项，按照重要性和紧迫性进行了四象限分析。',
        sources: '采用了专业的用户研究方法论，参考了《用户体验要素》、《精益创业》等经典理论。调研对象覆盖了目标用户的主要群体，包括新手用户、熟练用户、管理员等不同角色。',
        nextSteps: '1. 基于调研结果完成产品原型设计；2. 制定用户验收标准和测试用例；3. 与设计团队协作完成UI/UX设计；4. 规划用户反馈收集和迭代机制。预计两周内完成原型，一个月内完成设计稿。',
        difficulties: '调研过程中遇到的主要挑战：1. 不同用户群体的需求存在一定冲突，需要平衡和取舍；2. 部分用户表达需求不够明确，需要引导和深挖；3. 需求优先级评估需要更多业务专家参与。正在制定需求评审流程。'
      }
    },

    // ========== 已审查通过的提报 ==========
    {
      id: 'SUB004',
      submittedBy: 'M002',
      submittedByName: '王五',
      memberRole: '团队成员',
      taskId: 'T002',
      taskTitle: '前端开发进展',
      submitTime: '2025-08-30 16:45',
      contentSummary: '完成了用户登录模块，正在进行主界面的开发，预计本周内完成基础框架搭建。',
      attachments: ['登录模块演示视频.mp4'],
      status: 'reviewed',
      rating: 'excellent',
      reviewTime: '2025-09-02 10:30',
      reviewer: '项目负责人',
      reviewOpinion: '工作质量出色，登录模块设计美观、功能完善，代码规范性好。特别赞赏在移动端适配方面的细致工作，为团队树立了很好的开发标准。建议继续保持这种高标准的开发质量。',
      formattedContent: {
        findings: '成功完成了用户登录模块的开发和测试，实现了安全的身份认证机制。登录界面美观实用，用户体验良好，为整个系统的前端开发奠定了基础。',
        details: '本周完成了登录页面的UI设计和功能实现，包括用户名密码验证、记住密码、忘记密码等功能。采用Vue3 + Ant Design Vue技术栈，实现了响应式布局，支持PC端和移动端访问。集成了JWT token认证机制，确保用户会话安全。',
        sources: '参考了Ant Design官方设计规范、Vue3官方文档，以及公司现有系统的UI风格指南。主要依据包括：前端开发规范v2.1、UI设计稿、用户体验测试报告。',
        nextSteps: '1. 完成主界面框架搭建；2. 实现用户权限控制组件；3. 开发通用的表格和表单组件；4. 进行跨浏览器兼容性测试。预计下周完成主界面开发，本月底完成基础组件库。',
        difficulties: '在开发过程中遇到的主要问题：1. Vue3的组合式API学习曲线较陡；2. 移动端适配需要额外的调试时间；3. 与后端API接口联调时发现数据格式不一致。已通过技术分享和团队协作逐步解决。'
      }
    },
    {
      id: 'SUB005',
      submittedBy: 'M003',
      submittedByName: '赵六',
      memberRole: '团队成员',
      taskId: 'T003',
      taskTitle: '测试用例编写与执行',
      submitTime: '2025-08-29 10:20',
      contentSummary: '编写了核心功能的测试用例，覆盖率达到85%，发现并记录了3个潜在问题。',
      attachments: ['测试报告.xlsx', '缺陷记录表.docx'],
      status: 'reviewed',
      rating: 'good',
      reviewTime: '2025-09-01 14:15',
      reviewer: '项目负责人',
      reviewOpinion: '测试工作较为全面，缺陷发现及时。建议在测试用例设计时更多考虑边界条件和异常场景，提升测试覆盖率到90%以上。总体工作质量良好，继续保持。',
      formattedContent: {
        findings: '完成了核心功能模块的测试用例设计和编写，测试覆盖率达到85%。通过系统性的测试发现了3个潜在问题，为系统质量提升提供了重要依据。',
        details: '本周主要完成了用户管理、权限控制、数据处理等核心模块的测试用例编写。采用黑盒测试和白盒测试相结合的方法，设计了功能测试、边界测试、异常测试等多种测试场景。使用JUnit5和Mockito框架编写了单元测试，确保代码质量。',
        sources: '参考了软件测试标准规范、公司测试流程文档，以及业界测试最佳实践。主要依据包括：测试计划v1.3、需求规格说明书、系统设计文档、测试规范手册。',
        nextSteps: '1. 完善剩余15%的测试用例覆盖；2. 执行集成测试和系统测试；3. 建立自动化测试框架；4. 协助开发团队修复发现的问题。预计下周完成全部测试用例，两周内建立自动化测试环境。',
        difficulties: '测试过程中遇到的主要挑战：1. 部分业务逻辑复杂，测试场景设计难度较大；2. 测试环境搭建耗时较长；3. 与开发团队协调修复时间需要更好的沟通机制。已建立每日同步机制改善协作效率。'
      }
    },

    // ========== 需要修改的提报 ==========
    {
      id: 'SUB006',
      submittedBy: 'M006',
      submittedByName: '周九',
      memberRole: '团队成员',
      taskId: 'T006',
      taskTitle: '接口开发与文档编写',
      submitTime: '2025-08-28 11:30',
      contentSummary: '完成了用户管理相关接口开发，编写了API文档，但缺少详细的错误码说明。',
      attachments: ['API文档v1.0.docx', '接口测试报告.html'],
      status: 'revision_required',
      rating: 'fair',
      reviewTime: '2025-08-31 16:20',
      reviewer: '项目负责人',
      reviewOpinion: '接口开发基本完成，但文档质量需要提升。请补充：1.完整的错误码说明；2.请求响应示例；3.接口调用时序图；4.安全认证说明。请在3个工作日内补充完善。',
      formattedContent: {
        findings: '基本完成了用户管理模块的主要接口开发，包括用户注册、登录、信息修改等核心功能。接口功能基本正常，但文档规范性有待提升。',
        details: '本周完成了用户注册、登录、信息查询、密码修改等5个核心接口的开发。采用RESTful设计规范，使用Spring Boot框架实现，集成了参数校验和异常处理。初步完成了API文档编写，但部分细节描述不够完善。',
        sources: '参考了RESTful API设计最佳实践、Spring Boot官方文档，以及公司接口开发规范。主要依据：接口设计规范v2.0、系统架构设计文档、安全规范要求。',
        nextSteps: '1. 补充完整的错误码说明和处理机制；2. 添加详细的请求响应示例；3. 完善接口调用时序图和流程说明；4. 加强安全认证和权限控制说明。计划3个工作日内完成修改。',
        difficulties: '开发过程中主要问题：1. 对API文档标准不够熟悉，需要学习和改进；2. 错误处理机制设计需要更加完善；3. 安全方面的考虑不够全面。已安排专门时间学习相关规范。'
      }
    },
    {
      id: 'SUB007',
      submittedBy: 'M007',
      submittedByName: '吴十',
      memberRole: '团队成员',
      taskId: 'T007',
      taskTitle: '性能监控系统搭建',
      submitTime: '2025-08-27 15:45',
      contentSummary: '搭建了基础的监控框架，但监控指标不够全面，缺少预警机制。',
      attachments: ['监控系统部署文档.pdf', '监控截图.png'],
      status: 'revision_required',
      rating: 'fair',
      reviewTime: '2025-08-30 09:15',
      reviewer: '项目负责人',
      reviewOpinion: '监控系统基础框架已搭建，但需要完善监控维度。请增加：1.数据库连接池监控；2.接口响应时间监控；3.系统资源使用率监控；4.自动预警和通知机制。请在一周内完成改进。',
      formattedContent: {
        findings: '成功搭建了系统监控的基础框架，实现了基本的应用状态监控。为系统稳定运行提供了初步的监控保障，但监控维度还需要进一步完善。',
        details: '本周完成了基于Spring Boot Actuator的监控框架搭建，集成了Prometheus和Grafana进行数据收集和可视化展示。实现了基本的健康检查、JVM监控等功能，搭建了监控Dashboard。',
        sources: '参考了Spring Boot监控最佳实践、Prometheus官方文档，以及公司运维监控标准。主要依据：系统监控需求文档、运维规范v1.5、性能指标要求。',
        nextSteps: '1. 增加数据库连接池、缓存等中间件监控；2. 实现接口级别的性能监控；3. 建立系统资源监控和容量规划；4. 配置自动预警机制和通知系统。预计一周内完成核心监控指标，两周内建立完整预警体系。',
        difficulties: '在搭建过程中遇到：1. 监控指标的选择和配置需要更深入的理解；2. 预警阈值的设定需要更多实际数据支撑；3. 监控系统本身的高可用性需要考虑。正在深入学习相关监控理论和实践。'
      }
    },

    // ========== 不同时间段的提报（体现时间轴分布） ==========
    {
      id: 'SUB008',
      submittedBy: 'M008',
      submittedByName: '郑十一',
      memberRole: '团队成员',
      taskId: 'T008',
      taskTitle: '移动端适配开发',
      submitTime: '2025-09-25 14:20',
      contentSummary: '完成了主要页面的移动端适配，响应式布局基本实现，正在进行兼容性测试。',
      attachments: ['移动端演示视频.mp4', '兼容性测试报告.xlsx'],
      status: 'reviewed',
      rating: 'excellent',
      reviewTime: '2025-09-27 10:45',
      reviewer: '项目负责人',
      reviewOpinion: '移动端适配工作非常出色，响应式设计流畅自然，各种设备兼容性良好。特别赞赏在交互细节方面的优化，提升了用户体验。这是团队学习的好榜样。',
      formattedContent: {
        findings: '成功实现了系统主要功能页面的移动端适配，响应式设计效果良好。在不同尺寸设备上都能提供良好的用户体验，为系统的多端覆盖奠定了基础。',
        details: '本周完成了登录、首页、列表页、详情页等核心页面的移动端适配。采用CSS媒体查询和Flexbox布局实现响应式设计，优化了触摸交互体验，适配了iOS和Android主流设备。完成了5个主要浏览器的兼容性测试。',
        sources: '参考了移动端开发最佳实践、Material Design规范，以及iOS HIG设计指南。主要依据：移动端设计规范、用户体验测试报告、设备兼容性要求文档。',
        nextSteps: '1. 完成剩余页面的移动端适配；2. 优化页面加载性能和用户交互；3. 进行更全面的设备兼容性测试；4. 建立移动端自动化测试流程。预计下周完成全部适配工作。',
        difficulties: '适配过程中的主要挑战：1. 不同设备屏幕尺寸差异较大，需要精细调试；2. 部分复杂组件在小屏幕上的展示需要重新设计；3. 性能优化在移动设备上更为重要。通过迭代优化逐步解决。'
      }
    },
    {
      id: 'SUB009',
      submittedBy: 'M009',
      submittedByName: '王十二',
      memberRole: '团队成员',
      taskId: 'T009',
      taskTitle: '数据统计分析模块',
      submitTime: '2025-09-30 16:30',
      contentSummary: '完成了基础数据统计功能，实现了图表展示，正在优化查询性能和增加更多维度分析。',
      attachments: ['统计功能演示.pptx', '性能优化报告.docx'],
      status: 'pending',
      formattedContent: {
        findings: '成功实现了系统数据统计分析的基础功能，为管理决策提供了有力的数据支撑。图表展示清晰直观，用户操作便捷，为进一步的数据分析奠定了基础。',
        details: '本周完成了用户行为统计、业务数据汇总、趋势分析等核心统计功能。采用ECharts进行数据可视化，实现了柱状图、折线图、饼图等多种图表类型。集成了数据导出功能，支持Excel和PDF格式。',
        sources: '参考了数据可视化最佳实践、ECharts官方文档，以及业务分析需求。主要依据：数据分析需求文档、统计指标定义、用户体验设计规范。',
        nextSteps: '1. 增加更多维度的数据分析；2. 优化复杂查询的性能表现；3. 实现数据钻取和交互分析；4. 建立定时报告和数据推送机制。预计两周内完成性能优化，一个月内实现高级分析功能。',
        difficulties: '开发中遇到的主要问题：1. 大数据量查询时性能瓶颈明显；2. 复杂统计逻辑的SQL优化较为困难；3. 图表在不同分辨率下的适配需要调整。正在研究缓存和查询优化方案。'
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

// 存储从申报书解析传递过来的数据
const analysisTaskData = ref({
  extractedTasks: { implementation: [], technical: [], milestones: [] },
  analysisData: {}
})

// 从"申报书解析"进入"任务策划"
const handleNextFromAnalysis = (payload) => {
  console.log('📋 父组件接收到的数据:', payload)
  
  // payload: { analysisCompleted, hasAnyResult, completedCount, totalCount, extractedTasks, analysisData }
  if (!payload?.hasAnyResult) {
    message.warning('请至少完成一个模块的解析后再进入下一步')
    return
  }
  
  // 保存解析生成的任务数据
  if (payload.extractedTasks) {
    analysisTaskData.value.extractedTasks = payload.extractedTasks
    console.log('📋 保存的建议任务数据:', analysisTaskData.value.extractedTasks)
  }
  if (payload.analysisData) {
    analysisTaskData.value.analysisData = payload.analysisData
  }
  
  currentStep.value = 3
  const tip = payload.analysisCompleted ? '（三个模块均已完成）' : `（已完成 ${payload.completedCount}/${payload.totalCount} 模块）`
  
  // 显示任务数量信息
  const taskCount = (payload.extractedTasks?.implementation?.length || 0) + 
                   (payload.extractedTasks?.technical?.length || 0)
  const taskInfo = taskCount > 0 ? `，已生成${taskCount}个建议任务` : ''
  
  message.success(`已进入：任务策划 ${tip}${taskInfo}`)
}

// 从"任务策划"进入下一步
const handleNextStep = (stepNumber) => {
  currentStep.value = stepNumber
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

// 添加成员到当前项目
const handleAddToProject = ({ memberId, memberName }) => {
  console.log('添加成员到项目:', { memberId, memberName, projectId: selectedProjectId.value })
  teamMembersStore.assignMemberToProject(selectedProjectId.value, memberId)
  message.success(`已将 ${memberName} 添加到当前项目`)
}

// 从当前项目移除成员
const handleRemoveFromProject = ({ memberId, memberName }) => {
  console.log('从项目移除成员:', { memberId, memberName, projectId: selectedProjectId.value })
  teamMembersStore.removeMemberFromProject(selectedProjectId.value, memberId)
  message.success(`已将 ${memberName} 从当前项目中移除`)
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
.implementation-v3-page {
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
  gap: 16px;
  min-height: 40px;
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
  align-items: center;
  flex-shrink: 0;
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
  .implementation-v3-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .selector-content {
    gap: 8px;
  }
  
  .project-info {
    gap: 12px;
  }
  
  .project-info .info-item {
    font-size: 12px;
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