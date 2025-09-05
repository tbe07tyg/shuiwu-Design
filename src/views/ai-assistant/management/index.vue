<template>
  <div class="ai-assistant-page">
    <div class="page-header">
      <h1>管理层AI助手</h1>
      <p>智能决策助手，为您提供战略规划、业务分析和风险预警支持</p>
    </div>

    <div class="page-content">
      <!-- 左侧：AI聊天区域 -->
      <div class="chat-section">
        <AIChatBox />
      </div>

      <!-- 右侧：业务信息和决策支持 -->
      <div class="info-section">
        <!-- 业务概览 -->
        <div class="info-card">
          <div class="card-header">
            <h3>📊 业务概览</h3>
            <a-button size="small" @click="refreshBusinessData">
              <ReloadOutlined />
            </a-button>
          </div>
          <div class="business-stats">
            <div class="stat-item">
              <div class="stat-number">{{ businessStats.totalRevenue }}</div>
              <div class="stat-label">总收入</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ businessStats.activeProjects }}</div>
              <div class="stat-label">活跃项目</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ businessStats.teamSize }}</div>
              <div class="stat-label">团队规模</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ businessStats.customerSatisfaction }}</div>
              <div class="stat-label">客户满意度</div>
            </div>
          </div>
        </div>

        <!-- 战略分析 -->
        <div class="info-card">
          <div class="card-header">
            <h3>🎯 战略分析</h3>
            <a-button size="small" @click="generateStrategicAnalysis">
              <ThunderboltOutlined />
            </a-button>
          </div>
          <div class="analysis-content">
            <div v-if="analysisLoading" class="loading-analysis">
              <a-spin />
              <p>正在生成战略分析报告...</p>
            </div>
            <div v-else-if="strategicAnalysis" class="analysis-result">
              <div class="analysis-item" v-for="(item, index) in strategicAnalysis" :key="index">
                <div class="analysis-icon">{{ item.icon }}</div>
                <div class="analysis-text">
                  <div class="analysis-title">{{ item.title }}</div>
                  <div class="analysis-desc">{{ item.description }}</div>
                  <div class="analysis-recommendation">
                    <strong>建议：</strong>{{ item.recommendation }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-analysis">
              <p>点击按钮生成战略分析报告</p>
            </div>
          </div>
        </div>

        <!-- 投资决策 -->
        <div class="info-card">
          <div class="card-header">
            <h3>💰 投资决策</h3>
          </div>
          <div class="investment-opportunities">
            <div 
              v-for="opportunity in investmentOpportunities" 
              :key="opportunity.id"
              :class="['opportunity-item', opportunity.risk]"
            >
              <div class="opportunity-header">
                <div class="opportunity-title">{{ opportunity.title }}</div>
                <a-tag :color="getRiskColor(opportunity.risk)">
                  {{ opportunity.risk }}
                </a-tag>
              </div>
              <div class="opportunity-desc">{{ opportunity.description }}</div>
              <div class="opportunity-metrics">
                <div class="metric">
                  <span class="metric-label">预期回报：</span>
                  <span class="metric-value">{{ opportunity.expectedReturn }}%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">投资周期：</span>
                  <span class="metric-value">{{ opportunity.investmentPeriod }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">所需资金：</span>
                  <span class="metric-value">¥{{ opportunity.requiredFunds }}</span>
                </div>
              </div>
              <div class="opportunity-actions">
                <a-button size="small" type="primary" @click="approveInvestment(opportunity)">
                  批准投资
                </a-button>
                <a-button size="small" @click="requestMoreInfo(opportunity)">
                  了解更多
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 风险预警 -->
        <div class="info-card">
          <div class="card-header">
            <h3>⚠️ 风险预警</h3>
            <a-badge :count="riskAlerts.length" />
          </div>
          <div class="risk-alerts">
            <div 
              v-for="alert in riskAlerts" 
              :key="alert.id"
              :class="['risk-item', alert.level]"
            >
              <div class="risk-icon">{{ alert.icon }}</div>
              <div class="risk-content">
                <div class="risk-title">{{ alert.title }}</div>
                <div class="risk-desc">{{ alert.description }}</div>
                <div class="risk-impact">
                  <strong>影响程度：</strong>{{ alert.impact }}
                </div>
                <div class="risk-time">{{ formatTime(alert.time) }}</div>
              </div>
            </div>
            <div v-if="riskAlerts.length === 0" class="no-risks">
              <p>暂无风险预警</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 投资详情弹窗 -->
    <a-modal
      v-model:open="investmentDetailVisible"
      title="投资详情"
      width="700px"
      :footer="null"
    >
      <div v-if="selectedInvestment" class="investment-detail">
        <div class="investment-header">
          <h3>{{ selectedInvestment.title }}</h3>
          <a-tag :color="getRiskColor(selectedInvestment.risk)">
            {{ selectedInvestment.risk }}
          </a-tag>
        </div>
        
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="项目类型">
            {{ selectedInvestment.type }}
          </a-descriptions-item>
          <a-descriptions-item label="预期回报">
            {{ selectedInvestment.expectedReturn }}%
          </a-descriptions-item>
          <a-descriptions-item label="投资周期">
            {{ selectedInvestment.investmentPeriod }}
          </a-descriptions-item>
          <a-descriptions-item label="所需资金">
            ¥{{ selectedInvestment.requiredFunds }}
          </a-descriptions-item>
          <a-descriptions-item label="风险评估">
            {{ selectedInvestment.riskAssessment }}
          </a-descriptions-item>
          <a-descriptions-item label="市场前景">
            {{ selectedInvestment.marketProspect }}
          </a-descriptions-item>
        </a-descriptions>

        <div class="investment-analysis">
          <h4>详细分析</h4>
          <div class="analysis-section">
            <h5>优势分析</h5>
            <ul>
              <li v-for="advantage in selectedInvestment.advantages" :key="advantage">
                {{ advantage }}
              </li>
            </ul>
          </div>
          <div class="analysis-section">
            <h5>风险因素</h5>
            <ul>
              <li v-for="risk in selectedInvestment.risks" :key="risk">
                {{ risk }}
              </li>
            </ul>
          </div>
        </div>

        <div class="investment-actions">
          <a-button type="primary" @click="approveInvestment(selectedInvestment)">
            批准投资
          </a-button>
          <a-button @click="rejectInvestment(selectedInvestment)">
            拒绝投资
          </a-button>
          <a-button @click="requestMoreInfo(selectedInvestment)">
            请求更多信息
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  ReloadOutlined, 
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import AIChatBox from '@/components/ai/AIChatBox.vue'
import { useAIStore } from '@/store/modules/ai'

// 使用AI Store
const aiStore = useAIStore()

// 响应式数据
const analysisLoading = ref(false)
const strategicAnalysis = ref(null)
const investmentDetailVisible = ref(false)
const selectedInvestment = ref(null)

// 业务统计数据
const businessStats = reactive({
  totalRevenue: '¥2.5M',
  activeProjects: 15,
  teamSize: 45,
  customerSatisfaction: '92%'
})

// 投资机会
const investmentOpportunities = ref([
  {
    id: 1,
    title: 'AI技术研发项目',
    description: '开发新一代AI助手技术，提升产品竞争力',
    risk: 'medium',
    expectedReturn: 25,
    investmentPeriod: '12个月',
    requiredFunds: '500,000',
    type: '技术研发',
    riskAssessment: '中等风险',
    marketProspect: '良好',
    advantages: [
      '技术领先优势明显',
      '市场需求旺盛',
      '团队技术实力强'
    ],
    risks: [
      '技术开发周期较长',
      '市场竞争激烈',
      '人才成本较高'
    ]
  },
  {
    id: 2,
    title: '市场扩张计划',
    description: '拓展新市场，增加市场份额',
    risk: 'low',
    expectedReturn: 18,
    investmentPeriod: '8个月',
    requiredFunds: '300,000',
    type: '市场拓展',
    riskAssessment: '低风险',
    marketProspect: '优秀',
    advantages: [
      '市场调研充分',
      '客户需求明确',
      '团队经验丰富'
    ],
    risks: [
      '市场变化风险',
      '竞争加剧',
      '成本控制难度'
    ]
  },
  {
    id: 3,
    title: '人才招聘计划',
    description: '招聘高端技术人才，提升团队能力',
    risk: 'high',
    expectedReturn: 30,
    investmentPeriod: '6个月',
    requiredFunds: '800,000',
    type: '人才投资',
    riskAssessment: '高风险',
    marketProspect: '一般',
    advantages: [
      '人才质量高',
      '技术能力提升',
      '长期收益明显'
    ],
    risks: [
      '人才流失风险',
      '成本投入大',
      '适应期较长'
    ]
  }
])

// 风险预警
const riskAlerts = ref([
  {
    id: 1,
    level: 'high',
    icon: '🚨',
    title: '市场竞争加剧',
    description: '主要竞争对手推出新产品，可能影响市场份额',
    impact: '高',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    level: 'medium',
    icon: '⚠️',
    title: '技术人才流失',
    description: '核心技术人员离职率上升，需要加强人才保留',
    impact: '中',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 3,
    level: 'low',
    icon: '💡',
    title: '成本控制提醒',
    description: '运营成本增长较快，建议优化资源配置',
    impact: '低',
    time: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
])

// 方法
const refreshBusinessData = () => {
  message.success('业务数据已刷新')
}

const generateStrategicAnalysis = async () => {
  analysisLoading.value = true
  
  try {
    // 模拟AI战略分析
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    strategicAnalysis.value = [
      {
        icon: '📈',
        title: '市场趋势分析',
        description: '当前市场对AI技术需求持续增长，预计未来3年市场规模将扩大50%。',
        recommendation: '建议加大AI技术研发投入，抢占市场先机。'
      },
      {
        icon: '👥',
        title: '团队能力评估',
        description: '团队整体技术实力较强，但在高端人才方面存在缺口。',
        recommendation: '制定人才招聘和培养计划，提升团队核心竞争力。'
      },
      {
        icon: '💰',
        title: '财务状况分析',
        description: '公司财务状况良好，现金流充足，具备扩大投资的条件。',
        recommendation: '合理分配资金，平衡短期收益和长期发展。'
      },
      {
        icon: '🎯',
        title: '战略目标建议',
        description: '建议将AI技术作为核心发展方向，同时拓展相关业务领域。',
        recommendation: '制定3年战略规划，明确发展路径和里程碑。'
      }
    ]
    
    message.success('战略分析报告已生成')
  } catch (error) {
    message.error('分析生成失败，请重试')
  } finally {
    analysisLoading.value = false
  }
}

const approveInvestment = (investment) => {
  message.success(`已批准${investment.title}投资`)
  investmentDetailVisible.value = false
}

const rejectInvestment = (investment) => {
  message.info(`已拒绝${investment.title}投资`)
  investmentDetailVisible.value = false
}

const requestMoreInfo = (investment) => {
  message.info(`已请求${investment.title}的更多信息`)
  investmentDetailVisible.value = false
}

const getRiskColor = (risk) => {
  const colors = {
    'high': 'red',
    'medium': 'orange',
    'low': 'green'
  }
  return colors[risk] || 'default'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  // 设置AI助手角色为管理层
  aiStore.setRole('management')
})
</script>

<style scoped>
.ai-assistant-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header h1 {
  color: #234fa2;
  margin-bottom: 8px;
}

.page-header p {
  color: #666;
  margin: 0;
}

.page-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.chat-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  color: #234fa2;
}

.business-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.analysis-content {
  min-height: 200px;
}

.loading-analysis {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.analysis-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.analysis-icon {
  font-size: 20px;
}

.analysis-text {
  flex: 1;
}

.analysis-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #234fa2;
}

.analysis-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.analysis-recommendation {
  font-size: 13px;
  color: #234fa2;
  background: #e6f7ff;
  padding: 8px;
  border-radius: 4px;
}

.no-analysis {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.investment-opportunities {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opportunity-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.opportunity-item.high {
  background: #fff2f0;
  border-left-color: #ff4d4f;
}

.opportunity-item.medium {
  background: #fff7e6;
  border-left-color: #fa8c16;
}

.opportunity-item.low {
  background: #f6ffed;
  border-left-color: #52c41a;
}

.opportunity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.opportunity-title {
  font-weight: bold;
  color: #234fa2;
}

.opportunity-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.opportunity-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.metric {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.metric-label {
  color: #666;
}

.metric-value {
  font-weight: bold;
  color: #234fa2;
}

.opportunity-actions {
  display: flex;
  gap: 8px;
}

.risk-alerts {
  max-height: 300px;
  overflow-y: auto;
}

.risk-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid;
}

.risk-item.high {
  background: #fff2f0;
  border-left-color: #ff4d4f;
}

.risk-item.medium {
  background: #fff7e6;
  border-left-color: #fa8c16;
}

.risk-item.low {
  background: #f6ffed;
  border-left-color: #52c41a;
}

.risk-icon {
  font-size: 16px;
}

.risk-content {
  flex: 1;
}

.risk-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.risk-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.risk-impact {
  font-size: 12px;
  color: #234fa2;
  margin-bottom: 4px;
}

.risk-time {
  font-size: 12px;
  color: #999;
}

.no-risks {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.investment-detail {
  padding: 20px 0;
}

.investment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.investment-header h3 {
  margin: 0;
  color: #234fa2;
}

.investment-analysis {
  margin-top: 20px;
}

.investment-analysis h4 {
  margin-bottom: 16px;
  color: #234fa2;
}

.analysis-section {
  margin-bottom: 16px;
}

.analysis-section h5 {
  margin-bottom: 8px;
  color: #234fa2;
}

.analysis-section ul {
  margin: 0;
  padding-left: 20px;
}

.analysis-section li {
  margin-bottom: 4px;
  color: #666;
}

.investment-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-content {
    grid-template-columns: 1fr;
  }
  
  .info-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .ai-assistant-page {
    padding: 16px;
  }
  
  .business-stats {
    grid-template-columns: 1fr;
  }
  
  .opportunity-actions {
    flex-direction: column;
  }
  
  .investment-actions {
    flex-direction: column;
  }
}
</style> 