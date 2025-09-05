<template>
  <div class="rtpl-page app-container">
    <div class="hd">
      <div class="title">提报模板</div>
      <div class="ops">
        <a-button type="primary" @click="addTpl">新增模板</a-button>
        <a-button @click="saveAll">保存到本地</a-button>
      </div>
    </div>
    <a-table :dataSource="rows" :columns="cols" rowKey="id" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key==='name'">
          <a-input v-model:value="record.name" />
        </template>
        <template v-else-if="column.key==='requireAttachment'">
          <a-switch v-model:checked="record.requireAttachment" />
        </template>
        <template v-else-if="column.key==='sections'">
          <div>
            <a-tag v-for="(s,i) in record.sections" :key="i" color="#2b4db8" closable @close.prevent="delSection(record,i)" style="margin-bottom:4px">{{ s.title }}<template v-if="s.required">（必填）</template></a-tag>
            <div style="margin-top:6px">
              <a-input v-model:value="sec.title" placeholder="分段标题" style="width:220px" />
              <a-checkbox v-model:checked="sec.required" style="margin:0 8px">必填</a-checkbox>
              <a-button size="small" @click="addSection(record)">添加</a-button>
            </div>
          </div>
        </template>
        <template v-else-if="column.key==='default'">
          <a-radio :checked="planning.defaultReportTemplateId===record.id" @click="setDefault(record.id)">默认</a-radio>
        </template>
        <template v-else-if="column.key==='actions'">
          <a-space>
            <a-button size="small" danger @click="remove(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { usePlanningStore } from '@/store/planning'

const planning = usePlanningStore()
const rows = computed(() => planning.listReportTemplates)

const cols = [
  { title: '模板ID', dataIndex: 'id', key: 'id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '需附件', key: 'requireAttachment' },
  { title: '分段', key: 'sections', width: 420 },
  { title: '默认', key: 'default' },
  { title: '操作', key: 'actions' }
]

const sec = reactive({ title: '', required: false })
const addTpl = () => {
  const id = `tpl-${Date.now()}`
  planning.upsertReportTemplate({ id, name: `新模板-${id.slice(-4)}`, requireAttachment: false, sections: [] })
}
const addSection = (rec) => {
  if (!sec.title) return message.warning('请输入分段标题')
  rec.sections.push({ title: sec.title, required: sec.required })
  sec.title = ''
  sec.required = false
}
const delSection = (rec, idx) => { rec.sections.splice(idx,1) }
const setDefault = (id) => { planning.setDefaultReportTemplate(id); message.success('默认模板已更新') }
const remove = (id) => { planning.removeReportTemplate(id); message.success('已删除模板') }
const saveAll = () => { if (planning.saveToLocal()) message.success('已保存到本地') }
</script>

<style scoped>
.rtpl-page{background:#fff;border:1px solid #e6eaf2;border-radius:12px;padding:16px}
.hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.title{font-weight:700;color:#234fa2}
</style>


