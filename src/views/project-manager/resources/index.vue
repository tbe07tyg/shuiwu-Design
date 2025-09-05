<template>
  <div class="resource-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>资源配置管理</h1>
      <p class="subtitle">项目资源统筹管理与优化配置</p>
    </div>

    <!-- 资源概览卡片 -->
    <div class="overview-section">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-card class="overview-card budget-card">
            <a-statistic title="项目预算" :value="resourceOverview.totalBudget" prefix="¥" />
            <div class="card-extra">
              <span class="used-amount">已使用: ¥{{ resourceOverview.usedBudget.toLocaleString() }}</span>
              <a-progress 
                :percent="Math.round((resourceOverview.usedBudget / resourceOverview.totalBudget) * 100)" 
                size="small" 
                :stroke-color="getBudgetColor()"
              />
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card equipment-card">
            <a-statistic title="设备资源" :value="resourceOverview.equipmentCount" suffix="台" />
            <div class="card-extra">
              <span class="status-text">使用中: {{ resourceOverview.equipmentInUse }}台</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card software-card">
            <a-statistic title="软件许可" :value="resourceOverview.softwareCount" suffix="个" />
            <div class="card-extra">
              <span class="status-text">已分配: {{ resourceOverview.softwareAssigned }}个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="overview-card vendor-card">
            <a-statistic title="外部供应商" :value="resourceOverview.vendorCount" suffix="家" />
            <div class="card-extra">
              <span class="status-text">合作中: {{ resourceOverview.vendorActive }}家</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 资源管理标签页 -->
    <div class="resource-tabs">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <!-- 预算管理 -->
        <a-tab-pane key="budget" tab="📊 预算管理">
          <div class="budget-management">
            <!-- 预算分析图表 -->
            <a-row :gutter="24">
              <a-col :span="16">
                <a-card title="预算执行分析" class="chart-card">
                  <div ref="budgetChartRef" style="height: 300px;"></div>
          </a-card>
        </a-col>
              <a-col :span="8">
                <a-card title="支出分类" class="chart-card">
                  <div ref="expenseChartRef" style="height: 300px;"></div>
          </a-card>
        </a-col>
      </a-row>

            <!-- 预算明细表 -->
            <a-card title="预算明细" class="table-card">
              <template #extra>
                <a-space>
                  <a-button type="primary" @click="addBudgetItem">
                    <PlusOutlined />
                    新增预算项
                  </a-button>
                  <a-button @click="exportBudget">
                    <DownloadOutlined />
                    导出预算
                  </a-button>
                </a-space>
              </template>
              
              <a-table 
                :dataSource="budgetItems" 
                :columns="budgetColumns" 
                :pagination="false"
                rowKey="id"
              >
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'progress'">
                    <a-progress 
                      :percent="Math.round((record.used / record.budget) * 100)"
                      size="small"
                      :stroke-color="getProgressColor(record.used / record.budget)"
                    />
                  </template>
                  <template v-else-if="column.key === 'status'">
                    <a-tag :color="getBudgetStatusColor(record.status)">
                      {{ getBudgetStatusText(record.status) }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button type="link" size="small" @click="editBudgetItem(record)">编辑</a-button>
                      <a-button type="link" size="small" @click="viewBudgetDetail(record)">详情</a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 设备管理 -->
        <a-tab-pane key="equipment" tab="🖥️ 设备管理">
          <div class="equipment-management">
            <!-- 搜索筛选 -->
            <a-card class="filter-card">
              <a-form layout="inline" :model="equipmentFilter">
                <a-form-item label="设备名称">
                  <a-input v-model:value="equipmentFilter.name" placeholder="请输入设备名称" />
          </a-form-item>
                <a-form-item label="设备类型">
                  <a-select v-model:value="equipmentFilter.type" placeholder="请选择类型" style="width: 150px">
                    <a-select-option value="computer">计算机</a-select-option>
              <a-select-option value="server">服务器</a-select-option>
              <a-select-option value="network">网络设备</a-select-option>
                    <a-select-option value="storage">存储设备</a-select-option>
            </a-select>
          </a-form-item>
                <a-form-item label="使用状态">
                  <a-select v-model:value="equipmentFilter.status" placeholder="请选择状态" style="width: 120px">
              <a-select-option value="available">可用</a-select-option>
                    <a-select-option value="in_use">使用中</a-select-option>
              <a-select-option value="maintenance">维护中</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
                  <a-button type="primary" @click="searchEquipment">搜索</a-button>
                  <a-button style="margin-left: 8px" @click="resetEquipmentFilter">重置</a-button>
          </a-form-item>
        </a-form>
      </a-card>

            <!-- 设备列表 -->
            <a-card title="设备列表" class="table-card">
              <template #extra>
      <a-space>
                  <a-button type="primary" @click="addEquipment">
          <PlusOutlined />
                    添加设备
        </a-button>
                  <a-button @click="batchOperation">
                    <SettingOutlined />
                    批量操作
        </a-button>
      </a-space>
              </template>

        <a-table
                :dataSource="equipmentList" 
                :columns="equipmentColumns"
                :pagination="equipmentPagination"
          rowKey="id"
                :row-selection="{ selectedRowKeys: selectedEquipment, onChange: onEquipmentSelect }"
        >
          <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag :color="getEquipmentStatusColor(record.status)">
                      {{ getEquipmentStatusText(record.status) }}
              </a-tag>
            </template>
                  <template v-else-if="column.key === 'assignee'">
                    <a-avatar size="small" style="margin-right: 8px">
                      {{ record.assignee?.substring(0, 1) }}
                    </a-avatar>
                    {{ record.assignee || '未分配' }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                      <a-button type="link" size="small" @click="assignEquipment(record)">分配</a-button>
                      <a-button type="link" size="small" @click="editEquipment(record)">编辑</a-button>
                <a-dropdown>
                  <a-button type="link" size="small">
                    更多
                    <DownOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                            <a-menu-item @click="maintenanceEquipment(record)">维护</a-menu-item>
                            <a-menu-item @click="decommissionEquipment(record)">停用</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
        </a-tab-pane>

        <!-- 软件管理 -->
        <a-tab-pane key="software" tab="💽 软件管理">
          <div class="software-management">
            <a-card title="软件许可管理" class="table-card">
              <template #extra>
                <a-space>
                  <a-button type="primary" @click="addSoftware">
                    <PlusOutlined />
                    添加软件
                  </a-button>
                  <a-button @click="renewLicense">
                    <SyncOutlined />
                    续费提醒
                  </a-button>
                </a-space>
              </template>
              
              <a-table 
                :dataSource="softwareList" 
                :columns="softwareColumns"
                :pagination="false"
                rowKey="id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'usage'">
            <a-progress
                      :percent="Math.round((record.used / record.total) * 100)"
                      size="small"
                      :format="() => `${record.used}/${record.total}`"
                    />
                  </template>
                  <template v-else-if="column.key === 'expiry'">
                    <span :class="{ 'expiry-warning': isExpiryWarning(record.expiry) }">
                      {{ record.expiry }}
                    </span>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button type="link" size="small" @click="assignSoftware(record)">分配</a-button>
                      <a-button type="link" size="small" @click="renewSoftware(record)">续费</a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 供应商管理 -->
        <a-tab-pane key="vendor" tab="🤝 供应商管理">
          <div class="vendor-management">
            <a-card title="供应商列表" class="table-card">
              <template #extra>
                <a-space>
                  <a-button type="primary" @click="addVendor">
                    <PlusOutlined />
                    添加供应商
                  </a-button>
                  <a-button @click="evaluateVendors">
                    <StarOutlined />
                    供应商评估
                  </a-button>
                </a-space>
              </template>
              
            <a-table
                :dataSource="vendorList" 
                :columns="vendorColumns"
              :pagination="false"
                rowKey="id"
            >
              <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'rating'">
                    <a-rate :value="record.rating" :allow-half="true" disabled />
                  </template>
                  <template v-else-if="column.key === 'status'">
                    <a-tag :color="getVendorStatusColor(record.status)">
                      {{ getVendorStatusText(record.status) }}
                  </a-tag>
                </template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button type="link" size="small" @click="viewVendorDetail(record)">详情</a-button>
                      <a-button type="link" size="small" @click="editVendor(record)">编辑</a-button>
                      <a-button type="link" size="small" @click="createContract(record)">签约</a-button>
                    </a-space>
                </template>
              </template>
            </a-table>
            </a-card>
          </div>
          </a-tab-pane>
        </a-tabs>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  DownloadOutlined,
  SettingOutlined,
  DownOutlined,
  SyncOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const activeTab = ref('budget')
const selectedEquipment = ref([])

// 资源概览数据
const resourceOverview = reactive({
  totalBudget: 500000,
  usedBudget: 320000,
  equipmentCount: 45,
  equipmentInUse: 32,
  softwareCount: 24,
  softwareAssigned: 18,
  vendorCount: 8,
  vendorActive: 6
})

// 筛选条件
const equipmentFilter = reactive({
  name: '',
  type: undefined,
  status: undefined
})

// 图表引用
const budgetChartRef = ref(null)
const expenseChartRef = ref(null)

// 预算数据
const budgetItems = ref([
  {
    id: 1,
    category: '人力成本',
    budget: 300000,
    used: 180000,
    remaining: 120000,
    status: 'normal'
  },
  {
    id: 2,
    category: '设备采购',
    budget: 150000,
    used: 120000,
    remaining: 30000,
    status: 'warning'
  },
  {
    id: 3,
    category: '软件许可',
    budget: 50000,
    used: 20000,
    remaining: 30000,
    status: 'normal'
  }
])

// 设备数据
const equipmentList = ref([
  {
    id: 1,
    name: '开发服务器-01',
    type: 'server',
    model: 'Dell PowerEdge R740',
    status: 'in_use',
    assignee: '张三',
    location: '机房A-01',
    purchaseDate: '2023-01-15'
  },
  {
    id: 2,
    name: '测试环境服务器',
    type: 'server',
    model: 'HP ProLiant DL380',
    status: 'available',
    assignee: null,
    location: '机房A-02',
    purchaseDate: '2023-03-20'
  }
])

// 软件数据
const softwareList = ref([
  {
    id: 1,
    name: 'IntelliJ IDEA',
    version: '2024.1',
    total: 10,
    used: 8,
    expiry: '2024-12-31',
    cost: 15000
  },
  {
    id: 2,
    name: 'Microsoft Office',
    version: '365',
    total: 20,
    used: 15,
    expiry: '2025-06-30',
    cost: 12000
  }
])

// 供应商数据
const vendorList = ref([
  {
    id: 1,
    name: '阿里云',
    category: '云服务',
    contact: '张经理',
    phone: '138-0001-0001',
    rating: 4.5,
    status: 'active',
    contractAmount: 100000
  },
  {
    id: 2,
    name: '华为技术',
    category: '硬件设备',
    contact: '李经理',
    phone: '138-0002-0002',
    rating: 4.8,
    status: 'active',
    contractAmount: 200000
  }
])

// 表格列定义
const budgetColumns = [
  { title: '预算类别', dataIndex: 'category', key: 'category' },
  { title: '预算总额', dataIndex: 'budget', key: 'budget', 
    customRender: ({ text }) => `¥${text.toLocaleString()}` },
  { title: '已使用', dataIndex: 'used', key: 'used',
    customRender: ({ text }) => `¥${text.toLocaleString()}` },
  { title: '剩余', dataIndex: 'remaining', key: 'remaining',
    customRender: ({ text }) => `¥${text.toLocaleString()}` },
  { title: '执行进度', key: 'progress' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

const equipmentColumns = [
  { title: '设备名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '型号', dataIndex: 'model', key: 'model' },
  { title: '状态', key: 'status' },
  { title: '使用人', key: 'assignee' },
  { title: '位置', dataIndex: 'location', key: 'location' },
  { title: '操作', key: 'action' }
]

const softwareColumns = [
  { title: '软件名称', dataIndex: 'name', key: 'name' },
  { title: '版本', dataIndex: 'version', key: 'version' },
  { title: '使用情况', key: 'usage' },
  { title: '到期时间', key: 'expiry' },
  { title: '年费用', dataIndex: 'cost', key: 'cost',
    customRender: ({ text }) => `¥${text.toLocaleString()}` },
  { title: '操作', key: 'action' }
]

const vendorColumns = [
  { title: '供应商名称', dataIndex: 'name', key: 'name' },
  { title: '类别', dataIndex: 'category', key: 'category' },
  { title: '联系人', dataIndex: 'contact', key: 'contact' },
  { title: '联系电话', dataIndex: 'phone', key: 'phone' },
  { title: '评级', key: 'rating' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

// 分页配置
const equipmentPagination = reactive({
  current: 1,
  pageSize: 10,
  total: equipmentList.value.length,
  showSizeChanger: true,
  showQuickJumper: true
})

// 工具方法
const getBudgetColor = () => {
  const ratio = resourceOverview.usedBudget / resourceOverview.totalBudget
  if (ratio > 0.9) return '#ff4d4f'
  if (ratio > 0.7) return '#faad14'
  return '#52c41a'
}

const getProgressColor = (ratio) => {
  if (ratio > 0.9) return '#ff4d4f'
  if (ratio > 0.7) return '#faad14'
  return '#52c41a'
}

const getBudgetStatusColor = (status) => {
  const colors = {
    'normal': 'green',
    'warning': 'orange',
    'danger': 'red'
  }
  return colors[status] || 'default'
}

const getBudgetStatusText = (status) => {
  const texts = {
    'normal': '正常',
    'warning': '预警',
    'danger': '超支'
  }
  return texts[status] || '未知'
}

const getEquipmentStatusColor = (status) => {
  const colors = {
    'available': 'green',
    'in_use': 'blue',
    'maintenance': 'orange',
    'decommissioned': 'red'
  }
  return colors[status] || 'default'
}

const getEquipmentStatusText = (status) => {
  const texts = {
    'available': '可用',
    'in_use': '使用中',
    'maintenance': '维护中',
    'decommissioned': '已停用'
  }
  return texts[status] || '未知'
}

const getVendorStatusColor = (status) => {
  const colors = {
    'active': 'green',
    'inactive': 'red',
    'pending': 'orange'
  }
  return colors[status] || 'default'
}

const getVendorStatusText = (status) => {
  const texts = {
    'active': '合作中',
    'inactive': '已停止',
    'pending': '待签约'
  }
  return texts[status] || '未知'
}

const isExpiryWarning = (expiry) => {
  const expiryDate = new Date(expiry)
  const now = new Date()
  const diffTime = expiryDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 30
}

// 事件处理方法
const onEquipmentSelect = (selectedRowKeys) => {
  selectedEquipment.value = selectedRowKeys
}

// 预算管理方法
const addBudgetItem = () => {
  message.info('添加预算项功能')
}

const editBudgetItem = (record) => {
  message.info(`编辑预算项: ${record.category}`)
}

const viewBudgetDetail = (record) => {
  message.info(`查看预算详情: ${record.category}`)
}

const exportBudget = () => {
  message.info('导出预算数据')
}

// 设备管理方法
const searchEquipment = () => {
  message.info('搜索设备')
}

const resetEquipmentFilter = () => {
  Object.assign(equipmentFilter, {
    name: '',
    type: undefined,
    status: undefined
  })
}

const addEquipment = () => {
  message.info('添加设备')
}

const editEquipment = (record) => {
  message.info(`编辑设备: ${record.name}`)
}

const assignEquipment = (record) => {
  message.info(`分配设备: ${record.name}`)
}

const maintenanceEquipment = (record) => {
  message.info(`设备维护: ${record.name}`)
}

const decommissionEquipment = (record) => {
  message.info(`设备停用: ${record.name}`)
}

const batchOperation = () => {
  if (selectedEquipment.value.length === 0) {
    message.warning('请选择要操作的设备')
    return
  }
  message.info(`批量操作 ${selectedEquipment.value.length} 台设备`)
}

// 软件管理方法
const addSoftware = () => {
  message.info('添加软件')
}

const assignSoftware = (record) => {
  message.info(`分配软件: ${record.name}`)
}

const renewSoftware = (record) => {
  message.info(`续费软件: ${record.name}`)
}

const renewLicense = () => {
  message.info('续费提醒')
}

// 供应商管理方法
const addVendor = () => {
  message.info('添加供应商')
}

const editVendor = (record) => {
  message.info(`编辑供应商: ${record.name}`)
}

const viewVendorDetail = (record) => {
  message.info(`查看供应商详情: ${record.name}`)
}

const createContract = (record) => {
  message.info(`签约供应商: ${record.name}`)
}

const evaluateVendors = () => {
  message.info('供应商评估')
}

// 图表初始化
const initCharts = async () => {
  await nextTick()
  
  // 预算执行图表
  if (budgetChartRef.value) {
    const budgetChart = echarts.init(budgetChartRef.value)
    const budgetOption = {
      title: { text: '月度预算执行情况' },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
      yAxis: { type: 'value' },
      series: [{
        data: [50000, 80000, 120000, 180000, 250000, 320000],
        type: 'line',
        smooth: true,
        areaStyle: {}
      }]
    }
    budgetChart.setOption(budgetOption)
  }
  
  // 支出分类图表
  if (expenseChartRef.value) {
    const expenseChart = echarts.init(expenseChartRef.value)
    const expenseOption = {
      title: { text: '支出构成' },
      series: [{
        type: 'pie',
        data: [
          { value: 180000, name: '人力成本' },
          { value: 120000, name: '设备采购' },
          { value: 20000, name: '软件许可' }
        ]
      }]
    }
    expenseChart.setOption(expenseOption)
  }
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.resource-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  color: #234fa2;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.overview-section {
  margin-bottom: 32px;
}

.overview-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-extra {
  margin-top: 16px;
}

.used-amount {
  color: #666;
  font-size: 12px;
  display: block;
  margin-bottom: 8px;
}

.status-text {
  color: #666;
  font-size: 12px;
}

.resource-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.chart-card {
  margin-bottom: 24px;
}

.table-card {
  border: none;
  box-shadow: none;
}

.filter-card {
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.expiry-warning {
  color: #ff4d4f;
  font-weight: bold;
}

/* 卡片主题色 */
.budget-card .ant-statistic-title {
  color: #1890ff;
}

.equipment-card .ant-statistic-title {
  color: #52c41a;
}

.software-card .ant-statistic-title {
  color: #722ed1;
}

.vendor-card .ant-statistic-title {
  color: #fa8c16;
}
</style> 