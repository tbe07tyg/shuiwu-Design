<!--
/**
 * @fileoverview 调研记录页面
 * @description 展示调研过程和结果，支持快速添加调研事项
 * @author AI助手
 * @version 2.0
 * @since 2025-01-17
 */
-->
<template>
  <PageContainer title="📊 调研记录" description="项目调研全过程记录，追踪进度查看结果">
    <!-- 操作按钮区域 -->
    <template #actions>
      <a-button type="primary" @click="showAddRecordDialog">
        <PlusOutlined />
        新建调研记录
      </a-button>
      <a-button type="primary" ghost>
        <DownloadOutlined />
        📊 导出记录
      </a-button>
    </template>

    <!-- 筛选统计区域 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="filter-row">
          <span class="filter-label">状态:</span>
          <a-select 
            v-model:value="filters.status" 
            placeholder="全部状态" 
            allow-clear 
            style="width: 120px;"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="active">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="paused">已暂停</a-select-option>
            <a-select-option value="terminated">已终止</a-select-option>
          </a-select>

          <span class="filter-label">来源:</span>
          <a-select 
            v-model:value="filters.source" 
            placeholder="全部来源" 
            allow-clear 
            style="width: 120px;"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="requirement">需求池</a-select-option>
            <a-select-option value="external">外部委托</a-select-option>
            <a-select-option value="internal">内部发起</a-select-option>
          </a-select>

          <span class="filter-label">搜索:</span>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目名称或关键词"
            style="width: 300px;"
            allow-clear
            @search="handleFilterChange"
            @change="handleFilterChange"
          >
            <template #suffix>
              <SearchOutlined />
            </template>
          </a-input-search>
        </div>
      </div>

      <div class="stats-overview">
        📊 统计概览: 总计{{ statistics.total }}个 | 进行中{{ statistics.active }}个 | 已完成{{ statistics.completed }}个 | 暂停{{ statistics.paused }}个 | 已终止{{ statistics.terminated }}个
      </div>
    </div>

    <!-- 调研记录列表区域 -->
    <div class="records-list">
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        class="record-card"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="card-title">
            <span class="record-icon">🔍</span>
            <span class="record-name">{{ record.title }}</span>
            <a-tag
              :color="getStatusTagColor(record.status)"
              class="status-tag"
            >
              {{ getStatusIcon(record.status) }} {{ getStatusText(record.status) }}
            </a-tag>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="card-info">
          <span class="info-item">
            📅 {{ record.startDate }} → {{ record.status === 'completed' ? record.endDate : `预计${record.expectedEndDate}` }}
          </span>
          <span class="info-item">
            👤 {{ record.responsible }}({{ record.department }})
          </span>
        </div>

        <!-- 调研目的标签区域 -->
        <div class="content-section">
          <div class="section-title">🎯 调研目的:</div>
          <div class="section-content">
            <div class="purpose-tags">
              <a-tag v-for="purpose in record.stages" :key="purpose" color="blue" style="margin-right: 8px; margin-bottom: 4px;">
                {{ getPurposeText(purpose) }}
              </a-tag>
            </div>
          </div>
        </div>

        <!-- 事项记录时间轴区域 -->
        <div class="content-section">
          <div class="section-title">📝 事项记录:</div>
          <div class="section-content">
            <a-timeline mode="left">
              <a-timeline-item v-for="item in getRecentItems(record)" :key="item.id" color="blue">
                <div class="item-content">
                  <div class="item-header">
                    <span class="item-time">{{ item.time }}</span>
                    <span class="item-user">{{ item.user }}</span>
                  </div>
                  <div class="item-desc">{{ item.content }}</div>
                  <!-- 附件支持 -->
                  <div v-if="item.attachments && item.attachments.length > 0" class="item-attachments">
                    <div class="attachment-label">📎 附件：</div>
                    <div class="attachment-list">
                      <a 
                        v-for="attachment in item.attachments" 
                        :key="attachment.id"
                        @click="downloadAttachment(attachment)"
                        class="attachment-link"
                      >
                        {{ attachment.name }}
                      </a>
                    </div>
                  </div>
                </div>
              </a-timeline-item>
              <a-timeline-item v-if="record.items && record.items.length > 3" color="gray">
                <a @click="showRecordDetail(record.id)">查看更多事项…</a>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions">
          <a-button size="small" type="primary" @click="showRecordDetail(record.id)">📋 查看详情</a-button>
          
          <!-- 所有状态都可以更新状态（除已终止） -->
          <a-button v-if="record.status !== 'terminated'" size="small" @click="showUpdateProgress(record.id)">📝 更新状态</a-button>
          

          
          <!-- 除已终止外都可以添加事项 -->
          <a-button 
            v-if="record.status !== 'terminated'" 
            size="small" 
            type="link"
            @click="showAddItemDialog(record.id)"
            class="add-item-action"
          >
            ➕ 添加调研事项
          </a-button>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <a-pagination
          v-model:current="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-size-options="['10', '20', '50']"
          show-size-changer
          show-quick-jumper
          show-total
          @change="handleCurrentChange"
          @show-size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 新建调研记录弹窗 -->
    <a-modal
      v-model:open="addRecordDialog.visible"
      title="➕ 新建调研记录"
      width="700px"
      @cancel="handleCloseAddRecordDialog"
      @ok="handleAddRecord"
    >
      <a-form :model="addRecordForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="调研标题" required>
          <a-input
            v-model:value="addRecordForm.title"
            placeholder="请输入调研项目标题，如：REQ001-智能水质监测系统调研"
            :maxlength="100"
            show-count
          />
        </a-form-item>

        <a-form-item label="需求来源">
          <a-radio-group v-model:value="addRecordForm.sourceType" @change="handleSourceTypeChange">
            <a-radio value="requirement">需求池</a-radio>
            <a-radio value="internal">内部发起</a-radio>
            <a-radio value="external">外部委托</a-radio>
          </a-radio-group>
          
          <div style="margin-top: 12px;">
            <!-- 需求池选择 -->
            <a-select
              v-if="addRecordForm.sourceType === 'requirement'"
              v-model:value="addRecordForm.sourceRequirement"
              placeholder="请选择需求池中的需求"
              style="width: 100%;"
              show-search
              :filter-option="false"
              @search="handleRequirementSearch"
            >
              <a-select-option 
                v-for="req in filteredRequirements" 
                :key="req.id" 
                :value="req.id"
              >
                <div class="requirement-option">
                  <span class="req-title">{{ req.title }}</span>
                  <span class="req-category">{{ req.category }}</span>
                </div>
              </a-select-option>
            </a-select>
            
            <!-- 手动填写来源 -->
            <a-input
              v-else
              v-model:value="addRecordForm.sourceDescription"
              :placeholder="addRecordForm.sourceType === 'internal' ? '请填写内部发起部门或人员' : '请填写外部委托单位或项目'"
              :maxlength="100"
              show-count
            />
          </div>
        </a-form-item>

      <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="负责人" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-select v-model:value="addRecordForm.responsible">
                <a-select-option value="张三">张三</a-select-option>
                <a-select-option value="李四">李四</a-select-option>
                <a-select-option value="王五">王五</a-select-option>
                <a-select-option value="赵六">赵六</a-select-option>
              </a-select>
            </a-form-item>
        </a-col>
          <a-col :span="12">
            <a-form-item label="所属部门" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-select v-model:value="addRecordForm.department">
                <a-select-option value="技术部">技术部</a-select-option>
                <a-select-option value="工艺部">工艺部</a-select-option>
                <a-select-option value="运维部">运维部</a-select-option>
                <a-select-option value="市场部">市场部</a-select-option>
              </a-select>
            </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-date-picker
                v-model:value="addRecordForm.startDate"
                placeholder="选择开始时间"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="预计完成" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-date-picker
                v-model:value="addRecordForm.expectedEndDate"
                placeholder="选择预计完成时间"
                style="width: 100%;"
              />
            </a-form-item>
        </a-col>
      </a-row>

        <a-form-item label="调研阶段" required>
          <div class="stage-selection">
            <p class="stage-tip">💡 可自由组合选择调研阶段，支持单选或多选：</p>
            <a-checkbox-group v-model:value="addRecordForm.stages" class="stage-checkboxes">
              <a-row :gutter="[16, 16]">
                <a-col :span="8">
                  <a-checkbox value="analysis" class="stage-checkbox">
                    <span class="stage-icon">📋</span>
                    <span class="stage-text">需求分析</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="technical" class="stage-checkbox">
                    <span class="stage-icon">🔍</span>
                    <span class="stage-text">技术调研</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="design" class="stage-checkbox">
                    <span class="stage-icon">📐</span>
                    <span class="stage-text">方案设计</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="cost" class="stage-checkbox">
                    <span class="stage-icon">💰</span>
                    <span class="stage-text">成本评估</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="risk" class="stage-checkbox">
                    <span class="stage-icon">⚠️</span>
                    <span class="stage-text">风险分析</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="market" class="stage-checkbox">
                    <span class="stage-icon">📈</span>
                    <span class="stage-text">市场调研</span>
                  </a-checkbox>
        </a-col>
      </a-row>
            </a-checkbox-group>
      </div>
        </a-form-item>

        <a-form-item label="优先级">
          <a-radio-group v-model:value="addRecordForm.priority">
            <a-radio value="high">🔴 高优先级</a-radio>
            <a-radio value="medium">🟡 中优先级</a-radio>
            <a-radio value="low">🟢 低优先级</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="调研描述">
          <a-textarea
            v-model:value="addRecordForm.description"
            placeholder="请简要描述调研目标、背景和预期成果..."
            :rows="3"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加调研事项弹窗 -->
    <a-modal
      v-model:open="addItemDialog.visible"
      title="➕ 添加调研事项"
      width="600px"
      @cancel="handleCloseAddDialog"
      @ok="handleAddItem"
    >
      <a-form :model="addItemForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="事项内容" required>
          <a-textarea
            v-model:value="addItemForm.content"
            :rows="3"
            placeholder="请简要描述调研事项内容..."
            :maxlength="200"
            show-count
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="日期" required>
              <a-date-picker 
                v-model:value="addItemForm.date" 
                placeholder="选择日期"
                style="width: 100%;"
                :disabled-date="disabledDate"
                format="YYYY-MM-DD"
              />
        </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="时刻">
              <a-time-picker 
                v-model:value="addItemForm.time" 
                placeholder="选择时刻(可选)"
                style="width: 100%;"
                format="HH:mm"
                :minute-step="15"
                allow-clear
              />
        </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="负责人">
              <a-select v-model:value="addItemForm.responsible">
                <a-select-option value="张三">张三</a-select-option>
                <a-select-option value="李四">李四</a-select-option>
                <a-select-option value="王五">王五</a-select-option>
          </a-select>
        </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="事项类型">
          <a-radio-group v-model:value="addItemForm.type">
            <a-radio value="analysis">需求分析</a-radio>
            <a-radio value="technical">技术调研</a-radio>
            <a-radio value="design">方案设计</a-radio>
            <a-radio value="cost">成本评估</a-radio>
            <a-radio value="risk">风险分析</a-radio>
            <a-radio value="market">市场调研</a-radio>
            <a-radio value="other">其他</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="关联文档">
          <a-upload
            v-model:file-list="addItemForm.attachments"
            :multiple="true"
            :show-upload-list="true"
            :before-upload="beforeUpload"
          >
            <a-button>
              <UploadOutlined />
              📎 上传文件 (支持 PDF、Word、Excel、图片)
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 更新状态弹窗 -->
    <a-modal
      v-model:open="updateDialog.visible"
      title="📝 更新调研状态"
      width="500px"
      @cancel="handleCloseUpdateDialog"
      @ok="handleUpdateStatus"
    >
      <a-form :model="updateForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="调研状态" required>
          <a-radio-group v-model:value="updateForm.status">
            <a-radio value="active">进行中</a-radio>
            <a-radio value="completed">已完成</a-radio>
            <a-radio value="paused">已暂停</a-radio>
            <a-radio value="terminated">已终止</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model:value="updateForm.remark"
            :rows="3"
            placeholder="如有说明请填写..."
            :maxlength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="detailDialog.visible"
      title="📋 调研详情"
      width="700px"
      @cancel="detailDialog.visible = false"
      :footer="null"
    >
      <div v-if="detailDialog.record">
        <h3>{{ detailDialog.record.title }}</h3>
        <div class="purpose-tags" style="margin-bottom: 16px;">
          <a-tag v-for="purpose in detailDialog.record.stages" :key="purpose" color="blue" style="margin-right: 8px;">
            {{ getPurposeText(purpose) }}
          </a-tag>
        </div>
        <a-timeline mode="left">
          <a-timeline-item v-for="item in getAllItems(detailDialog.record)" :key="item.id">
            <div class="item-content">
              <span class="item-time">{{ item.time }}</span>
              <span class="item-user">{{ item.user }}</span>
              <span class="item-status">{{ getStatusText(item.status) }}</span>
              <div class="item-desc">{{ item.content }}</div>
        </div>
          </a-timeline-item>
        </a-timeline>
        </div>
    </a-modal>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer.vue'
import {
  DownloadOutlined,
  SearchOutlined,
  UploadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'

/**
 * 响应式数据
 */
// 筛选条件
const filters = reactive({
  status: '',
  source: '',
  keyword: ''
})

// 先定义数据，再定义计算属性

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 快速添加表单
const quickAddForm = reactive({
  content: '',
  planDate: 'today',
  duration: '1d'
})

// 新建调研记录弹窗
const addRecordDialog = reactive({
  visible: false
})

const addRecordForm = reactive({
  title: '',
  responsible: '张三',
  department: '技术部',
  startDate: null,
  expectedEndDate: null,
  stages: ['analysis', 'technical'], // 默认选择需求分析和技术调研
  description: '',
  priority: 'medium',
  sourceType: 'requirement', // 默认选择需求池
  sourceRequirement: '', // 选择的需求ID
  sourceDescription: '' // 手动填写的来源描述
})

// 需求池数据（模拟数据）
const requirementPool = ref([
  {
    id: 'REQ001',
    title: '智能水质监测系统需求',
    category: '技术改进',
    proposerDepartment: '技术部',
    status: 'approved'
  },
  {
    id: 'REQ002', 
    title: '污水处理工艺优化需求',
    category: '工艺升级',
    proposerDepartment: '工艺部',
    status: 'approved'
  },
  {
    id: 'REQ003',
    title: '管网漏损检测设备采购需求',
    category: '设备采购',
    proposerDepartment: '运维部',
    status: 'approved'
  },
  {
    id: 'REQ004',
    title: '运营管理系统数字化改造',
    category: '系统升级',
    proposerDepartment: '管理部',
    status: 'pending'
  },
  {
    id: 'REQ005',
    title: '节能减排技术应用研究',
    category: '技术研发',
    proposerDepartment: '技术部',
    status: 'approved'
  }
])

// 筛选后的需求列表
const filteredRequirements = ref([...requirementPool.value])

// 添加事项弹窗
const addItemDialog = reactive({
  visible: false,
  recordId: null
})

const addItemForm = reactive({
  content: '',
  date: null,
  time: null,
  responsible: '张三',
  type: 'other',
  attachments: []
})

// 更新状态弹窗
const updateDialog = reactive({
  visible: false,
  recordId: null
})

const updateForm = reactive({
  status: 'active',
  remark: ''
})

// 详情弹窗
const detailDialog = reactive({
  visible: false,
  record: null
})

// 调研记录数据
const researchRecords = ref([
  // 新增测试数据，较新的创建时间
  {
    id: 'R2024004',
    title: 'REQ004-运营管理系统数字化改造调研',
    responsible: '赵六',
    department: '管理部',
    status: 'active',
    startDate: '2024-02-01',
    expectedEndDate: '2024-03-15',
    progress: 25,
    currentStage: '需求分析',
    latestUpdate: '需求梳理中，已完成业务流程调研',
    nextMilestone: '2024-02-10 完成需求分析',
    showQuickAdd: false,
    sourceType: 'internal',
    sourceDescription: '管理部内部提出的数字化改造需求',
    createTime: '2024-02-01T08:00:00.000Z',
    updateTime: '2024-02-03T14:30:00.000Z',
    stages: ['analysis', 'technical', 'design'],
    items: [
      {
        id: 'item1',
        content: '完成业务流程调研和需求梳理',
        user: '赵六',
        time: '2024-02-03T14:30:00.000Z',
        status: 'completed'
      },
      {
        id: 'item2',
        content: '启动数字化改造调研项目',
        user: '赵六',
        time: '2024-02-01T08:00:00.000Z',
        status: 'active'
      }
    ]
  },
  {
    id: 'R2024001',
    title: 'REQ001-智能水质监测系统调研',
    responsible: '张三',
    department: '技术部',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    expectedEndDate: '2024-02-15',
    progress: 100,
    showQuickAdd: false,
    sourceType: 'requirement',
    sourceId: 'REQ001',
    sourceTitle: '智能水质监测系统需求',
    sourceCategory: '技术改进',
    createTime: '2024-01-15T09:00:00.000Z',
    updateTime: '2024-02-15T18:00:00.000Z',
    stages: ['analysis', 'technical', 'design', 'cost', 'risk'],
    items: [
      {
        id: 'item5',
        content: '调研项目已完成，形成最终报告',
        user: '张三',
        time: '2024-02-15T18:00:00.000Z',
      attachments: [
          { id: 'att1', name: '智能水质监测系统调研报告.pdf', url: '/attachments/report1.pdf' },
          { id: 'att2', name: '市场分析数据.xlsx', url: '/attachments/data1.xlsx' }
        ]
      },
      {
        id: 'item4',
        content: '完成风险分析和可行性评估',
        user: '张三',
        time: '2024-02-13T16:30:00.000Z',
      attachments: [
          { id: 'att3', name: '风险评估报告.docx', url: '/attachments/risk1.docx' }
        ]
      },
      {
        id: 'item3',
        content: '完成成本评估和投资预算',
        user: '张三',
        time: '2024-02-10T14:20:00.000Z'
      },
      {
        id: 'item2',
        content: '完成技术方案设计',
        user: '张三',
        time: '2024-02-05T10:15:00.000Z'
      },
      {
        id: 'item1',
        content: '启动智能水质监测系统调研',
        user: '张三',
        time: '2024-02-15T09:00:00.000Z'
      }
    ],
    result: {
      conclusion: '技术可行，建议立项实施',
      investment: 150,
      duration: 8,
      roi: 3.2,
      successRate: 85
    }
  },
  {
    id: 'R2024002',
    title: 'REQ002-污水处理工艺优化调研',
    responsible: '李四',
    department: '工艺部',
    status: 'active',
    startDate: '2024-01-20',
    expectedEndDate: '2024-02-28',
    progress: 60,
    currentStage: '方案设计',
    latestUpdate: '初步技术方案已确定，开始详细设计',
    nextMilestone: '2024-02-05 完成方案设计',
    showQuickAdd: false,
    sourceType: 'requirement',
    sourceId: 'REQ002',
    sourceTitle: '污水处理工艺优化需求',
    sourceCategory: '工艺升级',
    createTime: '2024-01-20T10:30:00.000Z',
    updateTime: '2024-02-01T16:45:00.000Z',
    stages: ['analysis', 'technical', 'design'],
    items: [
      {
        id: 'item3',
        content: '初步技术方案已确定，开始详细设计',
        user: '李四',
        time: '2024-02-01T16:45:00.000Z'
      },
      {
        id: 'item2',
        content: '完成技术调研和市场分析',
        user: '李四',
        time: '2024-01-28T11:20:00.000Z'
      },
      {
        id: 'item1',
        content: '启动污水处理工艺优化调研',
        user: '李四',
        time: '2024-01-20T10:30:00.000Z'
      }
    ]
  },
  {
    id: 'R2024003',
    title: 'REQ003-管网漏损检测设备调研',
    responsible: '王五',
    department: '运维部',
    status: 'paused',
    startDate: '2024-01-10',
    expectedEndDate: '2024-02-20',
    expectedResumeDate: '2024-02-10',
    progress: 30,
    pauseReason: '等待预算确认，供应商报价延迟',
    pauseNote: '需等待财务部门预算批复',
    showQuickAdd: false,
    sourceType: 'external',
    sourceDescription: '华水集团总部委托调研项目',
    createTime: '2024-01-10T14:20:00.000Z',
    updateTime: '2024-01-25T11:15:00.000Z',
    stages: ['analysis', 'technical', 'design'],
    items: [
      {
        id: 'item3',
        content: '调研项目暂停，等待预算确认',
        user: '王五',
        time: '2024-01-25T11:15:00.000Z'
      },
      {
        id: 'item2',
        content: '完成技术调研和设备选型',
        user: '王五',
        time: '2024-01-18T15:30:00.000Z'
      },
      {
        id: 'item1',
        content: '启动管网漏损检测设备调研',
        user: '王五',
        time: '2024-01-10T14:20:00.000Z'
      }
    ]
  }
])

// 统计数据 - 使用计算属性动态计算
const statistics = computed(() => {
  const records = researchRecords.value
  return {
    total: records.length,
    active: records.filter(r => r.status === 'active').length,
    completed: records.filter(r => r.status === 'completed').length,
    paused: records.filter(r => r.status === 'paused').length,
    terminated: records.filter(r => r.status === 'terminated').length
  }
})

/**
 * 计算属性
 */
const filteredRecords = computed(() => {
  let filtered = researchRecords.value

  // 状态筛选
  if (filters.status) {
    filtered = filtered.filter(record => record.status === filters.status)
  }

  // 来源筛选
  if (filters.source) {
    filtered = filtered.filter(record => record.sourceType === filters.source)
  }

  // 关键词搜索
  if (filters.keyword) {
    filtered = filtered.filter(record => 
      record.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      record.responsible.includes(filters.keyword) ||
      (record.sourceTitle && record.sourceTitle.toLowerCase().includes(filters.keyword.toLowerCase())) ||
      (record.sourceDescription && record.sourceDescription.toLowerCase().includes(filters.keyword.toLowerCase()))
    )
  }

  // 排序逻辑：1. 按创建时间倒序 2. 按状态优先级排序
  filtered.sort((a, b) => {
    // 首先按创建时间排序（最新的在前面）
    const timeA = new Date(a.createTime || a.startDate || '2024-01-01').getTime()
    const timeB = new Date(b.createTime || b.startDate || '2024-01-01').getTime()
    
    if (timeA !== timeB) {
      return timeB - timeA // 倒序，最新的在前
    }
    
    // 如果创建时间相同，按状态优先级排序
    const statusPriority = {
      'active': 1,    // 进行中
      'paused': 2,    // 暂停中  
      'completed': 3, // 已完成
      'terminated': 4 // 已终止
    }
    
    const priorityA = statusPriority[a.status] || 5
    const priorityB = statusPriority[b.status] || 5
    
    return priorityA - priorityB
  })

  return filtered
})

// 更新分页总数
watch(filteredRecords, (newRecords) => {
  pagination.total = newRecords.length
}, { immediate: true })

/**
 * 工具方法
 */
const getStatusTagColor = (status) => {
  const colors = {
    active: 'processing',
    completed: 'success',
    paused: 'warning',
    terminated: 'error'
  }
  return colors[status] || 'default'
}

const getStatusIcon = (status) => {
  const icons = {
    active: '🔄',
    completed: '🟢',
    paused: '⏸️',
    terminated: '❌'
  }
  return icons[status] || '❓'
}

const getStatusText = (status) => {
  const texts = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    terminated: '已终止'
  }
  return texts[status] || '未知'
}

const getPurposeText = (purpose) => {
  const texts = {
    analysis: '需求分析',
    technical: '技术调研',
    design: '方案设计',
    cost: '成本评估',
    risk: '风险分析',
    market: '市场调研'
  }
  return texts[purpose] || purpose
}

/**
 * 事件处理方法
 */
const showQuickAddForm = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.showQuickAdd = true
    quickAddForm.content = ''
    quickAddForm.planDate = 'today'
    quickAddForm.duration = '1d'
  }
}

const cancelQuickAdd = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.showQuickAdd = false
  }
}

const saveQuickItem = (recordId) => {
  if (!quickAddForm.content.trim()) {
    message.warning('请填写事项内容')
    return
  }

  // 模拟保存逻辑
  message.success('调研事项添加成功')
  cancelQuickAdd(recordId)
}

const showAddItemDialog = (recordId) => {
  addItemDialog.recordId = recordId
  addItemDialog.visible = true
  
  // 重置表单
  Object.assign(addItemForm, {
    content: '',
    date: null,
    time: null,
    responsible: '张三',
    type: 'other',
    attachments: []
  })
}

const handleCloseAddDialog = () => {
  addItemDialog.visible = false
  addItemDialog.recordId = null
}

const handleAddItem = () => {
  if (!addItemForm.content.trim()) {
    message.warning('请填写事项内容')
    return
  }
  
  if (!addItemForm.date) {
    message.warning('请选择日期')
    return
  }

  const record = researchRecords.value.find(r => r.id === addItemDialog.recordId)
  if (record) {
    // 构建时间字符串
    let timeString = addItemForm.date.format('MM-DD')
    if (addItemForm.time) {
      timeString += ' ' + addItemForm.time.format('HH:mm')
    }

    const newItem = {
      id: Date.now(),
      content: addItemForm.content,
      user: addItemForm.responsible,
      time: timeString,
      type: addItemForm.type
    }
    
    // 如果有附件
    if (addItemForm.attachments && addItemForm.attachments.length > 0) {
      newItem.attachments = addItemForm.attachments.map(file => ({
        id: Date.now() + Math.random(),
      name: file.name,
        url: file.response?.url || '#' // 实际项目中从上传响应获取URL
      }))
    }
    
    record.items = record.items || []
    record.items.unshift(newItem)
    
    message.success('调研事项添加成功')
    handleCloseAddDialog()
  }
}

// 附件下载功能
const downloadAttachment = (attachment) => {
  // 实际项目中这里应该调用下载API
  message.info(`正在下载附件: ${attachment.name}`)
  // 模拟下载
  const link = document.createElement('a')
  link.href = attachment.url || '#'
  link.download = attachment.name
  link.click()
}

// 日期选择器限制 - 不能选择过去的日期
const disabledDate = (current) => {
  // 禁用今天之前的日期
  return current && current.isBefore(new Date(), 'day')
}

// 文件上传前处理
const beforeUpload = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    message.error('文件格式不支持，请上传PDF、Word、Excel或图片文件！')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过10MB！')
    return false
  }
  
  return false // 阻止自动上传，由表单统一处理
}

// 显示新建调研记录弹窗
const showAddRecordDialog = () => {
  addRecordDialog.visible = true
  // 重置表单
  Object.assign(addRecordForm, {
    title: '',
    responsible: '张三',
    department: '技术部',
    startDate: null,
    expectedEndDate: null,
    stages: ['analysis', 'technical'], // 默认选择需求分析和技术调研
    description: '',
    priority: 'medium',
    sourceType: 'requirement',
    sourceRequirement: '',
    sourceDescription: ''
  })
  // 重置需求筛选
  filteredRequirements.value = [...requirementPool.value]
}

// 关闭新建调研记录弹窗
const handleCloseAddRecordDialog = () => {
  addRecordDialog.visible = false
}

// 需求来源类型变更处理
const handleSourceTypeChange = () => {
  // 切换来源类型时清空相关字段
  addRecordForm.sourceRequirement = ''
  addRecordForm.sourceDescription = ''
  
  // 如果切换到需求池，重置筛选列表
  if (addRecordForm.sourceType === 'requirement') {
    filteredRequirements.value = [...requirementPool.value]
  }
}

// 需求搜索处理
const handleRequirementSearch = (value) => {
  if (!value) {
    filteredRequirements.value = [...requirementPool.value]
    return
  }
  
  filteredRequirements.value = requirementPool.value.filter(req => 
    req.title.toLowerCase().includes(value.toLowerCase()) ||
    req.id.toLowerCase().includes(value.toLowerCase()) ||
    req.category.includes(value)
  )
}

// 确认新建调研记录
const handleAddRecord = () => {
  if (!addRecordForm.title.trim()) {
    message.error('请输入调研标题')
    return
  }
  if (addRecordForm.stages.length === 0) {
    message.error('请至少选择一个调研阶段')
    return
  }

  // 生成新的调研记录ID
  const newId = Date.now().toString()
  
  // 处理需求来源信息
  let sourceInfo = {}
  if (addRecordForm.sourceType === 'requirement' && addRecordForm.sourceRequirement) {
    const selectedReq = requirementPool.value.find(req => req.id === addRecordForm.sourceRequirement)
    if (selectedReq) {
      sourceInfo = {
        sourceType: 'requirement',
        sourceId: selectedReq.id,
        sourceTitle: selectedReq.title,
        sourceCategory: selectedReq.category
      }
    }
  } else if (addRecordForm.sourceDescription.trim()) {
    sourceInfo = {
      sourceType: addRecordForm.sourceType,
      sourceDescription: addRecordForm.sourceDescription
    }
  }
  
  // 创建新的调研记录
  const newRecord = {
    id: newId,
    title: addRecordForm.title,
    responsible: addRecordForm.responsible,
    department: addRecordForm.department,
    startDate: addRecordForm.startDate ? addRecordForm.startDate.format('YYYY-MM-DD') : null,
    expectedEndDate: addRecordForm.expectedEndDate ? addRecordForm.expectedEndDate.format('YYYY-MM-DD') : null,
    stages: addRecordForm.stages,
    description: addRecordForm.description,
    priority: addRecordForm.priority,
    status: 'active',
    progress: 0,
    items: [],
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    currentStage: addRecordForm.stages[0], // 第一个选择的阶段作为当前阶段
    ...sourceInfo // 合并来源信息
  }

  // 添加到记录列表
  researchRecords.value.push(newRecord)
  
  message.success('调研记录创建成功！')
  addRecordDialog.visible = false
  
  console.log('新建调研记录：', newRecord)
}

// 暂停调研
const pauseResearch = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.status = 'paused'
    record.updateTime = new Date().toISOString()
    message.success('调研已暂停')
  }
}

// 恢复调研
const resumeResearch = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.status = 'active'
    record.updateTime = new Date().toISOString()
    message.success('调研已恢复')
  }
}

// 终止调研
const terminateResearch = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.status = 'terminated'
    record.updateTime = new Date().toISOString()
    message.warning('调研已终止')
  }
}

const showUpdateProgress = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    updateDialog.recordId = recordId
    updateDialog.visible = true
    updateForm.status = record.status
    updateForm.remark = ''
  }
}

const handleUpdateStatus = () => {
  const record = researchRecords.value.find(r => r.id === updateDialog.recordId)
  if (!record) return
  // 状态变更
  if (record.status !== updateForm.status) {
    record.status = updateForm.status
    record.updateTime = new Date().toISOString()
    // 写入事项记录
    record.items = record.items || []
    record.items.push({
      id: 'item' + Date.now(),
      content: `调研状态变更为"${getStatusText(updateForm.status)}"${updateForm.remark ? "，备注：" + updateForm.remark : ""}`,
      user: record.responsible,
      time: new Date().toISOString(),
      status: updateForm.status
    })
  }
  message.success('调研状态已更新')
  handleCloseUpdateDialog()
}

const handleSizeChange = (current, size) => {
  pagination.size = size
  pagination.page = 1
}

const handleCurrentChange = (page, size) => {
  pagination.page = page
  pagination.size = size
}

// 筛选处理函数
const handleFilterChange = () => {
  // 筛选变化时，重置分页到第一页
  pagination.page = 1
  // 触发重新计算filteredRecords
}

// 查看调研记录详情
const showRecordDetail = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    detailDialog.record = record
    detailDialog.visible = true
  }
}

// 关闭更新状态弹窗
const handleCloseUpdateDialog = () => {
  updateDialog.visible = false
  updateDialog.recordId = null
  
  // 重置表单
  Object.assign(updateForm, {
    status: 'active',
    remark: ''
  })
}

// 获取事项记录最近3条，按时间倒序
const getRecentItems = (record) => {
  if (!record.items || record.items.length === 0) return []
  // 按时间倒序，格式化时间显示
  return [...record.items]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 3)
    .map(item => ({
      ...item,
      time: formatTime(item.time)
    }))
}

// 格式化时间显示
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取所有事项，按时间倒序
const getAllItems = (record) => {
  if (!record.items || record.items.length === 0) return []
  return [...record.items]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .map(item => ({
      ...item,
      time: formatTime(item.time)
    }))
}

/**
 * 生命周期
 */
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
/** 
 * 所有页面默认样式已由PageContainer提供
 */

/**
 * 筛选统计区域样式
 */
.filter-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-controls {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 500;
  color: #333;
  min-width: 40px;
}

.stats-overview {
  font-size: 14px;
  color: #234fa2;
  font-weight: 500;
  padding: 12px 16px;
  background: #f0f5ff;
  border-radius: 6px;
  border-left: 4px solid #234fa2;
}

/**
 * 调研记录卡片样式
 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.record-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/**
 * 更新状态弹窗样式
 */
.progress-input-container {
  width: 100%;
}

.progress-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-tip {
  font-size: 12px;
  color: #999;
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-icon {
  font-size: 18px;
}

.record-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.status-tag {
  font-weight: 500;
}

.card-info {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/**
 * 通用内容区域样式 - 标题左对齐，内容缩进
 */
.content-section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: left; /* 标题左对齐 */
  font-size: 13px;
}

.section-content {
  margin-left: 20px; /* 内容缩进20px */
  text-align: left;
}

.purpose-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.purpose-tags .ant-tag {
  margin-right: 8px;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.item-time {
  font-size: 12px;
  color: #999;
}

.item-user {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.item-desc {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-top: 2px;
}

/* 附件样式 */
.item-attachments {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.attachment-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-link {
  font-size: 13px;
  color: #1890ff;
  cursor: pointer;
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
  display: inline-block;
  max-width: fit-content;
}

.attachment-link:hover {
  background: #e6f7ff;
  color: #0050b3;
  text-decoration: underline;
}

/**
 * 操作按钮样式
 */
.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.add-item-action {
  color: #234fa2;
  padding: 0 8px;
}

.add-item-action:hover {
  color: #1c3d82;
  background: #f0f5ff;
}

/**
 * 分页样式
 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/**
 * 弹窗表单样式
 */
.progress-slider {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.progress-value {
  font-weight: 500;
  color: #234fa2;
  min-width: 40px;
}

.current-stage {
  font-weight: 500;
  color: #234fa2;
}

/**
 * 响应式设计
 */
@media (max-width: 768px) {

  .filter-row {
    justify-content: center;
  }

  .timeline-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-stage {
    width: 100%;
  }

  .result-row,
  .progress-row,
  .pause-row {
    flex-direction: column;
    gap: 8px;
  }

  .card-actions {
    justify-content: center;
  }

  .quick-add-form {
    flex-direction: column;
    align-items: stretch;
  }
}

/**
 * 新建调研记录弹窗样式
 */
.stage-selection {
  margin-top: 8px;
}

.stage-tip {
  font-size: 12px;
  color: #666;
    margin-bottom: 12px;
  font-style: italic;
}

.stage-checkboxes {
  width: 100%;
}

.stage-checkbox {
  display: flex !important;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: #fafafa;
  width: 100%;
  margin: 0 !important;
}

.stage-checkbox:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.stage-checkbox.ant-checkbox-wrapper-checked {
  border-color: #1890ff;
  background: #e6f7ff;
}

.stage-icon {
  font-size: 16px;
  margin-right: 6px;
}

.stage-text {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

/**
 * 需求选择选项样式
 */
.requirement-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.req-title {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.req-category {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}
</style> 