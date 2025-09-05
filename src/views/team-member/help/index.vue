<template>
  <div class="team-help-guide-container">
    <a-card class="help-header" :bordered="false">
      <div class="help-header-content">
        <div class="help-icon">
          <CheckSquareOutlined />
        </div>
        <div class="help-title-section">
          <h1>我的任务看板使用指南</h1>
          <p>三列看板 · 拖拽流转 · 进度与材料一体化 · 与PM实时联动</p>
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

      <!-- 工作台概述 -->
      <a-card id="overview" title="📋 看板概述" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>什么是“我的任务看板”？</h3>
          <p>采用待开始 → 进行中 → 已完成三列布局。支持拖拽变更状态、卡片快捷操作、详情抽屉更新进度与提交材料，并与项目经理监控页实时联动与未读提醒。</p>
          
          <div class="workspace-features">
            <a-row :gutter="24">
              <a-col :span="8">
                <div class="feature-highlight">
                  <div class="feature-icon">📋</div>
                  <h4>任务中心</h4>
                  <p>统一管理所有工作任务，清晰展示优先级和截止时间</p>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="feature-highlight">
                  <div class="feature-icon">📊</div>
                  <h4>项目协作</h4>
                  <p>参与项目的进展一目了然，团队沟通更加顺畅</p>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="feature-highlight">
                  <div class="feature-icon">🎓</div>
                  <h4>技能成长</h4>
                  <p>AI定制化学习计划，助力个人职业发展</p>
                </div>
              </a-col>
            </a-row>
          </div>

          <h3>核心价值</h3>
          <div class="value-proposition">
            <div class="value-card">
              <div class="value-number">01</div>
              <div class="value-content">
                <h4>效率提升</h4>
                <p>通过智能任务管理和工作流程优化，提升30%的工作效率</p>
              </div>
            </div>
            <div class="value-card">
              <div class="value-number">02</div>
              <div class="value-content">
                <h4>能力发展</h4>
                <p>AI驱动的个性化学习计划，助力职业技能持续提升</p>
              </div>
            </div>
            <div class="value-card">
              <div class="value-number">03</div>
              <div class="value-content">
                <h4>团队协作</h4>
                <p>无缝集成的团队协作工具，让沟通更高效，合作更顺畅</p>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 个人信息管理 -->
      <a-card v-if="false" id="profile" title="👨‍💼 个人信息管理" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>个人概览卡片</h3>
          <p>工作台顶部的个人概览卡片展示您的基本信息和工作统计。</p>
          
          <div class="profile-demo">
            <div class="demo-card">
              <div class="demo-avatar">👨‍💻</div>
              <div class="demo-info">
                <h4>张三 - 高级开发工程师</h4>
                <p>研发部 · 工作2年</p>
                <div class="demo-stats">
                  <span class="stat-item">任务完成率: 92%</span>
                  <span class="stat-item">参与项目: 5个</span>
                  <span class="stat-item">本月工时: 168h</span>
                </div>
              </div>
            </div>
          </div>

          <h3>信息维护</h3>
          <div class="info-management">
            <a-row :gutter="16">
              <a-col :span="12">
                <div class="info-section">
                  <h4>📝 基本信息</h4>
                  <ul>
                    <li>姓名、职位、部门信息</li>
                    <li>联系方式和邮箱</li>
                    <li>工作年限和入职时间</li>
                    <li>个人头像和签名</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="info-section">
                  <h4>💼 专业信息</h4>
                  <ul>
                    <li>技能标签和等级</li>
                    <li>专业认证和证书</li>
                    <li>工作经历和项目经验</li>
                    <li>兴趣爱好和特长</li>
                  </ul>
                </div>
              </a-col>
            </a-row>
          </div>

          <div class="tip-box">
            <a-alert
              message="💡 小贴士"
              description="定期更新个人信息和技能标签，有助于项目经理更好地进行任务分配，也能让AI助手提供更精准的建议。"
              type="info"
              show-icon
            />
          </div>
        </div>
      </a-card>

      <!-- 任务管理 -->
      <a-card id="tasks" title="✅ 看板使用指南" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>任务管理功能</h3>
          <p>任务管理是工作台的核心功能，帮助您高效管理所有工作任务。</p>
          
          <div class="task-workflow">
            <a-steps :current="2" size="small" direction="horizontal">
              <a-step title="接收任务" description="系统自动分配或手动领取" />
              <a-step title="执行任务" description="按计划推进任务进度" />
              <a-step title="进度更新" description="实时更新任务状态" />
              <a-step title="完成确认" description="提交成果等待验收" />
            </a-steps>
          </div>

          <h3>任务状态管理（与PM实时联动）</h3>
          <div class="task-states">
            <div class="state-item">
              <div class="state-indicator pending"></div>
              <div class="state-info">
                <h4>待开始 (pending)</h4>
                <p>新分配或被PM重置的任务，进度为0%</p>
                <div class="state-actions">
                  <span class="action-tag">可操作：开始任务、申请延期；PM可在监控页直接开始或重置</span>
                </div>
              </div>
            </div>
            
            <div class="state-item">
              <div class="state-indicator in-progress"></div>
              <div class="state-info">
                <h4>进行中 (active)</h4>
                <p>正在执行的任务，需要定期更新进度</p>
                <div class="state-actions">
                  <span class="action-tag">可操作：更新进度、暂停任务；PM可在监控页更新</span>
                </div>
              </div>
            </div>
            
            <div class="state-item">
              <div class="state-indicator completed"></div>
              <div class="state-info">
                <h4>已完成 (completed)</h4>
                <p>任务执行完毕，等待验收或已通过验收</p>
                <div class="state-actions">
                  <span class="action-tag">可操作：查看反馈、经验总结</span>
                </div>
              </div>
            </div>
            
            <div class="state-item">
              <div class="state-indicator overdue"></div>
              <div class="state-info">
                <h4>逾期</h4>
                <p>超过截止时间的任务，需要紧急处理</p>
                <div class="state-actions">
                  <span class="action-tag">可操作：加急处理、申请延期、说明原因</span>
                </div>
              </div>
            </div>
          </div>

          <h3>任务操作指南（看板 + PM监控双向同步）</h3>
          <div class="operation-guide">
            <a-collapse>
              <a-collapse-panel key="1" header="如何高效处理待办任务？">
                <div class="guide-content">
                  <h4>🎯 任务优先级管理</h4>
                  <ol>
                    <li><strong>紧急重要：</strong>立即处理，优先级最高</li>
                    <li><strong>重要不紧急：</strong>合理安排时间，确保质量</li>
                    <li><strong>紧急不重要：</strong>快速处理或委托他人</li>
                    <li><strong>不紧急不重要：</strong>适当延后或取消</li>
                  </ol>
                  
                  <h4>📋 每日任务管理建议</h4>
                  <ul>
                    <li>每天开始工作前，查看当日任务列表</li>
                    <li>根据优先级和截止时间制定执行顺序</li>
                    <li>将大任务拆分为小的可执行步骤</li>
                    <li>及时更新任务进度，保持透明度</li>
                  </ul>
                </div>
              </a-collapse-panel>
              
              <a-collapse-panel key="2" header="如何有效更新任务进度？">
                <div class="guide-content">
                  <h4>📊 进度更新最佳实践</h4>
                  <ul>
                    <li><strong>定期更新：</strong>建议每天或每2天更新一次进度</li>
                    <li><strong>具体描述：</strong>详细说明已完成的工作内容</li>
                    <li><strong>遇到问题及时反馈：</strong>不要等到截止日期才报告问题</li>
                    <li><strong>附上证据：</strong>如截图、文档等佐证材料</li>
                  </ul>
                  
                  <div class="progress-example">
                    <h4>💡 进度更新示例</h4>
                    <div class="example-box">
                      <strong>良好示例：</strong><br/>
                      "数据库设计已完成80%，完成了用户表、订单表的设计，明天将完成商品表设计。预计按时完成。"<br/><br/>
                      <strong>不佳示例：</strong><br/>
                      "进行中"
                    </div>
                  </div>
                </div>
              </a-collapse-panel>
              
              
              
              <a-collapse-panel key="sync" header="与PM监控页如何实时同步？">
                <div class="guide-content">
                  <ul>
                    <li>当PM在监控页“开始任务/重置任务”时：看板会自动同步状态与进度；首次进入时也会从缓存兜底合并。</li>
                    <li>当你在看板“更新进度/提交材料”时：PM监控页会弹出提醒、WBS节点高亮、角标累加。</li>
                    <li>如果未看到同步：刷新页面或等待1秒让兜底合并生效。</li>
                  </ul>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </div>
      </a-card>

      <!-- 项目协作 -->
      <a-card v-if="false" id="projects" title="🤝 项目协作" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>项目参与管理</h3>
          <p>在项目协作区域，您可以查看参与的所有项目信息，了解项目进展和自己的贡献。</p>
          
          <div class="project-roles">
            <h4>🎭 项目角色类型</h4>
            <a-row :gutter="16">
              <a-col :span="8">
                <div class="role-card">
                  <div class="role-badge core">核心成员</div>
                  <h4>核心开发者</h4>
                  <p>项目关键贡献者，承担重要模块开发</p>
                  <ul>
                    <li>参与项目决策</li>
                    <li>负责核心功能</li>
                    <li>指导初级成员</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="role-card">
                  <div class="role-badge regular">普通成员</div>
                  <h4>项目参与者</h4>
                  <p>按分工完成具体开发任务</p>
                  <ul>
                    <li>执行分配任务</li>
                    <li>参与团队协作</li>
                    <li>学习项目经验</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="role-card">
                  <div class="role-badge support">支持成员</div>
                  <h4>辅助支持者</h4>
                  <p>提供测试、文档等支持工作</p>
                  <ul>
                    <li>测试验证</li>
                    <li>文档编写</li>
                    <li>问题反馈</li>
                  </ul>
                </div>
              </a-col>
            </a-row>
          </div>

          <h3>协作最佳实践</h3>
          <div class="collaboration-practices">
            <a-tabs v-model:activeKey="collabActiveTab" type="card">
              <a-tab-pane key="communication" tab="有效沟通">
                <div class="practice-content">
                  <h4>💬 沟通技巧</h4>
                  <ul class="practice-list">
                    <li><strong>主动沟通：</strong>定期向团队汇报工作进展</li>
                    <li><strong>清晰表达：</strong>用简洁明了的语言描述问题</li>
                    <li><strong>积极反馈：</strong>及时回应团队成员的询问</li>
                    <li><strong>建设性意见：</strong>提出问题时同时给出解决建议</li>
                  </ul>
                  
                  <div class="communication-example">
                    <h4>📝 沟通示例</h4>
                    <div class="example-dialog">
                      <div class="dialog-item good">
                        <div class="dialog-label">✅ 良好沟通</div>
                        <div class="dialog-content">
                          "用户登录模块已完成开发，通过了单元测试。发现一个小问题：密码加密可能需要优化，建议使用bcrypt替代MD5。明天可以讨论一下具体方案。"
                        </div>
                      </div>
                      <div class="dialog-item bad">
                        <div class="dialog-label">❌ 不佳沟通</div>
                        <div class="dialog-content">
                          "登录做完了，有点问题。"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="knowledge" tab="知识共享">
                <div class="practice-content">
                  <h4>📚 知识管理</h4>
                  <ul class="practice-list">
                    <li><strong>文档记录：</strong>重要的解决方案要形成文档</li>
                    <li><strong>经验分享：</strong>在团队会议上分享学到的新技术</li>
                    <li><strong>问题总结：</strong>遇到的问题和解决方案要记录</li>
                    <li><strong>持续学习：</strong>关注行业新技术和最佳实践</li>
                  </ul>
                  
                  <div class="knowledge-tools">
                    <h4>🛠️ 知识工具</h4>
                    <div class="tool-grid">
                      <div class="tool-item">
                        <div class="tool-icon">📝</div>
                        <h4>技术文档</h4>
                        <p>API文档、设计文档</p>
                      </div>
                      <div class="tool-item">
                        <div class="tool-icon">💡</div>
                        <h4>经验笔记</h4>
                        <p>问题解决、学习心得</p>
                      </div>
                      <div class="tool-item">
                        <div class="tool-icon">🔍</div>
                        <h4>知识库</h4>
                        <p>团队共享资源</p>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="efficiency" tab="效率协作">
                <div class="practice-content">
                  <h4>⚡ 高效协作</h4>
                  <ul class="practice-list">
                    <li><strong>时间管理：</strong>合理安排工作时间，避免拖延</li>
                    <li><strong>工具使用：</strong>熟练使用项目管理和协作工具</li>
                    <li><strong>标准流程：</strong>遵循团队制定的工作流程</li>
                    <li><strong>质量意识：</strong>在速度和质量之间找到平衡</li>
                  </ul>
                  
                  <div class="efficiency-metrics">
                    <h4>📊 效率指标</h4>
                    <div class="metrics-grid">
                      <div class="metric-item">
                        <div class="metric-value">95%</div>
                        <div class="metric-label">任务按时完成率</div>
                      </div>
                      <div class="metric-item">
                        <div class="metric-value">4.8/5</div>
                        <div class="metric-label">代码质量评分</div>
                      </div>
                      <div class="metric-item">
                        <div class="metric-value">2小时</div>
                        <div class="metric-label">平均响应时间</div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </a-card>

      <!-- 技能提升 -->
      <a-card v-if="false" id="skills" title="🎓 技能提升" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>AI智能学习计划</h3>
          <p>基于您的当前技能水平和项目需求，AI助手为您量身定制个性化的学习计划。</p>
          
          <div class="learning-journey">
            <div class="journey-step">
              <div class="step-icon">🔍</div>
              <div class="step-content">
                <h4>技能评估</h4>
                <p>分析当前技能水平和项目需求匹配度</p>
              </div>
            </div>
            <div class="journey-arrow">→</div>
            <div class="journey-step">
              <div class="step-icon">🎯</div>
              <div class="step-content">
                <h4>目标设定</h4>
                <p>制定明确的学习目标和时间计划</p>
              </div>
            </div>
            <div class="journey-arrow">→</div>
            <div class="journey-step">
              <div class="step-icon">📚</div>
              <div class="step-content">
                <h4>学习执行</h4>
                <p>按计划学习，完成练习和项目实践</p>
              </div>
            </div>
            <div class="journey-arrow">→</div>
            <div class="journey-step">
              <div class="step-icon">📊</div>
              <div class="step-content">
                <h4>效果评估</h4>
                <p>评估学习效果，调整后续计划</p>
              </div>
            </div>
          </div>

          <h3>技能体系</h3>
          <div class="skill-categories">
            <a-row :gutter="16">
              <a-col :span="12">
                <div class="skill-category">
                  <h4>💻 技术技能</h4>
                  <div class="skill-tags">
                    <a-tag color="blue">编程语言</a-tag>
                    <a-tag color="green">框架工具</a-tag>
                    <a-tag color="orange">数据库</a-tag>
                    <a-tag color="purple">云平台</a-tag>
                    <a-tag color="red">测试工具</a-tag>
                  </div>
                  <p>专业技术能力是职业发展的基础</p>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="skill-category">
                  <h4>🤝 软技能</h4>
                  <div class="skill-tags">
                    <a-tag color="cyan">沟通协作</a-tag>
                    <a-tag color="lime">项目管理</a-tag>
                    <a-tag color="gold">问题解决</a-tag>
                    <a-tag color="magenta">领导力</a-tag>
                    <a-tag color="volcano">创新思维</a-tag>
                  </div>
                  <p>软技能决定职业发展的高度和广度</p>
                </div>
              </a-col>
            </a-row>
          </div>

          <h3>学习资源与路径</h3>
          <div class="learning-resources">
            <a-tabs v-model:activeKey="learningActiveTab" type="card">
              <a-tab-pane key="online" tab="在线学习">
                <div class="resource-content">
                  <h4>🌐 推荐平台</h4>
                  <div class="platform-grid">
                    <div class="platform-item">
                      <div class="platform-logo">📚</div>
                      <h4>慕课网</h4>
                      <p>专业的IT技能学习平台</p>
                      <div class="platform-features">
                        <span>视频课程</span>
                        <span>实战项目</span>
                        <span>认证考试</span>
                      </div>
                    </div>
                    <div class="platform-item">
                      <div class="platform-logo">🎓</div>
                      <h4>极客时间</h4>
                      <p>技术专栏和实战课程</p>
                      <div class="platform-features">
                        <span>专家专栏</span>
                        <span>技术趋势</span>
                        <span>实战案例</span>
                      </div>
                    </div>
                    <div class="platform-item">
                      <div class="platform-logo">💡</div>
                      <h4>GitHub</h4>
                      <p>开源项目学习和贡献</p>
                      <div class="platform-features">
                        <span>源码学习</span>
                        <span>项目贡献</span>
                        <span>技术交流</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="internal" tab="内部培训">
                <div class="resource-content">
                  <h4>🏢 公司培训体系</h4>
                  <ul class="training-list">
                    <li><strong>新人培训：</strong>公司文化、业务流程、技术规范</li>
                    <li><strong>技术分享：</strong>每周技术分享会，学习新技术</li>
                    <li><strong>导师制：</strong>资深员工一对一指导</li>
                    <li><strong>项目实战：</strong>在实际项目中学习和成长</li>
                  </ul>
                  
                  <div class="training-schedule">
                    <h4>📅 培训计划示例</h4>
                    <a-timeline>
                      <a-timeline-item color="blue">
                        <strong>第1周：</strong>入职培训和环境搭建
                      </a-timeline-item>
                      <a-timeline-item color="green">
                        <strong>第2-4周：</strong>基础项目实践和代码规范学习
                      </a-timeline-item>
                      <a-timeline-item color="orange">
                        <strong>第2-3月：</strong>参与真实项目开发
                      </a-timeline-item>
                      <a-timeline-item color="red">
                        <strong>第4-6月：</strong>独立负责模块开发
                      </a-timeline-item>
                    </a-timeline>
                  </div>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="certification" tab="认证考试">
                <div class="resource-content">
                  <h4>🏆 推荐认证</h4>
                  <div class="cert-categories">
                    <div class="cert-category">
                      <h4>☁️ 云平台认证</h4>
                      <ul>
                        <li>阿里云认证 (ACA/ACP/ACE)</li>
                        <li>腾讯云认证 (TCP/TCA)</li>
                        <li>华为云认证 (HCIA/HCIP/HCIE)</li>
                      </ul>
                    </div>
                    <div class="cert-category">
                      <h4>💻 技术认证</h4>
                      <ul>
                        <li>Oracle数据库认证 (OCA/OCP)</li>
                        <li>微软认证 (Azure/Office 365)</li>
                        <li>项目管理认证 (PMP/敏捷)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div class="cert-benefits">
                    <h4>🎁 认证价值</h4>
                    <a-row :gutter="16">
                      <a-col :span="8">
                        <div class="benefit-item">
                          <div class="benefit-icon">📈</div>
                          <h4>技能提升</h4>
                          <p>系统化学习专业知识</p>
                        </div>
                      </a-col>
                      <a-col :span="8">
                        <div class="benefit-item">
                          <div class="benefit-icon">💰</div>
                          <h4>薪资提升</h4>
                          <p>认证奖励和晋升机会</p>
                        </div>
                      </a-col>
                      <a-col :span="8">
                        <div class="benefit-item">
                          <div class="benefit-icon">🌟</div>
                          <h4>职业发展</h4>
                          <p>增强个人竞争力</p>
                        </div>
                      </a-col>
                    </a-row>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </a-card>

      <!-- AI助手集成 -->
      <a-card v-if="false" id="ai-integration" title="🤖 AI助手集成" class="guide-section" :bordered="false">
        <div class="section-content">
          <h3>智能工作伙伴</h3>
          <p>团队成员工作台集成了专属的AI助手，为您提供24/7的智能支持和指导。</p>
          
          <div class="ai-features">
            <a-row :gutter="24">
              <a-col :span="8">
                <div class="ai-feature-card">
                  <div class="feature-icon">💡</div>
                  <h4>智能建议</h4>
                  <p>基于您的工作模式和项目需求，提供个性化的工作建议</p>
                  <ul>
                    <li>任务优先级建议</li>
                    <li>时间安排优化</li>
                    <li>工作方法推荐</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="ai-feature-card">
                  <div class="feature-icon">🎓</div>
                  <h4>学习指导</h4>
                  <p>根据技能评估结果，制定个性化的学习计划</p>
                  <ul>
                    <li>技能缺口分析</li>
                    <li>学习路径规划</li>
                    <li>资源推荐</li>
                  </ul>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="ai-feature-card">
                  <div class="feature-icon">🛠️</div>
                  <h4>问题解决</h4>
                  <p>遇到技术问题时，AI助手可以提供解决思路</p>
                  <ul>
                    <li>错误诊断</li>
                    <li>解决方案推荐</li>
                    <li>最佳实践指导</li>
                  </ul>
                </div>
              </a-col>
            </a-row>
          </div>

          <h3>AI对话示例</h3>
          <div class="ai-conversation-demo">
            <div class="conversation-scenario">
              <h4>💬 工作规划对话</h4>
              <div class="conversation">
                <div class="message user">
                  <div class="avatar">👨‍💻</div>
                  <div class="content">今天有3个任务要做，但感觉时间不够，应该怎么安排？</div>
                </div>
                <div class="message ai">
                  <div class="avatar">🤖</div>
                  <div class="content">
                    让我帮您分析一下：<br/>
                    1. 用户登录模块测试 (紧急，2小时) - 建议优先处理<br/>
                    2. 数据库优化文档 (重要，3小时) - 可以分两天完成<br/>
                    3. 代码review (一般，1小时) - 可以安排在空闲时间<br/><br/>
                    建议今天先完成任务1和任务3，任务2明天处理。
                  </div>
                </div>
              </div>
            </div>
            
            <div class="conversation-scenario">
              <h4>🎯 技能提升对话</h4>
              <div class="conversation">
                <div class="message user">
                  <div class="avatar">👨‍💻</div>
                  <div class="content">我想学习微服务架构，应该从哪里开始？</div>
                </div>
                <div class="message ai">
                  <div class="avatar">🤖</div>
                  <div class="content">
                    基于您的Java开发经验，我为您制定了学习路径：<br/>
                    第1周：Spring Boot基础和微服务概念<br/>
                    第2周：Spring Cloud核心组件<br/>
                    第3周：服务注册与发现、配置中心<br/>
                    第4周：API网关和负载均衡<br/>
                    第5-6周：实战项目练习<br/><br/>
                    推荐资源：极客时间《微服务架构实战》课程
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      

      <!-- 技术支持 -->
      <a-card v-if="false" title="📞 技术支持" class="guide-section" :bordered="false">
        <div class="support-info">
          <a-row :gutter="24">
            <a-col :span="8">
              <div class="support-item">
                <TeamOutlined style="font-size: 24px; color: #1890ff;" />
                <h4>团队支持</h4>
                <p>内部技术交流群</p>
                <p>实时在线答疑</p>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="support-item">
                <UserOutlined style="font-size: 24px; color: #52c41a;" />
                <h4>导师指导</h4>
                <p>一对一专业指导</p>
                <p>定期面谈交流</p>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="support-item">
                <QuestionCircleOutlined style="font-size: 24px; color: #fa8c16;" />
                <h4>帮助中心</h4>
                <p>完整使用手册</p>
                <p>常见问题解答</p>
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
import { CheckSquareOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'

// 已移除非看板相关的tab状态

// 快速导航数据
const quickNav = ref([
  { key: 'overview', title: '看板概述', description: '三列布局与核心能力', icon: CheckSquareOutlined, color: '#1890ff' },
  { key: 'tasks', title: '看板使用', description: '拖拽/更新/材料/评论', icon: CheckSquareOutlined, color: '#fa8c16' }
])

// 滚动到指定章节
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 无初始化逻辑
</script>

<style scoped>
/* 基础样式继承前面的设计，这里只添加团队成员工作台特有的样式 */

.team-help-guide-container {
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

.feature-highlight {
  text-align: center;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.feature-highlight h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.feature-highlight p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.5;
}

.value-proposition {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.value-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.value-number {
  width: 48px;
  height: 48px;
  background: #234fa2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  margin-right: 20px;
  flex-shrink: 0;
}

.value-content h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.value-content p {
  margin: 0;
  color: #8c8c8c;
  line-height: 1.6;
}

.profile-demo {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.demo-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  max-width: 500px;
  width: 100%;
}

.demo-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0f5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
}

.demo-info h4 {
  margin: 0 0 4px 0;
  color: #262626;
  font-weight: 600;
}

.demo-info p {
  margin: 0 0 12px 0;
  color: #8c8c8c;
  font-size: 14px;
}

.demo-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 12px;
  color: #595959;
  background: #f6f8fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.info-management {
  margin: 20px 0;
}

.info-section {
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.info-section h4 {
  margin: 0 0 12px 0;
  color: #234fa2;
  font-weight: 600;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  padding: 6px 0;
  position: relative;
  padding-left: 16px;
  color: #595959;
  line-height: 1.5;
}

.info-section li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #52c41a;
  font-weight: bold;
}

.tip-box {
  margin-top: 20px;
}

.task-workflow {
  margin: 24px 0;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
}

.task-states {
  margin-top: 20px;
}

.state-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.state-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin: 4px 16px 0 0;
  flex-shrink: 0;
}

.state-indicator.pending {
  background: #faad14;
}

.state-indicator.in-progress {
  background: #1890ff;
}

.state-indicator.completed {
  background: #52c41a;
}

.state-indicator.overdue {
  background: #f5222d;
}

.state-info h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.state-info p {
  margin: 0 0 12px 0;
  color: #8c8c8c;
  line-height: 1.6;
}

.action-tag {
  display: inline-block;
  background: #f6f8fa;
  color: #24292e;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.operation-guide {
  margin-top: 20px;
}

.guide-content {
  padding: 16px 0;
}

.guide-content h4 {
  margin: 16px 0 8px 0;
  color: #234fa2;
  font-weight: 600;
}

.guide-content ol,
.guide-content ul {
  margin: 12px 0;
  padding-left: 20px;
}

.guide-content li {
  padding: 4px 0;
  line-height: 1.6;
}

.progress-example {
  margin-top: 16px;
}

.example-box {
  padding: 16px;
  background: #f6ffed;
  border-radius: 8px;
  border-left: 4px solid #52c41a;
  font-size: 14px;
  line-height: 1.6;
}

.help-channels {
  margin-top: 16px;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.channel-item {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.channel-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.channel-item h4 {
  margin: 0 0 4px 0;
  color: #262626;
  font-weight: 600;
}

.channel-item p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.project-roles {
  margin: 20px 0;
}

.role-card {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  text-align: center;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.role-badge.core {
  background: #e6f7ff;
  color: #1890ff;
}

.role-badge.regular {
  background: #f6ffed;
  color: #52c41a;
}

.role-badge.support {
  background: #fff7e6;
  color: #fa8c16;
}

.role-card h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.role-card p {
  margin: 0 0 16px 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.5;
}

.role-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.role-card li {
  padding: 4px 0;
  position: relative;
  padding-left: 16px;
  color: #595959;
  font-size: 13px;
}

.role-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #52c41a;
  font-weight: bold;
}

.collaboration-practices {
  margin-top: 20px;
}

.practice-content {
  padding: 20px 0;
}

.practice-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.practice-list li {
  padding: 8px 0;
  position: relative;
  padding-left: 20px;
  line-height: 1.6;
}

.practice-list li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #1890ff;
  font-weight: bold;
}

.communication-example {
  margin-top: 20px;
}

.example-dialog {
  margin-top: 12px;
}

.dialog-item {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.dialog-item.good {
  background: #f6ffed;
  border-left: 4px solid #52c41a;
}

.dialog-item.bad {
  background: #fff2e8;
  border-left: 4px solid #fa8c16;
}

.dialog-label {
  font-weight: 600;
  margin-bottom: 8px;
}

.dialog-content {
  font-size: 14px;
  line-height: 1.6;
  color: #262626;
}

.knowledge-tools {
  margin-top: 20px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.tool-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.tool-icon {
  font-size: 20px;
  margin-bottom: 8px;
}

.tool-item h4 {
  margin: 0 0 4px 0;
  color: #262626;
  font-weight: 600;
  font-size: 14px;
}

.tool-item p {
  margin: 0;
  color: #8c8c8c;
  font-size: 12px;
}

.efficiency-metrics {
  margin-top: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.metric-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #234fa2;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: #8c8c8c;
}

.learning-journey {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 16px;
}

.journey-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  min-width: 150px;
}

.step-icon {
  width: 48px;
  height: 48px;
  background: #234fa2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
}

.step-content h4 {
  margin: 0 0 4px 0;
  color: #262626;
  font-weight: 600;
  font-size: 14px;
}

.step-content p {
  margin: 0;
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.4;
}

.journey-arrow {
  font-size: 20px;
  color: #234fa2;
  font-weight: bold;
}

.skill-categories {
  margin: 20px 0;
}

.skill-category {
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.skill-category h4 {
  margin: 0 0 12px 0;
  color: #234fa2;
  font-weight: 600;
}

.skill-tags {
  margin: 12px 0;
}

.skill-category p {
  margin: 12px 0 0 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.5;
}

.learning-resources {
  margin-top: 20px;
}

.resource-content {
  padding: 20px 0;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.platform-item {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  text-align: center;
}

.platform-logo {
  font-size: 32px;
  margin-bottom: 12px;
}

.platform-item h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.platform-item p {
  margin: 0 0 12px 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.5;
}

.platform-features {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.platform-features span {
  background: #f6f8fa;
  color: #24292e;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.training-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.training-list li {
  padding: 8px 0;
  position: relative;
  padding-left: 20px;
  line-height: 1.6;
}

.training-list li::before {
  content: '📚';
  position: absolute;
  left: 0;
  font-size: 12px;
}

.training-schedule {
  margin-top: 20px;
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
}

.cert-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.cert-category {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.cert-category h4 {
  margin: 0 0 12px 0;
  color: #234fa2;
  font-weight: 600;
}

.cert-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cert-category li {
  padding: 4px 0;
  position: relative;
  padding-left: 16px;
  color: #595959;
  font-size: 14px;
}

.cert-category li::before {
  content: '🎓';
  position: absolute;
  left: 0;
  font-size: 12px;
}

.cert-benefits {
  margin-top: 20px;
}

.benefit-item {
  text-align: center;
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #f0f2ff;
}

.benefit-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.benefit-item h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.benefit-item p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.ai-features {
  margin: 20px 0;
}

.ai-feature-card {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  text-align: center;
  height: 100%;
}

.ai-feature-card .feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.ai-feature-card h4 {
  margin: 0 0 8px 0;
  color: #262626;
  font-weight: 600;
}

.ai-feature-card p {
  margin: 0 0 16px 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.5;
}

.ai-feature-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.ai-feature-card li {
  padding: 4px 0;
  position: relative;
  padding-left: 16px;
  color: #595959;
  font-size: 13px;
}

.ai-feature-card li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #52c41a;
}

.ai-conversation-demo {
  margin-top: 20px;
}

.conversation-scenario {
  margin-bottom: 24px;
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
}

.conversation-scenario h4 {
  margin: 0 0 16px 0;
  color: #234fa2;
  font-weight: 600;
}

.conversation {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message .content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.message.user .content {
  background: #234fa2;
  color: white;
}

.message.ai .content {
  background: white;
  border: 1px solid #f0f0f0;
  color: #262626;
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
  .team-help-guide-container {
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
  
  .learning-journey {
    flex-direction: column;
  }
  
  .journey-arrow {
    transform: rotate(90deg);
  }
  
  .nav-item {
    flex-direction: column;
    text-align: center;
  }
  
  .nav-icon {
    margin: 0 0 12px 0;
  }
  
  .value-proposition {
    gap: 16px;
  }
  
  .demo-card {
    flex-direction: column;
    text-align: center;
  }
  
  .demo-avatar {
    margin: 0 0 16px 0;
  }
  
  .demo-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>