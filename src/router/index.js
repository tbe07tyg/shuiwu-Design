import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/project-manager/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      // 日常维护
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: () => import('@/views/maintenance/_container.vue'),
        meta: { title: '日常维护', icon: 'ToolOutlined' },
        children: [
          {
            path: 'report-templates',
            name: 'MaintenanceReportTemplates',
            component: () => import('@/views/maintenance/report-templates/index.vue'),
            meta: { title: '提报模板', icon: 'FileProtectOutlined', permissions: ['maintenance:report-templates'] }
          }
        ]
      },
      {
        path: 'project',
        name: 'Project',
        component: () => import('@/views/project/index.vue')
      },
      {
        path: 'project/list',
        name: 'ProjectList',
        component: () => import('@/views/project/list.vue')
      },
      {
        path: 'project/create',
        name: 'ProjectCreate',
        component: () => import('@/views/project/create.vue')
      },
      {
        path: 'project/detail/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/project/detail.vue')
      },
      {
        path: 'project/archive',
        name: 'ProjectArchive',
        component: () => import('@/views/acceptance/management/archive.vue'),
        meta: {
          title: '历史档案',
          icon: 'DatabaseOutlined'
        }
      },
      {
        path: 'project/archive/completed',
        name: 'ProjectArchiveCompleted',
        component: () => import('@/views/project/archive/completed.vue'),
        meta: {
          title: '已完成项目',
          icon: 'FileTextOutlined'
        }
      },
      {
        path: 'project/archive/documents',
        name: 'ProjectArchiveDocuments',
        component: () => import('@/views/project/archive/documents.vue'),
        meta: {
          title: '归档文档',
          icon: 'FolderOpenOutlined'
        }
      },
      {
        path: 'project/archive/statistics',
        name: 'ProjectArchiveStatistics',
        component: () => import('@/views/project/archive/statistics.vue'),
        meta: {
          title: '归档统计',
          icon: 'BarChartOutlined'
        }
      },

      // 项目经理后台使用指南（放在归档菜单后面）
      {
        path: 'project-manager/help',
        name: 'ProjectManagerHelp',
        component: () => import('@/views/project-manager/help/index.vue'),
        meta: {
          title: '项目经理后台使用指南',
          icon: 'QuestionCircleOutlined',
          permissions: ['project-manager:help']
        }
      },
      
      // 项目调研模块路由 (第1周已开发完成)
      {
        path: 'research/requirements',
        name: 'ResearchRequirements',
        component: () => import('@/views/research/requirements/index.vue')
      },

      {
        path: 'research/results',
        name: 'ResearchResults',
        component: () => import('@/views/research/results/index.vue')
      },

      
      // 项目立项模块路由 (v3.0角色分离版本)
      // 申报单位角色路由
      {
        path: 'approval/applicant/manage',
        name: 'ApprovalApplicantManage',
        component: () => import('@/views/approval/applicant/manage.vue'),
        meta: {
          title: '申请管理',
          icon: 'FolderOutlined'
        }
      },
      {
        path: 'approval/applicant/submit',
        name: 'ApprovalApplicantSubmit',
        component: () => import('@/views/approval/applicant/submit.vue'),
        meta: {
          title: '提交立项',
          icon: 'PlusOutlined'
        }
      },

      // 管理角色路由
      {
        path: 'approval/management/center',
        name: 'ApprovalManagementCenter',
        component: () => import('@/views/approval/management/center.vue'),
        meta: {
          title: '管理中心',
          icon: 'AppstoreOutlined'
        }
      },
      {
        path: 'approval/management/conclusion',
        name: 'ApprovalManagementConclusion',
        component: () => import('@/views/approval/management/conclusion.vue'),
        meta: {
          title: '会议管理',
          icon: 'ScheduleOutlined'
        }
      },
      
      // 项目实施模块路由 (使用占位组件)
      {
        path: 'implementation/contract',
        name: 'ImplementationContract',
        component: () => import('@/views/implementation/contract/index.vue'),
        meta: {
          title: '合同管理',
          icon: 'FileTextOutlined'
        }
      },
      {
        path: 'implementation/nodes',
        name: 'ImplementationNodes',
        component: () => import('@/views/implementation/nodes/index.vue'),
        meta: {
          title: '节点管理',
          icon: 'NodeIndexOutlined'
        }
      },
      {
        path: 'implementation/payment',
        name: 'ImplementationPayment',
        component: () => import('@/views/implementation/payment/index.vue'),
        meta: {
          title: '付款管理',
          icon: 'AccountBookOutlined'
        }
      },
      {
        path: 'implementation/progress',
        name: 'ImplementationProgress',
        component: () => import('@/views/implementation/progress/index.vue'),
        meta: {
          title: '进度监控',
          icon: 'LineChartOutlined'
        }
      },

      // 项目开题整合页面 - 新增
      {
        path: 'implementation/opening',
        name: 'ImplementationOpening',
        component: () => import('@/views/implementation/opening/index.vue'),
        meta: {
          title: '项目开题',
          icon: 'RocketOutlined'
        }
      },

      // 项目中期整合页面 - 新增
      {
        path: 'implementation/midterm',
        name: 'ImplementationMidterm',
        component: () => import('@/views/implementation/midterm/index.vue'),
        meta: {
          title: '项目中期',
          icon: 'PieChartOutlined'
        }
      },

      // 项目立项整合页面 - 新增
      {
        path: 'implementation/approval',
        name: 'ImplementationApproval',
        component: () => import('@/views/implementation/approval/index.vue'),
        meta: {
          title: '项目立项',
          icon: 'AuditOutlined'
        }
      },

      // 项目验收整合页面 - 新增
      {
        path: 'implementation/acceptance',
        name: 'ImplementationAcceptance',
        component: () => import('@/views/implementation/acceptance/index.vue'),
        meta: {
          title: '项目验收',
          icon: 'CheckCircleOutlined'
        }
      },

      {
        path: 'implementation/center',
        name: 'ImplementationCenter',
        component: () => import('@/views/implementation/center/index.vue'),
        meta: {
          title: '项目实施管理中心',
          icon: 'AppstoreOutlined'
        }
      },
      {
        path: 'implementation/template',
        name: 'ImplementationTemplate',
        component: () => import('@/views/implementation/template/index.vue'),
        meta: {
          title: '节点模板库',
          icon: 'AppstoreOutlined'
        }
      },
      
      // 项目开题模块路由 (与项目验收结构相同)
      // 申报单位角色路由
      {
        path: 'opening/application/manage',
        name: 'OpeningApplicationManage',
        component: () => import('@/views/opening/applicant/manage.vue'),
        meta: {
          title: '申请管理',
          icon: 'FolderOutlined'
        }
      },
      {
        path: 'opening/application/submit',
        name: 'OpeningApplicationSubmit',
        component: () => import('@/views/opening/applicant/submit.vue'),
        meta: {
          title: '提交开题',
          icon: 'PlusOutlined'
        }
      },
      {
        path: 'opening/progress/query',
        name: 'OpeningProgressQuery',
        component: () => import('@/views/opening/applicant/progress.vue'),
        meta: {
          title: '进度查询',
          icon: 'SearchOutlined'
        }
      },
      // 管理角色路由
      {
        path: 'opening/management/center',
        name: 'OpeningManagementCenter',
        component: () => import('@/views/opening/management/center.vue'),
        meta: {
          title: '管理中心',
          icon: 'AppstoreOutlined'
        }
      },
      {
        path: 'opening/meeting/conclusion',
        name: 'OpeningMeetingConclusion',
        component: () => import('@/views/opening/management/conclusion.vue'),
        meta: {
          title: '会议管理',
          icon: 'ScheduleOutlined'
        }
      },
      
      // 项目中期模块路由 (与项目验收结构相同)
      // 申报单位角色路由
      {
        path: 'midterm/application/manage',
        name: 'MidtermApplicationManage',
        component: () => import('@/views/midterm/applicant/manage.vue'),
        meta: {
          title: '申请管理',
          icon: 'FolderOutlined'
        }
      },
      {
        path: 'midterm/application/submit',
        name: 'MidtermApplicationSubmit',
        component: () => import('@/views/midterm/applicant/submit.vue'),
        meta: {
          title: '提交中期',
          icon: 'PlusOutlined'
        }
      },
      {
        path: 'midterm/progress/query',
        name: 'MidtermProgressQuery',
        component: () => import('@/views/midterm/applicant/progress.vue'),
        meta: {
          title: '进度查询',
          icon: 'SearchOutlined'
        }
      },
      // 管理角色路由
      {
        path: 'midterm/management/center',
        name: 'MidtermManagementCenter',
        component: () => import('@/views/midterm/management/center.vue'),
        meta: {
          title: '管理中心',
          icon: 'AppstoreOutlined'
        }
      },
      {
        path: 'midterm/meeting/conclusion',
        name: 'MidtermMeetingConclusion',
        component: () => import('@/views/midterm/management/conclusion.vue'),
        meta: {
          title: '会议管理',
          icon: 'ScheduleOutlined'
        }
      },
      
      // 项目验收模块路由 (v3.0角色分离版本)
      // 申报单位角色路由
      {
        path: 'acceptance/application/manage',
        name: 'AcceptanceApplicationManage',
        component: () => import('@/views/acceptance/applicant/manage.vue'),
        meta: {
          title: '申请管理',
          icon: 'FolderOutlined'
        }
      },
      {
        path: 'acceptance/application/submit',
        name: 'AcceptanceApplicationSubmit',
        component: () => import('@/views/acceptance/applicant/submit.vue'),
        meta: {
          title: '提交验收',
          icon: 'PlusOutlined'
        }
      },
      {
        path: 'acceptance/progress/query',
        name: 'AcceptanceProgressQuery',
        component: () => import('@/views/acceptance/applicant/progress.vue'),
        meta: {
          title: '进度查询',
          icon: 'SearchOutlined'
        }
      },
      // 管理角色路由
      {
        path: 'acceptance/management/center',
        name: 'AcceptanceManagementCenter',
        component: () => import('@/views/acceptance/management/center.vue'),
        meta: {
          title: '管理中心',
          icon: 'AppstoreOutlined'
        }
      },


      {
        path: 'acceptance/meeting/conclusion',
        name: 'AcceptanceMeetingConclusion',
        component: () => import('@/views/acceptance/management/conclusion.vue'),
        meta: {
          title: '会议管理',
          icon: 'ScheduleOutlined'
        }
      },
      
      // 成果管理模块路由
      {
        path: 'achievements',
        name: 'Achievements',
        component: () => import('@/views/achievements/index.vue'),
        meta: {
          title: '成果管理',
          icon: 'TrophyOutlined'
        }
      },
      
      // 统计分析模块路由
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/analytics/index.vue'),
        meta: {
          title: '统计分析中心',
          icon: 'BarChartOutlined',
          hidden: true
        }
      },
      {
        path: 'analytics/project',
        name: 'AnalyticsProject',
        component: () => import('@/views/analytics/index.vue')
      },
      {
        path: 'analytics/finance',
        name: 'AnalyticsFinance',
        component: () => import('@/views/analytics/index.vue')
      },
      {
        path: 'analytics/efficiency',
        name: 'AnalyticsEfficiency',
        component: () => import('@/views/analytics/index.vue')
      },


      
      // 保留原有路由
      {
        path: 'literature',
        name: 'Literature',
        component: () => import('@/views/literature/index.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue')
      },
      // 材料提交模板维护
      {
        path: 'settings/material-template',
        name: 'MaterialTemplate',
        component: () => import('@/views/settings/material-template.vue'),
        meta: {
          title: '材料提交模板维护',
          icon: 'FileTextOutlined'
        }
      },
      // 提报模板维护（放在日常维护分组下）
      {
        path: 'settings/report-templates',
        name: 'SettingsReportTemplates',
        component: () => import('@/views/maintenance/report-templates/index.vue'),
        meta: {
          title: '提报模板',
          icon: 'FileProtectOutlined'
        }
      },

      {
        path: 'implementation/opening/submit',
        name: 'ImplementationOpeningSubmit',
        component: () => import('@/views/opening/applicant/submit.vue'),
        meta: { title: '项目开题-材料提交' }
      },
      {
        path: 'implementation/opening/meeting',
        name: 'ImplementationOpeningMeeting',
        component: () => import('@/views/opening/management/conclusion.vue'),
        meta: { title: '项目开题-组织会议' }
      },
      {
        path: 'implementation/midterm/submit',
        name: 'ImplementationMidtermSubmit',
        component: () => import('@/views/midterm/applicant/submit.vue'),
        meta: { title: '项目中期-材料提交' }
      },
      {
        path: 'implementation/midterm/meeting',
        name: 'ImplementationMidtermMeeting',
        component: () => import('@/views/midterm/management/conclusion.vue'),
        meta: { title: '项目中期-组织会议' }
      },
      {
        path: 'implementation/acceptance/submit',
        name: 'ImplementationAcceptanceSubmit',
        component: () => import('@/views/acceptance/applicant/submit.vue'),
        meta: { title: '项目验收-材料提交' }
      },
      {
        path: 'implementation/acceptance/meeting',
        name: 'ImplementationAcceptanceMeeting',
        component: () => import('@/views/acceptance/management/conclusion.vue'),
        meta: { title: '项目验收-组织会议' }
      },
      
      // 项目经理后台管理系统路由
      {
        path: 'project-manager/dashboard',
        name: 'ProjectManagerDashboard',
        component: () => import('@/views/project-manager/dashboard/index.vue'),
        meta: {
          title: '项目经理仪表板',
          icon: 'DashboardOutlined',
          permissions: ['project-manager:dashboard']
        }
      },
      {
        path: 'project-manager/projects',
        name: 'ProjectManagerProjects',
        component: () => import('@/views/project-manager/projects/index.vue'),
        meta: {
          title: '项目详情管理',
          icon: 'ProjectOutlined',
          permissions: ['project-manager:projects']
        }
      },
      {
        path: 'project-manager/projects/config-wizard',
        name: 'ProjectManagerProjectConfigWizard',
        component: () => import('@/views/project-manager/projects/config-wizard.vue'),
        meta: {
          title: '项目配置向导',
          icon: 'SettingOutlined',
          permissions: ['project-manager:projects']
        }
      },
      {
        path: 'project-manager/projects/monitor/:id',
        name: 'ProjectManagerProjectMonitor',
        component: () => import('@/views/project-manager/projects/monitor.vue'),
        meta: {
          title: '项目实施监控',
          icon: 'MonitorOutlined',
          permissions: ['project-manager:projects']
        }
      },
      {
        path: 'project-manager/templates',
        name: 'ProjectManagerTemplates',
        component: () => import('@/views/project-manager/templates/index.vue'),
        meta: {
          title: '项目模板管理',
          icon: 'FileTextOutlined',
          permissions: ['maintenance:project-template']
        }
      },
      {
        path: 'project-manager/projects/create',
        name: 'ProjectManagerProjectCreate',
        component: () => import('@/views/project/create.vue'),
        meta: {
          title: '手动创建项目',
          icon: 'PlusOutlined',
          permissions: ['project-manager:projects']
        }
      },
      {
        path: 'project-manager/projects/:id/edit',
        name: 'ProjectManagerProjectEdit',
        component: () => import('@/views/project-manager/projects/edit.vue'),
        meta: {
          title: '编辑项目',
          icon: 'EditOutlined',
          permissions: ['project-manager:projects']
        }
      },
      
      {
        path: 'project-manager/team',
        name: 'ProjectManagerTeam',
        component: () => import('@/views/project-manager/team/index.vue'),
        meta: {
          title: '团队管理',
          icon: 'TeamOutlined',
          permissions: ['project-manager:team']
        }
      },
      {
        path: 'project-manager/resources',
        name: 'ProjectManagerResources',
        component: () => import('@/views/project-manager/resources/index.vue'),
        meta: {
          title: '资源管理',
          icon: 'DatabaseOutlined',
          permissions: ['project-manager:resources'],
          hidden: true
        }
      },
      {
        path: 'project-manager/analytics',
        name: 'ProjectManagerAnalytics',
        component: () => import('@/views/project-manager/analytics/index.vue'),
        meta: {
          title: '数据分析',
          icon: 'BarChartOutlined',
          permissions: ['project-manager:analytics']
        }
      },
      
      // AI助手路由
      {
        path: 'ai-assistant/project-manager',
        name: 'AIAssistantProjectManager',
        component: () => import('@/views/ai-assistant/project-manager/index.vue'),
        meta: {
          title: '项目经理AI助手',
          icon: 'RobotOutlined',
          permissions: ['ai-assistant:project-manager']
        }
      },
      {
        path: 'ai-assistant/help',
        name: 'AIAssistantHelp',
        component: () => import('@/views/ai-assistant/help/index.vue'),
        meta: {
          title: 'AI助手使用指南',
          icon: 'QuestionCircleOutlined',
          permissions: ['ai-assistant:help']
        }
      },
      {
        path: 'ai-assistant/team-member',
        name: 'AIAssistantTeamMember',
        component: () => import('@/views/ai-assistant/team-member/index.vue'),
        meta: {
          title: '团队成员AI助手',
          icon: 'RobotOutlined',
          permissions: ['ai-assistant:team-member']
        }
      },
      {
        path: 'ai-assistant/management',
        name: 'AIAssistantManagement',
        component: () => import('@/views/ai-assistant/management/index.vue'),
        meta: {
          title: '管理层AI助手',
          icon: 'RobotOutlined',
          permissions: ['ai-assistant:management']
        }
      },
      
      // 团队成员任务看板路由（重构后的主页面）
      {
        path: 'team-member/tasks',
        name: 'TeamMemberTasks',
        component: () => import('@/views/team-member/tasks/index.vue'),
        meta: {
          title: '我的任务看板（v2）',
          icon: 'AppstoreOutlined',
          permissions: ['team-member:tasks']
        }
      },
      // v1 已废弃，保留占位禁用
      {
        path: 'team-member/dashboard',
        name: 'TeamMemberDashboardDeprecated',
        component: () => import('@/views/team-member/dashboard/index.vue'),
        meta: { title: '团队成员工作台（v1 已废弃）', hidden: true, deprecated: true }
      },

      // v6.0新版本路由 - 基于申报书内容的项目管理系统
      // v2 已废弃（保留路由但隐藏）
      {
        path: 'implementation-v2/center',
        name: 'ImplementationV2CenterDeprecated',
        component: () => import('@/views/implementation-v2/center/index.vue'),
        meta: { title: '项目实施管理v2（已废弃）', hidden: true, deprecated: true }
      },
      {
        path: 'implementation-v3/center',
        name: 'ImplementationV3Center',
        component: () => import('@/views/implementation-v3/center/index.vue'),
        meta: {
          title: '项目实施管理v3',
          icon: 'ProjectOutlined',
          permissions: ['project-manager:implementation-v3']
        }
      },
      {
        path: 'team-workbench-v2',
        name: 'TeamWorkbenchV2',
        component: () => import('@/views/team-workbench-v2/index.vue'),
        meta: {
          title: '团队成员工作台v2',
          icon: 'TeamOutlined',
          permissions: ['team-member:workbench-v2']
        }
      },
      
      {
        path: 'team-member/help',
        name: 'TeamMemberHelp',
        component: () => import('@/views/team-member/help/index.vue'),
        meta: {
          title: '团队成员工作台使用指南',
          icon: 'QuestionCircleOutlined',
          permissions: ['team-member:help']
        }
      },

      {
        path: 'team-member/projects/detail',
        name: 'TeamMemberProjectDetail',
        component: () => import('@/views/team-member/projects/detail.vue'),
        meta: {
          title: '项目详情',
          icon: 'ProjectOutlined',
          permissions: ['team-member:projects']
        }
      },
      
      
    ]
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 临时移除路由守卫，用于调试
// router.beforeEach((to, from, next) => {
//   console.log('路由跳转:', from.path, '->', to.path)
//   next()
// })

export default router 
