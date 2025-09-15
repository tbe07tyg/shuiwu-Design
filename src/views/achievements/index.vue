<!--
/**
 * @fileoverview 成果管理页面
 * @description 管理项目产出的各类成果，支持分类展示和导出
 * @author AI助手
 * @version 2.0
 * @since 2025-01-17
 */
-->
<template>
  <div class="achievements-management">
    <!-- 页面头部区域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">🏆 成果管理</h1>
        <p class="page-desc">项目研发成果集中管理，支持分类展示和批量导出</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="showAddDialog">
          <PlusOutlined />
          新增成果
        </a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleExport">
              <a-menu-item key="all">
                <DownloadOutlined />
                导出全部成果
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="paper">导出论文成果</a-menu-item>
              <a-menu-item key="ip">导出知识产权成果</a-menu-item>
              <a-menu-item key="application">导出应用成果</a-menu-item>
              <a-menu-item key="platform">导出平台建设成果</a-menu-item>
              <a-menu-item key="other">导出其他成果</a-menu-item>
            </a-menu>
          </template>
          <a-button>
            <DownloadOutlined />
            批量导出
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- 统计概览区域 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="4">
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">总成果数</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card paper">
            <div class="stat-icon">📄</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.paper }}</div>
              <div class="stat-label">论文</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card ip">
            <div class="stat-icon">🔒</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.ip }}</div>
              <div class="stat-label">知识产权</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card application">
            <div class="stat-icon">🚀</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.application }}</div>
              <div class="stat-label">应用</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card platform">
            <div class="stat-icon">🏗️</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.platform }}</div>
              <div class="stat-label">平台建设</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card other">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.other }}</div>
              <div class="stat-label">其他</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="18">
          <a-space size="middle">
            <a-select 
              v-model:value="filters.type" 
              placeholder="全部类型" 
              style="width: 120px"
              @change="handleFilterChange"
            >
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="paper">论文</a-select-option>
              <a-select-option value="ip">知识产权</a-select-option>
              <a-select-option value="application">应用</a-select-option>
              <a-select-option value="platform">平台建设</a-select-option>
              <a-select-option value="other">其他</a-select-option>
            </a-select>

            <a-select 
              v-model:value="filters.project" 
              placeholder="全部项目" 
              style="width: 180px"
              @change="handleFilterChange"
            >
              <a-select-option value="">全部项目</a-select-option>
              <a-select-option value="P001">XXX科研项目</a-select-option>
              <a-select-option value="P002">YYY技术研发项目</a-select-option>
              <a-select-option value="P003">ZZZ创新研究</a-select-option>
            </a-select>

            <a-input-search
              v-model:value="filters.keyword"
              placeholder="搜索成果名称或关键词"
              style="width: 250px"
              @search="handleFilterChange"
              @change="handleFilterChange"
            />
          </a-space>
        </a-col>
        <a-col :span="6">
          <div class="total-count">
            <span>成果总数</span>
            <span class="count-number">{{ filteredAchievements.length }}</span>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 成果表格 -->
    <div class="table-section">
      <a-table
        :columns="columns"
        :data-source="filteredAchievements"
        :pagination="paginationConfig"
        :scroll="{ x: 1400 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeIcon(record.type) }} {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'title'">
            <div class="title-cell">
              <div class="title-text">{{ record.title }}</div>
              <div class="description-text">{{ record.description }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'details'">
            <div class="details-cell">
              <div v-if="record.type === 'paper'">
                <div><strong>期刊:</strong> {{ record.details.journal }}</div>
                <div><strong>年份:</strong> {{ record.details.year }} | <strong>IF:</strong> {{ record.details.impactFactor }}</div>
              </div>
              <div v-else-if="record.type === 'ip'">
                <div><strong>类型:</strong> {{ record.details.ipType }}</div>
                <div><strong>申请号:</strong> {{ record.details.applicationNumber }}</div>
                <div><strong>状态:</strong> <a-tag size="small" :color="record.details.status === '已授权' ? 'green' : 'orange'">{{ record.details.status }}</a-tag></div>
              </div>
              <div v-else-if="record.type === 'application'">
                <div><strong>领域:</strong> {{ record.details.field }}</div>
                <div><strong>规模:</strong> {{ record.details.scale }}</div>
                <div><strong>效益:</strong> {{ record.details.economicBenefit }}</div>
              </div>
              <div v-else-if="record.type === 'platform'">
                <div><strong>类型:</strong> {{ record.details.platformType }}</div>
                <div><strong>服务:</strong> {{ record.details.serviceTarget }}</div>
                <div><strong>用户:</strong> {{ record.details.userScale }}</div>
              </div>
              <div v-else>
                <div><strong>类别:</strong> {{ record.details.category }}</div>
                <div><strong>价值:</strong> {{ record.details.value }}</div>
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'attachments'">
            <div v-if="record.attachments && record.attachments.length > 0" class="attachments-cell">
              <a-tooltip :title="`共${record.attachments.length}个附件`">
                <a-button type="link" size="small" @click="showAttachments(record)">
                  📎 {{ record.attachments.length }}个附件
                </a-button>
              </a-tooltip>
            </div>
            <span v-else class="no-attachments">无附件</span>
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="editAchievement(record)">
                编辑
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="exportSingle(record)">
                      <DownloadOutlined />
                      导出成果
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item @click="deleteAchievement(record)" style="color: #ff4d4f">
                      <DeleteOutlined />
                      删除成果
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  更多 <DownOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑成果弹窗 -->
    <a-modal
      v-model:open="addDialogVisible"
      :title="editingAchievement ? '编辑成果' : '新增成果'"
      width="800px"
      :maskClosable="false"
      @ok="handleSave"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="成果名称" name="title">
              <a-input v-model:value="formData.title" placeholder="请输入成果名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="成果类型" name="type">
              <a-select v-model:value="formData.type" placeholder="请选择成果类型" @change="handleTypeChange">
                <a-select-option value="paper">📄 论文</a-select-option>
                <a-select-option value="ip">🔒 知识产权</a-select-option>
                <a-select-option value="application">🚀 应用</a-select-option>
                <a-select-option value="platform">🏗️ 平台建设</a-select-option>
                <a-select-option value="other">📦 其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属项目" name="projectId">
              <a-select v-model:value="formData.projectId" placeholder="请选择项目">
                <a-select-option value="P001">XXX科研项目</a-select-option>
                <a-select-option value="P002">YYY技术研发项目</a-select-option>
                <a-select-option value="P003">ZZZ创新研究</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="完成时间" name="completionDate">
              <a-date-picker v-model:value="formData.completionDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="成果描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            placeholder="请详细描述成果内容和价值"
            :rows="3"
          />
        </a-form-item>

        <!-- 动态详情字段 -->
        <div v-if="formData.type === 'paper'">
          <a-divider>论文详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="期刊名称">
                <a-input v-model:value="formData.details.journal" placeholder="发表期刊" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="发表年份">
                <a-input-number v-model:value="formData.details.year" :min="1900" :max="2030" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="影响因子">
                <a-input-number v-model:value="formData.details.impactFactor" :precision="2" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="formData.type === 'ip'">
          <a-divider>知识产权详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="知识产权类型">
                <a-select v-model:value="formData.details.ipType" placeholder="请选择类型">
                  <a-select-option value="发明专利">发明专利</a-select-option>
                  <a-select-option value="实用新型">实用新型</a-select-option>
                  <a-select-option value="外观设计">外观设计</a-select-option>
                  <a-select-option value="软件著作权">软件著作权</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="申请号">
                <a-input v-model:value="formData.details.applicationNumber" placeholder="专利申请号" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="授权状态">
                <a-select v-model:value="formData.details.status" placeholder="请选择状态">
                  <a-select-option value="已授权">已授权</a-select-option>
                  <a-select-option value="审查中">审查中</a-select-option>
                  <a-select-option value="已申请">已申请</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="formData.type === 'application'">
          <a-divider>应用详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="应用领域">
                <a-input v-model:value="formData.details.field" placeholder="应用的具体领域" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="应用规模">
                <a-input v-model:value="formData.details.scale" placeholder="应用的规模范围" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="经济效益">
                <a-input v-model:value="formData.details.economicBenefit" placeholder="带来的经济价值" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="formData.type === 'platform'">
          <a-divider>平台建设详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="平台类型">
                <a-input v-model:value="formData.details.platformType" placeholder="平台的分类" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="服务对象">
                <a-input v-model:value="formData.details.serviceTarget" placeholder="服务的目标群体" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="用户规模">
                <a-input v-model:value="formData.details.userScale" placeholder="平台用户数量" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="formData.type === 'other'">
          <a-divider>其他成果详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="成果类别">
                <a-input v-model:value="formData.details.category" placeholder="具体分类" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="应用价值">
                <a-input v-model:value="formData.details.value" placeholder="实际应用价值" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <a-form-item label="相关附件">
          <a-upload
            v-model:file-list="formData.attachments"
            :before-upload="beforeUpload"
            multiple
          >
            <a-button>
              <UploadOutlined />
              选择文件
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 附件查看弹窗 -->
    <a-modal
      v-model:open="attachmentsModalVisible"
      title="附件列表"
      width="600px"
      :footer="null"
    >
      <div v-if="selectedAchievement && selectedAchievement.attachments" class="attachments-list">
        <div 
          v-for="attachment in selectedAchievement.attachments" 
          :key="attachment.id"
          class="attachment-item"
        >
          <FileOutlined />
          <span class="attachment-name">{{ attachment.name }}</span>
          <span class="attachment-size">({{ attachment.size }})</span>
          <a-button type="link" size="small" @click="downloadAttachment(attachment)">
            下载
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 成果详情查看弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="`🏆 成果详情 - ${selectedAchievement?.title || ''}`"
      width="1000px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="selectedAchievement" class="detail-modal">
        <!-- 基本信息区域 -->
        <div class="detail-section">
          <h4><FileSearchOutlined /> 基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="成果名称" :span="2">
              <div class="title-with-type">
                <span class="achievement-title">{{ selectedAchievement.title }}</span>
                <a-tag :color="getTypeColor(selectedAchievement.type)" class="type-tag">
                  {{ getTypeIcon(selectedAchievement.type) }} {{ getTypeText(selectedAchievement.type) }}
                </a-tag>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="所属项目">
              {{ selectedAchievement.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="负责人">
              {{ selectedAchievement.responsible }}
            </a-descriptions-item>
            <a-descriptions-item label="完成时间">
              {{ selectedAchievement.completionDate }}
            </a-descriptions-item>
            <a-descriptions-item label="成果编号">
              {{ selectedAchievement.id }}
            </a-descriptions-item>
            <a-descriptions-item label="成果描述" :span="2">
              <div class="description-content">{{ selectedAchievement.description }}</div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 成果详情区域（根据类型动态显示） -->
        <div class="detail-section">
          <h4><InfoCircleOutlined /> 详细信息</h4>
          
          <!-- 论文类型详情 -->
          <div v-if="selectedAchievement.type === 'paper'">
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="发表期刊">
                {{ selectedAchievement.details.journal }}
              </a-descriptions-item>
              <a-descriptions-item label="发表年份">
                {{ selectedAchievement.details.year }}
              </a-descriptions-item>
              <a-descriptions-item label="影响因子">
                <a-tag color="blue">IF: {{ selectedAchievement.details.impactFactor }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="论文状态">
                <a-tag color="green">已发表</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 知识产权类型详情 -->
          <div v-else-if="selectedAchievement.type === 'ip'">
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="知识产权类型">
                {{ selectedAchievement.details.ipType }}
              </a-descriptions-item>
              <a-descriptions-item label="申请号">
                {{ selectedAchievement.details.applicationNumber }}
              </a-descriptions-item>
              <a-descriptions-item label="授权状态">
                <a-tag :color="selectedAchievement.details.status === '已授权' ? 'green' : 'orange'">
                  {{ selectedAchievement.details.status }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="申请时间">
                {{ selectedAchievement.completionDate }}
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 应用成果类型详情 -->
          <div v-else-if="selectedAchievement.type === 'application'">
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="应用领域">
                {{ selectedAchievement.details.field }}
              </a-descriptions-item>
              <a-descriptions-item label="应用规模">
                {{ selectedAchievement.details.scale }}
              </a-descriptions-item>
              <a-descriptions-item label="经济效益" :span="2">
                <a-tag color="green">{{ selectedAchievement.details.economicBenefit }}</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 平台建设类型详情 -->
          <div v-else-if="selectedAchievement.type === 'platform'">
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="平台类型">
                {{ selectedAchievement.details.platformType }}
              </a-descriptions-item>
              <a-descriptions-item label="服务对象">
                {{ selectedAchievement.details.serviceTarget }}
              </a-descriptions-item>
              <a-descriptions-item label="用户规模">
                {{ selectedAchievement.details.userScale }}
              </a-descriptions-item>
              <a-descriptions-item label="技术架构">
                分布式云平台
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 其他成果类型详情 -->
          <div v-else>
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="成果类别">
                {{ selectedAchievement.details.category }}
              </a-descriptions-item>
              <a-descriptions-item label="应用价值">
                {{ selectedAchievement.details.value }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </div>

        <!-- 附件列表区域 -->
        <div v-if="selectedAchievement.attachments && selectedAchievement.attachments.length > 0" class="detail-section">
          <h4><PaperClipOutlined /> 相关附件 ({{ selectedAchievement.attachments.length }}个)</h4>
          <div class="attachments-grid">
            <div 
              v-for="attachment in selectedAchievement.attachments" 
              :key="attachment.id"
              class="attachment-card"
            >
              <div class="attachment-icon">
                <FileOutlined />
              </div>
              <div class="attachment-info">
                <div class="attachment-name">{{ attachment.name }}</div>
                <div class="attachment-size">{{ attachment.size }}</div>
              </div>
              <div class="attachment-actions">
                <a-button type="link" size="small" @click="downloadAttachment(attachment)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="detail-actions">
          <a-space>
            <a-button type="primary" @click="editAchievement(selectedAchievement)">
              <EditOutlined />
              编辑成果
            </a-button>
            <a-button @click="exportSingle(selectedAchievement)">
              <DownloadOutlined />
              导出成果
            </a-button>
            <a-button @click="handleDetailCancel">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  DownloadOutlined,
  DownOutlined,
  SearchOutlined,
  FileOutlined,
  UploadOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  PaperClipOutlined,
  EditOutlined
} from '@ant-design/icons-vue'

/**
 * 响应式数据
 */
// 筛选条件
const filters = reactive({
  type: '',
  project: '',
  keyword: ''
})

// 弹窗状态
const addDialogVisible = ref(false)
const attachmentsModalVisible = ref(false)
const detailModalVisible = ref(false)
const editingAchievement = ref(null)
const selectedAchievement = ref(null)

// 表单数据
const formData = reactive({
  title: '',
  type: '',
  projectId: '',
  completionDate: null,
  description: '',
  details: {},
  attachments: []
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入成果名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择成果类型', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  completionDate: [{ required: true, message: '请选择完成时间', trigger: 'change' }],
  description: [{ required: true, message: '请输入成果描述', trigger: 'blur' }]
}

// 表格列配置
const columns = [
  {
    title: '成果类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    fixed: 'left'
  },
  {
    title: '成果名称',
    dataIndex: 'title',
    key: 'title',
    width: 300,
    ellipsis: true
  },
  {
    title: '所属项目',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 150,
    ellipsis: true
  },
  {
    title: '负责人',
    dataIndex: 'responsible',
    key: 'responsible',
    width: 100
  },
  {
    title: '完成时间',
    dataIndex: 'completionDate',
    key: 'completionDate',
    width: 120
  },
  {
    title: '成果详情',
    key: 'details',
    width: 250
  },
  {
    title: '附件',
    key: 'attachments',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 分页配置
const paginationConfig = {
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
}

// 成果数据
const achievements = ref([
  {
    id: 'ACH001',
    title: '智能水质监测算法优化研究',
    type: 'paper',
    projectId: 'P001',
    projectName: 'XXX科研项目',
    responsible: '张教授',
    completionDate: '2024-03-15',
    description: '针对水质监测中的数据噪声问题，提出了基于深度学习的智能优化算法，显著提升了监测精度。',
    details: {
      journal: '环境科学学报',
      year: 2024,
      impactFactor: 3.2
    },
    attachments: [
      { id: 'att1', name: '论文全文.pdf', size: '2.1MB' },
      { id: 'att2', name: '实验数据.xlsx', size: '856KB' }
    ]
  },
  {
    id: 'ACH002',
    title: '水质监测传感器优化设计',
    type: 'ip',
    projectId: 'P001',
    projectName: 'XXX科研项目',
    responsible: '李博士',
    completionDate: '2024-02-20',
    description: '设计了一种新型的水质监测传感器，具有高精度、低功耗的特点，已申请发明专利。',
    details: {
      ipType: '发明专利',
      applicationNumber: 'CN202410123456',
      status: '审查中'
    },
    attachments: [
      { id: 'att3', name: '专利申请书.pdf', size: '1.5MB' }
    ]
  },
  {
    id: 'ACH003',
    title: '智能水质监测系统',
    type: 'application',
    projectId: 'P001',
    projectName: 'XXX科研项目',
    responsible: '王研究员',
    completionDate: '2024-04-10',
    description: '基于研发的算法和传感器，构建了完整的智能水质监测系统，已在多个水厂投入使用。',
    details: {
      field: '环境监测',
      scale: '覆盖5个水厂',
      economicBenefit: '年节省成本200万元'
    },
    attachments: [
      { id: 'att4', name: '系统部署报告.pdf', size: '3.2MB' },
      { id: 'att5', name: '用户使用手册.pdf', size: '1.8MB' }
    ]
  }
])

// 统计数据
const statistics = computed(() => {
  const stats = {
    total: achievements.value.length,
    paper: 0,
    ip: 0,
    application: 0,
    platform: 0,
    other: 0
  }
  
  achievements.value.forEach(achievement => {
    stats[achievement.type]++
  })
  
  return stats
})

// 筛选后的成果列表
const filteredAchievements = computed(() => {
  let result = achievements.value
  
  if (filters.type) {
    result = result.filter(item => item.type === filters.type)
  }
  
  if (filters.project) {
    result = result.filter(item => item.projectId === filters.project)
  }
  
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }
  
  paginationConfig.total = result.length
  return result
})

/**
 * 工具函数
 */
const getTypeIcon = (type) => {
  const icons = {
    paper: '📄',
    ip: '🔒',
    application: '🚀',
    platform: '🏗️',
    other: '📦'
  }
  return icons[type] || '📦'
}

const getTypeColor = (type) => {
  const colors = {
    paper: 'blue',
    ip: 'purple',
    application: 'green',
    platform: 'orange',
    other: 'gray'
  }
  return colors[type] || 'gray'
}

const getTypeText = (type) => {
  const texts = {
    paper: '论文',
    ip: '知识产权',
    application: '应用',
    platform: '平台建设',
    other: '其他'
  }
  return texts[type] || '其他'
}

/**
 * 事件处理函数
 */
const handleFilterChange = () => {
  // 筛选变化时重置分页
  paginationConfig.current = 1
}

const handleTableChange = (pagination) => {
  paginationConfig.current = pagination.current
  paginationConfig.pageSize = pagination.pageSize
}

const handleExport = ({ key }) => {
  const typeNames = {
    all: '全部',
    paper: '论文',
    ip: '知识产权',
    application: '应用',
    platform: '平台建设',
    other: '其他'
  }
  message.success(`正在导出${typeNames[key]}成果...`)
}

const showAddDialog = () => {
  editingAchievement.value = null
  resetFormData()
  addDialogVisible.value = true
}

const viewDetail = (achievement) => {
  selectedAchievement.value = achievement
  detailModalVisible.value = true
}

const editAchievement = (achievement) => {
  editingAchievement.value = achievement
  // 填充表单数据
  Object.assign(formData, {
    ...achievement,
    completionDate: achievement.completionDate ? dayjs(achievement.completionDate) : null
  })
  addDialogVisible.value = true
}

const deleteAchievement = (achievement) => {
  message.success(`删除成果: ${achievement.title}`)
}

const exportSingle = (achievement) => {
  message.success(`导出成果: ${achievement.title}`)
}

const showAttachments = (achievement) => {
  selectedAchievement.value = achievement
  attachmentsModalVisible.value = true
}

const downloadAttachment = (attachment) => {
  message.success(`下载附件: ${attachment.name}`)
}

const handleTypeChange = () => {
  // 切换类型时重置详情数据
  formData.details = {}
}

const handleSave = () => {
  message.success('保存成功!')
  addDialogVisible.value = false
  resetFormData()
}

const handleCancel = () => {
  addDialogVisible.value = false
  resetFormData()
}

const resetFormData = () => {
  editingAchievement.value = null
  Object.assign(formData, {
    title: '',
    type: '',
    projectId: '',
    completionDate: null,
    description: '',
    details: {},
    attachments: []
  })
}

const beforeUpload = () => {
  return false // 阻止自动上传
}

const handleDetailCancel = () => {
  detailModalVisible.value = false
  selectedAchievement.value = null
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.achievements-management {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  color: #234fa2;
  margin: 0 0 8px 0;
}

.page-desc {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 28px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.stat-card.total .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card.paper .stat-icon { background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); }
.stat-card.ip .stat-icon { background: linear-gradient(135deg, #722ed1 0%, #531dab 100%); }
.stat-card.application .stat-icon { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); }
.stat-card.platform .stat-icon { background: linear-gradient(135deg, #fa8c16 0%, #d46b08 100%); }
.stat-card.other .stat-icon { background: linear-gradient(135deg, #8c8c8c 0%, #595959 100%); }

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.total-count {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.count-number {
  font-size: 18px;
  font-weight: bold;
  color: #234fa2;
}

.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.title-cell {
  max-width: 280px;
}

.title-text {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.description-text {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.details-cell {
  font-size: 12px;
  line-height: 1.5;
}

.details-cell > div {
  margin-bottom: 2px;
}

.attachments-cell {
  text-align: center;
}

.no-attachments {
  color: #ccc;
  font-size: 12px;
}

.attachments-list {
  max-height: 400px;
  overflow-y: auto;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 8px;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.attachment-size {
  font-size: 12px;
  color: #999;
}

/* 详情弹窗样式 */
.detail-modal {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-with-type {
  display: flex;
  align-items: center;
  gap: 12px;
}

.achievement-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.type-tag {
  font-size: 12px;
}

.description-content {
  line-height: 1.6;
  color: #666;
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.attachment-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.attachment-card:hover {
  border-color: #234fa2;
  box-shadow: 0 2px 8px rgba(35, 79, 162, 0.1);
}

.attachment-icon {
  font-size: 20px;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 6px;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.4;
}

.attachment-size {
  font-size: 12px;
  color: #999;
}

.attachment-actions {
  flex-shrink: 0;
}

.detail-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}
</style> 