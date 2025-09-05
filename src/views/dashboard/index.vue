<template>
  <PageContainer
    title="工作台"
    description="项目概览、待办事项及任务日历">
    
    <!-- 顶部统计卡片 -->
    <div class="stat-cards-container">
      <div class="stat-card" v-for="card in statCards" :key="card.key" :style="{background: card.bg}">
        <div class="stat-content">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-title">{{ card.title }}</div>
          <div class="stat-subtitle">{{ card.subtitle }}</div>
        </div>
        <div class="stat-icon">
          <component :is="card.icon" :style="{fontSize: '32px', color: card.color}" />
        </div>
      </div>
    </div>

    <!-- 今日重要提醒横幅 -->
    <div v-if="todayReminders.length > 0" class="reminder-banner">
      <div class="banner-icon">
        <BellOutlined />
      </div>
      <div class="banner-content">
        <span class="banner-title">今日重要提醒：</span>
        <div class="reminder-items">
          <a-tag 
            v-for="reminder in todayReminders" 
            :key="reminder.id" 
            :color="reminder.level"
            class="reminder-tag"
            @click="handleReminderClick(reminder)"
          >
            {{ reminder.text }}
          </a-tag>
        </div>
      </div>
      <a-button type="link" @click="viewAllReminders">查看全部</a-button>
    </div>

    <!-- 主内容区域 -->
    <div class="dashboard-main">
      <!-- 左侧区域 -->
      <div class="dashboard-left">
        <!-- 待办事项 -->
        <a-card class="todo-card" title="待办事项">
          <template #extra>
            <a-button type="link" @click="router.push('/implementation/center')">查看全部</a-button>
          </template>
          <div class="todo-filter">
            <a-radio-group v-model:value="todoFilter" @change="handleTodoFilter">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="urgent">紧急</a-radio-button>
              <a-radio-button value="today">今日</a-radio-button>
            </a-radio-group>
          </div>
          
          <div class="todo-list">
            <div v-if="filteredTodoList.length === 0" class="empty-todo">
              <CheckCircleOutlined />
              <span>暂无待办事项</span>
            </div>
            <div 
              v-for="item in filteredTodoList" 
              :key="item.id" 
              :class="['todo-item', item.priority]"
              @click="handleTodoClick(item)"
            >
              <div class="todo-left">
                <a-badge :status="getTodoBadgeStatus(item)" />
                <div class="todo-info">
                  <div class="todo-title">{{ item.title }}</div>
                  <div class="todo-meta">
                    <span class="todo-project">{{ item.projectName }}</span>
                    <span class="todo-time">{{ item.deadline }}</span>
                    <a-tag v-if="item.type" size="small" :color="getTypeColor(item.type)">
                      {{ getTypeText(item.type) }}
                    </a-tag>
                  </div>
                </div>
              </div>
              <div class="todo-actions">
                <a-button type="link" size="small" @click.stop="handleQuickAction(item)">
                  {{ getActionText(item.type) }}
                </a-button>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 项目进度监控 -->
        <a-card class="progress-card" title="项目进度监控">
          <div class="progress-list">
            <div v-for="project in progressProjects" :key="project.id" class="progress-item">
              <div class="project-header">
                <div class="project-name">{{ project.name }}</div>
                <a-tag :color="getProgressColor(project.status)">{{ project.statusText }}</a-tag>
              </div>
              <div class="progress-bar">
                <a-progress 
                  :percent="project.progress" 
                  :status="project.progress < 100 ? 'active' : 'success'"
                  :strokeColor="getProgressStrokeColor(project.progress)"
                />
              </div>
              <div class="project-meta">
                <span>负责人：{{ project.leader }}</span>
                <span>截止：{{ project.deadline }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 右侧区域 -->
      <div class="dashboard-right">
        <!-- 会议日历 -->
        <a-card class="calendar-card" title="会议安排">
          <template #extra>
            <a-button type="link" @click="router.push('/implementation/center')">会议管理</a-button>
          </template>
          <div class="calendar-container">
            <a-calendar 
              v-model:value="selectedDate" 
              :fullscreen="false"
              @select="onDateSelect"
            >
              <template #dateCellRender="{ current }">
                <div class="calendar-cell">
                  <div v-for="event in getEventsForDate(current)" :key="event.id" 
                       :class="['event-dot', event.type]"
                       :title="event.title">
                  </div>
                </div>
              </template>
            </a-calendar>
          </div>
          
          <!-- 选中日期的事件列表 -->
          <div v-if="selectedDateEvents.length > 0" class="selected-date-events">
            <h4>{{ selectedDate.format('YYYY年MM月DD日') }} 的安排</h4>
            <div v-for="event in selectedDateEvents" :key="event.id" class="event-item">
              <div class="event-time">{{ event.time }}</div>
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-desc">{{ event.description }}</div>
              </div>
              <a-button type="link" size="small" @click="viewEventDetail(event)">详情</a-button>
            </div>
          </div>
        </a-card>

        <!-- 快速操作面板已移除 -->

        <!-- 系统通知 -->
        <a-card class="notifications-card" title="系统通知">
          <div class="notifications-list">
            <div v-for="notification in notifications" :key="notification.id" 
                 class="notification-item">
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>
              <a-badge :count="notification.unread ? 1 : 0" />
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { 
  BellOutlined, 
  CheckCircleOutlined,
  ProjectOutlined,
  CarryOutOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components/PageContainer.vue'

const router = useRouter()

// 统计卡片数据
const statCards = ref([
  {
    key: 'total',
    title: '项目总数',
    value: 128,
    subtitle: '本月新增 8 个',
    color: '#1890ff',
    bg: 'linear-gradient(135deg, #e6f4ff 0%, #f0f9ff 100%)',
    icon: ProjectOutlined
  },
  {
    key: 'pending',
    title: '待办事项',
    value: 23,
    subtitle: '今日需处理 12 项',
    color: '#faad14',
    bg: 'linear-gradient(135deg, #fff7e6 0%, #fffdf6 100%)',
    icon: CarryOutOutlined
  },
  {
    key: 'urgent',
    title: '紧急任务',
    value: 5,
    subtitle: '逾期任务 2 项',
    color: '#ff4d4f',
    bg: 'linear-gradient(135deg, #fff1f0 0%, #fff5f5 100%)',
    icon: ExclamationCircleOutlined
  },
  {
    key: 'meetings',
    title: '本周会议',
    value: 8,
    subtitle: '今日 2 场会议',
    color: '#52c41a',
    bg: 'linear-gradient(135deg, #f6ffed 0%, #f9ffef 100%)',
    icon: CalendarOutlined
  }
])

// 今日提醒数据
const todayReminders = ref([
  { id: 1, text: '智慧城市项目已通过资料审核，待组织会议', level: 'blue', type: 'meeting' },
  { id: 2, text: 'AI智能客服系统会议已过期，待录入验收结论', level: 'red', type: 'conclusion' },
  { id: 3, text: '区块链平台合同付款节点即将到期', level: 'orange', type: 'payment' },
  { id: 4, text: '物联网监测系统材料已提交待审核', level: 'green', type: 'review' }
])

// 待办事项数据
const todoFilter = ref('all')
const todoList = ref([
  {
    id: 1,
    title: '智慧城市项目立项会议安排',
    projectName: '智慧城市大数据平台',
    deadline: '今日 14:00',
    priority: 'urgent',
    type: 'meeting',
    status: 'pending'
  },
  {
    id: 2,
    title: 'AI客服系统验收结论录入',
    projectName: 'AI智能客服系统',
    deadline: '今日 16:00',
    priority: 'urgent',
    type: 'conclusion',
    status: 'overdue'
  },
  {
    id: 3,
    title: '区块链平台材料审核',
    projectName: '区块链供应链金融平台',
    deadline: '明日 10:00',
    priority: 'normal',
    type: 'review',
    status: 'pending'
  },
  {
    id: 4,
    title: '物联网系统开题会议主持',
    projectName: '物联网环境监测系统',
    deadline: '2024-01-25 14:00',
    priority: 'normal',
    type: 'meeting',
    status: 'scheduled'
  },
  {
    id: 5,
    title: '数据分析系统付款审批',
    projectName: '电子商务数据分析系统',
    deadline: '2024-01-26 12:00',
    priority: 'normal',
    type: 'payment',
    status: 'pending'
  }
])

// 项目进度数据
const progressProjects = ref([
  {
    id: 1,
    name: '智慧城市大数据平台',
    progress: 35,
    status: 'in_progress',
    statusText: '进行中',
    leader: '张三',
    deadline: '2024-12-31'
  },
  {
    id: 2,
    name: 'AI智能客服系统',
    progress: 85,
    status: 'near_completion',
    statusText: '接近完成',
    leader: '李四',
    deadline: '2024-02-15'
  },
  {
    id: 3,
    name: '区块链供应链平台',
    progress: 60,
    status: 'in_progress',
    statusText: '进行中',
    leader: '王五',
    deadline: '2024-08-20'
  }
])

// 日历相关
const selectedDate = ref(dayjs())
const calendarEvents = ref([
  {
    id: 1,
    date: dayjs().format('YYYY-MM-DD'),
    time: '14:00',
    title: '智慧城市项目立项会议',
    description: '项目立项评审会议，需要专家组参与',
    type: 'meeting'
  },
  {
    id: 2,
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    time: '10:00',
    title: 'AI客服系统验收会议',
    description: '项目验收最终评审',
    type: 'meeting'
  },
  {
    id: 3,
    date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    time: '16:00',
    title: '区块链平台中期检查',
    description: '项目中期进度检查',
    type: 'review'
  },
  {
    id: 4,
    date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
    time: '09:00',
    title: '物联网系统付款节点',
    description: '第二期付款申请处理',
    type: 'payment'
  }
])

// 快速操作相关代码已移除

// 系统通知
const notifications = ref([
  {
    id: 1,
    title: '系统维护通知：明日2:00-4:00',
    time: '1小时前',
    unread: true
  },
  {
    id: 2,
    title: '新版本功能更新说明',
    time: '2小时前',
    unread: true
  },
  {
    id: 3,
    title: '用户权限变更通知',
    time: '昨天',
    unread: false
  }
])

// 计算属性
const filteredTodoList = computed(() => {
  let filtered = todoList.value
  if (todoFilter.value === 'urgent') {
    filtered = filtered.filter(item => item.priority === 'urgent')
  } else if (todoFilter.value === 'today') {
    filtered = filtered.filter(item => item.deadline.includes('今日'))
  }
  return filtered
})

const selectedDateEvents = computed(() => {
  const dateStr = selectedDate.value.format('YYYY-MM-DD')
  return calendarEvents.value.filter(event => event.date === dateStr)
})

// 方法
const handleReminderClick = (reminder) => {
  switch (reminder.type) {
    case 'meeting':
      router.push('/opening/management/conclusion')
      break
    case 'conclusion':
      router.push('/opening/management/conclusion?tab=conclusion')
      break
    case 'payment':
      router.push('/implementation/payment')
      break
    case 'review':
      router.push('/opening/management/center')
      break
  }
}

const viewAllReminders = () => {
  router.push('/implementation/center')
}

const handleTodoFilter = () => {
  // 过滤逻辑已通过computed实现
}

const handleTodoClick = (item) => {
  switch (item.type) {
    case 'meeting':
      router.push('/opening/management/conclusion')
      break
    case 'conclusion':
      router.push('/opening/management/conclusion?tab=conclusion')
      break
    case 'review':
      router.push('/opening/management/center')
      break
    case 'payment':
      router.push('/implementation/payment')
      break
  }
}

const handleQuickAction = (item) => {
  handleTodoClick(item)
}

const getTodoBadgeStatus = (item) => {
  if (item.status === 'overdue') return 'error'
  if (item.priority === 'urgent') return 'warning'
  return 'processing'
}

const getTypeColor = (type) => {
  const colors = {
    meeting: 'blue',
    conclusion: 'purple',
    review: 'green',
    payment: 'orange'
  }
  return colors[type] || 'default'
}

const getTypeText = (type) => {
  const texts = {
    meeting: '会议',
    conclusion: '结论',
    review: '审核',
    payment: '付款'
  }
  return texts[type] || ''
}

const getActionText = (type) => {
  const actions = {
    meeting: '安排',
    conclusion: '录入',
    review: '审核',
    payment: '处理'
  }
  return actions[type] || '处理'
}

const getProgressColor = (status) => {
  const colors = {
    in_progress: 'blue',
    near_completion: 'orange',
    completed: 'green',
    delayed: 'red'
  }
  return colors[status] || 'default'
}

const getProgressStrokeColor = (progress) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 50) return '#1890ff'
  if (progress >= 30) return '#faad14'
  return '#ff4d4f'
}

const getEventsForDate = (date) => {
  const dateStr = date.format('YYYY-MM-DD')
  return calendarEvents.value.filter(event => event.date === dateStr)
}

const onDateSelect = (date) => {
  selectedDate.value = date
}

const viewEventDetail = (event) => {
  switch (event.type) {
    case 'meeting':
      router.push('/opening/management/conclusion')
      break
    case 'review':
      router.push('/opening/management/center')
      break
    case 'payment':
      router.push('/implementation/payment')
      break
  }
}

// handleQuickActionClick 函数已移除

onMounted(() => {
  // 页面加载时的初始化逻辑
})
</script>

<style scoped>
/* 统计卡片样式 */
.stat-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 14px;
  color: #8c8c8c;
}

.stat-icon {
  flex-shrink: 0;
  margin-left: 16px;
}

/* 提醒横幅样式 */
.reminder-banner {
  background: linear-gradient(135deg, #fff7e6 0%, #fffdf6 100%);
  border: 1px solid #ffd591;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  animation: gentle-glow 2s ease-in-out infinite alternate;
}

@keyframes gentle-glow {
  0% { box-shadow: 0 0 5px rgba(255, 173, 20, 0.2); }
  100% { box-shadow: 0 0 15px rgba(255, 173, 20, 0.4); }
}

.banner-icon {
  color: #faad14;
  font-size: 20px;
}

.banner-content {
  flex: 1;
}

.banner-title {
  font-weight: 600;
  color: #d48806;
  margin-right: 12px;
}

.reminder-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.reminder-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.reminder-tag:hover {
  transform: scale(1.05);
}

/* 主内容区域 */
.dashboard-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
}

.dashboard-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 待办事项样式 */
.todo-filter {
  margin-bottom: 16px;
}

.todo-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-todo {
  text-align: center;
  padding: 40px 0;
  color: #8c8c8c;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-todo .anticon {
  font-size: 32px;
  color: #d9d9d9;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.todo-item:hover {
  background-color: #fafafa;
  margin: 0 -12px;
  padding: 12px;
  border-radius: 4px;
}

.todo-item.urgent .todo-title {
  color: #ff4d4f;
  font-weight: 600;
}

.todo-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.todo-info {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.todo-project {
  color: #1890ff;
}

.todo-time {
  color: #faad14;
}

/* 项目进度样式 */
.progress-list {
  max-height: 300px;
  overflow-y: auto;
}

.progress-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.progress-item:last-child {
  border-bottom: none;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-name {
  font-weight: 500;
  color: #262626;
}

.progress-bar {
  margin-bottom: 8px;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8c8c8c;
}

/* 日历样式 */
.calendar-container {
  margin-bottom: 16px;
}

:deep(.ant-picker-calendar-full .ant-picker-panel) {
  background: transparent;
}

:deep(.ant-picker-calendar-mini .ant-picker-content) {
  height: 256px;
}

.calendar-cell {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 2px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 0 1px;
}

.event-dot.meeting {
  background-color: #1890ff;
}

.event-dot.review {
  background-color: #52c41a;
}

.event-dot.payment {
  background-color: #faad14;
}

.selected-date-events {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.selected-date-events h4 {
  margin-bottom: 12px;
  color: #262626;
  font-size: 14px;
  font-weight: 600;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
  width: 50px;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
}

.event-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.event-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 快速操作样式已移除 */

/* 通知样式 */
.notifications-list {
  max-height: 200px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }
  
  .stat-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-cards-container {
    grid-template-columns: 1fr;
  }
  
  .reminder-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .reminder-items {
    margin-top: 0;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style> 