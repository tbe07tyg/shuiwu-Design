<!--
 * @file 申报书解析功能演示页面
 * @description 展示豆包AI智能申报书解析和任务提取功能
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-29
-->
<template>
  <div class="proposal-analysis-demo">
    <!-- 演示页面头部 -->
    <div class="demo-header">
      <h1>🤖 申报书解析功能演示</h1>
      <p class="demo-description">
        基于豆包AI的智能申报书解析系统，支持PDF预览、内容解析、任务提取和二次编辑
      </p>
    </div>

    <!-- 功能特性展示 -->
    <div class="features-showcase">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-card class="feature-card">
            <template #title>
              <FileTextOutlined />
              PDF自动转换
            </template>
            <p>自动将DOCX申报书转换为PDF格式，支持在线预览和下载</p>
            <ul>
              <li>支持多种文档格式</li>
              <li>高质量PDF转换</li>
              <li>实时预览功能</li>
            </ul>
          </a-card>
        </a-col>
        
        <a-col :span="8">
          <a-card class="feature-card">
            <template #title>
              <RobotOutlined />
              豆包AI解析
            </template>
            <p>使用豆包AI智能解析申报书内容，自动提取关键信息和项目任务</p>
            <ul>
              <li>智能内容识别</li>
              <li>结构化数据提取</li>
              <li>任务自动拆解</li>
            </ul>
          </a-card>
        </a-col>
        
        <a-col :span="8">
          <a-card class="feature-card">
            <template #title>
              <EditOutlined />
              二次编辑优化
            </template>
            <p>支持对AI解析结果进行人工编辑和优化，确保准确性</p>
            <ul>
              <li>分区域编辑</li>
              <li>任务依赖管理</li>
              <li>进度计划优化</li>
            </ul>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 演示操作区域 -->
    <div class="demo-operations">
      <a-card title="🎯 功能演示" class="operations-card">
        <div class="operation-steps">
          <a-steps :current="currentStep" direction="horizontal">
            <a-step title="选择项目" description="选择要演示的项目" />
            <a-step title="PDF预览" description="查看申报书PDF" />
            <a-step title="AI解析" description="豆包智能解析" />
            <a-step title="结果展示" description="查看解析结果" />
          </a-steps>
        </div>
        
        <div class="operation-content">
          <!-- 步骤1：选择项目 -->
          <div v-if="currentStep === 0" class="step-content">
            <h3>选择演示项目</h3>
            <a-select 
              v-model:value="selectedDemoProject" 
              placeholder="请选择演示项目"
              style="width: 300px;"
              @change="handleProjectSelect"
            >
              <a-select-option 
                v-for="project in demoProjects" 
                :key="project.id" 
                :value="project.id"
              >
                {{ project.name }}
              </a-select-option>
            </a-select>
            
            <div class="project-info" v-if="selectedProjectInfo">
              <a-descriptions title="项目信息" :column="2" bordered>
                <a-descriptions-item label="项目名称">
                  {{ selectedProjectInfo.name }}
                </a-descriptions-item>
                <a-descriptions-item label="申请单位">
                  {{ selectedProjectInfo.unit }}
                </a-descriptions-item>
                <a-descriptions-item label="项目负责人">
                  {{ selectedProjectInfo.leader }}
                </a-descriptions-item>
                <a-descriptions-item label="申报时间">
                  {{ selectedProjectInfo.date }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </div>
          
          <!-- 步骤2：PDF预览 -->
          <div v-if="currentStep === 1" class="step-content">
            <h3>申报书PDF预览</h3>
            <div class="pdf-preview-demo">
              <div class="pdf-viewer-placeholder">
                <a-spin :spinning="pdfLoading">
                  <div class="pdf-placeholder-content">
                    <FileTextOutlined style="font-size: 48px; color: #1890ff;" />
                    <h4>{{ selectedProjectInfo?.name || '示例项目' }}申报书.pdf</h4>
                    <p>PDF预览区域 - 实际使用时会显示真实的PDF内容</p>
                    <a-button type="primary" @click="simulatePdfLoad">
                      <EyeOutlined />
                      模拟加载PDF
                    </a-button>
                  </div>
                </a-spin>
              </div>
            </div>
          </div>
          
          <!-- 步骤3：AI解析 -->
          <div v-if="currentStep === 2" class="step-content">
            <h3>豆包AI智能解析</h3>
            <div class="ai-analysis-demo">
              <div class="analysis-progress">
                <a-progress 
                  :percent="analysisProgress" 
                  :status="analysisStatus"
                  :show-info="true"
                />
                <p class="progress-text">{{ progressText }}</p>
              </div>
              
              <div class="analysis-steps" v-if="analysisProgress > 0">
                <a-timeline>
                  <a-timeline-item color="green" v-if="analysisProgress >= 20">
                    <template #dot>
                      <CheckCircleOutlined />
                    </template>
                    申报书内容提取完成
                  </a-timeline-item>
                  <a-timeline-item color="green" v-if="analysisProgress >= 40">
                    <template #dot>
                      <CheckCircleOutlined />
                    </template>
                    基础信息解析完成
                  </a-timeline-item>
                  <a-timeline-item color="green" v-if="analysisProgress >= 60">
                    <template #dot>
                      <CheckCircleOutlined />
                    </template>
                    技术路线分析完成
                  </a-timeline-item>
                  <a-timeline-item color="green" v-if="analysisProgress >= 80">
                    <template #dot>
                      <CheckCircleOutlined />
                    </template>
                    任务拆解完成
                  </a-timeline-item>
                  <a-timeline-item color="green" v-if="analysisProgress >= 100">
                    <template #dot>
                      <CheckCircleOutlined />
                    </template>
                    解析结果验证完成
                  </a-timeline-item>
                </a-timeline>
              </div>
            </div>
          </div>
          
          <!-- 步骤4：结果展示 -->
          <div v-if="currentStep === 3" class="step-content">
            <h3>解析结果展示</h3>
            <div class="results-demo">
              <a-tabs>
                <a-tab-pane key="overview" tab="解析概览">
                  <div class="overview-stats">
                    <a-row :gutter="16">
                      <a-col :span="6">
                        <a-statistic
                          title="提取任务数"
                          :value="demoResults.totalTasks"
                          :value-style="{ color: '#1890ff' }"
                        />
                      </a-col>
                      <a-col :span="6">
                        <a-statistic
                          title="实施任务"
                          :value="demoResults.implementationTasks"
                          :value-style="{ color: '#52c41a' }"
                        />
                      </a-col>
                      <a-col :span="6">
                        <a-statistic
                          title="技术任务"
                          :value="demoResults.technicalTasks"
                          :value-style="{ color: '#faad14' }"
                        />
                      </a-col>
                      <a-col :span="6">
                        <a-statistic
                          title="里程碑"
                          :value="demoResults.milestoneTasks"
                          :value-style="{ color: '#722ed1' }"
                        />
                      </a-col>
                    </a-row>
                  </div>
                </a-tab-pane>
                
                <a-tab-pane key="tasks" tab="任务列表">
                  <div class="tasks-demo">
                    <div v-for="task in demoTasks" :key="task.id" class="task-demo-item">
                      <div class="task-header">
                        <h4>{{ task.name }}</h4>
                        <a-space>
                          <a-tag :color="getTaskTypeColor(task.type)">
                            {{ getTaskTypeText(task.type) }}
                          </a-tag>
                          <a-tag :color="getPriorityColor(task.priority)">
                            {{ getPriorityText(task.priority) }}
                          </a-tag>
                        </a-space>
                      </div>
                      <p class="task-description">{{ task.description }}</p>
                      <div class="task-meta">
                        <span>工期：{{ task.duration }}天</span>
                        <span>交付物：{{ task.deliverables.join('、') }}</span>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>
                
                <a-tab-pane key="analysis" tab="分析报告">
                  <div class="analysis-report">
                    <a-descriptions title="项目分析报告" bordered>
                      <a-descriptions-item label="项目复杂度" :span="2">
                        <a-tag color="orange">中等</a-tag>
                        基于任务数量和技术难度评估
                      </a-descriptions-item>
                      <a-descriptions-item label="预估总工期">
                        {{ demoResults.totalDuration }}天
                      </a-descriptions-item>
                      <a-descriptions-item label="关键路径" :span="3">
                        需求分析 → 系统设计 → 核心开发 → 系统测试 → 项目验收
                      </a-descriptions-item>
                      <a-descriptions-item label="风险评估" :span="3">
                        <a-tag color="red">高风险任务：核心算法研发</a-tag>
                        <a-tag color="orange">中风险任务：系统集成</a-tag>
                      </a-descriptions-item>
                    </a-descriptions>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
          </div>
        </div>
        
        <div class="operation-actions">
          <a-space>
            <a-button @click="prevStep" :disabled="currentStep === 0">
              <LeftOutlined />
              上一步
            </a-button>
            <a-button 
              type="primary" 
              @click="nextStep" 
              :disabled="currentStep === 3 || (currentStep === 0 && !selectedDemoProject)"
              :loading="stepLoading"
            >
              {{ currentStep === 3 ? '完成演示' : '下一步' }}
              <RightOutlined v-if="currentStep < 3" />
            </a-button>
            <a-button @click="resetDemo">
              <ReloadOutlined />
              重新演示
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>

    <!-- 技术说明 -->
    <div class="tech-explanation">
      <a-card title="🔧 技术实现说明">
        <a-collapse>
          <a-collapse-panel key="architecture" header="系统架构">
            <p>申报书解析系统采用前后端分离架构：</p>
            <ul>
              <li><strong>前端</strong>：Vue 3 + Ant Design Vue，提供用户交互界面</li>
              <li><strong>后端</strong>：RuoYi框架 + Spring Boot，处理文档转换和数据存储</li>
              <li><strong>AI服务</strong>：豆包AI接口，负责智能内容解析和任务提取</li>
              <li><strong>文档处理</strong>：Apache POI + PDF.js，支持多格式文档处理</li>
            </ul>
          </a-collapse-panel>
          
          <a-collapse-panel key="workflow" header="工作流程">
            <p>完整的申报书解析流程：</p>
            <ol>
              <li>用户上传或选择已有的申报书文档</li>
              <li>系统自动将DOCX转换为PDF格式用于预览</li>
              <li>提取申报书文本内容，生成豆包AI提示词</li>
              <li>调用豆包AI进行智能解析和任务提取</li>
              <li>解析结果结构化存储，支持二次编辑</li>
              <li>生成项目任务列表和进度计划</li>
            </ol>
          </a-collapse-panel>
          
          <a-collapse-panel key="features" header="核心特性">
            <a-row :gutter="16">
              <a-col :span="12">
                <h4>智能解析</h4>
                <ul>
                  <li>自动识别申报书结构</li>
                  <li>提取关键信息字段</li>
                  <li>智能任务拆解</li>
                  <li>依赖关系分析</li>
                </ul>
              </a-col>
              <a-col :span="12">
                <h4>用户体验</h4>
                <ul>
                  <li>PDF在线预览</li>
                  <li>分区域编辑</li>
                  <li>实时验证</li>
                  <li>批量操作</li>
                </ul>
              </a-col>
            </a-row>
          </a-collapse-panel>
        </a-collapse>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  RobotOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const currentStep = ref(0)
const selectedDemoProject = ref('')
const stepLoading = ref(false)
const pdfLoading = ref(false)
const analysisProgress = ref(0)
const analysisStatus = ref('normal')

// 演示项目数据
const demoProjects = ref([
  {
    id: 'demo1',
    name: '智能水务管理系统研发',
    unit: '华北水利水电大学',
    leader: '张教授',
    date: '2025-01-01'
  },
  {
    id: 'demo2',
    name: '城市供水智能监控平台',
    unit: '某科技公司',
    leader: '李工程师',
    date: '2025-01-15'
  }
])

// 演示结果数据
const demoResults = ref({
  totalTasks: 12,
  implementationTasks: 5,
  technicalTasks: 4,
  milestoneTasks: 3,
  totalDuration: 180
})

// 演示任务数据
const demoTasks = ref([
  {
    id: 'task1',
    name: '需求分析和系统设计',
    type: 'implementation',
    priority: 'high',
    description: '进行详细的需求调研，完成系统总体架构设计',
    duration: 15,
    deliverables: ['需求规格说明书', '系统设计文档']
  },
  {
    id: 'task2',
    name: '核心算法研发',
    type: 'technical',
    priority: 'high',
    description: '研发水务数据分析的核心算法',
    duration: 30,
    deliverables: ['算法设计文档', '核心代码']
  },
  {
    id: 'task3',
    name: '原型系统完成',
    type: 'milestone',
    priority: 'high',
    description: '完成系统原型开发，实现核心功能',
    duration: 0,
    deliverables: ['原型系统', '功能演示']
  }
])

// 计算属性
const selectedProjectInfo = computed(() => {
  return demoProjects.value.find(p => p.id === selectedDemoProject.value)
})

const progressText = computed(() => {
  if (analysisProgress.value === 0) return '准备开始解析...'
  if (analysisProgress.value < 20) return '正在提取申报书内容...'
  if (analysisProgress.value < 40) return '正在解析基础信息...'
  if (analysisProgress.value < 60) return '正在分析技术路线...'
  if (analysisProgress.value < 80) return '正在进行任务拆解...'
  if (analysisProgress.value < 100) return '正在验证解析结果...'
  return '解析完成！'
})

// 方法定义
const handleProjectSelect = (projectId) => {
  console.log('选择项目:', projectId)
}

const simulatePdfLoad = () => {
  pdfLoading.value = true
  setTimeout(() => {
    pdfLoading.value = false
    message.success('PDF加载完成')
  }, 2000)
}

const simulateAnalysis = () => {
  analysisProgress.value = 0
  analysisStatus.value = 'active'
  
  const timer = setInterval(() => {
    analysisProgress.value += 10
    
    if (analysisProgress.value >= 100) {
      clearInterval(timer)
      analysisStatus.value = 'success'
      message.success('AI解析完成！')
    }
  }, 500)
}

const nextStep = () => {
  if (currentStep.value < 3) {
    stepLoading.value = true
    
    setTimeout(() => {
      currentStep.value++
      stepLoading.value = false
      
      // 特殊处理
      if (currentStep.value === 2) {
        setTimeout(() => {
          simulateAnalysis()
        }, 1000)
      }
    }, 1000)
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const resetDemo = () => {
  currentStep.value = 0
  selectedDemoProject.value = ''
  analysisProgress.value = 0
  analysisStatus.value = 'normal'
  message.info('演示已重置')
}

const getTaskTypeColor = (type) => {
  const colors = {
    implementation: 'blue',
    technical: 'green',
    milestone: 'orange'
  }
  return colors[type] || 'default'
}

const getTaskTypeText = (type) => {
  const texts = {
    implementation: '实施任务',
    technical: '技术任务',
    milestone: '里程碑'
  }
  return texts[type] || '其他'
}

const getPriorityColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colors[priority] || 'default'
}

const getPriorityText = (priority) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[priority] || '中'
}
</script>

<style scoped>
.proposal-analysis-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 32px;
}

.demo-header h1 {
  color: #1890ff;
  margin-bottom: 8px;
}

.demo-description {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.features-showcase {
  margin-bottom: 32px;
}

.feature-card {
  height: 100%;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-card ul {
  margin: 12px 0 0 0;
  padding-left: 16px;
}

.feature-card li {
  margin: 4px 0;
  color: #666;
}

.demo-operations {
  margin-bottom: 32px;
}

.operations-card {
  min-height: 500px;
}

.operation-steps {
  margin-bottom: 32px;
}

.step-content {
  min-height: 300px;
  padding: 24px 0;
}

.step-content h3 {
  color: #333;
  margin-bottom: 16px;
}

.project-info {
  margin-top: 16px;
}

.pdf-preview-demo {
  display: flex;
  justify-content: center;
}

.pdf-viewer-placeholder {
  width: 400px;
  height: 300px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-placeholder-content {
  text-align: center;
  color: #666;
}

.pdf-placeholder-content h4 {
  margin: 16px 0 8px 0;
  color: #333;
}

.ai-analysis-demo {
  max-width: 600px;
  margin: 0 auto;
}

.analysis-progress {
  margin-bottom: 24px;
  text-align: center;
}

.progress-text {
  margin-top: 8px;
  color: #666;
}

.results-demo {
  margin-top: 16px;
}

.overview-stats {
  margin-bottom: 24px;
}

.task-demo-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafafa;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-header h4 {
  margin: 0;
  color: #333;
}

.task-description {
  color: #666;
  margin: 8px 0;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.analysis-report {
  margin-top: 16px;
}

.operation-actions {
  margin-top: 32px;
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.tech-explanation {
  margin-bottom: 32px;
}

.tech-explanation ul,
.tech-explanation ol {
  margin: 8px 0;
  padding-left: 20px;
}

.tech-explanation li {
  margin: 4px 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .proposal-analysis-demo {
    padding: 16px;
  }
  
  .features-showcase .ant-col {
    margin-bottom: 16px;
  }
  
  .pdf-viewer-placeholder {
    width: 100%;
    height: 250px;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
