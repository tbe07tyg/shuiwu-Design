<!--
 * @file 第二步：申报书内容解析步骤组件
 * @description 智能解析申报书内容，提取技术路线，支持二次编辑
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="proposal-analysis-step">
    <!-- 步骤说明 -->
    <div class="step-description">
      <h3>第二步：申报书内容解析</h3>
      <p>自动解析立项申报书内容，提取技术路线关键信息，支持对技术路线的二次编辑和完善。</p>
    </div>

    <!-- 申报书基本信息 -->
    <a-card title="申报书基本信息" class="proposal-info-card" :bordered="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="项目名称">
          {{ proposalData.title }}
        </a-descriptions-item>
        <a-descriptions-item label="研究周期">
          {{ proposalData.researchPeriod }}
        </a-descriptions-item>
        <a-descriptions-item label="总预算">
          {{ proposalData.totalBudget }}
        </a-descriptions-item>
        <a-descriptions-item label="解析状态">
          <a-tag :color="getAnalysisStatusColor(analysisStatus)">
            {{ getAnalysisStatusText(analysisStatus) }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
      
      <div class="proposal-actions" style="margin-top: 16px;">
        <a-space>
          <a-button @click="handleViewOriginal">
            <FileTextOutlined />
            查看原始申报书
          </a-button>
          <a-button type="primary" @click="handleParseProposal" :loading="parsing">
            <ThunderboltOutlined />
            {{ parsing ? '解析中...' : '重新解析' }}
          </a-button>
          <a-button @click="handleShowPromptTemplates">
            <BulbOutlined />
            豆包提示词模板
          </a-button>
        </a-space>
      </div>
    </a-card>

    <!-- 技术路线解析结果 -->
    <a-card title="技术路线解析结果" class="tech-route-card" :bordered="false">
      <template #extra>
        <a-space>
          <a-button @click="handleAddPhase">
            <PlusOutlined />
            添加阶段
          </a-button>
          <a-button type="primary" @click="handleEditMode">
            <EditOutlined />
            {{ editMode ? '退出编辑' : '编辑模式' }}
          </a-button>
        </a-space>
      </template>

      <div v-if="proposalData.technicalRoute && proposalData.technicalRoute.length > 0" class="tech-route-list">
        <div 
          v-for="(phase, index) in proposalData.technicalRoute" 
          :key="phase.id"
          class="phase-item"
          :class="{ 'editing': editMode }"
        >
          <div class="phase-header">
            <div class="phase-number">{{ index + 1 }}</div>
            <div class="phase-info">
              <h4 v-if="!editMode">{{ phase.phase }}</h4>
              <a-input 
                v-else 
                v-model:value="phase.phase" 
                placeholder="阶段名称"
                class="phase-title-input"
              />
              <p class="phase-duration">预计时长：{{ phase.duration }}个月</p>
            </div>
            <div v-if="editMode" class="phase-actions">
              <a-button type="text" size="small" @click="handleMovePhase(index, 'up')" :disabled="index === 0">
                <ArrowUpOutlined />
              </a-button>
              <a-button type="text" size="small" @click="handleMovePhase(index, 'down')" :disabled="index === proposalData.technicalRoute.length - 1">
                <ArrowDownOutlined />
              </a-button>
              <a-button type="text" size="small" danger @click="handleDeletePhase(index)">
                <DeleteOutlined />
              </a-button>
            </div>
          </div>

          <div class="phase-content">
            <div class="phase-description">
              <label>阶段描述：</label>
              <div v-if="!editMode" class="description-text">{{ phase.description }}</div>
              <a-textarea 
                v-else 
                v-model:value="phase.description" 
                placeholder="请描述该阶段的主要工作内容"
                :rows="2"
              />
            </div>

            <div class="phase-subtasks">
              <label>主要任务：</label>
              <div v-if="!editMode" class="subtasks-list">
                <a-tag v-for="task in phase.subTasks" :key="task" class="subtask-tag">
                  {{ task }}
                </a-tag>
              </div>
              <a-select
                v-else
                v-model:value="phase.subTasks"
                mode="tags"
                placeholder="请输入或选择主要任务"
                style="width: 100%"
              />
            </div>

            <div v-if="editMode" class="phase-settings">
              <a-row :gutter="16">
                <a-col :span="8">
                  <label>预计时长（月）：</label>
                  <a-input-number 
                    v-model:value="phase.duration" 
                    :min="1" 
                    :max="36"
                    style="width: 100%"
                  />
                </a-col>
                <a-col :span="8">
                  <label>优先级：</label>
                  <a-select v-model:value="phase.priority" style="width: 100%">
                    <a-select-option value="high">高</a-select-option>
                    <a-select-option value="medium">中</a-select-option>
                    <a-select-option value="low">低</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="8">
                  <label>风险等级：</label>
                  <a-select v-model:value="phase.riskLevel" style="width: 100%">
                    <a-select-option value="high">高风险</a-select-option>
                    <a-select-option value="medium">中风险</a-select-option>
                    <a-select-option value="low">低风险</a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-tech-route">
        <a-empty description="暂无技术路线数据">
          <a-button type="primary" @click="handleParseProposal">
            开始解析申报书
          </a-button>
        </a-empty>
      </div>
    </a-card>

    <!-- 解析统计 -->
    <a-card title="解析统计" class="stats-card" :bordered="false">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-statistic 
            title="技术路线阶段" 
            :value="analysisStats.totalPhases"
            :value-style="{ color: '#234fa2' }"
          >
            <template #suffix>个</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic 
            title="预计总时长" 
            :value="analysisStats.totalDuration"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>个月</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic 
            title="主要任务数" 
            :value="analysisStats.totalTasks"
            :value-style="{ color: '#faad14' }"
          >
            <template #suffix>项</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic 
            title="解析准确度" 
            :value="analysisStats.accuracy"
            :value-style="{ color: '#722ed1' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-col>
      </a-row>
    </a-card>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <a-space>
        <a-button size="large" @click="handleSaveAnalysis">
          <SaveOutlined />
          保存修改
        </a-button>
        <a-button type="primary" size="large" @click="handleNextStep">
          下一步：任务拆解
          <ArrowRightOutlined />
        </a-button>
      </a-space>
    </div>

    <!-- 添加阶段弹窗 -->
    <a-modal
      v-model:open="phaseModalVisible"
      title="添加技术路线阶段"
      width="600px"
      @ok="handlePhaseModalOk"
      @cancel="handlePhaseModalCancel"
    >
      <a-form
        ref="phaseFormRef"
        :model="phaseForm"
        :rules="phaseFormRules"
        layout="vertical"
      >
        <a-form-item label="阶段名称" name="phase">
          <a-input v-model:value="phaseForm.phase" placeholder="请输入阶段名称" />
        </a-form-item>
        
        <a-form-item label="阶段描述" name="description">
          <a-textarea 
            v-model:value="phaseForm.description" 
            placeholder="请描述该阶段的主要工作内容"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="主要任务" name="subTasks">
          <a-select
            v-model:value="phaseForm.subTasks"
            mode="tags"
            placeholder="请输入主要任务，按回车添加"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="预计时长（月）" name="duration">
              <a-input-number 
                v-model:value="phaseForm.duration" 
                :min="1" 
                :max="36"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="优先级" name="priority">
              <a-select v-model:value="phaseForm.priority">
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="风险等级" name="riskLevel">
              <a-select v-model:value="phaseForm.riskLevel">
                <a-select-option value="high">高风险</a-select-option>
                <a-select-option value="medium">中风险</a-select-option>
                <a-select-option value="low">低风险</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 申报书预览弹窗 -->
    <a-modal
      v-model:open="proposalPreviewVisible"
      title="原始申报书预览"
      width="80%"
      :footer="null"
      class="proposal-preview-modal"
    >
      <div class="proposal-preview-content">
        <div class="proposal-header">
          <h2>{{ mockProposalContent.title }}</h2>
          <div class="proposal-meta">
            <a-space>
              <a-tag color="blue">{{ mockProposalContent.type }}</a-tag>
              <span>申报时间：{{ mockProposalContent.submitDate }}</span>
              <span>申报单位：{{ mockProposalContent.organization }}</span>
            </a-space>
          </div>
        </div>
        
        <a-divider />
        
        <div class="proposal-sections">
          <div v-for="section in mockProposalContent.sections" :key="section.id" class="proposal-section">
            <h3>{{ section.title }}</h3>
            <div class="section-content" v-html="section.content"></div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 豆包提示词模板弹窗 -->
    <a-modal
      v-model:open="promptTemplateVisible"
      title="豆包提示词模板"
      width="90%"
      :footer="null"
      class="prompt-template-modal"
    >
      <div class="prompt-template-content">
        <a-row :gutter="24">
          <!-- 左侧：提示词模板选择 -->
          <a-col :span="12">
            <a-card title="📋 提示词模板" size="small">
              <div class="template-list">
                <div 
                  v-for="template in promptTemplates" 
                  :key="template.id"
                  class="template-item"
                  :class="{ active: selectedTemplate?.id === template.id }"
                  @click="selectTemplate(template)"
                >
                  <div class="template-header">
                    <span class="template-icon">{{ template.icon }}</span>
                    <span class="template-name">{{ template.name }}</span>
                  </div>
                  <div class="template-desc">{{ template.description }}</div>
                </div>
              </div>
            </a-card>

            <a-card title="📄 示例申报书内容" size="small" style="margin-top: 16px;">
              <div class="example-content">
                <a-typography-paragraph copyable>
                  {{ exampleProposalContent }}
                </a-typography-paragraph>
              </div>
            </a-card>
          </a-col>

          <!-- 右侧：选中的提示词内容 -->
          <a-col :span="12">
            <a-card title="🤖 提示词内容" size="small">
              <div v-if="selectedTemplate" class="template-content">
                <div class="template-info">
                  <h4>{{ selectedTemplate.name }}</h4>
                  <p>{{ selectedTemplate.description }}</p>
                </div>
                
                <a-divider />
                
                <div class="prompt-text">
                  <a-typography-paragraph copyable>
                    {{ selectedTemplate.prompt }}
                  </a-typography-paragraph>
                </div>

                <a-divider />

                <div class="usage-guide">
                  <h5>📖 使用说明：</h5>
                  <ol>
                    <li>复制上方的提示词模板</li>
                    <li>复制左侧的示例申报书内容（或使用您的实际申报书内容）</li>
                    <li>将提示词 + 申报书内容一起发送给豆包</li>
                    <li>豆包会按照JSON格式返回解析结果</li>
                    <li>将返回的JSON结果粘贴到系统中完成自动解析</li>
                  </ol>
                </div>

                <div class="expected-output">
                  <h5>📋 预期输出格式：</h5>
                  <a-typography-paragraph copyable code>
                    {{ selectedTemplate.expectedOutput }}
                  </a-typography-paragraph>
                </div>

                <div class="json-input-section">
                  <h5>📥 粘贴豆包返回的JSON结果：</h5>
                  <a-textarea
                    v-model:value="jsonInput"
                    placeholder="请将豆包返回的JSON结果粘贴到这里..."
                    :rows="6"
                    class="json-textarea"
                  />
                  <div class="json-actions" style="margin-top: 12px;">
                    <a-space>
                      <a-button type="primary" @click="parseJsonResult" :disabled="!jsonInput.trim()">
                        <ThunderboltOutlined />
                        解析JSON结果
                      </a-button>
                      <a-button @click="clearJsonInput">
                        清空
                      </a-button>
                      <a-button @click="validateJson" :disabled="!jsonInput.trim()">
                        验证格式
                      </a-button>
                    </a-space>
                  </div>
                </div>

                <a-divider />

                <div class="action-buttons">
                  <a-space>
                    <a-button type="primary" @click="copyFullPrompt">
                      <CopyOutlined />
                      复制完整提示词
                    </a-button>
                    <a-button @click="openDouBaoDemo">
                      <LinkOutlined />
                      打开豆包演示
                    </a-button>
                  </a-space>
                </div>
              </div>
              <div v-else class="no-template">
                <a-empty description="请选择一个提示词模板" />
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  CopyOutlined,
  LinkOutlined,
  PlusOutlined,
  EditOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'

// Props
const props = defineProps({
  proposalData: {
    type: Object,
    default: () => ({
      title: '',
      researchPeriod: '',
      totalBudget: '',
      technicalRoute: []
    })
  }
})

// Emits
const emit = defineEmits([
  'parse-proposal',
  'edit-tech-route',
  'save-analysis',
  'view-original',
  'update-tech-route',
  'update-project-info',
  'update-expected-results',
  'update-team-config'
])

// 响应式数据
const analysisStatus = ref('completed') // pending, parsing, completed, failed
const parsing = ref(false)
const editMode = ref(false)
const phaseModalVisible = ref(false)
const phaseFormRef = ref()
const proposalPreviewVisible = ref(false)
const promptTemplateVisible = ref(false)
const selectedTemplate = ref(null)
const jsonInput = ref('')

// 阶段表单数据
const phaseForm = reactive({
  phase: '',
  description: '',
  subTasks: [],
  duration: 3,
  priority: 'medium',
  riskLevel: 'medium'
})

// 表单验证规则
const phaseFormRules = {
  phase: [
    { required: true, message: '请输入阶段名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入阶段描述', trigger: 'blur' }
  ],
  subTasks: [
    { required: true, message: '请至少添加一个主要任务', trigger: 'change' }
  ]
}

// 模拟申报书内容数据
const mockProposalContent = ref({
  title: '基于人工智能的智慧城市管理系统研发',
  type: '科技创新项目',
  submitDate: '2025-01-15',
  organization: '华北水利水电大学',
  sections: [
    {
      id: 1,
      title: '一、项目背景与意义',
      content: `
        <p>随着城市化进程的加快，传统的城市管理模式已无法满足现代城市发展的需求。本项目旨在开发一套基于人工智能技术的智慧城市管理系统，通过大数据分析、机器学习等技术手段，实现城市资源的优化配置和智能化管理。</p>
        <p><strong>项目意义：</strong></p>
        <ul>
          <li>提升城市管理效率，降低管理成本</li>
          <li>改善市民生活质量，提高城市服务水平</li>
          <li>推动智慧城市建设，促进城市可持续发展</li>
        </ul>
      `
    },
    {
      id: 2,
      title: '二、研究内容与技术路线',
      content: `
        <p><strong>主要研究内容：</strong></p>
        <ol>
          <li><strong>需求分析与系统设计（1-3个月）</strong>
            <ul>
              <li>城市管理需求调研分析</li>
              <li>系统架构设计与技术选型</li>
              <li>数据库设计与接口规划</li>
            </ul>
          </li>
          <li><strong>核心算法研发（4-8个月）</strong>
            <ul>
              <li>智能决策算法设计</li>
              <li>数据挖掘与分析模型</li>
              <li>机器学习模型训练与优化</li>
            </ul>
          </li>
          <li><strong>系统开发与集成（9-15个月）</strong>
            <ul>
              <li>前端用户界面开发</li>
              <li>后端服务架构搭建</li>
              <li>第三方系统集成对接</li>
            </ul>
          </li>
          <li><strong>测试验证与优化（16-18个月）</strong>
            <ul>
              <li>系统功能测试与性能优化</li>
              <li>试点应用与效果评估</li>
              <li>系统部署与运维培训</li>
            </ul>
          </li>
        </ol>
      `
    },
    {
      id: 3,
      title: '三、预期成果与创新点',
      content: `
        <p><strong>预期成果：</strong></p>
        <ul>
          <li>完成智慧城市管理系统软件产品1套</li>
          <li>申请发明专利2-3项</li>
          <li>发表高水平学术论文3-5篇</li>
          <li>培养硕士研究生5-8名</li>
        </ul>
        <p><strong>主要创新点：</strong></p>
        <ul>
          <li>提出基于多源数据融合的城市态势感知方法</li>
          <li>设计自适应的智能决策优化算法</li>
          <li>构建可扩展的微服务架构体系</li>
        </ul>
      `
    }
  ]
})

// 豆包提示词模板数据
const promptTemplates = ref([
  {
    id: 1,
    name: '技术路线解析',
    icon: '🛣️',
    description: '解析申报书中的技术路线，提取阶段、任务和时间安排',
    prompt: `请分析以下科研项目申报书内容，按照指定的JSON格式提取技术路线信息：

要求：
1. 识别项目的主要技术路线阶段
2. 提取每个阶段的具体任务
3. 估算各阶段的时间安排
4. 评估技术难度和风险等级

请严格按照以下JSON格式返回结果：

{
  "technicalRoute": [
    {
      "id": "TR001",
      "phase": "阶段名称",
      "duration": 时间长度(月),
      "description": "阶段描述",
      "subTasks": ["任务1", "任务2", "任务3"],
      "difficulty": "high/medium/low",
      "riskLevel": "high/medium/low"
    }
  ]
}

申报书内容：`,
    expectedOutput: `{
  "technicalRoute": [
    {
      "id": "TR001",
      "phase": "需求分析与系统设计",
      "duration": 3,
      "description": "城市管理需求调研分析、系统架构设计与技术选型、数据库设计与接口规划",
      "subTasks": ["城市管理需求调研分析", "系统架构设计与技术选型", "数据库设计与接口规划"],
      "difficulty": "medium",
      "riskLevel": "low"
    }
  ]
}`
  },
  {
    id: 2,
    name: '项目基本信息提取',
    icon: '📋',
    description: '提取申报书中的项目基本信息，如名称、周期、预算等',
    prompt: `请分析以下科研项目申报书内容，提取项目的基本信息：

要求：
1. 提取项目名称、研究周期、总预算
2. 识别项目类型和所属领域
3. 提取项目负责人和参与单位信息

请严格按照以下JSON格式返回结果：

{
  "projectInfo": {
    "title": "项目名称",
    "researchPeriod": "研究周期",
    "totalBudget": "总预算",
    "projectType": "项目类型",
    "field": "所属领域",
    "leader": "项目负责人",
    "organization": "申报单位"
  }
}

申报书内容：`,
    expectedOutput: `{
  "projectInfo": {
    "title": "基于人工智能的智慧城市管理系统研发",
    "researchPeriod": "18个月",
    "totalBudget": "100万元",
    "projectType": "科技创新项目",
    "field": "人工智能",
    "leader": "张教授",
    "organization": "华北水利水电大学"
  }
}`
  },
  {
    id: 3,
    name: '预期成果解析',
    icon: '🎯',
    description: '解析申报书中的预期成果和创新点',
    prompt: `请分析以下科研项目申报书内容，提取预期成果和创新点信息：

要求：
1. 识别项目的预期成果（论文、专利、软件等）
2. 提取主要创新点和技术特色
3. 分析成果的应用价值和社会效益

请严格按照以下JSON格式返回结果：

{
  "expectedResults": {
    "papers": 论文数量,
    "patents": 专利数量,
    "software": 软件数量,
    "students": 培养学生数量,
    "innovations": ["创新点1", "创新点2"],
    "applications": ["应用领域1", "应用领域2"],
    "benefits": ["社会效益1", "社会效益2"]
  }
}

申报书内容：`,
    expectedOutput: `{
  "expectedResults": {
    "papers": 5,
    "patents": 3,
    "software": 1,
    "students": 8,
    "innovations": ["多源数据融合的城市态势感知方法", "自适应智能决策优化算法"],
    "applications": ["智慧城市管理", "城市规划决策"],
    "benefits": ["提升城市管理效率", "改善市民生活质量"]
  }
}`
  },
  {
    id: 4,
    name: '团队配置分析',
    icon: '👥',
    description: '分析申报书中的团队配置和人员安排',
    prompt: `请分析以下科研项目申报书内容，提取团队配置信息：

要求：
1. 识别项目团队成员及其角色
2. 分析团队的专业背景和技能分布
3. 评估团队配置的合理性

请严格按照以下JSON格式返回结果：

{
  "teamConfiguration": {
    "projectManager": {
      "name": "负责人姓名",
      "role": "项目负责人",
      "expertise": ["专业领域1", "专业领域2"]
    },
    "members": [
      {
        "name": "成员姓名",
        "role": "角色",
        "expertise": ["专业领域1", "专业领域2"],
        "workload": 工作负荷百分比
      }
    ]
  }
}

申报书内容：`,
    expectedOutput: `{
  "teamConfiguration": {
    "projectManager": {
      "name": "张教授",
      "role": "项目负责人",
      "expertise": ["人工智能", "系统架构"]
    },
    "members": [
      {
        "name": "李博士",
        "role": "技术负责人",
        "expertise": ["机器学习", "数据挖掘"],
        "workload": 80
      }
    ]
  }
}`
  }
])

// 示例申报书内容
const exampleProposalContent = ref(`基于人工智能的智慧城市管理系统研发

一、项目背景与意义
随着城市化进程的加快，传统的城市管理模式已无法满足现代城市发展的需求。本项目旨在开发一套基于人工智能技术的智慧城市管理系统，通过大数据分析、机器学习等技术手段，实现城市资源的优化配置和智能化管理。

二、研究内容与技术路线
主要研究内容：
1. 需求分析与系统设计（1-3个月）
   - 城市管理需求调研分析
   - 系统架构设计与技术选型
   - 数据库设计与接口规划

2. 核心算法研发（4-8个月）
   - 智能决策算法设计
   - 数据挖掘与分析模型
   - 机器学习模型训练与优化

3. 系统开发与集成（9-15个月）
   - 前端用户界面开发
   - 后端服务架构搭建
   - 第三方系统集成对接

4. 测试验证与优化（16-18个月）
   - 系统功能测试与性能优化
   - 试点应用与效果评估
   - 系统部署与运维培训

三、预期成果与创新点
预期成果：
- 完成智慧城市管理系统软件产品1套
- 申请发明专利2-3项
- 发表高水平学术论文3-5篇
- 培养硕士研究生5-8名

主要创新点：
- 提出基于多源数据融合的城市态势感知方法
- 设计自适应的智能决策优化算法
- 构建可扩展的微服务架构体系`)

// 计算属性
const analysisStats = computed(() => {
  const technicalRoute = props.proposalData.technicalRoute || []
  const totalPhases = technicalRoute.length
  const totalDuration = technicalRoute.reduce((sum, phase) => sum + (phase.duration || 0), 0)
  const totalTasks = technicalRoute.reduce((sum, phase) => sum + (phase.subTasks?.length || 0), 0)
  const accuracy = totalPhases > 0 ? 85 : 0 // 模拟准确度

  return {
    totalPhases,
    totalDuration,
    totalTasks,
    accuracy
  }
})

// 监听props变化，用于调试
import { watch } from 'vue'
watch(() => props.proposalData.technicalRoute, (newRoute, oldRoute) => {
  console.log('ProposalAnalysisStep: 技术路线数据变化')
  console.log('新数据:', newRoute)
  console.log('旧数据:', oldRoute)
}, { deep: true })

// 方法定义
const getAnalysisStatusColor = (status) => {
  const colorMap = {
    'pending': 'default',
    'parsing': 'processing',
    'completed': 'success',
    'failed': 'error'
  }
  return colorMap[status] || 'default'
}

const getAnalysisStatusText = (status) => {
  const textMap = {
    'pending': '待解析',
    'parsing': '解析中',
    'completed': '解析完成',
    'failed': '解析失败'
  }
  return textMap[status] || status
}

const handleViewOriginal = () => {
  proposalPreviewVisible.value = true
}

const handleParseProposal = async () => {
  parsing.value = true
  analysisStatus.value = 'parsing'
  
  try {
    // 模拟解析过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    analysisStatus.value = 'completed'
    message.success('申报书解析完成')
    emit('parse-proposal')
  } catch (error) {
    analysisStatus.value = 'failed'
    message.error('申报书解析失败')
  } finally {
    parsing.value = false
  }
}

const handleEditMode = () => {
  editMode.value = !editMode.value
  if (editMode.value) {
    message.info('已进入编辑模式，可以修改技术路线')
  } else {
    message.info('已退出编辑模式')
  }
}

const handleAddPhase = () => {
  resetPhaseForm()
  phaseModalVisible.value = true
}

const handleMovePhase = (index, direction) => {
  const technicalRoute = [...props.proposalData.technicalRoute]
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  
  if (targetIndex >= 0 && targetIndex < technicalRoute.length) {
    [technicalRoute[index], technicalRoute[targetIndex]] = [technicalRoute[targetIndex], technicalRoute[index]]
    emit('edit-tech-route', { technicalRoute })
    message.success('阶段顺序已调整')
  }
}

const handleDeletePhase = (index) => {
  const technicalRoute = [...props.proposalData.technicalRoute]
  technicalRoute.splice(index, 1)
  emit('edit-tech-route', { technicalRoute })
  message.success('阶段已删除')
}

const handleSaveAnalysis = () => {
  const analysisData = {
    ...props.proposalData,
    analysisStatus: analysisStatus.value,
    lastModified: new Date().toISOString()
  }
  emit('save-analysis', analysisData)
}

const handleNextStep = () => {
  handleSaveAnalysis()
  message.success('申报书解析已保存，进入下一步')
}

const resetPhaseForm = () => {
  phaseForm.phase = ''
  phaseForm.description = ''
  phaseForm.subTasks = []
  phaseForm.duration = 3
  phaseForm.priority = 'medium'
  phaseForm.riskLevel = 'medium'
}

const handlePhaseModalOk = async () => {
  try {
    await phaseFormRef.value.validate()
    
    const newPhase = {
      id: `TR${Date.now()}`,
      phase: phaseForm.phase,
      description: phaseForm.description,
      subTasks: phaseForm.subTasks,
      duration: phaseForm.duration,
      priority: phaseForm.priority,
      riskLevel: phaseForm.riskLevel
    }

    const technicalRoute = [...(props.proposalData.technicalRoute || []), newPhase]
    emit('edit-tech-route', { technicalRoute })

    phaseModalVisible.value = false
    resetPhaseForm()
    message.success('技术路线阶段添加成功')
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const handlePhaseModalCancel = () => {
  phaseModalVisible.value = false
  resetPhaseForm()
}

// 豆包提示词模板相关方法
const handleShowPromptTemplates = () => {
  promptTemplateVisible.value = true
  selectedTemplate.value = null
}

const selectTemplate = (template) => {
  selectedTemplate.value = template
}

const copyFullPrompt = async () => {
  if (!selectedTemplate.value) return
  
  const fullPrompt = selectedTemplate.value.prompt + '\n\n' + exampleProposalContent.value
  
  try {
    await navigator.clipboard.writeText(fullPrompt)
    message.success('完整提示词已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    message.error('复制失败，请手动复制')
  }
}

const openDouBaoDemo = () => {
  const demoUrl = 'https://www.doubao.com/chat/'
  window.open(demoUrl, '_blank')
  message.info('已打开豆包对话页面，请粘贴提示词进行对话')
}

// JSON解析相关方法
const clearJsonInput = () => {
  jsonInput.value = ''
  message.info('已清空输入内容')
}

const validateJson = () => {
  try {
    JSON.parse(jsonInput.value.trim())
    message.success('JSON格式验证通过')
  } catch (error) {
    message.error('JSON格式错误，请检查格式是否正确')
    console.error('JSON解析错误:', error)
  }
}

const parseJsonResult = () => {
  if (!selectedTemplate.value) {
    message.error('请先选择一个提示词模板')
    return
  }

  if (!jsonInput.value.trim()) {
    message.error('请输入JSON内容')
    return
  }

  try {
    const parsedData = JSON.parse(jsonInput.value.trim())
    
    // 根据不同模板类型处理数据
    switch (selectedTemplate.value.id) {
      case 1: // 技术路线解析
        handleTechnicalRouteData(parsedData)
        break
      case 2: // 项目基本信息提取
        handleProjectInfoData(parsedData)
        break
      case 3: // 预期成果解析
        handleExpectedResultsData(parsedData)
        break
      case 4: // 团队配置分析
        handleTeamConfigurationData(parsedData)
        break
      default:
        message.error('未知的模板类型')
        return
    }
    
    message.success('JSON解析成功，数据已应用到系统中')
    promptTemplateVisible.value = false
    jsonInput.value = ''
    
  } catch (error) {
    message.error('JSON格式错误，请检查格式是否正确')
    console.error('JSON解析错误:', error)
  }
}

// 处理技术路线数据
const handleTechnicalRouteData = (data) => {
  if (data.technicalRoute && Array.isArray(data.technicalRoute)) {
    // 更新技术路线数据到父组件
    emit('update-tech-route', data.technicalRoute)
    message.success(`成功解析 ${data.technicalRoute.length} 个技术路线阶段`)
  } else {
    message.error('技术路线数据格式不正确')
  }
}

// 处理项目基本信息数据
const handleProjectInfoData = (data) => {
  if (data.projectInfo) {
    // 更新项目基本信息到父组件
    emit('update-project-info', data.projectInfo)
    message.success('项目基本信息解析成功')
  } else {
    message.error('项目信息数据格式不正确')
  }
}

// 处理预期成果数据
const handleExpectedResultsData = (data) => {
  if (data.expectedResults) {
    // 更新预期成果数据到父组件
    emit('update-expected-results', data.expectedResults)
    message.success('预期成果信息解析成功')
  } else {
    message.error('预期成果数据格式不正确')
  }
}

// 处理团队配置数据
const handleTeamConfigurationData = (data) => {
  if (data.teamConfiguration) {
    // 更新团队配置数据到父组件
    emit('update-team-config', data.teamConfiguration)
    message.success('团队配置信息解析成功')
  } else {
    message.error('团队配置数据格式不正确')
  }
}
</script>

<style scoped>
.proposal-analysis-step {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-description {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  border: 1px solid #d6e4ff;
}

.step-description h3 {
  color: #234fa2;
  font-size: 20px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.step-description p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.proposal-info-card,
.tech-route-card,
.stats-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.tech-route-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.phase-item {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 20px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.phase-item.editing {
  border-color: #234fa2;
  background: #f0f7ff;
}

.phase-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.phase-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #234fa2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.phase-info {
  flex: 1;
}

.phase-info h4 {
  margin: 0 0 4px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.phase-title-input {
  font-size: 16px;
  font-weight: 600;
}

.phase-duration {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.phase-actions {
  display: flex;
  gap: 4px;
}

.phase-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.phase-description,
.phase-subtasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phase-description label,
.phase-subtasks label {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 500;
}

.description-text {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.subtasks-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subtask-tag {
  margin: 0;
}

.phase-settings {
  padding-top: 16px;
  border-top: 1px solid #e6eaf2;
}

.phase-settings label {
  display: block;
  margin-bottom: 4px;
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 500;
}

.empty-tech-route {
  text-align: center;
  padding: 40px;
}

.step-actions {
  display: flex;
  justify-content: center;
  padding: 24px;
  border-top: 1px solid #e6eaf2;
  background: #fafbfc;
  border-radius: 0 0 12px 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .phase-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .phase-actions {
    align-self: flex-start;
  }
  
  .phase-description,
  .phase-subtasks {
    gap: 4px;
  }

  .step-actions {
    padding: 16px;
  }

  .step-actions :deep(.ant-space) {
    width: 100%;
    justify-content: center;
  }

  .step-actions :deep(.ant-btn) {
    flex: 1;
  }
}

/* 申报书预览弹窗样式 */
.proposal-preview-modal :deep(.ant-modal-body) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.proposal-preview-content {
  font-family: 'Microsoft YaHei', sans-serif;
}

.proposal-header h2 {
  color: #234fa2;
  text-align: center;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
}

.proposal-meta {
  text-align: center;
  margin-bottom: 24px;
  color: #666;
}

.proposal-section {
  margin-bottom: 32px;
}

.proposal-section h3 {
  color: #234fa2;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  border-bottom: 2px solid #e6f4ff;
  padding-bottom: 8px;
}

.section-content {
  line-height: 1.8;
  color: #333;
}

.section-content p {
  margin-bottom: 12px;
}

.section-content ul, .section-content ol {
  margin-left: 20px;
  margin-bottom: 16px;
}

.section-content li {
  margin-bottom: 8px;
}

/* 豆包提示词模板弹窗样式 */
.prompt-template-modal :deep(.ant-modal-body) {
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.template-item {
  padding: 16px;
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.template-item:hover {
  border-color: #234fa2;
  background: #f0f7ff;
}

.template-item.active {
  border-color: #234fa2;
  background: #e6f4ff;
  box-shadow: 0 2px 8px rgba(35,79,162,0.15);
}

.template-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.template-icon {
  font-size: 18px;
}

.template-name {
  font-weight: 600;
  color: #234fa2;
}

.template-desc {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.example-content {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.template-content {
  padding: 16px;
}

.template-info h4 {
  color: #234fa2;
  margin-bottom: 8px;
  font-size: 16px;
}

.template-info p {
  color: #666;
  margin-bottom: 0;
  font-size: 14px;
}

.prompt-text {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  max-height: 200px;
  overflow-y: auto;
}

.usage-guide {
  background: #e6f4ff;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #234fa2;
}

.usage-guide h5 {
  color: #234fa2;
  margin-bottom: 12px;
  font-size: 14px;
}

.usage-guide ol {
  margin-bottom: 0;
  padding-left: 20px;
}

.usage-guide li {
  margin-bottom: 8px;
  color: #333;
  font-size: 13px;
  line-height: 1.5;
}

.expected-output {
  background: #f6ffed;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #52c41a;
}

.expected-output h5 {
  color: #52c41a;
  margin-bottom: 12px;
  font-size: 14px;
}

.action-buttons {
  text-align: center;
  margin-top: 24px;
}

.no-template {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* JSON输入区域样式 */
.json-input-section {
  background: #fff7e6;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #faad14;
  margin-top: 16px;
}

.json-input-section h5 {
  color: #faad14;
  margin-bottom: 12px;
  font-size: 14px;
}

.json-textarea {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.json-textarea :deep(.ant-input) {
  background: #fafafa;
  border: 1px solid #d9d9d9;
}

.json-textarea :deep(.ant-input:focus) {
  border-color: #faad14;
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
}

.json-actions {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}
</style>
