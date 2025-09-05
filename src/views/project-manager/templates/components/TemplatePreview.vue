<template>
  <div class="template-preview">
    <div v-if="template" class="preview-content">
      <!-- 模板基本信息 -->
      <div class="template-info">
        <div class="template-title">
          <span class="template-icon">{{ template.icon }}</span>
          <h2>{{ template.name }}</h2>
        </div>
        <p class="template-description">{{ template.description }}</p>
        <div class="template-meta">
          <a-tag>{{ template.category }}</a-tag>
          <a-tag v-for="tag in template.tags" :key="tag">{{ tag }}</a-tag>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic title="项目阶段" :value="template.structure?.phases?.length || 0" suffix="个" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="任务节点" :value="template.taskCount || 0" suffix="个" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="里程碑" :value="template.milestoneCount || 0" suffix="个" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="使用次数" :value="template.usageCount || 0" suffix="次" />
          </a-col>
        </a-row>
      </div>

      <!-- 项目阶段结构 -->
      <div class="phases-preview">
        <h3>📋 项目阶段结构</h3>
        <div class="phases-timeline">
          <div v-for="(phase, index) in template.structure?.phases || []" :key="index" class="phase-block">
            <div class="phase-header">
              <div class="phase-number">{{ index + 1 }}</div>
              <div class="phase-info">
                <h4>{{ phase.name }}</h4>
                <p>预计工期：{{ phase.duration }} 天</p>
              </div>
            </div>
            <div class="phase-tasks">
              <div class="tasks-title">主要任务：</div>
              <div class="tasks-list">
                <a-tag v-for="task in phase.tasks" :key="task" size="small">{{ task }}</a-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 里程碑节点 -->
      <div class="milestones-preview" v-if="template.structure?.milestones?.length">
        <h3>🎯 里程碑节点</h3>
        <div class="milestones-list">
          <div v-for="(milestone, index) in template.structure.milestones" :key="index" class="milestone-item">
            <div class="milestone-marker" :class="`type-${milestone.type}`">
              <span class="milestone-number">{{ index + 1 }}</span>
            </div>
            <div class="milestone-content">
              <h4>{{ milestone.name }}</h4>
              <p>关联阶段：{{ milestone.phase }}</p>
              <a-tag :color="getMilestoneTypeColor(milestone.type)" size="small">
                {{ getMilestoneTypeText(milestone.type) }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 甘特图预览 -->
      <div class="gantt-preview">
        <h3>📊 项目时间轴预览</h3>
        <div class="gantt-chart">
          <div class="gantt-header">
            <div class="gantt-labels">阶段</div>
            <div class="gantt-timeline">
              <div v-for="day in totalDays" :key="day" class="day-marker">
                {{ day }}
              </div>
            </div>
          </div>
          <div class="gantt-body">
            <div v-for="(phase, index) in template.structure?.phases || []" :key="index" class="gantt-row">
              <div class="gantt-label">{{ phase.name }}</div>
              <div class="gantt-bar-container">
                <div 
                  class="gantt-bar" 
                  :style="getGanttBarStyle(phase, index)"
                >
                  <span class="bar-text">{{ phase.duration }}天</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  template: {
    type: Object,
    default: () => ({})
  }
})

// 计算总工期
const totalDays = computed(() => {
  if (!props.template.structure?.phases) return 0
  return props.template.structure.phases.reduce((total, phase) => total + (phase.duration || 0), 0)
})

// 获取里程碑类型颜色
const getMilestoneTypeColor = (type) => {
  const colors = {
    review: 'blue',
    delivery: 'green',
    checkpoint: 'orange',
    approval: 'purple'
  }
  return colors[type] || 'default'
}

// 获取里程碑类型文本
const getMilestoneTypeText = (type) => {
  const texts = {
    review: '评审节点',
    delivery: '交付节点',
    checkpoint: '检查节点',
    approval: '审批节点'
  }
  return texts[type] || type
}

// 获取甘特图条样式
const getGanttBarStyle = (phase, index) => {
  const colors = ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1']
  const color = colors[index % colors.length]
  
  // 计算起始位置
  let startDay = 0
  if (props.template.structure?.phases) {
    for (let i = 0; i < index; i++) {
      startDay += props.template.structure.phases[i].duration || 0
    }
  }
  
  const duration = phase.duration || 0
  const totalDuration = totalDays.value || 1
  
  const left = (startDay / totalDuration) * 100
  const width = (duration / totalDuration) * 100
  
  return {
    left: `${left}%`,
    width: `${width}%`,
    backgroundColor: color,
    color: 'white'
  }
}
</script>

<style scoped>
.template-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.template-info {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.template-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.template-icon {
  font-size: 24px;
}

.template-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.template-description {
  color: #666;
  margin-bottom: 12px;
}

.template-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stats-section {
  margin-bottom: 32px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.phases-preview h3,
.milestones-preview h3,
.gantt-preview h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.phases-timeline {
  margin-bottom: 32px;
}

.phase-block {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.phase-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.phase-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.phase-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.phase-tasks {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tasks-title {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.tasks-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.milestones-preview {
  margin-bottom: 32px;
}

.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.milestone-marker {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.milestone-marker.type-review {
  background: #1890ff;
}

.milestone-marker.type-delivery {
  background: #52c41a;
}

.milestone-marker.type-checkpoint {
  background: #fa8c16;
}

.milestone-marker.type-approval {
  background: #722ed1;
}

.milestone-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.milestone-content p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
}

.gantt-preview {
  margin-bottom: 24px;
}

.gantt-chart {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.gantt-header {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.gantt-labels {
  width: 120px;
  padding: 8px 12px;
  font-weight: 600;
  border-right: 1px solid #e8e8e8;
}

.gantt-timeline {
  flex: 1;
  display: flex;
  min-height: 32px;
}

.day-marker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666;
  border-right: 1px solid #f0f0f0;
}

.gantt-body {
  background: white;
}

.gantt-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  min-height: 40px;
}

.gantt-label {
  width: 120px;
  padding: 8px 12px;
  border-right: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.gantt-bar-container {
  flex: 1;
  position: relative;
  padding: 8px 0;
}

.gantt-bar {
  position: absolute;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 500;
}

.bar-text {
  white-space: nowrap;
}
</style>