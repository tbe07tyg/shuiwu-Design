<template>
  <div class="task-planning-page">
    <!-- 统计概览 -->
    <div class="overview-section">
      <div class="stats-cards">
        <div class="stat-card"><div class="stat-label">总任务数</div><div class="stat-value">{{ totalTasks }}</div></div>
        <div class="stat-card"><div class="stat-label">未分配</div><div class="stat-value" :style="{color: unassignedCount>0 ? '#d4380d' : '#52c41a'}">{{ unassignedCount }}</div></div>
        <div class="stat-card"><div class="stat-label">已分配</div><div class="stat-value">{{ assignedCount }}</div></div>
        <div class="stat-card"><div class="stat-label">未计划时间</div><div class="stat-value" :style="{color: unsetTimeCount>0 ? '#fa8c16' : '#52c41a'}">{{ unsetTimeCount }}</div></div>
        <div class="stat-card"><div class="stat-label">已设置时间</div><div class="stat-value" :style="{color: setTimeCount>0 ? '#52c41a' : '#8c8c8c'}">{{ setTimeCount }}</div></div>
        <div class="stat-card"><div class="stat-label">未设置里程碑</div><div class="stat-value" :style="{color: unsetMilestoneCount>0 ? '#fa541f' : '#52c41a'}">{{ unsetMilestoneCount }}</div></div>
        <div class="stat-card"><div class="stat-label">已设置里程碑</div><div class="stat-value" :style="{color: setMilestoneCount>0 ? '#52c41a' : '#8c8c8c'}">{{ setMilestoneCount }}</div></div>
      </div>
    </div>

    <div class="main">
      <div class="col left">
        <div class="hd">
          <div class="h">任务面板</div>
          <div class="toolbar">
            <a-select
              v-model:value="activeFilter"
              style="width: 160px"
              :options="[
                { label: '全部', value: 'all' },
                { label: '未分配', value: 'unassigned' },
                { label: '已分配', value: 'assigned' },
                { label: '未计划时间', value: 'no_time' },
                { label: '已设置时间', value: 'has_time' },
                { label: '未设置里程碑', value: 'no_milestone' },
                { label: '已设置里程碑', value: 'has_milestone' }
              ]"
            />
            <a-input-search v-model:value="taskKeywordRaw" allow-clear placeholder="搜索任务（200ms防抖）" style="width:280px" />
            <a-button type="dashed" @click="openAddTask">新增任务</a-button>
            <!-- 导入入口暂时移除，后续需要时再恢复 -->

          </div>
        </div>
        <!-- 扁平化任务列表 -->
        <div class="flat-task-list">
          <a-empty v-if="filteredTasks.length === 0" description="暂无任务" />
          <div v-else class="task-items">
            <div 
              v-for="task in filteredTasks" 
              :key="task.id" 
              class="task-item" 
              :data-task-id="task.id" 
              draggable="true" 
              @dragstart="onDragStart(task)" 
              @dragend="onDragEnd"
            >
              <div class="task-content">
                <div class="task-header">
                  <div class="task-name">
                    {{ task.name }}
                    <a-tag v-if="task.isNew" color="green" size="small">新增</a-tag>
                  </div>
                  <div class="task-actions">
                    <a-button size="small" type="link" :draggable="false" @mousedown.stop @click.stop="pickAssignee(task)">分配</a-button>
                    <a-button size="small" type="link" :draggable="false" @mousedown.stop @click.stop="openEdit(task)">设置</a-button>
                    <a-button size="small" type="link" danger :draggable="false" @mousedown.stop @click.stop="confirmDelete(task)">删除</a-button>
                    <a-tooltip title="取消分配">
                      <a-button size="small" type="link" danger :draggable="false" @mousedown.stop @click.stop="unassignTask(task.id)">取消</a-button>
                    </a-tooltip>
                  </div>
                </div>
                <div class="task-meta">
                  <span class="task-priority" v-if="task.priority">
                    优先级：{{ task.priority }}
                  </span>
                  
                  <!-- 时间信息显示区域 -->
                  <div class="task-times" v-if="getTaskTimeDisplay(task).length > 0">
                    <span 
                      v-for="(timeItem, index) in getTaskTimeDisplay(task)" 
                      :key="index"
                      class="task-time" 
                      :class="{ 
                        overdue: timeItem.isOverdue,
                        'time-range': timeItem.type === 'range',
                        'time-start': timeItem.type === 'start',
                        'time-end': timeItem.type === 'end',
                        'time-due': timeItem.type === 'due'
                      }"
                    >
                      {{ timeItem.text }}
                    </span>
                  </div>
                  
                  <!-- 里程碑信息显示 -->
                  <span class="task-milestone" v-if="getMilestoneDisplay(task)">
                    🎯 {{ getMilestoneDisplay(task).name }}
                    <span v-if="getMilestoneDisplay(task).date" class="milestone-date">
                      ({{ getMilestoneDisplay(task).date }})
                    </span>
                  </span>
                  
                  <span class="task-assignee" :class="assigneeName(task.id) ? 'assigned' : 'unassigned'">
                    {{ assigneeName(task.id) ? ('负责人：' + assigneeName(task.id)) : '未分配' }}
                  </span>
                  <span class="task-origin" v-if="task.origin">
                    来源：{{ originText(task.origin) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col right">
        <div class="hd">
          <div class="h">人员面板</div>
          <div class="search"><a-input v-model:value="memberKeyword" placeholder="搜索成员/角色" style="width:180px" /></div>
        </div>
        <div class="list">
          <a-empty v-if="filteredMembers.length===0" description="暂无成员" />
          <div
            v-for="m in filteredMembers"
            :key="m.id"
            class="member"
            @dragover.prevent
            @dragenter.prevent="enterDrop(m.id)"
            @dragleave.prevent="leaveDrop(m.id)"
            @drop.prevent="onDropToMember(m.id)"
            :class="{ 'member--highlight': dropHighlight === m.id }"
          >
            <div class="row">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="avatar">{{ m.name?.[0] || '?' }}</span>
                <b>{{ m.name }}</b>
                <span class="pill" style="margin-left:6px">{{ m.role }}</span>
              </div>
              <div class="cap">{{ memberLoadText(m.id) }}</div>
            </div>
            <div class="load"><div class="bar" :style="{ width: memberLoadPercent(m.id) }"></div></div>
            <div class="drop">
              <span
                v-for="a in planning.getMemberAssignments(m.id)"
                :key="a.taskId"
                class="chip"
                draggable="true"
                @dragstart="onDragStartTaskInMember(m.id, a.taskId)"
                @dragover.prevent="onDragOverTaskInMember(m.id, a.taskId)"
                @drop.prevent="onDropReorder(m.id, a.taskId)"
              >
                {{ taskName(a.taskId) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

          <div class="footer">
        <div class="btns">
          <a-button type="primary" @click="goToNextStep">下一步</a-button>
        </div>
      </div>

    <a-modal v-model:open="assigneePickerVisible" title="选择负责人" :footer="null" width="520px">
      <a-input v-model:value="pickerKeyword" placeholder="搜索成员" style="margin-bottom:8px" />
      <a-list :data-source="pickerMembers">
        <template #renderItem="{ item }">
          <a-list-item style="cursor: pointer" @click="onPick(item)">
            <a-list-item-meta :title="item.name" :description="item.role" />
          </a-list-item>
        </template>
      </a-list>
    </a-modal>

    <!-- 变更提案弹窗：导入解析结果后展示差异并让用户确认 -->
    <a-modal
      v-model:open="proposal.visible"
      title="变更提案（安全合并）"
      :confirm-loading="proposal.loading"
      @ok="applyProposal"
      @cancel="closeProposal"
      width="760px"
    >
      <a-alert type="info" show-icon style="margin-bottom:12px"
        message="说明"
      >
        <template #description>
          <div>
            默认只新增，不会覆盖您的手动编辑与人员分配。您可勾选"更新/归档"以应用更多变更。
          </div>
        </template>
      </a-alert>
      <div class="proposal-summary">
        <div class="stat"><b>新增</b> {{ proposal.diff.additions.length }}</div>
        <div class="stat"><b>更新</b> {{ proposal.diff.updates.length }}</div>
        <div class="stat"><b>消失</b> {{ proposal.diff.removals.length }}</div>
      </div>
      <div class="proposal-options">
        <a-checkbox v-model:checked="proposal.options.applyAdditions">应用新增</a-checkbox>
        <a-checkbox v-model:checked="proposal.options.applyUpdates">应用更新（不覆盖您编辑过的字段）</a-checkbox>
        <a-checkbox v-model:checked="proposal.options.archiveRemovals">将消失的任务标记为归档</a-checkbox>
      </div>
      <a-tabs style="margin-top:8px">
        <a-tab-pane :key="'add'" :tab="`新增(${proposal.diff.additions.length})`">
          <a-list :data-source="proposal.diff.additions.slice(0,8)" :locale="{emptyText: '无新增'}">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.name" :description="item.phaseId ? '阶段：'+item.phaseId : ''" />
              </a-list-item>
            </template>
          </a-list>
          <div v-if="proposal.diff.additions.length>8" class="more-hint">仅展示前 8 条</div>
        </a-tab-pane>
        <a-tab-pane :key="'upd'" :tab="`更新(${proposal.diff.updates.length})`">
          <a-list :data-source="proposal.diff.updates.slice(0,8)" :locale="{emptyText: '无更新'}">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.after?.name || item.before?.name" :description="item.after?.phaseId || item.before?.phaseId" />
              </a-list-item>
            </template>
          </a-list>
          <div v-if="proposal.diff.updates.length>8" class="more-hint">仅展示前 8 条</div>
        </a-tab-pane>
        <a-tab-pane :key="'del'" :tab="`消失(${proposal.diff.removals.length})`">
          <a-list :data-source="proposal.diff.removals.slice(0,8)" :locale="{emptyText: '无消失'}">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.name" :description="item.phaseId" />
              </a-list-item>
            </template>
          </a-list>
          <div v-if="proposal.diff.removals.length>8" class="more-hint">仅展示前 8 条</div>
        </a-tab-pane>
      </a-tabs>
      <template #footer>
        <a-button @click="closeProposal">取消</a-button>
        <a-button type="primary" :loading="proposal.loading" @click="applyProposal">应用所选</a-button>
      </template>
    </a-modal>
  </div>
  <!-- 编辑抽屉（放在根模板同级，避免嵌套模态冲突） -->
  <a-modal v-model:open="edit.visible" :title="edit.target ? '编辑任务' : '新增任务'" width="820px">
    <a-form layout="vertical">
      <a-row :gutter="12">
        <a-col :span="14">
          <a-form-item label="任务名称">
            <a-input v-model:value="edit.form.name" placeholder="请输入任务名称" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="优先级">
            <a-select
              v-model:value="edit.form.priority"
              placeholder="选择优先级"
              style="width:100%"
            >
              <a-select-option value="高">高</a-select-option>
              <a-select-option value="中">中</a-select-option>
              <a-select-option value="低">低</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="任务详情">
        <div class="rte-toolbar">
          <a-space size="small">
            <a-button size="small" @click="rteCmd('bold')">加粗</a-button>
            <a-button size="small" @click="rteCmd('italic')">斜体</a-button>
            <a-button size="small" @click="rteCmd('underline')">下划线</a-button>
            <a-button size="small" @click="rteCmd('insertUnorderedList')">• 列表</a-button>
            <a-button size="small" @click="rteCmd('insertOrderedList')">1. 列表</a-button>
            <a-button size="small" @click="rteClear">清除格式</a-button>
          </a-space>
        </div>
        <div ref="rteRef" class="rte-editor" contenteditable="true" :placeholder="'请输入任务详情，支持基本富文本样式'" @input="syncRte" />
      </a-form-item>
      <a-form-item label="主里程碑">
        <a-select ref="msSelectRef" v-model:value="edit.form.primaryMilestoneId" allow-clear placeholder="可为空">
          <a-select-option v-for="ms in planning.milestones" :key="ms.id" :value="ms.id">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
              <span>{{ ms.id }} - {{ ms.name }}</span>
              <a-button type="link" size="small" danger @click.stop="confirmRemoveMs(ms.id)">删除</a-button>
            </div>
          </a-select-option>
        </a-select>
        <div class="form-hint" style="color:#8c8c8c;font-size:12px;margin-top:6px">下拉为空？在下方输入"新里程碑名称 + 计划时间"，点击"新增"即可添加。</div>
        <div style="margin-top:6px">
          <a-input-group compact>
            <a-input v-model:value="newMs.name" placeholder="新里程碑名称" style="width: 60%" />
            <a-date-picker v-model:value="newMs.date" value-format="YYYY-MM-DD" placeholder="计划时间" style="width: 30%" />
            <a-button type="dashed" style="width:10%" @click="createMs">新增</a-button>
          </a-input-group>
        </div>
      </a-form-item>
      
      <a-form-item label="任务附件">
        <a-upload
          :before-upload="beforeAttachUpload"
          :on-remove="onAttachRemove"
          :file-list="edit.attachFiles"
          :multiple="true"
          list-type="text"
        >
          <a-button type="dashed">选择文件</a-button>
        </a-upload>
        <div class="form-hint" style="color:#8c8c8c;margin-top:6px">不自动上传，保存后保存在本地草稿（名称、大小、预览URL）。</div>
      </a-form-item>
      <a-form-item label="起止时间（选其一）">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <a-date-picker v-model:value="edit.form.startDate" value-format="YYYY-MM-DD" placeholder="开始日期" />
          <span>→</span>
          <a-date-picker v-model:value="edit.form.endDate" value-format="YYYY-MM-DD" placeholder="结束日期" />
          <a-date-picker v-model:value="edit.form.dueDate" value-format="YYYY-MM-DD" placeholder="或 截止日期" />
        </div>
      </a-form-item>
      <a-form-item label="优先级">
        <a-select v-model:value="edit.form.priority" allow-clear>
          <a-select-option value="高">高</a-select-option>
          <a-select-option value="中">中</a-select-option>
          <a-select-option value="低">低</a-select-option>
        </a-select>
      </a-form-item>
      <a-collapse style="margin-top:4px">
        <a-collapse-panel key="rtpl" header="提报模板设置">
          <a-form-item label="快速选择模板">
            <a-select v-model:value="edit.reportTemplateId" style="width:100%" placeholder="选择模板（默认自动带出）" @change="onPickTpl">
              <a-select-option v-for="tpl in planning.listReportTemplates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</a-select-option>
            </a-select>
            <div class="form-hint" style="color:#8c8c8c;margin-top:6px">默认模板：{{ planning.getDefaultReportTemplate()?.name || '未设置' }}</div>
          </a-form-item>
          <div style="margin-bottom:8px">
            <a-button type="link" @click="openTplMgr">管理模板（前端）</a-button>
          </div>
          <a-form-item label="模板标题">
            <a-input v-model:value="edit.reportTemplate.title" placeholder="例如：阶段汇报模板" />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="edit.reportTemplate.requireAttachment">提交时必须上传附件</a-checkbox>
          </a-form-item>
          <div style="margin-bottom:6px;font-weight:600">模板分段（标题/是否必填）</div>
          <a-list :data-source="edit.reportTemplate.sections" :locale="{emptyText:'暂无分段'}">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <div style="display:flex;gap:8px;width:100%">
                  <a-input v-model:value="item.title" placeholder="分段标题（如：工作内容、问题与建议）" />
                  <a-checkbox v-model:checked="item.required">必填</a-checkbox>
                  <a-button danger @click="removeTplSection(index)" size="small">删除</a-button>
                </div>
              </a-list-item>
            </template>
          </a-list>
          <a-button type="dashed" size="small" @click="addTplSection">新增分段</a-button>
          <div class="form-hint" style="color:#8c8c8c;margin-top:6px">被分配人将在工作台看到此模板，并按分段填写。</div>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
    <template #footer>
      <a-button @click="edit.visible=false">取消</a-button>
      <a-button type="primary" @click="saveEdit">保存</a-button>
    </template>
  </a-modal>

  <!-- 模板管理（纯前端） -->
  <a-modal v-model:open="tplMgr.visible" title="提报模板管理（本地）" width="720px">
    <div style="margin-bottom:10px">
      <a-button type="dashed" @click="addNewTpl">新增模板</a-button>
    </div>
    <a-list :data-source="planning.listReportTemplates" :locale="{emptyText:'暂无模板'}">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta :title="item.name" :description="item.id" />
          <template #actions>
            <a-button size="small" type="link" @click="setAsDefault(item.id)" :disabled="planning.defaultReportTemplateId===item.id">设为默认</a-button>
            <a-button size="small" type="link" @click="editTpl(item)">编辑</a-button>
            <a-button size="small" type="link" danger @click="removeTpl(item.id)">删除</a-button>
          </template>
        </a-list-item>
      </template>
    </a-list>
    <template #footer>
      <a-button @click="tplMgr.visible=false">关闭</a-button>
    </template>
  </a-modal>


</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { usePlanningStore } from '@/store/planning'
import { useTeamMembersStore } from '@/stores/teamMembers'

// 定义属性
const props = defineProps({
  extractedTasks: {
    type: Object,
    default: () => ({ implementation: [], technical: [], milestones: [] })
  },
  analysisData: {
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['next-step'])

const planning = usePlanningStore()
const membersStore = useTeamMembersStore()

// 展示统计
const totalTasks = computed(() => planning.totalTasks)
const unassignedCount = computed(() => planning.unassignedCount)
const assignedCount = computed(() => totalTasks.value - unassignedCount.value)
const involvedMilestoneCount = computed(() => planning.involvedMilestoneCount)

// 统计未计划时间的任务数量
const unsetTimeCount = computed(() => {
  return planning.tasks.filter(task => {
    // 检查是否缺少时间设置（开始时间、结束时间或截止时间）
    return !task.startDate && !task.endDate && !task.dueDate
  }).length
})

// 统计未设置里程碑的任务数量
const unsetMilestoneCount = computed(() => {
  return planning.tasks.filter(task => {
    // 检查是否未关联里程碑
    return !task.primaryMilestoneId
  }).length
})

// 统计已设置时间的任务数量
const setTimeCount = computed(() => {
  return planning.tasks.filter(task => {
    // 检查是否设置了时间（开始时间、结束时间或截止时间中的任意一个）
    return task.startDate || task.endDate || task.dueDate
  }).length
})

// 统计已设置里程碑的任务数量
const setMilestoneCount = computed(() => {
  return planning.tasks.filter(task => {
    // 检查是否已关联里程碑
    return !!task.primaryMilestoneId
  }).length
})
const coverageText = computed(() => {
  const total = planning.totalTasks
  const assigned = total - planning.unassignedCount
  if (total === 0) return '0%'
  return Math.round((assigned / total) * 100) + '%'
})

// 筛选
const activeFilter = ref('all')
const setFilter = (f) => { activeFilter.value = f }
// 新筛选UI状态
const filterMode = ref('all') // all | phase | mile | unassigned
const filterValue = ref('')

const taskKeywordRaw = ref('')
const taskKeyword = ref('')
// 200ms 防抖
let kwTimer = null
watch(taskKeywordRaw, (v) => {
  if (kwTimer) clearTimeout(kwTimer)
  kwTimer = setTimeout(() => { taskKeyword.value = v }, 200)
})
// 扁平化筛选后的任务列表（按时间排序）
const filteredTasks = computed(() => {
  const assignedIds = new Set(planning.assignments.map(a => a.taskId))
  const kw = taskKeyword.value.toLowerCase()
  
  // 筛选任务
  let filtered = planning.tasks.filter(t => {
    // 状态筛选
    if (activeFilter.value === 'unassigned') {
      if (assignedIds.has(t.id)) return false
    } else if (activeFilter.value === 'assigned') {
      if (!assignedIds.has(t.id)) return false
    } else if (activeFilter.value === 'no_time') {
      // 筛选未计划时间的任务
      if (t.startDate || t.endDate || t.dueDate) return false
    } else if (activeFilter.value === 'has_time') {
      // 筛选已设置时间的任务
      if (!t.startDate && !t.endDate && !t.dueDate) return false
    } else if (activeFilter.value === 'no_milestone') {
      // 筛选未设置里程碑的任务
      if (t.primaryMilestoneId) return false
    } else if (activeFilter.value === 'has_milestone') {
      // 筛选已设置里程碑的任务
      if (!t.primaryMilestoneId) return false
    }
    
    // 搜索筛选
    if (!kw) return true
    return (t.name || '').toLowerCase().includes(kw)
  })
  
  // 排序：有截止时间的任务按时间从近到远，无时间的新任务在上老任务在下
  return filtered.sort((a, b) => {
    // 有截止时间的任务优先
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    
    // 都有截止时间，按时间从近到远
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    
    // 都没有截止时间，新任务在上（按创建时间倒序）
    const aTime = a.createdAt || a.id
    const bTime = b.createdAt || b.id
    return bTime.localeCompare(aTime)
  })
})

// 清理废弃的阶段相关代码已移除

// 成员列表
const memberKeyword = ref('')
const filteredMembers = computed(() => {
  const kw = memberKeyword.value.trim().toLowerCase()
  return membersStore.activeMembers.filter(m => {
    if (!kw) return true
    return (m.name || '').toLowerCase().includes(kw) || (m.role || '').toLowerCase().includes(kw)
  })
})

// 负载显示（简化：按分配任务数/10 计算）
const getAssignedCount = (memberId) => planning.getMemberAssignments(memberId).length
const memberLoadText = (memberId) => {
  const count = getAssignedCount(memberId)
  return `已分配 ${count} 个任务`
}
const memberLoadPercent = (memberId) => {
  const counts = membersStore.activeMembers.map(m => getAssignedCount(m.id))
  const max = Math.max(1, ...counts)
  const my = getAssignedCount(memberId)
  return Math.min(100, Math.round((my / max) * 100)) + '%'
}

// 阶段下拉（AutoComplete）选项：合并现有阶段 + 本次保存后新增阶段
const customPhases = ref([])
const phaseOptions = computed(() => {
  const arr = Array.from(new Set([...(planning.phaseFilters || []), ...customPhases.value]))
  return arr.map(p => ({ value: p }))
})

const addPhaseIfNeeded = (val) => {
  const p = (val || '').trim()
  if (!p) return
  if (!customPhases.value.includes(p)) customPhases.value.push(p)
}
// 阶段相关函数已移除

// 任务-成员 操作
const taskName = (taskId) => planning.tasks.find(t => t.id === taskId)?.name || taskId
const assigneeName = (taskId) => {
  const memberId = planning.getTaskAssignee(taskId)
  if (!memberId) return ''
  const m = membersStore.activeMembers.find(x => x.id === memberId)
  return m?.name || memberId
}

// ========== 阶段分组与排序 ==========
const getTaskTime = (t) => {
  const parse = (d) => {
    if (!d) return null
    // 支持 dayjs/moment 对象、字符串(YYYY-MM-DD) 与 Date
    if (typeof d === 'object' && d !== null) {
      if (typeof d.toDate === 'function') {
        const dd = d.toDate()
        return isNaN(dd.getTime()) ? null : dd
      }
      if (d instanceof Date) return isNaN(d.getTime()) ? null : d
    }
    const date = new Date(d)
    return isNaN(date.getTime()) ? null : date
  }
  const sd = parse(t.startDate)
  const ed = parse(t.endDate)
  const dd = parse(t.dueDate)
  return { sd, ed, dd }
}

// 阶段显示函数已移除

const buildPhaseList = (tasks) => {
  const byPhase = new Map()
  tasks.forEach(t => {
    const pid = t.phaseId || '__NO_PHASE__'
    if (!byPhase.has(pid)) byPhase.set(pid, [])
    byPhase.get(pid).push(t)
  })
  const phases = []
  byPhase.forEach((list, pid) => {
    // 阶段时间：取最早的 start/due/end
    let earliest = null
    list.forEach(t => {
      const { sd, ed, dd } = getTaskTime(t)
      const candidates = [sd, dd, ed].filter(Boolean)
      candidates.forEach(d => { if (!earliest || d < earliest) earliest = d })
    })
    const displayName = pid === '__NO_PHASE__' ? '未设定阶段' : phaseDisplayName(pid)
    const timeSummary = earliest ? earliest.toLocaleDateString() : ''
    // 阶段内任务排序：时间近->远，无时间最后；同等按优先级与 order
    const priorityWeight = (p) => p === '高' ? 3 : p === '中' ? 2 : p === '低' ? 1 : 0
    const sortedTasks = list.slice().sort((a, b) => {
      const ta = getTaskTime(a)
      const tb = getTaskTime(b)
      const fa = ta.sd || ta.dd || ta.ed
      const fb = tb.sd || tb.dd || tb.ed
      if (fa && fb) return fa - fb || priorityWeight(b.priority) - priorityWeight(a.priority) || (a.order||0) - (b.order||0)
      if (fa && !fb) return -1
      if (!fa && fb) return 1
      return priorityWeight(b.priority) - priorityWeight(a.priority) || (a.order||0) - (b.order||0)
    })
    phases.push({ id: pid, displayName, timeSummary, earliest, tasks: sortedTasks })
  })
  // 阶段排序：近->远；未设定时间最后
  phases.sort((a, b) => {
    if (a.earliest && b.earliest) return a.earliest - b.earliest
    if (a.earliest && !b.earliest) return -1
    if (!a.earliest && b.earliest) return 1
    return a.displayName.localeCompare(b.displayName)
  })
  return phases
}

const groupedPhases = computed(() => buildPhaseList(filteredTasks.value))

// 阶段折叠与时间摘要
const collapsedPhases = ref(new Set())
const togglePhase = (pid) => {
  const s = collapsedPhases.value
  if (s.has(pid)) {
    s.delete(pid)
  } else {
    s.add(pid)
  }
  collapsedPhases.value = new Set(s)
}
const isPhaseCollapsed = (pid) => collapsedPhases.value.has(pid)
const taskTimeSummary = (t) => {
  const { sd, ed, dd } = getTaskTime(t)
  if (sd && ed) return `${sd.toLocaleDateString()} ~ ${ed.toLocaleDateString()}`
  if (dd) return `至 ${dd.toLocaleDateString()}`
  if (sd) return `${sd.toLocaleDateString()}`
  return ''
}

// 优化的任务时间显示方法（支持多种时间组合）
const getTaskTimeDisplay = (task) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  // 格式化日期显示
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch {
      return dateStr
    }
  }
  
  const timeItems = []
  
  // 处理时间区间（开始时间 -> 结束时间）
  if (task.startDate && task.endDate) {
    const isOverdue = task.endDate < today
    const startFormatted = formatDate(task.startDate)
    const endFormatted = formatDate(task.endDate)
    const timeRange = `${startFormatted} ~ ${endFormatted}`
    timeItems.push({
      text: isOverdue ? `⚠️ ${timeRange} (已逾期)` : `📅 ${timeRange}`,
      type: 'range',
      isOverdue
    })
  } else {
    // 单独处理开始时间
    if (task.startDate) {
      const startFormatted = formatDate(task.startDate)
      timeItems.push({
        text: `🚀 ${startFormatted} 开始`,
        type: 'start',
        isOverdue: false
      })
    }
    
    // 单独处理结束时间
    if (task.endDate) {
      const isOverdue = task.endDate < today
      const endFormatted = formatDate(task.endDate)
      timeItems.push({
        text: isOverdue ? `⚠️ 结束 ${endFormatted} (已逾期)` : `🏁 结束 ${endFormatted}`,
        type: 'end',
        isOverdue
      })
    }
  }
  
  // 处理截止时间（独立于时间区间）
  if (task.dueDate) {
    const isOverdue = task.dueDate < today
    const dueFormatted = formatDate(task.dueDate)
    const dueText = `截止 ${dueFormatted}`
    timeItems.push({
      text: isOverdue ? `⚠️ ${dueText} (已逾期)` : `⏰ ${dueText}`,
      type: 'due',
      isOverdue
    })
  }
  
  return timeItems
}

// 获取里程碑显示信息
const getMilestoneDisplay = (task) => {
  if (!task.primaryMilestoneId) return null
  
  const milestone = planning.milestones.find(m => m.id === task.primaryMilestoneId)
  if (!milestone) return null
  
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    } catch {
      return dateStr
    }
  }
  
  return {
    name: milestone.name,
    date: milestone.plannedDate ? formatDate(milestone.plannedDate) : null,
    id: milestone.id
  }
}

const originText = (origin) => {
  if (!origin) return ''
  const map = { verbatim: '原文', inferred: '推理', generated: '生成' }
  const base = map[origin.type] || origin.type
  if (origin.confidence) return `${base} 置信度${Math.round(origin.confidence*100)}%`
  return base
}

const assigneePickerVisible = ref(false)
const pickerForTask = ref(null)
const pickerKeyword = ref('')
const pickerMembers = computed(() => {
  const kw = pickerKeyword.value.trim().toLowerCase()
  return membersStore.activeMembers.filter(m => !kw || (m.name||'').toLowerCase().includes(kw))
})
const pickAssignee = (task) => {
  pickerForTask.value = task
  assigneePickerVisible.value = true
}
const onPick = (member) => {
  if (!pickerForTask.value) return
  const success = planning.assignTaskToMember(pickerForTask.value.id, member.id)
  assigneePickerVisible.value = false
  if (success) {
    message.success(`✅ 已将"${pickerForTask.value.name}"分配给 ${member.name}`, 3)
    // 添加视觉反馈效果
    addAssignmentFeedback(pickerForTask.value.id)
  } else {
    message.error('分配失败，请重试')
  }
}

const unassignTask = (taskId) => {
  planning.unassignTask(taskId)
  message.success('已取消分配')
}

// 添加任务分配成功的视觉反馈
const addAssignmentFeedback = (taskId) => {
  // 查找任务元素并添加短暂的高亮效果
  setTimeout(() => {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`)
    if (taskElement) {
      taskElement.style.transition = 'all 0.5s ease'
      taskElement.style.backgroundColor = '#f6ffed'
      taskElement.style.boxShadow = '0 0 8px rgba(82, 196, 26, 0.5)'
      setTimeout(() => {
        taskElement.style.backgroundColor = ''
        taskElement.style.boxShadow = ''
      }, 2000)
    }
  }, 100)
}

// 草稿功能已移除，采用实时保存机制
// 下一步：跳转到进展监控步骤
const goToNextStep = () => {
  // 检查是否有未分配任务，给出提示但不强制阻止
  if (planning.unassignedCount > 0) {
    Modal.confirm({
      title: '存在未分配任务',
      content: `当前还有 ${planning.unassignedCount} 个任务未分配给团队成员。是否要在未完成分配的情况下进入下一步？`,
      okText: '继续下一步',
      cancelText: '返回分配',
      onOk: () => {
        // 先保存当前草稿
        planning.saveToLocal()
        // 通知父组件切换到下一步
        emit('next-step', 4) // 跳转到第4步：进展监控
        message.success('已进入：进展监控')
      }
    })
  } else {
    // 所有任务已分配，直接进入下一步
    planning.saveToLocal()
    emit('next-step', 4)
    message.success('任务分配完成，已进入：进展监控')
  }
}

// 导入与示例数据
const importFromAnalysis = () => {
  try {
    // 从 localStorage 或全局窗口中尝试读取解析结果
    // 优先：window.__doubaoResults / __analysisData（调试注入）
    const win = typeof window !== 'undefined' ? window : {}
    let doubao = win.__doubaoResults
    let analysis = win.__analysisData
    if (!doubao) {
      const raw = localStorage.getItem('doubaoAnalysisResults')
      if (raw) doubao = JSON.parse(raw)
    }
    if (!analysis) {
      const raw2 = localStorage.getItem('analysisData')
      if (raw2) analysis = JSON.parse(raw2)
    }
    if (!doubao && !analysis) {
      message.warning('未找到解析结果，请先在解析页完成数据粘贴/保存')
      return
    }
    // 生成任务与里程碑（简化映射：从实施方案/技术路线提取）
    const { tasks, milestones } = generateFromAnalysis(doubao, analysis)
    // 预览差异并确认
    const diff = planning.previewMerge(tasks)
    // 打开提案窗口
    proposal.visible = true
    proposal.loading = false
    proposal.sourceTasks = tasks
    proposal.milestones = milestones
    proposal.schedule = analysis?.schedule || ''
    proposal.diff = diff
    proposal.options = { applyAdditions: true, applyUpdates: false, archiveRemovals: false }
  } catch (e) {
    console.error(e)
    message.error('导入失败，请检查数据结构')
  }
}

const initWithSamples = () => {
  const tasks = [
    { id:'T001', name:'铁泥物相组成及物化性质分析', phaseId:'阶段A', estimate:5, priority:'高', primaryMilestoneId:'M001', origin:{type:'verbatim', confidence:0.9} },
    { id:'T002', name:'溶剂热法改性及效能评价', phaseId:'阶段B', estimate:8, priority:'中', primaryMilestoneId:'M002', origin:{type:'inferred', confidence:0.6} },
    { id:'T003', name:'Co-Fe/SiO₂物理化学性质分析报告', phaseId:'阶段C', estimate:3, priority:'低', primaryMilestoneId:'M003', origin:{type:'generated'} }
  ]
  const milestones = [
    { id:'M001', name:'里程碑A', plannedDate:'2025-03-31', criteria:['提交阶段A报告'] },
    { id:'M002', name:'里程碑B', plannedDate:'2025-06-30', criteria:['完成中试评估'] },
    { id:'M003', name:'里程碑C', plannedDate:'2025-09-30', criteria:['形成最终技术报告'] }
  ]
  planning.setData({ tasks, milestones, assignments: [], draftPlan: { totalDuration: '9个月', milestones: milestones.map(m => ({ name:m.name, plannedDate:m.plannedDate, criteria:m.criteria })) } })
  message.success('已载入示例数据')
}

const generateFromAnalysis = (doubao, analysis) => {
  const tasks = []
  const milestones = []
  // 技术路线 phases → 任务（名称、主要任务/交付物转为描述，这里仅取名称）
  try {
    // 支持两种结构：
    // 1) doubao.technicalRoute = { phases: [...] }
    // 2) analysis.technicalRoute 为 JSON 字符串或对象
    let tr = null
    if (doubao && doubao.technicalRoute) tr = doubao.technicalRoute
    else if (analysis && analysis.technicalRoute) tr = typeof analysis.technicalRoute === 'string' ? JSON.parse(analysis.technicalRoute) : analysis.technicalRoute
    if (tr && Array.isArray(tr.phases)) {
      tr.phases.forEach((p, idx) => {
        const phaseName = p?.name || p?.phaseName || `阶段${idx+1}`
        const items = Array.isArray(p?.tasks) ? p.tasks : Array.isArray(p?.mainTasks) ? p.mainTasks : []
        items.forEach((it, j) => {
          const name = typeof it === 'string' ? it : (it?.name || it?.task || `${phaseName}-任务${j+1}`)
          tasks.push({
            id: `TR-${idx+1}-${j+1}`,
            name,
            phaseId: phaseName,
            estimate: typeof it === 'object' ? (it?.estimateDays || undefined) : undefined,
            priority: typeof it === 'object' ? (it?.priority || undefined) : undefined,
            origin: { type: 'verbatim' }
          })
        })
      })
    }
  } catch {}
  // 实施方案 phases → 任务 + 里程碑
  try {
    // 支持三种结构：
    // 1) doubao.implementation.implementationPlan = { phases: [...] }
    // 2) doubao.implementation = { phases: [...] }
    // 3) analysis.implementationPlan 为 JSON 字符串或对象（可能直接就是 implementationPlan 或包含该字段）
    let implPlan = null
    if (doubao && doubao.implementation) {
      if (doubao.implementation.implementationPlan) implPlan = doubao.implementation.implementationPlan
      else if (doubao.implementation.phases) implPlan = doubao.implementation
    } else if (analysis && analysis.implementationPlan) {
      const parsed = typeof analysis.implementationPlan === 'string' ? JSON.parse(analysis.implementationPlan) : analysis.implementationPlan
      implPlan = parsed?.implementationPlan ? parsed.implementationPlan : parsed
    }
    if (implPlan && Array.isArray(implPlan.phases)) {
      implPlan.phases.forEach((p, idx) => {
        const phaseName = p?.name || p?.phaseName || `阶段${idx+1}`
        const items = Array.isArray(p?.activities) ? p.activities : []
        items.forEach((it, j) => {
          const name = typeof it === 'string' ? it : (it?.name || it?.activity || `${phaseName}-活动${j+1}`)
          tasks.push({
            id: `IM-${idx+1}-${j+1}`,
            name,
            phaseId: phaseName,
            estimate: typeof it === 'object' ? (it?.estimateDays || undefined) : undefined,
            priority: typeof it === 'object' ? (it?.priority || undefined) : undefined,
            origin: { type: 'verbatim' }
          })
        })
        const ms = Array.isArray(p?.milestones) ? p.milestones : []
        ms.forEach((m, k) => {
          const id = `M-${idx+1}-${k+1}`
          const mName = typeof m === 'string' ? m : (m?.name || `阶段${idx+1}-里程碑${k+1}`)
          const plannedDate = typeof m === 'object' ? m?.plannedDate : undefined
          const criteria = typeof m === 'object' ? (m?.criteria || []) : []
          milestones.push({ id, name: mName, plannedDate, criteria })
          if (k === 0) {
            tasks.forEach(t => { if (t.phaseId === phaseName && !t.primaryMilestoneId) t.primaryMilestoneId = id })
          }
        })
      })
    }
  } catch {}
  return { tasks, milestones }
}

// ========== 变更提案状态与方法 ==========
/**
 * 变更提案的本地状态，用于让用户选择是否应用"更新/归档"。
 * 默认策略：仅新增（applyAdditions=true）。
 */
const proposal = ref({
  visible: false,
  loading: false,
  sourceTasks: [],
  milestones: [],
  schedule: '',
  diff: { additions: [], updates: [], removals: [] },
  options: { applyAdditions: true, applyUpdates: false, archiveRemovals: false }
})

const closeProposal = () => { proposal.value.visible = false }

const applyProposal = async () => {
  try {
    proposal.value.loading = true
    const opts = proposal.value.options
    planning.mergeBaseline(proposal.value.sourceTasks, { ...opts, useNameDedup: true })
    // 里程碑：仅在草稿为空时初始化，避免覆盖
    if (Array.isArray(proposal.value.milestones) && proposal.value.milestones.length > 0) {
      if (!planning.draftPlan?.milestones || planning.draftPlan.milestones.length === 0) {
        planning.draftPlan = {
          totalDuration: proposal.value.schedule || '',
          milestones: proposal.value.milestones.map(m => ({ name:m.name, plannedDate:m.plannedDate, criteria:m.criteria }))
        }
      }
    }
    message.success('已应用变更：新增/更新/归档按选择生效，您的编辑与分配已保留')
    proposal.value.visible = false
  } catch (err) {
    console.error(err)
    message.error('应用变更失败')
  } finally {
    proposal.value.loading = false
  }
}

// ========== 任务编辑：打开/保存 ==========
const edit = ref({ visible: false, target: null, form: { name: '', description: '', primaryMilestoneId: '', priority: undefined, startDate: '', endDate: '', dueDate: '' }, attachFiles: [], reportTemplateId: '', reportTemplate: { title: '', requireAttachment: false, sections: [] } })
// 富文本编辑器
const rteRef = ref(null)
const rteCmd = (cmd) => document.execCommand(cmd, false)
const rteClear = () => document.execCommand('removeFormat', false)
const syncRte = () => { if (rteRef.value) edit.value.form.description = rteRef.value.innerHTML }
const phaseInputRef = ref(null)

// 附件本地接入（不上传）
const beforeAttachUpload = (file) => {
  const url = URL.createObjectURL(file)
  edit.value.attachFiles.push({ uid: file.uid, name: file.name, size: file.size, type: file.type, url })
  return false
}
const onAttachRemove = (file) => {
  const idx = edit.value.attachFiles.findIndex(f => f.uid === file.uid)
  if (idx >= 0) {
    try { URL.revokeObjectURL(edit.value.attachFiles[idx].url) } catch {}
    edit.value.attachFiles.splice(idx, 1)
  }
}

// 提报模板编辑
const addTplSection = () => { edit.value.reportTemplate.sections.push({ title: '', required: false }) }
const removeTplSection = (idx) => { if (idx>=0) edit.value.reportTemplate.sections.splice(idx,1) }
const newMs = ref({ name: '', date: '' })
const createMs = () => {
  if (!newMs.value.name) return message.warning('请输入里程碑名称')
  const id = `M-${Date.now()}`
  planning.addMilestone({ id, name: newMs.value.name, plannedDate: newMs.value.date })
  edit.value.form.primaryMilestoneId = id
  message.success('已新增里程碑并选中')
  newMs.value = { name: '', date: '' }
}

const msSelectRef = ref()
const confirmRemoveMs = (id) => {
  Modal.confirm({
    title: '确认删除该里程碑？',
    content: '删除后不会影响历史任务记录，但当前表单如选中该里程碑将自动清空。',
    onOk: () => {
      const ok = planning.removeMilestone(id)
      if (ok && edit.value.form.primaryMilestoneId === id) edit.value.form.primaryMilestoneId = ''
      if (ok) message.success('已删除里程碑')
      // 关闭下拉，避免遮挡导致无法点击
      try { msSelectRef.value?.blur?.() } catch {}
    }
  })
}

const openEdit = (task) => {
  edit.value.visible = true
  edit.value.target = task
  edit.value.form = { name: task.name, description: task.description || '', primaryMilestoneId: task.primaryMilestoneId, priority: task.priority, startDate: task.startDate || '', endDate: task.endDate || '', dueDate: task.dueDate || '' }
  edit.value.attachFiles = (task.attachFiles || []).slice()
  // 模板优先展示任务绑定的模板，否则展示默认模板
  const boundTpl = task.reportTemplate || planning.getDefaultReportTemplate() || { title: '', requireAttachment: false, sections: [] }
  edit.value.reportTemplateId = planning.getReportTemplateById(boundTpl.id) ? boundTpl.id : (planning.getDefaultReportTemplate()?.id || '')
  edit.value.reportTemplate = JSON.parse(JSON.stringify(boundTpl))
  // 将富文本内容写入编辑器
  setTimeout(() => { if (rteRef.value) rteRef.value.innerHTML = edit.value.form.description || '' }, 0)
}

const saveEdit = () => {
  const t = edit.value.target
  if (!t) {
    // 新增
    const created = planning.addTask({
      id: `T-${Date.now()}`,
      name: edit.value.form.name,
      description: edit.value.form.description,
      priority: edit.value.form.priority,
      startDate: edit.value.form.startDate,
      endDate: edit.value.form.endDate,
      dueDate: edit.value.form.dueDate,
      // 确保新任务也有 reportTemplate
      reportTemplate: edit.value.reportTemplate
    })
    if (created) message.success('已新增任务')
    edit.value.visible = false
    return
  }
  // 编辑：保存用户覆写（保护字段）
  const sk = t.stableKey || ''
  planning.saveUserEdit(sk, { ...edit.value.form, attachFiles: edit.value.attachFiles, reportTemplate: edit.value.reportTemplate })
  
  // 关键修复：强制触发UI更新
  // 由于 Pinia 的深层响应式侦测存在延迟，我们需要强制刷新状态
  setTimeout(() => {
    // 通过重新创建 baseline 数组来强制触发所有 computed 属性的重新计算
    const currentBaseline = planning.baseline
    if (currentBaseline && currentBaseline.tasks) {
      currentBaseline.tasks = [...currentBaseline.tasks]
    }
    planning.saveToLocal()
  }, 0)
  
  edit.value.visible = false
  message.success('已保存任务编辑（字段已受保护）')
}

// ========== 归档区动作 ==========
const restore = (task) => {
  const sk = task.stableKey || ''
  planning.restoreTask(sk)
  message.success('已恢复任务')
}

// ========== 拖拽分配（简化实现） ==========
const draggingTask = ref(null)
const dropHighlight = ref(null)

const onDragStart = (task) => { draggingTask.value = task }
const onDragEnd = () => { draggingTask.value = null; dropHighlight.value = null }
const enterDrop = (memberId) => { dropHighlight.value = memberId }
const leaveDrop = (memberId) => { if (dropHighlight.value === memberId) dropHighlight.value = null }
const onDropToMember = (memberId) => {
  if (!draggingTask.value) return
  const success = planning.assignTaskToMember(draggingTask.value.id, memberId)
  const memberName = membersStore.activeMembers.find(m => m.id === memberId)?.name || memberId
  if (success) {
    message.success(`✅ 已将"${draggingTask.value.name}"拖拽分配给 ${memberName}`, 3)
    addAssignmentFeedback(draggingTask.value.id)
  } else {
    message.error('拖拽分配失败，请重试')
  }
  dropHighlight.value = null
  draggingTask.value = null
}

// 成员内排序：记录源任务与目标任务
const dragState = ref({ memberId: null, taskId: null })
const onDragStartTaskInMember = (memberId, taskId) => { dragState.value = { memberId, taskId } }
const onDragOverTaskInMember = (memberId, taskId) => { /* 仅用于允许放置 */ }
const onDropReorder = (memberId, targetTaskId) => {
  const { memberId: srcMemberId, taskId } = dragState.value || {}
  if (!taskId || srcMemberId !== memberId) return
  const ok = planning.reorderWithinMember(memberId, taskId, targetTaskId)
  if (ok) message.success('已调整顺序')
}

// 新增与归档
const openAddTask = () => {
  edit.value.visible = true
  edit.value.target = null
  edit.value.form = { name: '', description: '', primaryMilestoneId: '', priority: undefined, startDate: '', endDate: '', dueDate: '' }
  edit.value.attachFiles = []
  // 默认带出默认模板
  const tpl = planning.getDefaultReportTemplate() || { title: '', requireAttachment: false, sections: [] }
  edit.value.reportTemplateId = tpl.id || ''
  edit.value.reportTemplate = JSON.parse(JSON.stringify(tpl))
  setTimeout(() => { if (rteRef.value) rteRef.value.innerHTML = '' }, 0)
}

const onPickTpl = (id) => {
  const tpl = planning.getReportTemplateById(id)
  if (!tpl) return
  edit.value.reportTemplate = JSON.parse(JSON.stringify(tpl))
}

// 模板管理逻辑
const tplMgr = ref({ visible: false })
const openTplMgr = () => { tplMgr.value.visible = true }
const addNewTpl = () => {
  const id = `tpl-${Date.now()}`
  planning.upsertReportTemplate({ id, name: `新模板-${id.slice(-4)}`, requireAttachment: false, sections: [ { title: '内容', required: true } ] })
}
const setAsDefault = (id) => { planning.setDefaultReportTemplate(id); message.success('已设为默认模板') }
const removeTpl = (id) => { planning.removeReportTemplate(id); message.success('已删除模板') }
const editTpl = (item) => {
  Modal.confirm({
    title: '编辑模板名称',
    content: `当前：${item.name}`,
    onOk: () => {
      const name = prompt('新的模板名称', item.name)
      if (!name) return
      planning.upsertReportTemplate({ ...item, name })
      message.success('已更新模板名称')
    }
  })
}
// 归档相关代码已移除

// 字段保护相关代码已移除

// 删除操作直接调用 confirmDelete，不再需要 onMoreMenuClick



// 删除任务（带二次确认和软删除逻辑）
const confirmDelete = (task) => {
  // 检查任务是否已分配
  const isAssigned = assignments.value.some(a => a.taskId === task.id)
  
  // 模拟检查任务是否有进展报告（实际应该从后端API获取）
  const hasProgress = task.hasProgress || Math.random() > 0.7 // 模拟30%的任务有进展
  
  if (isAssigned && hasProgress) {
    // 有进展的已分配任务：软删除
    Modal.confirm({
      title: '确认删除此任务？',
      content: `
        <div>
          <p style="color: #faad14; margin-bottom: 12px;">
            ⚠️ 此任务已分配且有进展记录
          </p>
          <p style="margin-bottom: 8px;">删除后将会：</p>
          <ul style="margin-left: 20px; color: #666;">
            <li>从任务计划列表中移除</li>
            <li>在进展监控页面保持可见</li>
            <li>数据用于工作量统计</li>
          </ul>
          <p style="color: #d4380d; margin-top: 12px;">确认要删除吗？</p>
        </div>
      `,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      width: 480,
      onOk: () => {
        // 软删除：标记为已删除但保留数据
        const success = planning.softDeleteTask(task.id)
        if (success) {
          message.success('任务已移除，数据已保留用于统计')
        } else {
          message.error('删除失败，请重试')
        }
      }
    })
  } else if (isAssigned) {
    // 已分配但无进展的任务：二次确认
    Modal.confirm({
      title: '确认删除已分配的任务？',
      content: `
        <div>
          <p style="color: #faad14; margin-bottom: 12px;">
            ⚠️ 此任务已分配给团队成员
          </p>
          <p>删除后将完全移除任务和分配关系。</p>
          <p style="color: #d4380d; margin-top: 12px;">确认要删除吗？</p>
        </div>
      `,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        const success = planning.deleteTaskPermanently(task.id)
        if (success) {
          message.success('任务已删除')
        } else {
          message.error('删除失败，请重试')
        }
      }
    })
  } else {
    // 未分配任务：简单确认
    Modal.confirm({
      title: '确认删除此任务？',
      content: '未分配的任务将被永久删除。',
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        const success = planning.deleteTaskPermanently(task.id)
        if (success) {
          message.success('任务已删除')
        } else {
          message.error('删除失败，请重试')
        }
      }
    })
  }
}

// 快照相关代码已移除

// 页面初始化：尝试加载本地草稿
const tryAutoImportFromAnalysis = () => {
  try {
    const rawDoubao = localStorage.getItem('doubaoAnalysisResults')
    const rawAnalysis = localStorage.getItem('analysisData')
    if (!rawDoubao && !rawAnalysis) return false
    const doubao = rawDoubao ? JSON.parse(rawDoubao) : null
    const analysis = rawAnalysis ? JSON.parse(rawAnalysis) : null
    const { tasks, milestones } = generateFromAnalysis(doubao, analysis)
    if (!Array.isArray(tasks) || tasks.length === 0) return false
    const diff = planning.previewMerge(tasks)
    if (diff.additions.length + diff.updates.length + diff.removals.length === 0) return false
    planning.mergeBaseline(tasks, { applyAdditions: true, applyUpdates: false, archiveRemovals: false, useNameDedup: true })
    if (Array.isArray(milestones) && milestones.length > 0) {
      if (!planning.draftPlan?.milestones || planning.draftPlan.milestones.length === 0) {
        planning.draftPlan = { totalDuration: analysis?.schedule || '', milestones: milestones.map(m => ({ name:m.name, plannedDate:m.plannedDate, criteria:m.criteria })) }
      }
    }
    message.success('已从解析结果自动生成任务（默认仅新增）')
    return true
  } catch (e) {
    console.warn('自动导入解析结果失败', e)
    return false
  }
}

// 自动导入 props 传递的建议任务
// 记录已导入的任务，避免重复导入
const importedTaskIds = ref(new Set())

const autoImportFromProps = () => {
  console.log('📋 检查 props 传递的建议任务:', props.extractedTasks)
  
  if (!props.extractedTasks || 
      (!props.extractedTasks.implementation?.length && 
       !props.extractedTasks.technical?.length && 
       !props.extractedTasks.milestones?.length)) {
    console.log('⚠️ Props 中无有效任务数据')
    return false
  }
  
  const tasks = [
    ...(props.extractedTasks.implementation || []),
    ...(props.extractedTasks.technical || [])
  ]
  
  // 获取当前已存在的任务ID集合
  const existingTaskIds = new Set(planning.tasks.map(t => t.id))
  
  // 筛选出尚未导入的新任务
  const newTasks = tasks.filter(task => {
    return !existingTaskIds.has(task.id) && !importedTaskIds.value.has(task.id)
  })
  
  if (newTasks.length === 0) {
    console.log('✅ 所有任务已导入，跳过重复导入')
    return true
  }
  
  console.log(`🔄 开始导入 ${newTasks.length} 个新任务（跳过 ${tasks.length - newTasks.length} 个已存在任务）`)
  
  // 导入新任务
  newTasks.forEach(task => {
    planning.addTask({
      id: task.id,
      name: task.name,
      description: task.description || '',
      priority: task.priority || 'medium',
      duration: task.duration,
      deliverables: task.deliverables,
      difficulty: task.difficulty,
      keyTechnologies: task.keyTechnologies || [],
      origin: { type: 'verbatim' },
      primaryMilestoneId: task.primaryMilestoneId
    })
    
    // 记录已导入的任务ID
    importedTaskIds.value.add(task.id)
  })
  
  // 导入里程碑
  const milestones = props.extractedTasks.milestones || []
  milestones.forEach(milestone => {
    planning.addMilestone({
      id: milestone.id,
      name: milestone.name,
      description: milestone.description || '',
      plannedDate: milestone.plannedDate,
      status: 'pending',
      criteria: milestone.criteria || []
    })
  })
  
  console.log(`✅ 成功导入 ${newTasks.length} 个新任务`)
  
  if (newTasks.length > 0) {
    message.success(`已导入 ${newTasks.length} 个新任务${milestones.length > 0 ? ` 和 ${milestones.length} 个里程碑` : ''}`)
  }
  return true
}

// 处理数据导入的统一方法
const handleDataImport = () => {
  console.log('🚀 TaskPlanning 数据导入检查...')
  
  // 优先检查 props 传递的建议任务
  const importedFromProps = autoImportFromProps()
  if (importedFromProps) {
    console.log('✅ 已从 props 成功导入任务，跳过其他数据源')
    // 清除可能存在的旧localStorage数据，避免冲突
    try {
      localStorage.removeItem('planning.v1')
      console.log('🗑️ 已清除旧的planning草稿数据，避免冲突')
    } catch (e) {
      console.warn('清除旧数据失败:', e)
    }
    return true // 成功从 props 导入
  }
  
  console.log('📋 Props 中无任务数据，尝试加载本地草稿...')
  
  const loaded = planning.loadFromLocal()
  if (loaded) {
    console.log('📂 成功加载本地草稿数据')
    // 如果草稿为空，仍尝试从解析结果导入
    if (!planning.tasks || planning.tasks.length === 0) {
      console.log('⚠️ 本地草稿为空，尝试从localStorage解析结果导入...')
      const ok = tryAutoImportFromAnalysis()
      if (!ok) message.info('当前暂无任务，请点击"导入→从解析结果导入"或"使用示例数据"')
    } else {
      console.log(`✅ 从本地草稿恢复了 ${planning.tasks.length} 个任务`)
      message.success('已从本地草稿恢复')
    }
    return true
  }
  
  console.log('📂 无本地草稿，尝试从localStorage解析结果导入...')
  // 无草稿则尝试自动导入
  const ok = tryAutoImportFromAnalysis()
  if (!ok) {
    console.log('⚠️ 无任何数据源可用')
    message.info('当前暂无任务，请点击"导入→从解析结果导入"或"使用示例数据"')
  }
  return ok
}

// 监听props变化，当有新的解析任务传入时自动导入
watch(() => props.extractedTasks, (newExtractedTasks) => {
  console.log('👀 检测到 extractedTasks props 变化:', newExtractedTasks)
  
  if (newExtractedTasks && 
      (newExtractedTasks.implementation?.length > 0 || 
       newExtractedTasks.technical?.length > 0 || 
       newExtractedTasks.milestones?.length > 0)) {
    console.log('🔄 Props 数据更新，重新导入任务...')
    const success = autoImportFromProps()
    if (success) {
      console.log('🎉 Props 数据更新导入成功！')
      // 清除旧数据
      try {
        localStorage.removeItem('planning.v1')
        console.log('🗑️ 已清除旧的planning草稿数据')
      } catch (e) {
        console.warn('清除旧数据失败:', e)
      }
    }
  }
}, { deep: true, immediate: false })

onMounted(() => {
  console.log('🚀 TaskPlanning 组件首次挂载')
  handleDataImport()
})

</script>

<style scoped>
.task-planning-page{width:100%;}

/* 统计概览区 */
.overview-section{margin-bottom:20px;}
.stats-cards{display:flex;gap:16px;justify-content:flex-start;}
.stat-card{
  background:#fff;
  border:1px solid #e6eaf2;
  border-radius:8px;
  padding:16px 20px;
  text-align:center;
  box-shadow:0 2px 8px rgba(35,79,162,0.08);
  min-width:100px;
  flex:0 0 auto;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
}
.stat-label{
  font-size:12px;
  color:#8c8c8c;
  margin-bottom:6px;
  font-weight:400;
  line-height:1.3;
  white-space:nowrap;
}
.stat-value{
  font-size:20px;
  font-weight:600;
  color:#234fa2;
  line-height:1;
  margin:0;
}
.filters{display:flex;gap:8px;margin:8px 0}
.main{display:flex;gap:12px;margin-top:16px}
.col{background:#fff;border:1px solid #e6eaf2;border-radius:12px;box-shadow:0 8px 24px rgba(35,79,162,0.12);display:flex;flex-direction:column;min-height:60vh}
.col.left{flex:1.4}
.col.right{flex:1}
.col .hd{padding:12px 14px;border-bottom:1px solid #e6eaf2;display:flex;justify-content:space-between;align-items:center}
.col .hd .h{font-weight:700;color:#234fa2;white-space:nowrap;flex:0 0 auto}
.toolbar{display:flex;gap:10px;align-items:center;flex:1;justify-content:flex-end;flex-wrap:nowrap}
.chip-scroll{overflow:auto;white-space:nowrap;padding:6px 12px;border-bottom:1px dashed #e6eaf2;background:#fafcff}
.list{padding:10px;overflow:auto}
.phase-table{width:100%;border-collapse:separate;border-spacing:0 8px}
.phase-table .phase-cell{vertical-align:top;background:#fafcff;border:1px solid #e6eaf2;border-right:none;border-radius:10px 0 0 10px;padding:10px}
.phase-table .phase-cell__name{font-weight:600;color:#234fa2;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.phase-table .phase-cell__name .caret{display:inline-block;width:0;height:0;margin-right:6px;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #234fa2;transition:transform .2s}
.phase-table .phase-cell__name .caret.up{transform:rotate(180deg)}
.phase-table .phase-cell__time{color:#8c8c8c;font-size:12px}
.phase-table .phase-cell__count{color:#8c8c8c;font-size:12px;margin-top:4px}
.phase-collapsed-tip{color:#8c8c8c;text-align:center;cursor:pointer}
.phase-table .task-row td:last-child{background:#fff;border:1px solid #e6eaf2;border-left:none;border-radius:0 10px 10px 0;padding:8px}
/* 扁平化任务列表样式 */
.flat-task-list{padding:10px;overflow:auto}
.task-items{display:flex;flex-direction:column;gap:8px}
.task-item{border:1px solid #e6eaf2;border-radius:10px;padding:12px;background:#fff;cursor:move;transition:all 0.2s ease}
.task-item:hover{border-color:#234fa2;box-shadow:0 2px 8px rgba(35,79,162,0.15)}
.task-content{display:flex;flex-direction:column;gap:8px}
.task-header{display:flex;justify-content:space-between;align-items:flex-start}
.task-name{font-weight:600;color:#333;flex:1;margin-right:12px;line-height:1.4}
.task-actions{display:flex;gap:4px;align-items:center;flex-shrink:0}
.task-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12px;line-height:1.4}
.task-priority{color:#234fa2;background:#f0f5ff;border:1px solid #d6e1ff;border-radius:12px;padding:2px 8px}

/* 时间显示区域优化 */
.task-times{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.task-time{border-radius:12px;padding:2px 8px;font-family:monospace;letter-spacing:0.5px;font-size:11px;border:1px solid;white-space:nowrap}

/* 庄重的时间颜色方案 - 基于主色系 */
.task-time.time-range{color:#234fa2;background:#f0f5ff;border-color:#d6e1ff}
.task-time.time-start{color:#234fa2;background:#f0f5ff;border-color:#d6e1ff}
.task-time.time-end{color:#595959;background:#f5f5f5;border-color:#d9d9d9}
.task-time.time-due{color:#fa8c16;background:#fff9f0;border-color:#ffe7ba}
.task-time.overdue{color:#d4380d !important;background:#fff1f0 !important;border-color:#ffa39e !important}

/* 里程碑信息样式 - 更庄重的色调 */
.task-milestone{color:#234fa2;background:#f0f5ff;border:1px solid #d6e1ff;border-radius:12px;padding:2px 8px;font-weight:500;display:inline-flex;align-items:center;gap:2px}
.task-milestone .milestone-date{color:#595959;font-size:10px;font-weight:400}

.task-assignee{border-radius:12px;padding:2px 8px;border:1px solid}
.task-assignee.assigned{color:#52c41a;background:#f6ffed;border-color:#b7eb8f}
.task-assignee.unassigned{color:#d4380d;background:#fff7e6;border-color:#ffd6bf}
.task-origin{color:#8c8c8c;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:12px;padding:2px 8px}

/* 保留原有任务样式（用于其他地方） */
.task{border:1px solid #e6eaf2;border-radius:10px;padding:10px;margin-bottom:8px;background:#fff;display:grid;grid-template-columns:1fr auto;gap:8px}
.task .name{font-weight:600}
.task .meta{display:flex;gap:6px;align-items:center;font-size:12px;color:#666}
.pill{border:1px solid #e6eaf2;border-radius:999px;padding:2px 8px;font-size:12px;background:#fafbff}
.pill.blue{color:#234fa2;border-color:#d6e1ff}
.pill.red{color:#d4380d;border-color:#ffd6bf;background:#fff7e6}
.pill.green{color:#389e0d;border-color:#c2f0c2;background:#f6ffed}
.pill.assign{border-color:#e6eaf2}
.pill.assigned{color:#1d39c4;border-color:#adc6ff;background:#f0f5ff}
.pill.unassigned{color:#d4380d;border-color:#ffa39e;background:#fff1f0}
.origin{font-size:11px;border-radius:4px;padding:2px 6px;background:#f0f5ff;color:#3f5fb6;border:1px solid #d6e4ff}
.segmented-filter{display:flex;align-items:center;gap:8px}
.chip-row{width:100%;margin-top:6px}
.member{border:1px solid #e6eaf2;border-radius:10px;padding:10px;margin:10px;background:#fff}
.member.member--highlight{border-color:#4e7be6; box-shadow:0 0 0 3px rgba(78,123,230,0.15)}
.member .row{display:flex;justify-content:space-between;align-items:center}
.avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#cfd8ff,#e3ecff);display:inline-flex;align-items:center;justify-content:center;color:#2b4db8;font-weight:700}
.cap{font-size:12px;color:#666}
.load{height:6px;border-radius:999px;background:#f0f0f0;overflow:hidden;margin-top:8px}
.load .bar{height:100%;background:linear-gradient(90deg,#69c0ff,#4e7be6)}
.drop{margin-top:10px;border:1px dashed #e6eaf2;border-radius:8px;padding:8px;background:#fafcff}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #e6eaf2;border-radius:999px;padding:3px 8px;margin:4px;background:#fff;font-size:12px}
.footer{position:sticky;bottom:0;background:rgba(255,255,255,.92);backdrop-filter:saturate(180%) blur(8px);border-top:1px solid #e6eaf2;padding:10px;margin-top:16px}
.btns{display:flex;gap:10px;justify-content:flex-end}
.hint{font-size:12px;color:#666;margin-top:6px}
.rte-toolbar{margin-bottom:6px}
.rte-editor{min-height:140px;border:1px solid #e6eaf2;border-radius:8px;padding:8px}
@media (max-width:1400px){
  .stats-cards{gap:10px;flex-wrap:wrap;}
  .stat-card{padding:12px 16px;min-width:95px;flex:1 1 calc(14.2% - 9px);}
  .stat-value{font-size:18px;}
}

@media (max-width:1200px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(25% - 6px);min-width:90px;}
  .stat-value{font-size:17px;}
  .stat-label{font-size:11px;}
}

@media (max-width:1024px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(33.33% - 6px);min-width:85px;}
  .stat-value{font-size:16px;}
  .main{flex-direction:column}
  .col.left,.col.right{flex:unset}
}

@media (max-width:900px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(50% - 4px);min-width:80px;}
  .stat-value{font-size:15px;}
  .stat-label{font-size:10px;}
}

@media (max-width:768px){
  .stats-cards{flex-wrap:wrap;gap:6px;}
  .stat-card{min-width:70px;flex:1 1 calc(50% - 3px);padding:10px 12px;}
  .stat-value{font-size:15px;}
  .stat-label{font-size:10px;margin-bottom:3px;line-height:1.2;}
  
  /* 移动端任务信息优化 */
  .task-meta{gap:6px;}
  .task-times{gap:3px;margin:2px 0;}
  .task-time{font-size:10px;padding:1px 6px;}
  .task-milestone{font-size:10px;padding:1px 6px;}
  .task-milestone .milestone-date{font-size:9px;}
}

@media (max-width:600px){
  .stats-cards{flex-wrap:wrap;gap:6px;}
  .stat-card{min-width:65px;flex:1 1 calc(50% - 3px);padding:8px 10px;}
  .stat-value{font-size:14px;}
  .stat-label{font-size:9px;margin-bottom:2px;line-height:1.1;}
  
  /* 更小屏幕的任务信息优化 */
  .task-time{font-size:9px;padding:1px 5px;}
  .task-milestone{font-size:9px;padding:1px 5px;}
}

@media (max-width:480px){
  .stats-cards{flex-wrap:wrap;gap:4px;}
  .stat-card{min-width:60px;flex:1 1 calc(50% - 2px);padding:6px 8px;}
  .stat-value{font-size:13px;}
  .stat-label{font-size:8px;margin-bottom:2px;line-height:1.1;}
  
  /* 最小屏幕的任务信息优化 */
  .task-meta{flex-direction:column;align-items:flex-start;gap:4px;}
  .task-times{width:100%;}
  .task-time{font-size:8px;padding:1px 4px;}
  .task-milestone{font-size:8px;padding:1px 4px;}
  .task-milestone .milestone-date{font-size:8px;}
}

/* 任务时间状态样式 */
.task-time.time-due{color:#fa8c16;background:#fff9f0;border-color:#ffe7ba}
.task-time.overdue{color:#d4380d !important;background:#fff1f0 !important;border-color:#ffa39e !important}

/* 里程碑信息样式 - 更庄重的色调 */
.task-milestone{color:#234fa2;background:#f0f5ff;border:1px solid #d6e1ff;border-radius:12px;padding:2px 8px;font-weight:500;display:inline-flex;align-items:center;gap:2px}
.task-milestone .milestone-date{color:#595959;font-size:10px;font-weight:400}

.task-assignee{border-radius:12px;padding:2px 8px;border:1px solid}
.task-assignee.assigned{color:#52c41a;background:#f6ffed;border-color:#b7eb8f}
.task-assignee.unassigned{color:#d4380d;background:#fff7e6;border-color:#ffd6bf}
.task-origin{color:#8c8c8c;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:12px;padding:2px 8px}

/* 保留原有任务样式（用于其他地方） */
.task{border:1px solid #e6eaf2;border-radius:10px;padding:10px;margin-bottom:8px;background:#fff;display:grid;grid-template-columns:1fr auto;gap:8px}
.task .name{font-weight:600}
.task .meta{display:flex;gap:6px;align-items:center;font-size:12px;color:#666}
.pill{border:1px solid #e6eaf2;border-radius:999px;padding:2px 8px;font-size:12px;background:#fafbff}
.pill.blue{color:#234fa2;border-color:#d6e1ff}
.pill.red{color:#d4380d;border-color:#ffd6bf;background:#fff7e6}
.pill.green{color:#389e0d;border-color:#c2f0c2;background:#f6ffed}
.pill.assign{border-color:#e6eaf2}
.pill.assigned{color:#1d39c4;border-color:#adc6ff;background:#f0f5ff}
.pill.unassigned{color:#d4380d;border-color:#ffa39e;background:#fff1f0}
.origin{font-size:11px;border-radius:4px;padding:2px 6px;background:#f0f5ff;color:#3f5fb6;border:1px solid #d6e4ff}
.segmented-filter{display:flex;align-items:center;gap:8px}
.chip-row{width:100%;margin-top:6px}
.member{border:1px solid #e6eaf2;border-radius:10px;padding:10px;margin:10px;background:#fff}
.member.member--highlight{border-color:#4e7be6; box-shadow:0 0 0 3px rgba(78,123,230,0.15)}
.member .row{display:flex;justify-content:space-between;align-items:center}
.avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#cfd8ff,#e3ecff);display:inline-flex;align-items:center;justify-content:center;color:#2b4db8;font-weight:700}
.cap{font-size:12px;color:#666}
.load{height:6px;border-radius:999px;background:#f0f0f0;overflow:hidden;margin-top:8px}
.load .bar{height:100%;background:linear-gradient(90deg,#69c0ff,#4e7be6)}
.drop{margin-top:10px;border:1px dashed #e6eaf2;border-radius:8px;padding:8px;background:#fafcff}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #e6eaf2;border-radius:999px;padding:3px 8px;margin:4px;background:#fff;font-size:12px}
.footer{position:sticky;bottom:0;background:rgba(255,255,255,.92);backdrop-filter:saturate(180%) blur(8px);border-top:1px solid #e6eaf2;padding:10px;margin-top:16px}
.btns{display:flex;gap:10px;justify-content:flex-end}
.hint{font-size:12px;color:#666;margin-top:6px}
.rte-toolbar{margin-bottom:6px}
.rte-editor{min-height:140px;border:1px solid #e6eaf2;border-radius:8px;padding:8px}

@media (max-width:1400px){
  .stats-cards{gap:10px;flex-wrap:wrap;}
  .stat-card{padding:12px 16px;min-width:95px;flex:1 1 calc(14.2% - 9px);}
  .stat-value{font-size:18px;}
}

@media (max-width:1200px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(25% - 6px);min-width:90px;}
  .stat-value{font-size:17px;}
  .stat-label{font-size:11px;}
}

@media (max-width:1024px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(33.33% - 6px);min-width:85px;}
  .stat-value{font-size:16px;}
  .main{flex-direction:column}
  .col.left,.col.right{flex:unset}
}

@media (max-width:900px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(50% - 4px);min-width:80px;}
  .stat-value{font-size:15px;}
  .stat-label{font-size:10px;}
}

@media (max-width:768px){
  .stats-cards{flex-wrap:wrap;gap:6px;}
  .stat-card{min-width:70px;flex:1 1 calc(50% - 3px);padding:10px 12px;}
  .stat-value{font-size:15px;}
  .stat-label{font-size:10px;margin-bottom:3px;line-height:1.2;}
  
  /* 移动端任务信息优化 */
  .task-meta{gap:6px;}
  .task-times{gap:3px;margin:2px 0;}
  .task-time{font-size:10px;padding:1px 6px;}
  .task-milestone{font-size:10px;padding:1px 6px;}
  .task-milestone .milestone-date{font-size:9px;}
}

@media (max-width:600px){
  .stats-cards{flex-wrap:wrap;gap:6px;}
  .stat-card{min-width:65px;flex:1 1 calc(50% - 3px);padding:8px 10px;}
  .stat-value{font-size:14px;}
  .stat-label{font-size:9px;margin-bottom:2px;line-height:1.1;}
  
  /* 更小屏幕的任务信息优化 */
  .task-time{font-size:9px;padding:1px 5px;}
  .task-milestone{font-size:9px;padding:1px 5px;}
}

@media (max-width:480px){
  .stats-cards{flex-wrap:wrap;gap:4px;}
  .stat-card{min-width:60px;flex:1 1 calc(50% - 2px);padding:6px 8px;}
  .stat-value{font-size:13px;}
  .stat-label{font-size:8px;margin-bottom:2px;line-height:1.1;}
  
  /* 最小屏幕的任务信息优化 */
  .task-meta{flex-direction:column;align-items:flex-start;gap:4px;}
  .task-times{width:100%;}
  .task-time{font-size:8px;padding:1px 4px;}
  .task-milestone{font-size:8px;padding:1px 4px;}
  .task-milestone .milestone-date{font-size:8px;}
}

/* 任务时间状态样式 */
.task-time.time-due{color:#fa8c16;background:#fff9f0;border-color:#ffe7ba}
.task-time.overdue{color:#d4380d !important;background:#fff1f0 !important;border-color:#ffa39e !important}

/* 里程碑信息样式 - 更庄重的色调 */
.task-milestone{color:#234fa2;background:#f0f5ff;border:1px solid #d6e1ff;border-radius:12px;padding:2px 8px;font-weight:500;display:inline-flex;align-items:center;gap:2px}
.task-milestone .milestone-date{color:#595959;font-size:10px;font-weight:400}

.task-assignee{border-radius:12px;padding:2px 8px;border:1px solid}
.task-assignee.assigned{color:#52c41a;background:#f6ffed;border-color:#b7eb8f}
.task-assignee.unassigned{color:#d4380d;background:#fff7e6;border-color:#ffd6bf}
.task-origin{color:#8c8c8c;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:12px;padding:2px 8px}

/* 保留原有任务样式（用于其他地方） */
.task{border:1px solid #e6eaf2;border-radius:10px;padding:10px;margin-bottom:8px;background:#fff;display:grid;grid-template-columns:1fr auto;gap:8px}
.task .name{font-weight:600}
.task .meta{display:flex;gap:6px;align-items:center;font-size:12px;color:#666}
.pill{border:1px solid #e6eaf2;border-radius:999px;padding:2px 8px;font-size:12px;background:#fafbff}
.pill.blue{color:#234fa2;border-color:#d6e1ff}
.pill.red{color:#d4380d;border-color:#ffd6bf;background:#fff7e6}
.pill.green{color:#389e0d;border-color:#c2f0c2;background:#f6ffed}
.pill.assign{border-color:#e6eaf2}
.pill.assigned{color:#1d39c4;border-color:#adc6ff;background:#f0f5ff}
.pill.unassigned{color:#d4380d;border-color:#ffa39e;background:#fff1f0}
.origin{font-size:11px;border-radius:4px;padding:2px 6px;background:#f0f5ff;color:#3f5fb6;border:1px solid #d6e4ff}
.segmented-filter{display:flex;align-items:center;gap:8px}
.chip-row{width:100%;margin-top:6px}
.member{border:1px solid #e6eaf2;border-radius:10px;padding:10px;margin:10px;background:#fff}
.member.member--highlight{border-color:#4e7be6; box-shadow:0 0 0 3px rgba(78,123,230,0.15)}
.member .row{display:flex;justify-content:space-between;align-items:center}
.avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#cfd8ff,#e3ecff);display:inline-flex;align-items:center;justify-content:center;color:#2b4db8;font-weight:700}
.cap{font-size:12px;color:#666}
.load{height:6px;border-radius:999px;background:#f0f0f0;overflow:hidden;margin-top:8px}
.load .bar{height:100%;background:linear-gradient(90deg,#69c0ff,#4e7be6)}
.drop{margin-top:10px;border:1px dashed #e6eaf2;border-radius:8px;padding:8px;background:#fafcff}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #e6eaf2;border-radius:999px;padding:3px 8px;margin:4px;background:#fff;font-size:12px}
.footer{position:sticky;bottom:0;background:rgba(255,255,255,.92);backdrop-filter:saturate(180%) blur(8px);border-top:1px solid #e6eaf2;padding:10px;margin-top:16px}
.btns{display:flex;gap:10px;justify-content:flex-end}
.hint{font-size:12px;color:#666;margin-top:6px}
.rte-toolbar{margin-bottom:6px}
.rte-editor{min-height:140px;border:1px solid #e6eaf2;border-radius:8px;padding:8px}

@media (max-width:1400px){
  .stats-cards{gap:10px;flex-wrap:wrap;}
  .stat-card{padding:12px 16px;min-width:95px;flex:1 1 calc(14.2% - 9px);}
  .stat-value{font-size:18px;}
}

@media (max-width:1200px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(25% - 6px);min-width:90px;}
  .stat-value{font-size:17px;}
  .stat-label{font-size:11px;}
}

@media (max-width:1024px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(33.33% - 6px);min-width:85px;}
  .stat-value{font-size:16px;}
  .main{flex-direction:column}
  .col.left,.col.right{flex:unset}
}

@media (max-width:900px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(50% - 4px);min-width:80px;}
  .stat-value{font-size:15px;}
  .stat-label{font-size:10px;}
}

@media (max-width:768px){
  .stats-cards{flex-wrap:wrap;gap:6px;}
  .stat-card{min-width:70px;flex:1 1 calc(50% - 3px);padding:10px 12px;}
  .stat-value{font-size:15px;}
  .stat-label{font-size:10px;margin-bottom:3px;line-height:1.2;}
  
  /* 移动端任务信息优化 */
  .task-meta{gap:6px;}
  .task-times{gap:3px;margin:2px 0;}
  .task-time{font-size:10px;padding:1px 6px;}
  .task-milestone{font-size:10px;padding:1px 6px;}
  .task-milestone .milestone-date{font-size:9px;}
}

@media (max-width:600px){
  .stats-cards{flex-wrap:wrap;gap:6px;}
  .stat-card{min-width:65px;flex:1 1 calc(50% - 3px);padding:8px 10px;}
  .stat-value{font-size:14px;}
  .stat-label{font-size:9px;margin-bottom:2px;line-height:1.1;}
  
  /* 更小屏幕的任务信息优化 */
  .task-time{font-size:9px;padding:1px 5px;}
  .task-milestone{font-size:9px;padding:1px 5px;}
}

@media (max-width:480px){
  .stats-cards{flex-wrap:wrap;gap:4px;}
  .stat-card{min-width:60px;flex:1 1 calc(50% - 2px);padding:6px 8px;}
  .stat-value{font-size:13px;}
  .stat-label{font-size:8px;margin-bottom:2px;line-height:1.1;}
  
  /* 最小屏幕的任务信息优化 */
  .task-meta{flex-direction:column;align-items:flex-start;gap:4px;}
  .task-times{width:100%;}
  .task-time{font-size:8px;padding:1px 4px;}
  .task-milestone{font-size:8px;padding:1px 4px;}
  .task-milestone .milestone-date{font-size:8px;}
}
</style>


