<!--
 * @file 第一步：团队配置步骤组件
 * @description 项目团队成员管理和配置
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="team-configuration-step">
    <!-- 步骤说明 -->
    <div class="step-description">
      <h3>第一步：团队配置 - v3智能版本</h3>
      <p>管理全局团队成员池，配置角色分工和专业技能。通过项目筛选可查看不同项目的参与成员，高亮边框表示当前项目的活跃参与者。</p>
      <a-alert
        message="跨项目共享说明"
        description="团队成员为真正的跨项目共享配置，所有项目都显示完整的成员池。绿色高亮边框表示当前选中项目的活跃参与成员，所有成员都可在任务分配环节中选择。"
        type="success"
        show-icon
        style="margin-top: 12px;"
      />
    </div>

    <!-- 项目概览 -->
    <a-card class="overview-card" :bordered="false">
      <template #title>
                <div class="card-title">
          <TeamOutlined />
                          <span>团队配置</span>
          <div class="manager-info-inline">
            <a-avatar :src="teamData.projectManager?.avatar">
          {{ teamData.projectManager?.name?.charAt(0) }}
        </a-avatar>
            <span class="manager-name">{{ teamData.projectManager?.name }}</span>
        </div>
      </div>
      </template>

      <!-- 团队统计信息 -->
      <a-row :gutter="20">
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.totalMembers }}</div>
            <div class="stat-label">团队总人数</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.totalCurrentTasks }}</div>
            <div class="stat-label">总进行任务</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.totalCompletedTasks }}</div>
            <div class="stat-label">总完成任务</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.idleMembers }}</div>
            <div class="stat-label">空闲成员</div>
          </div>
        </a-col>
      </a-row>
      
      <a-row :gutter="20" style="margin-top: 16px;">
        <a-col :span="12">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.averageCurrentTasks.toFixed(1) }}</div>
            <div class="stat-label">人均当前任务</div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.taskAssignmentRate.toFixed(1) }}%</div>
            <div class="stat-label">任务分配率</div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 团队成员配置 -->
    <a-card title="团队成员配置" class="members-card" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAddMember">
            <PlusOutlined />
            添加成员
          </a-button>
          <a-button @click="handleBatchImport">
            <ImportOutlined />
            批量导入
          </a-button>
        </a-space>
      </template>

      <div class="members-grid">
        <div 
          v-for="member in teamData.members" 
          :key="member.id"
          class="member-card"
          :class="{ 'active-member': isActiveMember(member.id) }"
        >
          <div class="member-header">
            <a-avatar :src="member.avatar">
              {{ member.name?.charAt(0) }}
            </a-avatar>
            <div class="member-basic">
              <h4>{{ member.name }}</h4>
              <p class="role">{{ member.role }}</p>
              <div class="project-status">
                <a-tag v-if="isActiveMember(member.id)" color="success" size="small">
                  参与当前项目
                </a-tag>
                <a-tag v-else color="default" size="small">
                  未参与当前项目
                </a-tag>
              </div>
            </div>
            <a-dropdown>
              <a-button type="text" size="small">
                <MoreOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleEditMember(member)">
                    <EditOutlined />
                    编辑
                  </a-menu-item>
                  <a-menu-item 
                    v-if="!isActiveMember(member.id)"
                    @click="handleAddToProject(member.id)"
                  >
                    <UserAddOutlined />
                    加入当前项目
                  </a-menu-item>
                  <a-menu-item 
                    v-if="isActiveMember(member.id)"
                    @click="handleRemoveFromProject(member.id)"
                  >
                    <UserDeleteOutlined />
                    退出当前项目
                  </a-menu-item>
                  <a-divider style="margin: 4px 0;" />
                  <a-menu-item @click="handleRemoveMember(member.id)" class="danger-item">
                    <DeleteOutlined />
                    删除成员
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>

          <div class="member-details">
            <!-- 专长技能（始终显示） -->
            <div class="detail-item">
              <span class="label">专长：</span>
              <div class="skills">
                <a-tag v-if="member.skills && member.skills.length > 0" v-for="skill in member.skills" :key="skill" size="small">
                  {{ skill }}
                </a-tag>
                <a-tag v-else size="small" color="default">
                  无
                </a-tag>
              </div>
            </div>
            
                        <!-- 项目任务情况 -->
            <div class="task-stats">
              <div class="project-section">
                <div class="section-title">
                  <span class="title-text">项目任务情况</span>
                  <a-tag size="small" :color="getProjectTagColor()">{{ getProjectDisplayName() }}</a-tag>
                </div>
                <div class="stat-row">
                  <div class="stat-item current-project">
                    <div class="stat-number">{{ getMemberTaskStats(member).currentTasks }}</div>
                    <div class="stat-label">进行中</div>
                  </div>
                  <div class="stat-item completed-project">
                    <div class="stat-number">{{ getMemberTaskStats(member).completedTasks }}</div>
                    <div class="stat-label">已完成</div>
                  </div>
                  <div class="stat-item pending-project">
                    <div class="stat-number">{{ getMemberTaskStats(member).pendingTasks }}</div>
                    <div class="stat-label">待开始</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!teamData.members || teamData.members.length === 0" class="empty-members">
        <a-empty description="暂无团队成员">
          <a-button type="primary" @click="handleAddMember">
            添加第一个成员
          </a-button>
        </a-empty>
      </div>
    </a-card>



    <!-- 操作按钮 -->
    <div class="step-actions">
      <a-space>
        <a-button size="large" @click="handleSaveConfig">
          <SaveOutlined />
          保存配置
        </a-button>
        <a-button type="primary" size="large" @click="handleNextStep">
          下一步：申报书解析
          <ArrowRightOutlined />
        </a-button>
      </a-space>
    </div>

    <!-- 添加/编辑成员弹窗 -->
    <a-modal
      v-model:open="memberModalVisible"
      :title="editingMember ? '编辑成员' : '添加成员'"
      width="600px"
      @ok="handleMemberModalOk"
      @cancel="handleMemberModalCancel"
    >
      <a-form
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberFormRules"
        layout="vertical"
      >
        <a-form-item label="姓名" name="name">
          <a-input v-model:value="memberForm.name" placeholder="请输入成员姓名" />
        </a-form-item>
        
                 <a-form-item label="角色" name="role">
           <a-select v-model:value="memberForm.role" placeholder="请选择角色">
             <a-select-option value="任务负责人">任务负责人</a-select-option>
             <a-select-option value="团队成员">团队成员</a-select-option>
             <a-select-option value="研究员">研究员</a-select-option>
             <a-select-option value="助理研究员">助理研究员</a-select-option>
             <a-select-option value="博士研究生">博士研究生</a-select-option>
             <a-select-option value="硕士研究生">硕士研究生</a-select-option>
           </a-select>
         </a-form-item>

        <a-form-item label="专长技能（可选）" name="skills">
          <a-select
            v-model:value="memberForm.skills"
            mode="tags"
            placeholder="请输入或选择技能标签（可选）"
            :options="skillOptions"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  ImportOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowRightOutlined,
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined
} from '@ant-design/icons-vue'

// Props
const props = defineProps({
  teamData: {
    type: Object,
    default: () => ({
      projectManager: null,
      members: []
    })
  },
  selectedProject: {
    type: Object,
    default: () => null
  },
  activeMemberIds: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'save-config',
  'add-member',
  'edit-member',
  'remove-member',
  'add-to-project',
  'remove-from-project'
])

// 响应式数据
const memberModalVisible = ref(false)
const editingMember = ref(null)
const memberFormRef = ref()

// 成员表单数据
const memberForm = reactive({
  name: '',
  role: '',
  skills: []
})

// 表单验证规则
const memberFormRules = {
  name: [
    { required: true, message: '请输入成员姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择成员角色', trigger: 'change' }
  ]
  // skills 改为非必填，移除验证规则
}

// 技能选项
const skillOptions = ref([
  { label: '理论研究', value: '理论研究' },
  { label: '实验设计', value: '实验设计' },
  { label: '数据分析', value: '数据分析' },
  { label: '算法设计', value: '算法设计' },
  { label: '系统开发', value: '系统开发' },
  { label: '文献调研', value: '文献调研' },
  { label: '报告撰写', value: '报告撰写' },
  { label: '项目管理', value: '项目管理' },
  { label: '技术验证', value: '技术验证' },
  { label: '成果转化', value: '成果转化' },
  { label: '学术交流', value: '学术交流' },
  { label: '专利申请', value: '专利申请' }
])

// 计算属性
const teamStats = computed(() => {
  const members = props.teamData.members || []
  const totalMembers = members.length
  
  if (totalMembers === 0) {
    return {
      totalMembers: 0,
      totalCurrentTasks: 0,
      totalCompletedTasks: 0,
      idleMembers: 0,
      averageCurrentTasks: 0,
      taskAssignmentRate: 0,
      taskBalance: 100,
      efficiencyIndex: 0
    }
  }

  // 计算任务统计
  let totalCurrentTasks = 0
  let totalCompletedTasks = 0
  let busyMembers = 0
  const currentTaskCounts = []

  members.forEach(member => {
    const taskStats = getMemberTaskStats(member)
    totalCurrentTasks += taskStats.currentTasks
    totalCompletedTasks += taskStats.completedTasks
    currentTaskCounts.push(taskStats.currentTasks)
    if (taskStats.currentTasks > 0) busyMembers++
  })

  const idleMembers = totalMembers - busyMembers
  const averageCurrentTasks = totalMembers > 0 ? totalCurrentTasks / totalMembers : 0
  const taskAssignmentRate = totalMembers > 0 ? (busyMembers / totalMembers) * 100 : 0

  // 计算任务负荷均衡度（基于当前任务数的标准差）
  const avgCurrentTasks = currentTaskCounts.reduce((sum, count) => sum + count, 0) / currentTaskCounts.length
  const variance = currentTaskCounts.reduce((sum, count) => sum + Math.pow(count - avgCurrentTasks, 2), 0) / currentTaskCounts.length
  const standardDeviation = Math.sqrt(variance)
  const taskBalance = avgCurrentTasks > 0 ? Math.max(0, Math.round(100 - (standardDeviation / avgCurrentTasks) * 100)) : 100

  // 计算技能覆盖度
  const allSkills = new Set()
  members.forEach(member => {
    if (member.skills) {
      member.skills.forEach(skill => allSkills.add(skill))
    }
  })
  const skillCoverage = Math.min(100, Math.round(allSkills.size * 8.33)) // 假设12个技能为100%

  // 计算团队效率指数（综合多个因素）
  const efficiencyIndex = (
    (taskAssignmentRate * 0.3) + 
    (taskBalance * 0.3) + 
    (skillCoverage * 0.2) + 
    ((totalCompletedTasks / Math.max(1, totalCurrentTasks + totalCompletedTasks)) * 100 * 0.2)
  ) / 10

  return {
    totalMembers,
    totalCurrentTasks,
    totalCompletedTasks,
    idleMembers,
    averageCurrentTasks,
    taskAssignmentRate,
    taskBalance: isNaN(taskBalance) ? 100 : taskBalance,
    efficiencyIndex: isNaN(efficiencyIndex) ? 0 : efficiencyIndex
  }
})



// 获取项目显示名称
const getProjectDisplayName = () => {
  if (props.selectedProject?.id === 'ALL_PROJECTS') {
    return '全部项目'
  }
  return props.selectedProject?.name || '当前项目'
}

// 获取项目标签颜色
const getProjectTagColor = () => {
  if (props.selectedProject?.id === 'ALL_PROJECTS') {
    return 'purple'
  }
  return 'blue'
}

// 判断成员是否为当前项目的活跃参与者
const isActiveMember = (memberId) => {
  console.log('检查成员活跃状态:', memberId, 'activeMemberIds:', props.activeMemberIds)
  return props.activeMemberIds.includes(memberId)
}

// 获取成员任务统计（根据项目筛选统一处理）
const getMemberTaskStats = (member) => {
  const seed = member.id ? parseInt(member.id.replace(/\D/g, '')) || 1 : 1
  const random1 = (seed * 9301 + 49297) % 233280 / 233280
  const random2 = (seed * 1234 + 5678) % 233280 / 233280
  
  // 判断是否显示全部项目数据
  const isAllProjects = props.selectedProject?.id === 'ALL_PROJECTS'
  
  let currentTasks = 0
  let completedTasks = 0
  let pendingTasks = 0
  
  // 根据角色生成基础数据
  if (member.role === '任务负责人') {
    currentTasks = Math.floor(random1 * 4) + 2  // 2-5个当前任务
    completedTasks = Math.floor(random2 * 8) + 3  // 3-10个完成任务
    pendingTasks = Math.floor(random1 * 3) + 1   // 1-3个待开始任务
  } else if (member.role === '研究员') {
    currentTasks = Math.floor(random1 * 3) + 1  // 1-3个当前任务
    completedTasks = Math.floor(random2 * 6) + 2  // 2-7个完成任务
    pendingTasks = Math.floor(random1 * 2) + 1   // 1-2个待开始任务
  } else if (member.role === '助理研究员') {
    currentTasks = Math.floor(random1 * 2) + 1  // 1-2个当前任务
    completedTasks = Math.floor(random2 * 4) + 1  // 1-4个完成任务
    pendingTasks = Math.floor(random1 * 2)       // 0-1个待开始任务
  } else {
    currentTasks = Math.floor(random1 * 2)      // 0-1个当前任务
    completedTasks = Math.floor(random2 * 3) + 1  // 1-3个完成任务
    pendingTasks = Math.floor(random1 * 2)       // 0-1个待开始任务
  }
  
  // 如果是全部项目，数据放大2-4倍
  if (isAllProjects) {
    const multiplier = 2 + random1 * 2
    currentTasks = Math.floor(currentTasks * multiplier)
    completedTasks = Math.floor(completedTasks * multiplier)
    pendingTasks = Math.floor(pendingTasks * multiplier)
  }
  
  return {
    currentTasks,
    completedTasks,
    pendingTasks
  }
}



const getBalanceColor = (balance) => {
  if (balance >= 80) return '#52c41a'  // 绿色 - 很好
  if (balance >= 60) return '#faad14'  // 橙色 - 一般
  if (balance >= 40) return '#ff7875'  // 浅红色 - 较差
  return '#ff4d4f'  // 红色 - 很差
}

const handleAddMember = () => {
  editingMember.value = null
  resetMemberForm()
  memberModalVisible.value = true
}

const handleEditMember = (member) => {
  editingMember.value = member
  memberForm.name = member.name
  memberForm.role = member.role
  memberForm.skills = [...(member.skills || [])]
  memberModalVisible.value = true
}

const handleRemoveMember = (memberId) => {
  emit('remove-member', memberId)
}

// 添加成员到当前项目
const handleAddToProject = (memberId) => {
  const member = props.teamData.members.find(m => m.id === memberId)
  if (!member) return
  
  emit('add-to-project', { memberId, memberName: member.name })
  message.success(`已将 ${member.name} 添加到当前项目`)
}

// 从当前项目移除成员
const handleRemoveFromProject = (memberId) => {
  const member = props.teamData.members.find(m => m.id === memberId)
  if (!member) return
  
  Modal.confirm({
    title: '确认退出项目',
    content: `确定要将 ${member.name} 从当前项目中移除吗？`,
    okText: '确认移除',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      emit('remove-from-project', { memberId, memberName: member.name })
      message.success(`已将 ${member.name} 从当前项目中移除`)
    }
  })
}

const handleBatchImport = () => {
  message.info('批量导入功能开发中')
}

const handleSaveConfig = () => {
  emit('save-config', props.teamData)
}

const handleNextStep = () => {
  // 先保存配置，然后跳转到下一步
  emit('save-config', props.teamData)
  // 这里可以触发父组件切换到下一步
  message.success('团队配置已保存，进入下一步')
}

const resetMemberForm = () => {
  memberForm.name = ''
  memberForm.role = ''
  memberForm.skills = []
}

const handleMemberModalOk = async () => {
  try {
    await memberFormRef.value.validate()
    
    const memberData = {
      id: editingMember.value?.id || `M${Date.now()}`,
      name: memberForm.name,
      role: memberForm.role,
      skills: memberForm.skills
    }

    if (editingMember.value) {
      emit('edit-member', memberData)
    } else {
      emit('add-member', memberData)
    }

    memberModalVisible.value = false
    resetMemberForm()
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const handleMemberModalCancel = () => {
  memberModalVisible.value = false
  resetMemberForm()
}
</script>

<style scoped>
.team-configuration-step {
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

.manager-card,
.members-card,
.stats-card,
.overview-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

/* 项目概览区域样式 */
.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  color: #234fa2;
}

.card-title > span {
  margin-left: 8px;
}

.manager-info-inline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manager-name {
  font-size: 16px;
  font-weight: 600;
  color: #234fa2;
}

/* 统计卡片样式 - 适合中年用户 */
.stat-card {
  background: #fafbfc;
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
  border-color: #234fa2;
  box-shadow: 0 4px 12px rgba(35,79,162,0.15);
  transform: translateY(-2px);
}



.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #234fa2;
  margin-bottom: 8px;
  line-height: 1.2;
}

.stat-label {
  font-size: 15px;
  color: #64748b;
  font-weight: 600;
  line-height: 1.4;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.member-card {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 16px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.member-card:hover {
  border-color: #234fa2;
  box-shadow: 0 2px 8px rgba(35,79,162,0.1);
}

/* 活跃成员高亮样式 */
.member-card.active-member {
  border: 2px solid #52c41a;
  background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
  position: relative;
}

.member-card.active-member::before {
  content: '参与中';
  position: absolute;
  top: -1px;
  right: -1px;
  background: #52c41a;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 0 6px 0 8px;
  font-weight: 600;
  z-index: 1;
}

.member-card.active-member:hover {
  border-color: #389e0d;
  box-shadow: 0 6px 16px rgba(82, 196, 26, 0.25);
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.member-basic {
  flex: 1;
}

.member-basic h4 {
  margin: 0 0 4px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.member-basic .role {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.member-basic .project-status {
  margin-top: 6px;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.detail-item .label {
  color: #64748b;
  min-width: 60px;
  font-weight: 600;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.task-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 项目区域样式 */
.project-section {
  padding: 12px;
  border-radius: 8px;
  background: #fafbfc;
  border: 1px solid #e6eaf2;
  border-left: 4px solid #1890ff;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: #234fa2;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 10px 6px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

/* 当前项目任务样式 */
.stat-item.current-project {
  background: #fff7e6;
  border-color: #ffd591;
}

.stat-item.completed-project {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.stat-item.pending-project {
  background: #f0f7ff;
  border-color: #91d5ff;
}



.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #234fa2;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
  line-height: 1;
}

.work-status {
  padding: 8px;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e6eaf2;
}

.status-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.capacity-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-label {
  font-size: 11px;
  color: #8c8c8c;
  font-weight: 500;
}

.capacity-text {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  padding: 2px 6px;
  background: #e6f4ff;
  border-radius: 3px;
}

.empty-members {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .members-grid {
    grid-template-columns: 1fr;
  }
  
  .member-header {
    flex-wrap: wrap;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .stat-row {
    flex-direction: column;
    gap: 6px;
  }
  
  .stat-item {
    padding: 6px 4px;
  }
  
  .stat-number {
    font-size: 14px;
  }
  
  .work-status {
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
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

/* 菜单项样式 */
:deep(.danger-item) {
  color: #ff4d4f;
}

:deep(.danger-item:hover) {
  background-color: #fff2f0;
}
</style>
