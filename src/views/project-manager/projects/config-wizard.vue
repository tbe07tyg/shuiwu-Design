<template>
  <div class="project-config-wizard">
    <!-- 页面头部 -->
    <div class="wizard-header">
      <h1>项目配置向导</h1>
      <p class="subtitle" v-if="projectInfo.name">正在配置项目：{{ projectInfo.name }}</p>
      <p class="subtitle" v-else>项目初始化配置</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-section">
      <a-steps :current="currentStep" size="small">
        <a-step title="基本信息" description="确认项目基本信息" />
        <a-step title="管理配置" description="选择模板和模式" />
        <a-step title="里程碑" description="制定关键节点" />
        <a-step title="任务规划" description="创建初始WBS" />
      </a-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="wizard-content">
      <a-card class="step-card">
        <!-- 步骤1：基本信息确认 -->
        <div v-if="currentStep === 0" class="step-content">
          <h3>📋 确认项目基本信息</h3>
          <p class="step-desc">以下信息已从立项数据自动导入，您可以根据需要进行调整</p>
          
          <a-form :model="projectInfo" layout="vertical" class="config-form">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="项目名称" required>
                  <a-input v-model:value="projectInfo.name" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="项目编号">
                  <a-input v-model:value="projectInfo.code" readonly />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="项目经理">
                  <a-input v-model:value="projectInfo.manager" readonly />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="所属部门">
                  <a-input v-model:value="projectInfo.department" readonly />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="8">
                <a-form-item label="项目预算">
                  <a-input-number 
                    v-model:value="projectInfo.budget" 
                    :min="0" 
                    :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="开始时间">
                  <a-date-picker v-model:value="projectInfo.startDate" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="结束时间">
                  <a-date-picker v-model:value="projectInfo.endDate" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item label="项目描述">
              <a-textarea v-model:value="projectInfo.description" :rows="4" />
            </a-form-item>
          </a-form>
        </div>

        <!-- 步骤2：管理配置 -->
        <div v-if="currentStep === 1" class="step-content">
          <h3>⚙️ 项目管理配置</h3>
          <p class="step-desc">选择合适的管理模板和工作模式，设置自动化功能</p>
          
          <a-form :model="managementConfig" layout="vertical" class="config-form">

            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="管理模板">
                  <a-select v-model:value="managementConfig.template" style="width: 100%" @change="handleTemplateChange">
                    <a-select-option v-for="template in availableTemplates" :key="template.id" :value="template.id">
                      <div class="template-option">
                        <span class="template-icon">{{ template.icon }}</span>
                        <span class="template-name">{{ template.name }}</span>
                        <a-tag size="small" style="margin-left: 8px;">{{ template.category }}</a-tag>
                      </div>
                    </a-select-option>
                  </a-select>
                  <div v-if="selectedTemplate" class="template-info">
                    <p class="template-description">{{ selectedTemplate.description }}</p>
                    <div class="template-stats">
                      <span>{{ selectedTemplate.taskCount }} 个任务</span>
                      <span>{{ selectedTemplate.milestoneCount }} 个里程碑</span>
                      <span>已使用 {{ selectedTemplate.usageCount }} 次</span>
                    </div>
                    <a-button type="link" size="small" @click="previewTemplate">
                      <EyeOutlined />
                      预览模板结构
                    </a-button>
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="工作模式">
                  <a-select v-model:value="managementConfig.workMode" style="width: 100%">
                    <a-select-option value="hybrid">混合模式</a-select-option>
                    <a-select-option value="remote">远程协作</a-select-option>
                    <a-select-option value="onsite">现场办公</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item label="自动化设置">
              <a-checkbox-group v-model:value="managementConfig.automation">
                <a-checkbox value="autoAssignTeam">自动推荐团队成员</a-checkbox>
                <a-checkbox value="autoCreateTasks">基于模板自动创建任务</a-checkbox>
                <a-checkbox value="autoReports">自动生成进度报告</a-checkbox>
                <a-checkbox value="autoNotifications">自动发送提醒通知</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-form>
        </div>

        <!-- 步骤3：里程碑设置 -->
        <div v-if="currentStep === 2" class="step-content">
          <h3>🎯 制定项目里程碑</h3>
          <p class="step-desc">设置项目关键节点，用于向管理角色提交材料和进度跟踪</p>
          
          <div class="milestones-config">
            <div v-for="(milestone, index) in milestones" :key="index" class="milestone-item">
              <a-card size="small" :title="milestone.name">
                <template #extra>
                  <a-switch v-model:checked="milestone.enabled" />
                </template>
                
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="计划时间">
                      <a-date-picker v-model:value="milestone.plannedDate" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="负责人">
                      <a-select v-model:value="milestone.owner" style="width: 100%">
                        <a-select-option value="pm">项目经理</a-select-option>
                        <a-select-option value="tech">技术负责人</a-select-option>
                        <a-select-option value="qa">质量负责人</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="提前准备天数">
                      <a-input-number v-model:value="milestone.prepareDays" :min="1" :max="30" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-form-item label="里程碑描述">
                  <a-textarea v-model:value="milestone.description" :rows="2" />
                </a-form-item>
              </a-card>
            </div>
          </div>
        </div>

        <!-- 步骤4：初始任务规划 -->
        <div v-if="currentStep === 3" class="step-content">
          <h3>📊 创建初始WBS结构</h3>
          <p class="step-desc">基于选择的管理模板，创建初始的工作分解结构</p>
          
          <div class="wbs-config">
            <a-alert 
              message="模板任务结构" 
              :description="`基于${getTemplateName}，系统已为您生成初始任务结构，您可以根据需要进行调整`"
              type="info" 
              show-icon 
              style="margin-bottom: 24px"
            />
            
            <div class="wbs-tree">
              <!-- 调试信息 -->
              <div style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 12px;">
                <strong>调试信息：</strong><br>
                WBS结构长度: {{ wbsStructure.length }}<br>
                当前步骤: {{ currentStep }}<br>
                选中模板ID: {{ managementConfig.template }}<br>
                选中模板对象: {{ selectedTemplate ? selectedTemplate.name : '未找到' }}<br>
                模板名称: {{ getTemplateName }}<br>
                <details>
                  <summary>WBS完整数据 (点击展开)</summary>
                  <pre>{{ JSON.stringify(wbsStructure, null, 2) }}</pre>
                </details>
              </div>
              
              <!-- 拖拽操作提示 -->
              <a-alert
                message="拖拽排序提示"
                description="您可以拖拽节点来调整任务顺序：拖拽到节点之间可以调整同级顺序，拖拽到节点内部可以设为子任务"
                type="info"
                show-icon
                closable
                style="margin-bottom: 16px"
              />
              
              <!-- 测试：如果WBS数据为空，显示备用内容 -->
              <div v-if="wbsStructure.length === 0" style="text-align: center; padding: 40px; color: #999;">
                <p>🔧 WBS结构数据为空，请检查模板应用</p>
                <a-button @click="handleTemplateChange(1)">手动应用默认模板</a-button>
              </div>
              
              <a-tree
                v-else
                :tree-data="wbsStructure"
                :checkable="false"
                :selectable="true"
                :default-expanded-keys="['0']"
                :showLine="true"
                :showIcon="false"
                :draggable="true"
                @drop="onWbsDrop"
                @dragenter="onWbsDragEnter"
                @dragover="onWbsDragOver"
                @dragstart="onWbsDragStart"
              >
                <template #title="{ title, key, progress }">
                  <div class="tree-node">
                    <span class="node-title">{{ title }}</span>
                    <span class="node-progress" v-if="progress !== undefined">
                      <a-progress :percent="progress" size="small" style="width: 100px" />
                    </span>
                    <span class="node-actions">
                      <a-button 
                        type="link" 
                        size="small" 
                        @click="moveWbsNodeUp(key)"
                        :title="'向上移动'"
                      >
                        <template #icon><UpOutlined /></template>
                      </a-button>
                      <a-button 
                        type="link" 
                        size="small" 
                        @click="moveWbsNodeDown(key)"
                        :title="'向下移动'"
                      >
                        <template #icon><DownOutlined /></template>
                      </a-button>
                      <a-button type="link" size="small" @click="editWbsNode(key)">编辑</a-button>
                      <a-button type="link" size="small" @click="addWbsChild(key)">添加子项</a-button>
                    </span>
                  </div>
                </template>
              </a-tree>
            </div>
            
            <div class="wbs-actions">
              <a-button type="dashed" @click="addWbsRoot">
                <PlusOutlined />
                添加根节点
              </a-button>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="wizard-actions">
          <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
          <a-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</a-button>
          <a-button v-if="currentStep === 3" type="primary" @click="finishConfig" :loading="configuring">
            完成配置
          </a-button>
        </div>
      </a-card>
    </div>

    <!-- 模板预览弹窗 -->
    <a-modal
      v-model:open="templatePreviewVisible"
      title="模板结构预览"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedTemplate" class="template-preview">
        <div class="template-header">
          <span class="template-icon">{{ selectedTemplate.icon }}</span>
          <h3>{{ selectedTemplate.name }}</h3>
          <a-tag>{{ selectedTemplate.category }}</a-tag>
        </div>
        
        <p class="template-description">{{ selectedTemplate.description }}</p>
        
        <div class="template-stats">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-statistic title="项目阶段" :value="selectedTemplate.structure?.phases?.length || 0" suffix="个" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="任务节点" :value="selectedTemplate.taskCount" suffix="个" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="里程碑" :value="selectedTemplate.milestoneCount" suffix="个" />
            </a-col>
          </a-row>
        </div>
        
        <div class="phases-preview">
          <h4>项目阶段结构</h4>
          <div v-for="(phase, index) in selectedTemplate.structure?.phases || []" :key="index" class="phase-item">
            <div class="phase-header">
              <span class="phase-number">{{ index + 1 }}</span>
              <span class="phase-name">{{ phase.name }}</span>
              <span class="phase-duration">{{ phase.duration }} 天</span>
            </div>
            <div class="phase-tasks">
              <a-tag v-for="task in phase.tasks" :key="task" size="small">{{ task }}</a-tag>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- WBS节点编辑弹窗 -->
    <a-modal 
      v-model:open="wbsEditModal.visible" 
      :title="wbsEditModal.isAdd ? '添加任务节点' : '编辑任务节点'"
      width="600px"
      @ok="saveWbsNode"
      @cancel="cancelWbsEdit"
    >
      <a-form
        :model="wbsEditModal.formData"
        :rules="wbsEditRules"
        ref="wbsEditFormRef"
        layout="vertical"
      >
        <a-form-item label="任务名称" name="title">
          <a-input 
            v-model:value="wbsEditModal.formData.title" 
            placeholder="请输入任务名称"
          />
        </a-form-item>
        
        <a-form-item label="任务描述" name="description">
          <a-textarea 
            v-model:value="wbsEditModal.formData.description" 
            placeholder="请输入任务描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="预估工期(天)" name="duration">
              <a-input-number 
                v-model:value="wbsEditModal.formData.duration" 
                :min="1"
                :max="365"
                placeholder="预估工期"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="优先级" name="priority">
              <a-select 
                v-model:value="wbsEditModal.formData.priority" 
                placeholder="选择优先级"
              >
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="负责人" name="assignee">
          <a-select 
            v-model:value="wbsEditModal.formData.assignee" 
            placeholder="选择负责人"
            mode="multiple"
          >
            <a-select-option value="user1">张三</a-select-option>
            <a-select-option value="user2">李四</a-select-option>
            <a-select-option value="user3">王五</a-select-option>
            <a-select-option value="user4">赵六</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="任务标签" name="tags">
          <a-select 
            v-model:value="wbsEditModal.formData.tags" 
            placeholder="选择任务标签"
            mode="tags"
          >
            <a-select-option value="开发">开发</a-select-option>
            <a-select-option value="测试">测试</a-select-option>
            <a-select-option value="设计">设计</a-select-option>
            <a-select-option value="文档">文档</a-select-option>
            <a-select-option value="评审">评审</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      
      <template #footer>
        <a-space>
          <a-button @click="cancelWbsEdit">取消</a-button>
          <a-button 
            v-if="!wbsEditModal.isAdd" 
            type="danger" 
            @click="deleteWbsNode"
          >
            删除节点
          </a-button>
          <a-button type="primary" @click="saveWbsNode">
            {{ wbsEditModal.isAdd ? '添加' : '保存' }}
          </a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, EyeOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

// 响应式数据
const currentStep = ref(0)
const configuring = ref(false)
const templatePreviewVisible = ref(false)

// 项目基本信息
const projectInfo = reactive({
  name: '',
  code: '',
  manager: '当前用户',
  department: '',
  budget: 0,
  startDate: null,
  endDate: null,
  description: ''
})

// 管理配置
const managementConfig = reactive({
  template: 1, // 默认选择第一个模板
  workMode: 'hybrid',
  automation: ['autoAssignTeam', 'autoCreateTasks']
})

// 可用模板列表
const availableTemplates = ref([
  {
    id: 1,
    name: '标准研发模板',
    icon: '📊',
    description: '适用于常规软件开发项目，包含完整的开发生命周期管理',
    category: '软件开发',
    taskCount: 25,
    milestoneCount: 5,
    usageCount: 156,
    isDefault: true,
    structure: {
      phases: [
        { name: '需求分析阶段', tasks: ['需求收集', '需求分析', '需求评审'], duration: 10 },
        { name: '设计阶段', tasks: ['概要设计', '详细设计', '设计评审'], duration: 15 },
        { name: '开发阶段', tasks: ['前端开发', '后端开发', '接口联调'], duration: 30 },
        { name: '测试阶段', tasks: ['单元测试', '集成测试', '系统测试'], duration: 15 },
        { name: '上线阶段', tasks: ['部署准备', '生产发布', '验证测试'], duration: 5 }
      ],
      milestones: [
        { name: '需求确认', phase: '需求分析阶段', type: 'review' },
        { name: '设计评审', phase: '设计阶段', type: 'review' },
        { name: '开发完成', phase: '开发阶段', type: 'delivery' },
        { name: '测试通过', phase: '测试阶段', type: 'checkpoint' },
        { name: '项目交付', phase: '上线阶段', type: 'delivery' }
      ]
    }
  },
  {
    id: 2,
    name: '敏捷开发模板',
    icon: '⚡',
    description: '基于Scrum框架的敏捷开发模板，支持快速迭代和持续交付',
    category: '敏捷开发',
    taskCount: 18,
    milestoneCount: 4,
    usageCount: 89,
    structure: {
      phases: [
        { name: 'Sprint 0 - 项目启动', tasks: ['产品愿景', '用户故事梳理', '团队组建'], duration: 5 },
        { name: 'Sprint 1', tasks: ['Sprint规划', '功能开发', 'Sprint评审'], duration: 14 },
        { name: 'Sprint 2', tasks: ['Sprint规划', '功能开发', 'Sprint评审'], duration: 14 },
        { name: '项目收尾', tasks: ['最终测试', '产品发布', '项目回顾'], duration: 7 }
      ]
    }
  },
  {
    id: 3,
    name: '瀑布开发模板',
    icon: '🏗️',
    description: '经典的瀑布模型，适合大型系统和复杂项目的严格管理',
    category: '大型系统',
    taskCount: 35,
    milestoneCount: 7,
    usageCount: 42,
    structure: {
      phases: [
        { name: '项目启动', tasks: ['项目章程', '干系人分析', '初步计划'], duration: 7 },
        { name: '需求工程', tasks: ['需求获取', '需求分析', '需求规格', '需求验证'], duration: 20 },
        { name: '系统设计', tasks: ['架构设计', '详细设计', '接口设计', '数据库设计'], duration: 25 },
        { name: '编码实现', tasks: ['编码规范', '模块开发', '代码审查', '单元测试'], duration: 40 },
        { name: '系统集成', tasks: ['集成计划', '集成测试', '性能测试', '安全测试'], duration: 20 },
        { name: '系统测试', tasks: ['测试计划', '功能测试', '用户验收', '缺陷修复'], duration: 25 },
        { name: '部署维护', tasks: ['部署计划', '生产部署', '用户培训', '维护交接'], duration: 10 }
      ]
    }
  },
  {
    id: 4,
    name: '科研项目模板',
    icon: '🔬',
    description: '专门为科研项目设计，符合科研管理规范和流程要求',
    category: '科研管理',
    taskCount: 22,
    milestoneCount: 6,
    usageCount: 78,
    structure: {
      phases: [
        { name: '立项阶段', tasks: ['项目申请', '可行性分析', '立项评审'], duration: 15 },
        { name: '开题阶段', tasks: ['文献调研', '技术路线', '开题报告'], duration: 20 },
        { name: '实施阶段', tasks: ['实验设计', '数据采集', '阶段性分析'], duration: 180 },
        { name: '中期阶段', tasks: ['中期检查', '进度汇报', '调整方案'], duration: 10 },
        { name: '结题阶段', tasks: ['成果整理', '验收材料', '结题答辩'], duration: 30 },
        { name: '成果转化', tasks: ['论文发表', '专利申请', '技术转移'], duration: 60 }
      ]
    }
  }
])

// 选中的模板
const selectedTemplate = computed(() => {
  return availableTemplates.value.find(t => t.id === managementConfig.template)
})

// 里程碑配置
const milestones = ref([
  {
    name: '项目开题',
    enabled: true,
    plannedDate: null,
    owner: 'pm',
    prepareDays: 7,
    description: '准备开题报告，组织开题会议'
  },
  {
    name: '中期检查',
    enabled: true,
    plannedDate: null,
    owner: 'pm',
    prepareDays: 10,
    description: '中期进展汇报，问题梳理分析'
  },
  {
    name: '项目验收',
    enabled: true,
    plannedDate: null,
    owner: 'pm',
    prepareDays: 14,
    description: '整理项目成果，准备验收材料'
  }
])

// WBS结构
const wbsStructure = ref([
  {
    title: '项目执行阶段',
    key: '0',
    children: [
      {
        title: '需求分析',
        key: '0-0',
        progress: 0
      },
      {
        title: '系统设计',
        key: '0-1',
        progress: 0
      },
      {
        title: '开发实现',
        key: '0-2',
        progress: 0,
        children: [
          {
            title: '前端开发',
            key: '0-2-0',
            progress: 0
          },
          {
            title: '后端开发',
            key: '0-2-1',
            progress: 0
          }
        ]
      },
      {
        title: '测试验证',
        key: '0-3',
        progress: 0
      },
      {
        title: '部署上线',
        key: '0-4',
        progress: 0
      }
    ]
  }
])

// WBS编辑相关数据
const wbsEditModal = reactive({
  visible: false,
  isAdd: false,
  editingKey: null,
  parentKey: null,
  formData: {
    title: '',
    description: '',
    duration: 1,
    priority: 'medium',
    assignee: [],
    tags: []
  }
})

// WBS编辑表单引用
const wbsEditFormRef = ref()

// WBS编辑表单验证规则
const wbsEditRules = {
  title: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '任务名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入预估工期', trigger: 'blur' }
  ]
}

// 计算属性
const getTemplateName = computed(() => {
  if (selectedTemplate.value) {
    return selectedTemplate.value.name
  }
  return '标准研发模板'
})

// 方法
const nextStep = () => {
  console.log('🔍 nextStep 被调用，当前步骤:', currentStep.value)
  
  if (currentStep.value === 2) {
    console.log('📊 里程碑验证详情:')
    console.log('- milestones数据:', milestones.value)
    console.log('- 启用的里程碑:', milestones.value.filter(m => m.enabled))
    milestones.value.forEach((m, i) => {
      console.log(`  ${i+1}. ${m.name}: enabled=${m.enabled}, plannedDate=${m.plannedDate}`)
    })
  }
  
  const validated = validateCurrentStep()
  console.log('✅ 验证结果:', validated)
  
  if (validated) {
    console.log('🎯 验证通过，进入下一步')
    currentStep.value++
    console.log('🔢 新的步骤:', currentStep.value)
  } else {
    console.log('❌ 验证失败，停留在当前步骤')
  }
}

const prevStep = () => {
  currentStep.value--
}

const validateCurrentStep = () => {
  switch (currentStep.value) {
    case 0:
      if (!projectInfo.name) {
        message.error('请填写项目名称')
        return false
      }
      break
    case 1:
      if (!managementConfig.template) {
        message.error('请选择管理模板')
        return false
      }
      break
    case 2:
      const enabledMilestones = milestones.value.filter(m => m.enabled)
      if (enabledMilestones.length === 0) {
        message.error('至少启用一个里程碑')
        return false
      }
      // 检查启用的里程碑是否都有计划时间
      for (const milestone of enabledMilestones) {
        if (!milestone.plannedDate || milestone.plannedDate === null || milestone.plannedDate === '') {
          message.error(`请设置"${milestone.name}"的计划时间`)
          return false
        }
      }
      console.log('里程碑验证通过:', enabledMilestones.map(m => ({name: m.name, date: m.plannedDate})))
      break
  }
  return true
}

// 查找WBS节点的辅助函数
const findWbsNode = (nodes, key) => {
  for (const node of nodes) {
    if (node.key === key) {
      return node
    }
    if (node.children) {
      const found = findWbsNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

// 生成新的WBS节点key
const generateWbsKey = (parentKey = null) => {
  const timestamp = Date.now()
  if (parentKey) {
    return `${parentKey}-${timestamp}`
  } else {
    return `${timestamp}`
  }
}

// 编辑WBS节点
const editWbsNode = (key) => {
  console.log('编辑WBS节点:', key)
  
  const node = findWbsNode(wbsStructure.value, key)
  if (!node) {
    message.error('未找到要编辑的节点')
    return
  }
  
  // 填充编辑表单
  wbsEditModal.visible = true
  wbsEditModal.isAdd = false
  wbsEditModal.editingKey = key
  wbsEditModal.formData = {
    title: node.title || '',
    description: node.description || '',
    duration: node.duration || 1,
    priority: node.priority || 'medium',
    assignee: node.assignee || [],
    tags: node.tags || []
  }
}

// 添加子节点
const addWbsChild = (key) => {
  console.log('添加子节点到:', key)
  
  // 重置表单
  wbsEditModal.visible = true
  wbsEditModal.isAdd = true
  wbsEditModal.editingKey = null
  wbsEditModal.parentKey = key
  wbsEditModal.formData = {
    title: '',
    description: '',
    duration: 1,
    priority: 'medium',
    assignee: [],
    tags: []
  }
}

// 添加根节点
const addWbsRoot = () => {
  console.log('添加根节点')
  
  // 重置表单
  wbsEditModal.visible = true
  wbsEditModal.isAdd = true
  wbsEditModal.editingKey = null
  wbsEditModal.parentKey = null
  wbsEditModal.formData = {
    title: '',
    description: '',
    duration: 1,
    priority: 'medium',
    assignee: [],
    tags: []
  }
}

// 保存WBS节点
const saveWbsNode = async () => {
  try {
    // 表单验证
    await wbsEditFormRef.value.validate()
    
    const newNodeData = {
      title: wbsEditModal.formData.title,
      description: wbsEditModal.formData.description,
      duration: wbsEditModal.formData.duration,
      priority: wbsEditModal.formData.priority,
      assignee: wbsEditModal.formData.assignee,
      tags: wbsEditModal.formData.tags,
      progress: 0
    }
    
    if (wbsEditModal.isAdd) {
      // 添加新节点
      const newKey = generateWbsKey(wbsEditModal.parentKey)
      const newNode = {
        ...newNodeData,
        key: newKey
      }
      
      if (wbsEditModal.parentKey) {
        // 添加为子节点
        const parentNode = findWbsNode(wbsStructure.value, wbsEditModal.parentKey)
        if (parentNode) {
          if (!parentNode.children) {
            parentNode.children = []
          }
          parentNode.children.push(newNode)
          message.success('子节点添加成功')
        } else {
          message.error('未找到父节点')
          return
        }
      } else {
        // 添加为根节点
        wbsStructure.value.push(newNode)
        message.success('根节点添加成功')
      }
    } else {
      // 编辑现有节点
      const node = findWbsNode(wbsStructure.value, wbsEditModal.editingKey)
      if (node) {
        Object.assign(node, newNodeData)
        message.success('节点更新成功')
      } else {
        message.error('未找到要编辑的节点')
        return
      }
    }
    
    // 关闭弹窗
    wbsEditModal.visible = false
    
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 删除WBS节点
const deleteWbsNode = () => {
  const deleteNode = (nodes, key) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].key === key) {
        nodes.splice(i, 1)
        return true
      }
      if (nodes[i].children) {
        if (deleteNode(nodes[i].children, key)) {
          return true
        }
      }
    }
    return false
  }
  
  if (deleteNode(wbsStructure.value, wbsEditModal.editingKey)) {
    message.success('节点删除成功')
    wbsEditModal.visible = false
  } else {
    message.error('删除失败，未找到节点')
  }
}

// 取消编辑
const cancelWbsEdit = () => {
  wbsEditModal.visible = false
}

// WBS排序函数
// 查找节点在数组中的位置信息
const findNodePosition = (nodes, targetKey, parentKey = null) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].key === targetKey) {
      return {
        nodeList: nodes,
        index: i,
        parentKey: parentKey,
        node: nodes[i]
      }
    }
    if (nodes[i].children) {
      const result = findNodePosition(nodes[i].children, targetKey, nodes[i].key)
      if (result) return result
    }
  }
  return null
}

// 向上移动节点
const moveWbsNodeUp = (key) => {
  console.log('向上移动节点:', key)
  
  const position = findNodePosition(wbsStructure.value, key)
  if (!position) {
    message.error('未找到要移动的节点')
    return
  }
  
  const { nodeList, index, parentKey, node } = position
  
  if (index > 0) {
    // 在同级中向上移动
    nodeList.splice(index, 1)
    nodeList.splice(index - 1, 0, node)
    message.success('节点上移成功')
  } else if (parentKey) {
    // 没有上级同级节点，提升到父级同级
    const parentPosition = findNodePosition(wbsStructure.value, parentKey)
    if (parentPosition) {
      // 从当前位置移除
      nodeList.splice(index, 1)
      
      // 更新节点key为父级的同级
      node.key = generateWbsKey(parentPosition.parentKey)
      updateChildrenKeys(node, node.key)
      
      // 插入到父节点之前
      parentPosition.nodeList.splice(parentPosition.index, 0, node)
      message.success('节点提升层级成功')
    } else {
      message.warning('已在最顶层，无法继续上移')
    }
  } else {
    message.warning('已在最顶层，无法上移')
  }
}

// 向下移动节点
const moveWbsNodeDown = (key) => {
  console.log('向下移动节点:', key)
  
  const position = findNodePosition(wbsStructure.value, key)
  if (!position) {
    message.error('未找到要移动的节点')
    return
  }
  
  const { nodeList, index, node } = position
  
  if (index < nodeList.length - 1) {
    // 在同级中向下移动
    nodeList.splice(index, 1)
    nodeList.splice(index + 1, 0, node)
    message.success('节点下移成功')
  } else {
    message.warning('已在最底层，无法下移')
  }
}

// WBS拖拽相关函数
const onWbsDragStart = (info) => {
  console.log('开始拖拽:', info)
}

const onWbsDragEnter = (info) => {
  console.log('拖拽进入:', info)
}

const onWbsDragOver = (info) => {
  console.log('拖拽经过:', info)
}

// 拖拽放置处理函数
const onWbsDrop = (info) => {
  console.log('拖拽放置:', info)
  
  const dropKey = info.node.key
  const dragKey = info.dragNode.key
  const dropPos = info.node.pos.split('-')
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
  
  console.log('拖拽详情:', {
    dragKey,
    dropKey, 
    dropPosition,
    dropToGap: info.dropToGap
  })
  
  // 防止将节点拖拽到自己或自己的子节点上
  if (dragKey === dropKey || dragKey.indexOf(dropKey + '-') === 0) {
    message.warning('不能将节点拖拽到自己或子节点上')
    return
  }
  
  // 查找并移除被拖拽的节点
  const dragObj = findAndRemoveNode(wbsStructure.value, dragKey)
  if (!dragObj) {
    message.error('未找到要移动的节点')
    return
  }
  
  // 根据拖拽位置插入节点
  if (!info.dropToGap) {
    // 拖拽到节点内部，作为子节点
    const dropNode = findWbsNode(wbsStructure.value, dropKey)
    if (dropNode) {
      if (!dropNode.children) {
        dropNode.children = []
      }
      // 更新拖拽节点的key，保持层级关系
      dragObj.key = generateWbsKey(dropKey)
      updateChildrenKeys(dragObj, dragObj.key)
      dropNode.children.push(dragObj)
      message.success('节点移动成功')
    }
  } else {
    // 拖拽到节点之间，作为同级节点
    insertNodeAtPosition(wbsStructure.value, dragObj, dropKey, dropPosition)
    message.success('节点排序成功')
  }
}

// 查找并移除节点
const findAndRemoveNode = (nodes, key) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].key === key) {
      return nodes.splice(i, 1)[0]
    }
    if (nodes[i].children) {
      const result = findAndRemoveNode(nodes[i].children, key)
      if (result) return result
    }
  }
  return null
}

// 在指定位置插入节点
const insertNodeAtPosition = (nodes, dragObj, dropKey, dropPosition) => {
  let targetIndex = -1
  let targetParentList = null
  let parentKey = null
  
  // 查找目标节点的位置
  const findTargetPosition = (nodeList, currentParentKey = null) => {
    for (let i = 0; i < nodeList.length; i++) {
      if (nodeList[i].key === dropKey) {
        targetIndex = i
        targetParentList = nodeList
        parentKey = currentParentKey
        return true
      }
      if (nodeList[i].children) {
        if (findTargetPosition(nodeList[i].children, nodeList[i].key)) {
          return true
        }
      }
    }
    return false
  }
  
  findTargetPosition(nodes)
  
  if (targetIndex !== -1 && targetParentList) {
    const insertIndex = dropPosition === -1 ? targetIndex : targetIndex + 1
    
    // 更新拖拽节点的key
    dragObj.key = generateWbsKey(parentKey)
    updateChildrenKeys(dragObj, dragObj.key)
    
    // 插入节点
    targetParentList.splice(insertIndex, 0, dragObj)
  }
}

// 更新子节点的key
const updateChildrenKeys = (node, parentKey) => {
  if (node.children) {
    node.children.forEach((child, index) => {
      child.key = `${parentKey}-${Date.now()}-${index}`
      updateChildrenKeys(child, child.key)
    })
  }
}

const finishConfig = async () => {
  if (!validateCurrentStep()) return
  
  try {
    configuring.value = true
    
    // 构建完整的项目配置数据
    const projectConfig = {
      ...projectInfo,
      ...managementConfig,
      milestones: milestones.value.filter(m => m.enabled),
      wbsStructure: wbsStructure.value,
      configTime: new Date().toISOString()
    }
    
    // 这里应该调用API保存配置
    console.log('项目配置数据:', projectConfig)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.success('项目配置完成！正在跳转到项目管理页面...')
    
    // 跳转到项目列表页面
    setTimeout(() => {
      router.push('/project-manager/projects')
    }, 1000)
    
  } catch (error) {
    console.error('配置失败:', error)
    message.error('配置失败，请重试')
  } finally {
    configuring.value = false
  }
}

// 模板处理方法
const handleTemplateChange = (templateId) => {
  console.log('handleTemplateChange 被调用，templateId:', templateId)
  const template = availableTemplates.value.find(t => t.id === templateId)
  console.log('找到的模板:', template)
  
  if (template && template.structure) {
    console.log('模板结构:', template.structure)
    
    // 根据模板更新里程碑
    if (template.structure.milestones) {
      milestones.value = template.structure.milestones.map((milestone, index) => ({
        name: milestone.name,
        description: `${milestone.name}阶段的关键节点`,
        plannedDate: dayjs().add((index + 1) * 30, 'day'),
        owner: 'pm',
        prepareDays: 7,
        enabled: true,
        type: milestone.type || 'checkpoint'
      }))
      console.log('更新后的里程碑:', milestones.value)
    }
    
    // 根据模板更新WBS结构
    if (template.structure.phases) {
      wbsStructure.value = template.structure.phases.map((phase, phaseIndex) => ({
        key: `phase-${phaseIndex}`,
        title: phase.name,
        children: phase.tasks.map((task, taskIndex) => ({
          key: `task-${phaseIndex}-${taskIndex}`,
          title: task,
          children: []
        }))
      }))
      console.log('更新后的WBS结构:', wbsStructure.value)
    }
    
    message.success(`已应用模板: ${template.name}`)
  } else {
    console.log('模板未找到或没有结构数据')
  }
}

const previewTemplate = () => {
  if (selectedTemplate.value) {
    templatePreviewVisible.value = true
  }
}

// 初始化数据
const initializeData = () => {
  // 从路由参数获取项目信息
  const { projectId, projectName, projectCode, fromApproval } = route.query
  
  if (projectId) {
    if (fromApproval) {
      // 从立项数据初始化
      projectInfo.name = '智能科研管理系统开发'
      projectInfo.code = `PRJ-2024-${projectId}`
      projectInfo.department = '技术研发部'
      projectInfo.budget = 500000
      projectInfo.startDate = dayjs()
      projectInfo.endDate = dayjs().add(6, 'month')
      projectInfo.description = '开发一套智能化的科研管理系统，提升科研项目管理效率'
    } else {
      // 从现有项目信息初始化
      projectInfo.name = projectName || '项目名称'
      projectInfo.code = projectCode || `PRJ-${projectId}`
      projectInfo.department = '技术研发部'
      projectInfo.budget = 500000
      projectInfo.startDate = dayjs()
      projectInfo.endDate = dayjs().add(6, 'month')
      projectInfo.description = '项目配置描述...'
    }
    
    // 设置里程碑默认时间
    milestones.value[0].plannedDate = dayjs().add(1, 'month')
    milestones.value[1].plannedDate = dayjs().add(3, 'month')
    milestones.value[2].plannedDate = dayjs().add(6, 'month')
  }
}

onMounted(() => {
  initializeData()
  // 应用默认模板（ID为1的标准研发模板）
  handleTemplateChange(1)
})
</script>

<style scoped>
.project-config-wizard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.wizard-header {
  text-align: center;
  margin-bottom: 32px;
}

.wizard-header h1 {
  color: #234fa2;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.steps-section {
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wizard-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-card {
  border: none;
  box-shadow: none;
}

.step-content h3 {
  color: #234fa2;
  margin-bottom: 8px;
}

.step-desc {
  color: #666;
  margin-bottom: 24px;
}

.config-form {
  margin-top: 24px;
}

.milestones-config {
  margin-top: 24px;
}

.milestone-item {
  margin-bottom: 16px;
}

.wbs-config {
  margin-top: 24px;
}

.wbs-tree {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.node-title {
  flex: 1;
}

.node-progress {
  margin: 0 16px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.wbs-actions {
  text-align: center;
}

.wizard-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 32px;
}

.wizard-actions .ant-btn {
  margin: 0 8px;
}

/* 模板选择样式 */
.template-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-icon {
  font-size: 16px;
}

.template-name {
  flex: 1;
}

.template-info {
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

.template-description {
  color: #666;
  font-size: 13px;
  margin: 0 0 8px 0;
}

.template-stats {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.template-stats span {
  margin-right: 12px;
}

/* 模板预览样式 */
.template-preview {
  max-height: 60vh;
  overflow-y: auto;
}

.template-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.template-header .template-icon {
  font-size: 24px;
}

.template-header h3 {
  margin: 0;
  flex: 1;
}

.template-description {
  color: #666;
  margin-bottom: 16px;
}

.template-stats {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.phases-preview h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.phase-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fafafa;
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.phase-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.phase-name {
  font-weight: 600;
  flex: 1;
}

.phase-duration {
  font-size: 12px;
  color: #666;
  background: white;
  padding: 2px 8px;
  border-radius: 4px;
}

.phase-tasks {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* 表单提示样式 */
.form-tip {
  margin-top: 8px;
}

.form-tip p {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* WBS拖拽样式 */
.wbs-tree {
  position: relative;
}

/* 拖拽时的节点样式 */
:deep(.ant-tree-node-content-wrapper) {
  transition: all 0.2s ease;
  border-radius: 4px;
  padding: 2px 4px;
}

:deep(.ant-tree-node-content-wrapper:hover) {
  background-color: #f0f8ff;
}

/* 拖拽中的节点样式 */
:deep(.ant-tree-node-content-wrapper.drag-over) {
  background-color: #e6f7ff;
  border: 2px dashed #1890ff;
}

/* 拖拽占位符样式 */
:deep(.ant-tree-drop-indicator) {
  background-color: #1890ff;
  height: 2px;
  border-radius: 1px;
}

/* 拖拽图标 */
:deep(.ant-tree-draggable-icon) {
  width: 14px;
  height: 14px;
  line-height: 14px;
  text-align: center;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

:deep(.ant-tree-treenode:hover .ant-tree-draggable-icon) {
  opacity: 0.8;
}

/* 树节点操作区域 */
.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  width: 100%;
}

.node-title {
  flex: 1;
  margin-right: 8px;
  font-size: 14px;
}

.node-progress {
  margin-right: 8px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

/* 拖拽提示样式 */
.drag-hint {
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  background: #1890ff;
  color: white;
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* 增强拖拽视觉反馈 */
:deep(.ant-tree-node-selected) {
  background-color: #bae7ff !important;
  border-radius: 4px;
}

:deep(.ant-tree-treenode.drop-target) {
  background-color: #e6f7ff;
  border: 1px dashed #40a9ff;
  border-radius: 4px;
}

:deep(.ant-tree-treenode.drop-target > .ant-tree-node-content-wrapper) {
  background-color: transparent;
}

/* 排序箭头按钮样式 */
.node-actions .ant-btn-link {
  padding: 2px 4px;
  margin: 0 1px;
  height: auto;
  line-height: 1;
  font-size: 12px;
}

.node-actions .ant-btn-link[title*="移动"] {
  color: #1890ff;
  border: 1px solid transparent;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.node-actions .ant-btn-link[title*="移动"]:hover {
  background-color: #e6f7ff;
  border-color: #40a9ff;
  color: #096dd9;
}

.node-actions .ant-btn-link .anticon {
  font-size: 10px;
}

/* 排序按钮分组样式 */
.node-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.node-actions > .ant-btn-link[title*="移动"] {
  border-radius: 3px;
  min-width: 20px;
  text-align: center;
}

/* 排序按钮组边框 */
.node-actions .ant-btn-link[title*="移动"]:first-of-type {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.node-actions .ant-btn-link[title*="移动"]:nth-of-type(2) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-right: 4px;
}
</style>