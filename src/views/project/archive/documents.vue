<template>
  <div class="project-archive-documents">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <FolderOpenOutlined />
        归档文档管理
      </h1>
      <p class="subtitle">管理和查看项目归档文档库</p>
    </div>

    <!-- 功能说明 -->
    <div class="info-section">
      <a-alert 
        message="文档归档管理" 
        description="集中管理所有已完成项目的文档资料，包括项目计划、设计文档、测试报告、验收报告等。支持文档搜索、下载、分类管理等功能。"
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
            <FolderOpenOutlined style="font-size: 48px; color: #1890ff;" />
          </div>
          <div class="notice-text">
            <h3>📂 归档文档管理</h3>
            <p>此功能正在开发中，将提供以下功能：</p>
            <ul>
              <li>📄 文档分类管理（按项目、类型、时间分类）</li>
              <li>🔍 文档搜索和筛选功能</li>
              <li>📥 文档批量下载和导出</li>
              <li>📊 文档使用统计分析</li>
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
          <a-button block @click="goToStatistics">
            <BarChartOutlined />
            查看归档统计
          </a-button>
        </a-space>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  FolderOpenOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 导航到已完成项目
const goToCompleted = () => {
  router.push('/project/archive/completed')
}

// 导航到归档统计
const goToStatistics = () => {
  router.push('/project/archive/statistics')
}
</script>

<style scoped>
.project-archive-documents {
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
  .project-archive-documents {
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