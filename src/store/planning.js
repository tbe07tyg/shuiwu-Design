/**
 * @file 任务策划（融合视图）Store
 * @description 管理“基线任务（AI解析）+ 用户覆写 + 分配 + 草稿计划”的完整数据流。
 *
 * 设计说明（分层模型）：
 * - baseline.tasks：AI解析得到的“基线”任务，仅在合并时更新；
 * - userEdits.tasks：用户编辑的字段覆写（按 stableKey 归档），从不被复解析覆盖；
 * - metadata.tasks：任务元数据，如 editedFields、archived 等；
 * - tasks（computed）：对外展示层 = baseline.tasks 应用 userEdits 后的结果，过滤 archived。
 * - assignments：人员分配，独立存储，不随复解析覆盖；
 *
 * 为将来后端对接做准备：所有关键算法与键值（stableKey/contentHash）生成在 utils/planningMerge.js，
 * 便于迁移至服务端保持一致。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { computeStableKey, computeContentHash, diffBaselines, normalizeTaskForHash } from '@/utils/planningMerge'

export const usePlanningStore = defineStore('planning', () => {
  // 本地持久化键（后续可替换为按项目ID的前缀）
  const PERSIST_KEY = 'planning.v1'
  // ========== 核心状态 ==========
  // 基线层（仅由合并算法写入）
  const baseline = ref({
    tasks: [], // 每个任务应包含 { id, name, phaseId, primaryMilestoneId, estimate, priority, dueDate, origin, stableKey, contentHash }
    milestones: []
  })
  // 用户覆写层（仅记录被用户修改过的字段，按 stableKey 归档）
  const userEdits = ref({
    tasks: {
      // [stableKey]: { fields: { name, estimate, ... }, editedFields: Set<string> }
    }
  })
  // 元数据（任务级）
  const metadata = ref({
    tasks: {
      // [stableKey]: { archived: boolean, lastSyncAt: number }
    }
  })
  // 分配与草稿
  const assignments = ref([]) // { taskId, memberId, order }
  const draftPlan = ref({ totalDuration: '', milestones: [] })
  // 提报模板与默认模板
  const reportTemplates = ref([]) // {id,name,requireAttachment,sections:[{title,required}]}
  const defaultReportTemplateId = ref(null)
  // 快照版本（用于回滚）
  const snapshots = ref([])

  // ========== 显示层（computed） ==========
  // 将基线套用用户覆写后输出给 UI；过滤掉 archived 任务
  const tasks = computed(() => {
    const list = []
    for (const t of baseline.value.tasks) {
      const meta = metadata.value.tasks[t.stableKey] || {}
      if (meta.archived) continue
      const edit = userEdits.value.tasks[t.stableKey]
      if (edit && edit.fields) {
        list.push({ ...t, ...edit.fields })
      } else {
        list.push({ ...t })
      }
    }
    return list
  })

  // 统计
  const totalTasks = computed(() => tasks.value.length)
  const unassignedCount = computed(() => {
    const assignedTaskIds = new Set(assignments.value.map(a => a.taskId))
    return tasks.value.filter(t => !assignedTaskIds.has(t.id)).length
  })

  const involvedMilestoneCount = computed(() => {
    const set = new Set()
    tasks.value.forEach(t => { if (t.primaryMilestoneId) set.add(t.primaryMilestoneId) })
    return set.size
  })

  // 阶段/里程碑筛选动态生成
  const phaseFilters = computed(() => {
    const set = new Set()
    tasks.value.forEach(t => t.phaseId && set.add(t.phaseId))
    return Array.from(set)
  })

  const milestoneFilters = computed(() => milestones.value.map(m => m.id))

  // 里程碑使用原简单模型，后续与基线策略统一
  const milestones = ref([])

  // 已归档任务（用于“归档区”展示）
  const archivedTasks = computed(() => {
    const list = []
    for (const t of baseline.value.tasks) {
      const meta = metadata.value.tasks[t.stableKey]
      if (meta && meta.archived) list.push({ ...t })
    }
    return list
  })

  // ========== 合并与快照 ==========
  /**
   * 创建快照（深拷贝）以支持回滚
   */
  const createSnapshot = () => {
    const snap = {
      baseline: JSON.parse(JSON.stringify(baseline.value)),
      userEdits: JSON.parse(JSON.stringify(userEdits.value)),
      metadata: JSON.parse(JSON.stringify(metadata.value)),
      assignments: JSON.parse(JSON.stringify(assignments.value)),
      draftPlan: JSON.parse(JSON.stringify(draftPlan.value)),
      createdAt: Date.now()
    }
    snapshots.value.push(snap)
    return snapshots.value.length - 1
  }

  const rollbackToSnapshot = (index) => {
    const snap = snapshots.value[index]
    if (!snap) return false
    baseline.value = JSON.parse(JSON.stringify(snap.baseline))
    userEdits.value = JSON.parse(JSON.stringify(snap.userEdits))
    metadata.value = JSON.parse(JSON.stringify(snap.metadata))
    assignments.value = JSON.parse(JSON.stringify(snap.assignments))
    draftPlan.value = JSON.parse(JSON.stringify(snap.draftPlan))
    return true
  }

  // ========== 序列化 / 持久化 ==========
  const serialize = () => ({
    baseline: baseline.value,
    userEdits: userEdits.value,
    metadata: metadata.value,
    assignments: assignments.value,
    draftPlan: draftPlan.value,
    reportTemplates: reportTemplates.value,
    defaultReportTemplateId: defaultReportTemplateId.value,
    snapshots: snapshots.value,
    milestones: milestones.value // 修复：保存独立的里程碑数据
  })

  const deserialize = (data) => {
    if (!data || typeof data !== 'object') return false
    baseline.value = data.baseline || { tasks: [], milestones: [] }
    userEdits.value = data.userEdits || { tasks: {} }
    metadata.value = data.metadata || { tasks: {} }
    assignments.value = Array.isArray(data.assignments) ? data.assignments : []
    draftPlan.value = data.draftPlan || { totalDuration: '', milestones: [] }
    reportTemplates.value = Array.isArray(data.reportTemplates) ? data.reportTemplates : []
    defaultReportTemplateId.value = data.defaultReportTemplateId || null
    milestones.value = Array.isArray(data.milestones) ? data.milestones : [] // 修复：恢复独立的里程碑数据
    // 若无模板则提供内置示例，便于开箱使用
    if (!Array.isArray(reportTemplates.value) || reportTemplates.value.length === 0) {
      reportTemplates.value = [
        { id: 'tpl-standard', name: '标准阶段汇报', requireAttachment: false, sections: [ { title: '本期工作内容', required: true }, { title: '存在问题', required: false }, { title: '下期计划', required: true } ] },
        { id: 'tpl-with-attach', name: '阶段总结（需附件）', requireAttachment: true, sections: [ { title: '总结概述', required: true }, { title: '关键佐证材料说明', required: true } ] }
      ]
      defaultReportTemplateId.value = 'tpl-standard'
    }
    snapshots.value = Array.isArray(data.snapshots) ? data.snapshots : []
    return true
  }

  const saveToLocal = (key = PERSIST_KEY) => {
    try {
      const json = JSON.stringify(serialize())
      localStorage.setItem(key, json)
      return true
    } catch (e) {
      console.warn('planning: saveToLocal failed', e)
      return false
    }
  }

  const loadFromLocal = (key = PERSIST_KEY) => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return false
      const data = JSON.parse(raw)
      return deserialize(data)
    } catch (e) {
      console.warn('planning: loadFromLocal failed', e)
      return false
    }
  }

  /**
   * 规范化传入的“原始任务”数组为带有 stableKey/contentHash 的基线项
   */
  const buildBaselineFromRaw = (rawTasks) => {
    return rawTasks.map((raw, idx) => {
      const base = {
        id: raw.id || `B-${Date.now()}-${idx}`,
        name: raw.name,
        phaseId: raw.phaseId,
        primaryMilestoneId: raw.primaryMilestoneId,
        estimate: raw.estimate,
        priority: raw.priority,
        dueDate: raw.dueDate,
        origin: raw.origin
      }
      const stableKey = computeStableKey(base)
      const contentHash = computeContentHash(base)
      return { ...base, stableKey, contentHash }
    })
  }

  /**
   * 预览差异：传入原始任务数组，返回 { additions, updates, removals }
   */
  const previewMerge = (rawTasks) => {
    const nextBaseline = buildBaselineFromRaw(rawTasks)
    return diffBaselines(baseline.value.tasks, nextBaseline)
  }

  /**
   * 合并基线（新增简化去重策略）
   * @param {Array} rawTasks - 解析得到的"原始任务"数组
   * @param {Object} options - { applyAdditions, applyUpdates, archiveRemovals, useNameDedup }
   */
  const mergeBaseline = (rawTasks, options = {}) => {
    const { applyAdditions = true, applyUpdates = false, archiveRemovals = false, useNameDedup = true } = options
    
    // 快照，确保可回滚
    createSnapshot()

    if (useNameDedup) {
      // 新的简化去重策略：基于任务名称精确匹配
      const existingNames = new Set(baseline.value.tasks.map(t => t.name))
      const newTasks = []
      
      rawTasks.forEach(rawTask => {
        // 如果任务名称已存在，跳过不新增
        if (existingNames.has(rawTask.name)) {
          console.log(`⏭️ 跳过重复任务: ${rawTask.name}`)
          return
        }
        
        // 新任务：构建完整的基线任务对象
        const task = {
          id: rawTask.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: rawTask.name,
          phaseId: rawTask.phaseId || null,
          primaryMilestoneId: rawTask.primaryMilestoneId || null,
          estimate: rawTask.estimate || null,
          priority: rawTask.priority || null,
          dueDate: rawTask.dueDate || null,
          startDate: rawTask.startDate || null,
          description: rawTask.description || null,
          isNew: true, // 标记为新解析的任务
          createdAt: new Date().toISOString(),
          origin: rawTask.origin || { type: 'generated', confidence: 0.8 },
          stableKey: computeStableKey(rawTask),
          contentHash: computeContentHash(normalizeTaskForHash(rawTask))
        }
        
        newTasks.push(task)
        console.log(`✅ 新增任务: ${task.name}`)
      })
      
      // 将新任务添加到列表顶部（新任务在上）
      if (applyAdditions && newTasks.length > 0) {
        baseline.value.tasks.unshift(...newTasks)
        console.log(`📝 本次解析新增 ${newTasks.length} 个任务`)
      }
      
    } else {
      // 保留原有的复杂合并逻辑（基于stableKey和contentHash）
      const nextBaseline = buildBaselineFromRaw(rawTasks)
      const { additions, updates, removals } = diffBaselines(baseline.value.tasks, nextBaseline)

      // 建立索引，便于就地更新
      const byStable = new Map(baseline.value.tasks.map(t => [t.stableKey, t]))
      const nextByStable = new Map(nextBaseline.map(t => [t.stableKey, t]))

      // 处理更新
      if (applyUpdates) {
        for (const { before, after } of updates) {
          const current = byStable.get(before.stableKey)
          if (!current) continue
          // 字段级"用户覆写"保护：若该字段被用户编辑过，则保留用户值
          const edit = userEdits.value.tasks[before.stableKey]
          const edited = (edit && edit.editedFields) ? new Set(edit.editedFields) : new Set()
          const merged = { ...current }
          const candidates = normalizeTaskForHash(after)
          Object.keys(candidates).forEach(k => {
            if (edited.has(k)) return
            merged[k] = candidates[k]
          })
          merged.contentHash = after.contentHash
          // 覆写就地更新
          Object.assign(current, merged)
        }
      }

      // 处理新增
      if (applyAdditions) {
        additions.forEach(a => {
          // 新增默认不包含用户覆写与分配
          baseline.value.tasks.push({ ...a })
        })
      }

      // 处理移除（归档）
      if (archiveRemovals) {
        removals.forEach(r => {
          if (!metadata.value.tasks[r.stableKey]) metadata.value.tasks[r.stableKey] = {}
          metadata.value.tasks[r.stableKey].archived = true
        })
      }
    }

    // milestones 暂保留直接替换/合并的简单策略（可按相同 stable 规则扩展）
    // 为避免覆盖用户草稿，这里不处理里程碑，留待后续实现
  }

  /**
   * 记录用户对任务的覆写（用于保护字段不被复解析覆盖）
   */
  const saveUserEdit = (stableKey, fields) => {
    if (!userEdits.value.tasks[stableKey]) {
      userEdits.value.tasks[stableKey] = { fields: {}, editedFields: [] }
    }
    Object.assign(userEdits.value.tasks[stableKey].fields, fields)
    const list = userEdits.value.tasks[stableKey].editedFields
    Object.keys(fields).forEach(k => { if (!list.includes(k)) list.push(k) })

    // 关键修复：同时更新 baseline 中对应的任务数据，确保 UI 立即反映变更
    const baselineTask = baseline.value.tasks.find(t => t.stableKey === stableKey)
    if (baselineTask) {
      Object.assign(baselineTask, fields)
    }

    // 强制触发响应式更新
    baseline.value.tasks = [...baseline.value.tasks]
  }

  /** 获取基线任务（通过 stableKey） */
  const getBaselineTask = (stableKey) => {
    return baseline.value.tasks.find(t => t.stableKey === stableKey) || null
  }

  /** 字段是否受保护（用户已编辑） */
  const isFieldProtected = (stableKey, field) => {
    const e = userEdits.value.tasks[stableKey]
    if (!e || !Array.isArray(e.editedFields)) return false
    return e.editedFields.includes(field)
  }

  /** 清除某个字段的用户覆写（等效“取消保护”） */
  const clearUserEditField = (stableKey, field) => {
    const e = userEdits.value.tasks[stableKey]
    if (!e) return
    if (e.fields) delete e.fields[field]
    if (Array.isArray(e.editedFields)) {
      const idx = e.editedFields.indexOf(field)
      if (idx >= 0) e.editedFields.splice(idx, 1)
    }
    // 若该任务已无任何覆写，清理条目
    if (e && (!e.fields || Object.keys(e.fields).length === 0) && (!e.editedFields || e.editedFields.length === 0)) {
      delete userEdits.value.tasks[stableKey]
    }
  }

  /** 设置归档标记 */
  const setArchived = (stableKey, archived) => {
    if (!metadata.value.tasks[stableKey]) metadata.value.tasks[stableKey] = {}
    metadata.value.tasks[stableKey].archived = !!archived
  }

  /** 根据 stableKey 恢复任务 */
  const restoreTask = (stableKey) => setArchived(stableKey, false)

  const assignTaskToMember = (taskId, memberId) => {
    const existing = assignments.value.find(x => x.taskId === taskId)
    if (existing) {
      existing.memberId = memberId
      const count = assignments.value.filter(a => a.memberId === memberId).length
      existing.order = count - 1
      return existing
    }
    const order = assignments.value.filter(a => a.memberId === memberId).length
    const rec = { taskId, memberId, order }
    assignments.value.push(rec)
    return rec
  }

  /**
   * 新增任务（原始原型）
   * @param {Object} raw 形如 { id,name,phaseId,estimate,priority,startDate,endDate,dueDate }
   */
  const addTask = (raw) => {
    const list = buildBaselineFromRaw([raw])
    if (list && list[0]) {
      baseline.value.tasks.push(list[0])
      return list[0]
    }
    return null
  }

  /**
   * 归档任务（通过任务ID软删除）
   */
  const archiveTaskById = (taskId) => {
    const t = baseline.value.tasks.find(x => x.id === taskId)
    if (!t) return false
    if (!metadata.value.tasks[t.stableKey]) metadata.value.tasks[t.stableKey] = {}
    metadata.value.tasks[t.stableKey].archived = true
    
    // 归档时自动清理该任务的所有分配关系，避免"幽灵chip"
    const beforeCount = assignments.value.length
    assignments.value = assignments.value.filter(a => a.taskId !== taskId)
    const removedCount = beforeCount - assignments.value.length
    
    console.log(`✅ 任务 ${taskId} 已归档，同时清理了 ${removedCount} 个分配关系`)
    return true
  }

  /**
   * 删除任务（简化版）
   * 直接删除任务及其相关数据，包括分配关系
   */
  const deleteTaskPermanently = (taskId) => {
    const idx = baseline.value.tasks.findIndex(t => t.id === taskId)
    if (idx < 0) return false
    
    const removed = baseline.value.tasks.splice(idx, 1)[0]
    const sk = removed && removed.stableKey
    if (sk) {
      if (userEdits.value.tasks[sk]) delete userEdits.value.tasks[sk]
      if (metadata.value.tasks[sk]) delete metadata.value.tasks[sk]
    }
    
    // 同时清理相关的分配关系
    assignments.value = assignments.value.filter(a => a.taskId !== taskId)
    console.log(`✅ 已删除任务: ${taskId}`)
    return true
  }

  // ========== 提报模板维护 ==========
  const listReportTemplates = computed(() => reportTemplates.value)
  const getReportTemplateById = (id) => reportTemplates.value.find(t => t.id === id) || null
  const getDefaultReportTemplate = () => getReportTemplateById(defaultReportTemplateId.value)
  const touchTemplates = () => {
    // 持久化并广播（供其他页如“工作台”监听 storage 事件自刷新）
    try { saveToLocal() } catch {}
    try { localStorage.setItem('reportTemplates.updatedAt', String(Date.now())) } catch {}
  }
  const setDefaultReportTemplate = (id) => { defaultReportTemplateId.value = id; touchTemplates() }
  const upsertReportTemplate = (tpl) => {
    if (!tpl || !tpl.id) return false
    const idx = reportTemplates.value.findIndex(t => t.id === tpl.id)
    if (idx >= 0) reportTemplates.value[idx] = JSON.parse(JSON.stringify(tpl))
    else reportTemplates.value.push(JSON.parse(JSON.stringify(tpl)))
    touchTemplates()
    return true
  }
  const removeReportTemplate = (id) => {
    const idx = reportTemplates.value.findIndex(t => t.id === id)
    if (idx < 0) return false
    reportTemplates.value.splice(idx, 1)
    if (defaultReportTemplateId.value === id) defaultReportTemplateId.value = null
    touchTemplates()
    return true
  }

  // 获取某任务实际使用的模板（无则返回默认）
  const getActiveReportTemplate = (task) => {
    if (!task) return getDefaultReportTemplate()
    if (task.reportTemplate && task.reportTemplate.id) {
      return task.reportTemplate
    }
    return getDefaultReportTemplate()
  }
  const getActiveReportTemplateByTaskId = (taskId) => {
    const t = tasks.value.find(x => x.id === taskId)
    return getActiveReportTemplate(t)
  }

  /**
   * 新增里程碑
   * @param {{id:string,name:string,plannedDate?:string,criteria?:string[]}} ms
   */
  const addMilestone = (ms) => {
    if (!ms || !ms.id || !ms.name) return null
    if (!Array.isArray(milestones.value)) milestones.value = []
    const exists = milestones.value.find(m => m.id === ms.id)
    if (exists) return exists
    milestones.value.push({ id: ms.id, name: ms.name, plannedDate: ms.plannedDate, criteria: ms.criteria || [] })
    // 修复：自动保存到本地存储
    try { saveToLocal() } catch (e) { console.warn('保存里程碑失败:', e) }
    return ms
  }

  /** 删除里程碑（不影响已存在任务的字段，UI 层自行处理清空选择） */
  const removeMilestone = (id) => {
    const idx = milestones.value.findIndex(m => m.id === id)
    if (idx < 0) return false
    milestones.value.splice(idx, 1)
    // 修复：自动保存到本地存储
    try { saveToLocal() } catch (e) { console.warn('删除里程碑保存失败:', e) }
    return true
  }

  const unassignTask = (taskId) => {
    const idx = assignments.value.findIndex(a => a.taskId === taskId)
    if (idx >= 0) assignments.value.splice(idx, 1)
  }

  const getMemberAssignments = (memberId) => {
    return assignments.value.filter(a => a.memberId === memberId).sort((a,b) => (a.order||0)-(b.order||0))
  }

  const getTaskAssignee = (taskId) => {
    const rec = assignments.value.find(a => a.taskId === taskId)
    return rec ? rec.memberId : null
  }

  /**
   * 在同一成员卡内重新排序任务
   */
  const reorderWithinMember = (memberId, sourceTaskId, targetTaskId) => {
    const list = assignments.value.filter(a => a.memberId === memberId).sort((a,b) => (a.order||0)-(b.order||0))
    const sIdx = list.findIndex(a => a.taskId === sourceTaskId)
    const tIdx = list.findIndex(a => a.taskId === targetTaskId)
    if (sIdx < 0 || tIdx < 0 || sIdx === tIdx) return false
    const [moved] = list.splice(sIdx, 1)
    list.splice(tIdx, 0, moved)
    // 回写 order
    let i = 0
    for (const a of list) {
      const real = assignments.value.find(x => x.taskId === a.taskId && x.memberId === memberId)
      if (real) real.order = i++
    }
    return true
  }

  return {
    // state / computed
    tasks, // 展示层（已套用覆写、过滤归档）
    milestones,
    assignments,
    draftPlan,
    reportTemplates,
    defaultReportTemplateId,
    baseline,
    userEdits,
    metadata,
    snapshots,
    // stats
    totalTasks,
    unassignedCount,
    involvedMilestoneCount,
    phaseFilters,
    milestoneFilters,
    archivedTasks,
    // actions
    createSnapshot,
    rollbackToSnapshot,
    serialize,
    deserialize,
    saveToLocal,
    loadFromLocal,
    previewMerge,
    mergeBaseline,
    saveUserEdit,
    getBaselineTask,
    isFieldProtected,
    clearUserEditField,
    addTask,
    archiveTaskById,
    // templates
    listReportTemplates,
    getReportTemplateById,
    getDefaultReportTemplate,
    setDefaultReportTemplate,
    upsertReportTemplate,
    removeReportTemplate,
    getActiveReportTemplate,
    getActiveReportTemplateByTaskId,
    addMilestone,
    removeMilestone,
    setArchived,
    restoreTask,
    assignTaskToMember,
    unassignTask,
    getMemberAssignments,
    getTaskAssignee,
    reorderWithinMember,
    deleteTaskPermanently
  }
  
  // 自动初始化：从本地存储加载数据（放在return之前）
  try {
    const loaded = loadFromLocal()
    if (loaded) {
      console.log('✅ Planning数据已从本地存储恢复')
    } else {
      console.log('ℹ️ Planning首次运行，使用默认数据')
    }
  } catch (e) {
    console.warn('⚠️ Planning数据加载失败，使用默认数据:', e)
  }
  
  return {
    // state / computed
    tasks, // 展示层（已套用覆写、过滤归档）
    milestones,
    assignments,
    draftPlan,
    reportTemplates,
    defaultReportTemplateId,
    baseline,
    userEdits,
    metadata,
    snapshots,
    totalTasks,
    unassignedCount,
    involvedMilestoneCount,
    phaseFilters,
    milestoneFilters,
    archivedTasks,
    // actions
    createSnapshot,
    rollbackToSnapshot,
    serialize,
    deserialize,
    saveToLocal,
    loadFromLocal,
    previewMerge,
    mergeBaseline,
    saveUserEdit,
    getBaselineTask,
    isFieldProtected,
    archiveTask,
    setFieldProtection,
    clearUserEditField,
    addTask,
    archiveTaskById,
    // templates
    listReportTemplates,
    getReportTemplateById,
    getDefaultReportTemplate,
    setDefaultReportTemplate,
    upsertReportTemplate,
    removeReportTemplate,
    getActiveReportTemplate,
    getActiveReportTemplateByTaskId,
    addMilestone,
    removeMilestone,
    setArchived,
    restoreTask,
    assignTaskToMember,
    unassignTask,
    getMemberAssignments,
    getTaskAssignee,
    reorderWithinMember,
    deleteTaskPermanently
  }
})


