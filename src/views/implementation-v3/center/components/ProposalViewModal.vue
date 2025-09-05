<!--
 * @file 申报书查看弹窗组件
 * @description 查看完整申报书内容
-->
<template>
  <a-modal
    :open="visible"
    title="申报书详情"
    width="1000px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="proposal-view-content">
      <!-- 申报书基本信息 -->
      <div class="proposal-header">
        <div class="header-info">
          <h3>{{ proposal?.title }}</h3>
          <div class="header-meta">
            <div class="meta-item">
              <CalendarOutlined />
              <span>上传时间：{{ formatTime(proposal?.uploadTime) }}</span>
            </div>
            <div class="meta-item">
              <FileTextOutlined />
              <span>文档类型：PDF</span>
            </div>
            <div class="meta-item">
              <UserOutlined />
              <span>申请人：张教授</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <a-button @click="handleDownload">
            <DownloadOutlined />
            下载原文
          </a-button>
          <a-button type="primary" @click="handleReparse">
            <ReloadOutlined />
            重新解析
          </a-button>
        </div>
      </div>

      <!-- 申报书内容 -->
      <div class="proposal-content">
        <a-tabs v-model:activeKey="activeTab" type="card">
          <!-- 项目概述 -->
          <a-tab-pane key="overview" tab="项目概述">
            <div class="content-section">
              <h4>项目名称</h4>
              <p>基于人工智能的科研管理系统关键技术研究与应用</p>
              
              <h4>项目背景</h4>
              <p>随着科研项目数量的快速增长和管理复杂度的不断提升，传统的科研管理方式已经难以满足现代科研工作的需求。本项目旨在通过人工智能技术，构建一套智能化的科研管理系统，提升科研项目的管理效率和质量。</p>
              
              <h4>研究意义</h4>
              <ul>
                <li>提升科研项目管理的智能化水平</li>
                <li>优化科研资源配置和利用效率</li>
                <li>促进科研成果的转化和应用</li>
                <li>为科研管理提供决策支持</li>
              </ul>
              
              <h4>预期目标</h4>
              <p>构建一套完整的智能化科研管理系统，实现项目全生命周期管理，提升管理效率30%以上，降低管理成本20%以上。</p>
            </div>
          </a-tab-pane>

          <!-- 研究内容 -->
          <a-tab-pane key="research" tab="研究内容">
            <div class="content-section">
              <div class="research-modules">
                <div class="module-item" v-for="(module, index) in researchModules" :key="index">
                  <div class="module-header">
                    <h4>{{ module.title }}</h4>
                    <a-tag :color="getPriorityColor(module.priority)">
                      {{ getPriorityText(module.priority) }}
                    </a-tag>
                  </div>
                  <div class="module-content">
                    <p><strong>研究内容：</strong>{{ module.content }}</p>
                    <p><strong>技术路线：</strong>{{ module.approach }}</p>
                    <p><strong>预期成果：</strong></p>
                    <ul>
                      <li v-for="outcome in module.outcomes" :key="outcome">{{ outcome }}</li>
                    </ul>
                    <p><strong>研究周期：</strong>{{ module.duration }}个月</p>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <!-- 技术路线 -->
          <a-tab-pane key="technical" tab="技术路线">
            <div class="content-section">
              <div class="technical-route">
                <div class="route-timeline">
                  <div class="timeline-item" v-for="(phase, index) in technicalPhases" :key="index">
                    <div class="timeline-marker">
                      <div class="marker-dot"></div>
                      <div class="marker-line" v-if="index < technicalPhases.length - 1"></div>
                    </div>
                    <div class="timeline-content">
                      <div class="phase-header">
                        <h4>阶段{{ index + 1 }}：{{ phase.title }}</h4>
                        <span class="phase-duration">{{ phase.duration }}个月</span>
                      </div>
                      <div class="phase-description">
                        {{ phase.description }}
                      </div>
                      <div class="phase-tasks">
                        <strong>主要任务：</strong>
                        <ul>
                          <li v-for="task in phase.tasks" :key="task">{{ task }}</li>
                        </ul>
                      </div>
                      <div class="phase-deliverables">
                        <strong>交付成果：</strong>
                        <div class="deliverable-tags">
                          <a-tag v-for="deliverable in phase.deliverables" :key="deliverable" color="blue">
                            {{ deliverable }}
                          </a-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <!-- 预算方案 -->
          <a-tab-pane key="budget" tab="预算方案">
            <div class="content-section">
              <div class="budget-overview">
                <h4>总预算：500万元</h4>
                <div class="budget-chart">
                  <div class="budget-item" v-for="item in budgetItems" :key="item.category">
                    <div class="budget-category">{{ item.category }}</div>
                    <div class="budget-amount">{{ item.amount }}万元</div>
                    <div class="budget-percentage">{{ item.percentage }}%</div>
                    <div class="budget-bar">
                      <div class="bar-fill" :style="{ width: item.percentage + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="budget-details">
                <h4>预算明细</h4>
                <a-table 
                  :dataSource="budgetDetails" 
                  :columns="budgetColumns" 
                  :pagination="false"
                  size="small"
                />
              </div>
            </div>
          </a-tab-pane>

          <!-- 团队配置 -->
          <a-tab-pane key="team" tab="团队配置">
            <div class="content-section">
              <div class="team-structure">
                <h4>项目团队结构</h4>
                <div class="team-members">
                  <div class="member-card" v-for="member in teamMembers" :key="member.name">
                    <div class="member-avatar">
                      <a-avatar :size="48">{{ member.name.charAt(0) }}</a-avatar>
                    </div>
                    <div class="member-info">
                      <div class="member-name">{{ member.name }}</div>
                      <div class="member-title">{{ member.title }}</div>
                      <div class="member-role">{{ member.role }}</div>
                      <div class="member-expertise">
                        <a-tag v-for="skill in member.expertise" :key="skill" size="small">
                          {{ skill }}
                        </a-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <!-- 风险评估 -->
          <a-tab-pane key="risk" tab="风险评估">
            <div class="content-section">
              <div class="risk-analysis">
                <h4>项目风险分析</h4>
                <div class="risk-items">
                  <div class="risk-item" v-for="risk in riskItems" :key="risk.id">
                    <div class="risk-header">
                      <div class="risk-title">{{ risk.title }}</div>
                      <a-tag :color="getRiskLevelColor(risk.level)">
                        {{ getRiskLevelText(risk.level) }}
                      </a-tag>
                    </div>
                    <div class="risk-description">{{ risk.description }}</div>
                    <div class="risk-mitigation">
                      <strong>应对措施：</strong>{{ risk.mitigation }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { 
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  proposal: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible'])

// 响应式数据
const activeTab = ref('overview')

// 模拟数据
const researchModules = [
  {
    title: '需求分析与系统设计',
    priority: 'high',
    content: '深入调研科研管理现状，分析用户需求，设计系统整体架构',
    approach: '采用用户调研、需求建模、架构设计等方法',
    outcomes: ['需求分析报告', '系统架构设计文档', '数据库设计方案'],
    duration: 6
  },
  {
    title: '核心算法研发',
    priority: 'high',
    content: '研发智能任务分解、进度预测、风险评估等核心算法',
    approach: '基于机器学习和数据挖掘技术',
    outcomes: ['算法设计文档', '原型系统', '性能测试报告'],
    duration: 12
  },
  {
    title: '系统集成与测试',
    priority: 'medium',
    content: '完成系统集成，进行全面测试和性能优化',
    approach: '采用敏捷开发和持续集成方法',
    outcomes: ['集成测试报告', '系统部署文档', '用户手册'],
    duration: 6
  }
]

const technicalPhases = [
  {
    title: '需求调研与分析',
    duration: 3,
    description: '深入调研科研管理现状，分析用户需求和业务流程',
    tasks: ['用户访谈', '业务流程分析', '需求建模', '原型设计'],
    deliverables: ['需求分析报告', '业务流程图', '系统原型']
  },
  {
    title: '系统设计与架构',
    duration: 3,
    description: '设计系统整体架构，确定技术方案和实现路径',
    tasks: ['架构设计', '技术选型', '接口设计', '数据库设计'],
    deliverables: ['架构设计文档', '技术方案', '接口规范']
  },
  {
    title: '核心功能开发',
    duration: 12,
    description: '开发系统核心功能模块，实现智能化管理功能',
    tasks: ['算法开发', '功能实现', '模块集成', '单元测试'],
    deliverables: ['核心算法', '功能模块', '测试报告']
  },
  {
    title: '系统测试与优化',
    duration: 6,
    description: '进行系统测试，优化性能，完善功能',
    tasks: ['集成测试', '性能测试', '用户测试', '系统优化'],
    deliverables: ['测试报告', '优化方案', '部署文档']
  }
]

const budgetItems = [
  { category: '人员费用', amount: 200, percentage: 40 },
  { category: '设备费用', amount: 150, percentage: 30 },
  { category: '材料费用', amount: 50, percentage: 10 },
  { category: '测试费用', amount: 50, percentage: 10 },
  { category: '其他费用', amount: 50, percentage: 10 }
]

const budgetColumns = [
  { title: '费用类别', dataIndex: 'category', key: 'category' },
  { title: '预算金额（万元）', dataIndex: 'amount', key: 'amount' },
  { title: '占比', dataIndex: 'percentage', key: 'percentage' },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const budgetDetails = [
  { category: '项目负责人', amount: 80, percentage: '16%', description: '项目管理和技术指导' },
  { category: '高级工程师', amount: 60, percentage: '12%', description: '核心算法开发' },
  { category: '中级工程师', amount: 40, percentage: '8%', description: '系统开发和测试' },
  { category: '初级工程师', amount: 20, percentage: '4%', description: '辅助开发工作' },
  { category: '服务器设备', amount: 100, percentage: '20%', description: '开发和测试环境' },
  { category: '软件许可', amount: 50, percentage: '10%', description: '开发工具和中间件' },
  { category: '办公用品', amount: 30, percentage: '6%', description: '日常办公消耗' },
  { category: '差旅费用', amount: 40, percentage: '8%', description: '调研和会议差旅' },
  { category: '会议费用', amount: 30, percentage: '6%', description: '项目会议和培训' },
  { category: '其他费用', amount: 50, percentage: '10%', description: '不可预见费用' }
]

const teamMembers = [
  {
    name: '张教授',
    title: '项目负责人',
    role: '总体负责项目管理和技术指导',
    expertise: ['项目管理', '系统架构', '人工智能']
  },
  {
    name: '李博士',
    title: '技术负责人',
    role: '负责核心算法研发和技术攻关',
    expertise: ['机器学习', '数据挖掘', '算法优化']
  },
  {
    name: '王工程师',
    title: '开发负责人',
    role: '负责系统开发和集成测试',
    expertise: ['系统开发', '数据库设计', '性能优化']
  },
  {
    name: '赵工程师',
    title: '测试负责人',
    role: '负责系统测试和质量保证',
    expertise: ['软件测试', '质量管理', '用户体验']
  }
]

const riskItems = [
  {
    id: 1,
    title: '技术风险',
    level: 'medium',
    description: '核心算法的技术实现可能遇到困难，影响项目进度',
    mitigation: '提前进行技术预研，建立技术专家咨询机制，制定备选方案'
  },
  {
    id: 2,
    title: '进度风险',
    level: 'low',
    description: '项目开发周期较长，可能因各种因素导致进度延迟',
    mitigation: '制定详细的项目计划，建立里程碑管理机制，定期评估进度'
  },
  {
    id: 3,
    title: '人员风险',
    level: 'low',
    description: '关键人员离职或不能按时到位可能影响项目执行',
    mitigation: '建立人员备份机制，加强团队建设，提供有竞争力的薪酬'
  },
  {
    id: 4,
    title: '需求风险',
    level: 'medium',
    description: '用户需求可能发生变化，导致系统设计需要调整',
    mitigation: '采用敏捷开发方法，建立需求变更管理流程，保持与用户的密切沟通'
  }
]

// 方法
const handleCancel = () => {
  emit('update:visible', false)
}

const handleDownload = () => {
  message.success('申报书下载开始')
}

const handleReparse = () => {
  message.info('正在重新解析申报书...')
  setTimeout(() => {
    message.success('申报书解析完成')
  }, 2000)
}

// 工具方法
const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getPriorityColor = (priority) => {
  const colorMap = {
    'high': 'red',
    'medium': 'orange',
    'low': 'blue'
  }
  return colorMap[priority] || 'default'
}

const getPriorityText = (priority) => {
  const textMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return textMap[priority] || priority
}

const getRiskLevelColor = (level) => {
  const colorMap = {
    'high': 'error',
    'medium': 'warning',
    'low': 'success'
  }
  return colorMap[level] || 'default'
}

const getRiskLevelText = (level) => {
  const textMap = {
    'high': '高风险',
    'medium': '中风险',
    'low': '低风险'
  }
  return textMap[level] || level
}
</script>

<style scoped>
.proposal-view-content {
  max-height: 800px;
  overflow-y: auto;
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.header-info h3 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 18px;
}

.header-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.content-section {
  padding: 16px 0;
}

.content-section h4 {
  color: #234fa2;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.content-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.content-section ul {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  padding-left: 20px;
}

.research-modules {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.module-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.module-header h4 {
  margin: 0;
  color: #234fa2;
}

.module-content p {
  margin-bottom: 8px;
  color: #666;
}

.module-content strong {
  color: #234fa2;
}

.technical-route {
  padding: 16px 0;
}

.route-timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  margin-bottom: 30px;
}

.timeline-marker {
  position: relative;
  margin-right: 20px;
}

.marker-dot {
  width: 12px;
  height: 12px;
  background: #1890ff;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #1890ff;
}

.marker-line {
  position: absolute;
  left: 50%;
  top: 12px;
  width: 2px;
  height: 60px;
  background: #e8e8e8;
  transform: translateX(-50%);
}

.timeline-content {
  flex: 1;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.phase-header h4 {
  margin: 0;
  color: #234fa2;
}

.phase-duration {
  color: #8c8c8c;
  font-size: 12px;
}

.phase-description {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.phase-tasks {
  margin-bottom: 12px;
}

.phase-tasks strong {
  color: #234fa2;
}

.phase-tasks ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.phase-deliverables strong {
  color: #234fa2;
}

.deliverable-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.budget-overview h4 {
  color: #234fa2;
  margin-bottom: 16px;
}

.budget-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.budget-item {
  display: grid;
  grid-template-columns: 150px 100px 60px 1fr;
  align-items: center;
  gap: 12px;
}

.budget-category {
  color: #234fa2;
  font-weight: 500;
}

.budget-amount {
  color: #666;
  font-weight: 500;
}

.budget-percentage {
  color: #8c8c8c;
  font-size: 12px;
}

.budget-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #1890ff;
  transition: width 0.3s;
}

.budget-details {
  margin-top: 24px;
}

.team-structure h4 {
  color: #234fa2;
  margin-bottom: 16px;
}

.team-members {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.member-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.member-info {
  flex: 1;
}

.member-name {
  color: #234fa2;
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 4px;
}

.member-title {
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.member-role {
  color: #8c8c8c;
  font-size: 12px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.member-expertise {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.risk-analysis h4 {
  color: #234fa2;
  margin-bottom: 16px;
}

.risk-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #faad14;
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.risk-title {
  color: #234fa2;
  font-weight: 500;
  font-size: 16px;
}

.risk-description {
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.risk-mitigation {
  color: #666;
  line-height: 1.5;
}

.risk-mitigation strong {
  color: #234fa2;
}

/* 响应式 */
@media (max-width: 768px) {
  .proposal-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .budget-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .team-members {
    grid-template-columns: 1fr;
  }
  
  .member-card {
    flex-direction: column;
    text-align: center;
  }
  
  .timeline-item {
    flex-direction: column;
  }
  
  .timeline-marker {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .marker-line {
    display: none;
  }
}
</style>
