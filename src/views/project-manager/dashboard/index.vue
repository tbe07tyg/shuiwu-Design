<template>
  <div class="project-manager-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>项目经理工作台</h1>
      <p class="subtitle">项目进度监控与团队管理</p>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <ProjectOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalProjects }}</div>
                <div class="stat-label">总项目数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <ClockCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.activeProjects }}</div>
                <div class="stat-label">进行中项目</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <TeamOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.teamMembers }}</div>
                <div class="stat-label">团队成员</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <CheckCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.completedTasks }}</div>
                <div class="stat-label">已完成任务</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="项目进度概览" class="chart-card">
            <div ref="progressChart" style="height: 300px;"></div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="任务完成趋势" class="chart-card">
            <div ref="trendChart" style="height: 300px;"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 最近项目列表 -->
    <div class="recent-projects-section">
      <a-card title="最近项目" class="projects-card">
        <a-table
          :dataSource="recentProjects"
          :columns="projectColumns"
          :pagination="false"
          :loading="loading"
          rowKey="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'progress'">
              <a-progress
                :percent="record.progress"
                :stroke-color="getProgressColor(record.progress)"
                size="small"
              />
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewProject(record)">
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editProject(record)">
                  编辑
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 快速操作区域已移除 -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  ProjectOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const progressChart = ref(null)
const trendChart = ref(null)

// 统计数据
const stats = reactive({
  totalProjects: 12,
  activeProjects: 8,
  teamMembers: 24,
  completedTasks: 156
})

// 最近项目数据
const recentProjects = ref([
  {
    id: 1,
    name: '智能科研管理系统开发',
    status: 'active',
    progress: 75,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    manager: '张经理'
  },
  {
    id: 2,
    name: '数据分析平台建设',
    status: 'planning',
    progress: 30,
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    manager: '李经理'
  },
  {
    id: 3,
    name: '移动端应用开发',
    status: 'completed',
    progress: 100,
    startDate: '2023-10-01',
    endDate: '2024-01-31',
    manager: '王经理'
  },
  {
    id: 4,
    name: '系统性能优化',
    status: 'active',
    progress: 60,
    startDate: '2024-01-20',
    endDate: '2024-05-15',
    manager: '赵经理'
  }
])

// 表格列定义
const projectColumns = [
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 150
  },
  {
    title: '项目经理',
    dataIndex: 'manager',
    key: 'manager',
    width: 120
  },
  {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 120
  },
  {
    title: '结束日期',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 120
  }
]

// 状态颜色映射
const getStatusColor = (status) => {
  const colorMap = {
    active: 'blue',
    planning: 'orange',
    completed: 'green',
    suspended: 'red'
  }
  return colorMap[status] || 'default'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    active: '进行中',
    planning: '规划中',
    completed: '已完成',
    suspended: '已暂停'
  }
  return textMap[status] || '未知'
}

// 进度颜色映射
const getProgressColor = (progress) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 60) return '#1890ff'
  if (progress >= 40) return '#faad14'
  return '#f5222d'
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 项目进度概览图表
    const progressChartInstance = echarts.init(progressChart.value)
    const progressOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '项目状态',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 8, name: '进行中' },
            { value: 3, name: '规划中' },
            { value: 1, name: '已完成' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    progressChartInstance.setOption(progressOption)

    // 任务完成趋势图表
    const trendChartInstance = echarts.init(trendChart.value)
    const trendOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '完成任务数',
          type: 'line',
          data: [12, 19, 15, 25, 22, 30],
          smooth: true,
          lineStyle: {
            color: '#1890ff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ]
            }
          }
        }
      ]
    }
    trendChartInstance.setOption(trendOption)

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      progressChartInstance.resize()
      trendChartInstance.resize()
    })
  })
}

// 页面操作方法
const viewProject = (record) => {
  console.log('查看项目:', record)
  // 跳转到项目详情页
  router.push(`/project-manager/projects/${record.id}`)
}

const editProject = (record) => {
  console.log('编辑项目:', record)
  // 跳转到项目编辑页
  router.push(`/project-manager/projects/${record.id}/edit`)
}

// 快速操作相关函数已移除

// 生命周期
onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.project-manager-dashboard {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #234fa2;
  margin: 0 0 8px 0;
}

.page-header .subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #234fa2;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recent-projects-section {
  margin-bottom: 24px;
}

.projects-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-actions-section {
  margin-bottom: 24px;
}

.actions-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-manager-dashboard {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}
</style> 