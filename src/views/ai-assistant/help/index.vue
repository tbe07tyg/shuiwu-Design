<template>
  <div class="ai-help-guide-container">
    <a-card class="help-header" :bordered="false">
      <div class="help-header-content">
        <div class="help-icon">
          <RobotOutlined />
        </div>
        <div class="help-title-section">
          <h1>AI助手使用指南</h1>
          <p>了解如何充分利用AI助手提升工作效率</p>
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

      <!-- AI助手概述 -->
      <a-card id="overview" title="🤖 AI助手概述" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>什么是AI助手？</h3>
          <p>AI助手是基于先进的人工智能技术开发的智能工作伙伴，能够为不同角色的用户提供个性化的工作支持和决策建议。</p>
          
          <div class="ai-capabilities">
            <a-row :gutter="24">
              <a-col :span="8">
                <div class="capability-card">
                  <div class="capability-icon">🧠</div>
                  <h4>智能分析</h4>
                  <p>深度分析项目数据，提供洞察和建议</p>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="capability-card">
                  <div class="capability-icon">💬</div>
                  <h4>自然对话</h4>
                  <p>支持自然语言交互，理解复杂需求</p>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="capability-card">
                  <div class="capability-icon">⚡</div>
                  <h4>实时响应</h4>
                  <p>24/7在线服务，即时响应您的需求</p>
                </div>
              </a-col>
            </a-row>
          </div>

          <h3>支持的角色</h3>
          <div class="role-overview">
            <div class="role-card" v-for="role in supportedRoles" :key="role.key">
              <div class="role-icon" :style="{ backgroundColor: role.bgColor, color: role.color }">
                <component :is="role.icon" />
              </div>
              <div class="role-info">
                <h4>{{ role.title }}</h4>
                <p>{{ role.description }}</p>
                <ul>
                  <li v-for="feature in role.features" :key="feature">{{ feature }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 项目经理AI助手 -->
      <a-card id="project-manager" title="👨‍💼 项目经理AI助手" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>功能特色</h3>
          <p>专为项目经理设计的AI助手，提供项目管理全流程的智能支持。</p>
          
          <div class="feature-showcase">
            <a-tabs v-model:activeKey="pmActiveTab" type="card">
              <a-tab-pane key="dashboard" tab="智能仪表板">
                <div class="tab-content">
                  <h4>📊 项目概览分析</h4>
                  <ul class="feature-list">
                    <li>实时监控项目进度和关键指标</li>
                    <li>自动识别项目风险和瓶颈</li>
                    <li>生成项目健康度评估报告</li>
                    <li>提供下一步行动建议</li>
                  </ul>
                  
                  <div class="demo-section">
                    <h4>💡 示例对话</h4>
                    <div class="conversation-demo">
                      <div class="message user-message">
                        <div class="message-content">帮我分析一下当前项目的整体状况</div>
                      </div>
                      <div class="message ai-message">
                        <div class="message-content">
                          根据数据分析，您当前管理的8个项目中：<br/>
                          ✅ 5个项目进展顺利，按计划执行<br/>
                          ⚠️ 2个项目存在轻微延期风险<br/>
                          🔴 1个项目需要立即关注<br/><br/>
                          建议优先处理"智慧水务升级项目"，该项目预算执行率已达95%，但进度仅完成70%。
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="analysis" tab="智能分析">
                <div class="tab-content">
                  <h4>🎯 深度分析功能</h4>
                  <ul class="feature-list">
                    <li>团队绩效分析和优化建议</li>
                    <li>资源配置效率评估</li>
                    <li>项目风险预测和预警</li>
                    <li>成本控制和预算分析</li>
                  </ul>
                  
                  <div class="analysis-types">
                    <a-row :gutter="16">
                      <a-col :span="12">
                        <div class="analysis-card">
                          <h4>📈 趋势分析</h4>
                          <p>分析项目进度趋势，预测完成时间</p>
                        </div>
                      </a-col>
                      <a-col :span="12">
                        <div class="analysis-card">
                          <h4>⚠️ 风险评估</h4>
                          <p>识别潜在风险，提供防范措施</p>
                        </div>
                      </a-col>
                    </a-row>
                  </div>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="operations" tab="快速操作">
                <div class="tab-content">
                  <h4>⚡ 智能操作功能</h4>
                  <ul class="feature-list">
                    <li>一键生成项目报告</li>
                    <li>智能任务分配建议</li>
                    <li>自动会议纪要生成</li>
                    <li>项目计划优化建议</li>
                  </ul>
                  
                  <div class="quick-actions">
                    <h4>🎛️ 常用快速操作</h4>
                    <div class="action-grid">
                      <div class="action-item">📊 生成周报</div>
                      <div class="action-item">⚠️ 风险分析</div>
                      <div class="action-item">⚡ 资源优化</div>
                      <div class="action-item">📋 任务重排</div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </a-card>

      <!-- 团队成员AI助手 -->
      <a-card id="team-member" title="👤 团队成员AI助手" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>功能特色</h3>
          <p>为团队成员量身定制的AI助手，帮助提升个人工作效率和专业技能。</p>
          
          <div class="member-features">
            <a-row :gutter="24">
              <a-col :span="12">
                <div class="feature-group">
                  <h4>📝 工作指导</h4>
                  <ul>
                    <li>任务执行流程指导</li>
                    <li>技术问题解答</li>
                    <li>最佳实践推荐</li>
                    <li>工作效率提升建议</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="feature-group">
                  <h4>🎓 技能提升</h4>
                  <ul>
                    <li>个性化学习计划制定</li>
                    <li>技能缺口分析</li>
                    <li>学习资源推荐</li>
                    <li>进度跟踪和评估</li>
                  </ul>
                </div>
              </a-col>
            </a-row>
          </div>

          <h3>典型使用场景</h3>
          <div class="scenario-examples">
            <a-collapse>
              <a-collapse-panel key="1" header="如何高效完成复杂任务？">
                <div class="scenario-content">
                  <p><strong>场景：</strong>接到一个复杂的技术开发任务，不知如何入手。</p>
                  <p><strong>AI助手支持：</strong></p>
                  <ul>
                    <li>分析任务复杂度，制定分步骤执行计划</li>
                    <li>推荐相关技术资料和最佳实践</li>
                    <li>提供同类项目的经验参考</li>
                    <li>实时答疑解惑，解决技术难点</li>
                  </ul>
                </div>
              </a-collapse-panel>
              
              <a-collapse-panel key="2" header="如何制定个人技能提升计划？">
                <div class="scenario-content">
                  <p><strong>场景：</strong>希望提升专业技能，但不知道从何开始。</p>
                  <p><strong>AI助手支持：</strong></p>
                  <ul>
                    <li>评估当前技能水平和项目需求</li>
                    <li>识别技能缺口和提升优先级</li>
                    <li>制定个性化学习路径</li>
                    <li>推荐学习资源和实践机会</li>
                  </ul>
                </div>
              </a-collapse-panel>
              
              <a-collapse-panel key="3" header="如何有效沟通和协作？">
                <div class="scenario-content">
                  <p><strong>场景：</strong>在跨部门协作中遇到沟通障碍。</p>
                  <p><strong>AI助手支持：</strong></p>
                  <ul>
                    <li>分析沟通问题的根本原因</li>
                    <li>提供沟通技巧和话术建议</li>
                    <li>推荐协作工具和方法</li>
                    <li>制定冲突解决方案</li>
                  </ul>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </div>
      </a-card>

      <!-- 管理层AI助手 -->
      <a-card id="management" title="🏢 管理层AI助手" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>功能特色</h3>
          <p>面向管理层的战略级AI助手，提供高层决策支持和战略分析。</p>
          
          <div class="management-dashboard">
            <a-row :gutter="24">
              <a-col :span="8">
                <div class="mgmt-feature-card">
                  <div class="card-icon">📊</div>
                  <h4>业务概览</h4>
                  <p>全公司业务数据聚合分析</p>
                  <ul>
                    <li>关键业务指标监控</li>
                    <li>部门绩效对比</li>
                    <li>收入和成本分析</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="mgmt-feature-card">
                  <div class="card-icon">🎯</div>
                  <h4>战略分析</h4>
                  <p>深度战略洞察和建议</p>
                  <ul>
                    <li>市场趋势分析</li>
                    <li>竞争对手研究</li>
                    <li>战略机会识别</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="mgmt-feature-card">
                  <div class="card-icon">💼</div>
                  <h4>决策支持</h4>
                  <p>基于数据的决策建议</p>
                  <ul>
                    <li>投资回报率分析</li>
                    <li>风险评估报告</li>
                    <li>资源配置优化</li>
                  </ul>
                </div>
              </a-col>
            </a-row>
          </div>

          <h3>高级分析功能</h3>
          <div class="advanced-analytics">
            <a-tabs v-model:activeKey="mgmtActiveTab" type="card">
              <a-tab-pane key="investment" tab="投资分析">
                <div class="tab-content">
                  <h4>💰 投资决策支持</h4>
                  <p>AI助手为您的投资决策提供全面的数据支持和分析建议。</p>
                  
                  <div class="investment-metrics">
                    <div class="metric-card">
                      <div class="metric-value">15.2%</div>
                      <div class="metric-label">预期ROI</div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-value">2.3年</div>
                      <div class="metric-label">回收周期</div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-value">中等</div>
                      <div class="metric-label">风险等级</div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="performance" tab="绩效分析">
                <div class="tab-content">
                  <h4>📈 组织绩效洞察</h4>
                  <p>深入分析组织各层面的绩效表现，识别改进机会。</p>
                  
                  <ul class="feature-list">
                    <li>部门效率对比分析</li>
                    <li>员工满意度趋势</li>
                    <li>产出质量评估</li>
                    <li>改进建议和行动计划</li>
                  </ul>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="strategy" tab="战略规划">
                <div class="tab-content">
                  <h4>🎯 战略规划助手</h4>
                  <p>结合内外部环境分析，为企业战略规划提供智能支持。</p>
                  
                  <div class="strategy-framework">
                    <div class="framework-item">
                      <h4>SWOT分析</h4>
                      <p>优势、劣势、机会、威胁的全面分析</p>
                    </div>
                    <div class="framework-item">
                      <h4>市场定位</h4>
                      <p>基于数据的市场定位建议</p>
                    </div>
                    <div class="framework-item">
                      <h4>资源配置</h4>
                      <p>最优资源分配方案</p>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </a-card>

      <!-- 使用技巧 -->
      <a-card id="tips" title="💡 使用技巧" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>如何提高AI对话效果？</h3>
          
          <div class="tips-grid">
            <div class="tip-card">
              <div class="tip-icon">🎯</div>
              <h4>明确描述需求</h4>
              <p>详细描述您的问题和期望的结果，避免模糊表达。</p>
              <div class="example">
                <strong>✅ 好的提问：</strong> "请分析项目A的进度延迟原因，并提供改进建议"<br/>
                <strong>❌ 不好的提问：</strong> "项目有问题"
              </div>
            </div>
            
            <div class="tip-card">
              <div class="tip-icon">📋</div>
              <h4>提供背景信息</h4>
              <p>告诉AI相关的背景信息和约束条件，获得更准确的建议。</p>
              <div class="example">
                <strong>✅ 好的提问：</strong> "在预算限制50万元的情况下，如何优化研发团队的资源配置？"
              </div>
            </div>
            
            <div class="tip-card">
              <div class="tip-icon">🔄</div>
              <h4>互动式对话</h4>
              <p>通过追问和澄清，逐步细化问题，获得更深入的分析。</p>
              <div class="example">
                <strong>💭 对话示例：</strong><br/>
                用户："项目进度如何？"<br/>
                AI："整体进度75%，需要具体分析哪个方面？"<br/>
                用户："重点关注风险项目"
              </div>
            </div>
            
            <div class="tip-card">
              <div class="tip-icon">📊</div>
              <h4>结合数据分析</h4>
              <p>AI能够分析系统中的实时数据，提出基于数据的建议。</p>
              <div class="example">
                <strong>💡 建议：</strong> 在提问时引用具体的项目名称、时间范围等，AI会自动关联相关数据。
              </div>
            </div>
          </div>

          <h3>常用指令模板</h3>
          <div class="command-templates">
            <a-collapse>
              <a-collapse-panel key="1" header="项目分析模板">
                <div class="template-content">
                  <h4>📊 项目状态分析</h4>
                  <code>"请分析项目[项目名称]的当前状态，包括进度、预算执行、风险评估和下一步建议"</code>
                  
                  <h4>⚠️ 风险评估</h4>
                  <code>"识别项目[项目名称]的潜在风险，并提供风险缓解方案"</code>
                  
                  <h4>📈 趋势预测</h4>
                  <code>"基于历史数据，预测项目[项目名称]的完成时间和可能的挑战"</code>
                </div>
              </a-collapse-panel>
              
              <a-collapse-panel key="2" header="团队管理模板">
                <div class="template-content">
                  <h4>👥 团队绩效</h4>
                  <code>"分析团队成员[成员姓名/全团队]的工作绩效，包括任务完成率、工作量分布和改进建议"</code>
                  
                  <h4>🎯 任务分配</h4>
                  <code>"根据团队成员的技能和工作负载，为新任务[任务描述]推荐最佳分配方案"</code>
                </div>
              </a-collapse-panel>
              
              <a-collapse-panel key="3" header="决策支持模板">
                <div class="template-content">
                  <h4>💰 投资决策</h4>
                  <code>"分析投资项目[项目名称]的可行性，包括ROI预测、风险评估和竞争分析"</code>
                  
                  <h4>📋 资源配置</h4>
                  <code>"在预算[预算金额]和时间[时间限制]约束下，为[业务目标]制定最优资源配置方案"</code>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </div>
      </a-card>

      <!-- 设置与个性化 -->
      <a-card id="settings" title="⚙️ 设置与个性化" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>个性化设置</h3>
          <p>根据您的工作习惯和偏好，定制专属的AI助手体验。</p>
          
          <div class="settings-options">
            <a-row :gutter="24">
              <a-col :span="12">
                <div class="setting-group">
                  <h4>🎨 界面偏好</h4>
                  <ul>
                    <li>选择对话界面主题</li>
                    <li>调整字体大小和样式</li>
                    <li>设置消息显示密度</li>
                    <li>自定义快捷操作按钮</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="setting-group">
                  <h4>🔔 通知设置</h4>
                  <ul>
                    <li>设置重要提醒的推送方式</li>
                    <li>配置工作时间和免打扰时段</li>
                    <li>选择接收通知的类型</li>
                    <li>设置紧急情况的特殊提醒</li>
                  </ul>
                </div>
              </a-col>
            </a-row>
          </div>

          <h3>对话历史管理</h3>
          <div class="history-management">
            <div class="history-feature">
              <h4>📚 历史记录</h4>
              <p>AI助手会保存您的对话历史，便于回顾和延续之前的讨论。</p>
              <ul>
                <li>自动保存所有对话内容</li>
                <li>支持按时间、项目、主题搜索</li>
                <li>重要对话可标记收藏</li>
                <li>支持导出对话记录</li>
              </ul>
            </div>
            
            <div class="privacy-note">
              <a-alert
                message="隐私保护"
                description="所有对话数据都严格加密存储，仅用于改善AI服务质量。您可以随时删除历史记录或关闭数据收集功能。"
                type="info"
                show-icon
              />
            </div>
          </div>
        </div>
      </a-card>

      <!-- 常见问题 -->
      <a-card id="faq" title="❓ 常见问题" class="guide-section" :bordered="false">
        <div class="section-content">
          <a-collapse>
            <a-collapse-panel key="1" header="AI助手的回答准确吗？">
              <p>AI助手基于大量的训练数据和实时的系统数据进行分析，准确率较高。但建议将AI建议作为决策参考，结合实际情况进行判断。</p>
            </a-collapse-panel>
            
            <a-collapse-panel key="2" header="如何切换不同角色的AI助手？">
              <p>在AI助手界面顶部，您可以看到角色切换选项。点击相应的角色标签即可切换到对应的AI助手模式。</p>
            </a-collapse-panel>
            
            <a-collapse-panel key="3" header="AI助手能处理多语言吗？">
              <p>目前AI助手主要支持中文交互，未来版本将增加英文等多语言支持。</p>
            </a-collapse-panel>
            
            <a-collapse-panel key="4" header="对话记录会被其他人看到吗？">
              <p>不会。每个用户的对话记录都是私密的，只有您本人可以查看。系统管理员也无法访问具体的对话内容。</p>
            </a-collapse-panel>
            
            <a-collapse-panel key="5" header="AI助手无法理解我的问题怎么办？">
              <p>请尝试换个表达方式，提供更详细的背景信息，或将复杂问题分解为几个简单问题。如果仍有问题，可以联系技术支持。</p>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </a-card>

      <!-- 技术支持 -->
      <a-card title="📞 技术支持" class="guide-section" :bordered="false">
        <div class="support-info">
          <a-row :gutter="24">
            <a-col :span="8">
              <div class="support-item">
                <CustomerServiceOutlined style="font-size: 24px; color: #1890ff;" />
                <h4>在线客服</h4>
                <p>AI助手专线客服</p>
                <p>工作日 9:00-18:00</p>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="support-item">
                <BugOutlined style="font-size: 24px; color: #f5222d;" />
                <h4>问题反馈</h4>
                <p>feedback@company.com</p>
                <p>功能建议和bug报告</p>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="support-item">
                <BookOutlined style="font-size: 24px; color: #52c41a;" />
                <h4>帮助文档</h4>
                <p>详细使用手册</p>
                <p>持续更新</p>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  RobotOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  BugOutlined,
  BookOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const pmActiveTab = ref('dashboard')
const mgmtActiveTab = ref('investment')

// 快速导航数据
const quickNav = ref([
  {
    key: 'overview',
    title: 'AI助手概述',
    description: '了解AI助手能力',
    icon: 'RobotOutlined',
    color: '#1890ff'
  },
  {
    key: 'project-manager',
    title: '项目经理助手',
    description: '项目管理智能支持',
    icon: 'UserOutlined',
    color: '#52c41a'
  },
  {
    key: 'team-member',
    title: '团队成员助手',
    description: '个人效率提升',
    icon: 'TeamOutlined',
    color: '#fa8c16'
  },
  {
    key: 'management',
    title: '管理层助手',
    description: '战略决策支持',
    icon: 'BankOutlined',
    color: '#eb2f96'
  },
  {
    key: 'tips',
    title: '使用技巧',
    description: '提高对话效果',
    icon: 'SettingOutlined',
    color: '#722ed1'
  },
  {
    key: 'settings',
    title: '个性化设置',
    description: '定制专属体验',
    icon: 'SettingOutlined',
    color: '#13c2c2'
  }
])

// 支持的角色数据
const supportedRoles = ref([
  {
    key: 'project-manager',
    title: '项目经理',
    description: '专业的项目管理智能助手',
    icon: 'UserOutlined',
    color: '#1890ff',
    bgColor: '#e6f7ff',
    features: [
      '项目进度实时监控',
      '团队绩效分析',
      '风险预警和建议',
      '资源配置优化'
    ]
  },
  {
    key: 'team-member',
    title: '团队成员',
    description: '个人工作效率提升助手',
    icon: 'TeamOutlined',
    color: '#52c41a',
    bgColor: '#f6ffed',
    features: [
      '任务执行指导',
      '技能提升规划',
      '工作流程优化',
      '问题解决支持'
    ]
  },
  {
    key: 'management',
    title: '管理层',
    description: '战略级决策支持助手',
    icon: 'BankOutlined',
    color: '#fa8c16',
    bgColor: '#fff7e6',
    features: [
      '业务数据分析',
      '投资决策支持',
      '战略规划建议',
      '组织绩效评估'
    ]
  }
])

// 滚动到指定章节
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  // 页面加载后的初始化操作
})
</script>

<style scoped>
/* 基础样式与项目经理后台指南相同，这里只列出差异化样式 */

.ai-help-guide-container {
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

.nav-card,
.guide-section {
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

.ai-capabilities {
  margin: 24px 0;
}

.capability-card {
  text-align: center;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.capability-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.capability-card h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.capability-card p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.5;
}

.role-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.role-card {
  display: flex;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.role-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.role-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
  flex-shrink: 0;
}

.role-info {
  flex: 1;
}

.role-info h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-size: 18px;
  font-weight: 600;
}

.role-info p {
  margin: 0 0 12px 0;
  color: #595959;
  line-height: 1.6;
}

.role-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.role-info li {
  padding: 4px 0;
  position: relative;
  padding-left: 16px;
  color: #8c8c8c;
  font-size: 14px;
}

.role-info li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #52c41a;
  font-weight: bold;
}

.feature-showcase {
  margin-top: 20px;
}

.tab-content {
  padding: 20px 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.feature-list li {
  padding: 8px 0;
  position: relative;
  padding-left: 20px;
  line-height: 1.6;
}

.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #52c41a;
  font-weight: bold;
}

.demo-section {
  margin-top: 24px;
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
}

.conversation-demo {
  margin-top: 16px;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
}

.user-message .message-content {
  background: #234fa2;
  color: white;
}

.ai-message .message-content {
  background: white;
  border: 1px solid #f0f0f0;
  color: #262626;
}

.analysis-types,
.member-features {
  margin-top: 20px;
}

.analysis-card,
.feature-group {
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.analysis-card h4,
.feature-group h4 {
  margin: 0 0 12px 0;
  color: #234fa2;
  font-weight: 600;
}

.analysis-card p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.feature-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-group li {
  padding: 6px 0;
  position: relative;
  padding-left: 16px;
  color: #595959;
}

.feature-group li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #fa8c16;
  font-weight: bold;
}

.quick-actions {
  margin-top: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.action-item {
  padding: 12px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-item:hover {
  border-color: #234fa2;
  background: #f8f9ff;
}

.scenario-examples {
  margin-top: 20px;
}

.scenario-content {
  padding: 16px 0;
}

.scenario-content p {
  margin: 8px 0;
  line-height: 1.6;
}

.scenario-content ul {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.scenario-content li {
  padding: 4px 0;
  position: relative;
  padding-left: 16px;
  line-height: 1.5;
}

.scenario-content li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #1890ff;
  font-weight: bold;
}

.management-dashboard {
  margin: 20px 0;
}

.mgmt-feature-card {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  text-align: center;
  height: 100%;
}

.card-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.mgmt-feature-card h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.mgmt-feature-card p {
  margin: 0 0 16px 0;
  color: #8c8c8c;
  font-size: 14px;
}

.mgmt-feature-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.mgmt-feature-card li {
  padding: 4px 0;
  position: relative;
  padding-left: 16px;
  font-size: 13px;
  color: #595959;
}

.mgmt-feature-card li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #52c41a;
}

.advanced-analytics {
  margin-top: 20px;
}

.investment-metrics {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.metric-card {
  flex: 1;
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #234fa2;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #8c8c8c;
}

.strategy-framework {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.framework-item {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.framework-item h4 {
  margin: 0 0 8px 0;
  color: #234fa2;
  font-weight: 600;
}

.framework-item p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.5;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tip-card {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.tip-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.tip-card h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.tip-card p {
  margin: 0 0 12px 0;
  color: #595959;
  line-height: 1.6;
}

.example {
  padding: 12px;
  background: #f6ffed;
  border-radius: 8px;
  border-left: 4px solid #52c41a;
  font-size: 14px;
  line-height: 1.5;
}

.command-templates {
  margin-top: 20px;
}

.template-content {
  padding: 16px 0;
}

.template-content h4 {
  margin: 16px 0 8px 0;
  color: #234fa2;
  font-weight: 600;
}

.template-content code {
  display: block;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 8px;
  word-wrap: break-word;
}

.settings-options {
  margin: 20px 0;
}

.setting-group {
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.setting-group h4 {
  margin: 0 0 12px 0;
  color: #234fa2;
  font-weight: 600;
}

.setting-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.setting-group li {
  padding: 6px 0;
  position: relative;
  padding-left: 16px;
  color: #595959;
  line-height: 1.5;
}

.setting-group li::before {
  content: '⚙️';
  position: absolute;
  left: 0;
  font-size: 12px;
}

.history-management {
  margin-top: 20px;
}

.history-feature {
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
  margin-bottom: 16px;
}

.history-feature h4 {
  margin: 0 0 8px 0;
  color: #234fa2;
  font-weight: 600;
}

.history-feature p {
  margin: 0 0 12px 0;
  color: #595959;
  line-height: 1.6;
}

.history-feature ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-feature li {
  padding: 4px 0;
  position: relative;
  padding-left: 16px;
  color: #595959;
  font-size: 14px;
}

.history-feature li::before {
  content: '📝';
  position: absolute;
  left: 0;
  font-size: 12px;
}

.privacy-note {
  margin-top: 16px;
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
  font-weight: 600;
}

.support-item p {
  margin: 4px 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-help-guide-container {
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
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-item {
    flex-direction: column;
    text-align: center;
  }
  
  .nav-icon {
    margin: 0 0 12px 0;
  }
  
  .role-card {
    flex-direction: column;
  }
  
  .role-icon {
    margin: 0 auto 16px auto;
  }
  
  .role-info {
    text-align: center;
  }
  
  .investment-metrics {
    flex-direction: column;
  }
}
</style>