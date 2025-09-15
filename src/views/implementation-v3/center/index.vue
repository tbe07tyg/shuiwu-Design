<!--
  @file 项目实施管理 v3 - 中心容器页
  @description 四步标签页容器：团队配置、申报书解析、任务计划与分配（融合视图）、进展监控。
-->
<template>
  <div class="implementation-v3-center">
    <a-tabs v-model:activeKey="activeTab" type="card" class="implementation-v3-tabs">
      <a-tab-pane key="team" tab="团队配置">
        <TeamConfigurationStep />
      </a-tab-pane>

      <a-tab-pane key="analysis" tab="申报书解析">
        <ProposalAnalysisStepSimple />
      </a-tab-pane>

      <a-tab-pane key="planning" tab="任务计划与分配">
        <TaskPlanning />
      </a-tab-pane>

      <a-tab-pane key="monitor" tab="进展监控">
        <ProgressMonitoringStep />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TeamConfigurationStep from './components/TeamConfigurationStep.vue'
import ProposalAnalysisStepSimple from './components/ProposalAnalysisStep-Simple.vue'
import TaskPlanning from './pages/TaskPlanning.vue'
import ProgressMonitoringStep from './components/ProgressMonitoringStep.vue'

// 默认选中第一步：团队配置
const activeTab = ref('team')
</script>

<style scoped>
.implementation-v3-center {
  padding: 16px;
}

.implementation-v3-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 12px;
}
</style>


