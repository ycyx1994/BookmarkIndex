## 为什么

需要一个美观、高效的 Chrome 书签启动器，替换浏览器默认新标签页，让用户能快速访问和管理书签。现有的浏览器原生书签管理体验粗糙，缺少分类过滤、搜索、高频推荐等功能，且无法跨浏览器导入书签。

## 变更内容

- 创建 Chrome Manifest V3 扩展，替换新标签页为书签启动器
- 通过 `chrome.bookmarks` API 实时读取浏览器书签，以文件夹作为分类
- 支持导入 HTML 格式的书签文件（Netscape Bookmark 格式），与 Chrome 书签合并展示
- 顶部搜索栏，支持跨分类搜索书签（标题 + URL）
- 左侧分类侧边栏，点击过滤模式（只显示选中分类的书签）
- 右侧书签卡片网格展示，卡片包含 favicon 图标、标题、域名
- 基于点击频次的推荐模块（Top N 高频书签）
- 深色主题 UI，参考 Markoob 书签启动器风格
- 后台 Service Worker 监听书签变更，缓存到 `chrome.storage.local` 加速加载

## 功能 (Capabilities)

### 新增功能
- `bookmark-data`: 书签数据管理——Chrome API 实时读取、HTML 文件导入、chrome.storage 缓存同步、合并去重
- `bookmark-display`: 书签展示——左侧分类侧边栏（过滤模式）、右侧卡片网格（favicon + 标题 + 域名）、深色主题
- `bookmark-search`: 书签搜索——顶部搜索栏，跨分类搜索标题和 URL，实时过滤
- `bookmark-recommendation`: 书签推荐——基于 LocalStorage 点击频次统计，展示 Top N 高频书签
- `bookmark-import-export`: 书签导入导出——设置面板中触发 HTML 书签导入（二次确认 + 备份替换）、导出功能

### 修改功能
<!-- 无现有功能需要修改 -->

## 影响

- 新增 Chrome 扩展项目，需要 `bookmarks`、`storage` 权限
- 使用 `chrome_url_overrides.newtab` 替换默认新标签页
- 技术栈：Vite+ (vp) + React 19 + TypeScript + CRXJS，使用 `vp` 统一工具链管理开发/构建/测试/lint
- 依赖 Google Favicon API (`https://www.google.com/s2/favicons`) 获取网站图标
- 使用 `chrome.storage.local` 缓存书签数据，需要 background service worker 保持同步
- 无后端依赖，纯前端实现
