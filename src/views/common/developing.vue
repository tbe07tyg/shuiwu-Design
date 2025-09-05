<template>
  <div class="developing-page">
    <div class="developing-content">
      <div class="developing-icon">
        <ToolOutlined />
      </div>
      <h1>功能开发中</h1>
      <p class="subtitle">该功能正在开发中，敬请期待</p>
      
      <div class="info-section">
        <h3>📋 当前页面信息：</h3>
        <ul>
          <li>页面路径：{{ currentRoute }}</li>
          <li>页面标题：{{ pageTitle }}</li>
          <li>开发状态：进行中</li>
        </ul>
      </div>
      
      <div class="actions">
        <a-button type="primary" @click="goBack">
          <LeftOutlined />
          返回上一页
        </a-button>
        <a-button @click="goHome">
          <HomeOutlined />
          返回首页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ToolOutlined, LeftOutlined, HomeOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const currentRoute = computed(() => route.path)
const pageTitle = computed(() => route.meta?.title || '未知页面')

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/test')
}
</script>

<style scoped>
.developing-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f8ff 0%, #e6f7ff 100%);
}

.developing-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.developing-icon {
  font-size: 64px;
  color: #234fa2;
  margin-bottom: 24px;
}

h1 {
  color: #234fa2;
  font-size: 32px;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.subtitle {
  color: #8c8c8c;
  font-size: 16px;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.info-section {
  background: #f8f9ff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 32px;
  text-align: left;
}

.info-section h3 {
  color: #234fa2;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  padding: 6px 0;
  color: #595959;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.info-section li:last-child {
  border-bottom: none;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.actions .ant-btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 8px;
  font-weight: 500;
}
</style>