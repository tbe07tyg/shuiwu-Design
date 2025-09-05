<!--
 * @file 第四步：任务分配步骤组件
 * @description 将拆解的任务分配给团队成员，设定优先级和依赖关系
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="task-assignment-step">
    <!-- 步骤说明 -->
    <div class="step-description">
      <h3>第四步：任务分配</h3>
      <p>将拆解的任务分配给团队成员，明确任务负责人和协作人员，设定任务优先级和依赖关系，发送任务通知。</p>
      <a-alert
        message="成员来源说明"
        description="任务分配中的成员列表来自第一步团队配置，支持跨项目共享。如需调整成员，请返回团队配置步骤进行修改。"
        type="success"
        show-icon
        style="margin-top: 12px;"
      />
    </div>

    <!-- 分配操作区 -->
    <a-card title="分配操作" class="assignment-actions-card" :bordered="false">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-button type="primary" size="large" block @click="handleIntelligentAssign" :loading="assigning">
            <ThunderboltOutlined />
            {{ assigning ? '智能分配中...' : '智能分配' }}
          </a-button>
        </a-col>
        <a-col :span="6">
          <a-button size="large" block @click="handleBatchAssign">
            <TeamOutlined />
            批量分配
          </a-button>
        </a-col>
        <a-col :span="6">
          <a-button size="large" block @click="handleSendNotification">
            <BellOutlined />
            发送通知
          </a-button>
        </a-col>
        <a-col :span="6">
          <a-button size="large" block @click="handleViewGantt">
            <BarChartOutlined />
            查看甘特图
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 待分配任务列表 -->
    <a-card title="待分配任务列表" class="unassigned-tasks-card" :bordered="false">
      <div v-if="assignmentData.unassignedTasks && assignmentData.unassignedTasks.length > 0" class="unassigned-tasks">
        <div 
          v-for="task in assignmentData.unassignedTasks" 
          :key="task.id"
          class="unassigned-task-item"
        >
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <div class="task-meta">
              <a-tag :color="getPriorityColor(task.priority)">
                {{ getPriorityText(task.priority) }}
              </a-tag>
              <a-tag color="orange">{{ task.deadline }}</a-tag>
              <a-tag color="purple">{{ task.estimatedHours }}h</a-tag>
            </div>
          </div>
          <div class="assignment-controls">
            <a-select 
              placeholder="选择负责人" 
              style="width: 150px; margin-right: 8px;"
              @change="(value) => handleAssignPrimary(task.id, value)"
            >
              <a-select-option v-for="member in teamMembersData" :key="member.id" :value="member.id">
                {{ member.name }} ({{ member.role }})
              </a-select-option>
            </a-select>
            <a-select 
              placeholder="选择协作人" 
              mode="multiple"
              style="width: 150px; margin-right: 8px;"
              @change="(value) => handleAssignCollaborators(task.id, value)"
            >
              <a-select-option v-for="member in teamMembersData" :key="member.id" :value="member.id">
                {{ member.name }} ({{ member.role }})
              </a-select-option>
            </a-select>
            <a-button type="primary" @click="handleAssignTask(task)">
              分配
            </a-button>
          </div>
        </div>
      </div>
      <div v-else class="empty-unassigned">
        <a-empty description="暂无待分配任务" />
      </div>
    </a-card>

    <!-- 已分配任务列表 -->
    <a-card title="已分配任务列表" class="assigned-tasks-card" :bordered="false">
      <div v-if="assignmentData.assignedTasks && assignmentData.assignedTasks.length > 0" class="assigned-tasks">
        <div 
          v-for="task in assignmentData.assignedTasks" 
          :key="task.id"
          class="assigned-task-item"
        >
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <div class="assignment-info">
              <span class="assigned-to">
                负责人：<a-tag color="blue">{{ task.assignedToName }}</a-tag>
              </span>
              <span class="task-status">
                状态：<a-tag :color="getStatusColor(task.status)">{{ getStatusText(task.status) }}</a-tag>
              </span>
              <span class="task-priority">
                优先级：<a-tag :color="getPriorityColor(task.priority)">{{ getPriorityText(task.priority) }}</a-tag>
              </span>
            </div>
          </div>
          <div class="task-actions">
            <a-button type="text" size="small" @click="handleEditAssignment(task)">
              <EditOutlined />
              编辑
            </a-button>
            <a-button type="text" size="small" @click="handleViewDependencies(task)">
              <BranchesOutlined />
              依赖
            </a-button>
            <a-button type="text" size="small" danger @click="handleUnassignTask(task.id)">
              <DeleteOutlined />
              取消分配
            </a-button>
          </div>
        </div>
      </div>
      <div v-else class="empty-assigned">
        <a-empty description="暂无已分配任务" />
      </div>
    </a-card>

    <!-- 成员工作分配分析 -->
    <a-card title="成员工作分配分析" class="workload-card" :bordered="false">
      <a-row :gutter="24">
        <!-- 任务数量分配饼图 -->
        <a-col :span="12">
          <div class="chart-section">
            <h4 class="chart-title">任务数量分配</h4>
            <div class="pie-chart-container">
              <div class="pie-chart" ref="taskCountChart"></div>
              <div class="chart-legend">
                <div 
                  v-for="member in memberTaskStats" 
                  :key="member.id"
                  class="legend-item"
                >
                  <div 
                    class="legend-color" 
                    :style="{ backgroundColor: member.color }"
                  ></div>
                  <span class="legend-text">{{ member.name }} ({{ member.taskCount }}个)</span>
                </div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 工时分配饼图 -->
        <a-col :span="12">
          <div class="chart-section">
            <h4 class="chart-title">工时分配</h4>
            <div class="pie-chart-container">
              <div class="pie-chart" ref="workHoursChart"></div>
              <div class="chart-legend">
                <div 
                  v-for="member in memberWorkHoursStats" 
                  :key="member.id"
                  class="legend-item"
                >
                  <div 
                    class="legend-color" 
                    :style="{ backgroundColor: member.color }"
                  ></div>
                  <span class="legend-text">{{ member.name }} ({{ member.workHours }}h)</span>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 分配均衡性分析 -->
      <div class="balance-analysis">
        <a-divider>分配均衡性分析</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-statistic 
              title="任务分配均衡度" 
              :value="taskBalanceScore"
              suffix="分"
              :value-style="{ color: getBalanceColor(taskBalanceScore) }"
            />
          </a-col>
          <a-col :span="8">
            <a-statistic 
              title="工时分配均衡度" 
              :value="workHoursBalanceScore"
              suffix="分"
              :value-style="{ color: getBalanceColor(workHoursBalanceScore) }"
            />
          </a-col>
          <a-col :span="8">
            <a-statistic 
              title="综合均衡度" 
              :value="overallBalanceScore"
              suffix="分"
              :value-style="{ color: getBalanceColor(overallBalanceScore) }"
            />
          </a-col>
        </a-row>
        <div class="balance-tips">
          <a-alert
            :message="getBalanceMessage()"
            :type="getBalanceAlertType()"
            show-icon
            style="margin-top: 16px"
          />
        </div>
      </div>
    </a-card>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <a-space>
        <a-button size="large" @click="handleSaveAssignment">
          <SaveOutlined />
          保存分配
        </a-button>
        <a-button type="primary" size="large" @click="handleNextStep">
          下一步：进展监控
          <ArrowRightOutlined />
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  ThunderboltOutlined,
  TeamOutlined,
  BellOutlined,
  BarChartOutlined,
  EditOutlined,
  BranchesOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'

// Props
const props = defineProps({
  assignmentData: {
    type: Object,
    default: () => ({
      unassignedTasks: [],
      assignedTasks: [],
      memberWorkload: []
    })
  },
  teamMembers: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'assign-task',
  'intelligent-assign',
  'batch-assign',
  'send-notification',
  'view-gantt'
])

// 响应式数据
const assigning = ref(false)
const taskCountChart = ref(null)
const workHoursChart = ref(null)

// 颜色配置
const memberColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']

// 使用从团队配置传递过来的成员数据，如果没有则使用默认数据
const teamMembersData = computed(() => {
  if (props.teamMembers && props.teamMembers.length > 0) {
    return props.teamMembers
  }
  // 默认数据（向后兼容）
  return [
    { id: 'M001', name: '李四', role: '任务负责人' },
    { id: 'M002', name: '王五', role: '团队成员' },
    { id: 'M003', name: '赵六', role: '团队成员' }
  ]
})

// 方法定义
const getPriorityColor = (priority) => {
  const colorMap = {
    'high': 'red',
    'medium': 'orange',
    'low': 'green'
  }
  return colorMap[priority] || 'default'
}

const getPriorityText = (priority) => {
  const textMap = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || priority
}

const getStatusColor = (status) => {
  const colorMap = {
    'assigned': 'blue',
    'in_progress': 'processing',
    'completed': 'success',
    'overdue': 'error'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'assigned': '已分配',
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return textMap[status] || status
}

// 计算属性：成员任务统计
const memberTaskStats = computed(() => {
  const stats = teamMembersData.value.map((member, index) => {
    const assignedTasks = props.assignmentData.assignedTasks?.filter(task => 
      task.assignee === member.id
    ) || []
    
    return {
      id: member.id,
      name: member.name,
      taskCount: assignedTasks.length,
      color: memberColors[index % memberColors.length]
    }
  })
  
  return stats.filter(stat => stat.taskCount > 0)
})

// 计算属性：成员工时统计
const memberWorkHoursStats = computed(() => {
  const stats = teamMembersData.value.map((member, index) => {
    const assignedTasks = props.assignmentData.assignedTasks?.filter(task => 
      task.assignee === member.id
    ) || []
    
    const totalHours = assignedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
    
    return {
      id: member.id,
      name: member.name,
      workHours: totalHours,
      color: memberColors[index % memberColors.length]
    }
  })
  
  return stats.filter(stat => stat.workHours > 0)
})

// 计算属性：任务分配均衡度评分
const taskBalanceScore = computed(() => {
  const taskCounts = memberTaskStats.value.map(m => m.taskCount)
  if (taskCounts.length === 0) return 100
  
  const avg = taskCounts.reduce((sum, count) => sum + count, 0) / taskCounts.length
  const variance = taskCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / taskCounts.length
  const coefficient = Math.sqrt(variance) / avg
  
  // 变异系数越小，均衡度越高（满分100）
  return Math.max(0, Math.round(100 - coefficient * 100))
})

// 计算属性：工时分配均衡度评分
const workHoursBalanceScore = computed(() => {
  const workHours = memberWorkHoursStats.value.map(m => m.workHours)
  if (workHours.length === 0) return 100
  
  const avg = workHours.reduce((sum, hours) => sum + hours, 0) / workHours.length
  const variance = workHours.reduce((sum, hours) => sum + Math.pow(hours - avg, 2), 0) / workHours.length
  const coefficient = Math.sqrt(variance) / avg
  
  return Math.max(0, Math.round(100 - coefficient * 100))
})

// 计算属性：综合均衡度评分
const overallBalanceScore = computed(() => {
  return Math.round((taskBalanceScore.value + workHoursBalanceScore.value) / 2)
})

// 方法：获取均衡度颜色
const getBalanceColor = (score) => {
  if (score >= 80) return '#52c41a'
  if (score >= 60) return '#faad14'
  return '#ff4d4f'
}

// 方法：获取均衡度消息
const getBalanceMessage = () => {
  const score = overallBalanceScore.value
  if (score >= 80) return '任务分配非常均衡，团队协作效率较高'
  if (score >= 60) return '任务分配基本均衡，可适当调整优化'
  return '任务分配不够均衡，建议重新调整分配方案'
}

// 方法：获取均衡度警告类型
const getBalanceAlertType = () => {
  const score = overallBalanceScore.value
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

const handleIntelligentAssign = async () => {
  assigning.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    message.success('智能分配完成')
    emit('intelligent-assign')
  } catch (error) {
    message.error('智能分配失败')
  } finally {
    assigning.value = false
  }
}

const handleBatchAssign = () => {
  emit('batch-assign')
  message.info('批量分配功能开发中')
}

const handleSendNotification = () => {
  emit('send-notification')
  message.success('任务通知已发送')
}

const handleViewGantt = () => {
  emit('view-gantt')
  message.info('跳转到甘特图页面')
}

const handleAssignPrimary = (taskId, memberId) => {
  console.log('分配主要负责人:', taskId, memberId)
}

const handleAssignCollaborators = (taskId, memberIds) => {
  console.log('分配协作人员:', taskId, memberIds)
}

const handleAssignTask = (task) => {
  emit('assign-task', task)
  message.success('任务分配成功')
}

const handleEditAssignment = (task) => {
  console.log('编辑分配:', task)
  message.info('编辑分配功能开发中')
}

const handleViewDependencies = (task) => {
  console.log('查看依赖:', task)
  message.info('查看依赖功能开发中')
}

const handleUnassignTask = (taskId) => {
  console.log('取消分配:', taskId)
  message.success('任务分配已取消')
}

const handleSaveAssignment = () => {
  message.success('分配结果已保存')
}

const handleNextStep = () => {
  handleSaveAssignment()
  message.success('任务分配已完成，进入下一步')
}

// 绘制饼图的方法
const drawPieChart = (container, data, total) => {
  if (!container || !data || data.length === 0) return
  
  const size = 200
  const radius = 80
  const centerX = size / 2
  const centerY = size / 2
  
  // 清空容器
  container.innerHTML = ''
  
  // 创建SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', size)
  svg.setAttribute('height', size)
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
  
  let currentAngle = -90 // 从顶部开始
  
  data.forEach((item, index) => {
    const percentage = item.value / total
    const angle = percentage * 360
    
    if (angle > 0) {
      const startAngle = currentAngle * Math.PI / 180
      const endAngle = (currentAngle + angle) * Math.PI / 180
      
      const x1 = centerX + radius * Math.cos(startAngle)
      const y1 = centerY + radius * Math.sin(startAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)
      
      const largeArcFlag = angle > 180 ? 1 : 0
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', pathData)
      path.setAttribute('fill', item.color)
      path.setAttribute('stroke', '#fff')
      path.setAttribute('stroke-width', '2')
      
      // 添加悬停效果
      path.addEventListener('mouseenter', () => {
        path.setAttribute('opacity', '0.8')
      })
      path.addEventListener('mouseleave', () => {
        path.setAttribute('opacity', '1')
      })
      
      svg.appendChild(path)
      currentAngle += angle
    }
  })
  
  container.appendChild(svg)
}

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    // 绘制任务数量饼图
    if (taskCountChart.value && memberTaskStats.value.length > 0) {
      const taskData = memberTaskStats.value.map(member => ({
        value: member.taskCount,
        color: member.color,
        name: member.name
      }))
      const totalTasks = taskData.reduce((sum, item) => sum + item.value, 0)
      drawPieChart(taskCountChart.value, taskData, totalTasks)
    }
    
    // 绘制工时分配饼图
    if (workHoursChart.value && memberWorkHoursStats.value.length > 0) {
      const hoursData = memberWorkHoursStats.value.map(member => ({
        value: member.workHours,
        color: member.color,
        name: member.name
      }))
      const totalHours = hoursData.reduce((sum, item) => sum + item.value, 0)
      drawPieChart(workHoursChart.value, hoursData, totalHours)
    }
  })
})
</script>

<style scoped>
.task-assignment-step {
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

.assignment-actions-card,
.unassigned-tasks-card,
.assigned-tasks-card,
.workload-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.unassigned-tasks,
.assigned-tasks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.unassigned-task-item,
.assigned-task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  background: #fafbfc;
}

.task-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.task-meta,
.assignment-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.assignment-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-actions {
  display: flex;
  gap: 4px;
}

/* 饼图样式 */
.chart-section {
  text-align: center;
}

.chart-title {
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.pie-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pie-chart {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-text {
  font-size: 13px;
  color: #333;
}

/* 均衡性分析样式 */
.balance-analysis {
  margin-top: 24px;
}

.balance-tips {
  margin-top: 16px;
}

.empty-unassigned,
.empty-assigned {
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
  .unassigned-task-item,
  .assigned-task-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .assignment-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .assignment-controls .ant-select {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 8px;
  }

  .chart-section {
    margin-bottom: 24px;
  }

  .pie-chart {
    width: 150px;
    height: 150px;
  }

  .balance-analysis {
    margin-top: 16px;
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
