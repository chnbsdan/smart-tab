# 灵动标签页 (Smart Tab)

<div align="center">

![版本](https://img.shields.io/badge/version-1.0.0-blue.svg)
![许可证](https://img.shields.io/badge/license-MIT-green.svg)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![PWA](https://img.shields.io/badge/PWA-ready-purple.svg)

**一个现代化、可定制、支持PWA的智能浏览器新标签页**

[在线演示](https://your-demo-link.com) | [功能特性](#-功能特性) | [快速开始](#-快速开始) | [部署指南](#-部署指南)

</div>

---

## 📖 项目简介

灵动标签页是一个功能强大的浏览器新标签页替代品，采用现代化Web技术构建。它提供了类似手机主屏幕的卡片式布局、可自由拖拽的组件系统、丰富的个性化设置，并支持PWA技术，可以像原生应用一样安装在手机上使用。

### 🎯 核心特性

- ✅ **组件化架构** - 可自由添加/删除/拖拽排序各种组件
- ✅ **右键菜单** - 完整的右键交互菜单，快速访问所有功能
- ✅ **PWA支持** - 可安装到桌面，离线使用，像原生应用一样
- ✅ **响应式设计** - 完美适配PC、平板、手机等各种设备
- ✅ **本地存储** - 所有数据保存在本地，隐私安全
- ✅ **键盘快捷键** - 支持快捷键操作，提升效率
- ✅ **多AI助手** - 集成多个AI助手入口（问AI、元宝、豆包、DeepSeek）
- ✅ **实时天气** - 自动获取实时天气信息
- ✅ **待办清单** - 便捷的待办事项管理
- ✅ **日历组件** - 完整的日历功能
- ✅ **倒计时** - 多种倒计时场景（下班、发薪、周末等）
- ✅ **热搜榜单** - 实时热点新闻
- ✅ **电子木鱼** - 解压小工具
- ✅ **自定义壁纸** - 多种精美渐变壁纸可选
- ✅ **数据备份** - 支持导入/导出配置数据

## 🚀 技术栈

- **原生JavaScript (ES6+)** - 无框架依赖，轻量高效
- **CSS3** - 现代化样式、动画、毛玻璃效果
- **HTML5** - 语义化标签、PWA支持
- **LocalStorage** - 本地数据持久化
- **Service Worker** - 离线缓存、PWA核心
- **Web App Manifest** - 应用安装配置

## 📦 项目结构

```
smart-tab/
├── index.html              # 应用入口
├── manifest.json          # PWA配置
├── service-worker.js      # 离线缓存服务
├── package.json           # 项目配置（可选）
├── .gitignore            # Git忽略文件
├── README.md             # 项目文档
│
├── css/                   # 样式文件
│   ├── main.css          # 主样式（状态栏、搜索栏、卡片等）
│   ├── components.css    # 组件样式（天气、待办、日历等）
│   └── responsive.css    # 响应式适配
│
├── js/                    # JavaScript模块
│   ├── app.js            # 应用核心（状态管理、事件绑定）
│   ├── components.js     # 组件系统（组件注册、渲染、管理）
│   ├── storage.js        # 数据管理（存储、备份、导入导出）
│   └── utils.js          # 工具函数（日期、防抖、剪贴板等）
│
└── assets/               # 静态资源（可选）
    ├── icons/            # 应用图标
    └── wallpapers/       # 壁纸资源
```

## 🔧 安装与使用

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/your-username/smart-tab.git
cd smart-tab
```

2. **启动本地服务器**
```bash
# 使用 Python
python -m http.server 3000

# 或使用 Node.js
npx http-server -p 3000

# 或使用 Live Server (VS Code插件)
```

3. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 设置为浏览器主页

#### Chrome/Edge
1. 打开浏览器设置
2. 找到"启动时"或"外观"选项
3. 选择"打开特定网页或一组网页"
4. 添加新网页，输入本地文件路径或在线地址

#### Firefox
1. 打开设置
2. 找到"主页"
3. 选择"自定义URL"
4. 输入本地文件路径或在线地址

## 🌐 部署指南

### 部署到 GitHub Pages

1. **创建仓库并推送代码**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

2. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "main" 分支
   - 保存后获得地址：`https://你的用户名.github.io/你的仓库名`

### 部署到 Cloudflare Pages

1. 登录 Cloudflare Dashboard
2. 进入 Pages 服务
3. 点击 "Connect to Git"
4. 选择 GitHub 仓库
5. 构建设置：
   - 构建命令：留空（静态站点）
   - 输出目录：`/`
6. 点击 "Save and Deploy"
7. 获得地址：`https://你的项目名.pages.dev`

### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 按照提示完成部署
```

### 部署到 Netlify

1. 将代码推送到 GitHub
2. 登录 Netlify
3. 点击 "New site from Git"
4. 选择你的仓库
5. 部署设置：
   - Build command: 留空
   - Publish directory: `.`
6. 点击 "Deploy site"

## 🎮 使用指南

### 基础操作

#### 右键菜单
在页面任意位置右键，可以快速访问：
- ➕ 添加组件
- 🎨 换壁纸
- ⚙️ 设置
- 🔄 刷新组件
- 💾 备份数据

#### 键盘快捷键
- `Ctrl + K` - 快速聚焦搜索框
- `Esc` - 关闭所有弹窗

#### 侧边栏导航
点击右上角的 **☰** 按钮打开侧边栏，可以：
- 添加/删除组件
- 更换壁纸
- 调整设置
- 备份/恢复数据

### 组件管理

#### 添加组件
1. 右键点击 → 添加组件
2. 或打开侧边栏 → 添加组件
3. 选择需要的组件类型

#### 删除组件
- 每个组件右上角都有删除按钮（开发中）

#### 组件类型
- 🌤️ **天气组件** - 实时天气、温度、湿度
- ✅ **待办清单** - 任务管理，支持增删改查
- 📅 **日历组件** - 月历视图，日期选择
- ⏰ **倒计时** - 下班、发薪、周末倒计时
- 📈 **股票行情**（开发中）
- 📜 **每日诗词** - 随机诗词展示
- 📖 **每日英语** - 英语格言
- 🎂 **纪念日** - 重要日期提醒
- 🔥 **热搜榜单** - 实时热点新闻
- 🐟 **电子木鱼** - 解压敲击计数

### 个性化设置

#### 更换壁纸
1. 右键 → 换壁纸
2. 或侧边栏 → 换壁纸
3. 选择喜欢的渐变壁纸

#### 主题切换
- 支持深色/浅色模式切换
- 设置中可开启深色模式

#### 搜索引擎
- 支持百度、Google、Bing
- 在设置中切换默认搜索引擎

### 数据管理

#### 本地存储
- 所有组件数据保存在浏览器LocalStorage
- 关闭浏览器数据不丢失

#### 备份与恢复
1. 侧边栏 → 备份数据（导出JSON文件）
2. 导入备份文件即可恢复

#### 重置默认
- 侧边栏 → 恢复默认
- 清除所有自定义数据

## 🔄 更新日志

### v1.0.0 (2026-06-16)
- ✨ 初始版本发布
- 🎨 完整的UI界面
- 📦 组件化架构
- 🖱️ 右键菜单功能
- 💾 本地存储持久化
- 📱 PWA支持
- 🌈 多种壁纸选择
- ✅ 待办、日历、天气等核心组件

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范
- 使用ES6+语法
- 代码注释清晰
- 遵循现有代码风格
- 测试所有浏览器兼容性

## 📝 待办事项

- [ ] 添加拖拽排序功能
- [ ] 更多组件类型（音乐、视频、笔记等）
- [ ] 云端同步功能
- [ ] 自定义CSS主题
- [ ] 浏览器扩展版本
- [ ] 更多壁纸和动态壁纸
- [ ] 数据加密存储
- [ ] 多语言支持
- [ ] 书签同步

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 图标来源于 [Emoji](https://emojipedia.org/)
- 灵感来源于360 AI Tab等优秀产品

## 📧 联系方式

- 作者：[chnbsdan]
- 邮箱：[kekelove1688@gmail.com]
- 项目地址：[https://github.com/chnbsdan/smart-tab](https://github.com/chnbsdan/smart-tab)

---

<div align="center">
  
**如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！**

Made with ❤️ by [Your Name]

</div>
