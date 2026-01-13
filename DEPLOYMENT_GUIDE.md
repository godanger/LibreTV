# 🚀 部署完成指南

## ✅ 已完成的步骤

1. ✅ **代码修复完成**
   - 所有 HTML 文件已更新为使用 Tailwind CSS CDN
   - Middleware 已优化，不会干扰静态资源加载
   - 路由配置已简化

2. ✅ **代码已推送到 Git**
   - Commit: "Fix Vercel deployment: Use CDN for Tailwind CSS and optimize middleware"
   - 已成功推送到远程仓库

## 📋 部署平台选择

本项目支持多种部署平台，请根据你的需求选择：

### 🌐 Cloudflare Pages（推荐）

#### 方法 1: 通过 Cloudflare Dashboard 部署

1. **访问 Cloudflare Dashboard**
   - 登录：https://dash.cloudflare.com/

2. **创建 Pages 项目**
   - 点击 "Workers & Pages"
   - 点击 "Create application"
   - 选择 "Pages" 标签
   - 点击 "Connect to Git"

3. **连接 Git 仓库**
   - 选择 GitHub
   - 找到 LibreTV 仓库
   - 点击 "Begin setup"

4. **配置构建设置（重要！）**
   - **Project name**: libre-tv（或自定义名称）
   - **Production branch**: main
   - **Framework preset**: None
   - **Build command**: **留空**（不要填写任何内容！）
   - **Build output directory**: `./`（或留空）
   
   ⚠️ **重要提示**：
   - ❌ 不要在 "Build command" 中填写 `npx wrangler deploy`
   - ❌ 不要在 "Build command" 中填写任何命令
   - ✅ "Build command" 必须留空
   - ✅ Cloudflare Pages 会自动部署静态文件和 Functions

5. **环境变量（可选但推荐）**
   - 点击 "Environment variables" 添加：
     - `PASSWORD` - 用户密码（强烈建议设置）
     - `ADMINPASSWORD` - 管理员密码（可选）
     - `CACHE_TTL` - 缓存时间（秒，默认 86400）
     - `MAX_RECURSION` - 最大递归层数（默认 5）
     - `DEBUG` - 调试模式（true/false，默认 false）

6. **点击 "Save and Deploy"**
   - 等待部署完成（通常 1-3 分钟）

#### 方法 2: 使用 Wrangler CLI 部署

```bash
# 安装 Wrangler（如果还没有）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署到 Pages
npx wrangler pages deploy . --project-name=libre-tv
```

#### Cloudflare Pages Functions 说明

本项目使用 Cloudflare Pages Functions 来处理代理请求：
- Functions 位于 `functions/` 目录
- 代理函数：`functions/proxy/[[path]].js`
- 中间件：`functions/_middleware.js`
- Cloudflare Pages 会自动识别并部署这些 Functions
- **不需要**运行 `wrangler deploy` 命令

#### KV 命名空间绑定（可选，用于缓存）

如果需要启用 KV 缓存功能：

1. **创建 KV 命名空间**
   - 在 Cloudflare Dashboard 中
   - 进入 "Workers & Pages" > "KV"
   - 点击 "Create a namespace"
   - 命名为 `LIBRETV_PROXY_KV`

2. **绑定到 Pages 项目**
   - 进入你的 Pages 项目设置
   - 点击 "Functions" > "KV namespace bindings"
   - 添加绑定：
     - Variable name: `LIBRETV_PROXY_KV`
     - KV namespace: 选择刚创建的命名空间

### 📋 通过 Vercel Dashboard 部署

### 方法 1: 自动重新部署（如果项目已连接）

如果你的项目已经连接到 Vercel：

1. **访问 Vercel Dashboard**
   - 已为你打开：https://vercel.com/dashboard
   
2. **找到你的 LibreTV 项目**
   - 在项目列表中找到 LibreTV
   
3. **触发重新部署**
   - 点击项目进入详情页
   - 点击 "Deployments" 标签
   - 找到最新的部署
   - 点击右侧的 "..." 菜单
   - 选择 "Redeploy"
   - 或者：Vercel 应该已经自动检测到 Git 推送并开始部署

4. **等待部署完成**
   - 通常需要 1-3 分钟
   - 你会看到部署状态从 "Building" → "Ready"

### 方法 2: 新建项目（如果项目未连接）

如果这是新项目或需要重新连接：

1. **在 Vercel Dashboard 点击 "Add New..."**
   - 选择 "Project"

2. **导入 Git 仓库**
   - 选择你的 Git 提供商（GitHub/GitLab/Bitbucket）
   - 找到 LibreTV 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Other（或 Node.js）
   - **Root Directory**: ./（保持默认）
   - **Build Command**: 留空（这是静态项目）
   - **Output Directory**: ./（保持默认）
   - **Install Command**: npm install

4. **环境变量（可选）**
   如果需要密码保护，添加：
   - `PASSWORD` - 用户密码（明文，会被自动哈希）
   - `ADMINPASSWORD` - 管理员密码（明文，会被自动哈希）

5. **点击 "Deploy"**
   - 等待部署完成

## 🔍 验证部署

部署完成后，检查以下内容：

### 1. 访问你的网站
- Vercel 会提供一个 URL，如：`https://libre-tv-xxx.vercel.app`
- 点击 "Visit" 按钮访问

### 2. 检查样式
- ✅ 页面应该有完整的样式
- ✅ LibreTV logo 和标题应该有渐变效果
- ✅ 搜索框应该有黑色背景和白色边框
- ✅ 按钮应该有正确的样式

### 3. 检查功能
- ✅ 搜索功能正常
- ✅ 设置面板可以打开
- ✅ 历史记录面板可以打开
- ✅ 播放器页面正常

### 4. 检查浏览器控制台
- 按 F12 打开开发者工具
- 检查 Console 标签，不应该有错误
- 检查 Network 标签，所有资源应该成功加载（状态码 200）

## 🐛 故障排查

### Cloudflare Pages 部署问题

#### ❌ 错误：Missing entry-point to Worker script or to assets directory

如果你看到这个错误，说明你在 Cloudflare Dashboard 中错误地配置了 "Build command"。

**解决方案**：
1. 访问 Cloudflare Dashboard
2. 进入你的 Pages 项目
3. 点击 "Settings" > "Builds & deployments"
4. 在 "Build configurations" 部分：
   - **Build command**: 删除所有内容，必须留空
   - **Build output directory**: 设置为 `./` 或留空
5. 保存更改
6. 点击 "Deployments" 标签
7. 点击 "Retry deployment" 重新部署

**原因**：
- Cloudflare Pages 项目会自动部署静态文件和 Functions
- 不需要运行 `npx wrangler deploy` 命令
- `wrangler deploy` 是用于部署独立的 Cloudflare Workers 的

#### 如果部署失败：

1. **检查构建命令**
   - Build command 应该留空
   - Build output directory 应该是 `./`

2. **检查 Functions**
   - 确保 `functions/` 目录存在
   - 确保 `functions/proxy/[[path]].js` 存在
   - 确保 `functions/_middleware.js` 存在

3. **检查 wrangler.toml**
   - 确保 `wrangler.toml` 文件存在
   - 确保 `compatibility_date` 已设置

4. **查看部署日志**
   - 在 Cloudflare Dashboard 中
   - 进入你的 Pages 项目
   - 点击 "Deployments" 标签
   - 点击失败的部署查看日志

#### 如果 Functions 不工作：

1. **检查 Functions 日志**
   - 在 Cloudflare Dashboard 中
   - 进入你的 Pages 项目
   - 点击 "Functions" 标签
   - 查看 real-time logs

2. **检查环境变量**
   - 确保环境变量已正确设置
   - 变量名区分大小写

3. **检查 KV 绑定**
   - 如果使用了 KV 缓存
   - 确保 KV 命名空间已正确绑定
   - 变量名必须是 `LIBRETV_PROXY_KV`

### Vercel 部署问题

### 如果样式仍然丢失：

1. **清除浏览器缓存**
   - 按 Ctrl+Shift+R（Windows）或 Cmd+Shift+R（Mac）强制刷新

2. **检查 Tailwind CSS CDN**
   - 在浏览器控制台的 Network 标签中
   - 查找 `cdn.tailwindcss.com` 的请求
   - 确保状态码是 200

3. **检查 Middleware**
   - 在 Vercel Dashboard 的 "Functions" 标签中
   - 查看 Middleware 日志
   - 确保没有错误

4. **检查部署日志**
   - 在 Vercel Dashboard 的 "Deployments" 标签中
   - 点击最新的部署
   - 查看 "Build Logs"
   - 确保没有构建错误

### 如果 API 代理不工作：

1. **检查 vercel.json**
   - 确保 `/api/proxy/[...path].mjs` 文件存在
   - 确保 vercel.json 中的重写规则正确

2. **检查函数日志**
   - 在 Vercel Dashboard 的 "Functions" 标签中
   - 查看 proxy 函数的日志

## 📊 部署状态

- ✅ 代码已修复
- ✅ 代码已推送到 Git
- ⏳ 等待 Vercel 自动部署或手动触发重新部署

## 🎉 完成！

部署完成后，你的 LibreTV 应该可以正常工作了！

如果遇到任何问题，请：
1. 检查上面的故障排查部分
2. 查看 Vercel 部署日志
3. 检查浏览器控制台的错误信息

---

**提示**：Vercel 通常会在检测到 Git 推送后自动部署。如果你看到 Vercel Dashboard 中有新的部署正在进行，那就是自动部署已经开始了！
