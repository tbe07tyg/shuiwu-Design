<template>
  <div class="analytics-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>数据分析</h1>
      <p class="subtitle">项目分析与趋势预测</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <BarChartOutlined />
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
                <CheckCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.completionRate }}%</div>
                <div class="stat-label">项目完成率</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <ClockCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.avgDuration }}</div>
                <div class="stat-label">平均工期(天)</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <DollarOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalBudget }}</div>
                <div class="stat-label">总预算(万元)</div>
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
          <a-card title="项目进度分析" class="chart-card">
            <div ref="progressChart" style="height: 300px;"></div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="团队绩效分析" class="chart-card">
            <div ref="performanceChart" style="height: 300px;"></div>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="12">
          <a-card title="成本分析" class="chart-card">
            <div ref="costChart" style="height: 300px;"></div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="风险预测" class="chart-card">
            <div ref="riskChart" style="height: 300px;"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <a-card class="filter-card">
        <a-form layout="inline" :model="filterForm">
          <a-form-item label="时间范围">
            <a-range-picker
              v-model:value="filterForm.dateRange"
              style="width: 240px"
            />
          </a-form-item>
          <a-form-item label="项目类型">
            <a-select
              v-model:value="filterForm.projectType"
              placeholder="请选择项目类型"
              allow-clear
              style="width: 150px"
            >
              <a-select-option value="development">开发项目</a-select-option>
              <a-select-option value="research">研究项目</a-select-option>
              <a-select-option value="maintenance">维护项目</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="团队">
            <a-select
              v-model:value="filterForm.team"
              placeholder="请选择团队"
              allow-clear
              style="width: 150px"
            >
              <a-select-option value="team1">开发团队</a-select-option>
              <a-select-option value="team2">测试团队</a-select-option>
              <a-select-option value="team3">设计团队</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleFilter">
              <SearchOutlined />
              分析
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              <ReloadOutlined />
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 详细分析表格 -->
    <div class="analysis-section">
      <a-card title="项目详细分析" class="analysis-card">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="projects" tab="项目分析">
            <a-table
              :dataSource="projectAnalysis"
              :columns="projectColumns"
              :pagination="pagination"
              rowKey="id"
              @change="handleTableChange"
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
                <template v-else-if="column.key === 'risk'">
                  <a-tag :color="getRiskColor(record.risk)">
                    {{ getRiskText(record.risk) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="viewDetails(record)">
                      详情
                    </a-button>
                    <a-button type="link" size="small" @click="generateReport(record)">
                      报告
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="performance" tab="绩效分析">
            <a-table
              :dataSource="performanceAnalysis"
              :columns="performanceColumns"
              :pagination="pagination"
              rowKey="id"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'performance'">
                  <a-progress
                    :percent="record.performance"
                    :stroke-color="getPerformanceColor(record.performance)"
                    size="small"
                  />
                </template>
                <template v-else-if="column.key === 'trend'">
                  <a-tag :color="getTrendColor(record.trend)">
                    {{ getTrendText(record.trend) }}
                  </a-tag>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="trends" tab="趋势预测">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="项目完成趋势预测" size="small">
                  <div ref="trendChart" style="height: 250px;"></div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="资源需求预测" size="small">
                  <div ref="resourceChart" style="height: 250px;"></div>
                </a-card>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <!-- 分析报告弹窗 -->
    <a-modal
      v-model:open="reportVisible"
      title="分析报告"
      width="800px"
      :footer="null"
      destroy-on-close
    >
      <div v-if="currentReport" class="report-content">
        <a-descriptions title="项目概况" :column="2" bordered>
          <a-descriptions-item label="项目名称">
            {{ currentReport.name }}
          </a-descriptions-item>
          <a-descriptions-item label="项目状态">
            <a-tag :color="getStatusColor(currentReport.status)">
              {{ getStatusText(currentReport.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="完成进度">
            <a-progress
              :percent="currentReport.progress"
              :stroke-color="getProgressColor(currentReport.progress)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="风险等级">
            <a-tag :color="getRiskColor(currentReport.risk)">
              {{ getRiskText(currentReport.risk) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-tabs v-model:activeKey="reportTab">
          <a-tab-pane key="metrics" tab="关键指标">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-statistic
                  title="任务完成率"
                  :value="currentReport.taskCompletion"
                  suffix="%"
                  :value-style="{ color: '#3f8600' }"
                />
              </a-col>
              <a-col :span="8">
                <a-statistic
                  title="代码质量"
                  :value="currentReport.codeQuality"
                  suffix="分"
                  :value-style="{ color: '#1890ff' }"
                />
              </a-col>
              <a-col :span="8">
                <a-statistic
                  title="测试覆盖率"
                  :value="currentReport.testCoverage"
                  suffix="%"
                  :value-style="{ color: '#722ed1' }"
                />
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane key="trends" tab="趋势分析">
            <a-timeline>
              <a-timeline-item v-for="item in currentReport.trends" :key="item.id">
                <template #dot>
                  <a-icon :type="item.icon" />
                </template>
                <p>{{ item.title }}</p>
                <p class="trend-desc">{{ item.description }}</p>
                <p class="trend-time">{{ item.time }}</p>
              </a-timeline-item>
            </a-timeline>
          </a-tab-pane>
          <a-tab-pane key="recommendations" tab="优化建议">
            <a-list
              :dataSource="currentReport.recommendations"
              item-layout="horizontal"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :style="{ backgroundColor: item.color }">
                        {{ item.icon }}
                      </a-avatar>
                    </template>
                    <template #title>{{ item.title }}</template>
                    <template #description>{{ item.description }}</template>
                  </a-list-item-meta>
                  <template #actions>
                    <a-tag :color="item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'green'">
                      {{ item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低' }}优先级
                    </a-tag>
                  </template>
                </a-list-item>
              </template>
            </a-list>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const reportVisible = ref(false)
const currentReport = ref(null)
const activeTab = ref('projects')
const reportTab = ref('metrics')
const progressChart = ref(null)
const performanceChart = ref(null)
const costChart = ref(null)
const riskChart = ref(null)
const trendChart = ref(null)
const resourceChart = ref(null)

// 统计数据
const stats = reactive({
  totalProjects: 12,
  completionRate: 85,
  avgDuration: 120,
  totalBudget: 1250
})

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  projectType: undefined,
  team: undefined
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
})

// 项目分析数据
const projectAnalysis = ref([
  {
    id: 1,
    name: '智能科研管理系统开发',
    status: 'active',
    progress: 75,
    duration: 180,
    cost: 150,
    risk: 'low',
    team: '开发团队',
    startDate: '2024-01-15',
    endDate: '2024-06-30'
  },
  {
    id: 2,
    name: '数据分析平台建设',
    status: 'planning',
    progress: 30,
    duration: 240,
    cost: 200,
    risk: 'medium',
    team: '开发团队',
    startDate: '2024-02-01',
    endDate: '2024-08-31'
  },
  {
    id: 3,
    name: '移动端应用开发',
    status: 'completed',
    progress: 100,
    duration: 120,
    cost: 80,
    risk: 'low',
    team: '开发团队',
    startDate: '2023-10-01',
    endDate: '2024-01-31'
  },
  {
    id: 4,
    name: '系统性能优化',
    status: 'active',
    progress: 60,
    duration: 90,
    cost: 50,
    risk: 'high',
    team: '测试团队',
    startDate: '2024-01-20',
    endDate: '2024-05-15'
  }
])

// 绩效分析数据
const performanceAnalysis = ref([
  {
    id: 1,
    name: '张经理',
    role: '项目经理',
    performance: 95,
    trend: 'up',
    completedTasks: 45,
    activeTasks: 8
  },
  {
    id: 2,
    name: '李开发',
    role: '开发工程师',
    performance: 88,
    trend: 'up',
    completedTasks: 32,
    activeTasks: 5
  },
  {
    id: 3,
    name: '王后端',
    role: '后端工程师',
    performance: 92,
    trend: 'stable',
    completedTasks: 38,
    activeTasks: 6
  },
  {
    id: 4,
    name: '赵测试',
    role: '测试工程师',
    performance: 85,
    trend: 'down',
    completedTasks: 28,
    activeTasks: 4
  }
])

// 项目分析表格列定义
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
    title: '工期(天)',
    dataIndex: 'duration',
    key: 'duration',
    width: 100
  },
  {
    title: '成本(万元)',
    dataIndex: 'cost',
    key: 'cost',
    width: 120
  },
  {
    title: '风险等级',
    dataIndex: 'risk',
    key: 'risk',
    width: 100
  },
  {
    title: '团队',
    dataIndex: 'team',
    key: 'team',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 120
  }
]

// 绩效分析表格列定义
const performanceColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 120
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: 120
  },
  {
    title: '绩效评分',
    dataIndex: 'performance',
    key: 'performance',
    width: 150
  },
  {
    title: '趋势',
    dataIndex: 'trend',
    key: 'trend',
    width: 100
  },
  {
    title: '完成任务',
    dataIndex: 'completedTasks',
    key: 'completedTasks',
    width: 100
  },
  {
    title: '进行中任务',
    dataIndex: 'activeTasks',
    key: 'activeTasks',
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

// 风险颜色映射
const getRiskColor = (risk) => {
  const colorMap = {
    low: 'green',
    medium: 'orange',
    high: 'red'
  }
  return colorMap[risk] || 'default'
}

// 风险文本映射
const getRiskText = (risk) => {
  const textMap = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return textMap[risk] || '未知'
}

// 绩效颜色映射
const getPerformanceColor = (performance) => {
  if (performance >= 90) return '#52c41a'
  if (performance >= 80) return '#1890ff'
  if (performance >= 70) return '#faad14'
  return '#f5222d'
}

// 趋势颜色映射
const getTrendColor = (trend) => {
  const colorMap = {
    up: 'green',
    stable: 'blue',
    down: 'red'
  }
  return colorMap[trend] || 'default'
}

// 趋势文本映射
const getTrendText = (trend) => {
  const textMap = {
    up: '上升',
    stable: '稳定',
    down: '下降'
  }
  return textMap[trend] || '未知'
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 项目进度分析图表
    const progressChartInstance = echarts.init(progressChart.value)
    const progressOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['计划进度', '实际进度', '偏差']
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: {
        type: 'value',
        name: '进度(%)'
      },
      series: [
        {
          name: '计划进度',
          type: 'line',
          data: [20, 35, 50, 65, 80, 100],
          smooth: true
        },
        {
          name: '实际进度',
          type: 'line',
          data: [18, 32, 48, 62, 75, 85],
          smooth: true
        },
        {
          name: '偏差',
          type: 'bar',
          data: [2, 3, 2, 3, 5, 15]
        }
      ]
    }
    progressChartInstance.setOption(progressOption)

    // 团队绩效分析图表
    const performanceChartInstance = echarts.init(performanceChart.value)
    const performanceOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '团队绩效',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 35, name: '优秀' },
            { value: 45, name: '良好' },
            { value: 15, name: '一般' },
            { value: 5, name: '需改进' }
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
    performanceChartInstance.setOption(performanceOption)

    // 成本分析图表
    const costChartInstance = echarts.init(costChart.value)
    const costOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['人力成本', '设备成本', '软件成本', '其他成本']
      },
      yAxis: {
        type: 'value',
        name: '成本(万元)'
      },
      series: [
        {
          name: '预算成本',
          type: 'bar',
          data: [80, 25, 12, 8]
        },
        {
          name: '实际成本',
          type: 'bar',
          data: [75, 22, 10, 6]
        }
      ]
    }
    costChartInstance.setOption(costOption)

    // 风险预测图表
    const riskChartInstance = echarts.init(riskChart.value)
    const riskOption = {
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '风险分布',
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 60, name: '低风险' },
            { value: 30, name: '中风险' },
            { value: 10, name: '高风险' }
          ]
        }
      ]
    }
    riskChartInstance.setOption(riskOption)

    // 趋势预测图表
    const trendChartInstance = echarts.init(trendChart.value)
    const trendOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['Q1', 'Q2', 'Q3', 'Q4']
      },
      yAxis: {
        type: 'value',
        name: '项目数量'
      },
      series: [
        {
          name: '预测完成',
          type: 'line',
          data: [3, 5, 8, 12],
          smooth: true
        }
      ]
    }
    trendChartInstance.setOption(trendOption)

    // 资源需求预测图表
    const resourceChartInstance = echarts.init(resourceChart.value)
    const resourceOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['开发人员', '测试人员', '设计人员', '管理人员']
      },
      yAxis: {
        type: 'value',
        name: '需求人数'
      },
      series: [
        {
          name: '当前需求',
          type: 'bar',
          data: [8, 4, 2, 2]
        },
        {
          name: '预测需求',
          type: 'bar',
          data: [12, 6, 3, 3]
        }
      ]
    }
    resourceChartInstance.setOption(resourceOption)

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      progressChartInstance.resize()
      performanceChartInstance.resize()
      costChartInstance.resize()
      riskChartInstance.resize()
      trendChartInstance.resize()
      resourceChartInstance.resize()
    })
  })
}

// 筛选处理
const handleFilter = () => {
  console.log('筛选条件:', filterForm)
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 重置筛选
const handleReset = () => {
  Object.assign(filterForm, {
    dateRange: [],
    projectType: undefined,
    team: undefined
  })
  handleFilter()
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 查看详情
const viewDetails = (record) => {
  console.log('查看详情:', record)
  // 这里可以实现查看详情的逻辑
}

// 生成报告
const generateReport = (record) => {
  currentReport.value = {
    name: record.name,
    status: record.status,
    progress: record.progress,
    risk: record.risk,
    taskCompletion: 85,
    codeQuality: 92,
    testCoverage: 78,
    trends: [
      { id: 1, title: '项目启动', description: '项目正式启动，团队组建完成', time: '2024-01-15', icon: 'play' },
      { id: 2, title: '需求确认', description: '需求分析完成，技术方案确定', time: '2024-02-01', icon: 'check' },
      { id: 3, title: '开发阶段', description: '核心功能开发进行中', time: '2024-03-01', icon: 'code' }
    ],
    recommendations: [
      { id: 1, title: '优化开发流程', description: '建议采用敏捷开发方法，提高开发效率', priority: 'high', icon: '⚡', color: '#1890ff' },
      { id: 2, title: '加强测试覆盖', description: '增加自动化测试，提高代码质量', priority: 'medium', icon: '🔍', color: '#52c41a' },
      { id: 3, title: '风险控制', description: '建立风险预警机制，及时处理潜在问题', priority: 'low', icon: '🛡️', color: '#faad14' }
    ]
  }
  reportVisible.value = true
}

// 生命周期
onMounted(() => {
  pagination.total = projectAnalysis.value.length
  initCharts()
})
</script>

<style scoped>
.analytics-management {
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

.filter-section {
  margin-bottom: 16px;
}

.filter-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analysis-section {
  margin-bottom: 24px;
}

.analysis-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-content {
  max-height: 600px;
  overflow-y: auto;
}

.trend-desc {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}

.trend-time {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .analytics-management {
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