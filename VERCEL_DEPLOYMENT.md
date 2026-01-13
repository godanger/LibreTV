# Vercel 部署指南

## 修复说明

已修复以下问题以确保在 Vercel 上正常部署：

### 1. **Tailwind CSS 加载问题**
- ✅ 将所有 HTML 文件中的本地 Tailwind CSS (`libs/tailwindcss.min.js`) 替换为 CDN 版本
- ✅ 使用 `https://cdn.tailwindcss.com` 确保样式正常加载

### 2. **Middleware 优化**
- ✅ 修复了 `middleware.js` 以正确处理静态资源
- ✅ 添加了静态文件路径排除规则（CSS、JS、图片等）
- ✅ 修复了 Content-Length 和 Content-Encoding 头部问题
- ✅ 添加了错误处理机制

### 3. **路由配置**
- ✅ 优化了 `vercel.json` 的重写规则
- ✅ 确保搜索路径 `/s=*` 正确路由到 `index.html`
- ✅ 确保播放器路径正确处理

## 部署步骤

1. **推送代码到 Git 仓库**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment issues"
   git push
   ```

2. **在 Vercel 上重新部署**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择你的项目
   - 点击 "Redeploy" 重新部署

3. **设置环境变量（可选）**
   如果需要密码保护，在 Vercel 项目设置中添加：
   - `PASSWORD` - 用户密码
   - `ADMINPASSWORD` - 管理员密码

## 主要修改文件

- `middleware.js` - 修复了中间件逻辑
- `vercel.json` - 优化了路由配置
- `index.html` - 使用 CDN 版本的 Tailwind CSS
- `player.html` - 使用 CDN 版本的 Tailwind CSS
- `about.html` - 使用 CDN 版本的 Tailwind CSS
- `.vercelignore` - 新增，排除不必要的文件

## 验证部署

部署完成后，检查以下内容：

1. ✅ 首页样式正常显示
2. ✅ 搜索功能正常工作
3. ✅ 播放器页面正常加载
4. ✅ 所有静态资源（CSS、JS、图片）正常加载

## 故障排查

如果仍然遇到问题：

1. **检查浏览器控制台** - 查看是否有资源加载错误
2. **检查 Vercel 部署日志** - 查看是否有构建或运行时错误
3. **清除浏览器缓存** - 强制刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）
4. **检查 Middleware 日志** - 在 Vercel Dashboard 的 Functions 标签中查看

## 技术细节

### Middleware 工作原理
- 拦截 HTML 请求
- 注入环境变量（密码哈希）
- 不干扰静态资源加载

### 静态资源处理
- CSS、JS、图片等直接由 Vercel CDN 提供
- 不经过 Middleware 处理，确保最佳性能
