/**
 * Planning merge utilities
 *
 * This module centralizes the logic for generating stable keys, content hashes,
 * and computing diffs between two baselines. It is intentionally framework-agnostic
 * (no Vue imports) so it can be reused on the backend later.
 */

// Lightweight stable hash based on JSON string; sufficient for diffing UI baselines
const simpleHash = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0 // Convert to 32bit int
  }
  return String(h)
}

// Normalize task fields for hashing to avoid false diffs (trim, default empty)
export const normalizeTaskForHash = (task) => {
  return {
    name: String(task.name || '').trim(),
    phaseId: String(task.phaseId || '').trim(),
    primaryMilestoneId: String(task.primaryMilestoneId || '').trim(),
    estimate: typeof task.estimate === 'number' ? task.estimate : undefined,
    priority: task.priority || undefined,
    dueDate: task.dueDate || undefined,
    startDate: task.startDate || undefined,
    endDate: task.endDate || undefined
  }
}

// Build a human-stable key based on a subset of semantic fields
export const computeStableKey = (task) => {
  const n = String(task.name || '').trim().toLowerCase().replace(/\s+/g, '-')
  const p = String(task.phaseId || '').trim().toLowerCase().replace(/\s+/g, '-')
  const m = String(task.primaryMilestoneId || '').trim().toLowerCase().replace(/\s+/g, '-')
  return [n || 'unnamed', p || 'nop', m || 'nom'].join('|')
}

export const computeContentHash = (task) => {
  const normalized = normalizeTaskForHash(task)
  const json = JSON.stringify(normalized)
  return simpleHash(json)
}

export const indexByStableKey = (tasks) => {
  const idx = new Map()
  for (const t of tasks) {
    idx.set(t.stableKey || computeStableKey(t), t)
  }
  return idx
}

/**
 * Diff two baselines (arrays of tasks with stableKey/contentHash)
 * @returns { additions: Task[], updates: {before, after}[], removals: Task[] }
 */
export const diffBaselines = (oldBaseline, newBaseline) => {
  const oldIdx = indexByStableKey(oldBaseline)
  const newIdx = indexByStableKey(newBaseline)

  const additions = []
  const updates = []
  const removals = []

  // Find additions and updates
  for (const [sk, after] of newIdx.entries()) {
    const before = oldIdx.get(sk)
    if (!before) {
      additions.push(after)
      continue
    }
    if ((before.contentHash || '') !== (after.contentHash || '')) {
      updates.push({ before, after })
    }
  }

  // Find removals
  for (const [sk, before] of oldIdx.entries()) {
    if (!newIdx.has(sk)) removals.push(before)
  }

  return { additions, updates, removals }
}


