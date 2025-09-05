<!--
 * @file 进展监控与审查步骤组件
 * @description 观察整体任务进展情况，查看成员每周工作提报，进行实质性内容审查
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="progress-monitoring-step">
    <!-- 步骤说明 -->
    <div class="step-description">
      <h3>进展监控与审查</h3>
      <p>观察整体任务进展情况，查看各团队成员的每周阶段性工作提报，支持点击审查，弹窗详细查看成员提交内容，进行实质性内容审查。</p>
    </div>

    <!-- 整体进展概览 -->
    <a-card title="整体进展概览" class="overview-card" :bordered="false">
      <div class="progress-overview">
        <div class="progress-stats">
          <a-row :gutter="16">
            <a-col :span="4">
              <div class="stat-card clickable" @click="handleStatClick('total')">
              <a-statistic 
                title="总任务" 
                :value="combinedStats.totalTasks"
                :value-style="{ color: '#234fa2' }"
              >
                <template #suffix>个</template>
              </a-statistic>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="stat-card clickable" @click="handleStatClick('completed')">
              <a-statistic 
                title="已完成" 
                :value="combinedStats.completedTasks"
                :value-style="{ color: '#52c41a' }"
              >
                <template #suffix>个</template>
              </a-statistic>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="stat-card clickable" @click="handleStatClick('inProgress')">
              <a-statistic 
                title="进行中" 
                :value="combinedStats.inProgressTasks"
                  :value-style="{ color: '#1890ff' }"
              >
                <template #suffix>个</template>
              </a-statistic>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="stat-card clickable" @click="handleStatClick('pending')">
              <a-statistic 
                title="待开始" 
                :value="combinedStats.pendingTasks"
                :value-style="{ color: '#8c8c8c' }"
              >
                <template #suffix>个</template>
              </a-statistic>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="stat-card clickable urgent" @click="handleStatClick('dueSoon')">
                <a-statistic 
                  title="临近到期" 
                  :value="combinedStats.dueSoonTasks"
                  :value-style="{ color: '#fa8c16' }"
                >
                  <template #suffix>个</template>
                </a-statistic>
                <div v-if="combinedStats.dueSoonTasks > 0" class="stat-indicator urgent"></div>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="stat-card clickable overdue" @click="handleStatClick('overdue')">
                <a-statistic 
                  title="逾期任务" 
                  :value="combinedStats.overdueTasks"
                  :value-style="{ color: '#ff4d4f' }"
                >
                  <template #suffix>个</template>
                </a-statistic>
                <div v-if="combinedStats.overdueTasks > 0" class="stat-indicator overdue"></div>
              </div>
            </a-col>
          </a-row>
        </div>
        
        <div class="progress-bar-section">
          <div class="progress-label">
            <span>整体完成度：{{ combinedStats.overallProgress }}%（基于已完成任务数）</span>
          </div>
          <a-progress 
            :percent="combinedStats.overallProgress" 
            :stroke-color="{
              '0%': '#108ee9',
              '100%': '#87d068',
            }"
            :stroke-width="8"
          />
          
          <!-- 全新统一时间轴 -->
          <div v-if="completeTimeRange" class="unified-timeline-axis">
            <div class="timeline-header">
              <span class="timeline-title">📅 项目时间轴（统一显示所有时间信息）</span>
              <span class="timeline-duration">总工期：{{ completeTimeRange.durationDays }} 天 ({{ completeTimeRange.projectStartStr }} ~ {{ completeTimeRange.projectEndStr }})</span>
            </div>
            
            <div class="timeline-container">
              <!-- 主时间轴线 -->
              <div class="timeline-main-track"></div>
              
              <!-- 时间轴起止标记（智能显示，避免与事件重复） -->
              <div class="timeline-boundaries">
                <div 
                  v-if="!hasEventAtBoundary('start')"
                  class="boundary-marker start-boundary" 
                  style="left: 5%"
                >
                  <div class="boundary-icon">📍</div>
                  <span class="boundary-date">{{ completeTimeRange.projectStartStr }}</span>
                  <span class="boundary-label">项目最早</span>
                  </div>
                <div 
                  v-if="!hasEventAtBoundary('end')"
                  class="boundary-marker end-boundary" 
                  style="right: 5%"
                >
                  <div class="boundary-icon">🏁</div>
                  <span class="boundary-date">{{ completeTimeRange.projectEndStr }}</span>
                  <span class="boundary-label">项目最晚</span>
                </div>
                  </div>
              
              <!-- 时间事件点（支持纵向排列） -->
              <div class="timeline-events">
                <div 
                  v-for="group in timelineWithCurrentTime" 
                  :key="`event-group-${group.dateStr}`"
                  class="event-group"
                  :class="{
                    'high-density-group': group.isHighDensity,
                    [`density-${group.densityLevel}`]: group.densityLevel 
                  }"
                  :style="{ left: `${group.position}%` }"
                  @mouseenter.stop="showEventDetails(group)"
                  @mouseleave.stop="hideEventDetails"
                >
                  <!-- 纵向排列的事件点（修复重叠问题） -->
                  <div class="event-stack">
                    <div 
                      v-for="(event, index) in group.events" 
                      :key="`event-${index}`"
                      class="event-point"
                      :class="[
                        `event-${event.type}`,
                        { 'overflow-indicator': event.isOverflowIndicator }
                      ]"
                      :style="{ zIndex: 100 + index }"
                      @click="handleEventClick(event, group)"
                    >
                      <span class="event-icon">{{ event.icon }}</span>
                      <!-- 溢出指示器的数量标识 -->
                      <span v-if="event.isOverflowIndicator" class="overflow-count">
                        {{ group.eventCount }}
                      </span>
                  </div>
                </div>
                  
                  <!-- 日期标签 -->
                  <div class="event-date-label">
                    {{ group.dateStr }}
                  </div>
                  
                  <!-- 事件数量徽章（仅在高密度且没有溢出指示器时显示） -->
                  <div v-if="group.isHighDensity && !group.hasOverflow" class="event-count-badge">
                    {{ group.eventCount }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无时间设置提示 -->
          <div v-else class="no-timeline-tip">
            <a-alert 
              message="提示：任务计划中暂无时间设置" 
              description="请在【任务计划与分配】页面为任务设置开始时间、结束时间或截止时间，以显示项目时间轴。"
              type="info" 
              show-icon 
              style="margin-top: 16px;"
            />
          </div>
        </div>
      </div>
    </a-card>


    <!-- 工作提报情况 -->
    <a-card :title="getReportsCardTitle()" class="submissions-card" :bordered="false">
      <!-- 筛选和视图控制区域 -->
      <div class="filter-control-section">
        <a-row :gutter="24" align="middle">
          <!-- 时间筛选 -->
          <a-col :span="10">
            <div class="filter-section">
              <span class="filter-label">时间范围：</span>
              <a-space>
                <a-radio-group v-model:value="timeFilter" @change="handleTimeFilterChange">
                  <a-radio-button value="week">本周</a-radio-button>
                  <a-radio-button value="month">本月</a-radio-button>
                  <a-radio-button value="custom">自定义</a-radio-button>
                </a-radio-group>
                <a-range-picker
                  v-if="timeFilter === 'custom'"
                  v-model:value="customTimeRange"
                  @change="handleCustomTimeChange"
                  :placeholder="['开始日期', '结束日期']"
                  size="small"
                />
              </a-space>
            </div>
          </a-col>

          <!-- 视图切换 -->
          <a-col :span="8">
            <div class="view-section">
              <span class="filter-label">查看方式：</span>
              <a-segmented
                v-model:value="viewMode"
                :options="viewOptions"
                @change="handleViewModeChange"
                size="small"
              />
            </div>
          </a-col>

          <!-- 状态筛选和搜索 -->
          <a-col :span="6">
            <a-space>
              <a-select v-model:value="filterStatus" style="width: 100px" @change="handleFilterChange" size="small">
                <a-select-option value="all">全部状态</a-select-option>
                <a-select-option value="pending">待审查</a-select-option>
                <a-select-option value="reviewed">已审查</a-select-option>
              </a-select>
              <a-input-search 
                v-model:value="searchKeyword" 
                placeholder="搜索成员或任务"
                style="width: 160px"
                @search="handleSearch"
                size="small"
              />
            </a-space>
          </a-col>
        </a-row>

        <!-- 筛选结果统计 -->
        <div class="filter-stats">
          <a-space>
            <a-tag color="blue" size="small">
              <CalendarOutlined />
              {{ getTimeRangeText() }}
            </a-tag>
            <a-tag color="green" size="small">
              <FileTextOutlined />
              共 {{ filteredReports.length }} 条提报
            </a-tag>
            <a-tag color="orange" size="small">
              <UserOutlined />
              {{ getActiveMembers() }} 人参与
            </a-tag>
          </a-space>
        </div>
      </div>

      

      <!-- 任务视图 -->
      <div v-if="viewMode === 'task' && filteredReports.length > 0" class="task-view">
        <div v-for="task in groupedByTask" :key="task.taskId" class="task-group">
          <div class="task-header">
            <h4>{{ task.taskTitle }}</h4>
            <a-tag color="blue">{{ task.reports.length }} 条提报</a-tag>
          </div>
          <div class="task-reports">
            <div 
              v-for="report in task.reports" 
              :key="report.id"
              class="report-item"
              :class="{ 'reviewed': report.status === 'reviewed' }"
            >
              <div class="report-header">
                <div class="reporter-info">
                  <a-avatar size="small">{{ report.submittedByName.charAt(0) }}</a-avatar>
                  <div class="reporter-details">
                    <span class="reporter-name">{{ report.submittedByName }}</span>
                    <span class="submit-time">{{ report.submitTime }}</span>
                  </div>
                </div>
                <div class="report-status">
                  <a-tag :color="getSubmissionStatusColor(report.status)">
                    {{ getSubmissionStatusText(report.status) }}
                  </a-tag>
                </div>
              </div>
              <div class="report-content">
                <p>{{ report.contentSummary }}</p>
              </div>
              <div class="report-actions">
                <a-button size="small" type="link" @click="handleReviewDetail(report)">
                  查看详情
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 人员视图 -->
      <div v-else-if="viewMode === 'member' && filteredReports.length > 0" class="member-view">
        <div v-for="member in groupedByMember" :key="member.memberId" class="member-group">
          <div class="member-header">
            <div class="member-info">
              <a-avatar>{{ member.memberName.charAt(0) }}</a-avatar>
              <div class="member-details">
                <h4>{{ member.memberName }}</h4>
                <span class="member-role">{{ member.memberRole || '团队成员' }}</span>
              </div>
            </div>
            <div class="member-stats">
              <a-tag color="green">{{ member.reports.length }} 条提报</a-tag>
              <a-tag color="orange">{{ member.pendingCount }} 待审查</a-tag>
            </div>
          </div>
          <div class="member-reports">
            <div 
              v-for="report in member.reports" 
              :key="report.id"
              class="report-item"
              :class="{ 'reviewed': report.status === 'reviewed' }"
            >
              <div class="report-header">
                <div class="task-info">
                  <span class="task-title">{{ report.taskTitle }}</span>
                  <span class="submit-time">{{ report.submitTime }}</span>
                </div>
                <div class="report-status">
                  <a-tag :color="getSubmissionStatusColor(report.status)">
                    {{ getSubmissionStatusText(report.status) }}
                  </a-tag>
                </div>
              </div>
              <div class="report-content">
                <p>{{ report.contentSummary }}</p>
              </div>
              <div class="report-actions">
                <a-button size="small" type="link" @click="handleReviewDetail(report)">
                  查看详情
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 原有的列表视图（作为备用） -->
      <div v-else-if="filteredReports.length > 0" class="submissions-list">
        <div 
          v-for="submission in filteredReports" 
          :key="submission.id"
          class="submission-item"
          :class="{ 'reviewed': submission.status === 'reviewed' }"
        >
          <div class="submission-header">
            <div class="submitter-info">
              <a-avatar size="small">{{ submission.submittedByName.charAt(0) }}</a-avatar>
              <div class="submitter-details">
                <h4>{{ submission.submittedByName }} - {{ submission.taskTitle }}</h4>
                <p class="submit-time">提交时间：{{ submission.submitTime }}</p>
              </div>
            </div>
            <div class="submission-status">
              <a-tag :color="getSubmissionStatusColor(submission.status)">
                {{ getSubmissionStatusText(submission.status) }}
              </a-tag>
              <a-tag v-if="submission.rating" :color="getRatingColor(submission.rating)">
                {{ getRatingText(submission.rating) }}
              </a-tag>
            </div>
          </div>

          <div class="submission-content">
            <div class="content-summary">
              <span class="label">内容摘要：</span>
              <span class="summary-text">{{ submission.contentSummary }}</span>
            </div>
            
            <div v-if="submission.attachments && submission.attachments.length > 0" class="attachments">
              <span class="label">附件：</span>
              <div class="attachment-list">
                <a-tag 
                  v-for="attachment in submission.attachments" 
                  :key="attachment"
                  color="blue"
                  class="attachment-tag"
                >
                  <PaperClipOutlined />
                  {{ attachment }}
                </a-tag>
              </div>
            </div>
          </div>

          <div class="submission-actions">
            <a-space>
              <a-button 
                type="primary" 
                size="small" 
                @click="handleReviewSubmission(submission)"
                :disabled="submission.status === 'reviewed'"
              >
                <EyeOutlined />
                {{ submission.status === 'reviewed' ? '查看审查' : '点击审查' }}
              </a-button>
              <a-button size="small" @click="handleViewDetails(submission)">
                <FileTextOutlined />
                查看详情
              </a-button>
              <a-dropdown v-if="submission.status === 'reviewed'">
                <a-button size="small">
                  更多 <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="handleReReview(submission)">
                      <EditOutlined />
                      重新审查
                    </a-menu-item>
                    <a-menu-item @click="handleDownloadAttachments(submission)">
                      <DownloadOutlined />
                      下载附件
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-submissions">
        <a-empty :description="getEmptyDescription()">
          <a-button @click="handleRefreshSubmissions">
            刷新数据
          </a-button>
        </a-empty>
      </div>
    </a-card>

    <!-- 操作按钮已移除 - 无实际业务功能 -->

    <!-- 增强版审查详情弹窗（项目负责人视角） -->
    <a-modal
      v-model:open="reviewDetailVisible"
      :title="`提交记录与审查管理 - ${currentReviewItem?.submittedByName}`"
      width="1200px"
      :footer="null"
      class="enhanced-review-modal"
    >
      <div v-if="currentReviewItem" class="enhanced-review-content">
        <!-- 顶部概览信息 -->
        <div class="submission-overview">
          <a-row :gutter="16">
            <a-col :span="18">
              <a-descriptions :column="3" bordered size="small">
                <a-descriptions-item label="提交人">
                  <a-avatar size="small">{{ currentReviewItem.submittedByName.charAt(0) }}</a-avatar>
                  {{ currentReviewItem.submittedByName }}
                </a-descriptions-item>
            <a-descriptions-item label="关联任务">{{ currentReviewItem.taskTitle }}</a-descriptions-item>
                <a-descriptions-item label="当前状态">
              <a-tag :color="getSubmissionStatusColor(currentReviewItem.status)">
                {{ getSubmissionStatusText(currentReviewItem.status) }}
              </a-tag>
            </a-descriptions-item>
                <a-descriptions-item label="最新提交">{{ currentReviewItem.submitTime }}</a-descriptions-item>
                <a-descriptions-item label="总版本数">{{ mockSubmissionHistory.length }} 个版本</a-descriptions-item>
                <a-descriptions-item label="审查次数">{{ mockReviewHistory.length }} 次审查</a-descriptions-item>
          </a-descriptions>
            </a-col>
            <a-col :span="6">
              <div class="quick-actions">
                <a-space direction="vertical" style="width: 100%">
                  <a-button type="primary" block @click="handleQuickApprove">
                    ✅ 快速通过
                  </a-button>
                  <a-button block @click="handleQuickReject">
                    ❌ 要求修改
                  </a-button>
                  <a-button block @click="handleCompareVersions" :disabled="mockSubmissionHistory.length < 2">
                    🔍 版本对比
                  </a-button>
                </a-space>
              </div>
            </a-col>
          </a-row>
        </div>

        <!-- 主要内容区域：选项卡布局 -->
        <div class="main-content-area">
          <a-tabs v-model:activeKey="activeTabKey" type="card">
            <!-- 当前提交内容 -->
            <a-tab-pane key="current" tab="📝 当前提交">
              <div class="current-submission-content">
                <div class="version-badge">
                  <a-tag color="blue" size="large">{{ currentSubmissionVersion }} - 最新版本</a-tag>
                  <span class="submission-time">{{ currentReviewItem.submitTime }}</span>
                </div>

                <!-- 格式化提报内容（当前版本） -->
                <div class="formatted-report-content">
          <div class="report-section">
            <h5>🔍 发现结论</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.findings || '完成了核心模块的架构设计，确定了系统的整体技术方案和实现路径。' }}
            </div>
          </div>

          <div class="report-section">
            <h5>📝 详细描述</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.details || '本周主要完成了用户管理、权限控制、数据流转等关键组件的详细设计。采用微服务架构，确保系统的可扩展性和维护性。设计了统一的API接口规范，为后续开发奠定了基础。' }}
            </div>
          </div>

          <div class="report-section">
            <h5>🔗 发现来源</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.sources || '通过对现有系统的深入分析，结合业务需求调研结果，参考了业界最佳实践和技术标准。主要依据包括：需求分析文档、技术调研报告、系统现状评估报告。' }}
            </div>
          </div>

          <div class="report-section">
            <h5>📋 下一步计划</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.nextSteps || '1. 完成详细的接口设计文档；2. 开始核心模块的编码实现；3. 搭建开发环境和CI/CD流程；4. 与前端团队对接接口规范。预计下周完成接口设计，两周内开始编码工作。' }}
            </div>
          </div>

          <div class="report-section">
            <h5>⚠️ 遇到的困难</h5>
            <div class="section-content">
              {{ currentReviewItem.formattedContent?.difficulties || '在技术选型过程中遇到了一些挑战：1. 部分第三方组件的兼容性问题需要进一步验证；2. 性能要求与开发周期之间需要平衡；3. 团队成员对新技术栈的熟悉程度有待提升。已制定相应的解决方案和培训计划。' }}
            </div>
          </div>

          <!-- 附件 -->
          <div v-if="currentReviewItem.attachments && currentReviewItem.attachments.length > 0" class="attachments-section">
            <h5>📎 附件</h5>
            <div class="attachment-list">
              <div 
                v-for="attachment in currentReviewItem.attachments" 
                :key="attachment"
                class="attachment-item"
              >
                <a-button type="link" size="small" @click="handleDownloadAttachment(attachment)">
                  <PaperClipOutlined />
                  {{ attachment }}
                </a-button>
              </div>
            </div>
          </div>
        </div>
              </div>
            </a-tab-pane>

            <!-- 提交与审查历史（融合版） -->
            <a-tab-pane key="timeline" tab="📋 提交与审查历史">
              <div class="unified-history-content">
                <!-- 统计概览 -->
                <div class="history-stats">
                  <a-row :gutter="16">
                    <a-col :span="4">
                      <a-statistic title="提交版本" :value="mockSubmissionHistory.length" suffix="个" />
                    </a-col>
                    <a-col :span="4">
                      <a-statistic title="审查次数" :value="mockReviewHistory.length" suffix="次" />
                    </a-col>
                    <a-col :span="4">
                      <a-statistic title="通过次数" :value="mockReviewHistory.filter(r => r.action === 'approve').length" suffix="次" />
                    </a-col>
                    <a-col :span="4">
                      <a-statistic title="修改要求" :value="mockReviewHistory.filter(r => r.action === 'reject').length" suffix="次" />
                    </a-col>
                    <a-col :span="4">
                      <a-statistic title="平均周期" value="1.5" suffix="天" />
                    </a-col>
                    <a-col :span="4">
                      <div class="timeline-controls">
                        <a-button size="small" type="primary" @click="handleExpandAllSubmissions">
                          {{ allExpanded ? '收起全部' : '展开全部' }}
                        </a-button>
                      </div>
                    </a-col>
                  </a-row>
                </div>

                <!-- 优化版本审查关联视图 -->
                <div class="version-review-cards">
                  
                  <!-- 当前版本卡片（v3.0 - 待审查） -->
                  <div class="version-card current-version">
                    <div class="version-card-header">
                      <div class="version-info">
                        <span class="version-tag current">v3.0</span>
                        <span class="version-time">2025-08-28 14:30</span>
                        <span class="version-status pending">待审查</span>
                      </div>
                      <div class="version-actions">
                        <a-button size="small" @click="toggleSubmissionDetail('SUB003')">
                          {{ expandedSubmissions.includes('SUB003') ? '收起' : '详情' }}
                        </a-button>
                        <a-button size="small" type="primary">立即审查</a-button>
                      </div>
                    </div>
                    
                    <div class="version-content">
                      <div class="submission-section">
                        <h6>📝 提交内容</h6>
                        <p class="version-note">根据第二次审查意见进一步完善</p>
                        <p class="submission-summary">完善了性能优化方案，增加了详细的索引策略和分区方案，补充了读写分离架构设计。</p>
                        
                        <!-- 详细内容展开 -->
                        <div v-if="expandedSubmissions.includes('SUB003')" class="submission-detail">
                          <div class="detail-sections">
                            <div class="detail-section">
                              <strong>🔍 发现结论：</strong>
                              <p>完成了数据库性能优化的全面设计，确定了分区策略和索引优化方案...</p>
                            </div>
                            <div class="detail-section">
                              <strong>📝 主要改进：</strong>
                              <ul>
                                <li>补充了详细的复合索引设计方案</li>
                                <li>增加了表分区策略和分片规则</li>
                                <li>设计了读写分离架构</li>
                                <li>制定了性能监控和优化计划</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div class="submission-meta">
                          <span class="meta-item">5个附件</span>
                          <span class="meta-item">3200字</span>
                          <span class="meta-item">比v2.0新增400字</span>
                        </div>
                      </div>
                      
                      <!-- 当前版本没有审查记录 -->
                      <div class="review-section empty">
                        <h6>🔍 审查状态</h6>
                        <p class="no-review">暂未审查，等待项目负责人审查</p>
                      </div>
                    </div>
                  </div>

                  <!-- v2.0版本卡片（已被要求修改） -->
                  <div class="version-card rejected-version">
                    <div class="version-card-header">
                      <div class="version-info">
                        <span class="version-tag rejected">v2.0</span>
                        <span class="version-time">2025-08-21 10:00</span>
                        <span class="version-status rejected">要求修改</span>
                      </div>
                      <div class="version-actions">
                        <a-button size="small" @click="toggleSubmissionDetail('SUB002')">
                          {{ expandedSubmissions.includes('SUB002') ? '收起' : '详情' }}
                        </a-button>
                      </div>
                    </div>
                    
                    <div class="version-content">
                      <div class="submission-section">
                        <h6>📝 提交内容</h6>
                        <p class="version-note">根据初次反馈修改的版本</p>
                        <p class="submission-summary">完善了表结构设计，增加了基础索引策略，但性能优化部分仍需完善。</p>
                        
                        <div v-if="expandedSubmissions.includes('SUB002')" class="submission-detail">
                          <p class="detail-note">此版本针对v1.0审查意见进行了改进，但在性能优化方面仍有不足。</p>
                        </div>
                        
                        <div class="submission-meta">
                          <span class="meta-item">3个附件</span>
                          <span class="meta-item">2800字</span>
                          <span class="meta-item">比v1.0新增1000字</span>
                        </div>
                      </div>
                      
                      <!-- v2.0的审查记录 -->
                      <div class="review-section rejected">
                        <div class="review-header">
                          <h6>🔍 审查结果</h6>
                          <div class="review-meta">
                            <span class="reviewer">项目负责人</span>
                            <span class="review-time">2025-08-21 14:30</span>
                          </div>
                        </div>
                        
                        <div class="review-content">
                          <div class="review-opinion">
                            <strong>审查意见：</strong>
                            <p>数据库设计方案需要进一步完善，缺少关键的性能优化考虑。</p>
                          </div>
                          <div class="review-requirements">
                            <strong>修改要求：</strong>
                            <ol>
                              <li>补充详细的索引设计方案</li>
                              <li>增加分区策略和分片规则</li>
                              <li>考虑读写分离架构设计</li>
                              <li>增加性能测试和监控计划</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- v1.0版本卡片（已通过） -->
                  <div class="version-card approved-version">
                    <div class="version-card-header">
                      <div class="version-info">
                        <span class="version-tag approved">v1.0</span>
                        <span class="version-time">2025-08-20 14:00</span>
                        <span class="version-status approved">已通过</span>
                      </div>
                      <div class="version-actions">
                        <a-button size="small" @click="toggleSubmissionDetail('SUB001')">
                          {{ expandedSubmissions.includes('SUB001') ? '收起' : '详情' }}
                        </a-button>
                      </div>
                    </div>
                    
                    <div class="version-content">
                      <div class="submission-section">
                        <h6>📝 提交内容</h6>
                        <p class="version-note">初始版本提交</p>
                        <p class="submission-summary">包含基础的表结构设计和简单的数据关系建模。</p>
                        
                        <div v-if="expandedSubmissions.includes('SUB001')" class="submission-detail">
                          <p class="detail-note">首次提交的数据库设计方案，建立了基本的系统架构框架。</p>
                        </div>
                        
                        <div class="submission-meta">
                          <span class="meta-item">2个附件</span>
                          <span class="meta-item">1800字</span>
                          <span class="meta-item">首次提交</span>
                        </div>
                      </div>
                      
                      <!-- v1.0的审查记录 -->
                      <div class="review-section approved">
                        <div class="review-header">
                          <h6>🔍 审查结果</h6>
                          <div class="review-meta">
                            <span class="reviewer">项目负责人</span>
                            <span class="review-time">2025-08-20 16:45</span>
                          </div>
                        </div>
                        
                        <div class="review-content">
                          <div class="review-opinion">
                            <strong>审查意见：</strong>
                            <p>初步设计方案合理，技术路线清晰，基础表结构设计规范。</p>
                          </div>
                          <div class="review-suggestions">
                            <strong>改进建议：</strong>
                            <p>建议在下一阶段加强性能测试验证，并考虑数据迁移方案。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>

        <!-- 底部操作栏 -->
        <div class="review-actions">
          <a-space>
            <a-button type="primary" @click="handleApproveReport">
              <CheckOutlined />
              通过审查
            </a-button>
            <a-button @click="handleRequestRevision">
              <EditOutlined />
              要求修改
            </a-button>
            <a-button @click="reviewDetailVisible = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
         </a-modal>

     <!-- 审查意见输入弹窗 -->
     <a-modal
       v-model:open="reviewOpinionVisible"
       :title="reviewAction === 'approve' ? '通过审查 - 填写意见' : '要求修改 - 填写意见'"
       width="600px"
       :footer="null"
     >
       <div v-if="currentReviewItem" class="review-opinion-form">
         <!-- 提报信息概要 -->
         <div class="review-summary">
           <a-alert
             :message="`正在审查：${currentReviewItem.submittedByName} - ${currentReviewItem.taskTitle}`"
             :type="reviewAction === 'approve' ? 'success' : 'warning'"
             show-icon
             style="margin-bottom: 20px"
           />
         </div>

         <!-- 审查意见表单 -->
         <a-form layout="vertical">
           <a-form-item 
             label="审查意见" 
             required
             :help="reviewAction === 'approve' ? '请填写对该提报的肯定意见和建议' : '请详细说明需要修改的问题和原因'"
           >
             <a-textarea
               v-model:value="reviewOpinion"
               :placeholder="reviewAction === 'approve' ? 
                 '例如：提报内容详实，技术方案合理，进度符合预期...' : 
                 '例如：技术方案需要进一步完善，缺少关键实现细节...'"
               :rows="4"
               show-count
               :maxlength="500"
             />
           </a-form-item>

           <a-form-item 
             :label="reviewAction === 'approve' ? '改进建议（可选）' : '修改建议'"
             :help="reviewAction === 'approve' ? '可以提出进一步改进的建议' : '请提供具体的修改建议和指导'"
           >
             <a-textarea
               v-model:value="reviewSuggestions"
               :placeholder="reviewAction === 'approve' ? 
                 '例如：建议在下一阶段加强性能测试，考虑增加异常处理机制...' : 
                 '例如：1. 补充详细的技术实现方案；2. 增加风险评估内容；3. 明确时间节点...'"
               :rows="3"
               show-count
               :maxlength="300"
             />
           </a-form-item>
         </a-form>

         <!-- 操作按钮 -->
         <div class="review-opinion-actions">
           <a-space>
             <a-button 
               type="primary" 
               :loading="false"
               @click="handleSubmitReview"
               :disabled="!reviewOpinion.trim()"
             >
               <CheckOutlined />
               {{ reviewAction === 'approve' ? '确认通过' : '确认要求修改' }}
             </a-button>
             <a-button @click="handleCancelReview">
               取消
             </a-button>
           </a-space>
                 </div>
      </div>
    </a-modal>

    <!-- 事件详情浮窗（重构版，防抖动优化） -->
    <div 
      v-if="taskDetailsVisible && taskDetailsContent" 
      class="event-details-tooltip"
      @mouseenter="showEventDetails(taskDetailsContent)"
      @mouseleave="hideEventDetails"
    >
      <div class="tooltip-header">
        <span class="tooltip-title">{{ taskDetailsContent.dateStr }}</span>
        <span class="tooltip-count">
          {{ `${taskDetailsContent.events.length} 个事件` }}
        </span>
      </div>
      <div class="tooltip-content">
        <div 
          v-for="(event, index) in taskDetailsContent.events" 
          :key="index"
          class="event-detail-item"
          :class="`event-${event.type}`"
        >
          <div class="event-icon-wrapper">
            <span class="event-icon">{{ event.icon }}</span>
          </div>
          <div class="event-info">
            <div class="event-type">{{ getEventTypeText(event) }}</div>
            <div class="event-task-name">{{ event.taskName || '未知任务' }}</div>
            <div v-if="event.milestoneName" class="milestone-name">{{ event.milestoneName }}</div>
        </div>
        </div>
      </div>
    </div>

    <!-- 溢出任务详情面板（新增） -->
    <a-modal 
      v-model:open="overflowPanelVisible"
      :title="`${expandedOverflowGroup?.dateStr} - 完整任务列表 (${expandedOverflowGroup?.eventCount}个)`"
      width="600px"
      @cancel="closeOverflowPanel"
    >
      <div v-if="expandedOverflowGroup" class="overflow-panel-content">
        <div class="overflow-summary">
          <a-tag :color="expandedOverflowGroup.densityLevel === 'extreme' ? 'red' : 'orange'">
            {{ expandedOverflowGroup.densityLevel === 'extreme' ? '任务密集' : '任务较多' }}
          </a-tag>
          <span class="summary-text">
            该时间点共有 <strong>{{ expandedOverflowGroup.eventCount }}</strong> 个任务事件
          </span>
   </div>
        
        <div class="overflow-events-list">
          <div 
            v-for="(event, index) in expandedOverflowGroup.allEvents" 
            :key="index"
            class="overflow-event-item"
            :class="`event-${event.type}`"
          >
            <div class="event-icon-wrapper">
              <span class="event-icon">{{ event.icon }}</span>
            </div>
            <div class="event-info">
              <div class="event-type">{{ getEventTypeText(event) }}</div>
              <div class="event-task-name">{{ event.taskName || '未知任务' }}</div>
              <div v-if="event.milestoneName" class="milestone-name">{{ event.milestoneName }}</div>
            </div>
            <div class="event-index">#{{ index + 1 }}</div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <a-button type="primary" @click="closeOverflowPanel">
          知道了
        </a-button>
      </template>
    </a-modal>

    <!-- 统计穿透查看模态框（简化版，修复错误） -->
    <a-modal 
      v-model:open="taskListModalVisible"
      :title="currentTaskListTitle + ' (' + currentTaskList.length + '个)'"
      width="900px"
      @cancel="closeTaskListModal"
    >
      <!-- 状态提示 -->
      <div v-if="['dueSoon', 'overdue'].includes(currentStatType)" class="status-summary" style="margin-bottom: 16px;">
        <a-alert 
          :type="currentStatType === 'overdue' ? 'error' : 'warning'"
          :message="currentStatType === 'overdue' ? '这些任务已经逾期，请尽快处理！' : '这些任务即将到期，请及时关注！'"
          show-icon
        />
      </div>

      <!-- 任务列表 -->
      <div class="task-list-content">
        <div v-if="currentTaskList.length === 0">
          <a-empty description="暂无相关任务" />
        </div>
        
        <div v-else>
          <!-- 简化的任务卡片列表 -->
          <div class="task-cards-container" style="max-height: 400px; overflow-y: auto;">
            <div 
              v-for="(task, index) in paginatedTaskList" 
              :key="task.id || index"
              class="simple-task-card"
              :class="getSimpleTaskClass(task, currentStatType)"
            >
              <div class="task-card-header">
                <h4>{{ task.name || '未命名任务' }}</h4>
                <div class="task-meta">
                  <a-tag v-if="task.priority" size="small" :color="task.priority === '高' ? 'red' : task.priority === '中' ? 'orange' : 'default'">
                    {{ task.priority }}
                  </a-tag>
                  <a-tag v-if="task.phaseId" size="small" color="blue">{{ task.phaseId }}</a-tag>
                </div>
              </div>
              
              <div class="task-card-body">
                <div class="time-info">
                  <span v-if="task.startDate">📅 开始：{{ task.startDate }}</span>
                  <span v-if="task.endDate">🏁 结束：{{ task.endDate }}</span>
                  <span v-if="task.dueDate">⏰ 截止：{{ task.dueDate }}</span>
                </div>
                
                <div v-if="task.description" class="task-desc">
                  {{ task.description }}
                </div>
                
                <!-- 到期提醒 -->
                <div v-if="currentStatType === 'overdue' && task.dueDate" class="warning-text">
                  ⚠️ 已逾期 {{ getDaysOverdue(task.dueDate) }} 天
                </div>
                <div v-else-if="currentStatType === 'dueSoon' && task.dueDate" class="warning-text">
                  ⏰ {{ getDaysUntilDue(task.dueDate) }} 天后到期
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页器 -->
          <div v-if="totalTasks > pageSize" style="margin-top: 16px; text-align: center;">
            <a-pagination
              v-model:current="currentPage"
              v-model:pageSize="pageSize"
              :total="totalTasks"
              :show-size-changer="true"
              :show-quick-jumper="true"
              :page-size-options="['5', '10', '20', '50']"
              @change="handlePageChange"
              @showSizeChange="handlePageChange"
            />
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <template #footer>
        <a-space>
          <a-button @click="closeTaskListModal">关闭</a-button>
          <a-button v-if="['dueSoon', 'overdue'].includes(currentStatType)" type="primary">
            查看相关工作提报
          </a-button>
        </a-space>
      </template>
    </a-modal>
   </div>
 </template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { usePlanningStore } from '@/store/planning'
import {
  EyeOutlined,
  FileTextOutlined,
  DownOutlined,
  EditOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  SaveOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

// Props
const props = defineProps({
  monitoringData: {
    type: Object,
    default: () => ({
      overallStats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        overallProgress: 0
      },
      weeklySubmissions: []
    })
  },
  planningTasks: {
    type: Array,
    default: () => []
  }
})

// Stores
const planningStore = usePlanningStore()

// Emits
const emit = defineEmits([
  'review-submission'
])

// 响应式数据
const filterStatus = ref('all')
const searchKeyword = ref('')

// 新增的筛选和视图相关数据
const timeFilter = ref('month') // 'week', 'month', 'custom'
const customTimeRange = ref([])
const viewMode = ref('task') // 'task', 'member'

// 视图选项
const viewOptions = [
  { label: '任务视图', value: 'task', icon: 'FileTextOutlined' },
  { label: '人员视图', value: 'member', icon: 'UserOutlined' }
]

// 审查详情弹窗相关数据（增强版）
const reviewDetailVisible = ref(false)
const currentReviewItem = ref(null)
const activeTabKey = ref('current') // 选项卡活跃键
const selectedVersions = ref([]) // 选中的版本用于对比
const currentSubmissionVersion = ref('v3.0') // 当前提交版本

// 统一时间线相关状态
const expandedSubmissions = ref([]) // 展开的提交详情
const allExpanded = ref(false) // 是否全部展开

// 审查意见相关数据
const reviewOpinionVisible = ref(false)
const reviewAction = ref('') // 'approve' 或 'reject'
const reviewOpinion = ref('')
const reviewSuggestions = ref('')

// 模拟提交历史数据
const mockSubmissionHistory = ref([
  {
    id: 'SUB003',
    version: 'v3.0',
    submitTime: '2025-08-28 14:30',
    versionNote: '根据第二次审查意见进一步完善',
    summary: '完善了性能优化方案，增加了详细的索引策略和分区方案，补充了读写分离架构设计。',
    attachmentCount: 5,
    wordCount: 3200,
    reviewStatus: 'pending'
  },
  {
    id: 'SUB002',
    version: 'v2.0',
    submitTime: '2025-08-21 10:00',
    versionNote: '根据初次反馈修改的版本',
    summary: '数据库设计优化方案v2.0，完善了表结构设计，增加了基础索引策略，但性能优化部分仍需完善。',
    attachmentCount: 3,
    wordCount: 2800,
    reviewStatus: 'rejected'
  },
  {
    id: 'SUB001',
    version: 'v1.0',
    submitTime: '2025-08-20 14:00',
    versionNote: '初始版本提交',
    summary: '数据库设计初版方案，包含基础的表结构设计和简单的数据关系建模。',
    attachmentCount: 2,
    wordCount: 1800,
    reviewStatus: 'approved'
  }
])

// 模拟审查历史数据（项目负责人视角，统一角色）
const mockReviewHistory = ref([
  {
    id: 'REV002',
    reviewer: '项目负责人',
    reviewTime: '2025-08-21 14:30',
    action: 'reject',
    opinion: '数据库设计方案需要进一步完善，缺少关键的性能优化考虑。',
    suggestions: '1. 补充详细的索引设计方案；2. 增加分区策略和分片规则；3. 考虑读写分离架构设计；4. 增加性能测试和监控计划。',
    targetVersion: 'v2.0'
  },
  {
    id: 'REV001',
    reviewer: '项目负责人',
    reviewTime: '2025-08-20 16:45',
    action: 'approve',
    opinion: '初步设计方案合理，技术路线清晰，基础表结构设计规范。',
    suggestions: '建议在下一阶段加强性能测试验证，并考虑数据迁移方案。',
    targetVersion: 'v1.0'
  }
])

// 实时时间更新
const currentTimeUpdate = ref(Date.now())
let timeUpdateInterval = null

// 任务详情浮窗相关
const taskDetailsVisible = ref(false)
const taskDetailsContent = ref(null)
const taskDetailsPosition = ref({ x: 0, y: 0 })

// 组件挂载时启动定时器
onMounted(() => {
  timeUpdateInterval = setInterval(() => {
    currentTimeUpdate.value = Date.now()
  }, 60000) // 每分钟更新一次
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
  
  // 清理浮窗定时器，避免内存泄漏
  if (showDetailTimer) {
    clearTimeout(showDetailTimer)
  }
  if (hideDetailTimer) {
    clearTimeout(hideDetailTimer)
  }
})

// 基于任务计划数据的统计计算（增强版：支持到期状态）
const realTimeStats = computed(() => {
  const tasks = props.planningTasks
  const totalTasks = tasks.length
  
  const now = new Date()
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3天后
  
  let completedTasks = 0
  let inProgressTasks = 0
  let pendingTasks = 0
  let dueSoonTasks = 0
  let overdueTasks = 0
  
  const tasksByStatus = {
    completed: [],
    inProgress: [],
    pending: [],
    dueSoon: [],
    overdue: []
  }
  
  tasks.forEach(task => {
    const taskDueDate = task.dueDate ? new Date(task.dueDate) : null
    const taskStartDate = task.startDate ? new Date(task.startDate) : null
    const taskEndDate = task.endDate ? new Date(task.endDate) : null
    
    // 判断任务状态的优先级：逾期 > 临近到期 > 已完成 > 进行中 > 待开始
    if (taskDueDate) {
      if (taskDueDate < now) {
        // 逾期任务（最高优先级）
        overdueTasks++
        tasksByStatus.overdue.push(task)
      } else if (taskDueDate <= threeDaysLater) {
        // 临近到期任务（3天内到期）
        dueSoonTasks++
        tasksByStatus.dueSoon.push(task)
      } else {
        // 有截止日期但未到期的任务，根据其他条件判断状态
        if (taskStartDate && taskStartDate <= now) {
          inProgressTasks++
          tasksByStatus.inProgress.push(task)
        } else if (taskStartDate && taskStartDate > now) {
          pendingTasks++
          tasksByStatus.pending.push(task)
        } else {
          // 没有开始时间，默认为进行中
          inProgressTasks++
          tasksByStatus.inProgress.push(task)
        }
      }
    } else {
      // 没有截止日期的任务，根据开始/结束时间判断
      if (taskEndDate && taskEndDate < now) {
      completedTasks++
        tasksByStatus.completed.push(task)
      } else if (taskStartDate && taskStartDate <= now) {
      inProgressTasks++
        tasksByStatus.inProgress.push(task)
      } else if (taskStartDate && taskStartDate > now) {
        pendingTasks++
        tasksByStatus.pending.push(task)
    } else {
        // 完全没有时间设置的任务
      pendingTasks++
        tasksByStatus.pending.push(task)
      }
    }
  })
  
  // 基于已完成任务数计算整体进度
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    dueSoonTasks,
    overdueTasks,
    overallProgress,
    tasksByStatus // 按状态分组的任务列表，用于穿透查看
  }
})

// --- 核心时间轴逻辑（重构版）---

// 1. 收集所有时间信息（任务+里程碑），去除重复
const allTimeEvents = computed(() => {
  const tasks = props.planningTasks
  if (!tasks || tasks.length === 0) return []
  
  const events = []
  const eventKeys = new Set() // 用于去重
  
  // 从planning store获取里程碑数据
  const milestones = planningStore.milestones || []
  const milestonesMap = new Map()
  milestones.forEach(ms => {
    milestonesMap.set(ms.id, ms)
  })
  
  tasks.forEach(task => {
    const taskId = task.id || task.name
    
    // 任务相关时间
    if (task.startDate) {
      const eventKey = `${task.startDate}_task_start_${taskId}`
      if (!eventKeys.has(eventKey)) {
        events.push({
          date: new Date(task.startDate),
          type: 'task_start',
          taskId,
          taskName: task.name,
          icon: '🚀',
          label: '任务开始'
        })
        eventKeys.add(eventKey)
      }
    }
    
    if (task.endDate) {
      const eventKey = `${task.endDate}_task_end_${taskId}`
      if (!eventKeys.has(eventKey)) {
        events.push({
          date: new Date(task.endDate),
          type: 'task_end', 
          taskId,
          taskName: task.name,
          icon: '⭐', // 用户要求的星星
          label: '任务结束'
        })
        eventKeys.add(eventKey)
      }
    }
    
    if (task.dueDate) {
      const eventKey = `${task.dueDate}_task_due_${taskId}`
      if (!eventKeys.has(eventKey)) {
        events.push({
          date: new Date(task.dueDate),
          type: 'task_due',
          taskId, 
          taskName: task.name,
          icon: '⏰',
          label: '任务截止'
        })
        eventKeys.add(eventKey)
      }
    }
    
    // 里程碑时间（修复版本：通过primaryMilestoneId查找里程碑）
    if (task.primaryMilestoneId) {
      const milestone = milestonesMap.get(task.primaryMilestoneId)
      if (milestone && milestone.plannedDate) {
        const eventKey = `${milestone.plannedDate}_milestone_${taskId}_${milestone.name}`
        if (!eventKeys.has(eventKey)) {
          events.push({
            date: new Date(milestone.plannedDate),
            type: 'milestone',
            taskId,
            taskName: task.name,
            milestoneName: milestone.name,
            milestoneId: milestone.id,
            icon: '🎯',
            label: '里程碑'
          })
          eventKeys.add(eventKey)
          console.log(`✅ 发现里程碑事件: ${milestone.name} (${milestone.plannedDate}) 关联任务: ${task.name}`)
        }
      } else {
        console.log(`⚠️ 任务 ${task.name} 关联的里程碑 ${task.primaryMilestoneId} 找不到或缺少计划日期`)
      }
    }
  })
  
  console.log(`🔍 收集到 ${events.length} 个时间事件，其中里程碑事件: ${events.filter(e => e.type === 'milestone').length} 个`)
  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
})

// 2. 计算完整时间轴范围（基于所有时间事件）
const completeTimeRange = computed(() => {
  const events = allTimeEvents.value
  if (events.length === 0) return null
  
  const allDates = events.map(e => e.date)
  const minDate = new Date(Math.min.apply(null, allDates))
  const maxDate = new Date(Math.max.apply(null, allDates))
  
  // 添加边距，确保时间点不贴边
  const totalDuration = maxDate.getTime() - minDate.getTime()
  const margin = Math.max(totalDuration * 0.1, 2 * 24 * 60 * 60 * 1000) // 至少2天边距
  
  const timelineStart = new Date(minDate.getTime() - margin)
  const timelineEnd = new Date(maxDate.getTime() + margin)
  const durationDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))

  return {
    timelineStart,
    timelineEnd, 
    projectStart: minDate,
    projectEnd: maxDate,
    projectStartStr: formatDate(minDate),
    projectEndStr: formatDate(maxDate),
    durationDays,
    totalDuration: timelineEnd.getTime() - timelineStart.getTime()
  }
})

// 3. 按日期分组时间事件（支持同一天多事件纵向排列）
const groupedTimeEvents = computed(() => {
  const events = allTimeEvents.value
  const range = completeTimeRange.value
  
  if (!events.length || !range) return []
  
  // 按日期分组
  const dateGroups = new Map()
  
  events.forEach(event => {
    const dateKey = event.date.toDateString()
    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, {
        date: event.date,
        dateStr: formatDate(event.date),
        events: []
      })
    }
    dateGroups.get(dateKey).events.push(event)
  })
  
  // 计算每组在时间轴上的位置，添加智能堆叠逻辑
  const groupedEvents = []
  const maxVisibleEvents = 4 // 最多显示4个具体事件
  
  dateGroups.forEach(group => {
    const position = ((group.date.getTime() - range.timelineStart.getTime()) / range.totalDuration) * 100
    const totalEvents = group.events.length
    
    // 智能堆叠：超过5个任务时的处理
    const hasOverflow = totalEvents > 5
    const visibleEvents = hasOverflow ? group.events.slice(0, maxVisibleEvents) : group.events
    const overflowCount = hasOverflow ? totalEvents - maxVisibleEvents : 0
    
    // 计算密度等级（用于视觉提示）
    const getDensityLevel = (count) => {
      if (count <= 3) return 'normal'
      if (count <= 5) return 'medium' 
      if (count <= 8) return 'high'
      return 'extreme'
    }
    
    // 添加溢出指示器事件
    const displayEvents = [...visibleEvents]
    if (hasOverflow) {
      displayEvents.push({
        type: 'overflow',
        icon: '⊕',
        label: `展开全部`,
        taskName: `点击展开查看全部 ${totalEvents} 个任务详情`,
      date: group.date,
        dateStr: group.dateStr,
        isOverflowIndicator: true,
        hiddenEvents: group.events.slice(maxVisibleEvents) // 隐藏的事件
      })
    }
    
    groupedEvents.push({
      ...group,
      events: displayEvents, // 显示的事件（包含溢出指示器）
      allEvents: group.events, // 完整事件列表
      position: Math.max(2, Math.min(98, position)), // 限制在2%-98%范围内
      eventCount: totalEvents,
      // 智能堆叠相关属性
      hasOverflow,
      overflowCount,
      densityLevel: getDensityLevel(totalEvents),
      isHighDensity: totalEvents > 5
    })
  })
  
  return groupedEvents.sort((a, b) => a.position - b.position)
})

// 4. 时间轴事件显示（移除当前时间标记以避免重叠）
const timelineWithCurrentTime = computed(() => {
  // 直接返回分组的时间事件，不再添加当前时间标记
  return groupedTimeEvents.value
})

// 保持向后兼容的计算属性（用于其他组件可能的引用）
const taskTimeRange = computed(() => completeTimeRange.value)

// --- 其他计算属性和方法 ---

const filteredReports = computed(() => {
  let reports = props.monitoringData.weeklySubmissions || []
  
  // (此处省略了筛选逻辑...)
  
  return reports
})

const getReportsCardTitle = () => {
  const timeText = timeFilter.value === 'week' ? '本周' : 
                   timeFilter.value === 'month' ? '本月' : '时间段内'
  const viewText = viewMode.value === 'task' ? '任务' : '人员'
  return `${timeText}提报情况 - ${viewText}视图`
}

// 帮助函数
const formatDate = (date) => {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 获取时间状态文字
const getTimeStatusText = (status) => {
  const statusMap = {
    'before-start': '未开始',
    'in-progress': '进行中', 
    'after-end': '已结束',
  }
  return statusMap[status] || '未知'
}

const getDensityLevel = (taskCount) => {
  if (taskCount >= 5) return 'density-high'
  if (taskCount >= 3) return 'density-medium'
  return 'density-low'
}

const getActiveMembers = () => {
  const memberIds = new Set(filteredReports.value.map(report => report.submittedBy))
  return memberIds.size
}

const getEmptyDescription = () => {
  const timeText = getTimeRangeText()
  return `${timeText}暂无提报记录`
}

const handleTimeFilterChange = () => {
  message.info(`切换到${getTimeRangeText()}`)
}

const handleCustomTimeChange = () => {
  if (customTimeRange.value && customTimeRange.value.length === 2) {
    message.info(`自定义时间范围：${getTimeRangeText()}`)
  }
}

const handleViewModeChange = (value) => {
  const viewText = value === 'task' ? '任务视图' : '人员视图'
  message.info(`切换到${viewText}`)
}

// 审查详情相关方法
const handleReviewDetail = (report) => {
  currentReviewItem.value = report
  reviewDetailVisible.value = true
}

const handleApproveReport = () => {
  if (currentReviewItem.value) {
    reviewAction.value = 'approve'
    reviewOpinion.value = ''
    reviewSuggestions.value = ''
    reviewOpinionVisible.value = true
  }
}

const handleRequestRevision = () => {
  if (currentReviewItem.value) {
    reviewAction.value = 'reject'
    reviewOpinion.value = ''
    reviewSuggestions.value = ''
    reviewOpinionVisible.value = true
  }
}

// 提交审查意见
const handleSubmitReview = () => {
  if (!reviewOpinion.value.trim()) {
    message.warning('请填写审查意见')
    return
  }

  const actionText = reviewAction.value === 'approve' ? '通过' : '要求修改'
  const reviewData = {
    submissionId: currentReviewItem.value.id,
    action: reviewAction.value,
    opinion: reviewOpinion.value,
    suggestions: reviewSuggestions.value,
    reviewTime: new Date().toLocaleString(),
    reviewer: '当前用户' // 实际应用中应该是当前登录用户
  }

  // 这里可以调用API提交审查意见到后端
  // await submitReviewOpinion(reviewData)
  
  message.success(`已${actionText} ${currentReviewItem.value.submittedByName} 的提报，审查意见已记录`)
  
  // 关闭弹窗
  reviewOpinionVisible.value = false
  reviewDetailVisible.value = false
  
  // 清空表单
  reviewOpinion.value = ''
  reviewSuggestions.value = ''
}

// 取消审查意见
const handleCancelReview = () => {
  reviewOpinionVisible.value = false
  reviewOpinion.value = ''
  reviewSuggestions.value = ''
}

// 方法定义
const getSubmissionStatusColor = (status) => {
  const colorMap = {
    'pending': 'orange',
    'reviewed': 'green',
    'revision_required': 'red'
  }
  return colorMap[status] || 'default'
}

const getSubmissionStatusText = (status) => {
  const textMap = {
    'pending': '待审查',
    'reviewed': '已审查',
    'revision_required': '需整改'
  }
  return textMap[status] || status
}

const getRatingColor = (rating) => {
  const colorMap = {
    'excellent': 'green',
    'good': 'blue',
    'fair': 'orange',
    'poor': 'red'
  }
  return colorMap[rating] || 'default'
}

const getRatingText = (rating) => {
  const textMap = {
    'excellent': '优秀',
    'good': '良好',
    'fair': '一般',
    'poor': '较差'
  }
  return textMap[rating] || rating
}

const handleFilterChange = (value) => {
  // 筛选状态变更处理
}

const handleSearch = (value) => {
  // 搜索关键词处理
}


const handleReviewSubmission = (submission) => {
  emit('review-submission', submission)
}

const handleViewDetails = (submission) => {
  console.log('点击查看详情，数据：', submission)
  console.log('格式化内容：', submission.formattedContent)
  
  // 重置状态
  currentReviewItem.value = submission
  activeTabKey.value = 'current'
  selectedVersions.value = []
  
  // 根据提交数据设置当前版本
  currentSubmissionVersion.value = 'v3.0' // 默认最新版本
  
  reviewDetailVisible.value = true
}

// 新增的项目负责人端方法

// 快速通过
const handleQuickApprove = () => {
  reviewAction.value = 'approve'
  reviewOpinion.value = '内容符合要求，质量良好，同意通过。'
  reviewSuggestions.value = ''
  reviewOpinionVisible.value = true
}

// 快速拒绝
const handleQuickReject = () => {
  reviewAction.value = 'reject'
  reviewOpinion.value = ''
  reviewSuggestions.value = ''
  reviewOpinionVisible.value = true
}

// 版本对比
const handleCompareVersions = () => {
  if (selectedVersions.value.length === 2) {
    handleCompareSelectedVersions()
  } else {
    message.info('请选择两个版本进行对比')
    activeTabKey.value = 'history'
  }
}

// 版本选择
const handleVersionSelect = (versionId, checked) => {
  if (checked) {
    if (selectedVersions.value.length < 2) {
      selectedVersions.value.push(versionId)
    } else {
      message.warning('最多只能选择2个版本进行对比')
    }
  } else {
    const index = selectedVersions.value.indexOf(versionId)
    if (index > -1) {
      selectedVersions.value.splice(index, 1)
    }
  }
}

// 全选版本（最多2个）
const handleSelectAllVersions = () => {
  selectedVersions.value = mockSubmissionHistory.value.slice(0, 2).map(v => v.id)
  message.info('已选择最新的两个版本')
}

// 清除版本选择
const handleClearVersionSelection = () => {
  selectedVersions.value = []
}

// 对比选中的版本
const handleCompareSelectedVersions = () => {
  if (selectedVersions.value.length !== 2) {
    message.warning('请选择2个版本进行对比')
    return
  }
  
  const version1 = mockSubmissionHistory.value.find(v => v.id === selectedVersions.value[0])
  const version2 = mockSubmissionHistory.value.find(v => v.id === selectedVersions.value[1])
  
  console.log('对比版本:', version1, version2)
  message.success(`开始对比 ${version1.version} 和 ${version2.version}`)
  
  // 这里可以打开一个新的版本对比弹窗
  // 暂时用message提示代替
}

// 查看版本详情
const handleViewVersionDetail = (version) => {
  console.log('查看版本详情:', version)
  message.info(`查看 ${version.version} 详细内容`)
  // 可以打开一个专门的版本详情弹窗
}

// 查看版本审查记录
const handleViewVersionReview = (version) => {
  const review = mockReviewHistory.value.find(r => r.targetVersion === version.version)
  if (review) {
    console.log('查看版本审查记录:', review)
    message.info(`查看 ${version.version} 的审查记录`)
    // 跳转到统一时间线
    activeTabKey.value = 'timeline'
  }
}

// 统一时间线相关方法

// 切换提交详情展开状态
const toggleSubmissionDetail = (submissionId) => {
  const index = expandedSubmissions.value.indexOf(submissionId)
  if (index > -1) {
    expandedSubmissions.value.splice(index, 1)
  } else {
    expandedSubmissions.value.push(submissionId)
  }
  
  console.log('展开的提交详情:', expandedSubmissions.value)
}

// 全部展开/收起提交详情
const handleExpandAllSubmissions = () => {
  if (allExpanded.value) {
    // 收起全部
    expandedSubmissions.value = []
    allExpanded.value = false
    message.info('已收起全部提交详情')
  } else {
    // 展开全部
    expandedSubmissions.value = mockSubmissionHistory.value.map(submission => submission.id)
    allExpanded.value = true
    message.info('已展开全部提交详情')
  }
}

const handleReReview = (submission) => {
  console.log('重新审查:', submission)
  emit('review-submission', submission)
}

const handleDownloadAttachments = (submission) => {
  console.log('下载附件:', submission)
  message.success('附件下载已开始')
}

const handleRefreshSubmissions = () => {
  message.success('数据已刷新')
}

// 已移除无用的按钮处理函数

// 合并的统计数据（优先使用实时计算的数据，增强版）
const combinedStats = computed(() => {
  const realStats = realTimeStats.value
  const mockStats = props.monitoringData.overallStats || {}
  
  return {
    totalTasks: realStats.totalTasks || mockStats.totalTasks || 0,
    completedTasks: realStats.completedTasks || mockStats.completedTasks || 0,
    inProgressTasks: realStats.inProgressTasks || mockStats.inProgressTasks || 0,
    pendingTasks: realStats.pendingTasks || mockStats.pendingTasks || 0,
    dueSoonTasks: realStats.dueSoonTasks || 0,
    overdueTasks: realStats.overdueTasks || 0,
    overallProgress: realStats.overallProgress || mockStats.overallProgress || 0,
    tasksByStatus: realStats.tasksByStatus || {}
  }
})

// 计算属性
const filteredSubmissions = computed(() => {
  let submissions = props.monitoringData.weeklySubmissions || []
  
  // 状态过滤
  if (filterStatus.value !== 'all') {
    submissions = submissions.filter(sub => sub.status === filterStatus.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    submissions = submissions.filter(sub => 
      sub.submittedByName.toLowerCase().includes(keyword) ||
      sub.taskTitle.toLowerCase().includes(keyword) ||
      sub.contentSummary.toLowerCase().includes(keyword)
    )
  }
  
  return submissions
})

// 按任务分组的数据
const groupedByTask = computed(() => {
  const taskMap = new Map()
  
  filteredReports.value.forEach(report => {
    if (!taskMap.has(report.taskId)) {
      taskMap.set(report.taskId, {
        taskId: report.taskId,
        taskTitle: report.taskTitle,
        reports: []
      })
    }
    taskMap.get(report.taskId).reports.push(report)
  })
  
  return Array.from(taskMap.values()).sort((a, b) => a.taskTitle.localeCompare(b.taskTitle))
})

// 按人员分组的数据
const groupedByMember = computed(() => {
  const memberMap = new Map()
  
  filteredReports.value.forEach(report => {
    if (!memberMap.has(report.submittedBy)) {
      memberMap.set(report.submittedBy, {
        memberId: report.submittedBy,
        memberName: report.submittedByName,
        memberRole: report.memberRole || '团队成员',
        reports: [],
        pendingCount: 0
      })
    }
    const member = memberMap.get(report.submittedBy)
    member.reports.push(report)
    if (report.status === 'pending') {
      member.pendingCount++
    }
  })
  
  return Array.from(memberMap.values()).sort((a, b) => a.memberName.localeCompare(b.memberName))
})

// 新增的方法
const getTimeRangeText = () => {
  const now = dayjs()
  switch (timeFilter.value) {
    case 'week':
      return `本周 (${now.startOf('week').format('YYYY-MM-DD')} ~ ${now.endOf('week').format('YYYY-MM-DD')})`
    case 'month':
      return `本月 (${now.format('YYYY-MM')})`
    case 'custom':
      if (customTimeRange.value && customTimeRange.value.length === 2) {
        return `${dayjs(customTimeRange.value[0]).format('YYYY-MM-DD')} ~ ${dayjs(customTimeRange.value[1]).format('YYYY-MM-DD')}`
      }
      return '自定义时间'
    default:
      return '本周'
  }
}

// 防抖定时器
let showDetailTimer = null
let hideDetailTimer = null

// 显示事件详情（重构版，添加防抖）
const showEventDetails = (eventGroup) => {
  // 清除隐藏定时器
  if (hideDetailTimer) {
    clearTimeout(hideDetailTimer)
    hideDetailTimer = null
  }
  
  // 防抖显示
  if (showDetailTimer) {
    clearTimeout(showDetailTimer)
  }
  
  showDetailTimer = setTimeout(() => {
    taskDetailsContent.value = {
      dateStr: eventGroup.dateStr,
      eventCount: eventGroup.eventCount,
      events: eventGroup.allEvents || eventGroup.events, // 优先使用完整事件列表
      isCurrentTime: eventGroup.isCurrentTime
    }
  taskDetailsVisible.value = true
    showDetailTimer = null
  }, 100) // 100ms 防抖延迟
}

// 隐藏事件详情（添加防抖）
const hideEventDetails = () => {
  // 清除显示定时器
  if (showDetailTimer) {
    clearTimeout(showDetailTimer)
    showDetailTimer = null
  }
  
  // 延迟隐藏，避免鼠标移动到浮窗时闪烁
  hideDetailTimer = setTimeout(() => {
  taskDetailsVisible.value = false
  taskDetailsContent.value = null
    hideDetailTimer = null
  }, 200) // 200ms 延迟隐藏
}

// 处理事件点击（新增：支持溢出指示器展开）
const handleEventClick = (event, group) => {
  if (event.isOverflowIndicator) {
    // 点击溢出指示器，展开显示完整任务列表
    expandedOverflowGroup.value = {
      ...group,
      events: group.allEvents, // 显示完整事件列表
      isExpanded: true
    }
    overflowPanelVisible.value = true
  } else {
    // 普通事件点击，可以添加其他逻辑
    console.log('点击事件:', event.taskName)
  }
}

// 溢出面板相关状态
const overflowPanelVisible = ref(false)
const expandedOverflowGroup = ref(null)

// 关闭溢出面板
const closeOverflowPanel = () => {
  overflowPanelVisible.value = false
  expandedOverflowGroup.value = null
}

// 统计穿透查看相关状态
const taskListModalVisible = ref(false)
const currentTaskList = ref([])
const currentTaskListTitle = ref('')
const currentStatType = ref('')

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const paginatedTaskList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return currentTaskList.value.slice(start, end)
})
const totalTasks = computed(() => currentTaskList.value.length)

// 处理统计卡片点击（穿透查看）
const handleStatClick = (statType) => {
  const stats = realTimeStats.value
  const tasksByStatus = stats.tasksByStatus || {}
  
  const statConfig = {
    total: { 
      title: '全部任务', 
      tasks: props.planningTasks || [],
      color: '#234fa2'
    },
    completed: { 
      title: '已完成任务', 
      tasks: tasksByStatus.completed || [],
      color: '#52c41a'
    },
    inProgress: { 
      title: '进行中任务', 
      tasks: tasksByStatus.inProgress || [],
      color: '#1890ff'
    },
    pending: { 
      title: '待开始任务', 
      tasks: tasksByStatus.pending || [],
      color: '#8c8c8c'
    },
    dueSoon: { 
      title: '临近到期任务', 
      tasks: tasksByStatus.dueSoon || [],
      color: '#fa8c16'
    },
    overdue: { 
      title: '逾期任务', 
      tasks: tasksByStatus.overdue || [],
      color: '#ff4d4f'
    }
  }
  
  const config = statConfig[statType]
  if (!config) return
  
  currentTaskList.value = config.tasks
  currentTaskListTitle.value = config.title
  currentStatType.value = statType
  currentPage.value = 1 // 重置分页
  taskListModalVisible.value = true
  
  // 同时联动下方的提报情况筛选（如果有对应关系）
  if (['dueSoon', 'overdue'].includes(statType)) {
    // 对于临近到期和逾期任务，可以触发特殊的提报筛选逻辑
    message.info(`已为您筛选${config.title}相关的工作提报`)
  }
}

// 关闭任务列表模态框
const closeTaskListModal = () => {
  taskListModalVisible.value = false
  currentTaskList.value = []
  currentTaskListTitle.value = ''
  currentStatType.value = ''
  currentPage.value = 1 // 重置分页
}

// 处理分页变化
const handlePageChange = (page, size) => {
  currentPage.value = page
  if (size !== pageSize.value) {
    pageSize.value = size
    currentPage.value = 1 // 改变每页条数时重置到第一页
  }
}

// 格式化任务的时间显示
const formatTaskTime = (task) => {
  const parts = []
  if (task.startDate) parts.push(`开始：${task.startDate}`)
  if (task.endDate) parts.push(`结束：${task.endDate}`)
  if (task.dueDate) parts.push(`截止：${task.dueDate}`)
  return parts.join(' | ') || '无时间设置'
}

// 获取任务状态的显示样式（废弃，改用表格展示）
const getTaskStatusStyle = (task, statType) => {
  const now = new Date()
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  
  if (statType === 'overdue' || (dueDate && dueDate < now)) {
    return { color: '#ff4d4f', background: '#fff1f0', border: '1px solid #ffccc7' }
  } else if (statType === 'dueSoon') {
    return { color: '#fa8c16', background: '#fff7e6', border: '1px solid #ffd591' }
  } else if (statType === 'completed') {
    return { color: '#52c41a', background: '#f6ffed', border: '1px solid #b7eb8f' }
  } else if (statType === 'inProgress') {
    return { color: '#1890ff', background: '#e6f7ff', border: '1px solid #91d5ff' }
  }
  return { color: '#8c8c8c', background: '#fafafa', border: '1px solid #d9d9d9' }
}

// 获取统计类型对应的颜色
const getStatColor = (statType) => {
  const colorMap = {
    total: '#234fa2',
    completed: '#52c41a',
    inProgress: '#1890ff',
    pending: '#8c8c8c',
    dueSoon: '#fa8c16',
    overdue: '#ff4d4f'
  }
  return colorMap[statType] || '#234fa2'
}

// 获取任务状态颜色（用于表格显示）
const getTaskStatusColor = (task, statType) => {
  const now = new Date()
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  
  if (statType === 'overdue' || (dueDate && dueDate < now)) {
    return 'red'
  } else if (statType === 'dueSoon') {
    return 'orange'
  } else if (statType === 'completed') {
    return 'green'
  } else if (statType === 'inProgress') {
    return 'blue'
  }
  return 'default'
}

// 获取任务状态文本
const getTaskStatusText = (task, statType) => {
  const now = new Date()
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  
  if (statType === 'overdue' || (dueDate && dueDate < now)) {
    return '逾期'
  } else if (statType === 'dueSoon') {
    return '临近到期'
  } else if (statType === 'completed') {
    return '已完成'
  } else if (statType === 'inProgress') {
    return '进行中'
  }
  return '待开始'
}

// 获取表格行的样式类（暂时移除，简化模板）
const getTaskRowClass = (task, statType) => {
  const now = new Date()
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  
  if (statType === 'overdue' || (dueDate && dueDate < now)) {
    return 'task-row-overdue'
  } else if (statType === 'dueSoon') {
    return 'task-row-due-soon'
  } else if (statType === 'completed') {
    return 'task-row-completed'
  }
  return 'task-row-normal'
}

// 计算逾期天数
const getDaysOverdue = (dueDate) => {
  if (!dueDate) return 0
  const now = new Date()
  const due = new Date(dueDate)
  return Math.ceil((now - due) / (1000 * 60 * 60 * 24))
}

// 计算距离到期的天数
const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return 0
  const now = new Date()
  const due = new Date(dueDate)
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24))
}

// 获取简化的任务卡片样式类
const getSimpleTaskClass = (task, statType) => {
  if (statType === 'overdue') {
    return 'overdue-card'
  } else if (statType === 'dueSoon') {
    return 'due-soon-card'
  } else if (statType === 'completed') {
    return 'completed-card'
  } else if (statType === 'inProgress') {
    return 'in-progress-card'
  }
  return 'pending-card'
}

// 保持向后兼容（如果其他地方还在调用）
const showTaskDetails = showEventDetails
const hideTaskDetails = hideEventDetails

// 获取事件类型的显示文字
const getEventTypeText = (event) => {
  const typeMap = {
    'task_start': '任务开始',
    'task_end': '任务结束',
    'task_due': '任务截止', 
    'milestone': '里程碑',
    'overflow': '更多任务'
  }
  return typeMap[event.type] || event.label || event.type
}

// 检测边界位置是否已有事件（避免重复显示）
const hasEventAtBoundary = (boundary) => {
  const range = completeTimeRange.value
  const events = timelineWithCurrentTime.value
  
  if (!range || !events.length) return false
  
  const boundaryDate = boundary === 'start' ? range.projectStartStr : range.projectEndStr
  
  // 检查是否有事件的日期与边界日期相同
  return events.some(eventGroup => eventGroup.dateStr === boundaryDate)
}
</script>

<style scoped>
.progress-monitoring-step {
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

/* 筛选和视图控制样式 */
.filter-control-section {
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e6eaf2;
  margin-bottom: 20px;
}

.filter-section,
.view-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: #234fa2;
  min-width: 70px;
  font-size: 13px;
}

.filter-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e6eaf2;
}

/* 任务视图样式 */
.task-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-group {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  overflow: hidden;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e6eaf2;
}

.task-header h4 {
  margin: 0;
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
}

.task-reports {
  display: flex;
  flex-direction: column;
}

/* 人员视图样式 */
.member-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-group {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  overflow: hidden;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e6eaf2;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-details h4 {
  margin: 0 0 4px 0;
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
}

.member-role {
  color: #64748b;
  font-size: 12px;
}

.member-stats {
  display: flex;
  gap: 8px;
}

.member-reports {
  display: flex;
  flex-direction: column;
}

/* 通用报告项样式 */
.report-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.report-item:hover {
  background-color: #fafbfc;
}

.report-item:last-child {
  border-bottom: none;
}

.report-item.reviewed {
  background-color: #f6ffed;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reporter-info,
.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reporter-details,
.task-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reporter-name,
.task-title {
  font-weight: 600;
  color: #234fa2;
  font-size: 13px;
}

.submit-time {
  color: #8c8c8c;
  font-size: 11px;
}

.report-content {
  margin: 8px 0;
}

.report-content p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* 审查详情弹窗样式 */
.review-detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.review-basic-info {
  margin-bottom: 20px;
}

.formatted-report-content {
  margin-top: 20px;
}

.formatted-report-content h4 {
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  border-bottom: 2px solid #e6eaf2;
  padding-bottom: 8px;
}

.report-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border-left: 4px solid #234fa2;
}

.report-section h5 {
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-content {
  color: #333;
  font-size: 13px;
  line-height: 1.6;
  text-align: justify;
  margin: 0;
}

.attachments-section {
  margin-top: 20px;
  padding: 16px;
  background: #f0f7ff;
  border-radius: 8px;
  border: 1px solid #d6e4ff;
}

.attachments-section h5 {
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.review-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e6eaf2;
  display: flex;
  justify-content: center;
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

.overview-card,
.submissions-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.progress-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-bar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label span {
  color: #333;
  font-weight: 500;
}

/* 时间轴样式（已在后面定义，增加了最小高度） */

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timeline-title {
  color: #234fa2;
  font-weight: 600;
  font-size: 14px;
}

.timeline-duration {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.timeline-bar {
  position: relative;
}

.timeline-track {
  position: relative;
  height: 40px;
  background: linear-gradient(90deg, #e6eaf2 0%, #d6e4ff 50%, #e6eaf2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.timeline-track.single-due {
  justify-content: center;
  background: linear-gradient(90deg, #fff2e8 0%, #fff7ed 50%, #fff2e8 100%);
}

.timeline-start,
.timeline-end,
.timeline-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.start-marker {
  background: #52c41a;
  box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.2);
}

.end-marker {
  background: #234fa2;
  box-shadow: 0 0 0 3px rgba(35, 79, 162, 0.2);
}

.due-marker {
  background: #fa8c16;
  box-shadow: 0 0 0 3px rgba(250, 140, 22, 0.2);
}

.timeline-date {
  color: #234fa2;
  font-weight: 600;
  font-size: 12px;
  margin-top: 4px;
}

.timeline-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

.no-timeline-tip {
  margin-top: 16px;
}

/* 任务分布热力图样式 */
.task-heatmap-area {
  position: relative;
  height: 50px;
  margin-bottom: 12px;
}

.time-scale-line {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(35, 79, 162, 0.05) 50%, transparent 100%);
  border-radius: 4px;
}

/* 任务密度指示器 */
.task-density-indicator {
  position: absolute;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.task-density-indicator:hover {
  transform: translateX(-50%) translateY(-60%) scale(1.1);
}

.density-bar {
  width: 6px;
  min-height: 8px;
  border-radius: 3px;
  transition: all 0.3s ease;
  position: relative;
}

.task-density-indicator.density-low .density-bar {
  background: linear-gradient(180deg, #87d068 0%, #52c41a 100%);
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
}

.task-density-indicator.density-medium .density-bar {
  background: linear-gradient(180deg, #ffd666 0%, #faad14 100%);
  box-shadow: 0 0 10px rgba(250, 173, 20, 0.5);
}

.task-density-indicator.density-high .density-bar {
  background: linear-gradient(180deg, #ff9c6e 0%, #fa541c 100%);
  box-shadow: 0 0 12px rgba(245, 65, 28, 0.6);
  animation: highDensityPulse 2s infinite;
}

.task-count {
  font-size: 10px;
  font-weight: bold;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  padding: 1px 4px;
  margin-top: 2px;
  min-width: 16px;
  text-align: center;
}

/* 高密度任务动画 */
@keyframes highDensityPulse {
  0% {
    box-shadow: 0 0 12px rgba(245, 65, 28, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(245, 65, 28, 0.9);
  }
  100% {
    box-shadow: 0 0 12px rgba(245, 65, 28, 0.6);
  }
}

/* ========== 新版集成任务密度热力图样式 ========== */
.integrated-heatmap {
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  height: 25px;
  z-index: 15;
  pointer-events: none;
}

/* 任务密度点（新版，集成在时间轴上方） */
.task-density-point {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  pointer-events: auto;
  z-index: 16;
  transition: all 0.3s ease;
}

.task-density-point:hover {
  transform: translate(-50%, -50%) scale(1.3);
}

/* 发光任务点 */
.task-glow-point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #5a6c8a;
  box-shadow: 0 0 15px rgba(90, 108, 138, 0.6);
  transition: all 0.3s ease;
  animation: glowPulse 3s ease-in-out infinite;
}

/* 不同密度级别的任务点颜色 */
.task-density-point.density-low .task-glow-point {
  background: #52c41a;
  box-shadow: 
    0 0 12px rgba(82, 196, 26, 0.6),
    0 0 6px rgba(82, 196, 26, 0.8);
}

.task-density-point.density-medium .task-glow-point {
  background: #faad14;
  box-shadow: 
    0 0 15px rgba(250, 173, 20, 0.7),
    0 0 8px rgba(250, 173, 20, 0.9);
}

.task-density-point.density-high .task-glow-point {
  background: #ff4d4f;
  box-shadow: 
    0 0 20px rgba(255, 77, 79, 0.8),
    0 0 10px rgba(255, 77, 79, 1);
  animation: highDensityGlow 2s ease-in-out infinite;
}

/* 任务数量标签（新版） */
.task-count-badge {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7));
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: bold;
  min-width: 16px;
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 发光动画 */
@keyframes glowPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* 高密度任务点特殊动画 */
@keyframes highDensityGlow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 
      0 0 20px rgba(255, 77, 79, 0.8),
      0 0 10px rgba(255, 77, 79, 1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.2);
    box-shadow: 
      0 0 25px rgba(255, 77, 79, 1),
      0 0 15px rgba(255, 77, 79, 1),
      0 0 5px rgba(255, 255, 255, 0.5);
  }
}

/* 智能时间标签 */
.smart-time-label {
  position: absolute;
  top: 100%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  margin-top: 4px;
  border: 1px solid #e6eaf2;
  z-index: 8;
}

/* 当前时间指示系统样式 */
.current-time-indicator-system {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  z-index: 25;
}

/* 精确时间指示线 */
.time-pointer-line {
  position: absolute;
  top: 20px; /* 从时间轴主体开始 */
  transform: translateX(-50%);
  width: 2px;
  height: 60px;
  background: linear-gradient(180deg, 
    rgba(255, 77, 79, 0.8) 0%, 
    rgba(255, 77, 79, 0.6) 50%,
    rgba(255, 77, 79, 0.3) 100%
  );
  border-radius: 1px;
  box-shadow: 0 0 4px rgba(255, 77, 79, 0.4);
  animation: pointerPulse 2s ease-in-out infinite;
}

/* 当前时间浮标（下方） */
.current-time-float-badge {
  position: absolute;
  top: 85px; /* 位于时间轴下方 */
  transform: translateX(-50%);
  background: #ff4d4f;
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(255, 77, 79, 0.3);
  transition: all 0.3s ease;
  pointer-events: auto;
  min-width: 60px;
  animation: floatBadge 3s ease-in-out infinite;
}

.current-time-float-badge.before-start {
  background: #52c41a;
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.3);
}

/* 指示线状态颜色 */
.time-pointer-line.pointer-before-start {
  background: linear-gradient(180deg, 
    rgba(82, 196, 26, 0.8) 0%, 
    rgba(82, 196, 26, 0.6) 50%,
    rgba(82, 196, 26, 0.3) 100%
  );
  box-shadow: 0 0 4px rgba(82, 196, 26, 0.4);
}

.current-time-float-badge.in-progress {
  background: #ff4d4f;
  box-shadow: 0 4px 16px rgba(255, 77, 79, 0.3);
}

.current-time-float-badge.after-end {
  background: #8c8c8c;
  box-shadow: 0 4px 16px rgba(140, 140, 140, 0.3);
}

.time-pointer-line.pointer-in-progress {
  background: linear-gradient(180deg, 
    rgba(255, 77, 79, 0.8) 0%, 
    rgba(255, 77, 79, 0.6) 50%,
    rgba(255, 77, 79, 0.3) 100%
  );
  box-shadow: 0 0 4px rgba(255, 77, 79, 0.4);
}

.time-pointer-line.pointer-after-end {
  background: linear-gradient(180deg, 
    rgba(140, 140, 140, 0.8) 0%, 
    rgba(140, 140, 140, 0.6) 50%,
    rgba(140, 140, 140, 0.3) 100%
  );
  box-shadow: 0 0 4px rgba(140, 140, 140, 0.4);
}

.time-pointer-line.pointer-overdue {
  background: linear-gradient(180deg, 
    rgba(255, 77, 79, 1) 0%, 
    rgba(255, 77, 79, 0.8) 50%,
    rgba(255, 77, 79, 0.4) 100%
  );
  box-shadow: 0 0 6px rgba(255, 77, 79, 0.6);
  animation: overduePulseLine 1.5s ease-in-out infinite;
}

.current-time-float-badge.overdue {
  background: #ff4d4f;
  box-shadow: 0 4px 16px rgba(255, 77, 79, 0.5);
  animation: overduePulse 1.5s ease-in-out infinite;
}

.time-badge-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.current-time {
  font-size: 14px;
  font-weight: bold;
  line-height: 1.1;
}

.current-date {
  font-size: 11px;
  opacity: 0.9;
  line-height: 1.1;
}

.status-text {
  font-size: 9px;
  opacity: 0.8;
  line-height: 1.1;
  margin-top: 1px;
}

/* 连接线（浮标到精确位置） */
.connection-line {
  position: absolute;
  top: -8px;
  height: 1px;
  background: rgba(255, 255, 255, 0.6);
  transform-origin: left center;
  opacity: 0.7;
}

/* 动画效果 */
@keyframes pointerPulse {
  0%, 100% {
    opacity: 1;
    transform: translateX(-50%) scaleY(1);
  }
  50% {
    opacity: 0.8;
    transform: translateX(-50%) scaleY(1.1);
  }
}

@keyframes floatBadge {
  0%, 100% {
    transform: translateX(-50%) translateY(0px);
  }
  50% {
    transform: translateX(-50%) translateY(-3px);
  }
}

@keyframes overduePulse {
  0%, 100% {
    transform: translateX(-50%) translateY(0px) scale(1);
    box-shadow: 0 4px 16px rgba(255, 77, 79, 0.5);
  }
  50% {
    transform: translateX(-50%) translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 77, 79, 0.7);
  }
}

@keyframes overduePulseLine {
  0%, 100% {
    opacity: 0.8;
    box-shadow: 0 0 6px rgba(255, 77, 79, 0.6);
    transform: translateX(-50%) scaleY(1);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 12px rgba(255, 77, 79, 0.9);
    transform: translateX(-50%) scaleY(1.2);
  }
}

.current-time-line {
  width: 2px;
  height: 80px;
  background: linear-gradient(180deg, #ff4d4f 0%, rgba(255, 77, 79, 0.3) 100%);
  border-radius: 1px;
  position: relative;
}

.current-time-line::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(255, 77, 79, 0.8);
  animation: currentTimePulse 1.5s infinite;
}

.current-time-label {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4d4f;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
}

.current-time-label .time-text {
  display: block;
  font-size: 11px;
}

.current-time-label .date-text {
  display: block;
  font-size: 9px;
  opacity: 0.9;
}

/* 当前时间指示器状态样式 */
.current-time-indicator.status-before-start .current-time-line,
.current-time-indicator.status-before-start .current-time-line::before {
  background: #52c41a;
  box-shadow: 0 0 12px rgba(82, 196, 26, 0.8);
}

.current-time-indicator.status-before-start .current-time-label {
  background: #52c41a;
}

.current-time-indicator.status-after-end .current-time-line,
.current-time-indicator.status-after-end .current-time-line::before {
  background: #8c8c8c;
  box-shadow: 0 0 12px rgba(140, 140, 140, 0.8);
}

.current-time-indicator.status-after-end .current-time-label {
  background: #8c8c8c;
}

.current-time-indicator.overdue .current-time-line,
.current-time-indicator.overdue .current-time-line::before {
  background: #ff4d4f;
  box-shadow: 0 0 12px rgba(255, 77, 79, 1);
}

.current-time-indicator.overdue .current-time-label {
  background: #ff4d4f;
}

/* 下方当前时间指示器的状态样式 */
.current-time-indicator.below-timeline.status-before-start .current-time-line,
.current-time-indicator.below-timeline.status-before-start .current-time-line::before {
  background: linear-gradient(0deg, #52c41a 0%, rgba(82, 196, 26, 0.3) 100%);
  box-shadow: 0 0 12px rgba(82, 196, 26, 0.8);
}

.current-time-indicator.below-timeline.status-before-start .current-time-label {
  background: #52c41a;
}

.current-time-indicator.below-timeline.status-after-end .current-time-line,
.current-time-indicator.below-timeline.status-after-end .current-time-line::before {
  background: linear-gradient(0deg, #8c8c8c 0%, rgba(140, 140, 140, 0.3) 100%);
  box-shadow: 0 0 12px rgba(140, 140, 140, 0.8);
}

.current-time-indicator.below-timeline.status-after-end .current-time-label {
  background: #8c8c8c;
}

/* 当前时间发光动画 */
@keyframes currentTimePulse {
  0% {
    transform: translateX(-50%) scale(1);
    box-shadow: 0 0 12px rgba(255, 77, 79, 0.8);
  }
  50% {
    transform: translateX(-50%) scale(1.3);
    box-shadow: 0 0 20px rgba(255, 77, 79, 1);
  }
  100% {
    transform: translateX(-50%) scale(1);
    box-shadow: 0 0 12px rgba(255, 77, 79, 0.8);
  }
}

/* ========== 全新统一时间轴样式 ========== */

.unified-timeline-axis {
  margin-top: 24px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid #e6eaf2;
  min-height: 160px;
}

.timeline-container {
  position: relative;
  height: 100px;
  margin-top: 16px;
}

.timeline-main-track {
  position: absolute;
  top: 50%;
  left: 5%;
  right: 5%;
  height: 4px;
  background: linear-gradient(90deg, #d6e4ff 0%, #234fa2 50%, #d6e4ff 100%);
  border-radius: 2px;
  transform: translateY(-50%);
  z-index: 1;
}

.timeline-boundaries {
  position: relative;
  height: 100%;
}

.boundary-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 5;
}

.boundary-icon {
  font-size: 12px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
}

.boundary-date {
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #234fa2;
  border: 1px solid #d6e4ff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.boundary-label {
  font-size: 9px;
  color: #64748b;
  font-weight: 500;
}

.timeline-events {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  z-index: 10;
}

.event-group {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 20;
}

.event-group:hover {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 30;
}

.event-stack {
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  min-height: 20px;
  justify-content: flex-end;
}

.event-point {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: absolute;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  bottom: 0;
  z-index: 40;
}

/* 确保多个事件点不重叠 */
.event-point:nth-child(1) { transform: translateY(0px); }
.event-point:nth-child(2) { transform: translateY(-14px); }
.event-point:nth-child(3) { transform: translateY(-28px); }
.event-point:nth-child(4) { transform: translateY(-42px); }
.event-point:nth-child(5) { transform: translateY(-56px); }

/* 溢出指示器样式（庄重版 - 使用深色调，符合国企风格） */
.event-point.overflow-indicator {
  border-color: #5a6c8a;
  background: linear-gradient(135deg, #f5f7fa, #e8eef7);
  border-width: 3px;
  position: relative;
  cursor: pointer;
  animation: pulse-soft 2s infinite;
  z-index: 50 !important;
}

.event-point.overflow-indicator:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(90, 108, 138, 0.3);
}

.overflow-count {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #5a6c8a;
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
  line-height: 1.2;
  min-width: 20px;
  text-align: center;
  z-index: 55;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(90, 108, 138, 0.3);
  /* 庄重的深色调 */
}

@keyframes pulse-red {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 8px rgba(255, 77, 79, 0);
  }
}

/* 新增：蓝色脉冲动画（用于任务密集提示，避免红色误解） */
@keyframes pulse-blue {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 8px rgba(24, 144, 255, 0);
  }
}

/* 柔和脉冲动画（庄重色调） */
@keyframes pulse-soft {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(90, 108, 138, 0.3);
  }
  50% { 
    box-shadow: 0 0 0 6px rgba(90, 108, 138, 0);
  }
}

/* 庄重的事件类型样式（符合国企风格） */
.event-point.event-task_start {
  border-color: #234fa2;
  background: #f0f5ff;
}

.event-point.event-task_end {
  border-color: #234fa2;
  background: #f0f5ff;
  box-shadow: 0 0 12px rgba(35, 79, 162, 0.3);
}

.event-point.event-task_due {
  border-color: #fa8c16;
  background: #fff7e6;
}

.event-point.event-milestone {
  border-color: #595959;
  background: #f5f5f5;
  box-shadow: 0 0 8px rgba(89, 89, 89, 0.2);
}


.event-icon {
  font-size: 10px;
  line-height: 1;
}

.event-date-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  border: 1px solid #e6eaf2;
  white-space: nowrap;
  z-index: 35;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.event-count-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #234fa2, #4e7be6);
  color: white;
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 8px;
  font-weight: bold;
  min-width: 14px;
  text-align: center;
  z-index: 20;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.current-time-group .event-count-badge {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
}

/* 高密度事件组样式（智能堆叠） */
.high-density-group {
  z-index: 25 !important;
}

.high-density-group:hover {
  z-index: 35 !important;
}

.high-density-group .event-date-label {
  background: linear-gradient(135deg, #5a6c8a, #6b7a95);
  color: white;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  z-index: 26;
  position: relative;
  /* 庄重的深色调：表示任务密集，而非过期 */
}

.high-density-group .event-count-badge {
  background: linear-gradient(135deg, #5a6c8a, #6b7a95);
  animation: pulse-badge 2s infinite;
  z-index: 27;
  position: relative;
  /* 庄重的深色调：任务密集提示，红色仅用于过期 */
}

/* 密度等级样式 */
.density-medium {
  filter: saturate(1.2);
}

.density-high {
  filter: saturate(1.5) brightness(1.1);
}

.density-high .event-stack {
  background: radial-gradient(circle, rgba(255, 77, 79, 0.1) 0%, transparent 70%);
  padding: 8px;
  border-radius: 50%;
}

.density-extreme {
  filter: saturate(1.8) brightness(1.2);
  animation: extreme-pulse 3s infinite;
}

.density-extreme .event-stack {
  background: radial-gradient(circle, rgba(255, 77, 79, 0.15) 0%, transparent 80%);
  padding: 12px;
  border-radius: 50%;
}

@keyframes pulse-badge {
  0%, 100% { 
    transform: scale(1);
  }
  50% { 
    transform: scale(1.1);
  }
}

@keyframes extreme-pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1.1);
    filter: saturate(1.8) brightness(1.2);
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.15);
    filter: saturate(2) brightness(1.3);
  }
}

/* 事件详情浮窗样式（重构版，防抖动定位） */
.event-details-tooltip {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  padding: 20px;
  max-width: 360px;
  min-width: 320px;
  z-index: 1000;
  border: 1px solid #e6eaf2;
  pointer-events: auto;
  transition: opacity 0.2s ease;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.tooltip-title {
  font-weight: 600;
  color: #234fa2;
  font-size: 16px;
}

.tooltip-count {
  background: #f0f7ff;
  color: #234fa2;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #d6e4ff;
}

.tooltip-count.current-time-badge {
  background: #fff1f0;
  color: #ff4d4f;
  border-color: #ffccc7;
}

.tooltip-content {
  max-height: 280px;
  overflow-y: auto;
}

.event-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f9f9f9;
}

.event-detail-item:last-child {
  border-bottom: none;
}

.event-icon-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.event-detail-item.event-task_start .event-icon-wrapper {
  border-color: #234fa2;
  background: #f0f5ff;
}

.event-detail-item.event-task_end .event-icon-wrapper {
  border-color: #234fa2;
  background: #f0f5ff;
}

.event-detail-item.event-task_due .event-icon-wrapper {
  border-color: #fa8c16;
  background: #fff7e6;
}

.event-detail-item.event-milestone .event-icon-wrapper {
  border-color: #595959;
  background: #f5f5f5;
}

.event-detail-item.event-current_time .event-icon-wrapper {
  border-color: #ff4d4f;
  background: #fff1f0;
}

.event-icon-wrapper .event-icon {
  font-size: 12px;
  line-height: 1;
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-type {
  font-size: 13px;
  font-weight: 600;
  color: #234fa2;
}

.event-task-name {
  font-size: 12px;
  color: #333;
  line-height: 1.3;
}

.milestone-name {
  font-size: 11px;
  color: #595959;
  font-weight: 500;
  font-style: italic;
}

.current-time-info {
  font-size: 11px;
  color: #ff4d4f;
  font-weight: 600;
}

/* ============= 溢出面板样式（智能堆叠新增） ============= */
.overflow-panel-content {
  max-height: 500px;
  overflow-y: auto;
}

.overflow-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #ff4d4f;
}

.summary-text {
  color: #595959;
  font-size: 14px;
}

.overflow-events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overflow-event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.overflow-event-item:hover {
  background: #f0f5ff;
  border-color: #234fa2;
}

.overflow-event-item .event-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.overflow-event-item .event-info {
  flex: 1;
}

.overflow-event-item .event-type {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.overflow-event-item .event-task-name {
  font-size: 14px;
  font-weight: 500;
  color: #234fa2;
  margin-bottom: 2px;
}

.overflow-event-item .milestone-name {
  font-size: 12px;
  color: #ff7875;
  font-weight: 500;
}

.event-index {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 600;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 12px;
  flex-shrink: 0;
}

/* 不同事件类型的溢出面板图标样式 */
.overflow-event-item.event-task_start .event-icon-wrapper {
  background: #f0f5ff;
  border: 2px solid #234fa2;
  color: #234fa2;
}

.overflow-event-item.event-task_end .event-icon-wrapper {
  background: #f6f6f6;
  border: 2px solid #595959;
  color: #595959;
}

.overflow-event-item.event-due .event-icon-wrapper {
  background: #fff7e6;
  border: 2px solid #fa8c16;
  color: #fa8c16;
}

.overflow-event-item.event-milestone .event-icon-wrapper {
  background: #fff1f0;
  border: 2px solid #ff4d4f;
  color: #ff4d4f;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-item {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 20px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.submission-item:hover {
  border-color: #234fa2;
  box-shadow: 0 2px 8px rgba(35,79,162,0.1);
}

.submission-item.reviewed {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.submitter-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.submitter-details h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.submit-time {
  margin: 0;
  color: #8c8c8c;
  font-size: 12px;
}

.submission-status {
  display: flex;
  gap: 8px;
}

.submission-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.content-summary,
.attachments {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.label {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
}

.summary-text {
  color: #333;
  font-size: 13px;
  line-height: 1.5;
  flex: 1;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-tag {
  margin: 0;
  cursor: pointer;
}

.submission-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-submissions {
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

 /* 审查意见弹窗样式 */
 .review-opinion-form {
   padding: 0;
 }
 
 .review-summary {
   margin-bottom: 20px;
 }
 
 .review-opinion-actions {
   margin-top: 24px;
   padding-top: 16px;
   border-top: 1px solid #e6eaf2;
   display: flex;
   justify-content: center;
 }

 /* =========== 增强版审查详情弹窗样式（项目负责人端） =========== */

.enhanced-review-modal .ant-modal-content {
  padding: 0;
}

.enhanced-review-modal .ant-modal-header {
  background: linear-gradient(135deg, #f8f9fb, #f0f3f7);
  border-bottom: 2px solid #d9d9d9;
}

.enhanced-review-content {
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
}

/* 提交概览区域 */
.submission-overview {
  background: #fafbfc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e6eaf2;
}

.quick-actions {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #d9d9d9;
}

/* 主要内容区域 */
.main-content-area {
  background: white;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  overflow: hidden;
}

.main-content-area .ant-tabs-card .ant-tabs-tab {
  background: #f8f9fa;
  border-color: #d9d9d9;
  color: #595959;
}

.main-content-area .ant-tabs-card .ant-tabs-tab-active {
  background: white;
  color: #234fa2;
  font-weight: 600;
}

.main-content-area .ant-tabs-content-holder {
  padding: 24px;
  min-height: 500px;
}

/* 当前提交内容 */
.current-submission-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.version-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.submission-time {
  color: #8c8c8c;
  font-size: 12px;
}

/* 历史版本样式 */
.version-history-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6eaf2;
}

.history-header h4 {
  margin: 0;
  color: #234fa2;
}

.version-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-item {
  background: #fafbfc;
  border: 1px solid #e6eaf2;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.version-item:hover {
  border-color: #5a6c8a;
  box-shadow: 0 2px 8px rgba(90, 108, 138, 0.1);
}

.version-item.current-version {
  border-color: #52c41a;
  background: #f6ffed;
}

.version-item.selected-version {
  border-color: #5a6c8a;
  background: #f5f7fa;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-time {
  color: #8c8c8c;
  font-size: 12px;
}

.version-note {
  color: #5a6c8a;
  font-size: 12px;
  font-style: italic;
}

.version-summary p {
  margin: 0 0 12px 0;
  color: #595959;
  line-height: 1.6;
}

.version-stats {
  display: flex;
  gap: 8px;
}

/* 审查记录样式 */
.review-history-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e6eaf2;
}

.review-timeline {
  background: white;
}

.timeline-dot {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  border: 2px solid currentColor;
}

.review-record {
  background: #fafbfc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e6eaf2;
}

.review-record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-record .reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-record .reviewer-name {
  font-weight: 600;
  color: #234fa2;
}

.review-record .review-time {
  color: #8c8c8c;
  font-size: 12px;
  margin-left: 8px;
}

.review-record-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-target {
  font-size: 13px;
  color: #595959;
}

.review-record .review-opinion,
.review-record .review-suggestions {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #234fa2;
}

.review-record .review-opinion strong,
.review-record .review-suggestions strong {
  color: #234fa2;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.review-record .review-opinion p,
.review-record .review-suggestions p {
  margin: 0;
  color: #333;
  font-size: 13px;
  line-height: 1.6;
}

/* 底部操作栏 */
.enhanced-review-content .review-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e6eaf2;
  display: flex;
  justify-content: center;
}

/* =========== 优化版本审查关联视图样式 =========== */

.unified-history-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 统计概览 */
.history-stats {
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e6eaf2;
}

.timeline-controls {
  display: flex;
  justify-content: flex-end;
}

/* 版本审查卡片容器 */
.version-review-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 版本卡片基础样式 */
.version-card {
  background: #fff;
  border-radius: 8px;
  border: 2px solid #e6eaf2;
  overflow: hidden;
  transition: all 0.3s ease;
}

.version-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 不同状态的版本卡片 */
.version-card.current-version {
  border-color: #5a6c8a;
  background: #f8f9fb;
}

.version-card.rejected-version {
  border-color: #ff4d4f;
  background: #fffbfb;
}

.version-card.approved-version {
  border-color: #52c41a;
  background: #fbfff9;
}

/* 版本卡片头部 */
.version-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e6eaf2;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}

.version-tag.current {
  background: #5a6c8a;
  color: #fff;
}

.version-tag.rejected {
  background: #ff4d4f;
  color: #fff;
}

.version-tag.approved {
  background: #52c41a;
  color: #fff;
}

.version-time {
  color: #8c8c8c;
  font-size: 13px;
}

.version-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.version-status.pending {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.version-status.rejected {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffb3b3;
}

.version-status.approved {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

/* 版本卡片内容 */
.version-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 提交部分 */
.submission-section h6 {
  margin: 0 0 12px 0;
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
}

.version-note {
  color: #8c8c8c;
  font-style: italic;
  margin: 0 0 8px 0;
  font-size: 13px;
}

.submission-summary {
  color: #333;
  margin: 0 0 16px 0;
  line-height: 1.6;
  font-size: 14px;
}

.submission-detail {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section strong {
  color: #234fa2;
  font-size: 13px;
  display: block;
  margin-bottom: 6px;
}

.detail-section p {
  margin: 0;
  color: #595959;
  line-height: 1.5;
  font-size: 13px;
}

.detail-section ul {
  margin: 6px 0 0 0;
  padding-left: 16px;
  color: #595959;
  font-size: 13px;
}

.detail-section li {
  margin-bottom: 4px;
  line-height: 1.4;
}

.detail-note {
  color: #595959;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.submission-meta {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.meta-item {
  background: #f0f0f0;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 审查部分 */
.review-section {
  border-top: 1px solid #e6eaf2;
  padding-top: 16px;
}

.review-section h6 {
  margin: 0 0 12px 0;
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
}

.review-section.empty .no-review {
  color: #8c8c8c;
  font-style: italic;
  margin: 0;
  font-size: 13px;
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 13px;
}

.reviewer {
  color: #234fa2;
  font-weight: 500;
}

.review-content {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
}

.review-section.rejected .review-content {
  background: #fff2f0;
  border-left: 4px solid #ff4d4f;
}

.review-section.approved .review-content {
  background: #f6ffed;
  border-left: 4px solid #52c41a;
}

.review-opinion,
.review-requirements,
.review-suggestions {
  margin-bottom: 16px;
}

.review-opinion:last-child,
.review-requirements:last-child,
.review-suggestions:last-child {
  margin-bottom: 0;
}

.review-opinion strong,
.review-requirements strong,
.review-suggestions strong {
  color: #234fa2;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.review-opinion p,
.review-suggestions p {
  margin: 0;
  color: #333;
  line-height: 1.6;
  font-size: 14px;
}

.review-requirements ol {
  margin: 8px 0 0 0;
  padding-left: 20px;
  color: #333;
  font-size: 14px;
}

.review-requirements li {
  margin-bottom: 6px;
  line-height: 1.5;
 }

 /* 响应式设计 */
 @media (max-width: 768px) {
  .progress-stats {
    margin-bottom: 16px;
  }
  
  /* 统计卡片样式 */
  .stat-card {
    padding: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;
    background: #fff;
    border: 1px solid #f0f0f0;
  }
  
  .stat-card.clickable {
    cursor: pointer;
  }
  
  .stat-card.clickable:hover {
    border-color: #d9d9d9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
  
  .stat-card.urgent:hover {
    border-color: #ffd591;
    box-shadow: 0 2px 8px rgba(250, 140, 22, 0.15);
  }
  
  .stat-card.overdue:hover {
    border-color: #ffccc7;
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
  }
  
  .stat-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: statusPulse 2s infinite;
  }
  
  .stat-indicator.urgent {
    background: #fa8c16;
    box-shadow: 0 0 6px rgba(250, 140, 22, 0.6);
  }
  
  .stat-indicator.overdue {
    background: #ff4d4f;
    box-shadow: 0 0 6px rgba(255, 77, 79, 0.6);
  }
  
  @keyframes statusPulse {
    0%, 100% { 
      opacity: 1;
      transform: scale(1);
    }
    50% { 
      opacity: 0.7;
      transform: scale(1.2);
    }
  }
  
  /* 统计穿透模态框样式（简化专业版） */
  .task-list-content {
    padding: 0;
  }
  
  .task-cards-container {
    padding: 0 8px;
  }
  
  .simple-task-card {
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fff;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
  }
  
  .simple-task-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* 不同状态的卡片样式 */
  .simple-task-card.overdue-card {
    border-left-color: #ff4d4f;
    background: #fffbfb;
  }
  
  .simple-task-card.due-soon-card {
    border-left-color: #fa8c16;
    background: #fffaf6;
  }
  
  .simple-task-card.completed-card {
    border-left-color: #52c41a;
    background: #f8fff8;
  }
  
  .simple-task-card.in-progress-card {
    border-left-color: #1890ff;
    background: #f8fcff;
  }
  
  .simple-task-card.pending-card {
    border-left-color: #d9d9d9;
    background: #fafafa;
  }
  
  .task-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .task-card-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    flex: 1;
    line-height: 1.4;
  }
  
  .task-meta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  
  .task-card-body {
    color: #595959;
    line-height: 1.5;
  }
  
  .time-info {
    margin-bottom: 8px;
    font-size: 13px;
  }
  
  .time-info span {
    display: inline-block;
    margin-right: 12px;
    margin-bottom: 4px;
  }
  
  .task-desc {
    margin-bottom: 8px;
    color: #8c8c8c;
    font-size: 13px;
    line-height: 1.4;
  }
  
  .warning-text {
    color: #ff4d4f;
    font-size: 12px;
    font-weight: 500;
    margin-top: 8px;
  }
  
  .submission-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .submission-status {
    align-self: flex-start;
  }
  
  .content-summary,
  .attachments {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .submission-actions {
    justify-content: flex-start;
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
</style>


