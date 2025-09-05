# 科研管理系统前端

基于Vue 3 + Vite + Ant Design Vue的科研项目管理系统前端应用。

## 技术栈

- **框架**: Vue 3
- **构建工具**: Vite
- **UI组件库**: Ant Design Vue
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **图表**: ECharts
- **文档预览**: docx-preview, mammoth

## 功能特性

- 🏠 项目经理仪表板
- 📋 项目全生命周期管理
- 👥 团队协作管理
- 📊 数据统计分析
- 🤖 AI智能助手
- 📁 文件预览与管理
- 📈 进度监控
- ✅ 项目验收管理

## 开发环境

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run serve
```

## 部署

### Vercel部署

1. 将代码推送到GitHub仓库
2. 在Vercel中导入GitHub仓库
3. 配置环境变量：
   - `VITE_API_BASE_URL`: 后端API地址
4. 自动部署完成

### 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=科研管理系统
VITE_APP_VERSION=1.0.0
```

## 项目结构

```
src/
├── components/          # 公共组件
├── views/              # 页面组件
├── router/             # 路由配置
├── store/              # 状态管理
├── utils/              # 工具函数
├── styles/             # 样式文件
└── main.js             # 入口文件
```

## 许可证

MIT License
