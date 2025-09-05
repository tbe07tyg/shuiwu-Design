<!--
 * @file 技术路线管理组件
 * @description 可视化技术路线流程图和状态管理
-->
<template>
  <a-card class="tech-route-card" title="🛣️ 技术路线管理">
    <template #extra>
      <a-button size="small" @click="handleAdjustRoute">
        <SettingOutlined />
        调整路线
      </a-button>
    </template>

    <div class="route-content">
      <!-- 技术路线流程图 -->
      <div class="route-flow">
        <div class="flow-container">
          <div 
            v-for="(route, index) in techRoutes" 
            :key="route.id"
            class="route-node"
            :class="getRouteStatusClass(route.status)"
          >
            <div class="node-content">
              <div class="node-header">
                <span class="node-title">{{ route.phase }}</span>
                <div class="node-status">
                  <component :is="getStatusIcon(route.status)" />
                </div>
              </div>
              <div class="node-progress">
                <a-progress 
                  :percent="route.progress" 
                  size="small"
                  :status="getProgressStatus(route.status)"
                />
              </div>
              <div class="node-info">
                <div class="info-item">
                  <CalendarOutlined />
                  <span>{{ formatDateRange(route.startDate, route.endDate) }}</span>
                </div>
                <div class="info-item">
                  <TeamOutlined />
                  <span>{{ route.tasks.length }}个任务</span>
                </div>
              </div>
            </div>
            
            <!-- 连接箭头 -->
            <div v-if="index < techRoutes.length - 1" class="route-arrow">
              <ArrowRightOutlined />
            </div>
          </div>
        </div>
      </div>

      <!-- 当前阶段详情 -->
      <div class="current-stage">
        <h4>当前阶段详情</h4>
        <div v-if="currentStage" class="stage-detail">
          <div class="detail-row">
            <span class="label">阶段名称：</span>
            <span class="value">{{ currentStage.phase }}</span>
          </div>
          <div class="detail-row">
            <span class="label">预计完成：</span>
            <span class="value">{{ currentStage.endDate }}</span>
          </div>
          <div class="detail-row">
            <span class="label">主要任务：</span>
            <div class="task-tags">
              <a-tag 
                v-for="task in currentStage.tasks" 
                :key="task"
                color="blue"
                size="small"
              >
                {{ task }}
              </a-tag>
            </div>
          </div>
          <div class="detail-row">
            <span class="label">里程碑：</span>
            <div class="milestone-tags">
              <a-tag 
                v-for="milestone in currentStage.milestones" 
                :key="milestone"
                color="gold"
                size="small"
              >
                🎯 {{ milestone }}
              </a-tag>
            </div>
          </div>
        </div>
        <div v-else class="no-current-stage">
          <a-empty description="暂无进行中的阶段" />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleSetMilestone">
          <FlagOutlined />
          设置里程碑
        </a-button>
        <a-button @click="handleViewGantt">
          <BarChartOutlined />
          甘特图视图
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import { 
  SettingOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  FlagOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  techRoutes: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['route-adjust', 'milestone-set'])

// 计算属性
const currentStage = computed(() => {
  return props.techRoutes.find(route => route.status === 'in_progress')
})

// 方法
const handleAdjustRoute = () => {
  emit('route-adjust', { action: 'adjust' })
}

const handleSetMilestone = () => {
  emit('milestone-set', { stage: currentStage.value })
}

const handleViewGantt = () => {
  message.info('跳转到甘特图视图')
}

// 工具方法
const getRouteStatusClass = (status) => {
  return `route-${status}`
}

const getStatusIcon = (status) => {
  const iconMap = {
    'completed': CheckCircleOutlined,
    'in_progress': SyncOutlined,
    'pending': ClockCircleOutlined,
    'paused': PauseCircleOutlined
  }
  return iconMap[status] || ClockCircleOutlined
}

const getProgressStatus = (status) => {
  const statusMap = {
    'completed': 'success',
    'in_progress': 'active',
    'pending': 'normal',
    'paused': 'exception'
  }
  return statusMap[status] || 'normal'
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  const end = new Date(endDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  return `${start} - ${end}`
}
</script>

<style scoped>
.tech-route-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.route-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.route-flow {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.flow-container {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: max-content;
}

.route-node {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  min-width: 160px;
  border: 2px solid #e8e8e8;
  transition: all 0.3s;
}

.route-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.route-node.route-completed {
  border-color: #52c41a;
  background: #f6ffed;
}

.route-node.route-in_progress {
  border-color: #1890ff;
  background: #e6f7ff;
}

.route-node.route-pending {
  border-color: #faad14;
  background: #fff7e6;
}

.route-node.route-paused {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 13px;
}

.node-status {
  color: #52c41a;
}

.route-in_progress .node-status {
  color: #1890ff;
}

.route-pending .node-status {
  color: #faad14;
}

.route-paused .node-status {
  color: #ff4d4f;
}

.node-progress {
  margin: 4px 0;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 11px;
}

.route-arrow {
  color: #8c8c8c;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.current-stage h4 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.stage-detail {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row .label {
  color: #8c8c8c;
  min-width: 80px;
  font-size: 12px;
}

.detail-row .value {
  color: #234fa2;
  font-weight: 500;
  font-size: 12px;
}

.task-tags,
.milestone-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.no-current-stage {
  text-align: center;
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .ant-btn {
  flex: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .flow-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .route-arrow {
    transform: rotate(90deg);
    margin: 8px 0;
  }
  
  .route-node {
    min-width: auto;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-row .label {
    min-width: auto;
  }
}
</style>

