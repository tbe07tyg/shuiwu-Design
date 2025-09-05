# 🆓 GitHub Pages 免费部署指南

## 🌟 为什么选择GitHub Pages？
- ✅ **完全免费** - 无任何费用
- ✅ **无流量限制** - 正常使用无限制
- ✅ **自动SSL证书** - 安全的HTTPS访问
- ✅ **支持自定义域名** - 专业的网站地址
- ✅ **自动部署** - 代码更新后自动发布

## 📝 部署步骤

### 第一步：创建GitHub仓库
1. 访问 [GitHub.com](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `research-management-system`
   - **Description**: `华水科研管理系统前端`
   - **Public**: 选择 Public（免费用户必须选择）
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 第二步：连接本地仓库到GitHub
在您的项目目录中执行以下命令：

```bash
# 添加远程仓库（请替换为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/research-management-system.git

# 推送代码到GitHub
git branch -M main
git push -u origin main
```

### 第三步：启用GitHub Pages
1. 在GitHub仓库页面，点击 "Settings" 选项卡
2. 左侧菜单中找到 "Pages" 选项
3. 在 "Source" 部分选择 "Deploy from a branch"
4. 选择 "GitHub Actions" 作为部署源
5. 系统会自动识别我们的 `.github/workflows/deploy.yml` 配置文件
6. 等待几分钟，部署完成后会显示网站地址

## 🔧 后续操作

### 自动部署
- 每次您推送代码到 `main` 分支，GitHub Actions 会自动：
  1. 安装依赖
  2. 构建项目
  3. 部署到 GitHub Pages

### 自定义域名（可选）
如果您有自己的域名：
1. 在 "Settings" → "Pages" 中输入您的域名
2. 在域名服务商处添加 CNAME 记录指向：`YOUR_USERNAME.github.io`

### 环境变量配置
如果需要配置后端API地址：
1. 在 "Settings" → "Secrets and variables" → "Actions"
2. 添加环境变量：
   - `VITE_API_BASE_URL`: 您的后端API地址

## 🎯 部署后的访问地址

部署完成后，您的网站将可以通过以下地址访问：
```
https://YOUR_USERNAME.github.io/research-management-system
```

## 🛠️ 常见问题解决

### 1. 部署失败
- 检查 Actions 选项卡中的构建日志
- 确保 `package.json` 中的依赖完整
- 检查构建命令是否正确

### 2. 页面显示空白
- 确保 `vite.config.js` 中的 `base` 配置正确
- 检查控制台错误信息
- 确认所有静态资源路径正确

### 3. 无法访问
- 等待几分钟让DNS生效
- 检查浏览器缓存
- 确认仓库是Public状态

## 🌐 其他免费部署选项

如果您不想使用GitHub Pages，还可以选择：

### Netlify（推荐）
- 拖拽 `dist` 文件夹到 Netlify
- 或连接GitHub仓库自动部署

### Vercel
- 使用GitHub账号登录
- 选择仓库一键部署

## 📞 技术支持

如遇到问题，请：
1. 检查GitHub Actions的构建日志
2. 查看浏览器控制台错误
3. 确认网络连接正常
4. 检查仓库权限设置

---

🎉 **恭喜！您的科研管理系统即将上线！**

特色功能：
- 📊 智能工作台与提醒系统
- 🎨 响应式设计，支持手机、平板、电脑
- 🔐 完整的权限管理系统
- 📈 项目进度可视化监控
- 🗂️ 开题、中期、验收完整流程
- 🎯 角色颜色区分，用户体验优化

立即开始您的科研管理之旅！ 