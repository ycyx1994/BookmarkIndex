## 上下文

本项目是一个 Chrome Manifest V3 扩展，替换浏览器默认新标签页为书签启动器。数据来源包括 Chrome 书签 API 实时读取和 HTML 书签文件导入，两者合并展示。项目参考了已有的 demo 项目（bookmark-index-demo）的 UI 结构和交互模式，但需要从浅色静态页面升级为深色主题的 Chrome 扩展。

技术栈采用 **Vite+ (vp) + React 19 + TypeScript + CRXJS**，使用 Vite+ 统一工具链替代传统的 Vite + ESLint + Prettier + tsc 分散配置。Vite+ 底层基于 Vite + Rolldown（Rust 实现），所有 Vite 插件生态直接兼容。

参考 demo 项目位于 `/Users/mac/Downloads/bookmark-index-demo`，包含完整的 CSS 变量系统、卡片组件、侧边栏、搜索和推荐模块。

## 目标 / 非目标

**目标：**
- 替换 Chrome 新标签页为书签启动器
- 实时读取 Chrome 书签，以文件夹作为分类
- 支持 HTML 书签文件导入，与 Chrome 书签合并展示
- 过滤模式侧边栏：点击分类只显示该分类书签
- 跨分类搜索书签（标题 + URL）
- 基于点击频次的推荐模块
- 深色主题 UI
- chrome.storage 缓存 + background service worker 同步，保证新标签页加载速度

**非目标：**
- 无需书签的增删改编辑功能（仅展示和导入）
- 无需用户账号或云同步
- 无需移动端适配
- 无需嵌套文件夹的树形展开（展平为一级分类）
- 无需自定义主题切换（仅深色主题）

## 决策

### 1. 新标签页替换方式
- **决策**: 使用 `chrome_url_overrides.newtab` 替换默认新标签页
- **理由**: Manifest V3 标准方式，无需额外权限，用户开新标签即可见
- **替代方案**: 使用 popup 弹窗 — 空间有限，不适合启动器场景

### 2. 数据缓存策略
- **决策**: chrome.storage.local 缓存 + background service worker 监听 `chrome.bookmarks.onChanged` 等事件同步
- **理由**: 新标签页加载速度关键，实时读取 API 有延迟；缓存保证毫秒级加载
- **替代方案**: 每次新标签页实时调用 `chrome.bookmarks.getTree()` — 书签多时卡顿，API 有频率限制

### 3. 书签文件夹展平策略
- **决策**: 将嵌套文件夹展平为一级分类列表，只取顶层文件夹
- **理由**: 简化侧边栏交互，避免树形菜单的复杂性；Markoob 也采用类似方式
- **替代方案**: 树形可折叠菜单 — 实现复杂，移动端体验差

### 4. 卡片信息展示
- **决策**: favicon + 标题 + 域名（两行）
- **理由**: Chrome 书签没有 description 字段，域名本身具有高辨识度
- **替代方案 A**: 只显示标题 — 信息量不足
- **替代方案 B**: 显示截断 URL — 太杂乱

### 5. Favicon 获取方案
- **决策**: Google Favicon API (`https://www.google.com/s2/favicons?domain={hostname}&sz=32`)
- **理由**: 最稳定，Google 自家服务，覆盖所有网站
- **替代方案**: `chrome://favicon/` — 仅扩展内可用，兼容性不确定；直接请求 `/favicon.ico` — 跨域问题

### 6. 搜索与分类的交互关系
- **决策**: 搜索优先，跨分类搜索，忽略当前选中的分类
- **理由**: 搜索时用户通常不想被分类限制；清空搜索后恢复当前分类视图
- **替代方案**: 搜索+分类叠加 — 用户容易困惑"为什么搜不到"

### 7. HTML 书签导入流程
- **决策**: 设置面板触发 → 文件选择 → 二次确认（显示书签数量）→ 可选备份 → 替换导入的书签（Chrome 原生书签不受影响）
- **理由**: 替换而非合并避免重复；备份选项保护用户数据；Chrome 书签和导入书签分开管理但合并展示
- **替代方案**: 增量合并 — 去重逻辑复杂，用户难以理解合并结果

### 8. 工具链与框架
- **决策**: Vite+ (vp) + React 19 + TypeScript + CRXJS (`@crxjs/vite-plugin`)
- **理由**:
  - Vite+ 是 Vite 的统一工具链超集，一个 `vp` 命令替代 vite + vitest + eslint + prettier + tsc，底层 Rust 实现（Rolldown/Oxc）构建速度比 webpack 快 40x
  - React 组件化适合本项目的多模块 UI（侧边栏/卡片网格/搜索/推荐/设置面板），比 vanilla JS 的全局函数 + DOM 操作更易维护
  - TypeScript 提供类型安全，Chrome API 类型声明开箱即用
  - CRXJS 是最成熟的 Vite Chrome 扩展插件，自动处理 manifest.json 生成、多入口打包（newtab + background）、开发时 HMR
- **命令映射**:
  - `vp dev` → 开发服务器 + HMR（newtab 页面热更新）
  - `vp build` → 生产构建（输出到 `dist/`，可直接加载为 Chrome 未打包扩展）
  - `vp check` → 一次完成 Oxc lint + Oxfmt 格式化 + tsgo 类型检查
  - `vp test` → Vitest 单元测试
- **替代方案 A**: 纯 Vite — 需要手动配置 eslint/prettier/tsc，工具链分散
- **替代方案 B**: 纯 vanilla JS（demo 方案）— 无构建工具，但代码量增长后维护成本高，无类型安全

### 9. 项目文件结构
- **决策**: 按 React 组件 + 功能模块组织，复用 demo 的 CSS 变量系统并改为深色主题
- **结构**:
  - `manifest.json` — V3 清单配置（CRXJS 自动生成，手动微调）
  - `vite.config.ts` — Vite+ 配置，集成 CRXJS 插件
  - `tsconfig.json` — TypeScript 配置
  - `package.json` — 项目依赖和 vp 脚本
  - `src/background/service-worker.ts` — Service Worker，监听书签变更同步缓存
  - `src/newtab/main.tsx` — React 入口
  - `src/newtab/App.tsx` — 根组件，组合侧边栏 + 主内容区
  - `src/components/Sidebar.tsx` — 分类侧边栏组件
  - `src/components/BookmarkGrid.tsx` — 书签卡片网格组件
  - `src/components/BookmarkCard.tsx` — 单个书签卡片组件
  - `src/components/SearchBar.tsx` — 搜索栏组件
  - `src/components/RecommendSection.tsx` — 推荐模块组件
  - `src/components/SettingsPanel.tsx` — 设置面板（导入/导出）
  - `src/hooks/useBookmarks.ts` — 书签数据 hook（读取 chrome.storage）
  - `src/hooks/useSearch.ts` — 搜索逻辑 hook
  - `src/hooks/useRecommendation.ts` — 推荐逻辑 hook
  - `src/services/bookmark-data.ts` — Chrome 书签 API 读取 + 缓存
  - `src/services/bookmark-import.ts` — HTML 书签文件解析/导入/导出
  - `src/services/favicon.ts` — Favicon 获取逻辑
  - `src/styles/variables.css` — CSS 变量系统（深色主题）
  - `public/icons/` — 扩展图标（静态资源）

### 10. 深色主题配色
- **决策**: 深蓝黑色调，参考 Markoob 风格
- 背景 `#1a1a2e`，侧边栏 `#16213e`，卡片 `#0f3460`，强调色 `#4a9eff`
- **理由**: 深蓝色调比纯黑更柔和，视觉层次分明

## 风险 / 权衡

### Chrome API 权限
- **风险**: `bookmarks` 权限需要用户授权，可能导致部分用户拒绝安装
- **缓解**: 安装时清晰说明权限用途；导入功能作为补充方案

### Favicon API 可用性
- **风险**: Google Favicon API 可能有调用限制或被墙
- **缓解**: 添加 `onerror` 降级处理（隐藏图标或显示默认图标）；可考虑备用 API（DuckDuckGo）

### 书签数量性能
- **风险**: 用户书签上千时，卡片渲染可能影响性能
- **缓解**: 使用虚拟滚动或分页加载；过滤模式天然限制单次显示数量

### 导入书签与 Chrome 书签的 ID 冲突
- **风险**: 导入的书签和 Chrome 书签可能有相同 URL
- **缓解**: 合并展示时按 URL 去重，Chrome 书签优先；导入数据存储在独立的 key 中

### chrome.storage 容量
- **风险**: chrome.storage.local 容量约 10MB，大量书签可能接近限制
- **缓解**: 只缓存必要字段（title, url, folderId）；书签数量级通常不会超限

### Vite+ 与 CRXJS 兼容性
- **风险**: Vite+ 底层虽是 Vite，但 CRXJS 插件尚未针对 Vite+ 做官方适配测试
- **缓解**: Vite+ 对 Vite 插件 API 向后兼容，CRXJS 应可直接使用；如遇兼容问题可回退到纯 Vite + 手动配置 lint/format 工具链
