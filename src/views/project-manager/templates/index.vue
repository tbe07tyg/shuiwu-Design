<template>
  <div class="template-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📋 项目管理模板</h1>
      <p>设计和管理项目模板，为不同类型的项目提供标准化的管理框架</p>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <a-card>
        <a-row justify="space-between" align="middle">
          <a-col>
            <a-space>
              <a-button type="primary" @click="createTemplate">
                <PlusOutlined />
                新建模板
              </a-button>
              <a-button @click="importTemplate">
                <ImportOutlined />
                导入模板
              </a-button>
              <a-button @click="exportTemplates">
                <ExportOutlined />
                导出模板
              </a-button>
            </a-space>
          </a-col>
          <a-col>
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索模板..."
              style="width: 300px"
              @search="handleSearch"
            />
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :lg="8" :xl="6" v-for="template in filteredTemplates" :key="template.id">
          <a-card 
            class="template-card"
            :class="{ active: template.isDefault }"
            hoverable
          >
            <!-- 卡片头部 -->
            <template #title>
              <div class="template-header">
                <span class="template-icon">{{ template.icon }}</span>
                <span class="template-name">{{ template.name }}</span>
                <a-tag v-if="template.isDefault" color="blue" size="small">默认</a-tag>
              </div>
            </template>

            <!-- 卡片操作 -->
            <template #extra>
              <a-dropdown>
                <a-button type="text" size="small">
                  <MoreOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="editTemplate(template)">
                      <EditOutlined />
                      编辑模板
                    </a-menu-item>
                    <a-menu-item @click="duplicateTemplate(template)">
                      <CopyOutlined />
                      复制模板
                    </a-menu-item>
                    <a-menu-item @click="setDefaultTemplate(template)" v-if="!template.isDefault">
                      <StarOutlined />
                      设为默认
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item @click="exportTemplate(template)">
                      <DownloadOutlined />
                      导出模板
                    </a-menu-item>
                    <a-menu-item danger @click="deleteTemplate(template)" v-if="!template.isDefault">
                      <DeleteOutlined />
                      删除模板
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>

            <!-- 卡片内容 -->
            <div class="template-content">
              <p class="template-description">{{ template.description }}</p>
              
              <div class="template-meta">
                <div class="meta-item">
                  <span class="meta-label">适用场景：</span>
                  <span class="meta-value">{{ template.category }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">任务节点：</span>
                  <span class="meta-value">{{ template.taskCount }} 个</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">里程碑：</span>
                  <span class="meta-value">{{ template.milestoneCount }} 个</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">使用次数：</span>
                  <span class="meta-value">{{ template.usageCount }}</span>
                </div>
              </div>

              <div class="template-tags">
                <a-tag v-for="tag in template.tags" :key="tag" size="small">{{ tag }}</a-tag>
              </div>
            </div>

            <!-- 卡片底部操作 -->
            <div class="template-actions">
              <a-button type="link" size="small" @click="previewTemplate(template)">
                <EyeOutlined />
                预览结构
              </a-button>
              <a-button type="link" size="small" @click="editTemplate(template)">
                <EditOutlined />
                编辑模板
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 模板编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑项目模板"
      width="1200px"
      :footer="null"
      :destroyOnClose="true"
    >
      <TemplateEditor
        :template="currentTemplate"
        @save="handleTemplateSave"
        @cancel="editModalVisible = false"
      />
    </a-modal>

    <!-- 模板预览弹窗 -->
    <a-modal
      v-model:open="previewModalVisible"
      title="模板结构预览"
      width="800px"
      :footer="null"
    >
      <TemplatePreview :template="currentTemplate" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  MoreOutlined,
  EditOutlined,
  CopyOutlined,
  StarOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import TemplateEditor from './components/TemplateEditor.vue'
import TemplatePreview from './components/TemplatePreview.vue'

// 响应式数据
const searchText = ref('')
const editModalVisible = ref(false)
const previewModalVisible = ref(false)
const currentTemplate = ref(null)

// 模板数据
const templates = ref([
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
    tags: ['开发', '标准', '通用'],
    structure: {
      phases: [
        {
          name: '需求分析阶段',
          tasks: ['需求收集', '需求分析', '需求评审'],
          duration: 10
        },
        {
          name: '设计阶段',
          tasks: ['概要设计', '详细设计', '设计评审'],
          duration: 15
        },
        {
          name: '开发阶段',
          tasks: ['前端开发', '后端开发', '接口联调'],
          duration: 30
        },
        {
          name: '测试阶段',
          tasks: ['单元测试', '集成测试', '系统测试'],
          duration: 15
        },
        {
          name: '上线阶段',
          tasks: ['部署准备', '生产发布', '验证测试'],
          duration: 5
        }
      ],
      milestones: [
        { name: '需求确认', phase: '需求分析阶段' },
        { name: '设计评审', phase: '设计阶段' },
        { name: '开发完成', phase: '开发阶段' },
        { name: '测试通过', phase: '测试阶段' },
        { name: '项目交付', phase: '上线阶段' }
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
    isDefault: false,
    tags: ['敏捷', 'Scrum', '迭代'],
    structure: {
      phases: [
        {
          name: 'Sprint 0 - 项目启动',
          tasks: ['产品愿景', '用户故事梳理', '团队组建'],
          duration: 5
        },
        {
          name: 'Sprint 1',
          tasks: ['Sprint规划', '功能开发', 'Sprint评审'],
          duration: 14
        },
        {
          name: 'Sprint 2',
          tasks: ['Sprint规划', '功能开发', 'Sprint评审'],
          duration: 14
        },
        {
          name: '项目收尾',
          tasks: ['最终测试', '产品发布', '项目回顾'],
          duration: 7
        }
      ],
      milestones: [
        { name: 'Product Backlog就绪', phase: 'Sprint 0 - 项目启动' },
        { name: 'Sprint 1交付', phase: 'Sprint 1' },
        { name: 'Sprint 2交付', phase: 'Sprint 2' },
        { name: '最终发布', phase: '项目收尾' }
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
    isDefault: false,
    tags: ['瀑布', '大型', '严格'],
    structure: {
      phases: [
        {
          name: '项目启动',
          tasks: ['项目章程', '干系人分析', '初步计划'],
          duration: 7
        },
        {
          name: '需求工程',
          tasks: ['需求获取', '需求分析', '需求规格', '需求验证'],
          duration: 20
        },
        {
          name: '系统设计',
          tasks: ['架构设计', '详细设计', '接口设计', '数据库设计'],
          duration: 25
        },
        {
          name: '编码实现',
          tasks: ['编码规范', '模块开发', '代码审查', '单元测试'],
          duration: 40
        },
        {
          name: '系统集成',
          tasks: ['集成计划', '集成测试', '性能测试', '安全测试'],
          duration: 20
        },
        {
          name: '系统测试',
          tasks: ['测试计划', '功能测试', '用户验收', '缺陷修复'],
          duration: 25
        },
        {
          name: '部署维护',
          tasks: ['部署计划', '生产部署', '用户培训', '维护交接'],
          duration: 10
        }
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
    isDefault: false,
    tags: ['科研', '学术', '规范'],
    structure: {
      phases: [
        {
          name: '立项阶段',
          tasks: ['项目申请', '可行性分析', '立项评审'],
          duration: 15
        },
        {
          name: '开题阶段',
          tasks: ['文献调研', '技术路线', '开题报告'],
          duration: 20
        },
        {
          name: '实施阶段',
          tasks: ['实验设计', '数据采集', '阶段性分析'],
          duration: 180
        },
        {
          name: '中期阶段',
          tasks: ['中期检查', '进度汇报', '调整方案'],
          duration: 10
        },
        {
          name: '结题阶段',
          tasks: ['成果整理', '验收材料', '结题答辩'],
          duration: 30
        },
        {
          name: '成果转化',
          tasks: ['论文发表', '专利申请', '技术转移'],
          duration: 60
        }
      ],
      milestones: [
        { name: '立项通过', phase: '立项阶段' },
        { name: '开题完成', phase: '开题阶段' },
        { name: '中期检查', phase: '中期阶段' },
        { name: '阶段性成果', phase: '实施阶段' },
        { name: '项目验收', phase: '结题阶段' },
        { name: '成果发布', phase: '成果转化' }
      ]
    }
  }
])

// 计算属性
const filteredTemplates = computed(() => {
  if (!searchText.value) return templates.value
  return templates.value.filter(template => 
    template.name.includes(searchText.value) ||
    template.description.includes(searchText.value) ||
    template.category.includes(searchText.value) ||
    template.tags.some(tag => tag.includes(searchText.value))
  )
})

// 方法
const handleSearch = (value) => {
  console.log('搜索模板:', value)
}

const createTemplate = () => {
  currentTemplate.value = {
    id: null,
    name: '',
    icon: '📋',
    description: '',
    category: '',
    tags: [],
    isDefault: false,
    structure: {
      phases: [],
      milestones: []
    }
  }
  editModalVisible.value = true
}

const editTemplate = (template) => {
  currentTemplate.value = { ...template }
  editModalVisible.value = true
}

const duplicateTemplate = (template) => {
  const newTemplate = {
    ...template,
    id: Date.now(),
    name: `${template.name} (副本)`,
    isDefault: false,
    usageCount: 0
  }
  templates.value.push(newTemplate)
  message.success('模板复制成功')
}

const setDefaultTemplate = (template) => {
  // 取消当前默认模板
  templates.value.forEach(t => t.isDefault = false)
  // 设置新的默认模板
  template.isDefault = true
  message.success(`已将 "${template.name}" 设为默认模板`)
}

const deleteTemplate = (template) => {
  const index = templates.value.findIndex(t => t.id === template.id)
  if (index > -1) {
    templates.value.splice(index, 1)
    message.success('模板删除成功')
  }
}

const previewTemplate = (template) => {
  currentTemplate.value = template
  previewModalVisible.value = true
}

const exportTemplate = (template) => {
  const dataStr = JSON.stringify(template, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${template.name}.json`
  link.click()
  URL.revokeObjectURL(url)
  message.success('模板导出成功')
}

const exportTemplates = () => {
  const dataStr = JSON.stringify(templates.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'project-templates.json'
  link.click()
  URL.revokeObjectURL(url)
  message.success('所有模板导出成功')
}

const importTemplate = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const templateData = JSON.parse(e.target.result)
          if (Array.isArray(templateData)) {
            templates.value.push(...templateData)
          } else {
            templateData.id = Date.now()
            templates.value.push(templateData)
          }
          message.success('模板导入成功')
        } catch (error) {
          message.error('模板文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const handleTemplateSave = (templateData) => {
  if (templateData.id) {
    // 编辑现有模板
    const index = templates.value.findIndex(t => t.id === templateData.id)
    if (index > -1) {
      templates.value[index] = templateData
    }
  } else {
    // 新建模板
    templateData.id = Date.now()
    templateData.usageCount = 0
    templates.value.push(templateData)
  }
  editModalVisible.value = false
  message.success('模板保存成功')
}

onMounted(() => {
  console.log('项目模板管理页面加载完成')
})
</script>

<style scoped>
.template-management {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.page-header p {
  color: #666;
  margin: 0;
}

.toolbar {
  margin-bottom: 24px;
}

.template-card {
  height: 300px;
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.template-card.active {
  border: 2px solid #1890ff;
}

.template-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-icon {
  font-size: 18px;
}

.template-name {
  font-weight: 600;
  flex: 1;
}

.template-content {
  height: 180px;
  display: flex;
  flex-direction: column;
}

.template-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}

.template-meta {
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.meta-label {
  color: #999;
}

.meta-value {
  color: #333;
  font-weight: 500;
}

.template-tags {
  margin-bottom: 16px;
}

.template-actions {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-management {
    padding: 16px;
  }
  
  .template-card {
    height: auto;
  }
}
</style>