<template>
  <div class="project-archive-completed">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <DatabaseOutlined />
        已完成项目归档
      </h1>
      <p class="subtitle">查看和管理已完成的项目归档信息</p>
    </div>

    <!-- 归档说明 -->
    <div class="archive-info">
      <a-alert 
        message="项目归档说明" 
        description="已完成的项目将自动进入归档状态，包含项目基本信息、执行过程文档、成果文件等完整记录。归档项目可用于经验总结、成果复用和绩效评估。"
        type="info" 
        show-icon 
        style="margin-bottom: 24px;"
      />
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <a-card class="search-card">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="项目名称">
            <a-input
              v-model:value="searchForm.name"
              placeholder="请输入项目名称"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="完成时间">
            <a-range-picker
              v-model:value="searchForm.completionDate"
              placeholder="['开始时间', '结束时间']"
              style="width: 300px"
            />
          </a-form-item>
          <!-- 项目经理搜索已移除 - 当前用户只能看到自己负责的项目 -->
          <a-form-item label="归档状态">
            <a-select
              v-model:value="searchForm.archiveStatus"
              placeholder="请选择归档状态"
              allow-clear
              style="width: 150px"
            >
              <a-select-option value="archived">已归档</a-select-option>
              <a-select-option value="pending">待归档</a-select-option>
              <a-select-option value="reviewing">归档审核中</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined />
              搜索
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              <ReloadOutlined />
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 操作按钮区域 -->
    <div class="actions-section">
      <a-space>
        <a-button @click="exportArchive">
          <DownloadOutlined />
          导出归档列表
        </a-button>
        <a-button @click="batchArchive">
          <DatabaseOutlined />
          批量归档
        </a-button>
        <a-button @click="refreshData">
          <ReloadOutlined />
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 归档项目统计卡片 -->
    <div class="stats-section">
      <a-row :gutter="[16, 16]">
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="已归档项目"
              :value="archiveStats.totalArchived"
              :value-style="{ color: '#52c41a' }"
              suffix="个"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="待归档项目"
              :value="archiveStats.pendingArchive"
              :value-style="{ color: '#fa8c16' }"
              suffix="个"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="归档文档"
              :value="archiveStats.totalDocuments"
              :value-style="{ color: '#1890ff' }"
              suffix="份"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="存储容量"
              :value="archiveStats.storageSize"
              :value-style="{ color: '#722ed1' }"
              suffix="GB"
            />
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 归档项目列表 -->
    <div class="archive-list-section">
      <a-card class="list-card">
        <template #title>
          <FileTextOutlined />
          归档项目列表
        </template>
        
        <a-table
          :dataSource="archivedProjects"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          rowKey="id"
          @change="handleTableChange"
        >
          <!-- 项目状态 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'archiveStatus'">
              <a-tag :color="getArchiveStatusColor(record.archiveStatus)">
                {{ getArchiveStatusText(record.archiveStatus) }}
              </a-tag>
            </template>
            
            <!-- 完成度 -->
            <template v-else-if="column.key === 'progress'">
              <a-progress :percent="record.progress" size="small" />
            </template>
            
            <!-- 成果数量 -->
            <template v-else-if="column.key === 'achievements'">
              <a-space>
                <a-tag color="blue">{{ record.documents }}份文档</a-tag>
                <a-tag color="green">{{ record.deliverables }}个交付物</a-tag>
              </a-space>
            </template>
            
            <!-- 操作列 -->
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="viewArchiveDetail(record)">
                  <EyeOutlined />
                  查看详情
                </a-button>
                <a-button type="link" @click="downloadArchive(record)">
                  <DownloadOutlined />
                  下载归档
                </a-button>
                <a-dropdown>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="viewProjectReport(record)">
                        <FileTextOutlined />
                        项目报告
                      </a-menu-item>
                      <a-menu-item @click="viewProjectDocs(record)">
                        <FolderOpenOutlined />
                        查看文档
                      </a-menu-item>
                      <a-menu-item @click="shareProject(record)">
                        <ShareAltOutlined />
                        分享项目
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="link">
                    更多
                    <DownOutlined />
                  </a-button>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      :title="`归档项目详情 - ${currentProject?.name || ''}`"
      width="1000px"
      :footer="null"
    >
      <div v-if="currentProject" class="archive-detail">
        <!-- 项目基本信息 -->
        <a-descriptions title="项目基本信息" bordered :column="2">
          <a-descriptions-item label="项目名称">{{ currentProject.name }}</a-descriptions-item>
          <a-descriptions-item label="项目编号">{{ currentProject.code }}</a-descriptions-item>
          <a-descriptions-item label="项目经理">{{ currentProject.manager }}</a-descriptions-item>
          <a-descriptions-item label="归档状态">
            <a-tag :color="getArchiveStatusColor(currentProject.archiveStatus)">
              {{ getArchiveStatusText(currentProject.archiveStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">{{ currentProject.startDate }}</a-descriptions-item>
          <a-descriptions-item label="完成时间">{{ currentProject.completionDate }}</a-descriptions-item>
          <a-descriptions-item label="归档时间">{{ currentProject.archiveDate }}</a-descriptions-item>
          <a-descriptions-item label="项目周期">{{ currentProject.duration }}天</a-descriptions-item>
        </a-descriptions>

        <!-- 项目成果 -->
        <a-divider>项目成果</a-divider>
        <a-row :gutter="[16, 16]">
          <a-col :span="8">
            <a-card size="small">
              <a-statistic
                title="文档数量"
                :value="currentProject.documents"
                suffix="份"
                :value-style="{ color: '#1890ff' }"
              />
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card size="small">
              <a-statistic
                title="交付物"
                :value="currentProject.deliverables"
                suffix="个"
                :value-style="{ color: '#52c41a' }"
              />
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card size="small">
              <a-statistic
                title="文件大小"
                :value="currentProject.fileSize"
                suffix="MB"
                :value-style="{ color: '#722ed1' }"
              />
            </a-card>
          </a-col>
        </a-row>

        <!-- 项目总结 -->
        <a-divider>项目总结</a-divider>
        <div class="project-summary">
          <p><strong>项目描述：</strong>{{ currentProject.description }}</p>
          <p><strong>主要成果：</strong>{{ currentProject.achievements }}</p>
          <p><strong>经验总结：</strong>{{ currentProject.lessons }}</p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  DatabaseOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  ShareAltOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const currentProject = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  completionDate: null,
  archiveStatus: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`
})

// 归档统计数据
const archiveStats = reactive({
  totalArchived: 25,
  pendingArchive: 3,
  totalDocuments: 156,
  storageSize: 15.6
})

// 归档项目列表
// 注意：实际开发中，这里的数据应该根据当前登录的项目经理ID进行过滤
// 只显示该项目经理负责的已完成项目，实现数据隔离
const archivedProjects = ref([
  {
    id: 1,
    name: '智能科研管理系统开发',
    code: 'PRJ-2024-001',
    manager: '张经理',
    startDate: '2024-01-15',
    completionDate: '2024-06-30',
    archiveDate: '2024-07-05',
    duration: 167,
    progress: 100,
    archiveStatus: 'archived',
    documents: 25,
    deliverables: 5,
    fileSize: 1250,
    description: '开发一套智能化的科研管理系统，提升科研项目管理效率',
    achievements: '完成系统设计、开发、测试、部署全流程，交付可用的科研管理平台',
    lessons: '项目管理流程规范化，团队协作效率高，技术架构设计合理'
  },
  {
    id: 2,
    name: '移动端应用开发',
    code: 'PRJ-2023-003',
    manager: '王经理',
    startDate: '2023-10-01',
    completionDate: '2024-01-31',
    archiveDate: '2024-02-15',
    duration: 123,
    progress: 100,
    archiveStatus: 'archived',
    documents: 18,
    deliverables: 3,
    fileSize: 850,
    description: '基于React Native的移动端应用开发',
    achievements: '完成iOS和Android双端应用开发，用户体验良好',
    lessons: '移动端开发需要更多关注用户体验和性能优化'
  },
  {
    id: 3,
    name: '数据分析平台建设',
    code: 'PRJ-2024-002',
    manager: '李经理',
    startDate: '2024-02-01',
    completionDate: '2024-08-31',
    archiveDate: null,
    duration: 213,
    progress: 100,
    archiveStatus: 'pending',
    documents: 22,
    deliverables: 4,
    fileSize: 1100,
    description: '构建企业级数据分析平台，支持大数据处理和分析',
    achievements: '完成数据仓库建设、分析工具开发、可视化报表系统',
    lessons: '大数据项目需要充分的前期规划和架构设计'
  }
])

// 表格列定义
const columns = [
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    fixed: 'left'
  },
  {
    title: '项目编号',
    dataIndex: 'code',
    key: 'code',
    width: 120
  },
  {
    title: '项目经理',
    dataIndex: 'manager',
    key: 'manager',
    width: 100
  },
  {
    title: '完成时间',
    dataIndex: 'completionDate',
    key: 'completionDate',
    width: 120
  },
  {
    title: '归档时间',
    dataIndex: 'archiveDate',
    key: 'archiveDate',
    width: 120
  },
  {
    title: '归档状态',
    key: 'archiveStatus',
    width: 100
  },
  {
    title: '项目周期',
    dataIndex: 'duration',
    key: 'duration',
    width: 100,
    customRender: ({ text }) => `${text}天`
  },
  {
    title: '成果统计',
    key: 'achievements',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 归档状态颜色映射
const getArchiveStatusColor = (status) => {
  const colorMap = {
    archived: 'green',
    pending: 'orange',
    reviewing: 'blue'
  }
  return colorMap[status] || 'default'
}

// 归档状态文本映射
const getArchiveStatusText = (status) => {
  const textMap = {
    archived: '已归档',
    pending: '待归档',
    reviewing: '审核中'
  }
  return textMap[status] || '未知'
}

// 搜索功能
const handleSearch = () => {
  message.info('搜索功能')
  // 实际项目中会调用API进行搜索
}

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  searchForm.completionDate = null
  searchForm.archiveStatus = ''
  message.success('已重置搜索条件')
}

// 表格变化处理
const handleTableChange = (paginationInfo) => {
  pagination.current = paginationInfo.current
  pagination.pageSize = paginationInfo.pageSize
  // 实际项目中会重新获取数据
}

// 查看归档详情
const viewArchiveDetail = (record) => {
  currentProject.value = record
  detailVisible.value = true
}

// 下载归档
const downloadArchive = (record) => {
  message.success(`正在下载项目 "${record.name}" 的归档文件`)
}

// 查看项目报告
const viewProjectReport = (record) => {
  message.info(`查看项目 "${record.name}" 的项目报告`)
}

// 查看项目文档
const viewProjectDocs = (record) => {
  message.info(`查看项目 "${record.name}" 的相关文档`)
}

// 分享项目
const shareProject = (record) => {
  message.info(`分享项目 "${record.name}"`)
}

// 导出归档列表
const exportArchive = () => {
  message.success('正在导出归档列表')
}

// 批量归档
const batchArchive = () => {
  message.info('批量归档功能')
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('数据已刷新')
  }, 1000)
}

// 生命周期
onMounted(() => {
  // 初始化数据
  pagination.total = archivedProjects.value.length
})
</script>

<style scoped>
.project-archive-completed {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  color: #234fa2;
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 24px;
}

.search-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 操作按钮区域 */
.actions-section {
  margin-bottom: 24px;
}

/* 统计卡片区域 */
.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 列表区域 */
.list-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 项目详情弹窗 */
.archive-detail {
  max-height: 600px;
  overflow-y: auto;
}

.project-summary {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
}

.project-summary p {
  margin-bottom: 12px;
}

.project-summary p:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-archive-completed {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .stats-section .ant-col {
    margin-bottom: 16px;
  }
}
</style>