import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './styles/global.css'
import { setupTaskSyncListener } from '@/store/taskSync'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Antd)

// 初始化任务数据同步监听器
setupTaskSyncListener()

app.mount('#app') 