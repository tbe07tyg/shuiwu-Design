/**
 * 系统集成配置文件
 * 管理各个模块之间的集成和权限控制
 */

// 模块集成配置
export const moduleIntegration = {
  // 项目实施管理模块
  projectManager: {
    name: '项目实施管理',
    path: '/project-manager',
    permissions: ['project-manager:view'],
    subModules: {
      dashboard: {
        name: '仪表板',
        path: '/project-manager/dashboard',
        permissions: ['project-manager:dashboard'],
        features: ['项目概览', '任务统计', '团队状态', '资源使用']
      },
      projects: {
        name: '项目详情管理',
        path: '/project-manager/projects',
        permissions: ['project-manager:projects'],
        features: ['项目列表', '项目详情', '项目编辑', '项目删除']
      },
      team: {
        name: '团队管理',
        path: '/project-manager/team',
        permissions: ['project-manager:team'],
        features: ['团队成员', '角色管理', '绩效评估', '技能矩阵']
      },
      resources: {
        name: '资源管理',
        path: '/project-manager/resources',
        permissions: ['project-manager:resources'],
        features: ['资源列表', '资源分配', '资源监控', '成本分析']
      },
      analytics: {
        name: '数据分析',
        path: '/project-manager/analytics',
        permissions: ['project-manager:analytics'],
        features: ['项目分析', '绩效分析', '趋势预测', '报告生成']
      }
    }
  },

  // AI助手模块
  aiAssistant: {
    name: 'AI助手',
    path: '/ai-assistant',
    permissions: ['ai-assistant:view'],
    subModules: {
      projectManager: {
        name: '项目经理助手',
        path: '/ai-assistant/project-manager',
        permissions: ['ai-assistant:project-manager'],
        features: ['项目建议', '进度监控', '风险预警', '决策支持']
      },
      teamMember: {
        name: '团队成员助手',
        path: '/ai-assistant/team-member',
        permissions: ['ai-assistant:team-member'],
        features: ['任务指导', '技能提升', '工作流程', '问题解答']
      },
      management: {
        name: '管理层助手',
        path: '/ai-assistant/management',
        permissions: ['ai-assistant:management'],
        features: ['战略分析', '投资决策', '风险预警', '绩效评估']
      }
    }
  },

  // 团队成员工作台模块
  teamMember: {
    name: '团队成员工作台',
    path: '/team-member',
    permissions: ['team-member:view'],
    subModules: {
      dashboard: {
        name: '工作台',
        path: '/team-member/dashboard',
        permissions: ['team-member:dashboard'],
        features: ['个人概览', '任务管理', '项目参与', '技能提升']
      }
    }
  }
}

// 角色权限映射
export const rolePermissions = {
  // 超级管理员
  'super-admin': {
    description: '超级管理员',
    permissions: ['*:*:*'],
    modules: ['projectManager', 'aiAssistant', 'teamMember']
  },
  
  // 系统管理员
  'admin': {
    description: '系统管理员',
    permissions: [
      'project:*:*',
      'research:*:*',
      'approval:*:*',
      'implementation:*:*',
      'acceptance:*:*',
      'project-manager:*:*',
      'ai-assistant:*:*',
      'team-member:*:*',
      'settings:*:*',
      'analytics:*:*',
      'achievements:*:*',
      'literature:*:*'
    ],
    modules: ['projectManager', 'aiAssistant', 'teamMember']
  },
  
  // 项目经理
  'project-manager': {
    description: '项目经理',
    permissions: [
      'project:view:*',
      'project:add:*',
      'project:edit:*',
      'research:view:*',
      'research:requirements:list',
      'research:requirements:add',
      'research:requirements:edit',
      'research:results:list',
      'research:results:add',
      'research:results:edit',
      'approval:view:*',
      'approval:applicant:*:*',
      'approval:management:center',
      'approval:management:conclusion',
      'implementation:view:*',
      'implementation:*:*',
      'acceptance:view:*',
      'acceptance:applicant:*:*',
      'acceptance:management:center',
      'acceptance:management:conclusion',
      'project-manager:*:*',
      'ai-assistant:view:*',
      'ai-assistant:project-manager',
      'team-member:view:*',
      'team-member:dashboard',
      'analytics:view:*',
      'analytics:*:*',
      'achievements:view:*',
      'achievements:*:*',
      'literature:view:*',
      'literature:*:*'
    ],
    modules: ['projectManager', 'aiAssistant']
  },
  
  // 团队成员
  'team-member': {
    description: '团队成员',
    permissions: [
      'project:view:*',
      'research:view:*',
      'research:requirements:list',
      'research:results:list',
      'research:results:add',
      'approval:view:*',
      'approval:applicant:submit',
      'approval:applicant:manage',
      'implementation:view:*',
      'implementation:opening',
      'implementation:midterm',
      'acceptance:view:*',
      'acceptance:applicant:submit',
      'acceptance:applicant:manage',
      'acceptance:applicant:progress',
      'ai-assistant:view:*',
      'ai-assistant:team-member',
      'team-member:*:*',
      'achievements:view:*',
      'achievements:list',
      'achievements:add',
      'literature:view:*',
      'literature:list'
    ],
    modules: ['teamMember', 'aiAssistant']
  },
  
  // 申报单位
  'applicant': {
    description: '申报单位',
    permissions: [
      'project:view:*',
      'research:view:*',
      'research:requirements:list',
      'research:results:list',
      'research:results:add',
      'approval:view:*',
      'approval:applicant:*:*',
      'implementation:view:*',
      'implementation:opening',
      'implementation:midterm',
      'acceptance:view:*',
      'acceptance:applicant:*:*',
      'ai-assistant:view:*',
      'ai-assistant:team-member',
      'team-member:view:*',
      'team-member:dashboard',
      'achievements:view:*',
      'achievements:list',
      'achievements:add',
      'literature:view:*',
      'literature:list'
    ],
    modules: ['teamMember', 'aiAssistant']
  },
  
  // 管理层
  'management': {
    description: '管理层',
    permissions: [
      'project:view:*',
      'research:view:*',
      'research:requirements:list',
      'research:results:list',
      'approval:view:*',
      'approval:management:center',
      'approval:management:conclusion',
      'implementation:view:*',
      'acceptance:view:*',
      'acceptance:management:center',
      'acceptance:management:conclusion',
      'acceptance:management:archive',
      'ai-assistant:view:*',
      'ai-assistant:management',
      'analytics:view:*',
      'analytics:*:*',
      'achievements:view:*',
      'achievements:list',
      'literature:view:*',
      'literature:list'
    ],
    modules: ['aiAssistant']
  }
}

// 数据流配置
export const dataFlow = {
  // 项目经理后台与AI助手的数据流
  projectManagerToAI: {
    source: 'projectManager',
    target: 'aiAssistant',
    dataTypes: ['projectInfo', 'taskStatus', 'teamPerformance', 'resourceUsage'],
    permissions: ['project-manager:view', 'ai-assistant:view']
  },
  
  // 团队成员工作台与AI助手的数据流
  teamMemberToAI: {
    source: 'teamMember',
    target: 'aiAssistant',
    dataTypes: ['personalTasks', 'skillLevel', 'workProgress', 'learningPlan'],
    permissions: ['team-member:view', 'ai-assistant:view']
  },
  
  // 项目经理后台与团队成员工作台的数据流
  projectManagerToTeamMember: {
    source: 'projectManager',
    target: 'teamMember',
    dataTypes: ['assignedTasks', 'projectUpdates', 'teamNotifications', 'performanceFeedback'],
    permissions: ['project-manager:view', 'team-member:view']
  }
}

// 接口预留配置
export const apiReservation = {
  // 项目经理后台API预留
  projectManager: {
    baseUrl: '/api/project-manager',
    endpoints: {
      dashboard: '/dashboard',
      projects: '/projects',
      tasks: '/tasks',
      team: '/team',
      resources: '/resources',
      analytics: '/analytics'
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  
  // AI助手API预留
  aiAssistant: {
    baseUrl: '/api/ai-assistant',
    endpoints: {
      chat: '/chat',
      suggestions: '/suggestions',
      analysis: '/analysis',
      learning: '/learning'
    },
    methods: ['GET', 'POST']
  },
  
  // 团队成员工作台API预留
  teamMember: {
    baseUrl: '/api/team-member',
    endpoints: {
      dashboard: '/dashboard',
      tasks: '/tasks',
      projects: '/projects',
      skills: '/skills',
      workflow: '/workflow'
    },
    methods: ['GET', 'POST', 'PUT']
  }
}

// 权限检查函数
export function checkModuleAccess(moduleName, permission) {
  const module = moduleIntegration[moduleName]
  if (!module) return false
  
  return module.permissions.includes(permission)
}

// 获取用户可访问的模块
export function getUserAccessibleModules(userPermissions) {
  const accessibleModules = []
  
  Object.keys(moduleIntegration).forEach(moduleKey => {
    const module = moduleIntegration[moduleKey]
    if (module.permissions.some(perm => userPermissions.includes(perm))) {
      accessibleModules.push({
        key: moduleKey,
        name: module.name,
        path: module.path,
        subModules: Object.keys(module.subModules).filter(subKey => {
          const subModule = module.subModules[subKey]
          return subModule.permissions.some(perm => userPermissions.includes(perm))
        }).map(subKey => ({
          key: subKey,
          name: module.subModules[subKey].name,
          path: module.subModules[subKey].path
        }))
      })
    }
  })
  
  return accessibleModules
}

// 数据权限检查
export function checkDataPermission(dataType, userPermissions) {
  const dataPermissions = {
    'projectInfo': ['project:view:*', 'project-manager:projects'],
    'taskStatus': ['project-manager:tasks', 'team-member:tasks'],
    'teamPerformance': ['project-manager:team', 'project-manager:analytics'],
    'resourceUsage': ['project-manager:resources'],
    'personalTasks': ['team-member:tasks'],
    'skillLevel': ['team-member:skills'],
    'workProgress': ['team-member:dashboard'],
    'learningPlan': ['team-member:skills']
  }
  
  const requiredPermissions = dataPermissions[dataType] || []
  return requiredPermissions.some(perm => userPermissions.includes(perm))
}

export default {
  moduleIntegration,
  rolePermissions,
  dataFlow,
  apiReservation,
  checkModuleAccess,
  getUserAccessibleModules,
  checkDataPermission
} 