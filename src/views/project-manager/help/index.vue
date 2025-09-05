<template>
  <div class="help-guide-container">
    <a-card class="help-header" :bordered="false">
      <div class="help-header-content">
        <div class="help-icon">
          <QuestionCircleOutlined />
        </div>
        <div class="help-title-section">
          <h1>项目经理后台使用指南</h1>
          <p>全面了解项目经理后台管理系统的功能和操作方法</p>
        </div>
      </div>
    </a-card>

    <div class="help-content">
      <!-- 快速导航 -->
      <a-card title="🚀 快速导航" class="nav-card" :bordered="false">
        <a-row :gutter="16">
          <a-col :span="8" v-for="nav in quickNav" :key="nav.key">
            <div class="nav-item" @click="scrollToSection(nav.key)">
              <div class="nav-icon" :style="{ color: nav.color }">
                <component :is="nav.icon" />
              </div>
              <div class="nav-info">
                <h4>{{ nav.title }}</h4>
                <p>{{ nav.description }}</p>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 监控页快捷操作与提醒（已实现） -->
      <a-card id="realtime" title="🧰 监控页快捷操作与提醒" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>快捷操作</h3>
          <ul class="function-list">
            <li><strong>开始任务：</strong>当选中任务状态为“待开始(pending)”时，右侧详情显示“开始任务”。点击后状态置为进行中(active)，进度≥10%。</li>
            <li><strong>更新进度：</strong>右侧详情点击“更新进度”，支持说明与预计完成时间。</li>
            <li><strong>重置选中任务：</strong>仅重置当前选中WBS任务为 pending/0%，清空操作历史，并广播到成员看板。</li>
            <li><strong>重置项目进度：</strong>将当前项目全部任务重置为 pending/0%，并广播到成员看板。</li>
            <li><strong>刷新进度：</strong>从同步缓存覆盖WBS的 status/progress，手动对齐数据。</li>
          </ul>

          <h3>未读提醒与角标</h3>
          <ul class="function-list">
            <li><strong>菜单角标：</strong>“项目经理后台”“项目详情管理”右侧显示全局未读总数。</li>
            <li><strong>项目列表角标：</strong>“进度”列右侧显示项目级未读数。</li>
            <li><strong>WBS 节点角标：</strong>树节点标题右侧显示任务级未读数。</li>
            <li><strong>清零未读：</strong>甘特卡片右上“更新提醒”按钮清零当前项目未读。</li>
          </ul>

          <h3>实时联动</h3>
          <ul class="function-list">
            <li>成员在看板更新进度/提交材料后：页面弹出消息+通知，WBS/Gantt高亮，角标累加。</li>
            <li>PM 在监控页操作（开始/重置/分配）：成员看板即时同步，并在首次进入页面时兜底合并。</li>
          </ul>
        </div>
      </a-card>

      <!-- 角色分离与系统概述（保留已展示内容） -->
      <a-card id="overview" title="📊 角色分离与系统概述" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>🎯 角色定位说明</h3>
          <p>科研管理系统采用角色分离设计，明确区分三个核心角色的职责和权限：</p>
          
          <a-row :gutter="24" style="margin: 20px 0;">
            <a-col :span="8">
              <div class="role-card manager-role">
                <div class="role-header">
                  <BankOutlined class="role-icon" />
                  <h4>🏢 管理角色</h4>
                </div>
                <div class="role-content">
                  <p><strong>职责范围：</strong>宏观项目管理和行政审批</p>
                  <ul>
                    <li>项目立项审核</li>
                    <li>开题会议组织</li>
                    <li>中期检查审核</li>
                    <li>项目验收管理</li>
                    <li>政策制度制定</li>
                  </ul>
                  <p><strong>使用系统：</strong>项目管理模块</p>
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="role-card pm-role">
                <div class="role-header">
                  <UserOutlined class="role-icon" />
                  <h4>👨‍💼 项目经理角色</h4>
                </div>
                <div class="role-content">
                  <p><strong>职责范围：</strong>具体项目执行和团队协调</p>
                  <ul>
                    <li>项目申请立项</li>
                    <li>项目执行管理</li>
                    <li>团队成员管理</li>
                    <li>任务拆解分配</li>
                    <li>进度跟踪监控</li>
                  </ul>
                  <p><strong>使用系统：</strong>项目经理后台</p>
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="role-card team-role">
                <div class="role-header">
                  <TeamOutlined class="role-icon" />
                  <h4>👨‍💻 团队成员角色</h4>
                </div>
                <div class="role-content">
                  <p><strong>职责范围：</strong>具体任务执行和进展汇报</p>
                  <ul>
                    <li>任务接收执行</li>
                    <li>工作进展汇报</li>
                    <li>团队协作配合</li>
                    <li>资源需求申请</li>
                    <li>问题反馈沟通</li>
                  </ul>
                  <p><strong>使用系统：</strong>团队成员工作台</p>
                </div>
              </div>
            </a-col>
          </a-row>
          
          <h3>🔄 完整业务流程图</h3>
          <div class="flow-diagram-container">
            <div class="diagram-legend">
              <div class="legend-item">
                <div class="legend-color manager-legend"></div>
                <span>管理角色操作</span>
              </div>
              <div class="legend-item">
                <div class="legend-color pm-legend"></div>
                <span>项目经理操作</span>
              </div>
              <div class="legend-item">
                <div class="legend-color team-legend"></div>
                <span>团队成员操作</span>
              </div>
              <div class="legend-item">
                <div class="legend-color auto-legend"></div>
                <span>系统自动化</span>
              </div>
              <div class="legend-item">
                <div class="legend-color parallel-legend"></div>
                <span>并行里程碑</span>
              </div>
            </div>
            
            <!-- 流程图关闭（简化为文字说明） -->
            <div class="mermaid-container" style="text-align:center; padding:20px;">
              <div>流程：立项 → 项目经理后台 → WBS配置/团队分配 → 执行监控 → 归档</div>
            </div>
          </div>
          
          <h3>💡 项目经理后台核心优势</h3>
          <a-row :gutter="16">
            <a-col :span="12">
              <ul class="feature-list">
                <li>🎯 <strong>角色专属设计</strong>：专为项目经理量身定制的管理界面</li>
                <li>🔄 <strong>自动化衔接</strong>：立项通过后自动激活，无缝衔接</li>
                <li>👥 <strong>团队协作优化</strong>：团队成员管理和任务分配</li>
              </ul>
            </a-col>
            <a-col :span="12">
              <ul class="feature-list">
                <li>📊 <strong>可视化监控</strong>：甘特图进度跟踪和状态展示</li>
                <li>📋 <strong>并行流程管理</strong>：执行管理与里程碑审核并行</li>
                <li>🔧 <strong>团队协作优化</strong>：高效的团队沟通和任务协调</li>
              </ul>
            </a-col>
          </a-row>
          
          <h3>🚀 快速入门指南</h3>
          <div class="quick-start-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>申请立项</h4>
                <p>在立项申请页面提交项目申请，等待管理角色审核</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>自动激活</h4>
                <p>立项通过后，系统自动跳转到项目经理后台</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>配置项目</h4>
                <p>在项目详情管理页面配置WBS任务、分配团队成员</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>执行监控</h4>
                <p>使用甘特图监控进度、管理任务、协调团队</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">5</div>
              <div class="step-content">
                <h4>项目归档</h4>
                <p>项目完成后，在项目归档页面查看成果和经验总结</p>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 仪表板使用指南 -->
      <a-card id="dashboard" title="📊 仪表板使用指南" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>功能介绍</h3>
          <p>仪表板为您提供项目管理的全局视图，包括关键指标、进度趋势和项目概览信息。</p>
          
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon" style="background: #e6f7ff; color: #1890ff;">
                <BarChartOutlined />
              </div>
              <div class="feature-content">
                <h4>统计卡片</h4>
                <p>显示进行中项目、已完成项目、延期项目和风险项目的数量统计</p>
                <div class="operation-tips">
                  <strong>操作提示：</strong>点击卡片可快速跳转到对应项目列表
                </div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon" style="background: #f6ffed; color: #52c41a;">
                <LineChartOutlined />
              </div>
              <div class="feature-content">
                <h4>图表分析</h4>
                <p>项目进度趋势图和资源使用情况饼图，支持交互式数据展示</p>
                <div class="operation-tips">
                  <strong>操作提示：</strong>鼠标悬停查看详细数据，点击图例筛选数据
                </div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon" style="background: #fff2e8; color: #fa8c16;">
                <ProjectOutlined />
              </div>
              <div class="feature-content">
                <h4>最近项目</h4>
                <p>展示最新的项目列表，包含状态、进度和详情链接</p>
                <div class="operation-tips">
                  <strong>操作提示：</strong>点击"查看详情"进入项目详情页面
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 项目管理指南 -->
      <a-card id="projects" title="📋 项目管理指南" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>功能介绍</h3>
          <p>项目管理模块提供完整的项目生命周期管理功能，从项目创建到结项验收全流程支持。</p>
          
          <div class="workflow-steps">
            <a-steps :current="3" size="small">
              <a-step title="项目创建" description="填写项目基本信息" />
              <a-step title="团队组建" description="分配团队成员角色" />
              <a-step title="任务规划" description="制定项目计划" />
              <a-step title="执行监控" description="跟踪项目进度" />
              <a-step title="结项验收" description="项目成果交付" />
            </a-steps>
          </div>

          <h3>核心功能</h3>
          <div class="function-tabs">
            <a-tabs v-model:activeKey="projectActiveTab" type="card">
              <a-tab-pane key="list" tab="项目列表">
                <ul class="function-list">
                  <li><strong>搜索筛选：</strong>按项目名称、状态、优先级等条件快速筛选</li>
                  <li><strong>状态管理：</strong>一键更新项目状态（进行中、已完成、延期、风险）</li>
                  <li><strong>批量操作：</strong>支持批量导出、状态更新等操作</li>
                  <li><strong>排序功能：</strong>按创建时间、截止时间、优先级排序</li>
                </ul>
              </a-tab-pane>
              <a-tab-pane key="detail" tab="项目详情">
                <ul class="function-list">
                  <li><strong>基本信息：</strong>项目名称、描述、时间、预算等信息展示和编辑</li>
                  <li><strong>任务列表：</strong>查看项目下所有任务的执行情况</li>
                  <li><strong>团队成员：</strong>项目团队成员信息和角色分配</li>
                  <li><strong>项目文件：</strong>项目相关文档、资料的上传和管理</li>
                </ul>
              </a-tab-pane>
              <a-tab-pane key="operations" tab="操作流程">
                <div class="operation-flow">
                  <div class="flow-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h4>查看项目</h4>
                      <p>在项目列表中浏览所有项目，使用筛选和搜索功能快速定位目标项目</p>
                    </div>
                  </div>
                  <div class="flow-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h4>编辑项目</h4>
                      <p>点击"编辑"按钮修改项目信息，或点击项目名称进入详情页面</p>
                    </div>
                  </div>
                  <div class="flow-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <h4>管理团队</h4>
                      <p>在项目详情中添加团队成员，分配角色和权限</p>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </a-card>

      <!-- 任务管理指南 -->
      <a-card id="tasks" title="✅ 任务管理指南" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>功能介绍</h3>
          <p>任务管理模块帮助您高效分配、跟踪和管理项目中的各项任务，确保项目按时完成。</p>
          
          <div class="task-features">
            <a-row :gutter="24">
              <a-col :span="12">
                <h4>🎯 任务分配</h4>
                <ul>
                  <li>创建任务并设置优先级</li>
                  <li>分配给团队成员</li>
                  <li>设置截止时间和里程碑</li>
                  <li>添加任务描述和附件</li>
                </ul>
              </a-col>
              <a-col :span="12">
                <h4>📊 进度跟踪</h4>
                <ul>
                  <li>实时查看任务执行状态</li>
                  <li>监控任务完成进度</li>
                  <li>识别逾期和风险任务</li>
                  <li>生成进度报告</li>
                </ul>
              </a-col>
            </a-row>
          </div>

          <h3>操作指南</h3>
          <div class="guide-steps">
            <a-collapse>
              <a-collapse-panel key="1" header="如何创建新任务">
                <ol>
                  <li>点击"新建任务"按钮</li>
                  <li>填写任务基本信息（名称、描述、优先级）</li>
                  <li>选择负责人和参与人员</li>
                  <li>设置开始时间和截止时间</li>
                  <li>上传相关文件（可选）</li>
                  <li>点击"保存"完成创建</li>
                </ol>
              </a-collapse-panel>
              <a-collapse-panel key="2" header="如何批量分配任务">
                <ol>
                  <li>在任务列表中勾选要分配的任务</li>
                  <li>点击"批量分配"按钮</li>
                  <li>选择目标负责人</li>
                  <li>确认分配信息</li>
                  <li>系统自动发送通知给相关人员</li>
                </ol>
              </a-collapse-panel>
              <a-collapse-panel key="3" header="如何跟踪任务进度">
                <ol>
                  <li>查看任务状态指示器（待处理、进行中、已完成、逾期）</li>
                  <li>使用筛选器查看特定状态的任务</li>
                  <li>点击任务查看详细进度信息</li>
                  <li>在任务详情中查看工时记录和进度更新</li>
                  <li>导出进度报告进行分析</li>
                </ol>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </div>
      </a-card>

      <!-- 团队管理指南 -->
      <a-card id="team" title="👥 团队管理指南" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>功能介绍</h3>
          <p>团队管理模块帮助您有效管理团队成员，优化团队协作效率，提升整体绩效。</p>
          
          <div class="team-management-grid">
            <div class="management-card">
              <h4>👤 成员管理</h4>
              <ul>
                <li>添加/移除团队成员</li>
                <li>编辑成员基本信息</li>
                <li>设置成员角色和权限</li>
                <li>管理成员技能标签</li>
              </ul>
            </div>
            <div class="management-card">
              <h4>📈 绩效分析</h4>
              <ul>
                <li>查看成员工作量统计</li>
                <li>分析任务完成率</li>
                <li>评估工作效率</li>
                <li>生成绩效报告</li>
              </ul>
            </div>
            <div class="management-card">
              <h4>🎯 项目参与</h4>
              <ul>
                <li>查看成员参与的项目</li>
                <li>分析项目贡献度</li>
                <li>管理项目角色分配</li>
                <li>跟踪项目参与度</li>
              </ul>
            </div>
          </div>

          <h3>最佳实践</h3>
          <a-alert
            message="团队管理建议"
            description="定期举行团队会议，及时沟通项目进展；合理分配任务，充分发挥每个成员的专长；建立有效的激励机制，提升团队积极性。"
            type="info"
            show-icon
          />
        </div>
      </a-card>

      <!-- 项目归档指南 -->
      <a-card id="archive" title="📁 项目归档指南" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>功能介绍</h3>
          <p>项目归档功能帮助您查看和管理所有已完成项目的基本信息，便于项目经验总结和历史追溯。</p>
          
          <div class="archive-features">
            <div class="archive-feature-single">
              <div class="archive-icon">📄</div>
              <h4>已完成项目管理</h4>
              <p>统一查看和管理所有已完成项目的详细信息</p>
              <ul class="feature-list">
                <li>项目基本信息展示（名称、编号、完成时间、项目经理等）</li>
                <li>项目状态历史追踪，了解项目全生命周期</li>
                <li>项目成员信息记录，便于团队总结</li>
                <li>支持按名称、时间、状态等条件快速搜索筛选</li>
                <li>项目详情查看，包含任务完成情况和成果总结</li>
              </ul>
            </div>
          </div>

          <h3>操作指南</h3>
          <div class="archive-operations">
            <a-collapse>
              <a-collapse-panel key="1" header="如何查看已完成项目列表">
                <ol>
                  <li>点击左侧菜单"项目归档"进入归档页面</li>
                  <li>页面显示所有您管理过的已完成项目</li>
                  <li>使用搜索框按项目名称快速定位</li>
                  <li>点击筛选按钮按完成时间、项目类型等条件过滤</li>
                </ol>
              </a-collapse-panel>
              <a-collapse-panel key="2" header="如何查看项目详情">
                <ol>
                  <li>在项目列表中找到目标项目</li>
                  <li>点击项目名称或"查看详情"按钮</li>
                  <li>查看项目基本信息、团队成员、任务完成情况</li>
                  <li>了解项目执行过程中的关键里程碑</li>
                </ol>
              </a-collapse-panel>
              <a-collapse-panel key="3" header="如何进行项目总结">
                <ol>
                  <li>在项目详情页查看项目执行数据</li>
                  <li>分析项目进度、成本、质量等关键指标</li>
                  <li>总结项目成功经验和改进点</li>
                  <li>为未来类似项目提供参考</li>
                </ol>
              </a-collapse-panel>
            </a-collapse>
          </div>

          <h3>数据隔离说明</h3>
          <div class="data-isolation-info">
            <a-alert 
              message="重要提示" 
              description="根据系统角色分离设计，每个项目经理只能查看自己管理的已完成项目，确保数据安全和隐私保护。" 
              type="info" 
              show-icon 
              style="margin-bottom: 16px;"
            />
            <div class="isolation-details">
              <h4>🔒 数据访问权限</h4>
              <ul>
                <li><strong>个人项目：</strong>只能查看自己作为项目经理的已完成项目</li>
                <li><strong>团队信息：</strong>可查看项目团队成员和角色分配情况</li>
                <li><strong>执行数据：</strong>可查看项目进度、任务完成情况等执行数据</li>
                <li><strong>成果资料：</strong>可查看项目最终成果和验收情况</li>
              </ul>
            </div>
          </div>
        </div>
      </a-card>

      

      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import mermaid from 'mermaid'
import {
  QuestionCircleOutlined,
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PhoneOutlined,
  MailOutlined,
  WechatOutlined,
  BankOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const projectActiveTab = ref('list')
const analyticsActiveTab = ref('project')
const mermaidRef = ref(null)

// Mermaid流程图定义
const flowchartDefinition = `
graph TD
    A[项目经理申请立项] --> B[管理角色审核立项]
    B --> C{立项结果}
    
    C -->|通过| D[自动创建项目管理档案]
    C -->|有条件通过| E[整改后再次审核]
    C -->|不通过| F[流程结束]
    
    D --> G[项目经理后台自动激活]
    E --> H{整改材料审核}
    H -->|通过| D
    H -->|不通过| I[继续整改]
    I --> E
    
    G --> J[项目经理配置项目]
    J --> K[添加团队成员]
    J --> L[任务拆解分配]
    
    K --> N[团队成员工作台激活]
    L --> N
    
    G --> O[并行: 里程碑材料准备]
    O --> P[提交开题材料]
    O --> Q[提交中期材料]
    O --> R[提交验收材料]
    
    P --> S[管理角色开题审核]
    Q --> T[管理角色中期审核]
    R --> U[管理角色验收审核]
    
    N --> V[团队成员执行任务]
    V --> W[工作进展汇报]
    W --> X[项目经理监控进度]
    X --> Y[调整资源和任务]
    Y --> V
    
    classDef manager fill:#2d5a2d,stroke:#1b4d1b,stroke-width:3px,color:#ffffff
    classDef pm fill:#1e3a8a,stroke:#1e40af,stroke-width:3px,color:#ffffff
    classDef team fill:#581c87,stroke:#6b21a8,stroke-width:3px,color:#ffffff
    classDef auto fill:#b45309,stroke:#d97706,stroke-width:4px,color:#ffffff
    classDef parallel fill:#991b1b,stroke:#dc2626,stroke-width:3px,color:#ffffff
    classDef endNode fill:#374151,stroke:#4b5563,stroke-width:2px,color:#ffffff
    
    class B,C,E,H,S,T,U manager
    class A,G,J,K,L,X,Y pm
    class N,V,W team
    class D auto
    class O,P,Q,R parallel
    class F,I endNode
`

// 快速导航数据
const quickNav = ref([
  {
    key: 'overview',
    title: '系统概述',
    description: '了解系统整体功能',
    icon: 'DashboardOutlined',
    color: '#1890ff'
  },
  {
    key: 'dashboard',
    title: '仪表板',
    description: '项目总览和状态监控',
    icon: 'BarChartOutlined',
    color: '#52c41a'
  },
  {
    key: 'projects',
    title: '项目管理',
    description: '项目全生命周期配置',
    icon: 'ProjectOutlined',
    color: '#fa8c16'
  },
  {
    key: 'tasks',
    title: '任务管理',
    description: 'WBS任务分配和跟踪',
    icon: 'CheckSquareOutlined',
    color: '#eb2f96'
  },
  {
    key: 'team',
    title: '团队管理',
    description: '成员协调和沟通',
    icon: 'TeamOutlined',
    color: '#722ed1'
  },
  {
    key: 'archive',
    title: '项目归档',
    description: '项目成果归档管理',
    icon: 'DatabaseOutlined',
    color: '#f5222d'
  }
])

// 滚动到指定章节
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 渲染Mermaid流程图
const renderMermaidDiagram = async () => {
  if (mermaidRef.value) {
    // 初始化Mermaid配置
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    })
    
    try {
      // 清空之前的内容
      mermaidRef.value.innerHTML = ''
      
      // 渲染流程图
      const { svg } = await mermaid.render('mermaid-flowchart', flowchartDefinition)
      mermaidRef.value.innerHTML = svg
    } catch (error) {
      console.error('Mermaid渲染失败:', error)
      // 如果渲染失败，显示错误信息
      mermaidRef.value.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">流程图加载中...</div>'
    }
  }
}

onMounted(async () => {
  // 等待DOM渲染完成后渲染Mermaid图表
  await nextTick()
  await renderMermaidDiagram()
})
</script>

<style scoped>
.help-guide-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.help-header {
  margin-bottom: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.help-header :deep(.ant-card-body) {
  padding: 40px;
}

.help-header-content {
  display: flex;
  align-items: center;
  color: white;
}

.help-icon {
  font-size: 48px;
  margin-right: 24px;
  opacity: 0.9;
}

.help-title-section h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: white;
}

.help-title-section p {
  margin: 8px 0 0 0;
  font-size: 16px;
  opacity: 0.9;
  color: white;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #234fa2;
}

.nav-icon {
  font-size: 24px;
  margin-right: 16px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9ff;
  border-radius: 12px;
}

.nav-info h4 {
  margin: 0 0 4px 0;
  color: #262626;
  font-weight: 600;
}

.nav-info p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.guide-section {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.guide-section :deep(.ant-card-head) {
  border-bottom: 2px solid #f0f0f0;
  padding: 24px 24px 16px 24px;
}

.guide-section :deep(.ant-card-head-title) {
  font-size: 20px;
  font-weight: 600;
  color: #234fa2;
}

.section-content {
  padding: 8px 0;
}

.section-content h3 {
  color: #234fa2;
  margin: 24px 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.section-content h4 {
  color: #262626;
  margin: 16px 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 8px 0;
  display: flex;
  align-items: center;
  line-height: 1.6;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 20px;
}

.feature-item {
  display: flex;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-content h4 {
  margin: 0 0 8px 0;
  color: #262626;
}

.feature-content p {
  margin: 0 0 12px 0;
  color: #595959;
  line-height: 1.6;
}

.operation-tips {
  padding: 12px;
  background: #e6f7ff;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
  font-size: 14px;
}

.workflow-steps {
  margin: 24px 0;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
}

.function-tabs {
  margin-top: 20px;
}

.function-list {
  list-style: none;
  padding: 0;
}

.function-list li {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  line-height: 1.6;
}

.function-list li:last-child {
  border-bottom: none;
}

.operation-flow {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flow-step {
  display: flex;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #234fa2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 16px;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #262626;
}

.step-content p {
  margin: 0;
  color: #595959;
  line-height: 1.6;
}

.task-features {
  margin: 20px 0;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
}

.task-features h4 {
  color: #234fa2;
  margin-bottom: 12px;
}

.task-features ul {
  list-style: none;
  padding: 0;
}

.task-features li {
  padding: 6px 0;
  position: relative;
  padding-left: 20px;
}

.task-features li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #234fa2;
  font-weight: bold;
}

.guide-steps {
  margin-top: 20px;
}

.guide-steps ol {
  padding-left: 20px;
}

.guide-steps li {
  padding: 4px 0;
  line-height: 1.6;
}

.team-management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.management-card {
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.management-card h4 {
  color: #234fa2;
  margin-bottom: 16px;
  font-size: 16px;
}

.management-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.management-card li {
  padding: 6px 0;
  position: relative;
  padding-left: 20px;
  line-height: 1.5;
}

.management-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #52c41a;
  font-weight: bold;
}

.resource-types {
  margin: 20px 0;
}

.resource-type-card {
  text-align: center;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

/* 角色卡片样式 */
.role-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.role-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.role-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.role-icon {
  font-size: 24px;
  margin-right: 12px;
}

.role-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.role-content p {
  margin-bottom: 12px;
  color: #666;
}

.role-content ul {
  margin: 12px 0;
  padding-left: 20px;
}

.role-content li {
  margin-bottom: 6px;
  color: #555;
}

.manager-role {
  border-left: 4px solid #2d5a2d;
}

.manager-role .role-icon {
  color: #2d5a2d;
}

.pm-role {
  border-left: 4px solid #1e3a8a;
}

.pm-role .role-icon {
  color: #1e3a8a;
}

.team-role {
  border-left: 4px solid #581c87;
}

.team-role .role-icon {
  color: #581c87;
}

/* 流程图容器样式 */
.flow-diagram-container {
  margin: 24px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.diagram-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.manager-legend {
  background: #2d5a2d;
}

.pm-legend {
  background: #1e3a8a;
}

.team-legend {
  background: #581c87;
}

.auto-legend {
  background: #b45309;
}

.parallel-legend {
  background: #991b1b;
}

.mermaid-container {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}

.mermaid-container pre {
  margin: 0;
  background: transparent;
  border: none;
  padding: 0;
}

.mermaid-diagram {
  text-align: center;
  padding: 20px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mermaid-diagram svg {
  max-width: 100%;
  height: auto;
}

/* 快速入门步骤样式 */
.quick-start-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #f8faff;
  border-radius: 12px;
  border: 1px solid #e6eaf2;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #234fa2;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.step-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.resource-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.resource-type-card h4 {
  margin: 0 0 8px 0;
  color: #262626;
}

.resource-type-card p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.5;
}

/* 归档功能样式 */
.archive-feature-single {
  text-align: center;
  padding: 24px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
  max-width: 800px;
  margin: 0 auto;
}

.archive-feature-single:hover {
  border-color: #1890ff;
  background: #f0f9ff;
}

.archive-feature-single .archive-icon {
  font-size: 2.5em;
  margin-bottom: 16px;
}

.archive-feature-single .feature-list {
  text-align: left;
  margin-top: 16px;
}

.data-isolation-info {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
  margin-top: 20px;
}

.isolation-details h4 {
  color: #234fa2;
  margin-bottom: 12px;
}

.optimization-tips {
  margin-top: 20px;
}

.optimization-tips h4 {
  color: #234fa2;
  margin-bottom: 12px;
}

.optimization-tips ul {
  list-style: none;
  padding: 0;
}

.optimization-tips li {
  padding: 6px 0;
  position: relative;
  padding-left: 20px;
  line-height: 1.6;
}

.optimization-tips li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #fa8c16;
  font-weight: bold;
}

.analytics-features {
  margin-top: 20px;
}

.analysis-content ul {
  list-style: none;
  padding: 0;
}

.analysis-content li {
  padding: 8px 0;
  position: relative;
  padding-left: 20px;
  line-height: 1.6;
}

.analysis-content li::before {
  content: '📊';
  position: absolute;
  left: 0;
  font-size: 14px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.kpi-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.kpi-label {
  display: block;
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.kpi-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #234fa2;
}

.report-types {
  margin-top: 20px;
}

.report-card {
  text-align: center;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.report-card h4 {
  margin: 0 0 8px 0;
  color: #262626;
}

.report-card p {
  margin: 0 0 16px 0;
  color: #8c8c8c;
  font-size: 14px;
}

.support-info {
  margin-top: 16px;
}

.support-item {
  text-align: center;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.support-item h4 {
  margin: 16px 0 8px 0;
  color: #262626;
}

.support-item p {
  margin: 4px 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-guide-container {
    padding: 16px;
  }
  
  .help-header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .help-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-item {
    flex-direction: column;
    text-align: center;
  }
  
  .nav-icon {
    margin: 0 0 12px 0;
  }
}
</style>