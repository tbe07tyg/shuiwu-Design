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
      <h3>第一步：团队配置</h3>
      <p>配置项目团队成员，设定角色和专长，评估工作负荷和能力匹配。</p>
    </div>

         <!-- 项目负责人信息 -->
     <a-card title="项目负责人" class="manager-card" :bordered="false">
      <div class="manager-info">
        <a-avatar size="large" :src="teamData.projectManager?.avatar">
          {{ teamData.projectManager?.name?.charAt(0) }}
        </a-avatar>
        <div class="manager-details">
          <h4>{{ teamData.projectManager?.name }}</h4>
          <p>{{ teamData.projectManager?.role }}</p>
        </div>
      </div>
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
        >
          <div class="member-header">
            <a-avatar :src="member.avatar">
              {{ member.name?.charAt(0) }}
            </a-avatar>
            <div class="member-basic">
              <h4>{{ member.name }}</h4>
              <p class="role">{{ member.role }}</p>
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
                  <a-menu-item @click="handleRemoveMember(member.id)">
                    <DeleteOutlined />
                    移除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>

          <div class="member-details">
            <div class="detail-item">
              <span class="label">专长：</span>
              <div class="skills">
                <a-tag v-for="skill in member.skills" :key="skill" size="small">
                  {{ skill }}
                </a-tag>
              </div>
            </div>
            
            <div class="detail-item">
              <span class="label">工作负荷：</span>
              <div class="workload">
                <a-progress 
                  :percent="member.workload" 
                  size="small" 
                  :stroke-color="getWorkloadColor(member.workload)"
                />
                <span class="workload-text">{{ member.workload }}%</span>
              </div>
            </div>

            <div class="detail-item">
              <span class="label">周工作时长：</span>
              <span>{{ member.capacity }}小时/周</span>
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

    <!-- 团队统计 -->
    <a-card title="团队统计" class="stats-card" :bordered="false">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-statistic 
            title="团队总人数" 
            :value="teamStats.totalMembers"
            :value-style="{ color: '#234fa2' }"
          >
            <template #suffix>人</template>
          </a-statistic>
        </a-col>

        <a-col :span="6">
          <a-statistic 
            title="总工作时长" 
            :value="teamStats.totalCapacity"
            :value-style="{ color: '#faad14' }"
          >
            <template #suffix>小时/周</template>
          </a-statistic>
        </a-col>

        <a-col :span="6">
          <a-statistic 
            title="单人最大任务数" 
            :value="teamStats.maxTasksPerMember"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #suffix>个</template>
          </a-statistic>
        </a-col>

        <a-col :span="6">
          <a-statistic 
            title="空闲团队成员数" 
            :value="teamStats.idleMembers"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>人</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-row :gutter="24" style="margin-top: 16px;">
        <a-col :span="6">
          <a-statistic 
            title="人均任务数" 
            :value="teamStats.averageTasksPerMember"
            :value-style="{ color: '#722ed1' }"
            :precision="1"
          >
            <template #suffix>个</template>
          </a-statistic>
        </a-col>

        <a-col :span="6">
          <a-statistic 
            title="任务分配率" 
            :value="teamStats.taskAssignmentRate"
            :value-style="{ color: '#13c2c2' }"
            :precision="1"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-col>

        <a-col :span="6">
          <a-statistic 
            title="工作负荷均衡度" 
            :value="teamStats.workloadBalance"
            :value-style="{ color: getBalanceColor(teamStats.workloadBalance) }"
            :precision="0"
          >
            <template #suffix>分</template>
          </a-statistic>
        </a-col>

        <a-col :span="6">
          <a-statistic 
            title="团队效率指数" 
            :value="teamStats.efficiencyIndex"
            :value-style="{ color: '#eb2f96' }"
            :precision="1"
          >
            <template #suffix>分</template>
          </a-statistic>
        </a-col>
      </a-row>
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

        <a-form-item label="专长技能" name="skills">
          <a-select
            v-model:value="memberForm.skills"
            mode="tags"
            placeholder="请输入或选择技能标签"
            :options="skillOptions"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="工作负荷 (%)" name="workload">
              <a-slider
                v-model:value="memberForm.workload"
                :min="0"
                :max="100"
                :marks="{ 0: '0%', 50: '50%', 100: '100%' }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="周工作时长 (小时)" name="capacity">
              <a-input-number
                v-model:value="memberForm.capacity"
                :min="1"
                :max="60"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ImportOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'

// Props
const props = defineProps({
  teamData: {
    type: Object,
    default: () => ({
      projectManager: null,
      members: []
    })
  }
})

// Emits
const emit = defineEmits([
  'save-config',
  'add-member',
  'edit-member',
  'remove-member'
])

// 响应式数据
const memberModalVisible = ref(false)
const editingMember = ref(null)
const memberFormRef = ref()

// 成员表单数据
const memberForm = reactive({
  name: '',
  role: '',
  skills: [],
  workload: 70,
  capacity: 40
})

// 表单验证规则
const memberFormRules = {
  name: [
    { required: true, message: '请输入成员姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择成员角色', trigger: 'change' }
  ],
  skills: [
    { required: true, message: '请至少选择一个技能', trigger: 'change' }
  ]
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
      averageWorkload: 0,
      totalCapacity: 0,
      skillCoverage: 0,
      maxTasksPerMember: 0,
      idleMembers: 0,
      averageTasksPerMember: 0,
      taskAssignmentRate: 0,
      workloadBalance: 100,
      efficiencyIndex: 0
    }
  }

  const totalWorkload = members.reduce((sum, member) => sum + (member.workload || 0), 0)
  const totalCapacity = members.reduce((sum, member) => sum + (member.capacity || 0), 0)
  const averageWorkload = Math.round(totalWorkload / totalMembers)
  
  // 计算技能覆盖度（简化计算）
  const allSkills = new Set()
  members.forEach(member => {
    if (member.skills) {
      member.skills.forEach(skill => allSkills.add(skill))
    }
  })
  const skillCoverage = Math.min(100, Math.round(allSkills.size * 8.33)) // 假设12个技能为100%

  // 模拟任务分配数据（实际项目中应该从props或API获取）
  const memberTaskCounts = members.map(member => {
    // 根据工作负荷模拟任务数量
    const workload = member.workload || 0
    if (workload === 0) return 0
    if (workload < 30) return Math.floor(Math.random() * 2) + 1
    if (workload < 60) return Math.floor(Math.random() * 3) + 2
    if (workload < 80) return Math.floor(Math.random() * 4) + 3
    return Math.floor(Math.random() * 6) + 4
  })

  // 计算新的统计指标
  const maxTasksPerMember = memberTaskCounts.length > 0 ? Math.max(...memberTaskCounts) : 0
  const idleMembers = members.filter(member => (member.workload || 0) < 20).length
  const totalTasks = memberTaskCounts.reduce((sum, count) => sum + count, 0)
  const averageTasksPerMember = totalMembers > 0 ? totalTasks / totalMembers : 0
  const busyMembers = members.filter(member => (member.workload || 0) > 0).length
  const taskAssignmentRate = totalMembers > 0 ? (busyMembers / totalMembers) * 100 : 0

  // 计算工作负荷均衡度（基于工作负荷的标准差）
  const workloads = members.map(m => m.workload || 0)
  const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length
  const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length
  const standardDeviation = Math.sqrt(variance)
  const workloadBalance = Math.max(0, Math.round(100 - (standardDeviation / avgWorkload) * 100))

  // 计算团队效率指数（综合多个因素）
  const efficiencyIndex = (
    (taskAssignmentRate * 0.3) + 
    (workloadBalance * 0.3) + 
    (skillCoverage * 0.2) + 
    ((100 - (idleMembers / totalMembers) * 100) * 0.2)
  ) / 10

  return {
    totalMembers,
    averageWorkload,
    totalCapacity,
    skillCoverage,
    maxTasksPerMember,
    idleMembers,
    averageTasksPerMember,
    taskAssignmentRate,
    workloadBalance: isNaN(workloadBalance) ? 100 : workloadBalance,
    efficiencyIndex: isNaN(efficiencyIndex) ? 0 : efficiencyIndex
  }
})

// 方法定义
const getWorkloadColor = (workload) => {
  if (workload >= 90) return '#ff4d4f'
  if (workload >= 80) return '#faad14'
  if (workload >= 60) return '#52c41a'
  return '#1890ff'
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
  memberForm.workload = member.workload || 70
  memberForm.capacity = member.capacity || 40
  memberModalVisible.value = true
}

const handleRemoveMember = (memberId) => {
  emit('remove-member', memberId)
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
  memberForm.workload = 70
  memberForm.capacity = 40
}

const handleMemberModalOk = async () => {
  try {
    await memberFormRef.value.validate()
    
    const memberData = {
      id: editingMember.value?.id || `M${Date.now()}`,
      name: memberForm.name,
      role: memberForm.role,
      skills: memberForm.skills,
      workload: memberForm.workload,
      capacity: memberForm.capacity
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
.stats-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.manager-details h4 {
  margin: 0 0 4px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.manager-details p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
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
  font-size: 14px;
  font-weight: 600;
}

.member-basic .role {
  margin: 0;
  color: #64748b;
  font-size: 12px;
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
  font-size: 12px;
}

.detail-item .label {
  color: #8c8c8c;
  min-width: 60px;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.workload {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.workload-text {
  color: #64748b;
  font-size: 12px;
  min-width: 30px;
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
  
  .workload {
    width: 100%;
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
