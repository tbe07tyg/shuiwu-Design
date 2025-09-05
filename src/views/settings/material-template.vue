<!--
 * @file 材料提交模板维护页面  
 * @description 统一管理立项申请、项目开题、项目中期、项目验收等各环节所需提交的资料类目和模板
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-22
-->
<template>
  <div class="material-template-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <FileTextOutlined />
          </span>
          材料提交模板维护
        </h1>
        <p class="page-description">
          统一管理各业务环节的资料类目和模板文件，实现配置的集中维护和实时同步
        </p>
      </div>
      <div class="header-actions">
        <a-button @click="handleRefreshConfigs" :loading="loading">
          <ReloadOutlined />
          刷新配置
        </a-button>


        <a-button type="primary" danger @click="handleResetToDefault">
          重置默认
        </a-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <a-row :gutter="16">
        <a-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
          <div class="stat-card pending" @click="handleStatCardClick('apply')">
            <div class="stat-icon">
              <FormOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getBusinessStats('apply') }}</div>
              <div class="stat-label">立项申请类目</div>
              <div class="stat-detail">必传{{ getRequiredStats('apply') }} | 选传{{ getOptionalStats('apply') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
          <div class="stat-card reviewing" @click="handleStatCardClick('opening')">
            <div class="stat-icon">
              <RocketOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getBusinessStats('opening') }}</div>
              <div class="stat-label">项目开题类目</div>
              <div class="stat-detail">必传{{ getRequiredStats('opening') }} | 选传{{ getOptionalStats('opening') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
          <div class="stat-card scheduled" @click="handleStatCardClick('midterm')">
            <div class="stat-icon">
              <PieChartOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getBusinessStats('midterm') }}</div>
              <div class="stat-label">项目中期类目</div>
              <div class="stat-detail">必传{{ getRequiredStats('midterm') }} | 选传{{ getOptionalStats('midterm') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
          <div class="stat-card completed" @click="handleStatCardClick('acceptance')">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getBusinessStats('acceptance') }}</div>
              <div class="stat-label">项目验收类目</div>
              <div class="stat-detail">必传{{ getRequiredStats('acceptance') }} | 选传{{ getOptionalStats('acceptance') }}</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 业务环节标签页 -->
    <div class="content-card">
      <a-tabs 
        v-model:activeKey="activeTab" 
        @change="handleTabChange" 
        class="custom-tabs"
        type="card"
      >
        <a-tab-pane 
          v-for="(label, key) in businessTabs" 
          :key="key" 
          :tab="label"
        >
          <div class="tab-content">
            <div class="toolbar">
              <div class="toolbar-left">
                <a-button type="primary" @click="handleAddCategory">
                  <PlusOutlined />
                  添加新类目
                </a-button>
                <a-button @click="handlePreviewBusinessPage(key)">
                  <EyeOutlined />
                  预览效果
                </a-button>
              </div>
              <div class="toolbar-right">
                <a-input-search
                  v-model:value="searchKeyword"
                  placeholder="搜索类目名称"
                  style="width: 200px"
                  @search="handleSearch"
                />
              </div>
            </div>

            <a-table
              :columns="columns"
              :data-source="getFilteredConfigs(key)"
              :pagination="paginationConfig"
              row-key="id"
              size="middle"
              :loading="loading"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'isRequired'">
                  <a-tag :color="record.isRequired ? 'red' : 'blue'" size="small">
                    {{ record.isRequired ? '必传' : '选传' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'templateFileName'">
                  <div v-if="record.templateFileName" class="template-file">
                    <FileOutlined />
                    <span>{{ record.templateFileName }}</span>
                    <a-button 
                      type="link" 
                      size="small" 
                      @click="handleDownloadTemplate(record)"
                    >
                      下载
                    </a-button>
                  </div>
                  <span v-else class="no-template">暂无模板</span>
                </template>
                <template v-if="column.key === 'action'">
                  <div class="action-buttons">
                    <a-button 
                      type="primary" 
                      size="small" 
                      @click="handleEditCategory(record)"
                    >
                      <EditOutlined />
                      编辑
                    </a-button>
                    <a-button 
                      danger
                      size="small" 
                      @click="handleDeleteCategory(record)"
                    >
                      <DeleteOutlined />
                      删除
                    </a-button>
                  </div>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 添加/编辑类目对话框 -->
    <a-modal 
      v-model:open="dialogVisible" 
      :title="dialogTitle"
      width="700px"
      @cancel="handleDialogClose"
      @ok="handleSaveCategory"
      :confirm-loading="submitLoading"
    >
      <a-form 
        ref="categoryFormRef"
        :model="categoryForm" 
        :rules="categoryRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="类目名称" name="categoryName">
          <a-input 
            v-model:value="categoryForm.categoryName" 
            placeholder="请输入类目名称，如：项目申请书"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="是否必传" name="isRequired">
          <a-radio-group v-model:value="categoryForm.isRequired">
            <a-radio :value="true">必传</a-radio>
            <a-radio :value="false">选传</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="显示顺序" name="sortOrder">
          <a-input-number 
            v-model:value="categoryForm.sortOrder" 
            :min="1" 
            :max="100"
            style="width: 100%"
            placeholder="数字越小排序越靠前"
          />
        </a-form-item>

        <a-form-item label="模板文件">
          <a-upload
            :file-list="templateFileList"
            :before-upload="handleTemplateUpload"
            :remove="handleRemoveTemplate"
            accept=".doc,.docx,.pdf,.xls,.xlsx"
            :max-count="1"
            :show-upload-list="{
              showDownloadIcon: false,
              showPreviewIcon: false,
              showRemoveIcon: true
            }"
          >
            <a-button :loading="templateUploading">
              <UploadOutlined v-if="!templateUploading" />
              {{ templateUploading ? '处理中...' : (templateFileList.length > 0 ? '重新选择' : '选择模板文件') }}
            </a-button>
          </a-upload>
          <div class="upload-tips">
            支持 Word、Excel、PDF 格式，文件大小不超过10MB
            <span v-if="templateFileList.length > 0" class="upload-success">
              ✓ 文件已选择：{{ templateFileList[0].name }}
            </span>
          </div>
        </a-form-item>

        <a-form-item label="描述说明">
          <a-textarea 
            v-model:value="categoryForm.description" 
            :rows="4"
            placeholder="请输入对该类目的详细说明，用于帮助用户理解该材料的用途和要求..."
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 业务页面预览对话框 -->
    <a-modal
      v-model:open="previewVisible"
      :title="`${businessTabs[previewBusinessType]}页面预览`"
      width="90%"
      style="top: 20px"
      :footer="null"
    >
      <MaterialTemplateSync
        v-if="previewVisible"
        :business-type="previewBusinessType"
        :auto-load="true"
        @config-update="handlePreviewConfigUpdate"
      />
    </a-modal>


  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { 
  FileTextOutlined, ReloadOutlined,
  FormOutlined, RocketOutlined, PieChartOutlined, CheckCircleOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, EyeOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import materialTemplateStore from '@/store/materialTemplate'
import MaterialTemplateSync from '@/components/MaterialTemplateSync.vue'

export default {
  name: 'MaterialTemplateManager',
  components: {
    FileTextOutlined, ReloadOutlined,
    FormOutlined, RocketOutlined, PieChartOutlined, CheckCircleOutlined,
    PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, EyeOutlined,
    InboxOutlined, MaterialTemplateSync
  },
  setup() {
    // 响应式数据定义
    const activeTab = ref('apply')
    const dialogVisible = ref(false)
    const previewVisible = ref(false)

    const isEdit = ref(false)
    const searchKeyword = ref('')
    const loading = ref(false)
    const submitLoading = ref(false)

    const previewBusinessType = ref('apply')

    // 业务标签页配置
    const businessTabs = {
      apply: '立项申请',
      opening: '项目开题',
      midterm: '项目中期',
      acceptance: '项目验收'
    }

    // 表单数据
    const categoryForm = reactive({
      id: null,
      categoryName: '',
      isRequired: true,
      sortOrder: 1,
      description: '',
      templateFileName: '',
      templateFilePath: ''
    })

    // 模板文件列表
    const templateFileList = ref([])

    const templateUploading = ref(false)


    // 表单验证规则
    const categoryRules = {
      categoryName: [
        { required: true, message: '请输入类目名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      sortOrder: [
        { required: true, message: '请输入显示顺序', trigger: 'blur' }
      ]
    }

    // 表格列配置
    const columns = [
      {
        title: '序号',
        dataIndex: 'sortOrder',
        key: 'sortOrder',
        width: 80,
        align: 'center',
        sorter: (a, b) => a.sortOrder - b.sortOrder
      },
      {
        title: '类目名称',
        dataIndex: 'categoryName',
        key: 'categoryName',
        width: 200
      },
      {
        title: '必传项',
        dataIndex: 'isRequired',
        key: 'isRequired',
        width: 100,
        align: 'center'
      },
      {
        title: '模板文件',
        dataIndex: 'templateFileName',
        key: 'templateFileName',
        width: 250
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true
      },
      {
        title: '操作',
        key: 'action',
        width: 180,
        align: 'center'
      }
    ]

    // 分页配置
    const paginationConfig = {
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`
    }

    // 计算属性
    const dialogTitle = computed(() => {
      return isEdit.value ? '编辑资料类目' : '添加资料类目'
    })

    // 获取业务环节的统计数据
    const getBusinessStats = (businessType) => {
      const configs = materialTemplateStore.getConfigsByBusinessType(businessType)
      return configs.length
    }

    const getRequiredStats = (businessType) => {
      const configs = materialTemplateStore.getConfigsByBusinessType(businessType)
      return configs.filter(config => config.isRequired).length
    }

    const getOptionalStats = (businessType) => {
      const configs = materialTemplateStore.getConfigsByBusinessType(businessType)
      return configs.filter(config => !config.isRequired).length
    }

    // 获取过滤后的配置数据
    const getFilteredConfigs = (businessType) => {
      const configs = materialTemplateStore.getConfigsByBusinessType(businessType)
      if (!searchKeyword.value) {
        return configs.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      }
      
      return configs
        .filter(config => 
          config.categoryName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          (config.description && config.description.toLowerCase().includes(searchKeyword.value.toLowerCase()))
        )
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    }

    // 刷新配置
    const handleRefreshConfigs = async () => {
      loading.value = true
      try {
        await materialTemplateStore.initConfigs()
        message.success('配置刷新成功')
      } catch (error) {
        message.error('配置刷新失败')
      } finally {
        loading.value = false
      }
    }

    // 统计卡片点击
    const handleStatCardClick = (businessType) => {
      activeTab.value = businessType
    }

    // 标签页切换
    const handleTabChange = (tabKey) => {
      activeTab.value = tabKey
      searchKeyword.value = '' // 清空搜索
    }

    // 搜索处理
    const handleSearch = (value) => {
      searchKeyword.value = value
    }

    // 添加类目
    const handleAddCategory = () => {
      isEdit.value = false
      resetCategoryForm()
      dialogVisible.value = true
    }

    // 编辑类目
    const handleEditCategory = (record) => {
      isEdit.value = true
      Object.assign(categoryForm, record)
      
      // 设置模板文件列表
      if (record.templateFileName) {
        templateFileList.value = [{
          uid: '1',
          name: record.templateFileName,
          status: 'done'
        }]
      } else {
        templateFileList.value = []
      }
      
      dialogVisible.value = true
    }

    // 删除类目
    const handleDeleteCategory = async (record) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除类目"${record.categoryName}"吗？删除后将无法恢复，请谨慎操作！`,
        okText: '确定删除',
        cancelText: '取消',
        okType: 'danger',
        async onOk() {
          try {
            await materialTemplateStore.deleteConfig(activeTab.value, record.id)
          } catch (error) {
            // 错误处理在 store 中已完成
          }
        }
      })
    }

    // 保存类目
    const handleSaveCategory = async () => {
      submitLoading.value = true
      try {
        const formData = { ...categoryForm }
        
        if (isEdit.value) {
          await materialTemplateStore.updateConfig(activeTab.value, formData.id, formData)
        } else {
          await materialTemplateStore.addConfig(activeTab.value, formData)
        }
        
        dialogVisible.value = false
        resetCategoryForm()
      } catch (error) {
        // 错误处理在 store 中已完成
      } finally {
        submitLoading.value = false
      }
    }

    // 重置表单
    const resetCategoryForm = () => {
      const currentConfigs = materialTemplateStore.getConfigsByBusinessType(activeTab.value)
      Object.assign(categoryForm, {
        id: null,
        categoryName: '',
        isRequired: true,
        sortOrder: currentConfigs.length + 1,
        description: '',
        templateFileName: '',
        templateFilePath: ''
      })
      templateFileList.value = []
    }

    // 关闭对话框
    const handleDialogClose = () => {
      resetCategoryForm()
    }

    // 模板文件上传
    const handleTemplateUpload = (file) => {
      // 文件大小验证（10MB限制）
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        message.error('文件大小不能超过10MB')
        return false
      }

      templateUploading.value = true

      // 模拟异步处理
      setTimeout(() => {
        // 更新表单数据
        categoryForm.templateFileName = file.name
        categoryForm.templateFilePath = `/templates/${activeTab.value}/${file.name}`
        
        // 更新文件列表显示
        templateFileList.value = [{
          uid: file.uid || Date.now().toString(),
          name: file.name,
          status: 'done',
          url: categoryForm.templateFilePath,
          originFileObj: file
        }]
        
        templateUploading.value = false
        message.success(`模板文件 "${file.name}" 已选择`)
      }, 200) // 短暂延迟以显示上传状态
      
      return false // 阻止自动上传
    }

    // 移除模板文件
    const handleRemoveTemplate = (file) => {
      categoryForm.templateFileName = ''
      categoryForm.templateFilePath = ''
      templateFileList.value = []
      message.success('模板文件已移除')
      return true // 允许移除
    }

    // 下载模板
    const handleDownloadTemplate = (record) => {
      message.info(`正在下载模板：${record.templateFileName}`)
      // 实际应用中这里应该调用下载API
    }

    // 预览业务页面
    const handlePreviewBusinessPage = (businessType) => {
      previewBusinessType.value = businessType
      previewVisible.value = true
    }

    // 预览配置更新回调
    const handlePreviewConfigUpdate = (configs) => {
      // 预览页面配置更新处理
      console.log('预览页面配置已更新', configs)
    }





    // 重置为默认配置
    const handleResetToDefault = () => {
      Modal.confirm({
        title: '确认重置',
        content: '确定要重置为默认配置吗？当前所有自定义配置将被清空，此操作无法撤销！',
        okText: '确定重置',
        cancelText: '取消',
        okType: 'danger',
        async onOk() {
          await materialTemplateStore.resetToDefault(activeTab.value)
        }
      })
    }

    // 初始化
    onMounted(async () => {
      loading.value = true
      try {
        await materialTemplateStore.initConfigs()
      } finally {
        loading.value = false
      }
    })

    return {
      // 响应式数据
      activeTab,
      dialogVisible,
      previewVisible,

      categoryForm,
      categoryRules,
      searchKeyword,
      columns,
      loading,
      submitLoading,

      businessTabs,
      templateFileList,

      templateUploading,

      paginationConfig,
      previewBusinessType,
      
      // 计算属性
      dialogTitle,
      
      // 方法
      getBusinessStats,
      getRequiredStats,
      getOptionalStats,
      getFilteredConfigs,
      handleRefreshConfigs,
      handleStatCardClick,
      handleTabChange,
      handleSearch,
      handleAddCategory,
      handleEditCategory,
      handleDeleteCategory,
      handleSaveCategory,
      handleDialogClose,
      resetCategoryForm,
      handleTemplateUpload,
      handleRemoveTemplate,
      handleDownloadTemplate,
      handlePreviewBusinessPage,
      handlePreviewConfigUpdate,


      handleResetToDefault
    }
  }
}
</script>

<style scoped>
.material-template-manager {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content h1 {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.title-icon {
  margin-right: 12px;
  font-size: 24px;
  color: #1890ff;
}

.page-description {
  color: #8c8c8c;
  font-size: 14px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-overview {
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card.pending {
  border-left-color: #ff9c6e;
}

.stat-card.reviewing {
  border-left-color: #5b8ff9;
}

.stat-card.scheduled {
  border-left-color: #95de64;
}

.stat-card.completed {
  border-left-color: #36cfc9;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 2px;
}

.stat-detail {
  font-size: 12px;
  color: #bfbfbf;
}

.content-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.tab-content {
  padding: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.template-file {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-template {
  color: #bfbfbf;
  font-style: italic;
}

.upload-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.5;
}

.upload-success {
  display: block;
  margin-top: 4px;
  color: #52c41a;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
