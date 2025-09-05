<!--
 * @file 研究发现面板组件
 * @description 记录和管理研究过程中的发现
-->
<template>
  <a-card class="research-discovery-card" title="💡 研究发现">
    <template #extra>
      <a-button type="primary" size="small" @click="handleAddDiscovery">
        <PlusOutlined />
        记录新发现
      </a-button>
    </template>

    <div class="discovery-content">
      <!-- 发现统计 -->
      <div class="discovery-stats">
        <div class="stat-item">
          <div class="stat-number">{{ getDiscoveryCount('high') }}</div>
          <div class="stat-label">重要发现</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ getDiscoveryCount('medium') }}</div>
          <div class="stat-label">一般发现</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ getDiscoveryCount('confirmed') }}</div>
          <div class="stat-label">已确认</div>
        </div>
      </div>

      <!-- 发现分类筛选 -->
      <div class="discovery-filters">
        <a-radio-group 
          v-model:value="selectedCategory" 
          size="small"
          @change="handleCategoryChange"
        >
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="technical_innovation">技术创新</a-radio-button>
          <a-radio-button value="user_experience">用户体验</a-radio-button>
          <a-radio-button value="security">安全防护</a-radio-button>
          <a-radio-button value="performance">性能优化</a-radio-button>
        </a-radio-group>
      </div>

      <!-- 发现列表 -->
      <div class="discoveries-list">
        <div 
          v-for="discovery in filteredDiscoveries" 
          :key="discovery.id"
          class="discovery-item"
          :class="getImportanceClass(discovery.importance)"
        >
          <div class="discovery-header">
            <div class="discovery-info">
              <div class="discovery-title">{{ discovery.title }}</div>
              <div class="discovery-meta">
                <a-tag :color="getImportanceColor(discovery.importance)" size="small">
                  {{ getImportanceText(discovery.importance) }}
                </a-tag>
                <a-tag :color="getCategoryColor(discovery.category)" size="small">
                  {{ getCategoryText(discovery.category) }}
                </a-tag>
                <a-tag :color="getStatusColor(discovery.status)" size="small">
                  {{ getStatusText(discovery.status) }}
                </a-tag>
              </div>
            </div>
            <div class="discovery-actions">
              <a-button size="small" type="text" @click="handleEditDiscovery(discovery)">
                <EditOutlined />
              </a-button>
              <a-button size="small" type="text" @click="handleViewDiscovery(discovery)">
                <EyeOutlined />
              </a-button>
            </div>
          </div>

          <div class="discovery-description">
            {{ discovery.description }}
          </div>

          <div class="discovery-details">
            <div class="detail-item">
              <ClockCircleOutlined />
              <span>发现时间：{{ formatTime(discovery.discoveredTime) }}</span>
            </div>
            <div v-if="discovery.relatedTask" class="detail-item">
              <LinkOutlined />
              <span>关联任务：{{ getTaskTitle(discovery.relatedTask) }}</span>
            </div>
            <div v-if="discovery.attachments && discovery.attachments.length > 0" class="detail-item">
              <PaperClipOutlined />
              <span>附件：{{ discovery.attachments.length }}个</span>
            </div>
          </div>

          <div v-if="discovery.tags && discovery.tags.length > 0" class="discovery-tags">
            <a-tag 
              v-for="tag in discovery.tags" 
              :key="tag"
              size="small"
              color="blue"
            >
              {{ tag }}
            </a-tag>
          </div>

          <div class="discovery-footer">
            <div class="discovery-category">
              <component :is="getCategoryIcon(discovery.category)" />
              <span>{{ getCategoryText(discovery.category) }}</span>
            </div>
            <div class="discovery-status">
              <component :is="getStatusIcon(discovery.status)" />
              <span>{{ getStatusText(discovery.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredDiscoveries.length === 0" class="empty-state">
        <a-empty description="暂无研究发现">
          <a-button type="primary" @click="handleAddDiscovery">
            <PlusOutlined />
            记录第一个发现
          </a-button>
        </a-empty>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button @click="handleExportDiscoveries">
          <ExportOutlined />
          导出发现
        </a-button>
        <a-button @click="handleDiscoveryStatistics">
          <BarChartOutlined />
          发现统计
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  PaperClipOutlined,
  ExportOutlined,
  BarChartOutlined,
  BulbOutlined,
  UserOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  discoveries: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['add-discovery', 'edit-discovery', 'view-discovery'])

// 响应式数据
const selectedCategory = ref('all')

// 计算属性
const filteredDiscoveries = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.discoveries.sort((a, b) => new Date(b.discoveredTime) - new Date(a.discoveredTime))
  }
  return props.discoveries
    .filter(discovery => discovery.category === selectedCategory.value)
    .sort((a, b) => new Date(b.discoveredTime) - new Date(a.discoveredTime))
})

// 方法
const handleAddDiscovery = () => {
  emit('add-discovery')
}

const handleEditDiscovery = (discovery) => {
  emit('edit-discovery', discovery)
}

const handleViewDiscovery = (discovery) => {
  emit('view-discovery', discovery)
}

const handleCategoryChange = () => {
  console.log('分类筛选:', selectedCategory.value)
}

const handleExportDiscoveries = () => {
  message.success('研究发现导出成功')
}

const handleDiscoveryStatistics = () => {
  message.info('查看发现统计')
}

// 工具方法
const getDiscoveryCount = (type) => {
  if (type === 'confirmed') {
    return props.discoveries.filter(d => d.status === 'confirmed').length
  }
  return props.discoveries.filter(d => d.importance === type).length
}

const getImportanceClass = (importance) => {
  return `importance-${importance}`
}

const getImportanceColor = (importance) => {
  const colorMap = {
    'high': 'red',
    'medium': 'orange',
    'low': 'blue'
  }
  return colorMap[importance] || 'default'
}

const getImportanceText = (importance) => {
  const textMap = {
    'high': '重要',
    'medium': '一般',
    'low': '待确认'
  }
  return textMap[importance] || importance
}

const getCategoryColor = (category) => {
  const colorMap = {
    'technical_innovation': 'purple',
    'user_experience': 'green',
    'security': 'red',
    'performance': 'orange',
    'process_improvement': 'blue'
  }
  return colorMap[category] || 'default'
}

const getCategoryText = (category) => {
  const textMap = {
    'technical_innovation': '技术创新',
    'user_experience': '用户体验',
    'security': '安全防护',
    'performance': '性能优化',
    'process_improvement': '流程改进'
  }
  return textMap[category] || category
}

const getCategoryIcon = (category) => {
  const iconMap = {
    'technical_innovation': BulbOutlined,
    'user_experience': UserOutlined,
    'security': SafetyOutlined,
    'performance': ThunderboltOutlined,
    'process_improvement': FileTextOutlined
  }
  return iconMap[category] || BulbOutlined
}

const getStatusColor = (status) => {
  const colorMap = {
    'confirmed': 'success',
    'draft': 'warning',
    'applied': 'processing'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'confirmed': '已确认',
    'draft': '草稿',
    'applied': '已应用'
  }
  return textMap[status] || status
}

const getStatusIcon = (status) => {
  const iconMap = {
    'confirmed': CheckCircleOutlined,
    'draft': SyncOutlined,
    'applied': CheckCircleOutlined
  }
  return iconMap[status] || SyncOutlined
}

const getTaskTitle = (taskId) => {
  // 模拟获取任务标题
  const taskMap = {
    'T001': '系统架构设计',
    'T002': '前端界面开发',
    'T003': '接口联调测试'
  }
  return taskMap[taskId] || '未知任务'
}

const formatTime = (timeString) => {
  if (!timeString) return '-'
  return new Date(timeString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.research-discovery-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.discovery-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.discovery-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.stat-item {
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #e6f7ff;
  transform: translateY(-1px);
}

.stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

.discovery-filters {
  margin-bottom: 8px;
}

.discoveries-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.discovery-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #e8e8e8;
  transition: all 0.3s;
}

.discovery-item:hover {
  background: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.discovery-item.importance-high {
  border-left-color: #ff4d4f;
}

.discovery-item.importance-medium {
  border-left-color: #faad14;
}

.discovery-item.importance-low {
  border-left-color: #52c41a;
}

.discovery-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.discovery-info {
  flex: 1;
}

.discovery-title {
  font-weight: 500;
  color: #234fa2;
  font-size: 16px;
  margin-bottom: 6px;
}

.discovery-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.discovery-actions {
  display: flex;
  gap: 4px;
}

.discovery-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.discovery-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;
  font-size: 12px;
}

.discovery-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.discovery-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.discovery-category,
.discovery-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-buttons .ant-btn {
  flex: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .discovery-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .discovery-filters {
    overflow-x: auto;
  }
  
  .discovery-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .discovery-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .discovery-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>

