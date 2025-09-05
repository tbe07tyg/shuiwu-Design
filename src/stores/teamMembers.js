/**
 * @file 全局团队成员管理 Store
 * @description 管理跨项目共享的团队成员数据
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTeamMembersStore = defineStore('teamMembers', () => {
  // 全局团队成员池
  const globalMembers = ref([
    {
      id: 'M001',
      name: '李四',
      role: '任务负责人',
      skills: ['系统架构', '算法设计'],
      avatar: '',
      email: 'lisi@example.com',
      phone: '13800138001',
      department: '技术部',
      joinDate: '2024-01-15',
      status: 'active' // active, inactive, busy
    },
    {
      id: 'M002',
      name: '王五',
      role: '团队成员',
      skills: ['前端开发', '接口开发'],
      avatar: '',
      email: 'wangwu@example.com',
      phone: '13800138002',
      department: '开发部',
      joinDate: '2024-02-20',
      status: 'active'
    },
    {
      id: 'M003',
      name: '赵六',
      role: '团队成员',
      skills: ['质量保证', '性能测试'],
      avatar: '',
      email: 'zhaoliu@example.com',
      phone: '13800138003',
      department: '测试部',
      joinDate: '2024-03-10',
      status: 'active'
    },
    {
      id: 'M004',
      name: '孙七',
      role: '研究员',
      skills: [],
      avatar: '',
      email: 'sunqi@example.com',
      phone: '13800138004',
      department: '研发部',
      joinDate: '2024-04-05',
      status: 'active'
    },
    {
      id: 'M005',
      name: '周八',
      role: '助理研究员',
      skills: ['数据分析'],
      avatar: '',
      email: 'zhouba@example.com',
      phone: '13800138005',
      department: '分析部',
      joinDate: '2024-05-12',
      status: 'active'
    },
    {
      id: 'M006',
      name: '吴九',
      role: '团队成员',
      skills: ['后端开发'],
      avatar: '',
      email: 'wujiu@example.com',
      phone: '13800138006',
      department: '开发部',
      joinDate: '2024-06-08',
      status: 'active'
    }
  ])

  // 项目成员映射 - 记录每个项目使用了哪些成员
  const projectMemberMappings = ref({
    'P001': ['M001', 'M002', 'M003', 'M004'],
    'P002': ['M001', 'M002', 'M005'],
    'P003': ['M003', 'M004', 'M006']
  })

  // 计算属性：活跃成员
  const activeMembers = computed(() => {
    return globalMembers.value.filter(member => member.status === 'active')
  })

  // 计算属性：按角色分组的成员
  const membersByRole = computed(() => {
    const grouped = {}
    activeMembers.value.forEach(member => {
      if (!grouped[member.role]) {
        grouped[member.role] = []
      }
      grouped[member.role].push(member)
    })
    return grouped
  })

  // 获取项目的团队成员（真正跨项目共享 - 所有项目显示全部成员）
  const getProjectMembers = (projectId) => {
    return globalMembers.value  // 所有项目都显示完整的成员池
  }

  // 获取项目的活跃参与成员ID列表（用于高亮显示）
  const getProjectActiveMembers = (projectId) => {
    if (projectId === 'ALL_PROJECTS') {
      return globalMembers.value.map(m => m.id)  // 全部项目时所有成员都高亮
    }
    return projectMemberMappings.value[projectId] || []
  }

  // 添加成员到全局池
  const addMember = (memberData) => {
    const newId = `M${String(globalMembers.value.length + 1).padStart(3, '0')}`
    const newMember = {
      id: newId,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      ...memberData
    }
    globalMembers.value.push(newMember)
    return newMember
  }

  // 更新成员信息
  const updateMember = (memberId, memberData) => {
    const index = globalMembers.value.findIndex(m => m.id === memberId)
    if (index >= 0) {
      Object.assign(globalMembers.value[index], memberData)
      return globalMembers.value[index]
    }
    return null
  }

  // 删除成员（软删除，设置为inactive）
  const removeMember = (memberId) => {
    const member = globalMembers.value.find(m => m.id === memberId)
    if (member) {
      member.status = 'inactive'
      return true
    }
    return false
  }

  // 为项目分配成员
  const assignMemberToProject = (projectId, memberId) => {
    if (!projectMemberMappings.value[projectId]) {
      projectMemberMappings.value[projectId] = []
    }
    if (!projectMemberMappings.value[projectId].includes(memberId)) {
      projectMemberMappings.value[projectId].push(memberId)
    }
  }

  // 从项目中移除成员
  const removeMemberFromProject = (projectId, memberId) => {
    if (projectMemberMappings.value[projectId]) {
      const index = projectMemberMappings.value[projectId].indexOf(memberId)
      if (index >= 0) {
        projectMemberMappings.value[projectId].splice(index, 1)
      }
    }
  }

  // 获取成员参与的项目列表
  const getMemberProjects = (memberId) => {
    const projects = []
    Object.entries(projectMemberMappings.value).forEach(([projectId, memberIds]) => {
      if (memberIds.includes(memberId)) {
        projects.push(projectId)
      }
    })
    return projects
  }

  // 获取成员的工作负荷统计
  const getMemberWorkload = (memberId) => {
    const projects = getMemberProjects(memberId)
    return {
      totalProjects: projects.length,
      currentProjects: projects.length, // 简化处理，实际应该区分进行中和已完成
      workloadLevel: projects.length > 3 ? 'high' : projects.length > 1 ? 'medium' : 'low'
    }
  }

  return {
    // 状态
    globalMembers,
    projectMemberMappings,
    
    // 计算属性
    activeMembers,
    membersByRole,
    
    // 方法
    getProjectMembers,
    getProjectActiveMembers,
    addMember,
    updateMember,
    removeMember,
    assignMemberToProject,
    removeMemberFromProject,
    getMemberProjects,
    getMemberWorkload
  }
})
