<template>
  <div class="project-monitor-page">
    <!-- 项目标题区域 -->
    <div class="project-header">
      <div class="header-left">
        <a-button type="text" @click="goBack" class="back-btn">
          <ArrowLeftOutlined />
          返回
        </a-button>
        <div class="project-info">
          <h1 class="project-title">{{ projectInfo.name }}</h1>
          <div class="project-meta">
            <a-tag color="blue">{{ projectInfo.code }}</a-tag>
            <a-tag :color="getStatusColor(projectInfo.status)">
              {{ getStatusText(projectInfo.status) }}
            </a-tag>
            <span class="project-dates">
              {{ projectInfo.startDate }} - {{ projectInfo.endDate }}
            </span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <a-progress 
          type="circle" 
          :percent="projectInfo.progress" 
          :size="80"
          :stroke-color="getProgressColor(projectInfo.progress)"
        />
        <div class="progress-info">
          <div class="progress-text">整体进度</div>
          <div class="progress-value">{{ projectInfo.progress }}%</div>
        </div>
      </div>
    </div>



    <!-- 主内容区域 -->
    <div class="monitor-content" ref="monitorContentRef">
      <!-- 左侧：WBS任务树与详情并排 -->
      <div class="left-panel" :style="{ width: leftPanelWidth + 'px' }" ref="leftPanelRef">
        <a-card title="📋 WBS任务结构与详情" size="small" class="wbs-combined-card">
          <template #extra>
            <a-space>
              <a-button 
                :type="wbsEditMode ? 'primary' : 'default'"
                size="small" 
                @click="toggleWBSEditMode"
              >
                <EditOutlined />
                {{ wbsEditMode ? '完成编辑' : '编辑结构' }}
              </a-button>
              <!-- 视图切换与批量操作（放置在卡片标题extra，不占用内容区域） -->
              <a-segmented v-model:value="wbsViewMode" :options="[{label:'树视图',value:'tree'},{label:'表格视图',value:'table'}]" size="small" @change="handleViewModeChange" />
              <a-button v-if="isTableDrawerOpen" size="small" @click="batchStart" :disabled="selectedRowKeys.length===0">批量开始</a-button>
              <a-button v-if="isTableDrawerOpen" size="small" @click="batchComplete" :disabled="selectedRowKeys.length===0">批量完成</a-button>
              <a-dropdown v-if="wbsEditMode" trigger="['click']">
                <a-button type="primary" size="small">
                  <PlusOutlined /> 顶级里程碑
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="addTopLevelMilestone(lastMilestoneType || 'opening')">按最近类型（{{ getMilestoneTitleByType(lastMilestoneType || 'opening') }}）</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item @click="addTopLevelMilestone('opening')">开题里程碑</a-menu-item>
                    <a-menu-item @click="addTopLevelMilestone('midterm')">中期里程碑</a-menu-item>
                    <a-menu-item @click="addTopLevelMilestone('acceptance')">验收里程碑</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <a-button type="text" size="small" @click="expandAll">
                <PlusSquareOutlined />
                展开全部
              </a-button>
              <a-button type="text" size="small" @click="collapseAll">
                <MinusSquareOutlined />
                收起全部
              </a-button>
            </a-space>
          </template>
          
          <div class="wbs-container" :class="{ 'edit-mode-container': wbsEditMode, 'force-show-task-detail': forceShowTaskDetail }">
            <!-- 左侧：WBS树状结构（始终展示） -->
            <div class="wbs-tree-section">
              <a-tree
                v-model:expandedKeys="expandedKeys"
                v-model:selectedKeys="selectedKeys"
                :tree-data="wbsData"
                @select="onTaskSelect"
                class="wbs-tree"
                :class="{ 'edit-mode-active': wbsEditMode }"
                :draggable="wbsEditMode"
                @drop="handleTreeDrop"
              >
                <template #title="{ key, title, status, progress, responsible, assignedTo, children, isMilestone, milestoneType, materials }">
                  <div class="tree-node" :class="{ 
                    'edit-mode': wbsEditMode, 
                    'milestone-node': isMilestone,
                    [`milestone-${milestoneType}`]: isMilestone && milestoneType
                  }">
                    <div class="node-content">
                      <span class="node-title" :class="{ 'milestone-title': isMilestone }">{{ title }}</span>
                      <a-badge 
                        v-if="getTaskUnreadBadge(String(projectInfo.id), String(key)) > 0"
                        :count="getTaskUnreadBadge(String(projectInfo.id), String(key))"
                        :overflow-count="99"
                        class="node-unread-badge"
                      />
                      <a-tag 
                        :color="isMilestone ? getMilestoneStatusColor(status) : getTaskStatusColor(status)" 
                        size="small"
                        class="node-status"
                      >
                        {{ isMilestone ? getMilestoneStatusText(status) : getTaskStatusText(status) }}
                      </a-tag>
                      <!-- 里程碑特殊标识 -->
                      <a-badge v-if="isMilestone" :count="(materials && materials.length) || 0" color="#1890ff" size="small" />
                    </div>
                    <div class="node-meta">
                      <div class="node-progress">
                        <a-progress 
                          :percent="progress" 
                          size="small" 
                          :show-info="false"
                          :stroke-color="isMilestone ? getMilestoneProgressColor(progress) : getProgressColor(progress)"
                        />
                        <span class="progress-text">{{ progress }}%</span>
                      </div>
                      <span class="node-responsible">{{ (assignedTo && assignedTo.name) || responsible || '未分配' }}</span>
                      <!-- 里程碑操作按钮 -->
                      <div v-if="isMilestone && status === 'upcoming'" class="milestone-actions">
                        <a-button 
                          type="primary" 
                          size="small" 
                          @click.stop="prepareMilestoneFromWBS(key, title, milestoneType)"
                        >
                          <FileTextOutlined />
                          准备材料
                        </a-button>
                      </div>
                    </div>
                    
                    <!-- 编辑模式下的操作按钮 -->
                    <div v-if="wbsEditMode" class="node-actions" @click.stop>
                      <a-dropdown trigger="['click']">
                        <a-button type="text" size="small" class="action-btn">
                          <PlusOutlined />
                        </a-button>
                        <template #overlay>
                          <a-menu>
                            <a-menu-item @click="addChildTask(key)">+ 子任务</a-menu-item>
                            <a-menu-item @click="addSiblingTask(key)">+ 同级任务</a-menu-item>
                            <a-sub-menu title="+ 里程碑（子级）">
                              <a-menu-item @click="addMilestoneChild(key, 'opening')">开题</a-menu-item>
                              <a-menu-item @click="addMilestoneChild(key, 'midterm')">中期</a-menu-item>
                              <a-menu-item @click="addMilestoneChild(key, 'acceptance')">验收</a-menu-item>
                              <a-menu-divider />
                              <a-menu-item @click="addMilestoneChild(key, lastMilestoneType || 'opening')">按最近类型（{{ getMilestoneTitleByType(lastMilestoneType || 'opening') }}）</a-menu-item>
                            </a-sub-menu>
                            <a-sub-menu title="+ 里程碑（同级）">
                              <a-menu-item @click="addMilestoneSibling(key, 'opening')">开题</a-menu-item>
                              <a-menu-item @click="addMilestoneSibling(key, 'midterm')">中期</a-menu-item>
                              <a-menu-item @click="addMilestoneSibling(key, 'acceptance')">验收</a-menu-item>
                              <a-menu-divider />
                              <a-menu-item @click="addMilestoneSibling(key, lastMilestoneType || 'opening')">按最近类型（{{ getMilestoneTitleByType(lastMilestoneType || 'opening') }}）</a-menu-item>
                            </a-sub-menu>
                          </a-menu>
                        </template>
                      </a-dropdown>
                      
                      <a-tooltip title="编辑任务">
                        <a-button 
                          type="text" 
                          size="small" 
                          @click="editWBSTask(key)"
                          class="action-btn"
                        >
                          <EditOutlined />
                        </a-button>
                      </a-tooltip>
                      
                      <a-tooltip title="左移（反缩进）">
                        <a-button 
                          type="text" 
                          size="small" 
                          @click="outdentTask(key)"
                          class="action-btn"
                        >
                          <LeftOutlined />
                        </a-button>
                      </a-tooltip>
                      
                      <a-tooltip title="右移（缩进）">
                        <a-button 
                          type="text" 
                          size="small" 
                          @click="indentTask(key)"
                          class="action-btn"
                        >
                          <RightOutlined />
                        </a-button>
                      </a-tooltip>
                      
                      <a-tooltip title="上移">
                        <a-button 
                          type="text" 
                          size="small" 
                          @click="moveTaskUp(key)"
                          class="action-btn"
                          :disabled="!canMoveUp(key)"
                        >
                          <ArrowUpOutlined />
                        </a-button>
                      </a-tooltip>
                      
                      <a-tooltip title="下移">
                        <a-button 
                          type="text" 
                          size="small" 
                          @click="moveTaskDown(key)"
                          class="action-btn"
                          :disabled="!canMoveDown(key)"
                        >
                          <ArrowDownOutlined />
                        </a-button>
                      </a-tooltip>
                      
                      <a-tooltip title="删除任务">
                        <a-button 
                          type="text" 
                          size="small" 
                          @click="deleteWBSTask(key)"
                          class="action-btn delete-btn"
                          :disabled="children && children.length > 0"
                        >
                          <DeleteOutlined />
                        </a-button>
                      </a-tooltip>
                      
                      <a-dropdown trigger="['click']">
                        <a-button type="text" size="small" class="action-btn">
                          <MoreOutlined />
                        </a-button>
                        <template #overlay>
                          <a-menu>
                            <a-menu-item @click="toggleMilestone(key, true)">设为里程碑</a-menu-item>
                            <a-menu-item @click="toggleMilestone(key, false)">取消里程碑</a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                    </div>
                  </div>
                </template>
              </a-tree>
            </div>

            <!-- 表格视图移动到卡片外部显示，不占用上方布局 -->

            <!-- 分隔线 -->
            <div class="wbs-divider" />

            <!-- 右侧：任务详情 -->
            <div class="task-detail-section">
                              <!-- 有选中任务时显示详情 -->
              <div v-if="selectedTask" class="wbs-task-detail">
                <!-- 任务详情标题 -->
                <div class="detail-title-bar">
                  <h3 class="detail-panel-title">任务详情</h3>
                  <div class="title-actions">
                    
                    <a-button 
                      type="default" 
                      size="small" 
                      @click="openOperationHistory"
                      class="history-btn"
                      title="查看操作历史"
                    >
                      <FileTextOutlined />
                      操作历史
                      <a-badge v-if="getTaskUnreadBadge(String(projectInfo.id), String(selectedTask?.key))>0" :count="getTaskUnreadBadge(String(projectInfo.id), String(selectedTask?.key))" :overflow-count="99" style="margin-left:6px;" />
                    </a-button>
                    <a-button type="primary" size="small" @click="openTaskEditModal" class="edit-btn" title="编辑任务 (Ctrl+E)">
                      <EditOutlined />
                      编辑
                    </a-button>
                    <a-button type="default" size="small" @click="duplicateTask" class="duplicate-btn" title="复制任务 (Ctrl+D)">
                      <CopyOutlined />
                      复制
                    </a-button>
                    <a-button type="text" size="small" @click="clearTaskSelection" class="close-btn" title="清除选中 (Esc)">
                      <CloseOutlined />
                    </a-button>
                  </div>
                </div>

                <!-- 任务基本信息 -->
                <div class="detail-header">
                  <h4 class="task-title-detail">{{ selectedTask.title }}</h4>
                  <div class="task-meta-detail">
                    <a-tag :color="getTaskStatusColor(selectedTask.status)">
                      {{ getTaskStatusText(selectedTask.status) }}
                    </a-tag>
                    <a-tag v-if="selectedTask.isCritical" color="red">
                      关键路径
                    </a-tag>
                  </div>
                </div>

                <!-- 任务描述 -->
                <div class="task-description">
                  <label>任务描述:</label>
                  <div class="description-content">
                    {{ selectedTask.description || '暂无描述' }}
                  </div>
                </div>

                <!-- 进度和分配信息 -->
                <div class="detail-progress">
                  <!-- 进度信息与更新按钮 -->
                  <div class="progress-item">
                    <label>完成进度:</label>
                    <div class="progress-content">
                      <div class="progress-display">
                        <a-progress :percent="selectedTask.progress" size="small" :show-info="false" />
                        <span class="progress-value">{{ selectedTask.progress }}%</span>
                      </div>
                        <a-button 
                          v-if="selectedTask.status === 'pending'"
                          type="primary" size="small" @click="quickStartSelectedTask" class="progress-update-btn">
                          <PlayCircleOutlined />
                          开始任务
                        </a-button>
                      <a-button type="primary" size="small" @click="updateTaskProgress" class="progress-update-btn">
                        <EditOutlined />
                        更新进度
                      </a-button>
                    </div>
                  </div>
                  
                  <!-- 负责人信息与分配按钮 -->
                  <div class="assign-item">
                    <label>负责人:</label>
                    <div class="assign-content">
                      <!-- 负责人信息展示 -->
                      <div class="assign-display">
                        <div v-if="selectedTask.assignedTo" class="assigned-member-detail">
                          <a-avatar size="small">{{ selectedTask.assignedTo.name.charAt(0) }}</a-avatar>
                          <span>{{ selectedTask.assignedTo.name }}</span>
                          <a-tag size="small">{{ selectedTask.assignedTo.role }}</a-tag>
                        </div>
                        <span v-else class="unassigned">未分配</span>
                      </div>
                      
                      <!-- 分配操作按钮 -->
                      <a-button type="default" size="small" @click="showAssignSelect = !showAssignSelect" class="assign-btn">
                        <UserOutlined />
                        {{ selectedTask.assignedTo ? '重新分配' : '分配成员' }}
                      </a-button>
                    </div>
                    
                    <!-- 分配下拉框（条件显示）-->
                    <div v-if="showAssignSelect" class="assign-select-wrapper">
                      <a-select
                        :value="selectedTask && selectedTask.assignedTo && selectedTask.assignedTo.id"
                        placeholder="选择团队成员"
                        size="small"
                        allow-clear
                        style="width: 100%;"
                        @change="handleQuickAssignAndHide"
                        @blur="hideAssignSelect"
                      >
                        <a-select-option v-for="member in availableTeamMembers" :key="member.id" :value="member.id">
                          <div class="member-option-small">
                            <a-avatar size="small">{{ member.name.charAt(0) }}</a-avatar>
                            <span>{{ member.name }}</span>
                            <small style="color: #999; margin-left: 4px;">({{ member.role }})</small>
                          </div>
                        </a-select-option>
                      </a-select>
                    </div>
                  </div>
                </div>

                <!-- 里程碑类型配置 -->
                <div class="milestone-config">
                  <label>里程碑类型:</label>
                  <div class="milestone-content">
                    <a-select
                      v-model:value="selectedTask.milestoneType"
                      placeholder="选择里程碑类型"
                      size="small"
                      allow-clear
                      style="width: 100%;"
                      @change="handleMilestoneTypeChange">
                      <a-select-option value="opening">项目开题</a-select-option>
                      <a-select-option value="midterm">项目中期</a-select-option>
                      <a-select-option value="acceptance">项目验收</a-select-option>
                    </a-select>
                  </div>
                </div>

                <!-- 材料需求管理 (仅里程碑任务显示) -->
                <div v-if="selectedTask.milestoneType || selectedTask.allowMaterialUpload" class="material-requirements">
                  <label>材料需求:</label>
                  <div class="materials-list">
                    <div 
                      v-for="(requirement, index) in selectedTask.materialRequirements || []" 
                      :key="index"
                      class="material-item">
                      <div class="material-content">
                        <a-input 
                          v-model:value="requirement.name"
                          placeholder="材料名称"
                          size="small"
                          style="flex: 1" />
                        <a-tag :color="requirement.required ? 'red' : 'blue'" size="small">
                          {{ requirement.required ? '必需' : '可选' }}
                        </a-tag>
                        <a-tag v-if="requirement.fromTemplate" color="green" size="small">
                          模板
                        </a-tag>
                        <a-tooltip v-if="requirement.templateFileName" :title="`模板文件: ${requirement.templateFileName}`">
                          <FileOutlined style="color: #1890ff; margin: 0 4px;" />
                        </a-tooltip>
                        <a-button 
                          type="text" 
                          danger 
                          size="small"
                          @click="removeMaterialRequirement(index)">
                          <DeleteOutlined />
                        </a-button>
                      </div>
                      <div v-if="requirement.description" class="material-description">
                        <span class="description-text">{{ requirement.description }}</span>
                      </div>
                    </div>
                    <a-button 
                      type="dashed" 
                      size="small"
                      @click="addMaterialRequirement"
                      style="width: 100%; margin-top: 8px;">
                      <PlusOutlined />
                      添加材料需求
                    </a-button>
                  </div>
                </div>

                <!-- 任务设置 -->
                <div class="task-settings">
                  <label>任务设置:</label>
                  <div class="settings-content">
                    <a-checkbox 
                      :checked="!!(selectedTask.reminders && selectedTask.reminders.enabled)"
                      @change="handleReminderChange">
                      启用任务提醒
                    </a-checkbox>
                    <a-checkbox 
                      style="margin-left: 12px;"
                      :checked="!!selectedTask.allowMaterialUpload"
                      @change="handleAllowMaterialUploadChange"
                    >
                      允许材料上传（非里程碑）
                    </a-checkbox>
                    <div v-if="selectedTask.reminders && selectedTask.reminders.enabled" class="reminder-settings">
                      <span style="font-size: 12px; color: #666;">提前提醒时间：</span>
                      <a-checkbox-group 
                        v-model:value="selectedTask.reminders.beforeDeadline"
                        size="small">
                        <a-checkbox :value="7">7天</a-checkbox>
                        <a-checkbox :value="3">3天</a-checkbox>
                        <a-checkbox :value="1">1天</a-checkbox>
                      </a-checkbox-group>
                    </div>
                  </div>
                </div>

                <!-- 时间信息 -->
                <div class="detail-time">
                  <div class="time-item">
                    <label>开始时间:</label>
                    <span>{{ selectedTask.startDate }}</span>
                  </div>
                  <div class="time-item">
                    <label>结束时间:</label>
                    <span>{{ selectedTask.endDate }}</span>
                  </div>
                  <div class="time-item">
                    <label>持续时间:</label>
                    <span>{{ selectedTask.duration }} 天</span>
                  </div>
                </div>

                <!-- 保存分配操作 -->
                <div class="assignment-actions">
                  <a-space>
                    <a-button 
                      type="primary" 
                      size="small"
                      @click="saveTaskAssignment"
                      :disabled="!selectedTask.assignedTo">
                      保存分配
                    </a-button>
                    <a-button 
                      size="small"
                      @click="sendTaskNotification"
                      :disabled="!selectedTask.assignedTo">
                      发送通知
                    </a-button>
                  </a-space>
                </div>


              </div>

              <!-- 未选择任务时的提示 -->
              <div v-else class="no-selection">
                <a-empty 
                  description="点击左侧任务节点查看详情"
                  :image="false"
                  class="empty-hint"
                >
                  <template #image>
                    <div class="empty-icon">📋</div>
                  </template>
                </a-empty>
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 可拖拽分隔条 -->
      <div 
        class="resize-handle" 
        @mousedown="startResize"
        title="拖拽调整WBS面板宽度"
      >
        <div class="resize-line"></div>
      </div>

      <!-- 右侧：甘特图 -->
      <div class="right-panel" :style="{ width: rightPanelWidth + 'px' }">
        <a-card title="📊 项目进度甘特图" size="small" class="gantt-card">
          <template #extra>
            <a-space>
              <a-badge :count="projectUnreadCount" :overflow-count="99">
                <a-button size="small" @click="markAllRead">
                  <BellOutlined /> 更新提醒
                </a-button>
              </a-badge>
              <a-button size="small" @click="syncFromCache">
                <SyncOutlined /> 刷新进度
              </a-button>
              <a-button danger size="small" @click="resetProjectProgress">
                重置项目进度
              </a-button>
              <a-button danger size="small" @click="resetSelectedTask" :disabled="!selectedTask">
                重置选中任务
              </a-button>
              <a-radio-group v-model:value="timeScale" size="small">
                <a-radio-button value="month">月</a-radio-button>
                <a-radio-button value="week">周</a-radio-button>
                <a-radio-button value="day">日</a-radio-button>
              </a-radio-group>
              <a-button type="primary" size="small" @click="refreshGantt">
                <ReloadOutlined />
                刷新
              </a-button>
            </a-space>
          </template>

          <!-- 甘特图时间轴 -->
          <div class="gantt-container" ref="ganttContainerRef">
            <div class="gantt-header" ref="ganttHeaderRef">
              <div class="gantt-timeline" ref="ganttTimelineRef">
                <div 
                  v-for="timeUnit in timelineData" 
                  :key="timeUnit.key"
                  class="timeline-unit"
                  :style="{ width: timeUnit.width + 'px' }"
                >
                  {{ timeUnit.label }}
                </div>
              </div>
            </div>

            <!-- 甘特图主体 -->
            <div class="gantt-body" ref="ganttBodyRef">
              <div 
                v-for="task in visibleGanttTasks" 
                :key="task.key"
                class="gantt-row"
                :data-task-key="task.key"
                :class="{ 
                  'selected': selectedKeys.includes(task.key),
                  'parent-task': task.children && task.children.length > 0,
                  'child-task': task.level > 0,
                  'milestone-row': task.isMilestone,
                  [`milestone-${task.milestoneType}`]: task.isMilestone && task.milestoneType
                }"
                :style="{ 'padding-left': (task.level * 20) + 'px' }"
                @click="selectTask(task.key)"
              >
                <!-- 任务信息区域 -->
                <div class="task-info">
                  <div class="task-title-section">
                    <!-- 展开/收起按钮 -->
                    <a-button 
                      v-if="task.children && task.children.length > 0"
                      type="text" 
                      size="small" 
                      class="expand-btn"
                      @click.stop="toggleTaskExpand(task.key)"
                    >
                      <DownOutlined v-if="expandedKeys.includes(task.key)" />
                      <RightOutlined v-else />
                    </a-button>
                    <span v-else class="expand-placeholder"></span>
                    
                    <!-- 任务名称 -->
                    <span 
                      class="task-name" 
                      :class="[
                        'level-' + task.level,
                        { 'milestone-name': task.isMilestone },
                        recentlyUpdatedMap[String(task.key)] ? 'recently-updated' : ''
                      ]"
                    >
                      {{ task.title }}
                    </span>
                    <!-- 里程碑材料徽章 -->
                    <a-badge 
                      v-if="task.isMilestone && task.materials" 
                      :count="task.materials.length" 
                      color="#1890ff" 
                      size="small" 
                      style="margin-left: 8px;"
                    />
                    
                    <!-- 分配成员头像 -->
                    <a-avatar 
                      v-if="task.assignedTo" 
                      size="small" 
                      class="task-avatar"
                      :title="task.assignedTo.name"
                    >
                      {{ task.assignedTo.name.charAt(0) }}
                    </a-avatar>
                  </div>
                  
                  <div class="task-meta">
                    <span class="task-duration">{{ task.duration }}天</span>
                    <a-tag 
                      :color="getTaskStatusColor(task.status)" 
                      size="small" 
                      class="task-status-tag"
                    >
                      {{ getTaskStatusText(task.status) }}
                    </a-tag>
                  </div>
                </div>
                
                <!-- 甘特条形图区域 -->
                <div class="task-bar-container">
                  <div 
                    class="task-bar"
                    :style="getTaskBarStyle(task)"
                    :class="[
                      'status-' + task.status,
                      'level-' + task.level,
                      { 
                        'critical-path': task.isCritical,
                        'parent-bar': task.children && task.children.length > 0
                      }
                    ]"
                  >
                                         <!-- 进度条背景 -->
                     <div class="task-progress-track" :class="{ 'recently-updated': recentlyUpdatedMap[String(task.key)] }">
                       <!-- 实际进度条 -->
                       <div 
                         class="task-progress-fill" 
                         :style="{ 
                           width: task.progress + '%',
                           backgroundColor: getProgressFillColor(task.progress, task.status)
                         }"
                         :title="`实际进度: ${task.progress}%`"
                       ></div>
                     </div>
                     
                     <!-- 进度信息层 - 在进度条外面右侧 -->
                     <div class="task-progress-info gantt-progress-override">
                       <span class="task-progress-text gantt-text-override" :title="`DEBUG: 原始进度=${task.progress}, 状态=${task.status}`">{{ task.progress }}%</span>
                       <span v-if="task.status !== 'completed'" class="task-status-text gantt-status-override">{{ getTaskStatusText(task.status) }}</span>
                       <span v-if="task.status === 'completed'" class="task-completed-text gantt-completed-override">✓ 已完成</span>
                     </div>
                    
                    <!-- 关键路径标识 - 只在未完成的关键任务上显示 -->
                    <div v-if="task.isCritical && task.status !== 'completed'" class="critical-indicator">!</div>
                  </div>
                  
                  <!-- 依赖关系线（将来扩展） -->
                  <div v-if="task.dependencies" class="dependency-lines"></div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </div>
    </div>



    <!-- 更新进度弹窗 -->
    <a-modal
      v-model:open="progressModalVisible"
      title="更新任务进度"
      width="500px"
      @ok="handleProgressUpdate"
      @cancel="closeProgressModal"
      :confirmLoading="progressUpdating"
    >
      <div v-if="selectedTask" class="progress-update-form">
        <div class="task-info-section">
          <h4>{{ selectedTask.title }}</h4>
          <a-tag :color="getTaskStatusColor(selectedTask.status)">
            {{ getTaskStatusText(selectedTask.status) }}
          </a-tag>
        </div>
        
        <a-form :model="progressForm" layout="vertical">
          <a-form-item label="当前进度">
            <a-progress :percent="selectedTask.progress" />
            <span class="current-progress-text">{{ selectedTask.progress }}%</span>
          </a-form-item>
          
          <a-form-item 
            label="新进度" 
            :rules="[{ required: true, message: '请设置新的进度值' }]"
          >
            <a-slider 
              v-model:value="progressForm.newProgress" 
              :min="selectedTask.progress" 
              :max="100"
              :marks="{ [selectedTask.progress]: '当前', 100: '完成' }"
            />
            <div class="progress-display">
              <span class="new-progress-text">新进度: {{ progressForm.newProgress }}%</span>
              <span v-if="progressForm.newProgress === 100" class="completion-notice">
                🎉 任务将标记为已完成
              </span>
            </div>
          </a-form-item>
          
          <a-form-item 
            label="工作说明" 
            :rules="[{ required: true, message: '请输入本次工作说明' }]"
          >
            <a-textarea 
              v-model:value="progressForm.workNote" 
              placeholder="请描述本次进度更新的工作内容、遇到的问题或需要的支持..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>
          
          <a-form-item label="预计完成时间" v-if="progressForm.newProgress < 100">
            <a-date-picker 
              v-model:value="progressForm.estimatedDate"
              placeholder="选择预计完成时间"
              style="width: 100%"
              :disabled-date="disabledDate"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 任务编辑模态框 -->
    <a-modal
      v-model:open="taskEditModalVisible"
      title="编辑任务信息"
      width="600px"
      @ok="handleTaskEdit"
      @cancel="closeTaskEditModal"
      :confirmLoading="taskEditLoading"
      okText="保存"
      cancelText="取消"
    >
      <div style="max-height: 500px; overflow-y: auto;">
        <a-form
          ref="taskEditFormRef"
          :model="taskEditForm"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
          layout="horizontal"
        >
          <a-form-item 
            label="任务标题" 
            :rules="[{ required: true, message: '请输入任务标题' }]"
          >
            <a-input 
              v-model:value="taskEditForm.title" 
              placeholder="请输入任务标题"
              :maxlength="100"
              show-count
            />
          </a-form-item>

          <a-form-item 
            label="任务描述"
            :rules="[{ required: true, message: '请输入任务描述' }]"
          >
            <a-textarea 
              v-model:value="taskEditForm.description" 
              placeholder="请详细描述任务内容、目标和要求..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>

          <a-form-item 
            label="计划开始时间" 
            :rules="[{ required: true, message: '请选择计划开始时间' }]"
          >
            <a-date-picker 
              v-model:value="taskEditForm.startDate"
              placeholder="选择计划开始时间"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>

          <a-form-item 
            label="计划结束时间" 
            :rules="[
              { required: true, message: '请选择计划结束时间' },
              { validator: validateEndDate }
            ]"
          >
            <a-date-picker 
              v-model:value="taskEditForm.endDate"
              placeholder="选择计划结束时间"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledEndDate"
            />
          </a-form-item>

          <a-form-item label="任务状态">
            <a-select v-model:value="taskEditForm.status" placeholder="选择任务状态">
              <a-select-option value="pending">待开始</a-select-option>
              <a-select-option value="active">进行中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="paused">已暂停</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="关键路径">
            <a-switch 
              v-model:checked="taskEditForm.isCritical"
              checked-children="是"
              un-checked-children="否"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 任务详情查看弹窗 -->
    <a-modal
      v-model:open="taskDetailModalVisible"
      title="任务详情"
      width="800px"
      :footer="null"
      @cancel="closeTaskDetailModal"
    >
      <div v-if="selectedTaskDetail" style="max-height: 600px; overflow-y: auto;">
        <a-tabs v-model:activeKey="taskDetailActiveTab" type="card">
          <a-tab-pane key="info" tab="基本信息">
            <a-descriptions bordered :column="2">
              <a-descriptions-item label="任务名称" :span="2">
                {{ selectedTaskDetail.title }}
              </a-descriptions-item>
              <a-descriptions-item label="任务描述" :span="2">
                {{ selectedTaskDetail.description || '暂无描述' }}
              </a-descriptions-item>
              <a-descriptions-item label="任务状态">
                <a-tag :color="getTaskStatusColor(selectedTaskDetail.status)">
                  {{ getTaskStatusText(selectedTaskDetail.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="完成进度">
                {{ selectedTaskDetail.progress || 0 }}%
              </a-descriptions-item>
              <a-descriptions-item label="计划开始">
                {{ selectedTaskDetail.startDate }}
              </a-descriptions-item>
              <a-descriptions-item label="计划结束">
                {{ selectedTaskDetail.endDate }}
              </a-descriptions-item>
              <a-descriptions-item label="实际开始">
                {{ selectedTaskDetail.actualStartDate || '未开始' }}
              </a-descriptions-item>
              <a-descriptions-item label="实际结束">
                {{ selectedTaskDetail.actualEndDate || '未完成' }}
              </a-descriptions-item>
              <a-descriptions-item label="是否关键路径">
                <a-tag :color="selectedTaskDetail.isCritical ? 'red' : 'default'">
                  {{ selectedTaskDetail.isCritical ? '是' : '否' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="负责人">
                {{ selectedTaskDetail.assignee || '未分配' }}
              </a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>
          
          <a-tab-pane key="history" tab="操作历史">
            <div class="task-update-history">
              <div v-if="getTaskOperationHistory(selectedTaskDetail).length === 0" class="no-history">
                暂无操作历史
              </div>
              <a-timeline v-else>
                <a-timeline-item 
                  v-for="history in getTaskOperationHistory(selectedTaskDetail)" 
                  :key="history.id"
                  :color="getHistoryTypeColor(history.type)"
                >
                  <template #dot>
                    <component :is="getHistoryTypeIcon(history.type)" />
                  </template>
                  <div class="history-item">
                    <div class="history-header">
                      <span class="history-user">{{ history.user }}</span>
                      <span class="history-action">{{ getHistoryActionText(history.type) }}</span>
                      <span class="history-time">{{ formatHistoryTime(history.timestamp) }}</span>
                      <a-button 
                        type="link" 
                        size="small"
                        @click="showOperationDetail(history)">
                        查看详情
                      </a-button>
                    </div>
                    <div class="history-detail">
                      {{ getHistoryDetailText(history) }}
                    </div>
                    
                    <!-- 评论区域 -->
                    <div class="history-comments" v-if="history.comments && history.comments.length > 0">
                      <div class="comments-list">
                        <div 
                          v-for="comment in history.comments" 
                          :key="comment.id"
                          class="comment-item">
                          <div class="comment-header">
                            <span class="comment-user">{{ comment.user }}</span>
                            <span class="comment-time">{{ formatHistoryTime(comment.timestamp) }}</span>
                          </div>
                          <div class="comment-content">{{ comment.content }}</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 项目经理添加评论 -->
                    <div class="add-pm-comment">
                      <a-input-group compact>
                        <a-input 
                          v-model:value="pmCommentTexts[history.id]"
                          placeholder="作为项目经理回复..."
                          @pressEnter="addPMComment(history)"
                          style="width: calc(100% - 80px)" />
                        <a-button 
                          type="primary" 
                          @click="addPMComment(history)"
                          style="width: 80px">
                          回复
                        </a-button>
                      </a-input-group>
                    </div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="legacy" tab="旧版历史">
            <div class="task-update-history">
              <a-timeline>
                <a-timeline-item 
                  v-for="update in getTaskUpdateHistory(selectedTaskDetail)" 
                  :key="update.id"
                  :color="getUpdateTypeColor(update.action)"
                >
                  <template #dot>
                    <component :is="getUpdateIcon(update.action)" />
                  </template>
                  <div class="update-item">
                    <div class="update-header">
                      <span class="update-user">{{ update.userName }}</span>
                      <span class="update-time">{{ formatUpdateTime(update.timestamp) }}</span>
                      <a-tag size="small" :color="getUpdateTypeColor(update.action)">
                        {{ getUpdateActionText(update.action) }}
                      </a-tag>
                    </div>
                    <div class="update-content">
                      <div v-if="update.action === 'progress_update'" class="progress-update">
                        <p><strong>进度变更：</strong>{{ update.oldProgress }}% → {{ update.newProgress }}%</p>
                        <p v-if="update.workHours"><strong>工时：</strong>{{ update.workHours }} 小时</p>
                        <p v-if="update.comment"><strong>工作内容：</strong>{{ update.comment }}</p>
                        <p v-if="update.issues" class="issues"><strong>遇到问题：</strong>{{ update.issues }}</p>
                      </div>
                      <div v-else-if="update.action === 'status_change'" class="status-change">
                        <p><strong>状态变更：</strong>{{ update.oldStatus }} → {{ update.newStatus }}</p>
                        <p v-if="update.reason"><strong>变更原因：</strong>{{ update.reason }}</p>
                      </div>
                      <div v-else-if="update.action === 'task_created'" class="task-created">
                        <p><strong>任务创建：</strong>{{ update.comment || '任务已创建' }}</p>
                      </div>
                      <div v-else-if="update.action === 'task_assigned'" class="task-assigned">
                        <p><strong>任务分配：</strong>分配给 {{ update.assignee }}</p>
                      </div>
                    </div>
                  </div>
                </a-timeline-item>
              </a-timeline>
              <div v-if="!getTaskUpdateHistory(selectedTaskDetail).length" class="no-history">
                <a-empty description="暂无更新记录" />
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>

    <!-- 里程碑详情弹窗 -->
    <a-modal
      v-model:open="milestoneModalVisible"
      title="里程碑详情"
      :footer="null"
      width="700px"
    >
      <div v-if="selectedMilestone" class="milestone-detail">
        <div class="milestone-basic-info">
          <h3>{{ selectedMilestone.name }}</h3>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="状态">
              <a-tag :color="getMilestoneStatusColor(selectedMilestone.status)">
                {{ getMilestoneStatusText(selectedMilestone.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="完成度">
              {{ selectedMilestone.progress }}%
            </a-descriptions-item>
            <a-descriptions-item label="计划时间">
              {{ selectedMilestone.plannedDate }}
            </a-descriptions-item>
            <a-descriptions-item label="实际时间">
              {{ selectedMilestone.actualDate || '未完成' }}
            </a-descriptions-item>
            <a-descriptions-item label="负责人">
              {{ selectedMilestone.owner }}
            </a-descriptions-item>
            <a-descriptions-item label="描述" :span="2">
              {{ selectedMilestone.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div class="milestone-materials">
          <h4>所需材料</h4>
          <a-list 
            :dataSource="selectedMilestone.materials" 
            size="small"
            bordered
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item" />
                <template #actions>
                  <a-button size="small" type="link">查看</a-button>
                  <a-button size="small" type="link">下载</a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>

    <!-- 操作详情（含材料查看/预览/下载） -->
    <a-modal
      v-model:open="operationDetailVisible"
      title="操作详情"
      :footer="null"
      width="720px"
    >
      <div v-if="selectedOperation">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="类型">{{ getHistoryActionText(selectedOperation.type) }}</a-descriptions-item>
          <a-descriptions-item label="时间">{{ formatHistoryTime(selectedOperation.timestamp) }}</a-descriptions-item>
          <a-descriptions-item label="提交人">{{ selectedOperation.user }}</a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">{{ selectedOperation.data?.note || '—' }}</a-descriptions-item>
        </a-descriptions>

        <div style="margin-top: 16px;">
          <h4>全部历史</h4>
          <a-list :dataSource="getTaskOperationHistory(selectedTask || {})" size="small" bordered>
            <template #renderItem="{ item }">
              <a-list-item>
                <a-space>
                  <a-tag :color="getHistoryTypeColor(item.type)">{{ getHistoryActionText(item.type) }}</a-tag>
                  <span>{{ item.user }}</span>
                  <span>{{ formatHistoryTime(item.timestamp) }}</span>
                </a-space>
                <template #actions>
                  <a @click.prevent="showOperationDetail(item)">查看详情</a>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <div v-if="selectedOperation.type === 'material_submission'" style="margin-top: 16px;">
          <h4>提交的材料</h4>
          <a-list :dataSource="(selectedOperation.data?.materials || [])" bordered>
            <template #renderItem="{ item, index }">
              <a-list-item>
                <a-list-item-meta :title="item?.name || item?.fileName || ('材料' + (index + 1))" />
                <template #actions>
                  <a @click.prevent="previewMaterial(item)">在线预览</a>
                  <a @click.prevent="downloadMaterial(item)">下载</a>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <a-button type="primary" @click="forwardToManagers">一键发给管理者</a-button>
          <a-button @click="operationDetailVisible = false">关闭</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 简易文件预览弹窗 -->
    <a-modal v-model:open="filePreviewVisible" :footer="null" width="80%">
      <template #title>材料预览</template>
      <div v-if="filePreviewSrc">
        <iframe v-if="isPdf(filePreviewSrc)" :src="filePreviewSrc" style="width:100%;height:75vh;border:0;"></iframe>
        <a-image v-else :src="filePreviewSrc" :preview="false" style="max-height:75vh;" />
      </div>
    </a-modal>
  </div>
  
  <!-- 底部抽屉表格视图：不挤压上方布局，支持滚动对照与批量操作 -->
  <a-drawer
    :open="isTableDrawerOpen"
    placement="bottom"
    :height="tableDrawerHeight"
    :mask="false"
    :closable="true"
    @close="closeTableDrawer"
    :bodyStyle="{ padding: '8px 16px' }"
  >
    <template #title>
      <a-space>
        <span>📋 WBS任务表格视图</span>
        <a-divider type="vertical" />
        <a-select v-model:value="filterStatus" placeholder="状态" style="width:110px" allow-clear size="small">
          <a-select-option value="pending">待开始</a-select-option>
          <a-select-option value="active">进行中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
        </a-select>
        <a-input v-model:value="filterAssignee" placeholder="负责人" allow-clear size="small" style="width:120px" />
        <a-checkbox v-model:checked="filterOverdue" size="small">逾期</a-checkbox>
        <a-checkbox v-model:checked="filterUnread" size="small">有未读</a-checkbox>
        <a-button size="small" @click="resetTableFilters">重置</a-button>
        <a-divider type="vertical" />
        <a-button size="small" type="primary" @click="batchStart" :disabled="selectedRowKeys.length===0">批量开始</a-button>
        <a-button size="small" @click="batchComplete" :disabled="selectedRowKeys.length===0">批量完成</a-button>
      </a-space>
    </template>
    <a-table
      :dataSource="filteredFlatTasks"
      :columns="tableColumns"
      :row-selection="tableRowSelection"
      size="small"
      rowKey="key"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key==='title'">
          <span :style="{ paddingLeft: (record.level||0)*16 + 'px' }">{{ record.title }}</span>
        </template>
        <template v-else-if="column.key==='status'">
          <a-tag :color="record.status==='completed'?'green':(record.status==='active'?'blue':'orange')">{{ statusText(record.status) }}</a-tag>
        </template>
        <template v-else-if="column.key==='progress'">
          <a-progress :percent="record.progress||0" size="small" />
        </template>
        <template v-else-if="column.key==='action'">
          <a-space>
            <a-button type="link" size="small" @click="jumpToNode(record.key)">定位</a-button>
            <a-button type="link" size="small" @click="openDetail(record.key)">详情</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal, notification } from 'ant-design-vue'
import { useTaskSyncStore } from '@/store/taskSync'
import materialTemplateStore from '@/store/materialTemplate'
import {
  ArrowLeftOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
  ReloadOutlined,
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  DownOutlined,
  RightOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  ExpandOutlined,
  PercentageOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  FileOutlined,
  FileTextOutlined,
  CopyOutlined,
  BellOutlined,
  PlayCircleOutlined,
  LeftOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 任务数据同步store
const taskSyncStore = useTaskSyncStore()

// 项目信息：优先使用路由参数与查询串传入的数据，避免与项目列表不一致
const projectInfo = ref({
  id: route.params.id,
  name: route.query.name || '数据分析平台建设',
  code: route.query.code || 'SJFX-2024-001',
  status: 'active',
  progress: route.query.progress ? Number(route.query.progress) : 65,
  startDate: route.query.startDate || '2024-01-15',
  endDate: route.query.endDate || '2024-12-31'
})

// 集成里程碑的项目数据 - 里程碑作为特殊任务节点嵌入WBS

// WBS数据
const wbsData = ref([
  {
    title: '需求分析阶段',
    key: '1',
    status: 'completed',
    progress: 100,
    plannedProgress: 100,
    responsible: '张三',
    description: '完成项目需求分析，包括业务需求调研和技术需求分析，为后续开发奠定基础。',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    duration: 31,
    isCritical: false,
    children: [
      {
        title: '业务需求调研',
        key: '1-1',
        status: 'completed',
        progress: 100,
        responsible: '李四',
        assignedTo: { id: 2, name: '李开发', role: 'developer' },
        description: '深入了解业务流程，收集用户需求，整理业务功能清单。',
        startDate: '2024-01-15',
        endDate: '2024-01-25',
        duration: 10,
        isCritical: false
      },
      {
        title: '技术需求分析',
        key: '1-2',
        status: 'completed',
        progress: 100,
        responsible: '王五',
        assignedTo: { id: 3, name: '王后端', role: 'developer' },
        description: '分析技术实现方案，评估技术风险，确定技术栈和架构方案。',
        startDate: '2024-01-26',
        endDate: '2024-02-15',
        duration: 20,
        isCritical: false
      },
      {
        title: '🎯 项目开题里程碑',
        key: '1-milestone',
        status: 'completed',
        progress: 100,
        responsible: '项目经理',
        description: '完成开题报告，组织开题会议',
        startDate: '2024-02-15',
        endDate: '2024-02-15',
        duration: 1,
        isCritical: true,
        isMilestone: true,
        milestoneType: 'opening',
        actualDate: '2024-02-10',
        materials: ['开题报告', '技术方案', '预算计划'],
        dependsOn: ['1-1', '1-2']
      }
    ]
  },
  {
    title: '系统设计阶段',
    key: '2',
    status: 'completed',
    progress: 100,
    responsible: '赵六',
    description: '完成系统整体设计，包括架构设计和数据库设计，为开发阶段提供详细的技术方案。',
    startDate: '2024-02-16',
    endDate: '2024-03-31',
    duration: 44,
    isCritical: false,
    children: [
      {
        title: '架构设计',
        key: '2-1',
        status: 'completed',
        progress: 100,
        responsible: '孙七',
        startDate: '2024-02-16',
        endDate: '2024-03-05',
        duration: 18,
        isCritical: false
      },
      {
        title: '数据库设计',
        key: '2-2',
        status: 'completed',
        progress: 100,
        responsible: '周八',
        startDate: '2024-03-06',
        endDate: '2024-03-31',
        duration: 25,
        isCritical: false
      }
    ]
  },
  {
    title: '开发实施阶段',
    key: '3',
    status: 'active',
    progress: 75,
    responsible: '吴九',
    description: '按照设计方案进行系统开发，包括前端、后端和数据处理模块的开发实施。这是项目的核心阶段，需要确保代码质量和进度控制。',
    startDate: '2024-04-01',
    endDate: '2024-09-30',
    duration: 183,
    isCritical: true,
    children: [
      {
        title: '前端开发',
        key: '3-1',
        status: 'active',
        progress: 80,
        plannedProgress: 75, // 实际进度超前
        responsible: '郑十',
        assignedTo: { id: 2, name: '李开发', role: 'developer' },
        startDate: '2024-04-01',
        endDate: '2024-07-31',
        duration: 122,
        isCritical: false
      },
      {
        title: '后端开发',
        key: '3-2',
        status: 'active',
        progress: 70,
        plannedProgress: 85, // 实际进度落后
        responsible: '钱一',
        assignedTo: { id: 3, name: '王后端', role: 'developer' },
        startDate: '2024-04-15',
        endDate: '2024-08-31',
        duration: 139,
        isCritical: true
      },
      {
        title: '数据处理模块',
        key: '3-3',
        status: 'pending',
        progress: 30,
        plannedProgress: 45, // 实际进度明显落后
        responsible: '孙二',
        assignedTo: null,
        startDate: '2024-06-01',
        endDate: '2024-09-30',
        duration: 122,
        isCritical: true
      }
    ]
  },
  {
    title: '测试验收阶段',
    key: '4',
    status: 'pending',
    progress: 0,
    responsible: '李三',
    startDate: '2024-10-01',
    endDate: '2024-11-30',
    duration: 61,
    isCritical: true,
    children: [
      {
        title: '单元测试',
        key: '4-1',
        status: 'pending',
        progress: 0,
        responsible: '王四',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        duration: 31,
        isCritical: false
      },
      {
        title: '集成测试',
        key: '4-2',
        status: 'pending',
        progress: 0,
        responsible: '张五',
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        duration: 30,
        isCritical: true
      },
      {
        title: '🎯 项目验收里程碑',
        key: '4-milestone',
        status: 'upcoming',
        progress: 0,
        responsible: '项目经理',
        description: '整理项目成果，准备验收材料',
        startDate: '2024-11-30',
        endDate: '2024-11-30',
        duration: 1,
        isCritical: true,
        isMilestone: true,
        milestoneType: 'acceptance',
        materials: ['验收报告', '成果清单', '技术文档'],
        dependsOn: ['4-1', '4-2']
      }
    ]
  }
])

// 树形控制
const expandedKeys = ref(['1', '2', '3', '4'])
const selectedKeys = ref([])
const selectedTask = ref(null)

// WBS编辑模式控制
const wbsEditMode = ref(false)

// 最近使用的里程碑类型（用于快速新建）
const lastMilestoneType = ref('opening')

// 强制显示任务详情控制
const forceShowTaskDetail = ref(false)

// 最近更新任务高亮映射：key -> timestamp
const recentlyUpdatedMap = reactive({})

function markTaskRecentlyUpdated(taskKey, durationMs = 2000) {
  recentlyUpdatedMap[taskKey] = Date.now()
  setTimeout(() => {
    delete recentlyUpdatedMap[taskKey]
  }, durationMs)
}

// 在组件挂载时默认选择第一个任务，确保任务详情可见
onMounted(() => {
  // 默认选择第一个任务
  if (wbsData.value.length > 0) {
    const firstTask = wbsData.value[0]
    selectedKeys.value = [firstTask.key]
    selectedTask.value = firstTask
    
    console.log('组件挂载完成，默认选中任务:', firstTask.title)
  }
  
  // 验证任务管理功能状态
  validateTaskManagementFeatures()
  
  // 注册WBS到同步仓库，供统一进度计算
  try { taskSyncStore.registerWBSProject(String(projectInfo.value.id), wbsData.value) } catch (e) {}

  // 绑定键盘快捷键
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

// 组件销毁时清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})

// 验证任务管理功能状态
const validateTaskManagementFeatures = () => {
  console.log('=== 任务管理功能验证 ===')
  
  // 1. 检查数据结构
  const totalTasks = getAllTaskKeys(wbsData.value).length
  console.log(`✓ WBS数据加载: ${totalTasks} 个任务`)
  
  // 2. 检查必要的响应式数据
  console.log(`✓ 选中状态: selectedKeys=${selectedKeys.value}, selectedTask=${selectedTask.value?.title || '无'}`)
  console.log(`✓ 编辑模式: wbsEditMode=${wbsEditMode.value}`)
  console.log(`✓ 展开状态: expandedKeys=${expandedKeys.value.length} 个节点`)
  
  // 3. 检查关键功能函数
  const criticalFunctions = [
    'onTaskSelect', 'selectTask', 'clearTaskSelection',
    'openTaskEditModal', 'handleTaskEdit', 'addChildTask', 'deleteWBSTask'
  ]
  
  criticalFunctions.forEach(funcName => {
    if (typeof eval(funcName) === 'function') {
      console.log(`✓ 函数 ${funcName} 已定义`)
    } else {
      console.error(`✗ 函数 ${funcName} 未定义`)
    }
  })
  
  // 4. 检查模态框状态
  console.log(`✓ 编辑弹窗: taskEditModalVisible=${taskEditModalVisible.value}`)
  console.log(`✓ 详情弹窗: taskDetailModalVisible=${taskDetailModalVisible.value}`)
  
  console.log('=== 验证完成 ===')
}

// 进度更新模态框控制
const progressModalVisible = ref(false)
const progressUpdating = ref(false)
const progressForm = reactive({
  newProgress: 0,
  workNote: '',
  estimatedDate: null
})

// 任务编辑模态框控制
const taskEditModalVisible = ref(false)
const taskEditLoading = ref(false)
const taskEditFormRef = ref()
const taskEditForm = reactive({
  title: '',
  description: '',
  startDate: null,
  endDate: null,
  status: 'pending',
  isCritical: false
})

// 任务详情查看弹窗控制
const taskDetailModalVisible = ref(false)
const selectedTaskDetail = ref(null)
const taskDetailActiveTab = ref('info')

// 项目经理评论相关
const pmCommentTexts = ref({})
const operationDetailVisible = ref(false)
const selectedOperation = ref(null)
const filePreviewVisible = ref(false)
const filePreviewSrc = ref('')

// 里程碑详情弹窗控制
const milestoneModalVisible = ref(false)
const selectedMilestone = ref(null)

// 分配下拉框控制
const showAssignSelect = ref(false)

// 面板宽度控制
const leftPanelWidth = ref(750)  // 左侧面板默认宽度，确保WBS树和任务详情都能完整显示
const rightPanelWidth = computed(() => {
  // 右侧面板宽度 = 容器宽度 - 左侧宽度 - 分隔条宽度 - 页面边距
  const containerWidth = window.innerWidth - 48 // 减去页面左右padding
  return Math.max(500, containerWidth - leftPanelWidth.value - 16)
})
const isResizing = ref(false)
const monitorContentRef = ref(null)
const leftPanelRef = ref(null)
const ganttContainerRef = ref(null)
const ganttHeaderRef = ref(null)
const ganttTimelineRef = ref(null)
const ganttBodyRef = ref(null)
const ganttScrollCleanup = ref(null)

// 可用团队成员（从团队管理获取）
const availableTeamMembers = computed(() => {
  return [
    { id: 1, name: '张经理', role: 'manager' },
    { id: 2, name: '李开发', role: 'developer' },
    { id: 3, name: '王后端', role: 'developer' },
    { id: 4, name: '赵测试', role: 'tester' },
    { id: 5, name: '钱设计', role: 'designer' },
    { id: 6, name: '孙产品', role: 'product' },
    { id: 7, name: '周架构', role: 'architect' }
  ]
})

// 甘特图控制
const timeScale = ref('month')
const timelineData = ref([])
const unreadUpdates = ref(0)
const projectUnreadCount = computed(() => taskSyncStore.getUnreadCountForProject(String(projectInfo.value.id)))
const getTaskUnreadBadge = (projectId, taskKey) => taskSyncStore.getUnreadCountForTask(String(projectId), String(taskKey))

// 视图模式与表格所需状态
const wbsViewMode = ref('tree')
const selectedRowKeys = ref([])
const tableColumns = [
  { title: '任务', dataIndex: 'title', key: 'title', width: 260 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 160 },
  { title: '负责人', dataIndex: 'responsible', key: 'responsible', width: 120 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' }
]
const tableRowSelection = reactive({
  selectedRowKeys: selectedRowKeys,
  onChange: (keys) => { selectedRowKeys.value = keys }
})

function statusText(s) {
  return s === 'completed' ? '已完成' : s === 'active' ? '进行中' : '待开始'
}

function jumpToNode(taskKey) {
  // 切回树视图并选中
  wbsViewMode.value = 'tree'
  selectTask(String(taskKey))
}

function openDetail(taskKey) {
  selectTask(String(taskKey))
}

// 底部抽屉（表格视图）
const isTableDrawerOpen = ref(false)
const tableDrawerHeight = ref(Number(localStorage.getItem('pm.tableDrawerHeight') || 0) || Math.round(window.innerHeight * 0.6))
function handleViewModeChange(val) {
  if (val === 'table') {
    isTableDrawerOpen.value = true
  } else {
    isTableDrawerOpen.value = false
  }
}
function closeTableDrawer() {
  isTableDrawerOpen.value = false
  wbsViewMode.value = 'tree'
}
// 过滤项
const filterStatus = ref()
const filterAssignee = ref('')
const filterOverdue = ref(false)
const filterUnread = ref(false)
function resetTableFilters() {
  filterStatus.value = undefined
  filterAssignee.value = ''
  filterOverdue.value = false
  filterUnread.value = false
}
const filteredFlatTasks = computed(() => {
  const list = flatTasks.value
  return list.filter(t => {
    if (filterStatus.value && t.status !== filterStatus.value) return false
    if (filterAssignee.value && (t.assignedTo?.name || t.responsible || '').indexOf(filterAssignee.value) === -1) return false
    if (filterOverdue.value && !(t.endDate && new Date(t.endDate) < new Date())) return false
    if (filterUnread.value && !(getTaskUnreadBadge(String(projectInfo.value.id), String(t.key)) > 0)) return false
    return true
  })
})

async function batchStart() {
  if (!selectedRowKeys.value.length) return
  const updates = selectedRowKeys.value.map(k => ({
    projectId: String(projectInfo.value.id),
    taskKey: String(k),
    data: { status: 'active', progress:  Math.max(10, Number(findNodeByKey(k)?.progress||0)) }
  }))
  await taskSyncStore.batchUpdateTasks(updates)
}

async function batchComplete() {
  if (!selectedRowKeys.value.length) return
  const updates = selectedRowKeys.value.map(k => ({
    projectId: String(projectInfo.value.id),
    taskKey: String(k),
    data: { status: 'completed', progress: 100, completedAt: new Date().toISOString() }
  }))
  await taskSyncStore.batchUpdateTasks(updates)
}

function findNodeByKey(key) {
  const find = (nodes) => {
    for (const n of nodes) {
      if (String(n.key) === String(key)) return n
      if (n.children) {
        const r = find(n.children)
        if (r) return r
      }
    }
    return null
  }
  return find(wbsData.value)
}

// 扁平化任务数据
const flatTasks = computed(() => {
  const result = []
  const flatten = (nodes, level = 0) => {
    nodes.forEach(node => {
      // 为没有plannedProgress的任务生成默认值
      const plannedProgress = node.plannedProgress !== undefined 
        ? node.plannedProgress 
        : generatePlannedProgress(node)
      
      result.push({ ...node, level, plannedProgress })
      if (node.children) {
        flatten(node.children, level + 1)
      }
    })
  }
  flatten(wbsData.value)
  return result
})

// 生成计划进度（基于状态和当前进度的智能估算）
const generatePlannedProgress = (task) => {
  // 根据任务状态生成合理的计划进度
  switch (task.status) {
    case 'completed':
      return 100
    case 'active':
      // 活跃任务：在当前进度基础上增加一些变化以显示对比
      return Math.min(100, task.progress + Math.floor(Math.random() * 20) - 10)
    case 'pending':
      // 待开始任务：计划进度通常比实际进度高一些
      return Math.min(100, task.progress + Math.floor(Math.random() * 15) + 5)
    default:
      return task.progress
  }
}

// 可见的甘特图任务（根据展开状态过滤）
const visibleGanttTasks = computed(() => {
  const result = []
  const addVisible = (nodes, level = 0) => {
    nodes.forEach(node => {
      result.push({ ...node, level })
      // 只有当父节点展开时，才显示子节点
      if (node.children && expandedKeys.value.includes(node.key)) {
        addVisible(node.children, level + 1)
      }
    })
  }
  addVisible(wbsData.value)
  return result
})

// 生成时间轴数据 - 基于实际任务时间动态生成
const generateTimeline = () => {
  const timeline = []
  
  // 找到所有任务的最早开始时间和最晚结束时间
  let earliestStart = null
  let latestEnd = null
  
  const extractDates = (tasks) => {
    tasks.forEach(task => {
      if (task.startDate) {
        const taskStart = new Date(task.startDate)
        if (!earliestStart || taskStart < earliestStart) {
          earliestStart = taskStart
        }
      }
      if (task.endDate) {
        const taskEnd = new Date(task.endDate)
        if (!latestEnd || taskEnd > latestEnd) {
          latestEnd = taskEnd
        }
      }
      if (task.children) {
        extractDates(task.children)
      }
    })
  }
  
  extractDates(wbsData.value)
  
  // 如果没有找到日期，使用当前年份的默认范围
  if (!earliestStart || !latestEnd) {
    const currentYear = new Date().getFullYear()
    earliestStart = new Date(currentYear, 0, 1) // 当前年的1月1日
    latestEnd = new Date(currentYear, 11, 31) // 当前年的12月31日
  } else {
    // 在开始和结束时间前后各加一个月的缓冲
    earliestStart = new Date(earliestStart.getFullYear(), earliestStart.getMonth() - 1, 1)
    latestEnd = new Date(latestEnd.getFullYear(), latestEnd.getMonth() + 2, 0)
  }
  
  if (timeScale.value === 'month') {
    for (let d = new Date(earliestStart); d <= latestEnd; d.setMonth(d.getMonth() + 1)) {
      timeline.push({
        key: d.getTime(),
        label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        width: 90 // 适中的宽度，避免过度滚动
      })
    }
  } else if (timeScale.value === 'week') {
    // 周视图
    const current = new Date(earliestStart)
    // 调整到周一
    current.setDate(current.getDate() - current.getDay() + 1)
    
    while (current <= latestEnd) {
      const weekEnd = new Date(current)
      weekEnd.setDate(current.getDate() + 6)
      
      timeline.push({
        key: current.getTime(),
        label: `${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`,
        width: 70 // 适中的宽度，避免过度滚动
      })
      
      current.setDate(current.getDate() + 7)
    }
  } else if (timeScale.value === 'day') {
    // 日视图
    const current = new Date(earliestStart)
    
    while (current <= latestEnd) {
      timeline.push({
        key: current.getTime(),
        label: `${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`,
        width: 50 // 适中的宽度，避免过度滚动
      })
      
      current.setDate(current.getDate() + 1)
    }
  }
  
  timelineData.value = timeline
}

// 状态颜色映射
const getStatusColor = (status) => {
  const colors = {
    'active': 'blue',
    'completed': 'green',
    'pending': 'orange',
    'delayed': 'red'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    'active': '进行中',
    'completed': '已完成',
    'pending': '待开始',
    'delayed': '已延期'
  }
  return texts[status] || '未知'
}

const getTaskStatusColor = (status) => {
  const colors = {
    'completed': 'green',
    'active': 'blue',
    'pending': 'orange',
    'delayed': 'red'
  }
  return colors[status] || 'default'
}

const getTaskStatusText = (status) => {
  const texts = {
    'completed': '已完成',
    'active': '进行中',
    'pending': '待开始',
    'delayed': '已延期'
  }
  return texts[status] || '未知'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 60) return '#1890ff'
  if (progress >= 40) return '#faad14'
  return '#f5222d'
}

// 里程碑相关方法
const getMilestoneStatusColor = (status) => {
  const colors = {
    'completed': 'green',
    'upcoming': 'blue',
    'overdue': 'red',
    'in_progress': 'orange'
  }
  return colors[status] || 'default'
}

const getMilestoneStatusText = (status) => {
  const texts = {
    'completed': '已完成',
    'upcoming': '即将到来',
    'overdue': '已逾期',
    'in_progress': '进行中'
  }
  return texts[status] || '未知'
}

const getMilestoneProgressColor = (progress) => {
  if (progress >= 100) return '#52c41a'
  if (progress >= 80) return '#1890ff'
  if (progress >= 50) return '#faad14'
  return '#ff4d4f'
}

// 进度条填充颜色 - 根据进度和状态显示不同颜色
const getProgressFillColor = (progress, status) => {
  // 调试日志
  console.log(`任务进度: ${progress}%, 状态: ${status}`)
  
  if (status === 'completed') {
    return 'rgba(82, 196, 26, 0.8)' // 绿色，已完成
  } else if (status === 'active') {
    if (progress >= 80) return 'rgba(82, 196, 26, 0.7)' // 绿色，进度良好
    if (progress >= 60) return 'rgba(24, 144, 255, 0.7)' // 蓝色，进度正常
    if (progress >= 40) return 'rgba(250, 173, 20, 0.7)' // 橙色，进度一般
    return 'rgba(245, 34, 45, 0.7)' // 红色，进度较低
  } else if (status === 'pending') {
    return 'rgba(250, 173, 20, 0.5)' // 淡橙色，待开始
  }
  return 'rgba(255, 255, 255, 0.25)' // 默认颜色
}

// 甘特图任务条样式 - 基于动态时间轴计算
const getTaskBarStyle = (task) => {
  if (!timelineData.value || timelineData.value.length === 0) {
    return { left: '0%', width: '0%' }
  }
  
  // 获取时间轴的起始和结束时间
  const timelineStart = new Date(timelineData.value[0].key)
  const timelineEnd = new Date(timelineData.value[timelineData.value.length - 1].key)
  
  // 处理任务开始和结束时间
  const taskStart = new Date(task.startDate)
  const taskEnd = new Date(task.endDate || task.startDate)
  
  // 计算时间轴总宽度（像素）
  const totalWidth = timelineData.value.reduce((sum, unit) => sum + unit.width, 0)
  
  if (timeScale.value === 'month') {
    // 月视图：计算月份偏移
    const startMonthOffset = (taskStart.getFullYear() - timelineStart.getFullYear()) * 12 + 
                            (taskStart.getMonth() - timelineStart.getMonth())
    const endMonthOffset = (taskEnd.getFullYear() - timelineStart.getFullYear()) * 12 + 
                          (taskEnd.getMonth() - timelineStart.getMonth()) + 1
    
    const left = (startMonthOffset * 100) / timelineData.value.length
    const width = ((endMonthOffset - startMonthOffset) * 100) / timelineData.value.length
    
    return {
      left: Math.max(0, left) + '%',
      width: Math.max(1, width) + '%'
    }
  } else {
    // 周视图和日视图：基于天数计算
    const timelineStartTime = timelineStart.getTime()
    const timelineEndTime = timelineEnd.getTime()
    const taskStartTime = taskStart.getTime()
    const taskEndTime = taskEnd.getTime()
    
    const totalTimeline = timelineEndTime - timelineStartTime
    const taskOffset = taskStartTime - timelineStartTime
    const taskDuration = taskEndTime - taskStartTime
    
    const left = (taskOffset / totalTimeline) * 100
    const width = (taskDuration / totalTimeline) * 100
    
    return {
      left: Math.max(0, left) + '%',
      width: Math.max(0.5, width) + '%'
    }
  }
}

// 事件处理
const goBack = () => {
  router.go(-1)
}

const expandAll = () => {
  const getAllKeys = (nodes) => {
    let keys = []
    nodes.forEach(node => {
      keys.push(node.key)
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children))
      }
    })
    return keys
  }
  expandedKeys.value = getAllKeys(wbsData.value)
}

const collapseAll = () => {
  expandedKeys.value = []
}

// 切换任务展开状态（甘特图与WBS树同步）
const toggleTaskExpand = (taskKey) => {
  const index = expandedKeys.value.indexOf(taskKey)
  if (index > -1) {
    expandedKeys.value.splice(index, 1)
  } else {
    expandedKeys.value.push(taskKey)
  }
}

// 选择任务（甘特图点击）
const selectTask = (taskKey) => {
  console.log('甘特图任务选中:', taskKey)
  
  selectedKeys.value = [taskKey]
  const task = flatTasks.value.find(t => t.key === taskKey)
  
  if (task) {
    selectedTask.value = task
    
    // 确保WBS树中也同步选中状态
    const allKeys = getAllTaskKeys(wbsData.value)
    if (allKeys.includes(taskKey)) {
      // 展开父级节点确保任务可见
      ensureTaskVisible(taskKey)
    }
    
    // 显示选中反馈
    message.success(`已选中甘特图任务: ${task.title}`, 1)
    
    // 打开任务详情弹窗
    openTaskDetailModal(task)
  } else {
    console.warn('任务不存在:', taskKey)
    message.warning('任务不存在')
  }
}

const onTaskSelect = (keys, { node }) => {
  selectedTask.value = node
  
  // 验证选中状态
  console.log('任务选中:', node ? node.title : '无')
  
  // 自动滚动甘特图到对应任务
  if (node && node.key) {
    scrollToGanttTask(node.key)
    
    // 显示任务选中反馈
    message.success(`已选中任务: ${node.title}`, 1)
  }
  
  // 重置临时状态
  showAssignSelect.value = false
}

const closeTaskDetail = () => {
  selectedKeys.value = []
  selectedTask.value = null
}

const clearTaskSelection = () => {
  selectedKeys.value = []
  selectedTask.value = null
  showAssignSelect.value = false // 重置分配选择框状态
}

// 获取所有任务键
const getAllTaskKeys = (nodes) => {
  const keys = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      keys.push(node.key)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return keys
}

// 确保任务在甘特图中可见（展开父级节点）
const ensureTaskVisible = (taskKey) => {
  // 查找任务的所有父级节点
  const findParentKeys = (nodes, targetKey, parents = []) => {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return parents
      }
      if (node.children) {
        const result = findParentKeys(node.children, targetKey, [...parents, node.key])
        if (result) return result
      }
    }
    return null
  }
  
  const parentKeys = findParentKeys(wbsData.value, taskKey)
  
  if (parentKeys) {
    // 展开所有父级节点
    parentKeys.forEach(parentKey => {
      if (!expandedKeys.value.includes(parentKey)) {
        expandedKeys.value.push(parentKey)
      }
    })
  }
}

// 滚动甘特图到指定任务
const scrollToGanttTask = (taskKey) => {
  // 首先确保任务可见
  ensureTaskVisible(taskKey)
  
  // 增加延迟确保DOM完全渲染
  nextTick(() => {
    setTimeout(() => {
      const ganttContainer = ganttContainerRef.value
      if (!ganttContainer) return
      
      // 查找真正的滚动容器 - gantt-body
      const ganttBody = ganttContainer.querySelector('.gantt-body')
      if (!ganttBody) return
      
      // 查找目标任务行
      const targetRow = ganttContainer.querySelector(`.gantt-row[data-task-key="${taskKey}"]`)
      
      if (!targetRow) {
        // 如果没有找到带data-task-key的元素，尝试通过索引查找
        const taskIndex = visibleGanttTasks.value.findIndex(task => task.key === taskKey)
        if (taskIndex === -1) return
        
        const allRows = ganttContainer.querySelectorAll('.gantt-row')
        if (allRows[taskIndex]) {
          scrollToElement(allRows[taskIndex], ganttBody)
        }
      } else {
        scrollToElement(targetRow, ganttBody)
      }
    }, 300) // 延迟到300ms，确保展开动画和DOM更新完成
  })
}

// 滚动元素到容器中心
const scrollToElement = (element, container) => {
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  
  // 计算目标滚动位置（让元素在容器中心）
  const containerCenter = containerRect.height / 2
  const elementTop = elementRect.top - containerRect.top + container.scrollTop
  const elementHeight = elementRect.height
  const targetScrollTop = elementTop - containerCenter + elementHeight / 2
  
  // 平滑滚动到目标位置
  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth'
  })
  
  // 添加高亮效果
  element.classList.add('highlight-task')
  setTimeout(() => {
    element.classList.remove('highlight-task')
  }, 2000)
}

const refreshGantt = () => {
  generateTimeline()
  message.success('甘特图已刷新')
}

// 里程碑操作方法
const refreshMilestones = () => {
  message.success('里程碑数据已刷新')
}

const viewMilestoneDetail = (milestone) => {
  // 打开里程碑详情弹窗
  milestoneModalVisible.value = true
  selectedMilestone.value = milestone
}

const prepareMilestone = (milestone) => {
  // 根据里程碑类型跳转到对应的材料提交页面
  const queryParams = {
    projectId: projectInfo.value.id,
    projectName: projectInfo.value.name,
    projectCode: projectInfo.value.code,
    fromPM: 'true', // 标识来源为项目经理后台
    milestoneType: milestone.name
  }
  
  if (milestone.name.includes('开题')) {
    router.push({
      path: '/opening/applicant/submit',
      query: queryParams
    })
    message.info('正在跳转到开题材料提交页面...')
  } else if (milestone.name.includes('中期')) {
    router.push({
      path: '/midterm/applicant/submit',
      query: queryParams
    })
    message.info('正在跳转到中期材料提交页面...')
  } else if (milestone.name.includes('验收')) {
    router.push({
      path: '/acceptance/applicant/submit',
      query: queryParams
    })
    message.info('正在跳转到验收材料提交页面...')
  } else {
    message.info(`准备${milestone.name}材料`)
  }
}

// 从WBS树中准备里程碑材料
const prepareMilestoneFromWBS = (key, title, milestoneType) => {
  const queryParams = {
    projectId: projectInfo.value.id,
    projectName: projectInfo.value.name,
    projectCode: projectInfo.value.code,
    fromPM: 'true',
    milestoneType: title,
    taskKey: key
  }
  
  if (milestoneType === 'opening') {
    router.push({
      path: '/opening/applicant/submit',
      query: queryParams
    })
    message.info('正在跳转到开题材料提交页面...')
  } else if (milestoneType === 'midterm') {
    router.push({
      path: '/midterm/applicant/submit',
      query: queryParams
    })
    message.info('正在跳转到中期材料提交页面...')
  } else if (milestoneType === 'acceptance') {
    router.push({
      path: '/acceptance/applicant/submit',
      query: queryParams
    })
    message.info('正在跳转到验收材料提交页面...')
  } else {
    message.info(`准备${title}材料`)
  }
}

// 监听时间尺度变化，自动重新生成时间轴
watch(timeScale, () => {
  generateTimeline()
}, { immediate: false })

const updateTaskProgress = () => {
  if (!selectedTask.value) {
    message.warning('请先选择一个任务')
    return
  }
  
  // 初始化表单数据
  progressForm.newProgress = selectedTask.value.progress
  progressForm.workNote = ''
  progressForm.estimatedDate = null
  
  progressModalVisible.value = true
}



// 处理进度更新
const handleProgressUpdate = async () => {
  if (!selectedTask.value) {
    message.warning('请先选择一个任务')
    return
  }

  // 验证表单
  if (progressForm.newProgress < selectedTask.value.progress) {
    message.error('新进度不能小于当前进度')
    return
  }

  if (!progressForm.workNote.trim()) {
    message.error('请输入工作说明')
    return
  }

  progressUpdating.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新任务数据
    const updates = {
      progress: progressForm.newProgress,
      status: progressForm.newProgress === 100 ? 'completed' : 'active'
    }

    // 使用同步系统更新任务数据
    await taskSyncStore.updateTask(projectInfo.value.id, selectedTask.value.key, updates)
    
    // 更新当前选中任务
    Object.assign(selectedTask.value, updates)

    // 记录进度更新历史（这里可以保存到本地存储或发送到后端）
    const progressHistory = {
      taskId: selectedTask.value.key,
      oldProgress: selectedTask.value.progress,
      newProgress: progressForm.newProgress,
      workNote: progressForm.workNote,
      updateTime: new Date().toISOString(),
      updater: '当前用户' // 实际应该从用户状态获取
    }

    console.log('进度更新记录:', progressHistory)

    message.success(`任务进度已更新为 ${progressForm.newProgress}%`)
    
    if (progressForm.newProgress === 100) {
      message.success('🎉 任务已标记为完成！')
    }

    closeProgressModal()

  } catch (error) {
    console.error('更新进度失败:', error)
    message.error('更新进度失败，请重试')
  } finally {
    progressUpdating.value = false
  }
}

// 关闭进度更新弹窗
const closeProgressModal = () => {
  progressModalVisible.value = false
  // 重置表单
  progressForm.newProgress = 0
  progressForm.workNote = ''
  progressForm.estimatedDate = null
}

// 日期禁用规则（不能选择过去的日期）
const disabledDate = (current) => {
  return current && current < new Date().setHours(0, 0, 0, 0)
}

// 快速分配任务
const handleQuickAssign = async (memberId) => {
  if (!selectedTask.value) {
    message.warning('请先选择一个任务')
    return
  }
  
  if (!memberId) {
    // 取消分配
    selectedTask.value.assignedTo = null
    // 使用同步系统更新任务分配
    await taskSyncStore.updateTask(projectInfo.value.id, selectedTask.value.key, { assignedTo: null })
    message.info(`任务"${selectedTask.value.title}"已取消分配`)
    return
  }
  
  const member = availableTeamMembers.value.find(m => m.id === memberId)
  if (member) {
    selectedTask.value.assignedTo = member
    // 使用同步系统更新任务分配
    await taskSyncStore.updateTask(projectInfo.value.id, selectedTask.value.key, { assignedTo: member })
    message.success(`任务"${selectedTask.value.title}"已分配给${member.name}`)
  }
}

// 分配并隐藏下拉框
const handleQuickAssignAndHide = (memberId) => {
  handleQuickAssign(memberId)
  showAssignSelect.value = false
}

// 隐藏分配下拉框
const hideAssignSelect = () => {
  setTimeout(() => {
    showAssignSelect.value = false
  }, 200) // 延迟隐藏，允许点击选项
}

// 里程碑类型变化处理
const handleMilestoneTypeChange = (milestoneType) => {
  if (selectedTask.value) {
    selectedTask.value.milestoneType = milestoneType
    
    // 如果设置了里程碑类型，自动初始化材料需求
    if (milestoneType) {
      const hasNoRequirements = !selectedTask.value.materialRequirements || selectedTask.value.materialRequirements.length === 0
      if (hasNoRequirements) {
        initDefaultMaterialRequirements(milestoneType)
      }
    }
    
    // 如果取消里程碑类型，清空材料需求
    if (!milestoneType) {
      selectedTask.value.materialRequirements = []
    }
  }
}

// 初始化默认材料需求（从材料模板自动带出）
const initDefaultMaterialRequirements = async (milestoneType) => {
  try {
    // 确保材料模板配置已初始化
    await materialTemplateStore.initConfigs()
    
    // 从材料模板获取对应里程碑类型的材料需求
    const templateConfigs = materialTemplateStore.getConfigsByBusinessType(milestoneType)
    
    // 转换为任务材料需求格式
    const requirements = templateConfigs.map((config, index) => ({
      id: Date.now() + index,
      name: config.categoryName,
      required: config.isRequired,
      description: config.description || '',
      templateFileName: config.templateFileName || '',
      templateFilePath: config.templateFilePath || '',
      fromTemplate: true // 标识来自模板
    }))
    
    if (selectedTask.value) {
      selectedTask.value.materialRequirements = [...requirements]
      if (requirements.length > 0) {
        message.success(`已从材料模板自动加载${requirements.length}项材料需求`)
      }
    }
  } catch (error) {
    console.error('初始化材料需求失败:', error)
    message.error('加载材料模板失败，请手动添加材料需求')
    
    // 失败时使用默认配置
    const fallbackRequirements = {
      opening: [
        { name: '开题报告', required: true },
        { name: '文献综述', required: true },
        { name: '技术路线图', required: false }
      ],
      midterm: [
        { name: '中期检查报告', required: true },
        { name: '阶段性成果', required: true }
      ],
      acceptance: [
        { name: '验收报告', required: true },
        { name: '项目总结', required: true }
      ]
    }
    
    if (selectedTask.value && fallbackRequirements[milestoneType]) {
      selectedTask.value.materialRequirements = fallbackRequirements[milestoneType].map((req, index) => ({
        id: Date.now() + index,
        ...req
      }))
    }
  }
}

// 添加材料需求
const addMaterialRequirement = () => {
  if (selectedTask.value) {
    if (!selectedTask.value.materialRequirements) {
      selectedTask.value.materialRequirements = []
    }
    selectedTask.value.materialRequirements.push({
      id: Date.now(),
      name: '',
      required: true
    })
  }
}

// 移除材料需求
const removeMaterialRequirement = (index) => {
  if (selectedTask.value && selectedTask.value.materialRequirements) {
    selectedTask.value.materialRequirements.splice(index, 1)
  }
}

// 提醒设置变化处理
const handleReminderChange = (e) => {
  const enabled = e && e.target ? e.target.checked : !!e
  if (selectedTask.value) {
    if (!selectedTask.value.reminders) {
      selectedTask.value.reminders = {}
    }
    selectedTask.value.reminders.enabled = enabled
    
    // 如果启用提醒，设置默认提醒时间
    if (enabled && !selectedTask.value.reminders.beforeDeadline) {
      selectedTask.value.reminders.beforeDeadline = [3, 1]
    }
  }
}

// 切换非里程碑材料上传
const handleAllowMaterialUploadChange = (e) => {
  const enabled = e && e.target ? e.target.checked : !!e
  if (selectedTask.value) {
    selectedTask.value.allowMaterialUpload = enabled
    if (enabled && (!selectedTask.value.materialRequirements || selectedTask.value.materialRequirements.length === 0)) {
      // 提供一个空的材料条目，便于快速录入
      selectedTask.value.materialRequirements = [
        { id: Date.now(), name: '', required: false }
      ]
    }
  }
}

// 保存任务分配
const saveTaskAssignment = async () => {
  if (!selectedTask.value || !selectedTask.value.assignedTo) {
    message.error('请先选择负责人')
    return
  }
  
  try {
    // 准备分配数据
    const assignmentData = {
      taskKey: selectedTask.value.key,
      assignedTo: selectedTask.value.assignedTo,
      milestoneType: selectedTask.value.milestoneType,
      materialRequirements: selectedTask.value.materialRequirements || [],
      reminders: selectedTask.value.reminders || { enabled: false },
      assignedAt: new Date().toISOString()
    }
    
    // 同步到taskSyncStore
    await taskSyncStore.updateTask(projectInfo.value.id, selectedTask.value.key, assignmentData)
    
    message.success('任务分配已保存')
    
    // 自动发送通知
    sendTaskNotification()
    
  } catch (error) {
    console.error('保存任务分配失败:', error)
    message.error('保存失败，请重试')
  }
}

// 发送任务通知
const sendTaskNotification = () => {
  if (!selectedTask.value || !selectedTask.value.assignedTo) {
    message.error('请先保存任务分配')
    return
  }
  
  // TODO: 实现通知发送逻辑
  const notification = {
    type: 'task_assigned',
    recipientId: selectedTask.value.assignedTo.id,
    taskId: selectedTask.value.key,
    projectId: projectInfo.value.id,
    message: `您有新的任务分配：${selectedTask.value.title}`,
    data: {
      taskTitle: selectedTask.value.title,
      projectName: projectInfo.value.name,
      deadline: selectedTask.value.endDate,
      milestoneType: selectedTask.value.milestoneType,
      materialRequirements: selectedTask.value.materialRequirements
    }
  }
  
  // 模拟发送通知
  console.log('发送任务通知:', notification)
  message.success('任务通知已发送')
}

// 设置实时状态同步
const setupRealTimeSync = () => {
  console.log('实时状态同步已启动')
  // TODO: 实现实时状态同步逻辑
}

// 打开任务编辑模态框
const openTaskEditModal = () => {
  if (!selectedTask.value) {
    message.warning('请先选择一个任务')
    return
  }
  
  console.log('打开任务编辑弹窗:', selectedTask.value.title)
  
  // 初始化表单数据
  taskEditForm.title = selectedTask.value.title
  taskEditForm.description = selectedTask.value.description || ''
  taskEditForm.startDate = selectedTask.value.startDate
  taskEditForm.endDate = selectedTask.value.endDate
  taskEditForm.status = selectedTask.value.status
  taskEditForm.isCritical = selectedTask.value.isCritical || false
  
  // 添加里程碑相关信息
  if (selectedTask.value.isMilestone) {
    taskEditForm.milestoneType = selectedTask.value.milestoneType
    taskEditForm.materialRequirements = selectedTask.value.materialRequirements || []
  }
  
  taskEditModalVisible.value = true
  
  // 清除表单验证错误
  nextTick(() => {
    if (taskEditFormRef.value) {
      taskEditFormRef.value.clearValidate()
    }
  })
}

// 关闭任务编辑模态框
const closeTaskEditModal = () => {
  taskEditModalVisible.value = false
  // 重置表单
  taskEditForm.title = ''
  taskEditForm.description = ''
  taskEditForm.startDate = null
  taskEditForm.endDate = null
  taskEditForm.status = 'pending'
  taskEditForm.isCritical = false
  
  if (taskEditFormRef.value) {
    taskEditFormRef.value.clearValidate()
  }
}

// 打开任务详情查看弹窗
const openTaskDetailModal = (task) => {
  selectedTaskDetail.value = task
  taskDetailActiveTab.value = 'info'
  taskDetailModalVisible.value = true
}

// 关闭任务详情查看弹窗
const closeTaskDetailModal = () => {
  taskDetailModalVisible.value = false
  selectedTaskDetail.value = null
  taskDetailActiveTab.value = 'info'
  pmCommentTexts.value = {} // 清空评论文本
}

// 获取任务操作历史
const getTaskOperationHistory = (task) => {
  return task.operationHistory || []
}

// 操作历史相关方法
const getHistoryTypeColor = (type) => {
  const colors = {
    progress_update: 'blue',
    material_submission: 'green',
    status_change: 'orange',
    task_start: 'cyan',
    task_complete: 'purple'
  }
  return colors[type] || 'blue'
}

const getHistoryTypeIcon = (type) => {
  const icons = {
    progress_update: 'ClockCircleOutlined',
    material_submission: 'FileTextOutlined',
    status_change: 'EditOutlined',
    task_start: 'PlayCircleOutlined',
    task_complete: 'CheckCircleOutlined'
  }
  return icons[type] || 'ClockCircleOutlined'
}

const getHistoryActionText = (type) => {
  const texts = {
    progress_update: '更新了任务进度',
    material_submission: '提交了材料',
    status_change: '变更了任务状态',
    task_start: '开始了任务',
    task_complete: '完成了任务'
  }
  return texts[type] || '执行了操作'
}

const getHistoryDetailText = (history) => {
  switch (history.type) {
    case 'progress_update':
      const { oldProgress, newProgress, statusChange } = history.data
      let text = `进度从 ${oldProgress}% 更新到 ${newProgress}%`
      if (statusChange) {
        text += `，状态从 ${getTaskStatusText(statusChange.from)} 变更为 ${getTaskStatusText(statusChange.to)}`
      }
      if (history.data.note) {
        text += `\n备注：${history.data.note}`
      }
      return text
    case 'material_submission':
      return `提交了 ${history.data.submissionCount} 个材料文件`
    default:
      return '详细信息'
  }
}

const formatHistoryTime = (timestamp) => {
  if (!timestamp) return ''
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return time.toLocaleDateString('zh-CN')
}

const showOperationDetail = (history) => {
  selectedOperation.value = history
  operationDetailVisible.value = true
}

const openOperationHistory = () => {
  if (!selectedTask.value) {
    message.warning('请先选择一个任务')
    return
  }
  // 打开并展示该任务最新的操作历史（若无，提示）
  if (!Array.isArray(selectedTask.value.operationHistory) || selectedTask.value.operationHistory.length === 0) {
    message.info('当前任务暂无操作历史')
  }
  // 构造一个虚拟历史项以进入历史弹窗（或直接打开下方的操作详情弹窗并列出全部）
  selectedOperation.value = {
    type: 'progress_update',
    user: '系统',
    timestamp: new Date().toISOString(),
    data: { note: '操作历史汇总' }
  }
  operationDetailVisible.value = true
}

// 简易判断是否PDF
const isPdf = (src) => typeof src === 'string' && src.toLowerCase().endsWith('.pdf')

// 生成可预览URL（演示：支持本地blob或远端直链）
const resolveFileUrl = (item) => {
  // item 可能是 { url, fileName } 或 { name, path } 或 纯字符串
  const url = item?.url || item?.path || item?.fileUrl || (typeof item === 'string' ? item : '')
  return url
}

const previewMaterial = (item) => {
  const url = resolveFileUrl(item)
  if (!url) {
    message.warning('无法预览：缺少文件地址')
    return
  }
  filePreviewSrc.value = url
  filePreviewVisible.value = true
}

const downloadMaterial = (item) => {
  const url = resolveFileUrl(item)
  if (!url) {
    message.warning('无法下载：缺少文件地址')
    return
  }
  const a = document.createElement('a')
  a.href = url
  a.download = item?.fileName || item?.name || '材料'
  a.target = '_blank'
  a.click()
}

// 一键发给管理者：根据里程碑类型跳转到对应管理端材料提交/审核页
const forwardToManagers = () => {
  if (!selectedTaskDetail.value) {
    message.warning('请先选择一个任务')
    return
  }
  const milestoneType = selectedTaskDetail.value.milestoneType
  const queryParams = {
    projectId: projectInfo.value.id,
    projectName: projectInfo.value.name,
    projectCode: projectInfo.value.code,
    fromPM: 'true'
  }
  if (milestoneType === 'opening') {
    router.push({ path: '/opening/management/center', query: queryParams })
  } else if (milestoneType === 'midterm') {
    router.push({ path: '/midterm/management/center', query: queryParams })
  } else if (milestoneType === 'acceptance') {
    router.push({ path: '/acceptance/management/center', query: queryParams })
  } else {
    message.info('未知的里程碑类型，已跳转到项目管理页')
    router.push({ path: '/project-manager/projects' })
  }
  message.success('已为管理者准备材料页面')
}

// 项目经理添加评论
const addPMComment = async (history) => {
  const commentText = pmCommentTexts.value[history.id]
  if (!commentText || !commentText.trim()) {
    message.warning('请输入评论内容')
    return
  }
  
  const comment = {
    id: Date.now(),
    user: '张经理(项目经理)', // TODO: 获取当前项目经理信息
    userId: 'pm_001',
    role: 'project_manager',
    content: commentText.trim(),
    timestamp: new Date().toISOString()
  }
  
  // 添加评论到历史记录
  if (!history.comments) {
    history.comments = []
  }
  history.comments.push(comment)
  
  // 清空输入框
  pmCommentTexts.value[history.id] = ''
  
  // 同步到团队成员的任务看板
  try {
    await taskSyncStore.updateTask(selectedTaskDetail.value.projectId, selectedTaskDetail.value.key, {
      operationHistory: getTaskOperationHistory(selectedTaskDetail.value)
    })
    
    message.success('评论添加成功，已同步到团队成员')
  } catch (error) {
    console.error('同步评论失败:', error)
    message.error('评论添加失败')
  }
}

// 获取任务更新历史
const getTaskUpdateHistory = (task) => {
  return task.updateHistory || []
}

// 获取更新类型图标
const getUpdateIcon = (action) => {
  const icons = {
    'progress_update': 'PercentageOutlined',
    'status_change': 'SyncOutlined', 
    'task_created': 'PlusOutlined',
    'task_assigned': 'UserOutlined'
  }
  return icons[action] || 'InfoCircleOutlined'
}

// 获取更新类型颜色
const getUpdateTypeColor = (action) => {
  const colors = {
    'progress_update': 'blue',
    'status_change': 'orange',
    'task_created': 'green',
    'task_assigned': 'purple'
  }
  return colors[action] || 'default'
}

// 获取更新操作文本
const getUpdateActionText = (action) => {
  const texts = {
    'progress_update': '进度更新',
    'status_change': '状态变更',
    'task_created': '任务创建',
    'task_assigned': '任务分配'
  }
  return texts[action] || '其他操作'
}

// 格式化更新时间
const formatUpdateTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 如果是今天，显示时间
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 否则显示日期
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}



// 验证结束时间
const validateEndDate = (rule, value) => {
  if (!value) return Promise.resolve()
  if (!taskEditForm.startDate) return Promise.resolve()
  
  const startDate = new Date(taskEditForm.startDate)
  const endDate = new Date(value)
  
  if (endDate <= startDate) {
    return Promise.reject(new Error('结束时间必须晚于开始时间'))
  }
  return Promise.resolve()
}

// 禁用结束时间选择器的日期
const disabledEndDate = (current) => {
  if (!taskEditForm.startDate) return false
  const startDate = new Date(taskEditForm.startDate)
  return current && current <= startDate
}

// 计算任务持续时间
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 处理任务编辑
const handleTaskEdit = async () => {
  try {
    console.log('开始处理任务编辑...')
    
    // 验证表单
    await taskEditFormRef.value.validate()
    
    if (!selectedTask.value) {
      message.error('没有选中的任务')
      return
    }
    
    console.log('表单验证通过，正在保存...')
    taskEditLoading.value = true
    
    // 计算持续时间
    const duration = calculateDuration(taskEditForm.startDate, taskEditForm.endDate)
    
    // 更新任务数据
    const updatedData = {
      title: taskEditForm.title.trim(),
      description: taskEditForm.description.trim(),
      startDate: taskEditForm.startDate,
      endDate: taskEditForm.endDate,
      duration: duration,
      status: taskEditForm.status,
      isCritical: taskEditForm.isCritical
    }
    
    // 使用同步系统更新任务数据
    await taskSyncStore.updateTask(projectInfo.value.id, selectedTask.value.key, updatedData)
    
    // 更新选中的任务
    Object.assign(selectedTask.value, updatedData)
    
    // 同时更新WBS数据中的任务
    const updateTaskInWBS = (nodes) => {
      for (let node of nodes) {
        if (node.key === selectedTask.value.key) {
          Object.assign(node, updatedData)
          return true
        }
        if (node.children && updateTaskInWBS(node.children)) {
          return true
        }
      }
      return false
    }
    updateTaskInWBS(wbsData.value)
    
    // 重新生成时间轴（因为时间可能改变）
    generateTimeline()
    
    console.log('任务编辑成功:', updatedData)
    message.success(`任务 "${updatedData.title}" 信息已成功更新`)
    closeTaskEditModal()
    
  } catch (error) {
    console.error('任务编辑失败:', error)
    if (error.message) {
      message.error(`任务编辑失败: ${error.message}`)
    } else {
      message.error('任务编辑失败，请检查表单数据')
    }
  } finally {
    taskEditLoading.value = false
  }
}

// 复制任务
const duplicateTask = () => {
  if (!selectedTask.value) {
    message.warning('请先选择要复制的任务')
    return
  }
  
  const originalTask = selectedTask.value
  const newKey = generateNewTaskKey(originalTask.key.split('-')[0])
  
  const duplicatedTask = {
    ...originalTask,
    key: newKey,
    title: `${originalTask.title} (副本)`,
    status: 'pending',
    progress: 0,
    actualStartDate: null,
    actualEndDate: null,
    // 重置日期到当前时间开始
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    operationHistory: [] // 清空操作历史
  }
  
  // 如果有子任务，也复制但重新生成key
  if (originalTask.children) {
    duplicatedTask.children = originalTask.children.map((child, index) => ({
      ...child,
      key: `${newKey}-${index + 1}`,
      title: `${child.title} (副本)`,
      status: 'pending',
      progress: 0,
      operationHistory: []
    }))
  }
  
  // 添加到WBS数据
  wbsData.value.push(duplicatedTask)
  
  // 选中新创建的任务
  selectedKeys.value = [newKey]
  selectedTask.value = duplicatedTask
  
  // 确保新任务可见
  expandedKeys.value.push(newKey)
  
  console.log('任务复制成功:', duplicatedTask)
  message.success(`任务 "${originalTask.title}" 已复制`)
}

// 编辑任务分配（从WBS树节点触发）
const editTaskAssignment = (taskKey) => {
  const task = flatTasks.value.find(t => t.key === taskKey)
  if (task) {
    selectedKeys.value = [taskKey]
    selectedTask.value = task
    message.info('已选中任务，请在下方操作面板进行分配')
  }
}

// 键盘快捷键处理
const handleKeyboardShortcuts = (event) => {
  // Ctrl+E: 编辑任务
  if (event.ctrlKey && event.key === 'e') {
    event.preventDefault()
    if (selectedTask.value) {
      openTaskEditModal()
    }
  }
  
  // Ctrl+D: 复制任务
  if (event.ctrlKey && event.key === 'd') {
    event.preventDefault()
    if (selectedTask.value) {
      duplicateTask()
    }
  }
  
  // Tab / Shift+Tab 调整层级（仅编辑模式）
  if (wbsEditMode.value && selectedTask.value) {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault()
      indentTask(selectedTask.value.key)
    } else if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault()
      outdentTask(selectedTask.value.key)
    }
  }
  
  // Esc: 清除选中
  if (event.key === 'Escape') {
    event.preventDefault()
    clearTaskSelection()
  }
  
  // Delete: 删除任务
  if (event.key === 'Delete' && wbsEditMode.value) {
    event.preventDefault()
    if (selectedTask.value) {
      deleteWBSTask(selectedTask.value.key)
    }
  }
}

// 更新WBS树中的任务数据
const updateTaskInWBS = (taskKey, updates) => {
  const updateNode = (nodes) => {
    for (let node of nodes) {
      if (String(node.key) === String(taskKey)) {
        Object.assign(node, updates)
        return true
      }
      if (node.children && updateNode(node.children)) {
        return true
      }
    }
    return false
  }
  updateNode(wbsData.value)
}

// 切换WBS编辑模式
const toggleWBSEditMode = () => {
  wbsEditMode.value = !wbsEditMode.value
  if (!wbsEditMode.value) {
    // 退出编辑模式时重新生成时间轴（任务可能有变化）
    generateTimeline()
    message.success('WBS结构编辑完成')
  } else {
    message.info('进入WBS结构编辑模式')
  }
}

// 已移除悬浮显示功能按钮

// 生成新的任务key
const generateNewTaskKey = (parentKey = null) => {
  let maxKey = 0
  
  const findMaxKey = (nodes) => {
    nodes.forEach(node => {
      const nodeKeyStr = String(node?.key ?? '')
      if (parentKey !== null && parentKey !== undefined) {
        const parentKeyStr = String(parentKey)
        if (nodeKeyStr.startsWith(parentKeyStr + '-')) {
          const subKey = parseInt(nodeKeyStr.split('-').pop())
          if (!isNaN(subKey) && subKey > maxKey) {
            maxKey = subKey
          }
        }
      } else {
        const key = parseInt(nodeKeyStr)
        if (!isNaN(key) && key > maxKey) {
          maxKey = key
        }
      }
      if (node.children) {
        findMaxKey(node.children)
      }
    })
  }
  
  findMaxKey(wbsData.value)
  
  if (parentKey !== null && parentKey !== undefined) {
    return `${String(parentKey)}-${maxKey + 1}`
  } else {
    return `${maxKey + 1}`
  }
}

// 添加子任务
const addChildTask = (parentKey) => {
  const newKey = generateNewTaskKey(parentKey)
  const newTask = {
    key: newKey,
    title: '新建子任务',
    status: 'pending',
    progress: 0,
    plannedProgress: 0,
    responsible: '未分配',
    description: '请编辑任务描述',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration: 7,
    isCritical: false,
    children: []
  }
  
  // 查找父节点并添加子任务
  const addToParent = (nodes) => {
    for (let node of nodes) {
      if (String(node.key) === String(parentKey)) {
        if (!node.children) {
          node.children = []
        }
        node.children.push(newTask)
        // 展开父节点
        if (!expandedKeys.value.includes(String(parentKey))) {
          expandedKeys.value.push(String(parentKey))
        }
        return true
      }
      if (node.children && addToParent(node.children)) {
        return true
      }
    }
    return false
  }
  
  addToParent(wbsData.value)
  message.success('已添加新的子任务')
}

// 添加同级任务
const addSiblingTask = (taskKey) => {
  const { parent, index } = findTaskParentAndIndex(taskKey)
  const siblings = parent ? parent.children : wbsData.value
  const newKey = generateNewTaskKey(parent ? String(parent.key) : null)
  const newTask = {
    key: newKey,
    title: '新建同级任务',
    status: 'pending',
    progress: 0,
    plannedProgress: 0,
    responsible: '未分配',
    description: '请编辑任务描述',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration: 7,
    isCritical: false,
    children: []
  }
  siblings.splice(index + 1, 0, newTask)
  message.success('已添加新的同级任务')
}

// 通用：创建里程碑节点
const createMilestoneNode = (title = '🎯 新建里程碑', milestoneType = 'opening') => {
  lastMilestoneType.value = milestoneType
  return {
    key: '', // 稍后填充
    title,
    status: 'upcoming',
    progress: 0,
    responsible: '项目经理',
    description: '请完善里程碑说明',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    duration: 1,
    isCritical: true,
    isMilestone: true,
    milestoneType,
    materials: []
  }
}

// 添加里程碑（子级）
const addMilestoneChild = (parentKey, milestoneType = 'opening') => {
  const newKey = generateNewTaskKey(parentKey)
  const node = createMilestoneNode(`🎯 ${getMilestoneTitleByType(milestoneType)}`, milestoneType)
  node.key = newKey
  const addToParent = (nodes) => {
    for (let item of nodes) {
      if (String(item.key) === String(parentKey)) {
        if (!item.children) item.children = []
        item.children.push(node)
        const parentKeyStr = String(parentKey)
        if (!expandedKeys.value.includes(parentKeyStr)) expandedKeys.value.push(parentKeyStr)
        message.success('已添加里程碑（子级）')
        return true
      }
      if (item.children && addToParent(item.children)) return true
    }
    return false
  }
  addToParent(wbsData.value)
}

// 添加里程碑（同级）
const addMilestoneSibling = (taskKey, milestoneType = 'opening') => {
  const { parent, index } = findTaskParentAndIndex(taskKey)
  const siblings = parent ? parent.children : wbsData.value
  const newKey = generateNewTaskKey(parent ? String(parent.key) : null)
  const node = createMilestoneNode(`🎯 ${getMilestoneTitleByType(milestoneType)}`, milestoneType)
  node.key = newKey
  siblings.splice(index + 1, 0, node)
  message.success('已添加里程碑（同级）')
}

// 顶级里程碑
const addTopLevelMilestone = (milestoneType = 'opening') => {
  const newKey = generateNewTaskKey(null)
  const node = createMilestoneNode(`🎯 ${getMilestoneTitleByType(milestoneType)}`, milestoneType)
  node.key = newKey
  wbsData.value.push(node)
  expandedKeys.value.push(newKey)
  message.success('已添加顶级里程碑')
}

// 根据类型返回默认标题
const getMilestoneTitleByType = (milestoneType) => {
  if (milestoneType === 'opening') return '项目开题里程碑'
  if (milestoneType === 'midterm') return '项目中期里程碑'
  if (milestoneType === 'acceptance') return '项目验收里程碑'
  return '项目里程碑'
}

// 设为/取消里程碑
const toggleMilestone = (taskKey, toMilestone) => {
  const updateNode = (nodes) => {
    for (let node of nodes) {
      if (String(node.key) === String(taskKey)) {
        if (toMilestone) {
          node.isMilestone = true
          node.milestoneType = node.milestoneType || lastMilestoneType.value || 'opening'
          node.duration = 1
        } else {
          node.isMilestone = false
          delete node.milestoneType
        }
        markTaskRecentlyUpdated(taskKey)
        message.success(toMilestone ? '已设为里程碑' : '已取消里程碑')
        return true
      }
      if (node.children && updateNode(node.children)) return true
    }
    return false
  }
  updateNode(wbsData.value)
}

// 左右缩进（改变层级）
const indentTask = (taskKey) => {
  const { parent, index } = findTaskParentAndIndex(taskKey)
  const siblings = parent ? parent.children : wbsData.value
  if (index <= 0) return
  const newParent = siblings[index - 1]
  if (!newParent) return
  // 只能缩进到相邻前一个节点作为其子节点
  const [task] = siblings.splice(index, 1)
  if (!newParent.children) newParent.children = []
  const newKey = generateNewTaskKey(String(newParent.key))
  const oldKey = task.key
  task.key = newKey
  newParent.children.push(task)
  if (!expandedKeys.value.includes(newParent.key)) expandedKeys.value.push(newParent.key)
  // 更新选中键
  if (selectedTask.value && String(selectedTask.value.key) === String(oldKey)) {
    selectedTask.value.key = newKey
    selectedKeys.value = [newKey]
  }
  message.success('已缩进为子级')
}

const outdentTask = (taskKey) => {
  const { parent, index } = findTaskParentAndIndex(taskKey)
  if (!parent) return // 顶级无法再外移
  const grandInfo = findTaskParentAndIndex(parent.key)
  const siblings = parent.children
  const [task] = siblings.splice(index, 1)
  const targetSiblings = grandInfo.parent ? grandInfo.parent.children : wbsData.value
  const insertIndex = (grandInfo.parent ? targetSiblings.indexOf(parent) : wbsData.value.indexOf(parent)) + 1
  const newKey = generateNewTaskKey(grandInfo.parent ? String(grandInfo.parent.key) : null)
  const oldKey = task.key
  task.key = newKey
  targetSiblings.splice(insertIndex, 0, task)
  // 更新选中键
  if (selectedTask.value && String(selectedTask.value.key) === String(oldKey)) {
    selectedTask.value.key = newKey
    selectedKeys.value = [newKey]
  }
  message.success('已外移为同级')
}

// 树拖拽处理
const handleTreeDrop = (info) => {
  if (!wbsEditMode.value) return
  try {
    const dragKey = String(info.dragNode.key)
    const dropKey = String(info.node.key)
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    // 取出拖拽节点
    const { parent: dragParent, index: dragIndex } = findTaskParentAndIndex(dragKey)
    const dragSiblings = dragParent ? dragParent.children : wbsData.value
    const [dragNode] = dragSiblings.splice(dragIndex, 1)

    if (info.dropToGap) {
      // 同级插入
      const { parent: dropParent, index: dropIndex } = findTaskParentAndIndex(dropKey)
      const targetSiblings = dropParent ? dropParent.children : wbsData.value
      const insertIndex = dropPosition > 0 ? dropIndex + 1 : dropIndex
      const newKey = generateNewTaskKey(dropParent ? String(dropParent.key) : null)
      const oldKey = dragNode.key
      dragNode.key = newKey
      targetSiblings.splice(insertIndex, 0, dragNode)
      if (selectedTask.value && String(selectedTask.value.key) === String(oldKey)) {
        selectedTask.value.key = newKey
        selectedKeys.value = [newKey]
      }
    } else {
      // 作为子级
      const dropNodeRef = (() => {
        const findNode = (nodes) => {
          for (let n of nodes) {
            if (String(n.key) === dropKey) return n
            if (n.children) {
              const r = findNode(n.children)
              if (r) return r
            }
          }
          return null
        }
        return findNode(wbsData.value)
      })()
      if (!dropNodeRef) throw new Error('未找到目标节点')
      if (!dropNodeRef.children) dropNodeRef.children = []
      const newKey = generateNewTaskKey(String(dropNodeRef.key))
      const oldKey = dragNode.key
      dragNode.key = newKey
      dropNodeRef.children.push(dragNode)
      if (!expandedKeys.value.includes(dropNodeRef.key)) expandedKeys.value.push(dropNodeRef.key)
      if (selectedTask.value && String(selectedTask.value.key) === String(oldKey)) {
        selectedTask.value.key = newKey
        selectedKeys.value = [newKey]
      }
    }
    message.success('节点已重新排位')
  } catch (e) {
    console.error(e)
    message.error('拖拽失败，请重试')
  }
}

// 编辑WBS任务（快速编辑）
const editWBSTask = (taskKey) => {
  const task = findTaskByKey(taskKey)
  if (task) {
    selectedTask.value = task
    openTaskEditModal()
  }
}

// 查找任务
const findTaskByKey = (taskKey) => {
  const findInNodes = (nodes) => {
    for (let node of nodes) {
      if (node.key === taskKey) {
        return node
      }
      if (node.children) {
        const found = findInNodes(node.children)
        if (found) return found
      }
    }
    return null
  }
  return findInNodes(wbsData.value)
}

// 删除WBS任务
const deleteWBSTask = (taskKey) => {
  console.log('删除任务被调用:', taskKey)
  const task = findTaskByKey(taskKey)
  console.log('找到的任务:', task)
  
  if (!task) {
    console.log('任务未找到')
    message.error('未找到要删除的任务')
    return
  }
  
  // 检查是否有子任务
  if (task.children && task.children.length > 0) {
    console.log('任务有子任务，不能删除')
    message.warning('不能删除有子任务的任务，请先删除所有子任务')
    return
  }
  
  // 检查任务是否正在进行中
  if (task.status === 'active' && task.progress > 0) {
    Modal.warning({
      title: '任务正在进行中',
      content: `任务"${task.title}"正在进行中（进度：${task.progress}%），确定要删除吗？`,
      okText: '仍要删除',
      cancelText: '取消',
      onOk() {
        performDelete(taskKey, task)
      }
    })
    return
  }
  
  // 直接删除未开始的任务
  performDelete(taskKey, task)
}

const performDelete = (taskKey, task) => {
  console.log('准备显示删除确认对话框')
  
  // 确认删除
  const deleteTask = () => {
    const deleteFromNodes = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].key === taskKey) {
          nodes.splice(i, 1)
          return true
        }
        if (nodes[i].children && deleteFromNodes(nodes[i].children)) {
          return true
        }
      }
      return false
    }
    
    deleteFromNodes(wbsData.value)
    
    // 如果删除的是当前选中的任务，清除选中状态
    if (selectedTask.value && selectedTask.value.key === taskKey) {
      clearTaskSelection()
    }
    
    message.success('任务已删除')
  }
  
  // 使用Modal.confirm进行确认
  try {
    console.log('开始调用Modal.confirm')
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${task.title}"吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        console.log('用户确认删除')
        deleteTask()
      },
      onCancel() {
        console.log('用户取消删除')
      }
    })
    console.log('Modal.confirm调用完成')
  } catch (error) {
    console.error('Modal.confirm调用失败:', error)
    message.error('删除确认对话框打开失败')
  }
}

// 判断是否可以上移
const canMoveUp = (taskKey) => {
  const { parent, index } = findTaskParentAndIndex(taskKey)
  return index > 0
}

// 判断是否可以下移
const canMoveDown = (taskKey) => {
  const { parent, index } = findTaskParentAndIndex(taskKey)
  if (index === -1) return false
  const siblings = parent ? parent.children : wbsData.value
  return index < siblings.length - 1
}

// 查找任务的父节点和索引
const findTaskParentAndIndex = (taskKey) => {
  const findInNodes = (nodes, parent = null) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].key === taskKey) {
        return { parent, index: i }
      }
      if (nodes[i].children) {
        const found = findInNodes(nodes[i].children, nodes[i])
        if (found.index !== -1) return found
      }
    }
    return { parent: null, index: -1 }
  }
  return findInNodes(wbsData.value)
}

// 上移任务
const moveTaskUp = (taskKey) => {
  const { parent, index } = findTaskParentAndIndex(taskKey)
  if (index <= 0) return
  
  const siblings = parent ? parent.children : wbsData.value
  const task = siblings[index]
  siblings.splice(index, 1)
  siblings.splice(index - 1, 0, task)
  
  message.success('任务已上移')
}

// 下移任务
const moveTaskDown = (taskKey) => {
  const { parent, index } = findTaskParentAndIndex(taskKey)
  const siblings = parent ? parent.children : wbsData.value
  if (index >= siblings.length - 1) return
  
  const task = siblings[index]
  siblings.splice(index, 1)
  siblings.splice(index + 1, 0, task)
  
  message.success('任务已下移')
}

// 面板宽度拖拽调整功能
const startResize = (event) => {
  isResizing.value = true
  const startX = event.clientX
  const startWidth = leftPanelWidth.value
  
  const handleMouseMove = (e) => {
    if (!isResizing.value) return
    
    const deltaX = e.clientX - startX
    const newWidth = startWidth + deltaX
    
    // 限制最小和最大宽度
    const minWidth = 700 // 确保WBS树和任务详情都能完整显示
    const maxWidth = window.innerWidth - 500 // 保证右侧甘特图至少500px
    
    leftPanelWidth.value = Math.max(minWidth, Math.min(maxWidth, newWidth))
  }
  
  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

// 窗口大小变化监听
const handleResize = () => {
  // 确保右侧面板有足够的宽度
  const containerWidth = window.innerWidth - 48
  const maxLeftWidth = containerWidth - 500
  if (leftPanelWidth.value > maxLeftWidth) {
    leftPanelWidth.value = Math.max(700, maxLeftWidth) // 确保左侧最小宽度700px
  }
}

// 设置甘特图横向滚动同步
const setupGanttScrollSync = () => {
  const ganttHeader = ganttHeaderRef.value
  const ganttBody = ganttBodyRef.value
  
  if (!ganttHeader || !ganttBody) return
  
  // 同步头部和主体的横向滚动
  const syncScroll = (source, target) => {
    let isScrolling = false
    
    const handleScroll = () => {
      if (isScrolling) return
      isScrolling = true
      target.scrollLeft = source.scrollLeft
      requestAnimationFrame(() => {
        isScrolling = false
      })
    }
    
    source.addEventListener('scroll', handleScroll)
    return () => source.removeEventListener('scroll', handleScroll)
  }
  
  // 双向同步滚动
  const cleanup1 = syncScroll(ganttHeader, ganttBody)
  const cleanup2 = syncScroll(ganttBody, ganttHeader)
  
  // 保存清理函数，在组件销毁时调用
  ganttScrollCleanup.value = () => {
    cleanup1()
    cleanup2()
  }
}

// 处理任务数据更新事件
const handleTaskDataUpdated = (event) => {
  const { projectId, taskKey, updates } = event.detail

  // 只处理当前项目的任务更新（字符串比较避免 10001 vs "10001" 不一致）
  if (String(projectId) !== String(projectInfo.value.id)) return
  
  console.log(`📥 监控页面接收到任务更新: ${taskKey}`, updates)
  
  // 更新本地WBS数据（包含 operationHistory 合并）
  updateTaskInWBS(taskKey, updates)
  
  // 如果更新的是当前选中的任务，也要更新选中任务的数据
  if (selectedTask.value && String(selectedTask.value.key) === String(taskKey)) {
    // 合并操作历史去重
    if (updates && Array.isArray(updates.operationHistory)) {
      const existing = Array.isArray(selectedTask.value.operationHistory) ? selectedTask.value.operationHistory : []
      const merged = [...existing]
      updates.operationHistory.forEach(e => { if (!merged.find(x => x.id === e.id)) merged.push(e) })
      selectedTask.value.operationHistory = merged
    }
    Object.assign(selectedTask.value, updates)
  }
  
  // 重新生成时间轴（若时间或进度发生变化，以便立即反映宽度变化）
  if (updates.startDate || updates.endDate || updates.progress !== undefined) {
    generateTimeline()
  }

  // 显示明显的成员进度更新提示
  try {
    const task = flatTasks.value.find(t => String(t.key) === String(taskKey))
    // 仅在进度或状态变化时提示
    if (task && (updates.progress !== undefined || updates.status !== undefined)) {
      const name = task.title || `任务(${taskKey})`
      const progressText = updates.progress !== undefined ? `进度 ${updates.progress}%` : ''
      const statusText = updates.status ? `状态 ${getTaskStatusText(updates.status)}` : ''
      const text = [progressText, statusText].filter(Boolean).join('，')
      message.success({ content: `成员更新：${name} → ${text}`, duration: 3 })
      notification.open({
        message: '成员进度更新',
        description: `${name}：${text}`,
        duration: 3
      })
      // 标记任务为“最近更新”，触发甘特高亮
      markTaskRecentlyUpdated(taskKey)
      unreadUpdates.value += 1
    }
  } catch (e) {
    // 忽略提示失败，不影响主流程
  }
}

function markAllRead() {
  unreadUpdates.value = 0
  taskSyncStore.markProjectUpdatesRead(String(projectInfo.value.id))
}

// 重置项目进度（仅前端演示：将所有任务设为pending, progress=0，并清空操作历史）
function resetProjectProgress() {
  Modal.confirm({
    title: '确认重置项目进度？',
    content: '这将把所有任务设置为待开始(0%)，并清空操作历史（仅前端演示数据）。',
    okText: '重置',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      const resetNode = (nodes) => {
        nodes.forEach(n => {
          n.status = 'pending'
          n.progress = 0
          n.completedAt = null
          if (n.operationHistory) n.operationHistory = []
          if (n.children) resetNode(n.children)
        })
      }
      resetNode(wbsData.value)

      // 同步到 taskSyncStore，并广播到成员看板
      const updates = []
      const collect = (nodes) => {
        nodes.forEach(n => {
          updates.push({
            projectId: String(projectInfo.value.id),
            taskKey: String(n.key),
            data: { status: 'pending', progress: 0, completedAt: null, operationHistory: [] }
          })
          if (n.children) collect(n.children)
        })
      }
      collect(wbsData.value)
      if (updates.length) {
        await taskSyncStore.batchUpdateTasks(updates)
      }

      // 重新注册以刷新视图
      taskSyncStore.registerWBSProject(projectInfo.value.id, wbsData.value)
      generateTimeline()
      unreadUpdates.value = 0
      message.success('项目进度已重置，成员看板同步更新')
    }
  })
}

// 重置当前选中的单个任务
async function resetSelectedTask() {
  if (!selectedTask.value) return
  const key = String(selectedTask.value.key)
  Modal.confirm({
    title: '确认重置选中任务？',
    content: `将把任务「${selectedTask.value.title || key}」重置为待开始(0%)，并清空操作历史。`,
    okText: '重置',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      // 本地WBS更新
      const apply = (nodes) => {
        nodes.forEach(n => {
          if (String(n.key) === key) {
            n.status = 'pending'
            n.progress = 0
            n.completedAt = null
            if (n.operationHistory) n.operationHistory = []
          }
          if (n.children) apply(n.children)
        })
      }
      apply(wbsData.value)

      // 广播到缓存与其他页面
      await taskSyncStore.updateTask(String(projectInfo.value.id), key, {
        status: 'pending',
        progress: 0,
        completedAt: null,
        operationHistory: []
      })

      // 刷新视图
      taskSyncStore.registerWBSProject(projectInfo.value.id, wbsData.value)
      generateTimeline()
      message.success('选中任务已重置，成员看板同步更新')
    }
  })
}

// 开始选中任务（将 pending → active 且进度至少 10%）
async function quickStartSelectedTask() {
  if (!selectedTask.value) return
  const key = String(selectedTask.value.key)
  const newProgress = Math.max(10, Number(selectedTask.value.progress || 0))
  // 本地更新
  selectedTask.value.status = 'active'
  selectedTask.value.progress = newProgress
  selectedTask.value.startedAt = new Date().toISOString()

  // 广播到缓存与其他页面
  await taskSyncStore.updateTask(String(projectInfo.value.id), key, {
    status: 'active',
    progress: newProgress,
    startedAt: selectedTask.value.startedAt
  })

  // 刷新视图
  generateTimeline()
  message.success('任务已开始')
}

// 从 taskSync 缓存强制同步进度（防止任何遗漏导致的滞后），按 key 覆盖 progress/status
const syncFromCache = () => {
  try {
    const tasks = taskSyncStore.getProjectTasks(projectInfo.value.id)
    const map = new Map()
    const extractKey = (t) => {
      if (t && t.key != null) return String(t.key)
      if (t && t.taskKey) {
        const s = String(t.taskKey)
        const idx = s.indexOf('_')
        return idx >= 0 ? s.slice(idx + 1) : s
      }
      if (t && t.id != null) return String(t.id)
      return ''
    }
    tasks.forEach(t => {
      const k = extractKey(t)
      if (k) map.set(k, t)
    })
    const apply = (nodes) => {
      nodes.forEach(n => {
        const key = String(n.key)
        const cached = map.get(key)
        if (cached) {
          if (cached.progress !== undefined) n.progress = cached.progress
          if (cached.status) n.status = cached.status
        }
        if (n.children) apply(n.children)
      })
    }
    apply(wbsData.value)
    generateTimeline()
    message.success('已从缓存刷新任务进度')
  } catch (e) {
    console.warn('syncFromCache failed', e)
    message.error('刷新失败')
  }
}

// 初始化
onMounted(() => {
  // 若为互动联调演示项目(id=10001)，用与团队成员看板一致的WBS任务键，确保双端联动
  if (String(projectInfo.value.id) === '10001') {
    wbsData.value = [
      {
        title: '联调-前端集成与验证',
        key: 9001, // 与团队成员任务 id 保持一致
        status: 'active',
        progress: 30,
        responsible: '张三(演示账号)',
        assignedTo: { id: 99, name: '张三(演示账号)', role: 'developer' },
        description: '在看板侧更新进度与评论，验证项目监控侧实时联动',
        startDate: '2025-01-22',
        endDate: '2025-02-15',
        duration: 25,
        isCritical: false
      },
      {
        title: '联调-材料提交流转',
        key: 9002, // 与团队成员任务 id 保持一致
        status: 'pending',
        progress: 0,
        responsible: '张三(演示账号)',
        assignedTo: { id: 99, name: '张三(演示账号)', role: 'developer' },
        description: '从模板带出材料，成员提交，PM预审并转管理层',
        startDate: '2025-02-01',
        endDate: '2025-02-20',
        duration: 20,
        isCritical: false
      }
    ]
  }

  // 注册WBS项目数据到同步系统
  taskSyncStore.registerWBSProject(projectInfo.value.id, wbsData.value)
  
  // 启动实时状态监听
  setupRealTimeSync()
  
  generateTimeline()
  // 默认选中第一个活跃任务
  const activeTask = flatTasks.value.find(task => task.status === 'active')
  if (activeTask) {
    selectedKeys.value = [activeTask.key]
    selectedTask.value = activeTask
  }
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
  
  // 设置甘特图横向滚动同步
  nextTick(() => {
    setupGanttScrollSync()
  })
  
  // 监听任务数据更新事件
  window.addEventListener('taskDataUpdated', handleTaskDataUpdated)

  // 提示：监控已接管本项目的任务变化（一次性提示）
  message.success('已接管当前项目的实时任务更新，团队成员的进度与材料提交将实时显示。')
})

// 清理监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('taskDataUpdated', handleTaskDataUpdated)
  // 清理甘特图滚动同步
  if (ganttScrollCleanup.value) {
    ganttScrollCleanup.value()
  }
})
</script>

<style scoped>
.project-monitor-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

/* 项目标题区域 */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  color: #666;
  padding: 4px 8px;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #234fa2;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-dates {
  color: #666;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-info {
  text-align: center;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

.progress-value {
  font-size: 18px;
  font-weight: 600;
  color: #234fa2;
}

/* 主内容区域 */
.monitor-content {
  display: flex;
  height: calc(100vh - 200px);
  min-height: 600px;
  position: relative;
  gap: 8px;
}

.left-panel {
  height: 100%;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.right-panel {
  height: 100%;
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-width: 500px;
}

/* 拖拽分隔条样式 */
.resize-handle {
  width: 8px;
  height: 100%;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent;
  transition: background-color 0.2s;
  z-index: 10;
}

.resize-handle:hover {
  background: rgba(24, 144, 255, 0.1);
}

.resize-line {
  width: 2px;
  height: 60px;
  background: #d9d9d9;
  border-radius: 1px;
  transition: all 0.2s;
}

.resize-handle:hover .resize-line {
  background: #1890ff;
  height: 80px;
  width: 3px;
}

.resize-handle:active .resize-line {
  background: #0050b3;
  height: 100px;
  width: 4px;
}

.wbs-combined-card {
  height: 100%;
  overflow-x: hidden !important; /* 禁用水平滚动 */
  overflow-y: auto !important; /* 启用垂直滚动 */
  min-width: 0 !important; /* 允许弹性收缩 */
}

.gantt-card {
  height: 100%;
}

/* 下方表格附加区样式 */
.wbs-table-section-append {
  margin-top: 12px;
}

.wbs-table-section-append :deep(.ant-card-head-title) {
  font-size: 14px;
}

.wbs-combined-card :deep(.ant-card-body) {
  height: calc(100% - 57px);
  overflow: visible; /* 允许内容溢出，让子容器处理滚动 */
  padding: 8px; /* 减少padding让内容更紧凑 */
  display: flex !important;
  flex-direction: column !important;
  min-width: auto !important; /* 移除固定最小宽度限制 */
  width: 100% !important;
}

.gantt-card :deep(.ant-card-body) {
  height: calc(100% - 57px);
  overflow: auto;
}

/* WBS容器布局 */
.wbs-container {
  display: flex !important;
  height: 100% !important;
  gap: 8px; /* 减少间距 */
  overflow: hidden; /* 父容器不滚动，让子容器处理 */
  flex: 1 !important;
  min-width: 100% !important; /* 使用100%宽度 */
  width: 100% !important;
}

.wbs-tree-section {
  flex: 0 0 320px !important; /* 减少固定宽度为320px，更紧凑 */
  min-width: 300px !important;
  max-width: 380px !important; /* 减少最大宽度 */
  display: flex !important;
  flex-direction: column !important;
  overflow-y: auto !important; /* 启用垂直滚动 */
  overflow-x: hidden !important; /* 禁用水平滚动 */
  max-height: 100% !important; /* 限制最大高度 */
  height: 100% !important; /* 明确设置高度 */
}

/* 编辑模式下的树容器特殊处理 */
.wbs-tree-section:has(.edit-mode-active) {
  overflow-y: auto !important;
  height: 100% !important;
}

/* 兼容性备用方案 */
.edit-mode-container .wbs-tree-section {
  overflow-y: auto !important;
  height: 100% !important;
}

.task-detail-section {
  flex: 1 1 auto !important; /* 自动填充剩余空间 */
  min-width: 350px !important; /* 减少最小宽度但确保内容显示 */
  max-width: none !important; /* 移除最大宽度限制 */
  width: auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow-y: auto !important; /* 启用垂直滚动 */
  overflow-x: hidden !important; /* 禁用水平滚动 */
  max-height: 100% !important; /* 限制最大高度 */
  position: relative !important; /* 确保z-index生效 */
  z-index: 10 !important; /* 确保任务详情在最上层 */
  background: white !important; /* 添加白色背景防止透明覆盖 */
  border-left: 2px solid #f0f0f0 !important; /* 添加左边框作为分隔 */
}

.wbs-divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent 0%, #e8e8e8 20%, #e8e8e8 80%, transparent 100%);
  flex-shrink: 0;
}

/* WBS树形结构 */
.wbs-tree {
  height: 100%;
  overflow-y: auto !important; /* 强制启用垂直滚动 */
  overflow-x: hidden !important; /* 强制禁用水平滚动 */
  padding-right: 10px; /* 为按钮留出额外空间 */
  /* 强制启用滚动，解决编辑模式下滚动失效的问题 */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
  /* 确保在编辑模式下滚动正常工作 */
  position: relative;
  z-index: 1;
  /* 确保内容不会水平溢出 */
  word-wrap: break-word;
  word-break: break-all;
}

/* 编辑模式下特殊的滚动处理 */
.wbs-tree:has(.tree-node.edit-mode) {
  /* 为编辑模式优化滚动性能 */
  scroll-behavior: smooth;
  overflow-y: scroll !important;
}

/* 当浏览器不支持:has()选择器时的备用方案 */
.wbs-tree.edit-mode-active {
  scroll-behavior: smooth !important;
  overflow-y: scroll !important;
  /* 覆盖Ant Design的虚拟滚动设置 */
  max-height: none !important;
}

/* 针对Ant Design Tree的滚动容器优化 */
.wbs-tree.edit-mode-active .ant-tree-list {
  overflow-y: auto !important;
  max-height: 100% !important;
  height: auto !important;
}

.wbs-tree.edit-mode-active .ant-tree-list-holder {
  overflow-y: auto !important;
  max-height: none !important;
}

.wbs-tree.edit-mode-active .ant-tree-list-holder-inner {
  overflow: visible !important;
}

/* 编辑模式下的额外修复 - 针对虚拟滚动问题 */
.edit-mode-container .wbs-tree {
  /* 强制禁用虚拟滚动的固定高度 */
  height: auto !important;
  min-height: 100% !important;
  overflow-y: auto !important;
}

.edit-mode-container .ant-tree-list {
  /* 重置列表容器的高度限制 */
  height: auto !important;
  min-height: 100% !important;
  max-height: none !important;
  overflow: visible !important;
}

.edit-mode-container .ant-tree-list-holder {
  /* 重置持有者容器的高度限制 */
  height: auto !important;
  min-height: 100% !important;
  max-height: none !important;
  overflow: visible !important;
}

/* 确保编辑模式下所有节点都可见和可滚动 */
.edit-mode-container .ant-tree-treenode {
  position: relative !important;
  overflow: visible !important;
}

/* 强制任务详情区域的布局和显示 */
.task-detail-section > * {
  width: 100% !important;
  flex-shrink: 0 !important;
}

.detail-progress, .detail-time, .task-description {
  width: 100% !important;
  min-width: 0 !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* 确保进度条和按钮正确显示 */
.progress-content, .assign-content {
  width: 100% !important;
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}

/* 响应式处理 - 当屏幕宽度不足时调整布局 */
@media (max-width: 1400px) {
  .wbs-container {
    flex-direction: column !important;
    gap: 16px !important;
    overflow-y: auto !important;
    min-width: auto !important;
  }
  
  .wbs-tree-section {
    flex: 0 0 auto !important;
    max-width: none !important;
    min-width: auto !important;
    width: 100% !important;
    max-height: 400px !important;
  }
  
  .task-detail-section {
    flex: 0 0 auto !important;
    min-width: auto !important;
    width: 100% !important;
    max-height: 500px !important;
  }
}

/* 小屏幕优化 */
@media (max-width: 1200px) {
  .wbs-combined-card :deep(.ant-card-body) {
    min-width: auto !important;
    padding: 8px !important;
  }
  
  .wbs-container {
    min-width: auto !important;
  }
}

/* 强制显示任务详情的应急类 */
.force-show-task-detail .task-detail-section {
  position: fixed !important;
  top: 100px !important;
  right: 20px !important;
  width: 400px !important;
  height: calc(100vh - 140px) !important;
  z-index: 1000 !important;
  background: white !important;
  border: 2px solid #234fa2 !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
}

/* 当任务详情被强制显示时，为WBS树留出更多空间 */
.force-show-task-detail .wbs-tree-section {
  width: calc(100% - 440px) !important;
  max-width: none !important;
}

.wbs-tree .ant-tree-treenode {
  padding: 3px 0;
  min-height: 44px; /* 为编辑模式预留高度 */
  /* 确保节点不会阻止滚动 */
  position: relative;
}

/* 编辑模式下的节点特殊处理 */
.wbs-tree.edit-mode-active .ant-tree-treenode {
  min-height: 50px; /* 为编辑模式增加高度 */
  margin-bottom: 2px; /* 增加节点间距，避免重叠 */
}

.wbs-tree .ant-tree-node-content-wrapper {
  min-height: 44px;
  display: flex;
  align-items: center;
  width: 100%;
  overflow: visible;
  position: relative;
}

/* 编辑模式下确保内容包装器有正确的高度 */
.wbs-tree.edit-mode-active .ant-tree-node-content-wrapper {
  min-height: 50px;
  padding: 2px 0;
}

.wbs-tree .ant-tree-title {
  width: 100%;
  overflow: visible;
  position: relative;
}

/* 确保深层嵌套的节点也能正常显示操作按钮 */
.wbs-tree .ant-tree-treenode-switcher-close,
.wbs-tree .ant-tree-treenode-switcher-open {
  margin-right: 8px;
}

.wbs-tree .ant-tree-indent {
  position: relative;
}

/* 增强选中节点的视觉效果 */
.wbs-tree .ant-tree-node-selected {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%) !important;
  border-left: 4px solid #234fa2 !important;
  box-shadow: 0 2px 8px rgba(35, 79, 162, 0.15) !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
  transform: translateX(2px) !important;
  transition: all 0.3s ease !important;
}

.wbs-tree .ant-tree-node-selected .tree-node {
  padding: 8px 12px !important;
}

.wbs-tree .ant-tree-node-selected .node-title {
  color: #234fa2 !important;
  font-weight: 600 !important;
}

/* 悬停效果 */
.wbs-tree .ant-tree-treenode:hover {
  background: #f0f8ff !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.wbs-tree .ant-tree-treenode:hover .tree-node {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}

.tree-node {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  position: relative;
  min-height: 40px;
  padding: 4px 0;
}

.tree-node.edit-mode {
  padding-right: 170px; /* 为操作按钮留出足够空间 */
  min-height: 50px; /* 确保有足够高度容纳按钮 */
  padding-top: 6px;
  padding-bottom: 6px;
  /* 确保编辑模式下节点不会影响滚动 */
  position: relative;
  z-index: 1;
}

.node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.node-title {
  font-weight: 500;
  color: #333;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.node-unread-badge :deep(.ant-badge-count) {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
  border: 1px solid rgba(255,255,255,0.85);
}

.node-unread-badge {
  margin-left: 8px;
}

.node-status {
  margin-left: 8px;
  flex-shrink: 0;
}

.node-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
  gap: 8px;
}

.node-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 120px;
}

.node-responsible {
  margin-left: 8px;
}

/* 编辑模式下的操作按钮样式 */
.node-actions {
  position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.98);
  padding: 3px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 20;
  display: flex;
  gap: 1px;
  flex-wrap: nowrap;
  white-space: nowrap;
  /* 确保操作按钮不会阻止滚动 */
  pointer-events: auto;
}

.action-btn {
  width: 22px !important;
  height: 22px !important;
  min-width: 22px !important;
  padding: 0 !important;
  margin: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 11px !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 3px !important;
  background: transparent !important;
  color: #666 !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
}

.action-btn:hover {
  background: #f0f8ff !important;
  color: #234fa2 !important;
}

.action-btn.delete-btn:hover {
  background: #fff2f0 !important;
  color: #ff4d4f !important;
}

.action-btn:disabled {
  opacity: 0.3 !important;
  cursor: not-allowed !important;
}

.action-btn:disabled:hover {
  background: transparent !important;
  color: inherit !important;
}

/* === 优化后的甘特图样式 === */
.gantt-container {
  margin-top: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  height: calc(100vh - 380px);
  min-height: 400px;
  overflow: hidden; /* 禁用容器滚动，只在子容器中滚动 */
  position: relative; /* 确保定位上下文 */
}

.gantt-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-bottom: 2px solid #e8e8e8;
  padding: 12px 16px;
  overflow-x: auto; /* 允许头部横向滚动 */
  overflow-y: hidden; /* 禁用头部纵向滚动 */
}

.gantt-timeline {
  display: flex;
  background: #fafafa;
  border-radius: 4px;
  padding: 8px;
  min-width: 100%; /* 确保时间轴至少填满容器 */
  width: max-content; /* 让时间轴宽度适应内容，触发横向滚动 */
}

.timeline-unit {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  border-right: 2px solid #d9d9d9;
  padding: 8px 4px;
  background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
  transition: all 0.2s;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.timeline-unit:hover {
  background: linear-gradient(to bottom, #e6f7ff 0%, #bae7ff 100%);
  color: #0050b3;
  transform: translateY(-1px);
}

.timeline-unit:last-child {
  border-right: none;
}

.gantt-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  height: calc(100vh - 460px); /* 使用固定高度而不是max-height */
  overflow-x: auto; /* 允许水平滚动查看甘特图 */
  overflow-y: auto; /* 允许垂直滚动 */
  position: relative; /* 确保绝对定位元素的定位上下文 */
}

.gantt-row {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  border: 1px solid transparent;
  min-width: 100%; /* 确保行至少填满容器 */
  width: max-content; /* 让行宽度适应内容，与时间轴对齐 */
}

.gantt-row:hover {
  background-color: #f0f8ff;
  border-color: #d1e7ff;
  transform: translateX(2px);
}

.gantt-row.selected {
  background-color: #e6f7ff;
  border: 1px solid #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.gantt-row.highlight-task {
  background: #fff7e6 !important;
  border: 2px solid #faad14 !important;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3) !important;
  animation: highlightPulse 1s ease-in-out;
  z-index: 10;
  position: relative;
}

@keyframes highlightPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 6px 16px rgba(250, 173, 20, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
  }
}

/* === 优化任务信息区域 === */
.task-info {
  width: 250px;
  min-width: 250px;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  border-right: 1px solid #e8e8e8;
  background: #fafafa;
}

.task-name {
  font-weight: 500;
  color: #262626;
  font-size: 13px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-duration {
  font-size: 11px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
  width: fit-content;
}

 .task-bar-container {
   flex: 1;
   height: 32px;
   position: relative;
   background: #f0f0f0;
   border-radius: 6px;
   min-width: 400px; /* 减少最小宽度，避免过度滚动 */
   margin: 4px 0;
   border: 1px solid #e8e8e8;
   padding-right: 120px;
 }

.task-bar {
  position: absolute;
  height: calc(100% - 4px);
  top: 2px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* === 简化清晰的任务状态样式 === */
.task-bar.status-completed {
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  border-left: 4px solid #389e0d;
  position: relative;
}

/* 移除重复的对勾，使用专门的完成文字样式 */

.task-bar.status-completed:hover {
  background: linear-gradient(90deg, #73d13d 0%, #95de64 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.4);
}

.task-bar.status-active {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  border-left: 4px solid #0050b3;
}

.task-bar.status-active:hover {
  background: linear-gradient(90deg, #40a9ff 0%, #69c0ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
}

.task-bar.status-pending {
  background: linear-gradient(90deg, #faad14 0%, #ffc53d 100%);
  border-left: 4px solid #d48806;
}

.task-bar.status-pending:hover {
  background: linear-gradient(90deg, #ffc53d 0%, #ffd666 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.4);
}

.task-bar.status-delayed {
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
  border-left: 4px solid #cf1322;
}

.task-bar.status-delayed:hover {
  background: linear-gradient(90deg, #ff7875 0%, #ffa39e 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.4);
}

.task-bar.critical-path {
  border: 2px solid #ff4d4f;
}

/* === 重新设计的进度条样式 === */
/* 确保甘特图进度条样式优先级最高 */
.gantt-body .gantt-row .task-bar .task-progress-info * {
  box-sizing: border-box !important;
}

 /* 强制覆盖样式 - 专用class */
 .gantt-text-override {
   font-weight: 600 !important;
   font-size: 11px !important;
   color: #333 !important;
   text-shadow: none !important;
   background: #f8f9fa !important;
   padding: 2px 6px !important;
   border-radius: 3px !important;
   border: 1px solid #e0e0e0 !important;
   display: inline-block !important;
   white-space: nowrap !important;
 }
 
 .gantt-status-override {
   font-size: 11px !important;
   font-weight: 600 !important;
   color: #1890ff !important;
   text-shadow: none !important;
   text-transform: none !important;
   background: #e6f7ff !important;
   padding: 3px 8px !important;
   border-radius: 4px !important;
   border: 1px solid #91d5ff !important;
   display: inline-block !important;
   white-space: nowrap !important;
   box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
 }
 
 .gantt-completed-override {
   font-size: 11px !important;
   font-weight: 600 !important;
   color: #52c41a !important;
   text-shadow: none !important;
   background: #f6ffed !important;
   padding: 3px 8px !important;
   border-radius: 4px !important;
   border: 1px solid #b7eb8f !important;
   display: inline-flex !important;
   align-items: center !important;
   gap: 4px !important;
   white-space: nowrap !important;
   box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
 }

 .gantt-progress-override {
   position: absolute !important;
   right: -120px !important;
   top: 0 !important;
   width: 110px !important;
   height: 100% !important;
   display: flex !important;
   align-items: center !important;
   justify-content: flex-start !important;
   padding: 0 4px !important;
   z-index: 1 !important; /* 降低z-index，不覆盖任务详情 */
   pointer-events: none !important;
   gap: 6px !important;
   overflow: hidden !important; /* 防止溢出覆盖其他区域 */
 }
.task-progress-track {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.05); /* 更明显的背景 */
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 最近更新高亮效果 */
.recently-updated {
  animation: pm-pulse-highlight 1.6s ease-out 1;
}

@keyframes pm-pulse-highlight {
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.6); }
  60% { box-shadow: 0 0 0 8px rgba(24, 144, 255, 0); }
  100% { box-shadow: none; }
}

.task-progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.25); /* 这个会被内联样式覆盖 */
  border-radius: 5px;
  transition: width 0.3s ease;
  position: relative;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  /* 添加边框以更好地区分进度 */
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}



/* 底部任务详情 */
.bottom-panel {
  margin-top: 24px;
}

.task-detail-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.task-actions h4 {
  margin-bottom: 12px;
  color: #234fa2;
}

/* === 新增甘特图样式 === */
.task-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-btn {
  min-width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-placeholder {
  width: 20px;
  height: 20px;
  display: inline-block;
}

.task-name.level-0 {
  font-size: 13px;
  font-weight: 600;
  color: #234fa2;
}

.task-name.level-1 {
  font-size: 12px;
  font-weight: 500;
  color: #555;
  padding-left: 12px;
}

.task-name.level-2 {
  font-size: 11px;
  color: #666;
  padding-left: 24px;
}

.task-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
  font-weight: 500;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-status-tag {
  font-size: 10px;
}

.gantt-row.parent-task {
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
  font-weight: 600;
}

.gantt-row.child-task {
  border-left: 3px solid #d9d9d9;
}

.task-bar.level-0 {
  height: 28px;
  border: 2px solid rgba(255,255,255,0.8);
}

.task-bar.level-1 {
  height: 24px;
}

.task-bar.level-2 {
  height: 20px;
}

.status-active.level-1 {
  background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
}

.status-completed.level-1 {
  background: linear-gradient(135deg, #73d13d 0%, #95de64 100%);
}

.status-pending.level-1 {
  background: linear-gradient(135deg, #ffc53d 0%, #ffd666 100%);
}

.critical-indicator {
  position: absolute;
  top: -6px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 4px rgba(255, 77, 79, 0.4);
  border: 2px solid white;
  z-index: 5;
}

.critical-path {
  border: 2px solid #ff4d4f !important;
  box-shadow: 0 0 12px rgba(255,77,79,0.4) !important;
  animation: criticalPulse 2s infinite;
}

@keyframes criticalPulse {
  0%, 100% { 
    box-shadow: 0 0 12px rgba(255,77,79,0.4);
  }
  50% { 
    box-shadow: 0 0 20px rgba(255,77,79,0.6);
  }
}

/* 进度更新弹窗样式 */
.progress-update-form {
  padding: 8px 0;
}

.task-info-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #234fa2;
}

.task-info-section h4 {
  margin: 0;
  color: #234fa2;
  font-weight: 600;
}

.current-progress-text {
  margin-left: 12px;
  font-weight: 500;
  color: #666;
}

.progress-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.new-progress-text {
  font-weight: 600;
  color: #234fa2;
}

.completion-notice {
  color: #52c41a;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 进度更新弹窗内的滑块样式 */
.progress-update-form .ant-slider {
  margin: 12px 0 20px 0;
}

.progress-update-form .ant-slider-mark-text {
  font-size: 12px;
  color: #666;
}

.progress-update-form .ant-form-item-label {
  font-weight: 500;
}

/* WBS任务详情区域样式 */
.wbs-task-detail {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px; /* 减少间距 */
  padding: 12px; /* 减少padding */
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  overflow-y: auto !important; /* 允许纵向滚动 */
  min-height: 0 !important; /* 确保flex子项可以缩小 */
  width: 100% !important; /* 确保占满容器宽度 */
}

.detail-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px; /* 减少padding */
  border-bottom: 2px solid #234fa2;
  margin-bottom: 12px; /* 减少margin */
}

.detail-panel-title {
  margin: 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-btn {
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

.edit-btn:hover {
  background: #4e7be6;
  border-color: #4e7be6;
}

.detail-header {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 12px;
  position: relative;
}

.task-description {
  display: flex;
  flex-direction: column;
  gap: 6px; /* 减少间距 */
  padding: 8px; /* 减少padding */
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.description-content {
  color: #555;
  font-size: 12px; /* 减少字体大小 */
  line-height: 1.4; /* 减少行高 */
  padding: 6px; /* 减少padding */
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  min-height: 30px; /* 减少最小高度 */
}

.task-title-detail {
  margin: 0 0 8px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  padding-right: 32px; /* 为关闭按钮留出空间 */
}

.task-meta-detail {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.close-btn {
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #234fa2;
  background: #f0f8ff;
  border-radius: 4px;
}

.detail-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.progress-display {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.progress-update-btn {
  flex-shrink: 0;
}

.assign-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.assign-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.assign-display {
  flex: 1;
}

.assign-btn {
  flex-shrink: 0;
}

.assign-select-wrapper {
  margin-top: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.progress-item label,
.assign-item label,
.time-item label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.progress-value {
  margin-left: 8px;
  font-weight: 500;
  color: #234fa2;
}

.assigned-member-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #f0f8ff;
  border-radius: 6px;
  border: 1px solid #d1e7ff;
}

.unassigned {
  color: #999;
  font-style: italic;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.detail-time {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.time-item span {
  color: #333;
  font-weight: 500;
}



.member-option-small {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 新增的分配功能样式 */
.milestone-config {
  margin-bottom: 12px;
}

.milestone-config label {
  display: block;
  font-weight: 500;
  color: #234fa2;
  margin-bottom: 6px;
  font-size: 12px;
}

.milestone-content {
  width: 100%;
}

.material-requirements {
  margin-bottom: 12px;
}

.material-requirements label {
  display: block;
  font-weight: 500;
  color: #234fa2;
  margin-bottom: 6px;
  font-size: 12px;
}

.materials-list {
  width: 100%;
}

.material-item {
  margin-bottom: 8px;
}

.material-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
}

.material-description {
  margin-top: 4px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.description-text {
  color: #666;
  line-height: 1.4;
}

.task-settings {
  margin-bottom: 12px;
}

.task-settings label {
  display: block;
  font-weight: 500;
  color: #234fa2;
  margin-bottom: 6px;
  font-size: 12px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reminder-settings {
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assignment-actions {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 空状态样式 */
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}

.empty-hint {
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-hint :deep(.ant-empty-description) {
  color: #999;
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .monitor-content {
    flex-direction: column;
    height: auto;
  }
  
  .left-panel {
    width: 100%;
    height: 400px;
  }
  
  .right-panel {
    height: 500px;
  }
}

/* 任务详情弹窗样式 */
.task-update-history {
  max-height: 400px;
  overflow-y: auto;
}

.no-history {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

.history-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.history-user {
  font-weight: 600;
  color: #1890ff;
}

.history-action {
  color: #666;
}

.history-time {
  color: #999;
  font-size: 12px;
}

.history-detail {
  color: #333;
  line-height: 1.5;
  white-space: pre-line;
  margin-bottom: 12px;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
}

.history-comments {
  background: #fff;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #e8e8e8;
}

.comment-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-user {
  font-weight: 500;
  color: #1890ff;
  font-size: 12px;
}

.comment-time {
  color: #999;
  font-size: 11px;
}

.comment-content {
  color: #333;
  font-size: 13px;
  line-height: 1.4;
}

.add-pm-comment {
  margin-top: 8px;
}

.update-item {
  padding: 8px 0;
}

.update-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.update-user {
  font-weight: 600;
  color: #234fa2;
}

.update-time {
  font-size: 12px;
  color: #999;
}

.update-content {
  margin-left: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.update-content p {
  margin: 4px 0;
}

.update-content .issues {
  color: #f5222d;
  background: #fff2f0;
  padding: 4px 8px;
  border-radius: 4px;
  border-left: 3px solid #f5222d;
}

.progress-update {
  background: #f0f9ff;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.status-change {
  background: #fff7e6;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #fa8c16;
}

.task-created {
  background: #f6ffed;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #52c41a;
}

.task-assigned {
  background: #f9f0ff;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #722ed1;
}

.no-history {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 里程碑详情弹窗样式 */
.milestone-detail {
  padding: 16px 0;
}

.milestone-basic-info {
  margin-bottom: 24px;
}

.milestone-basic-info h3 {
  margin: 0 0 16px 0;
  color: #1890ff;
  font-size: 18px;
}

.milestone-materials h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

/* WBS树中的里程碑样式 */
.milestone-node {
  background: linear-gradient(135deg, #e6f7ff 0%, #f6ffed 100%);
  border-left: 4px solid #1890ff;
  border-radius: 6px;
  padding: 4px 8px;
  margin: 2px 0;
}

.milestone-title {
  color: #1890ff !important;
  font-weight: 600;
}

.milestone-actions {
  margin-left: 8px;
}

/* 甘特图中的里程碑样式 */
.milestone-row {
  background: linear-gradient(135deg, #e6f7ff 0%, #f6ffed 100%);
  border-left: 4px solid #1890ff;
}

.milestone-name {
  color: #1890ff;
  font-weight: 600;
}

.milestone-row .task-progress-track {
  background: linear-gradient(to right, #87ceeb, #32cd32);
  height: 8px;
  border-radius: 4px;
}

/* 不同类型里程碑的颜色区分 */
.milestone-opening {
  border-left-color: #52c41a;
}

.milestone-midterm {
  border-left-color: #1890ff;
}

.milestone-acceptance {
  border-left-color: #722ed1;
}

.milestone-opening .milestone-title,
.milestone-opening .milestone-name {
  color: #52c41a !important;
}

.milestone-midterm .milestone-title,
.milestone-midterm .milestone-name {
  color: #1890ff !important;
}

.milestone-acceptance .milestone-title,
.milestone-acceptance .milestone-name {
  color: #722ed1 !important;
}
</style>