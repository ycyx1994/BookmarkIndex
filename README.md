# BookmarkIndex 书签启动器

美观高效的 Chrome 新标签页书签启动器，替换浏览器默认新标签页，让你快速访问和管理书签。

## 功能

- **分类浏览** — 左侧侧边栏展示所有书签文件夹，点击分类过滤右侧书签
- **分组展示** — 右侧主区域按文件夹分段显示书签卡片（favicon + 标题 + 域名）
- **跨分类搜索** — 顶部搜索栏支持按标题和 URL 搜索，200ms 防抖，Escape 键清空
- **高频推荐** — 基于点击频次自动推荐 Top 5 常用书签，实时更新
- **导入导出** — 支持 Netscape Bookmark HTML 格式的书签文件导入和导出
- **实时同步** — Background Service Worker 监听 Chrome 书签变更，自动更新缓存

## 技术栈

| 技术 | 用途 |
|------|------|
| [Vite](https://vite.dev/) | 构建工具 |
| [React 19](https://react.dev/) | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [CRXJS](https://crxjs.dev/vite-plugin) | Chrome 扩展 Vite 插件 |
| [Lucide React](https://lucide.dev/) | 图标库 |

## 安装使用

### 开发

```bash
npm install
npm run dev
```

### 构建扩展

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 加载到 Chrome

1. 打开 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目的 `dist/` 目录

## 项目结构

```
src/
├── background/service-worker.ts    # Service Worker，书签缓存同步
├── newtab/
│   ├── index.html                  # 新标签页入口
│   ├── main.tsx                    # React 入口
│   └── App.tsx                     # 根组件
├── components/
│   ├── Sidebar.tsx                 # 分类侧边栏
│   ├── SearchBar.tsx               # 搜索栏（防抖 + Escape）
│   ├── BookmarkGrid.tsx            # 书签网格（分组/平铺）
│   ├── BookmarkCard.tsx            # 单个书签卡片
│   ├── RecommendSection.tsx        # 推荐模块
│   └── SettingsPanel.tsx           # 设置面板（导入/导出）
├── hooks/
│   ├── useBookmarks.ts             # 书签数据 hook
│   ├── useSearch.ts                # 搜索逻辑 hook
│   └── useRecommendation.ts        # 推荐逻辑 hook
├── services/
│   └── bookmark-import.ts          # HTML 书签解析/导出
└── styles/
    ├── variables.css               # 全局样式 + 浅色主题
    └── fonts/                      # Playwrite DK Uloopet Guides 字体
```

## 权限说明

| 权限 | 用途 |
|------|------|
| `bookmarks` | 读取 Chrome 书签数据 |
| `storage` | 缓存书签数据，记录点击频次 |

## License

MIT
