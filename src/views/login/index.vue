<template>
  <div class="login-bg">
    <div class="login-main">
      <div class="login-side">
        <div class="side-title">科技创新管控系统</div>
        <div class="side-desc">让科研管理更高效、更智能</div>
      </div>
      <div class="login-form-wrap">
        <div class="login-form-box">
          <div class="login-card">
            <div class="login-custom-tabs">
              <div :class="['login-custom-tab', activeTab==='account' && 'active']" @click="activeTab='account'">账号登录</div>
              <div :class="['login-custom-tab', activeTab==='mobile' && 'active']" @click="activeTab='mobile'">手机验证码登录</div>
            </div>
            <div class="login-form-content">
              <template v-if="activeTab==='account'">
                <a-form :model="form" :rules="rules" ref="formRef" @finish="onLogin" layout="vertical">
                  <a-form-item name="username">
                    <a-input v-model:value="form.username" size="large" placeholder="请输入用户名" style="width:100%;" />
                  </a-form-item>
                  <a-form-item name="password">
                    <a-input-password v-model:value="form.password" size="large" placeholder="请输入密码" />
                  </a-form-item>
                  <a-form-item class="login-btn-row">
                    <a-tooltip :title="loginHistoryTitle">
                      <a-button type="primary" html-type="submit" class="full-width-btn" :loading="loading" style="background:#234fa2;border:none;color:#fff;" block>
                        登录
                      </a-button>
                    </a-tooltip>
                  </a-form-item>
                </a-form>
              </template>
              <template v-else>
                <a-form :model="form" :rules="mobileRules" ref="mobileFormRef" @finish="onMobileLogin" layout="vertical">
                  <a-form-item name="mobile">
                    <a-input v-model:value="form.mobile" size="large" placeholder="请输入手机号" />
                  </a-form-item>
                  <a-form-item name="captcha">
                    <div class="captcha-row">
                      <a-input v-model:value="form.captcha" size="large" placeholder="请输入验证码" style="flex:1;" />
                      <a-button class="get-captcha-btn" size="large" @click="onSendCaptcha" :disabled="captchaCountdown > 0">
                        {{ captchaCountdown > 0 ? `${captchaCountdown}s后重试` : '获取验证码' }}
                      </a-button>
                    </div>
                  </a-form-item>
                  <a-form-item class="login-btn-row">
                    <a-button type="primary" html-type="submit" class="full-width-btn" :loading="loading" style="background:#234fa2;border:none;color:#fff;" block>
                      登录
                    </a-button>
                  </a-form-item>
                </a-form>
              </template>
            </div>
          </div>
          <a-modal v-model:open="showForcePwd" title="首次登录请修改密码" @ok="onForcePwdOk" :closable="false" :maskClosable="false">
            <a-form :model="forcePwdForm" :rules="forcePwdRules" ref="forcePwdRef" @finish="onForcePwdSubmit" layout="vertical">
              <a-form-item name="newPwd">
                <a-input-password v-model:value="forcePwdForm.newPwd" size="large" placeholder="请输入新密码" />
              </a-form-item>
              <a-form-item name="confirmPwd">
                <a-input-password v-model:value="forcePwdForm.confirmPwd" size="large" placeholder="请再次输入新密码" />
              </a-form-item>
            </a-form>
          </a-modal>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
// import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons-vue' // 已不再用prefix

/**
 * 登录表单数据
 * @type {object}
 */
const form = reactive({
  username: '',
  password: '',
  mobile: '',
  captcha: ''
})

/**
 * 登录表单校验规则（不显示校验提示）
 * @type {object}
 */
const rules = {
  username: [
    { required: true, message: '' }
  ],
  password: [
    { required: true, message: '' }
  ]
}

const mobileRules = {
  mobile: [
    { required: true, message: '' },
    { pattern: /^1\d{10}$/, message: '' }
  ],
  captcha: [
    { required: true, message: '' }
  ]
}

const formRef = ref()
const mobileFormRef = ref()
const loading = ref(false)
const activeTab = ref('account')

/**
 * 登录历史（悬浮提示内容，异常IP标红）
 */
const loginHistory = [
  { ip: '192.168.1.1', time: '2024-06-01 10:00', abnormal: false },
  { ip: '8.8.8.8', time: '2024-06-02 09:30', abnormal: true }
]
const loginHistoryTitle = computed(() =>
  loginHistory.map(item =>
    `<span style='color:${item.abnormal ? 'red' : '#333'}'>${item.ip}（${item.time}）</span>`
  ).join('<br/>')
)

/**
 * 登录提交
 */
const router = useRouter()
const onLogin = async () => {
  loading.value = true
  // 设置token以避免跳转问题
  localStorage.setItem('token', 'mock-token-' + Date.now())
  setTimeout(() => {
    loading.value = false
    router.push('/dashboard')
  }, 500)
}

/**
 * 手机验证码登录提交
 */
const onMobileLogin = async () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('登录成功')
  }, 1000)
}

/**
 * 验证码倒计时
 */
const captchaCountdown = ref(0)
let timer = null
const onSendCaptcha = () => {
  if (captchaCountdown.value > 0) return
  captchaCountdown.value = 60
  timer = setInterval(() => {
    captchaCountdown.value--
    if (captchaCountdown.value <= 0) clearInterval(timer)
  }, 1000)
  message.success('验证码已发送（模拟）')
}

// 首次登录强制修改密码弹窗
const showForcePwd = ref(false)
const forcePwdForm = reactive({ newPwd: '', confirmPwd: '' })
const forcePwdRules = {
  newPwd: [
    { required: true, message: '请输入新密码' }
  ],
  confirmPwd: [
    { required: true, message: '请再次输入新密码' },
    {
      validator: (rule, value) => {
        if (value !== forcePwdForm.newPwd) {
          return Promise.reject('两次输入的密码不一致');
        }
        return Promise.resolve();
      },
      trigger: 'blur'
    }
  ]
}
const forcePwdRef = ref()
const onForcePwdOk = () => {
  forcePwdRef.value
    .validate()
    .then(() => {
      showForcePwd.value = false
      localStorage.setItem('token', 'mock-token')
      message.success('密码修改成功，欢迎使用！')
      window.location.href = '/dashboard'
    })
    .catch(() => {
      // 校验失败，不做跳转
    })
}
const onForcePwdSubmit = () => {
  showForcePwd.value = false
  localStorage.setItem('token', 'mock-token')
  message.success('密码修改成功，欢迎使用！')
  window.location.href = '/dashboard'
}

const route = useRoute();
onMounted(() => {
  if (localStorage.getItem('token') && route.path === '/login') {
    window.location.href = '/dashboard'
  }
})
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f8ff;
}
.login-main {
  display: flex;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(35,79,162,0.10);
  overflow: hidden;
  width: 720px;
  min-height: 420px;
}
.login-side {
  background: linear-gradient(135deg, #234fa2 0%, #4e7be6 100%);
  color: #fff;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}
.side-title {
  font-size: 1.7rem;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 2px;
}
.side-desc {
  font-size: 1.1rem;
  opacity: 0.85;
}
.login-form-wrap {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  height: 100%;
}
.login-form-box {
  width: 100%;
  height: 100%;
  display: flex;
}
.login-card {
  background: #fff;
  border-radius: 0 18px 18px 0;
  box-shadow: none;
  padding: 40px 36px 28px 36px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 420px;
  height: 100%;
}
.login-custom-tabs {
  display: flex;
  border-bottom: 2px solid #e6eaf2;
  margin-bottom: 32px;
}
.login-custom-tab {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #234fa2;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: border 0.2s, color 0.2s;
  background: transparent;
}
.login-custom-tab.active {
  border-bottom: 3px solid #234fa2;
  color: #234fa2;
  background: #f5f8ff;
}
.login-form-content {
  margin-top: 16px;
  min-height: 240px;
  position: relative;
  padding-bottom: 64px;
}
.captcha-row {
  display: flex;
  gap: 8px;
}
.get-captcha-btn {
  height: 44px;
  min-width: 120px;
  background: #f5f8ff;
  color: #234fa2;
  border: 1.5px solid #e6eaf2;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  margin-left: 8px;
  transition: all 0.2s;
  box-shadow: none;
  padding: 0 12px;
}
.get-captcha-btn:hover, .get-captcha-btn:focus {
  background: #234fa2;
  color: #fff;
  border-color: #234fa2;
}
.login-btn-row {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 16px;
  margin: 0;
  padding: 0;
}
.full-width-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  letter-spacing: 1px;
}
:deep(.ant-input-affix-wrapper) {
  width: 100% !important;
  min-width: 0;
  height: 44px !important;
  border-radius: 6px !important;
  border: 1.5px solid #e6eaf2 !important;
  font-size: 16px;
  box-shadow: none !important;
}
:deep(.ant-input:focus), :deep(.ant-input-affix-wrapper-focused) {
  border-color: #234fa2 !important;
  box-shadow: 0 0 0 2px rgba(35,79,162,0.08) !important;
}
:deep(.ant-form-item) {
  margin-bottom: 24px !important;
}
@media (max-width: 800px) {
  .login-main {
    width: 100vw;
    min-width: 0;
    border-radius: 0;
  }
  .login-side {
    display: none;
  }
  .login-form-box {
    width: 100vw;
    min-width: 0;
    padding: 0 12px;
  }
  .login-card {
    border-radius: 0;
    min-height: 100vh;
  }
}
</style> 