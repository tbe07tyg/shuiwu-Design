<!--
 * @file 立项管理中心页面 - 管理角色
 * @description 管理角色的立项管理中心，专注于材料审核与立项会议管理决策
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="approval-management-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <AppstoreOutlined />
          </span>
          立项管理中心
        </h1>
        <p class="page-description">
          审核立项材料，组织立项会议，管理立项流程
        </p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="handleBatchReview">
          <AuditOutlined />
          批量审核
        </a-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <a-row :gutter="16">
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card pending" @click="handleStatCardClick('material_reviewing')">
            <div class="stat-icon">
              <FileTextOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.materialReviewing }}</div>
              <div class="stat-label">材料审核中</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card reviewing" @click="handleStatCardClick('meeting_preparing')">
            <div class="stat-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.meetingPreparing }}</div>
              <div class="stat-label">会议待组织</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card scheduled" @click="handleStatCardClick('meeting_scheduled')">
            <div class="stat-icon">
              <ClockCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.meetingScheduled }}</div>
              <div class="stat-label">会议已安排</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card completed" @click="handleStatCardClick('approval_passed')">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.approvalPassed }}</div>
              <div class="stat-label">立项通过</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card conditional" @click="handleStatCardClick('approval_conditional')">
            <div class="stat-icon">
              <BulbOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.approvalConditional }}</div>
              <div class="stat-label">有条件通过</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card rejected" @click="handleStatCardClick('approval_failed')">
            <div class="stat-icon">
              <CloseCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.approvalFailed }}</div>
              <div class="stat-label">立项未通过</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 立项流程说明 -->
    <div class="content-card flow-description">
      <div class="card-header">
        <h3>
          <BulbOutlined />
          立项流程说明
        </h3>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </div>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="申请提交" description="申报单位提交立项申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                审核立项材料，决定通过或驳回
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                安排立项会议并组织专家评审
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="结论录入" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果录入最终立项结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">立项通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">立项未通过</a-tag>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
    </div>



    <!-- 项目审核管理区域 - 全宽对齐统计区域 -->
    <div class="content-card">
      <div class="card-header">
        <h3>
          <UnorderedListOutlined />
          项目审核管理
        </h3>
        <div class="header-filters">
                          <a-select
                  v-model:value="filters.status"
                  placeholder="筛选状态"
                  style="width: 150px"
                  @change="handleFilterChange"
                >
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="material_reviewing">材料审核中</a-select-option>
                  <a-select-option value="meeting_preparing">会议待组织</a-select-option>
                  <a-select-option value="meeting_scheduled">会议已安排</a-select-option>
                  <a-select-option value="approval_passed">立项通过</a-select-option>
                  <a-select-option value="approval_conditional">有条件通过</a-select-option>
                  <a-select-option value="approval_failed">立项未通过</a-select-option>
                </a-select>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目"
            style="width: 200px"
            @search="handleSearch"
          />
        </div>
      </div>
            
            <div class="project-review-list">
              <a-table
                :columns="reviewColumns"
                :data-source="filteredProjects"
                :pagination="pagination"
                row-key="id"
                size="middle"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'currentStatus'">
                    <a-tag :color="getStatusColor(record.currentStatus)">
                      {{ getStatusText(record.currentStatus) }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'finalResult'">
                    <a-tag v-if="record.finalResult" :color="getResultColor(record.finalResult)">
                      {{ getResultText(record.finalResult) }}
                    </a-tag>
                    <span v-else class="text-muted">待定</span>
                  </template>
                  <template v-else-if="column.key === 'actions'">
                    <a-space>
                      <!-- 材料审核中 - 可以审核材料 -->
                      <a-button 
                        v-if="record.currentStatus === 'material_reviewing'" 
                        type="primary" 
                        size="small" 
                        @click="handleReviewMaterial(record)"
                      >
                        审核材料
                      </a-button>
                      
                      <!-- 会议待组织 - 可以组织会议 -->
                      <a-button 
                        v-if="record.currentStatus === 'meeting_preparing'" 
                        type="primary" 
                        size="small" 
                        @click="handleScheduleMeeting(record)"
                      >
                        组织会议
                      </a-button>
                      
                      <!-- 会议待召开 - 可以录入结论 -->
                      <a-button 
                        v-if="record.currentStatus === 'meeting_scheduled'" 
                        type="primary" 
                        size="small" 
                        @click="handleInputResult(record)"
                      >
                        录入结论
                      </a-button>
                      
                      <!-- 有条件通过 - 可以审核整改材料 -->
                      <a-button 
                        v-if="record.currentStatus === 'approval_conditional'" 
                        type="primary" 
                        size="small" 
                        @click="handleReviewImprovement(record)"
                      >
                        审核整改材料
                      </a-button>
                      
                                              <!-- 立项未通过 - 可以重新审核 -->
                      <a-button 
                        v-if="record.currentStatus === 'approval_failed'" 
                        type="default" 
                        size="small" 
                        @click="handleReReview(record)"
                      >
                        重新审核
                      </a-button>
                      
                      <!-- 通用操作 - 查看详情 -->
                      <a-button 
                        type="link" 
                        size="small" 
                        @click="handleViewDetail(record)"
                      >
                        查看详情
                      </a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </div>
          </div>

    <!-- 材料审核弹窗 -->
    <a-modal
      v-model:open="reviewModalVisible"
      title="材料审核"
      width="800px"
      :closable="false"
      :footer="null"
    >
      <div v-if="selectedProject" class="review-modal">
        <div class="project-basic-info">
          <h4>项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ selectedProject.submitTime }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="material-review-section">
          <div class="section-header">
            <h4>材料审核</h4>
            <div class="batch-actions">
              <a-space>
                <a-button 
                  type="primary" 
                  size="small" 
                  @click="approveAllMaterials"
                  :disabled="!selectedProject.materials?.length"
                >
                  🚀 一键通过全部
                </a-button>
                <a-button 
                  danger 
                  size="small" 
                  @click="rejectAllMaterials"
                  :disabled="!selectedProject.materials?.length"
                >
                  🚫 一键驳回全部
                </a-button>
              </a-space>
            </div>
          </div>
          
          <div class="material-list">
            <div v-for="material in selectedProject.materials" :key="material.id" class="material-item">
              <div class="material-info">
                <div class="material-name">{{ material.name }}</div>
                <div class="material-type">{{ material.type }}</div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(material)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(material)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
              <div class="material-review-controls">
                <!-- 审核状态显示 -->
                <div class="review-status-display">
                  <div 
                    class="status-option"
                    :class="{ 
                      'status-active': material.reviewStatus === 'approved',
                      'status-approved': material.reviewStatus === 'approved'
                    }"
                    @click="approveMaterial(material)"
                  >
                    <div class="status-icon">
                      {{ material.reviewStatus === 'approved' ? '✅' : '⚪' }}
                    </div>
                    <div class="status-text">通过</div>
                  </div>
                  
                  <div 
                    class="status-option"
                    :class="{ 
                      'status-active': material.reviewStatus === 'rejected',
                      'status-rejected': material.reviewStatus === 'rejected'
                    }"
                    @click="rejectMaterial(material)"
                  >
                    <div class="status-icon">
                      {{ material.reviewStatus === 'rejected' ? '❌' : '⚪' }}
                    </div>
                    <div class="status-text">驳回</div>
                  </div>
                  
                  <div 
                    class="status-option"
                    :class="{ 
                      'status-active': !material.reviewStatus || material.reviewStatus === 'pending',
                      'status-pending': !material.reviewStatus || material.reviewStatus === 'pending'
                    }"
                  >
                    <div class="status-icon">
                      {{ (!material.reviewStatus || material.reviewStatus === 'pending') ? '⏳' : '⚪' }}
                    </div>
                    <div class="status-text">待审</div>
                  </div>
                </div>
                
                <!-- 编辑意见按钮 -->
                <div v-if="material.rejectionReason" class="edit-opinion-btn">
                  <a-button 
                    size="small"
                    type="dashed"
                    @click="editRejectionReason(material)"
                  >
                    📝 编辑意见
                  </a-button>
                </div>
              </div>
              
              <!-- 驳回意见显示 -->
              <div v-if="material.rejectionReason" class="rejection-reason">
                <div class="reason-label">驳回意见：</div>
                <div class="reason-content">
                  <div 
                    class="reason-text"
                    :class="{ 'reason-expanded': material.showFullReason }"
                  >
                    {{ material.rejectionReason }}
                  </div>
                  <a-button 
                    v-if="material.rejectionReason.length > 50"
                    type="link" 
                    size="small"
                    @click="toggleReasonDisplay(material)"
                    class="toggle-reason-btn"
                  >
                    {{ material.showFullReason ? '收起' : '展开' }}
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="review-comments-section">
          <div class="section-header">
            <h4>审核意见</h4>
            <a-button 
              size="small" 
              type="link" 
              @click="regenerateComments"
              :disabled="!hasReviewedMaterials"
            >
              🔄 重新生成
            </a-button>
          </div>
          <a-textarea
            v-model:value="reviewForm.comments"
            placeholder="审核意见将根据材料审核结果自动生成，您也可以手动编辑补充..."
            :rows="8"
            show-count
            :maxlength="1000"
            class="review-comments-textarea"
          />
          <div class="comments-tip">
            <a-alert
              message="提示"
              description="审核意见会自动根据各材料的审核结果生成，您可以在此基础上补充整体意见。"
              type="info"
              show-icon
              :closable="false"
            />
          </div>
        </div>

        <div class="review-result-section">
          <h4>审核结果</h4>
          <div class="auto-result-display">
            <a-tag 
              :color="autoReviewResult === 'approved' ? 'green' : 'red'" 
              size="large"
            >
              {{ autoReviewResult === 'approved' ? '材料审核通过' : '材料审核不通过' }}
            </a-tag>
            <span class="result-tip">
              （根据材料审核状态自动确定）
            </span>
          </div>
        </div>
        
        <!-- 审核不通过时的详细说明 -->
        <div v-if="reviewForm.result === 'rejected'" class="rejection-details">
          <a-form-item label="不通过原因" required>
            <a-textarea
              v-model:value="reviewForm.rejectionReason"
              placeholder="请详细说明材料不通过的具体原因，指出需要补充或修改的内容..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>
        </div>
        
        <!-- 自定义底部按钮 -->
        <div class="modal-footer">
          <a-space>
            <a-button @click="handleReviewCancel">
              取消
            </a-button>
            <a-button type="primary" @click="handleReviewSubmit">
              提交审核
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 驳回意见填写弹窗 -->
    <a-modal
      v-model:open="rejectionModalVisible"
      title="填写驳回意见"
      width="500px"
      @ok="confirmRejection"
      @cancel="cancelRejection"
    >
      <div v-if="currentMaterial" class="rejection-form">
        <div class="material-info">
          <h4>{{ currentMaterial.name }}</h4>
          <p class="material-type">{{ currentMaterial.type }}</p>
        </div>
        <a-form layout="vertical">
          <a-form-item label="驳回原因" required>
            <a-textarea
              v-model:value="rejectionForm.reason"
              placeholder="请详细说明该材料的问题和改进要求..."
              :rows="4"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 会议组织弹窗 -->
    <a-modal
      v-model:open="meetingModalVisible"
      title="安排验收会议"
      width="700px"
      @ok="handleMeetingSubmit"
      @cancel="handleMeetingCancel"
    >
      <div v-if="selectedProject" class="meeting-modal">
        <a-form :model="meetingForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="会议时间" required>
                <a-date-picker
                  v-model:value="meetingForm.datetime"
                  show-time
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="会议地点" required>
                <a-input
                  v-model:value="meetingForm.location"
                  placeholder="请输入会议地点"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="会议形式" required>
            <a-radio-group v-model:value="meetingForm.type">
              <a-radio value="offline">现场会议</a-radio>
              <a-radio value="online">线上会议</a-radio>
              <a-radio value="hybrid">混合会议</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="会议主持人" required>
            <a-select
              v-model:value="meetingForm.hosts"
              mode="tags"
              placeholder="选择或输入主持人（可选择多个或手动输入）"
              style="width: 100%"
              :options="hostOptions"
              :filter-option="filterHostOption"
            >
              <template #tagRender="{ label, onClose }">
                <a-tag 
                  color="blue" 
                  closable 
                  @close="onClose"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
            <div class="form-tip">可从下拉列表选择或直接输入姓名，支持多个主持人</div>
          </a-form-item>

          <a-form-item label="参会专家" required>
            <a-select
              v-model:value="meetingForm.experts"
              mode="tags"
              placeholder="选择或输入参会专家（可选择多个或手动输入）"
              style="width: 100%"
              :options="expertOptions"
              :filter-option="filterExpertOption"
            >
              <template #tagRender="{ label, onClose }">
                <a-tag 
                  color="green" 
                  closable 
                  @close="onClose"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
            <div class="form-tip">可从下拉列表选择或直接输入专家姓名，支持多个专家</div>
          </a-form-item>

          <a-form-item label="会议资料">
            <div class="meeting-materials">
              <a-upload
                v-model:file-list="meetingForm.materials"
                :before-upload="beforeUploadMaterial"
                :on-remove="removeMaterial"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              >
                <a-button>
                  <UploadOutlined />
                  上传会议资料
                </a-button>
              </a-upload>
              <div class="upload-tip">
                支持上传PDF、Word、PPT、Excel、压缩包等格式，单个文件不超过50MB
              </div>
              
              <!-- 资料列表展示 -->
              <div v-if="meetingForm.materials && meetingForm.materials.length > 0" class="materials-list">
                <div 
                  v-for="(file, index) in meetingForm.materials" 
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <a-button 
                    type="link" 
                    danger 
                    size="small"
                    @click="removeMaterialByIndex(index)"
                  >
                    删除
                  </a-button>
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="会议说明">
            <a-textarea
              v-model:value="meetingForm.description"
              placeholder="请填写会议说明..."
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 结论录入弹窗 -->
    <a-modal
      v-model:open="resultModalVisible"
      title="录入验收结论"
      width="800px"
      @ok="handleResultSubmit"
      @cancel="handleResultCancel"
    >
      <div v-if="selectedProject" class="result-modal">
        <div class="project-meeting-info">
          <h4>会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="会议时间">
              {{ selectedProject.meetingInfo?.time || '会议时间待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedProject.meetingInfo?.location || '会议地点待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" v-if="selectedProject.meetingInfo?.type">
              {{ selectedProject.meetingInfo.type === 'offline' ? '现场会议' : selectedProject.meetingInfo.type === 'online' ? '线上会议' : '混合会议' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2" v-if="selectedProject.meetingInfo?.description">
              {{ selectedProject.meetingInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-form :model="resultForm" layout="vertical">
          <a-form-item label="验收结论" required>
            <a-radio-group v-model:value="resultForm.conclusion">
              <a-radio value="passed">验收通过</a-radio>
              <a-radio value="conditional_passed">有条件通过</a-radio>
              <a-radio value="failed">验收不通过</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="验收评分">
            <a-input-number
              v-model:value="resultForm.score"
              :min="0"
              :max="100"
              placeholder="请输入评分"
              style="width: 200px"
            />
            <span style="margin-left: 8px">分</span>
          </a-form-item>

          <a-form-item label="结论说明" required>
            <a-textarea
              v-model:value="resultForm.description"
              placeholder="请详细说明验收结论..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>

          <a-form-item label="整改要求" v-if="resultForm.conclusion !== 'passed'">
            <a-textarea
              v-model:value="resultForm.requirements"
              placeholder="请填写整改要求..."
              :rows="3"
              show-count
              :maxlength="300"
            />
          </a-form-item>

          <a-form-item label="结论相关文件">
            <div class="conclusion-files">
              <a-upload
                v-model:file-list="resultForm.conclusionFiles"
                :before-upload="beforeUploadResultFile"
                :on-remove="removeResultFile"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              >
                <a-button>
                  <UploadOutlined />
                  上传结论文件
                </a-button>
              </a-upload>
              
              <!-- 文件列表展示 -->
              <div v-if="resultForm.conclusionFiles.length > 0" class="files-list">
                <div 
                  v-for="(file, index) in resultForm.conclusionFiles" 
                  :key="index"
                  class="file-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <a-button
                    type="link"
                    danger
                    size="small"
                    @click="removeResultFileByIndex(index)"
                  >
                    删除
                  </a-button>
                </div>
              </div>
              <div class="upload-tip">
                <small style="color: #999;">
                  支持上传 PDF、Word、Excel 文件，单个文件大小不超过 20MB
                </small>
              </div>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 整改材料审核弹窗 -->
    <a-modal
      v-model:open="improvementReviewModalVisible"
      title="审核整改材料"
      width="900px"
      @ok="handleImprovementReviewSubmit"
      @cancel="handleImprovementReviewCancel"
    >
      <div v-if="selectedProject" class="improvement-review-modal">
        <!-- 项目基本信息 -->
        <div class="project-basic-info">
          <h4>项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code }}
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedProject.submitTime }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 原始整改要求 -->
        <div v-if="selectedProject.conclusion && selectedProject.conclusion.requirements" class="original-requirements">
          <h4>原始整改要求</h4>
          <div class="requirements-content">
            <a-alert
              type="warning"
              show-icon
              :message="selectedProject.conclusion.requirements"
            />
          </div>
        </div>

        <!-- 申请人提交的整改材料 -->
        <div class="improvement-materials">
          <h4>申请人提交的整改材料</h4>
          <div class="improvement-materials-list">
            <!-- 模拟整改材料数据 -->
            <div class="material-item improvement-material">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  数据备份机制说明.pdf
                </div>
                <div class="material-meta">
                  <span class="material-type">整改材料</span>
                  <span class="material-size">2.3MB</span>
                  <span class="material-time">{{ selectedProject.improvementSubmitTime || '2024-01-28 14:30' }}</span>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial({ name: '数据备份机制说明.pdf' })">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial({ name: '数据备份机制说明.pdf' })">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
            <div class="material-item improvement-material">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
系统界面优化报告.pdf
                </div>
                <div class="material-meta">
                  <span class="material-type">整改材料</span>
                  <span class="material-size">1.8MB</span>
                  <span class="material-time">{{ selectedProject.improvementSubmitTime || '2024-01-28 14:30' }}</span>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial({ name: '系统界面优化报告.pdf' })">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial({ name: '系统界面优化报告.pdf' })">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
            <div class="material-item improvement-material">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  系统操作说明文档.docx
                </div>
                <div class="material-meta">
                  <span class="material-type">整改材料</span>
                  <span class="material-size">1.2MB</span>
                  <span class="material-time">{{ selectedProject.improvementSubmitTime || '2024-01-28 14:30' }}</span>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial({ name: '系统操作说明文档.docx' })">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial({ name: '系统操作说明文档.docx' })">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 申请人整改说明 -->
        <div class="improvement-description">
          <h4>申请人整改说明</h4>
          <div class="description-content">
            <a-card size="small" class="improvement-description-card">
              <div class="improvement-content">
                <p><strong>整改完成情况：</strong></p>
                <div class="improvement-details">
                  <p>{{ selectedProject.improvementDescription || '1. 已完善数据备份机制，建立了自动备份和手动备份双重保障体系；' }}</p>
                  <p>{{ '2. 优化了系统界面布局，提升用户交互体验；' }}</p>
                  <p>{{ '3. 编写了详细的操作说明文档，便于用户使用。' }}</p>
                </div>
                <div class="improvement-submit-info">
                  <ClockCircleOutlined />
                  <span>提交时间：{{ selectedProject.improvementSubmitTime || '2024-01-28 14:30' }}</span>
                </div>
              </div>
            </a-card>
          </div>
        </div>

        <!-- 审核结果 -->
        <div class="review-result-section">
          <h4>审核结果</h4>
          <a-form layout="vertical">
            <a-form-item label="审核结论" required>
              <a-radio-group v-model:value="improvementReviewForm.result" class="review-result-group">
                <a-radio value="approved" class="review-option">
                  <CheckCircleOutlined style="color: #52c41a; margin-right: 8px;" />
                  整改完成，立项通过
                </a-radio>
                <a-radio value="rejected" class="review-option">
                  <ExclamationCircleOutlined style="color: #faad14; margin-right: 8px;" />
                  整改不满足要求，需要继续整改
                </a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item label="审核意见" required>
              <a-textarea
                v-model:value="improvementReviewForm.comments"
                placeholder="请填写详细的审核意见..."
                :rows="4"
                show-count
                :maxlength="500"
              />
            </a-form-item>

            <a-form-item 
              v-if="improvementReviewForm.result === 'rejected'" 
              label="新的整改要求" 
              required
            >
              <a-textarea
                v-model:value="improvementReviewForm.requirements"
                placeholder="请明确指出需要继续整改的具体内容和要求..."
                :rows="3"
                show-count
                :maxlength="300"
              />
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="项目详情"
      width="1000px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="selectedProject" class="detail-modal">
        <!-- 项目基本信息 -->
        <div class="detail-section">
          <h4><FileSearchOutlined /> 项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="年度">
              {{ selectedProject.year }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code }}
            </a-descriptions-item>
            <a-descriptions-item label="立项名称" :span="2">
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="申请人">
              {{ selectedProject.applicant }}
            </a-descriptions-item>
            <a-descriptions-item label="申请单位">
              {{ selectedProject.department }}
            </a-descriptions-item>
            <a-descriptions-item label="项目周期(月)">
              {{ selectedProject.duration }}个月
            </a-descriptions-item>
            <a-descriptions-item label="预算(万元)">
              {{ selectedProject.budget }}万元
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ selectedProject.submitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="getStatusColor(selectedProject.currentStatus)">
                {{ getStatusText(selectedProject.currentStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="最终结果" v-if="selectedProject.finalResult">
              <a-tag :color="selectedProject.finalResult === 'passed' ? 'green' : selectedProject.finalResult === 'failed' ? 'red' : 'orange'">
                {{ selectedProject.finalResult === 'passed' ? '立项通过' : selectedProject.finalResult === 'failed' ? '立项未通过' : '有条件通过' }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 验收材料 -->
        <div class="detail-section">
          <h4><FileOutlined /> 验收材料</h4>
          <div class="material-list">
            <div v-for="material in selectedProject.materials" :key="material.id" class="material-item">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ material.name }}
                </div>
                <div class="material-meta">
                  <span class="material-type">{{ material.type }}</span>
                  <a-tag 
                    :color="material.reviewStatus === 'approved' ? 'green' : material.reviewStatus === 'rejected' ? 'red' : 'orange'"
                    size="small"
                  >
                    {{ material.reviewStatus === 'approved' ? '已通过' : material.reviewStatus === 'rejected' ? '已驳回' : '待审核' }}
                  </a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(material)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(material)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 会议信息 -->
        <div class="detail-section" v-if="selectedProject.meetingInfo">
          <h4><CalendarOutlined /> 会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="会议时间">
              {{ selectedProject.meetingInfo.time }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedProject.meetingInfo.location }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" :span="2">
              {{ selectedProject.meetingInfo.type === 'offline' ? '现场会议' : selectedProject.meetingInfo.type === 'online' ? '线上会议' : '混合会议' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2" v-if="selectedProject.meetingInfo.description">
              {{ selectedProject.meetingInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 验收结论 -->
        <div class="detail-section" v-if="selectedProject.conclusion">
          <h4><AuditOutlined /> 验收结论</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="验收结果">
              <a-tag :color="selectedProject.conclusion.result === 'passed' ? 'green' : selectedProject.conclusion.result === 'failed' ? 'red' : 'orange'">
                {{ selectedProject.conclusion.result === 'passed' ? '验收通过' : selectedProject.conclusion.result === 'failed' ? '验收不通过' : '有条件通过' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="验收时间">
              {{ selectedProject.conclusion.time }}
            </a-descriptions-item>
            <a-descriptions-item label="验收评分" v-if="selectedProject.conclusion.score">
              <span :style="{ color: selectedProject.conclusion.score >= 90 ? '#52c41a' : selectedProject.conclusion.score >= 80 ? '#fa8c16' : '#ff4d4f' }">
                {{ selectedProject.conclusion.score }}分
              </span>
            </a-descriptions-item>
            <a-descriptions-item label="验收说明" :span="2">
              {{ selectedProject.conclusion.description }}
            </a-descriptions-item>
            <a-descriptions-item label="整改要求" :span="2" v-if="selectedProject.conclusion.requirements">
              <div class="requirements-text">
                {{ selectedProject.conclusion.requirements }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 整改情况 -->
        <div class="detail-section" v-if="selectedProject.improvementSubmitted">
          <h4><CheckCircleOutlined /> 整改情况</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="提交状态">
              <a-tag color="blue">已提交整改材料</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedProject.improvementSubmitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="整改说明" :span="2">
              <div class="improvement-text">
                {{ selectedProject.improvementDescription }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 审核历史 -->
        <div class="detail-section">
          <h4><ClockCircleOutlined /> 审核历史</h4>
          <a-timeline>
            <a-timeline-item color="blue">
              <template #dot>
                <FileOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">项目验收申请提交</div>
                <div class="timeline-time">{{ selectedProject.submitTime }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
              v-if="selectedProject.materialStatus === 'approved'"
              color="green"
            >
              <template #dot>
                <CheckCircleOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">材料审核通过</div>
                <div class="timeline-time">{{ selectedProject.materialReviewTime || '2024-01-18' }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
              v-if="selectedProject.meetingScheduled"
              color="blue"
            >
              <template #dot>
                <CalendarOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">验收会议安排</div>
                <div class="timeline-time">{{ selectedProject.meetingInfo?.time }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
              v-if="selectedProject.conclusion"
              :color="selectedProject.conclusion.result === 'passed' ? 'green' : selectedProject.conclusion.result === 'failed' ? 'red' : 'orange'"
            >
              <template #dot>
                <AuditOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">
                  {{ selectedProject.conclusion.result === 'passed' ? '验收通过' : selectedProject.conclusion.result === 'failed' ? '验收不通过' : '有条件通过' }}
                </div>
                <div class="timeline-time">{{ selectedProject.conclusion.time }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
              v-if="selectedProject.improvementSubmitted"
              color="blue"
            >
              <template #dot>
                <FileOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">整改材料提交</div>
                <div class="timeline-time">{{ selectedProject.improvementSubmitTime }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>

    <!-- 文件预览弹窗 -->
    <FilePreview
      v-model:visible="previewVisible"
      :file-info="currentPreviewFile"
      @download="handleDownloadFile"
    />
  </div>
</template>

<script setup>
/**
 * 验收管理中心页面 - 管理角色
 * 功能：材料审核、会议组织、结论录入、流程管理
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  AppstoreOutlined,
  AuditOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileSearchOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  BulbOutlined,
  FileOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import FilePreview from '@/components/FilePreview.vue'

const router = useRouter()

// 项目列表数据
const projects = ref([
  {
    id: 1,
    name: '智慧城市大数据平台建设项目',
    code: 'PROJ-2024-001',
    year: '2024',
    applicant: '王五',
    department: '技术部',
    duration: 18,
    budget: 200,
    currentStatus: 'material_reviewing',
    materialStatus: 'reviewing',
    meetingStatus: 'pending',
    finalResult: null,
    submitTime: '2024-01-15',
    meetingScheduled: false,
    materials: [
      { id: 1, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'pending' },
      { id: 2, name: '项目总结报告.docx', type: '总结报告', size: 1200000, url: '/api/files/download/项目总结报告.docx', reviewStatus: 'pending' },
      { id: 3, name: '成果汇总材料.zip', type: '成果材料', size: 8500000, url: '/api/files/download/成果汇总材料.zip', reviewStatus: 'pending' }
    ]
  },
  {
    id: 2,
    name: '区块链供应链金融平台',
    code: 'PROJ-2024-002',
    year: '2024',
    applicant: '赵六',
    department: '工程部',
    duration: 12,
    budget: 150,
    currentStatus: 'meeting_preparing',
    materialStatus: 'approved',
    meetingStatus: 'preparing',
    finalResult: null,
    submitTime: '2024-01-20',
    meetingScheduled: false,
    materials: [
      { id: 4, name: '项目验收报告.pdf', type: '验收报告', size: 1800000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' },
      { id: 5, name: '财务决算报告.xlsx', type: '财务报告', size: 500000, url: '/api/files/download/财务决算报告.xlsx', reviewStatus: 'approved' }
    ]
  },
  {
    id: 3,
    name: '物联网环境监测系统',
    code: 'PROJ-2024-003',
    year: '2024',
    applicant: '李明',
    department: '自动化部',
    duration: 24,
    budget: 180,
    currentStatus: 'meeting_scheduled',
    materialStatus: 'approved',
    meetingStatus: 'scheduled',
    finalResult: null,
    submitTime: '2024-01-12',
    meetingScheduled: true,
    meetingInfo: {
      time: '2024-01-25 14:00',
      location: '会议室A301',
      type: 'offline',
      description: '项目验收会议，重点评审环境监测系统的技术实现'
    },
    materials: [
      { id: 6, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' },
      { id: 7, name: '系统测试报告.pdf', type: '测试报告', size: 1500000, url: '/api/files/download/系统测试报告.pdf', reviewStatus: 'approved' }
    ]
  },
  {
    id: 4,
    name: '电子商务数据分析系统',
    code: 'PROJ-2024-004',
    year: '2024',
    applicant: '王强',
    department: '信息部',
    duration: 15,
    budget: 220,
    currentStatus: 'approval_passed',
    materialStatus: 'approved',
    meetingStatus: 'completed',
    finalResult: 'passed',
    submitTime: '2024-01-08',
    meetingScheduled: true,
    meetingInfo: {
      time: '2024-01-22 09:00',
      location: '会议室B205',
      type: 'offline',
      description: '项目验收会议，邀请相关专家进行评审'
    },
    materials: [
      { id: 8, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' }
    ],
    conclusion: {
      result: 'passed',
      score: 92,
      time: '2024-01-22',
      description: '项目验收通过，系统功能完整，技术指标达标。'
    }
  },
  {
    id: 5,
    name: '在线教育管理平台',
    code: 'PROJ-2024-005',
    year: '2024',
    applicant: '张华',
    department: '教育部',
    duration: 20,
    budget: 160,
    currentStatus: 'approval_conditional',
    materialStatus: 'approved',
    meetingStatus: 'completed',
    finalResult: 'conditional_passed',
    submitTime: '2024-01-03',
    meetingScheduled: true,
    meetingInfo: {
      time: '2024-01-21 14:30',
      location: '会议室C102',
      type: 'hybrid',
      description: '项目验收会议，采用线上线下结合的方式进行'
    },
    materials: [
      { id: 9, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' },
      { id: 10, name: '用户操作手册.pdf', type: '用户手册', size: 800000, url: '/api/files/download/用户操作手册.pdf', reviewStatus: 'approved' },
      { id: 11, name: '数据备份机制说明.pdf', type: '整改材料', size: 600000, url: '/api/files/download/数据备份机制说明.pdf', reviewStatus: 'pending' },
      { id: 12, name: '系统界面优化报告.docx', type: '整改材料', size: 1200000, url: '/api/files/download/系统界面优化报告.docx', reviewStatus: 'pending' },
      { id: 13, name: '技术文档补充.zip', type: '整改材料', size: 5000000, url: '/api/files/download/技术文档补充.zip', reviewStatus: 'pending' }
    ],
    conclusion: {
      result: 'conditional_passed',
      score: 82,
      time: '2024-01-21',
      description: '项目基本达到验收要求，有条件通过验收。',
              requirements: '1. 完善数据备份机制；2. 优化系统界面布局；3. 30天内提交整改确认。'
    },
    improvementSubmitted: true,
    improvementSubmitTime: '2024-01-28',
          improvementDescription: '针对验收会议提出的整改要求，我们已完成以下工作：\n1. 完善了数据备份机制，增加了自动备份和手动备份功能\n2. 优化了系统界面布局，提升用户交互体验\n3. 补充了相关技术文档和用户手册\n请审核相关材料，如有问题请及时反馈。'
  },
  {
    id: 6,
    name: '移动办公应用系统',
    code: 'PROJ-2024-006',
    year: '2024',
    applicant: '刘涛',
    department: '移动部',
    duration: 14,
    budget: 130,
    currentStatus: 'approval_failed',
    materialStatus: 'approved',
    meetingStatus: 'completed',
    finalResult: 'failed',
    submitTime: '2024-01-05',
    meetingScheduled: true,
    meetingInfo: {
      time: '2024-01-20 10:00',
      location: '会议室A108',
      type: 'offline',
      description: '项目验收会议，重点关注系统稳定性和功能完整性'
    },
    materials: [
      { id: 14, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' }
    ],
    conclusion: {
      result: 'failed',
      score: 68,
      time: '2024-01-20',
      description: '项目验收未通过，系统稳定性有待提升，需要完善相关功能。',
      requirements: '1. 优化系统性能；2. 完善用户界面；3. 补充测试文档。'
    }
  }
])

// 统计数据 - 基于项目列表动态计算
const stats = computed(() => {
  const materialReviewing = projects.value.filter(p => p.currentStatus === 'material_reviewing').length
  const meetingPreparing = projects.value.filter(p => p.currentStatus === 'meeting_preparing').length
  const meetingScheduled = projects.value.filter(p => p.currentStatus === 'meeting_scheduled').length
    const approvalPassed = projects.value.filter(p => p.currentStatus === 'approval_passed').length
  const approvalConditional = projects.value.filter(p => p.currentStatus === 'approval_conditional').length
  const approvalFailed = projects.value.filter(p => p.currentStatus === 'approval_failed').length

  return {
    materialReviewing,
    meetingPreparing,
    meetingScheduled,
    approvalPassed,
    approvalConditional,
    approvalFailed
  }
})



// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})

// 流程说明显示状态
const showFlowDescription = ref(false)

// 专家列表
const expertList = ref([
  { id: 1, name: '张教授', title: '高级工程师' },
  { id: 2, name: '李博士', title: '技术专家' },
  { id: 3, name: '王主任', title: '项目管理专家' }
])

// 主持人选项
const hostOptions = ref([
  { value: '张教授', label: '张教授' },
  { value: '李博士', label: '李博士' },
  { value: '王主任', label: '王主任' },
  { value: '陈院长', label: '陈院长' },
  { value: '刘处长', label: '刘处长' }
])

// 专家选项
const expertOptions = ref([
  { value: '张教授', label: '张教授' },
  { value: '李博士', label: '李博士' },
  { value: '王主任', label: '王主任' },
  { value: '陈院长', label: '陈院长' },
  { value: '刘处长', label: '刘处长' },
  { value: '赵专家', label: '赵专家' },
  { value: '钱专家', label: '钱专家' },
  { value: '孙专家', label: '孙专家' },
  { value: '李专家', label: '李专家' }
])

// 表格列配置
const reviewColumns = [
  {
    title: '年度',
    dataIndex: 'year',
    key: 'year',
    width: 80
  },
  {
    title: '立项名称',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
    key: 'applicant',
    width: 100
  },
  {
    title: '申请单位',
    dataIndex: 'department',
    key: 'department',
    width: 120
  },
  {
    title: '项目周期(月)',
    dataIndex: 'duration',
    key: 'duration',
    width: 100
  },
  {
    title: '预算(万元)',
    dataIndex: 'budget',
    key: 'budget',
    width: 100
  },
  {
    title: '状态',
    key: 'currentStatus',
    width: 120
  },
  {
    title: '立项结论',
    key: 'finalResult',
    width: 120
  },
  {
    title: '申请时间',
    dataIndex: 'submitTime',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
})

// 弹窗状态
const reviewModalVisible = ref(false)
const meetingModalVisible = ref(false)
const resultModalVisible = ref(false)
const improvementReviewModalVisible = ref(false)
const detailModalVisible = ref(false)
const selectedProject = ref(null)

// 表单数据
const reviewForm = ref({
  comments: '',
  result: 'approved',
  rejectionReason: ''
})

// 审核状态备份，用于取消时恢复
const materialStatusBackup = ref(new Map())
const hasAnyChanges = ref(false)

// 驳回意见弹窗状态
const rejectionModalVisible = ref(false)
const currentMaterial = ref(null)
const rejectionForm = ref({
  reason: ''
})

const meetingForm = ref({
  datetime: undefined,
  location: '',
  type: 'offline',
  hosts: [],
  experts: [],
  materials: [],
  description: ''
})

const resultForm = ref({
  conclusion: 'passed',
  score: 85,
  description: '',
  requirements: '',
  conclusionFiles: [] // 结论相关文件
})

const improvementReviewForm = ref({
  result: 'approved',
  comments: '',
  requirements: ''
})

// 文件预览相关
const previewVisible = ref(false)
const currentPreviewFile = ref({})

// 计算属性
const filteredProjects = computed(() => {
  let result = projects.value
  
  if (filters.value.status) {
    result = result.filter(project => project.currentStatus === filters.value.status)
  }
  
  if (filters.value.keyword) {
    result = result.filter(project => 
      project.name.includes(filters.value.keyword) ||
      project.code.includes(filters.value.keyword)
    )
  }
  
  pagination.value.total = result.length
  return result
})

// 检查是否有已审核的材料
const hasReviewedMaterials = computed(() => {
  if (!selectedProject.value?.materials) return false
  return selectedProject.value.materials.some(m => m.reviewStatus && m.reviewStatus !== 'pending')
})

// 自动计算审核结果
const autoReviewResult = computed(() => {
  if (!selectedProject.value?.materials?.length) return 'approved'
  
  // 检查是否有被驳回的材料
  const hasRejectedMaterials = selectedProject.value.materials.some(m => m.reviewStatus === 'rejected')
  
  return hasRejectedMaterials ? 'rejected' : 'approved'
})

// 状态相关方法
const getMaterialStatusColor = (status) => {
  const colorMap = {
    reviewing: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colorMap[status] || 'default'
}

const getMaterialStatusText = (status) => {
  const textMap = {
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回'
  }
  return textMap[status] || '未知'
}

const getMeetingStatusColor = (status) => {
  const colorMap = {
    pending: 'default',
    preparing: 'blue',
    scheduled: 'purple',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getMeetingStatusText = (status) => {
  const textMap = {
    pending: '待安排',
    preparing: '待组织',
    scheduled: '已安排',
    completed: '已完成'
  }
  return textMap[status] || '未知'
}

const getResultColor = (result) => {
  const colorMap = {
    passed: 'green',
    conditional_passed: 'orange',
    failed: 'red'
  }
  return colorMap[result] || 'default'
}

const getResultText = (result) => {
  const textMap = {
    passed: '立项通过',
    conditional_passed: '有条件通过',
    failed: '立项未通过'
  }
  return textMap[result] || '待定'
}

const getStatusColor = (status) => {
  const colorMap = {
    material_reviewing: 'orange',
    meeting_preparing: 'blue',
    meeting_scheduled: 'cyan',
    approval_passed: 'green',
    approval_conditional: 'orange',
    approval_failed: 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    material_reviewing: '材料审核中',
    meeting_preparing: '会议待组织',
    meeting_scheduled: '会议已安排',
    approval_passed: '立项通过',
    approval_conditional: '有条件通过',
    approval_failed: '立项未通过'
  }
  return textMap[status] || '未知状态'
}

// 事件处理方法
const handleBatchReview = () => {
  message.info('批量审核功能')
}

const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

// 项目操作方法
const handleReviewMaterial = (record) => {
  selectedProject.value = record
  
  // 备份当前材料状态
  materialStatusBackup.value.clear()
  hasAnyChanges.value = false
  
  // 初始化材料审核状态并备份
  if (record.materials) {
    record.materials.forEach(material => {
      // 备份原始状态
      materialStatusBackup.value.set(material.id, {
        reviewStatus: material.reviewStatus || 'pending',
        rejectionReason: material.rejectionReason || '',
        showFullReason: material.showFullReason || false
      })
      
      if (!material.reviewStatus) {
        material.reviewStatus = 'pending'
      }
      if (!material.rejectionReason) {
        material.rejectionReason = ''
      }
    })
  }
  
  reviewForm.value = {
    comments: '',
    result: autoReviewResult.value, // 使用自动计算的结果
    rejectionReason: ''
  }
  
  // 如果已有审核记录，自动生成审核意见
  generateOverallComments()
  
  reviewModalVisible.value = true
}

const handleScheduleMeeting = (record) => {
  selectedProject.value = record
  meetingForm.value = {
    datetime: undefined,
    location: '',
    type: 'offline',
    experts: [],
    description: ''
  }
  meetingModalVisible.value = true
}

const handleInputResult = (record) => {
  selectedProject.value = record
  resultForm.value = {
    conclusion: 'passed',
    score: 85,
    description: '',
    requirements: '',
    conclusionFiles: [] // 结论相关文件
  }
  resultModalVisible.value = true
}

const handleViewDetail = (record) => {
  selectedProject.value = record
  detailModalVisible.value = true
}

const handleDetailCancel = () => {
  detailModalVisible.value = false
}

// 处理审核弹窗取消
const handleReviewCancel = () => {
  // 检测是否有变化
  const hasChanges = checkForChanges()
  
  if (hasChanges) {
    // 有变化，弹出确认对话框
    Modal.confirm({
      title: '确认放弃审核？',
      content: '您已对材料进行了审核操作，是否确定放弃本次审核并恢复到审核前状态？',
      okText: '确定放弃',
      cancelText: '继续审核',
      okType: 'danger',
      onOk() {
        // 恢复到备份状态
        restoreToBackup()
        // 关闭弹窗
        reviewModalVisible.value = false
        message.info('已恢复到审核前状态')
      },
      onCancel() {
        // 继续审核，什么都不做
      }
    })
  } else {
    // 没有变化，直接关闭
    reviewModalVisible.value = false
  }
}

// 弹窗处理方法
const handleReviewSubmit = () => {
  // 表单验证
  if (!reviewForm.value.comments.trim()) {
    message.error('请填写审核意见')
    return
  }
  
  // 检查是否有材料被驳回但审核意见不包含驳回原因
  const rejectedMaterials = selectedProject.value?.materials?.filter(m => m.reviewStatus === 'rejected') || []
  if (rejectedMaterials.length > 0) {
    const hasRejectionReasons = rejectedMaterials.every(m => m.rejectionReason?.trim())
    if (!hasRejectionReasons) {
      message.error('存在被驳回的材料但未填写驳回原因，请完善后提交')
      return
    }
  }
  
  // 使用自动计算的审核结果
  reviewForm.value.result = autoReviewResult.value
  
  message.success('材料审核完成')
  reviewModalVisible.value = false
  
  // 更新项目状态
  if (selectedProject.value) {
    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      const currentTime = new Date().toISOString().split('T')[0]
      
      if (reviewForm.value.result === 'approved') {
        // 材料审核通过 → 会议待组织
        projects.value[projectIndex].currentStatus = 'meeting_preparing'
        projects.value[projectIndex].materialStatus = 'approved'
        projects.value[projectIndex].meetingStatus = 'preparing'
        
        // 保存审核记录
        projects.value[projectIndex].reviewHistory = projects.value[projectIndex].reviewHistory || []
        projects.value[projectIndex].reviewHistory.push({
          type: 'material_review',
          result: 'approved',
          comments: reviewForm.value.comments,
          time: currentTime,
          reviewer: '当前管理员'
        })
        
        message.success('材料审核通过，项目进入会议组织阶段')
      } else {
        // 材料审核不通过 → 保持材料审核中状态，等待重新提交
        projects.value[projectIndex].currentStatus = 'material_reviewing'
        projects.value[projectIndex].materialStatus = 'rejected'
        
        // 设置驳回信息，确保申请者能看到详细的驳回原因
        projects.value[projectIndex].materialRejected = true
        projects.value[projectIndex].rejectionInfo = {
          time: currentTime,
          reviewer: '当前管理员',
          comments: reviewForm.value.comments,
          rejectionReason: reviewForm.value.comments // 使用完整的审核意见作为驳回原因
        }
        
        // 保存审核记录
        projects.value[projectIndex].reviewHistory = projects.value[projectIndex].reviewHistory || []
        projects.value[projectIndex].reviewHistory.push({
          type: 'material_review',
          result: 'rejected',
          comments: reviewForm.value.comments,
          rejectionReason: reviewForm.value.comments,
          time: currentTime,
          reviewer: '当前管理员'
        })
        
        message.warning('材料审核不通过，已通知申请人根据意见重新提交材料')
      }
      
      // 保存材料级别的审核结果
      if (projects.value[projectIndex].materials) {
        projects.value[projectIndex].materials.forEach(material => {
          if (material.reviewStatus && material.reviewStatus !== 'pending') {
            material.reviewTime = currentTime
            material.reviewer = '当前管理员'
          }
        })
      }
    }
  }
}



const handleMeetingSubmit = () => {
  message.success('会议安排完成')
  meetingModalVisible.value = false
  
  // 更新项目状态
  if (selectedProject.value) {
    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      // 会议组织完成 → 会议待召开
      projects.value[projectIndex].currentStatus = 'meeting_scheduled'
      projects.value[projectIndex].meetingStatus = 'scheduled'
      projects.value[projectIndex].meetingScheduled = true
      projects.value[projectIndex].meetingInfo = {
        time: meetingForm.value.datetime?.format('YYYY-MM-DD HH:mm'),
        location: meetingForm.value.location,
        type: meetingForm.value.type,
        experts: meetingForm.value.experts,
        description: meetingForm.value.description
      }
    }
  }
}

const handleMeetingCancel = () => {
  meetingModalVisible.value = false
}

// 会议弹窗专用方法
const filterHostOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const filterExpertOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const beforeUploadMaterial = (file) => {
  const isValidType = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed'
  ].includes(file.type)
  
  if (!isValidType) {
    message.error('请上传PDF、Word、PPT、Excel或压缩包格式的文件！')
    return false
  }
  
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB！')
    return false
  }
  
  return false // 阻止自动上传
}

const removeMaterial = (file) => {
  const index = meetingForm.value.materials.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    meetingForm.value.materials.splice(index, 1)
  }
}

const removeMaterialByIndex = (index) => {
  meetingForm.value.materials.splice(index, 1)
}

const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return Math.round(size / 1024) + ' KB'
  } else {
    return Math.round(size / (1024 * 1024)) + ' MB'
  }
}

// 结论文件上传方法
const beforeUploadResultFile = (file) => {
  const isLt20M = file.size / 1024 / 1024 < 20
  if (!isLt20M) {
    message.error('文件大小不能超过20MB!')
    return false
  }
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
    message.error('只支持PDF、Word、Excel格式!')
    return false
  }
  
  resultForm.value.conclusionFiles.push(file)
  message.success(`文件 ${file.name} 添加成功`)
  
  return false
}

const removeResultFile = (file) => {
  const index = resultForm.value.conclusionFiles.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    resultForm.value.conclusionFiles.splice(index, 1)
  }
}

const removeResultFileByIndex = (index) => {
  resultForm.value.conclusionFiles.splice(index, 1)
  message.success('文件删除成功')
}

const handleResultSubmit = () => {
  // 表单验证
  if (!resultForm.value.conclusion) {
    message.error('请选择验收结论')
    return
  }
  if (!resultForm.value.description) {
    message.error('请填写结论说明')
    return
  }
  if (resultForm.value.conclusion !== 'passed' && !resultForm.value.requirements) {
    message.error('请填写整改要求')
    return
  }

  message.success('验收结论录入完成')
  resultModalVisible.value = false
  
  // 更新项目状态 - 根据管理者的结论映射到申请人状态
  if (selectedProject.value) {
    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      projects.value[projectIndex].finalResult = resultForm.value.conclusion
      projects.value[projectIndex].meetingStatus = 'completed'
      
      // 状态映射逻辑
      switch (resultForm.value.conclusion) {
        case 'passed':
          // 立项通过 → 申请人状态：approval_passed
          projects.value[projectIndex].currentStatus = 'approval_passed'
          
          // 🎯 立项通过后自动创建项目并跳转到项目经理后台
          handleAutoCreateProject(projects.value[projectIndex])
          break
        case 'conditional_passed':
          // 有条件通过 → 申请人状态：approval_conditional
          projects.value[projectIndex].currentStatus = 'approval_conditional'
          break
        case 'failed':
          // 立项不通过 → 申请人状态：approval_failed
          projects.value[projectIndex].currentStatus = 'approval_failed'
          break
      }
      
      // 保存验收结论详情
      projects.value[projectIndex].conclusion = {
        result: resultForm.value.conclusion,
        score: resultForm.value.score,
        description: resultForm.value.description,
        requirements: resultForm.value.requirements,
        conclusionFiles: resultForm.value.conclusionFiles,
        time: new Date().toISOString().split('T')[0]
      }
    }
    
    // 这里应该调用API同步状态到申请人端
    // syncStatusToApplicant(selectedProject.value.id, projects.value[projectIndex].currentStatus)
  }
}

// 🎯 自动创建项目并跳转到项目经理后台
const handleAutoCreateProject = async (approvedProject) => {
  try {
    // 构建项目数据
    const projectData = {
      // 基本信息从立项数据中获取
      name: approvedProject.title,
      description: approvedProject.description || '来自立项自动创建的项目',
      budget: approvedProject.budget,
      duration: approvedProject.duration,
      
      // 项目经理信息（申请人即为项目经理）
      manager: approvedProject.applicant,
      managerId: approvedProject.applicantId || approvedProject.id,
      
      // 项目状态和时间
      status: 'active', // 自动设为进行中
      createTime: new Date().toISOString().split('T')[0],
      approvalTime: new Date().toISOString().split('T')[0],
      
      // 立项相关信息
      approvalId: approvedProject.id,
      approvalStatus: 'passed',
      department: approvedProject.department,
      year: approvedProject.year,
      
      // 默认配置
      priority: 'medium',
      template: 'standard',
      autoAssignTeam: true
    }
    
    // 这里应该调用API创建项目
    // const newProject = await createProjectFromApproval(projectData)
    
    message.success({
      content: `项目"${approvedProject.title}"立项通过！项目已自动添加到项目经理后台，可在项目详情管理中进行配置`,
      duration: 6
    })
    
  } catch (error) {
    console.error('自动创建项目失败:', error)
    message.error('项目立项通过，但自动创建项目失败，请手动在项目经理后台创建')
  }
}

const handleResultCancel = () => {
  resultModalVisible.value = false
}

// 整改材料审核弹窗处理方法
const handleImprovementReviewSubmit = () => {
  const result = improvementReviewForm.value.result
  const comments = improvementReviewForm.value.comments.trim()
  const requirements = improvementReviewForm.value.requirements.trim()
  
  // 表单验证
  if (!comments) {
    message.error('请填写审核意见')
    return
  }
  
  if (result === 'rejected' && !requirements) {
    message.error('审核不通过时，请填写新的整改要求')
    return
  }
  
  if (selectedProject.value) {
    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      const currentTime = new Date().toISOString().split('T')[0]
      
      if (result === 'approved') {
        // 整改材料审核通过 → 验收通过
        projects.value[projectIndex].currentStatus = 'approval_passed'
        projects.value[projectIndex].finalResult = 'passed'
        projects.value[projectIndex].conclusion = {
          ...projects.value[projectIndex].conclusion,
          result: 'passed',
          rectificationConfirmed: true,
          rectificationTime: currentTime,
          rectificationComments: comments,
          rectificationRejected: false
        }
        
        // 记录整改材料提交信息
        projects.value[projectIndex].improvementSubmitted = true
        
        message.success('整改材料审核通过，项目验收完成！')
        
        // 🎯 整改通过后也自动创建项目
        handleAutoCreateProject(projects.value[projectIndex])
      } else {
        // 整改材料审核不通过 → 保持有条件通过，记录新的整改要求
        projects.value[projectIndex].conclusion = {
          ...projects.value[projectIndex].conclusion,
          rectificationRejected: true,
          rectificationRejectTime: currentTime,
          rectificationRejectComments: comments,
          newRequirements: requirements,
          // 保持有条件通过状态，等待申请人再次提交整改材料
          result: 'conditional_passed'
        }
        
        message.warning('整改材料审核不通过，已记录新的整改要求，申请人需要重新提交整改材料')
      }
      
      // 这里应该调用API同步状态到申请人端
      // await syncImprovementReviewResult(selectedProject.value.id, {
      //   result: result,
      //   comments: comments,
      //   requirements: requirements,
      //   currentStatus: projects.value[projectIndex].currentStatus
      // })
    }
  }
  
  improvementReviewModalVisible.value = false
}

const handleImprovementReviewCancel = () => {
  improvementReviewModalVisible.value = false
}

const previewMaterial = (material) => {
  // 构建文件信息对象
  currentPreviewFile.value = {
    id: material.id,
    name: material.name,
    type: material.type,
    size: material.size || generateFileSize(material.name),
    url: generateFileUrl(material.name),
    uploadTime: material.uploadTime || '2024-01-15 10:30'
  }
  
  previewVisible.value = true
}

const downloadMaterial = (material) => {
  // 模拟下载
  const link = document.createElement('a')
  link.href = generateFileUrl(material.name)
  link.download = material.name
  link.click()
  
  message.success(`正在下载：${material.name}`)
}

// 处理文件下载事件
const handleDownloadFile = (fileInfo) => {
  downloadMaterial(fileInfo)
}

// 生成模拟文件大小
const generateFileSize = (fileName) => {
  if (fileName.includes('.pdf')) return 2.5 * 1024 * 1024 // 2.5MB
  if (fileName.includes('.docx')) return 1.2 * 1024 * 1024 // 1.2MB
  if (fileName.includes('.pptx')) return 3.8 * 1024 * 1024 // 3.8MB
  if (fileName.includes('.zip')) return 8.5 * 1024 * 1024 // 8.5MB
  return 1.5 * 1024 * 1024 // 默认1.5MB
}

// 生成模拟文件URL
const generateFileUrl = (fileName) => {
  // 实际项目中这里应该是真实的文件下载URL
  return `/api/files/download/${encodeURIComponent(fileName)}`
}

// 材料审核相关方法
const approveMaterial = (material) => {
  material.reviewStatus = 'approved'
  material.rejectionReason = ''
  
  // 检测变化
  checkForChanges()
  
  generateOverallComments()
  message.success(`材料 "${material.name}" 审核通过`)
}

const rejectMaterial = (material) => {
  currentMaterial.value = material
  rejectionForm.value.reason = material.rejectionReason || ''
  rejectionModalVisible.value = true
}

const editRejectionReason = (material) => {
  currentMaterial.value = material
  rejectionForm.value.reason = material.rejectionReason || ''
  rejectionModalVisible.value = true
}

// 切换驳回意见显示
const toggleReasonDisplay = (material) => {
  material.showFullReason = !material.showFullReason
}

// 检测是否有变化
const checkForChanges = () => {
  if (!selectedProject.value?.materials) {
    hasAnyChanges.value = false
    return false
  }
  
  for (const material of selectedProject.value.materials) {
    const backup = materialStatusBackup.value.get(material.id)
    if (!backup) continue
    
    if (
      material.reviewStatus !== backup.reviewStatus ||
      material.rejectionReason !== backup.rejectionReason
    ) {
      hasAnyChanges.value = true
      return true
    }
  }
  
  hasAnyChanges.value = false
  return false
}

// 恢复到备份状态
const restoreToBackup = () => {
  if (!selectedProject.value?.materials) return
  
  selectedProject.value.materials.forEach(material => {
    const backup = materialStatusBackup.value.get(material.id)
    if (backup) {
      material.reviewStatus = backup.reviewStatus
      material.rejectionReason = backup.rejectionReason
      material.showFullReason = backup.showFullReason
    }
  })
  
  hasAnyChanges.value = false
}

const confirmRejection = () => {
  if (!rejectionForm.value.reason.trim()) {
    message.error('请填写驳回原因')
    return
  }
  
  if (currentMaterial.value) {
    currentMaterial.value.reviewStatus = 'rejected'
    currentMaterial.value.rejectionReason = rejectionForm.value.reason
    
    // 检测变化
    checkForChanges()
    
    generateOverallComments()
    message.success(`材料 "${currentMaterial.value.name}" 已驳回`)
  }
  
  rejectionModalVisible.value = false
  currentMaterial.value = null
  rejectionForm.value.reason = ''
}

const cancelRejection = () => {
  rejectionModalVisible.value = false
  currentMaterial.value = null
  rejectionForm.value.reason = ''
}

const approveAllMaterials = () => {
  if (!selectedProject.value?.materials?.length) return
  
  selectedProject.value.materials.forEach(material => {
    material.reviewStatus = 'approved'
    material.rejectionReason = ''
  })
  
  // 检测变化
  checkForChanges()
  
  generateOverallComments()
  message.success('已将所有材料设为通过')
}

const rejectAllMaterials = () => {
  if (!selectedProject.value?.materials?.length) return
  
  // 为所有材料设置默认驳回原因
  selectedProject.value.materials.forEach(material => {
    material.reviewStatus = 'rejected'
    if (!material.rejectionReason) {
      material.rejectionReason = '请参考整体审核意见进行修改'
    }
  })
  
  // 检测变化
  checkForChanges()
  
  // 立即生成审核意见
  generateOverallComments()
  
  message.warning('已将所有材料设为驳回，请在审核意见中补充详细的驳回原因')
}

const regenerateComments = () => {
  generateOverallComments()
  message.success('审核意见已重新生成')
}

const generateOverallComments = () => {
  if (!selectedProject.value?.materials?.length) return
  
  const comments = []
  selectedProject.value.materials.forEach(material => {
    if (material.reviewStatus === 'approved') {
      comments.push(`${material.name} - 审核通过`)
    } else if (material.reviewStatus === 'rejected' && material.rejectionReason) {
      comments.push(`${material.name} - 驳回原因：${material.rejectionReason}`)
    }
  })
  
  if (comments.length > 0) {
    const existingComments = reviewForm.value.comments
    const generatedComments = comments.join('\n')
    
    // 如果现有意见中不包含生成的内容，则更新
    if (!existingComments.includes(generatedComments)) {
      // 保留用户手动添加的其他内容
      const userComments = existingComments
        .split('\n')
        .filter(line => !line.includes(' - 审核通过') && !line.includes(' - 驳回原因：'))
        .join('\n')
        .trim()
      
      reviewForm.value.comments = generatedComments + (userComments ? '\n\n' + userComments : '')
    }
  }
}

// 审核整改材料操作
const handleReviewImprovement = (project) => {
  selectedProject.value = project
  
  // 准备整改审核表单数据
  improvementReviewForm.value = {
    result: 'approved',
    comments: '',
    requirements: ''
  }
  
  // 显示整改材料审核弹窗
  improvementReviewModalVisible.value = true
}

// 重新审核操作
const handleReReview = (project) => {
  selectedProject.value = project
  Modal.confirm({
    title: '重新审核',
    content: `确认对项目"${project.name}"进行重新审核？这将重置项目状态到材料审核阶段。`,
    okText: '确认重审',
    cancelText: '取消',
    onOk() {
      // 重置项目状态到材料审核阶段
      const projectIndex = projects.value.findIndex(p => p.id === project.id)
      if (projectIndex !== -1) {
        projects.value[projectIndex].currentStatus = 'material_reviewing'
        projects.value[projectIndex].materialStatus = 'reviewing'
        projects.value[projectIndex].meetingStatus = 'pending'
        projects.value[projectIndex].finalResult = null
        // 清除之前的结论
        delete projects.value[projectIndex].conclusion
        message.success('项目已重置为材料审核阶段，可重新开始审核流程')
      }
    }
  })
}

// 切换流程说明显示状态
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

// 处理统计卡片点击筛选
const handleStatCardClick = (filterType) => {
  // 清除关键词筛选
  filters.value.keyword = ''
  
  // 直接设置状态筛选
  filters.value.status = filterType
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.acceptance-management-center {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border-radius: 12px;
  color: #fff;
  font-size: 18px;
}

.page-description {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 统计概览样式 */
.stats-overview {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: rgba(35, 79, 162, 0.2);
}

.stat-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.pending:hover {
  background: linear-gradient(135deg, #fff7e6 0%, #fff2e6 100%);
}

.stat-card.reviewing:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.stat-card.scheduled:hover {
  background: linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%);
}

.stat-card.completed:hover {
  background: linear-gradient(135deg, #f6ffed 0%, #efffef 100%);
}

.stat-card.conditional:hover {
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
}

.stat-card.rejected:hover {
  background: linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 20px;
}

.stat-card.pending .stat-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-card.reviewing .stat-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-card.scheduled .stat-icon {
  background: #e6fffb;
  color: #13c2c2;
}

.stat-card.completed .stat-icon {
  background: #f6ffed;
  color: #52c41a;
}

.stat-card.conditional .stat-icon {
  background: #fffbe6;
  color: #faad14;
}

.stat-card.rejected .stat-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

/* 项目审核管理区域样式 */
.project-review-list {
  padding: 0 24px 24px 24px;
}

/* 内容卡片样式 */
.content-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-filters {
  display: flex;
  gap: 12px;
}



/* 流程说明样式 */
.flow-description {
  margin-bottom: 24px;
}

.flow-content {
  padding: 24px;
}

.status-legend {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.status-legend h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: #f0f9ff;
  border-color: #91d5ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.legend-item span {
  font-size: 13px;
  color: #595959;
}

/* 项目信息样式 */
.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: #262626;
}

.project-code {
  font-size: 12px;
  color: #8c8c8c;
}

.text-muted {
  color: #8c8c8c;
}

/* 弹窗样式 */
.review-modal,
.meeting-modal,
.result-modal,
.improvement-review-modal {
  padding: 16px 0;
}

.project-basic-info,
.material-review-section,
.review-comments-section,
.review-result-section,
.project-meeting-info,
.original-requirements,
.improvement-materials,
.improvement-description {
  margin-bottom: 24px;
}

.project-basic-info h4,
.material-review-section h4,
.review-comments-section h4,
.review-result-section h4,
.project-meeting-info h4,
.original-requirements h4,
.improvement-materials h4,
.improvement-description h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.material-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  gap: 16px;
}

.material-info {
  flex: 1;
}

.material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.material-type {
  font-size: 12px;
  color: #8c8c8c;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.material-review {
  width: 120px;
}

/* 材料审核区域优化样式 */
.material-review-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.material-review-section .section-header h4 {
  margin: 0;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.material-review-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rejection-reason {
  margin-top: 8px;
  padding: 8px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  font-size: 12px;
}

.reason-label {
  font-weight: 500;
  color: #ff4d4f;
  margin-bottom: 4px;
}

.reason-content {
  color: #262626;
  line-height: 1.4;
}

/* 驳回意见弹窗样式 */
.rejection-form .material-info h4 {
  margin: 0 0 4px 0;
  color: #262626;
  font-size: 16px;
}

.rejection-form .material-type {
  margin: 0 0 16px 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 审核意见区域优化样式 */
.review-comments-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-comments-section .section-header h4 {
  margin: 0;
}

.comments-tip {
  margin-top: 12px;
}

/* 自动审核结果样式 */
.auto-result-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-tip {
  color: #8c8c8c;
  font-size: 12px;
}

/* 材料审核状态显示样式 */
.review-status-display {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.status-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-width: 60px;
}

.status-option:hover {
  border-color: #4096ff;
  box-shadow: 0 1px 4px rgba(64, 150, 255, 0.15);
  transform: translateY(-1px);
  background: #f8f9fa;
}

.status-icon {
  font-size: 18px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.status-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* 选中状态样式 - 专业严肃风格 */
.status-active {
  transform: scale(1.02);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.status-approved.status-active {
  border-color: #1c7430;
  background: #f0f9f0;
  box-shadow: 0 2px 6px rgba(28, 116, 48, 0.15);
}

.status-approved.status-active .status-text {
  color: #1c7430;
  font-weight: 600;
}

.status-approved.status-active .status-icon {
  font-size: 18px;
  color: #1c7430;
}

.status-rejected.status-active {
  border-color: #a61e1e;
  background: #fef0f0;
  box-shadow: 0 2px 6px rgba(166, 30, 30, 0.15);
}

.status-rejected.status-active .status-text {
  color: #a61e1e;
  font-weight: 600;
}

.status-rejected.status-active .status-icon {
  font-size: 18px;
  color: #a61e1e;
}

.status-pending.status-active {
  border-color: #b7860a;
  background: #fefbf0;
  box-shadow: 0 2px 6px rgba(183, 134, 10, 0.15);
}

.status-pending.status-active .status-text {
  color: #b7860a;
  font-weight: 600;
}

.status-pending.status-active .status-icon {
  font-size: 18px;
  color: #b7860a;
}

.edit-opinion-btn {
  margin-top: 8px;
}

/* 驳回意见显示优化 */
.rejection-reason {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #d9d9d9;
}

.reason-label {
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
  font-size: 12px;
}

.reason-content {
  position: relative;
}

.reason-text {
  color: #333;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
  /* 默认显示省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reason-text.reason-expanded {
  /* 展开时显示全部 */
  display: block;
  -webkit-line-clamp: none;
}

.toggle-reason-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0 4px;
  height: 20px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.9);
}

/* 审核意见文本框优化 */
.review-comments-textarea {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

.review-comments-textarea .ant-input {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 整改材料审核弹窗特定样式 */
.improvement-review-modal .project-basic-info h4,
.improvement-review-modal .original-requirements h4,
.improvement-review-modal .improvement-materials h4,
.improvement-review-modal .improvement-description h4,
.improvement-review-modal .review-result-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.original-requirements .requirements-content {
  margin-bottom: 16px;
}

.improvement-materials-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.improvement-material {
  border: 1px solid #e8f4f8;
  background: #f8fdff;
  position: relative;
}

.improvement-material::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #1890ff;
  border-radius: 2px 0 0 2px;
}

.improvement-material .material-info {
  flex: 1;
}

.improvement-material .material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.improvement-material .material-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.improvement-material .material-type {
  background: #1890ff;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.improvement-material .material-size {
  font-size: 12px;
  color: #8c8c8c;
}

.improvement-material .material-time {
  font-size: 12px;
  color: #8c8c8c;
}

.improvement-description-card {
  border: 1px solid #f0f0f0;
  background: #fafafa;
}

.improvement-content {
  line-height: 1.6;
}

.improvement-details {
  margin: 12px 0;
  padding-left: 16px;
}

.improvement-details p {
  margin: 8px 0;
  color: #595959;
}

.improvement-submit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #8c8c8c;
}

.review-result-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.review-option:hover {
  border-color: #1890ff;
  background: #f6ffed;
}

.review-option.ant-radio-wrapper-checked {
  border-color: #1890ff;
  background: #e6f7ff;
}

.required {
  color: #ff4d4f;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .approval-management-center {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-filters {
    flex-direction: column;
  }
  
  .stats-overview .ant-col {
    margin-bottom: 16px;
  }
  
  .material-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .legend-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .legend-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .legend-item {
    padding: 8px 12px;
  }
}

/* 详情弹窗样式 */
.detail-modal {
  max-height: 70vh;
  overflow-y: auto;
  padding: 16px 0;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-section .material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section .material-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  gap: 16px;
  transition: all 0.3s ease;
}

.detail-section .material-item:hover {
  background: #f0f9ff;
  border-color: #91d5ff;
}

.detail-section .material-info {
  flex: 1;
}

.detail-section .material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section .material-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.detail-section .material-type {
  font-size: 12px;
  color: #8c8c8c;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.detail-section .material-actions {
  display: flex;
  gap: 8px;
}

.requirements-text {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  padding: 12px;
  color: #d46b08;
  line-height: 1.6;
}

.improvement-text {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: 12px;
  color: #389e0d;
  line-height: 1.6;
  white-space: pre-line;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #8c8c8c;
}

/* 详情弹窗响应式设计 */
@media (max-width: 768px) {
  .detail-modal {
    max-height: 60vh;
  }
}

/* 会议弹窗表单提示样式 */
.form-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  line-height: 1.4;
}

/* 会议资料上传样式 */
.meeting-materials {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 8px;
}

.materials-list {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.materials-list .material-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.materials-list .material-item:last-child {
  border-bottom: none;
}

.materials-list .file-icon {
  color: #1890ff;
  font-size: 16px;
}

.materials-list .file-name {
  flex: 1;
  font-weight: 500;
  color: #262626;
}

.materials-list .file-size {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式设计继续 */
@media (max-width: 768px) {
  .detail-section .material-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .detail-section .material-actions {
    justify-content: flex-start;
  }
}

/* 新增步骤描述样式 */
.step-description {
  text-align: center;
}

.step-status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
  justify-content: center;
}

.step-status-tags .ant-tag {
  margin: 0;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 审核不通过详细说明样式 */
.rejection-details {
  margin-top: 16px;
  padding: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
}

.rejection-details .ant-form-item {
  margin-bottom: 0;
}

/* 自定义弹窗底部样式 */
.modal-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

/* 结论文件上传样式 */
.conclusion-files {
  margin-top: 16px;
}

.conclusion-files .files-list {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.conclusion-files .file-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.conclusion-files .file-item:last-child {
  border-bottom: none;
}

.conclusion-files .file-icon {
  color: #1890ff;
  font-size: 16px;
}

.conclusion-files .file-name {
  flex: 1;
  font-weight: 500;
  color: #262626;
}

.conclusion-files .file-size {
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 8px;
}
</style> 