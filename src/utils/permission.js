/**
 * 权限控制工具函数
 * 基于 RuoYi 框架的权限控制规范
 */

import { ref } from 'vue'

// 模拟用户权限数据（实际项目中从后端获取）
const userPermissions = ref([
  // 项目管理权限
  'project:view',
  'project:add',
  'project:edit',
  'project:delete',
  
  // 项目调研权限
  'research:view',
  'research:requirements:list',
  'research:requirements:add',
  'research:requirements:edit',
  'research:requirements:delete',
  'research:results:list',
  'research:results:add',
  'research:results:edit',
  'research:results:delete',
  
  // 项目立项权限
  'approval:view',
  'approval:applicant:manage',
  'approval:applicant:submit',
  'approval:management:center',
  'approval:management:conclusion',
  
  // 项目实施权限
  'implementation:view',
  'implementation:center',
  'implementation:contract',
  'implementation:nodes',
  'implementation:payment',
  'implementation:progress',
  'implementation:opening',
  'implementation:midterm',
  'implementation:approval',
  'implementation:acceptance',
  
  // 项目验收权限
  'acceptance:view',
  'acceptance:applicant:manage',
  'acceptance:applicant:submit',
  'acceptance:applicant:progress',
  'acceptance:management:center',
  'acceptance:management:conclusion',
  'acceptance:management:archive',
  
  // 项目经理后台管理权限
  'project-manager:view',
  'project-manager:dashboard',
  'project-manager:projects',
  'project-manager:tasks',
  'project-manager:team',
  'project-manager:resources',
  'project-manager:analytics',
  'project-manager:help',
  'project-manager:archive',
  'project-manager:archive:completed',
  'project-manager:archive:documents',
  'project-manager:archive:statistics',
  
  // AI助手权限
  'ai-assistant:view',
  'ai-assistant:project-manager',
  'ai-assistant:team-member',
  'ai-assistant:management',
  'ai-assistant:help',
  
  // 团队成员工作台权限
  'team-member:view',
  'team-member:dashboard',
  'team-member:tasks',
  'team-member:projects',
  'team-member:skills',
  'team-member:workflow',
  'team-member:collaboration',
  'team-member:help',
  
  // 系统设置权限
  'settings:view',
  'settings:system',
  'settings:user',
  'settings:role',
  'settings:menu',
  'settings:dept',
  'settings:post',
  'settings:dict',
  'settings:param',
  'settings:log',
  'settings:material-template',
  'settings:node-template',
  
  // 维护管理权限
  'maintenance:view',
  'maintenance:project-template',
  'maintenance:material-template',
  'maintenance:budget-template',
  'maintenance:ppt-template',
  'maintenance:node-data',
  'maintenance:node-template',
  'maintenance:staff',
  
  // 统计分析权限
  'analytics:view',
  'analytics:project',
  'analytics:performance',
  'analytics:cost',
  'analytics:risk',
  
  // 成果管理权限
  'achievements:view',
  'achievements:list',
  'achievements:add',
  'achievements:edit',
  'achievements:delete',
  
  // 文献管理权限
  'literature:view',
  'literature:list',
  'literature:add',
  'literature:edit',
  'literature:delete'
])

// 角色权限映射
const rolePermissions = {
  // 超级管理员
  'super-admin': [
    '*:*:*',  // 所有权限
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
  
  // 系统管理员
  'admin': [
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
  
  // 项目经理
  'project-manager': [
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
  
  // 团队成员
  'team-member': [
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
  
  // 申报单位
  'applicant': [
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
  
  // 管理层
  'management': [
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
  ]
}

/**
 * 检查用户是否有指定权限
 * @param {string|Array} permission 权限标识
 * @returns {boolean}
 */
export function hasPermi(permission) {
  // 临时直接返回true，赋予最高权限，无需任何验证
  return true
}

/**
 * 检查用户是否有指定角色
 * @param {string|Array} role 角色标识
 * @returns {boolean}
 */
export function hasRole(role) {
  // 临时直接返回true，赋予所有角色权限
  return true
}

/**
 * 获取用户角色
 * @returns {string}
 */
export function getUserRole() {
  // 实际项目中从用户信息或token中获取
  // 临时设置为超级管理员，用于页面功能验证
  return 'super-admin'
}

/**
 * 获取用户权限列表
 * @returns {Array}
 */
export function getUserPermissions() {
  return userPermissions.value
}

/**
 * 根据角色获取权限列表
 * @param {string} role 角色标识
 * @returns {Array}
 */
export function getRolePermissions(role) {
  return rolePermissions[role] || []
}

/**
 * 权限指令
 * 用于在模板中控制元素显示
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    
    if (value && !hasPermi(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 角色指令
 * 用于在模板中控制元素显示
 */
export const role = {
  mounted(el, binding) {
    const { value } = binding
    
    if (value && !hasRole(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 路由权限守卫
 * @param {Object} to 目标路由
 * @param {Object} from 来源路由
 * @param {Function} next 下一步函数
 */
export function routePermissionGuard(to, from, next) {
  // 白名单路由，不需要权限验证
  const whiteList = ['/login', '/404', '/403']
  
  if (whiteList.includes(to.path)) {
    next()
    return
  }
  
  // 检查路由权限
  if (to.meta && to.meta.permissions) {
    if (!hasPermi(to.meta.permissions)) {
      next('/403')
      return
    }
  }
  
  next()
}

/**
 * 菜单权限过滤
 * @param {Array} menus 菜单列表
 * @returns {Array}
 */
export function filterMenusByPermission(menus) {
  return menus.filter(menu => {
    // 检查菜单权限
    if (menu.permissions && !hasPermi(menu.permissions)) {
      return false
    }
    
    // 递归过滤子菜单
    if (menu.children && menu.children.length > 0) {
      menu.children = filterMenusByPermission(menu.children)
      return menu.children.length > 0
    }
    
    return true
  })
}

/**
 * 按钮权限控制
 * @param {string|Array} permission 权限标识
 * @returns {boolean}
 */
export function canAction(permission) {
  return hasPermi(permission)
}

/**
 * 数据权限控制
 * @param {Object} data 数据对象
 * @param {string} permission 权限标识
 * @returns {boolean}
 */
export function canAccessData(data, permission) {
  // 这里可以根据数据的所有者、部门等信息进行权限判断
  // 实际项目中需要根据具体的业务逻辑实现
  return hasPermi(permission)
}

export default {
  hasPermi,
  hasRole,
  getUserRole,
  getUserPermissions,
  getRolePermissions,
  permission,
  role,
  routePermissionGuard,
  filterMenusByPermission,
  canAction,
  canAccessData
} 