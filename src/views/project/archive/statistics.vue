<template>
  <div class="project-archive-statistics">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <BarChartOutlined />
        归档统计分析
      </h1>
      <p class="subtitle">项目归档数据统计与分析报告</p>
    </div>

    <!-- 功能说明 -->
    <div class="info-section">
      <a-alert 
        message="统计分析功能" 
        description="提供项目归档的各维度统计分析，包括项目完成趋势、成果统计、绩效分析等，帮助管理层了解项目执行情况和组织能力。"
        type="info" 
        show-icon 
        style="margin-bottom: 24px;"
      />
    </div>

    <!-- 开发中提示 -->
    <div class="development-notice">
      <a-card class="notice-card">
        <div class="notice-content">
          <div class="notice-icon">
            <BarChartOutlined style="font-size: 48px; color: #52c41a;" />
          </div>
          <div class="notice-text">
            <h3>📊 归档统计分析</h3>
            <p>此功能正在开发中，将提供以下统计分析：</p>
            <ul>
              <li>📈 项目完成趋势分析（按月、季度、年度）</li>
              <li>🎯 项目成功率和按时完成率统计</li>
              <li>💰 项目成本和预算执行情况</li>
              <li>👥 团队绩效和资源利用率</li>
              <li>📋 项目分类和规模分析</li>
              <li>🏆 优秀项目案例和最佳实践</li>
              <li>📊 可视化图表和报表导出</li>
            </ul>
            <p>敬请期待后续版本更新！</p>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 快速导航 -->
    <div class="quick-nav">
      <a-card title="相关功能">
        <a-space direction="vertical" style="width: 100%;">
          <a-button type="primary" block @click="goToCompleted">
            <FileTextOutlined />
            查看已完成项目
          </a-button>
          <a-button block @click="goToDocuments">
            <FolderOpenOutlined />
            查看归档文档
          </a-button>
        </a-space>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  BarChartOutlined,
  FileTextOutlined,
  FolderOpenOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 导航到已完成项目
const goToCompleted = () => {
  router.push('/project/archive/completed')
}

// 导航到归档文档
const goToDocuments = () => {
  router.push('/project/archive/documents')
}
</script>

<style scoped>
.project-archive-statistics {
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

/* 开发中提示 */
.development-notice {
  margin-bottom: 24px;
}

.notice-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.notice-icon {
  flex-shrink: 0;
}

.notice-text h3 {
  color: #234fa2;
  margin-bottom: 16px;
}

.notice-text ul {
  margin: 16px 0;
  padding-left: 20px;
}

.notice-text li {
  margin-bottom: 8px;
  color: #666;
}

/* 快速导航 */
.quick-nav {
  max-width: 300px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-archive-statistics {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .notice-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>