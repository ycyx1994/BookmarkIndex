## 1. 项目初始化与 Manifest 配置

- [x] 1.1 创建项目目录结构（manifest.json、background.js、newtab.html/css/js、favicon.js、import.js、recommend.js、icons/）
- [x] 1.2 编写 manifest.json：声明 V3 清单、bookmarks 和 storage 权限、chrome_url_overrides.newtab、background service worker
- [x] 1.3 生成扩展图标（16px、48px、128px）放入 icons/ 目录

## 2. 书签数据层

- [x] 2.1 实现 Chrome 书签读取逻辑：调用 chrome.bookmarks.getTree()，提取顶层文件夹和书签，转换为内部数据结构（folders + bookmarks）
- [x] 2.2 实现 chrome.storage.local 缓存读写：将解析后的数据写入 storage，提供 getData() 接口
- [x] 2.3 实现 background service worker：监听 chrome.bookmarks.onCreated/onRemoved/onChanged/onMoved 事件，自动更新缓存
- [x] 2.4 实现 Chrome 书签与导入书签的合并逻辑：同名文件夹合并、按 URL 去重（Chrome 书签优先）

## 3. 新标签页 UI 骨架与主题

- [x] 3.1 编写 newtab.html 页面结构：顶部搜索栏、左侧侧边栏（分类列表 + 设置按钮）、右侧主内容区
- [x] 3.2 编写主题样式（注：实际采用浅色主题而非深色，见 design.md 决策 #10 已更新）
- [x] 3.3 实现侧边栏分类列表渲染：显示"全部书签"选项和所有文件夹，每个显示名称和书签数量
- [x] 3.4 实现侧边栏点击过滤交互：点击分类高亮该分类，右侧只显示该分类书签；点击"全部书签"显示所有

## 4. 书签卡片与 Favicon

- [x] 4.1 实现书签卡片网格渲染：CSS Grid 布局，每张卡片显示 favicon + 标题 + 域名
- [x] 4.2 实现 favicon.js：通过 Google Favicon API 获取图标，添加 onerror 降级处理（加载失败时隐藏图标）
- [x] 4.3 实现卡片点击打开链接：在新标签页中打开对应 URL

## 5. 搜索功能

- [x] 5.1 实现搜索栏输入监听与 200ms 防抖
- [x] 5.2 实现跨分类搜索过滤：按标题和 URL 关键词匹配，搜索时忽略当前分类选择
- [x] 5.3 实现搜索结果为空时的提示显示
- [x] 5.4 实现清除按钮和 Escape 键快捷操作：清空搜索恢复原视图

## 6. 推荐模块

- [x] 6.1 实现 recommend.js：记录书签点击频次到 chrome.storage.local 的 clickStats
- [x] 6.2 实现推荐区块渲染：按点击频次降序取 Top 20，显示在右侧主区域顶部
- [x] 6.3 实现无点击记录时隐藏推荐区块，搜索时隐藏推荐区块

## 7. 导入导出功能

- [x] 7.1 实现设置面板 UI：顶部右侧图标触发（注：原设计为侧边栏底部按钮，已改为 Lucide Settings 图标）
- [x] 7.2 实现 HTML 书签文件解析：解析 Netscape Bookmark 格式，提取书签和文件夹结构
- [x] 7.3 实现导入确认对话框：显示书签数量和分类数量、替换提示、备份勾选框
- [x] 7.4 实现导入数据写入：替换 chrome.storage.local 中的 importedBookmarks/importedFolders，刷新页面
- [x] 7.5 实现导出功能：将所有书签转换为 Netscape Bookmark HTML 格式，触发下载

## 8. 集成测试与收尾

- [ ] 8.1 在 Chrome 中加载未打包扩展，验证新标签页替换正常
- [ ] 8.2 验证书签读取、分类过滤、搜索、推荐、导入导出全流程
- [ ] 8.3 编写 README.md：项目说明、安装步骤、使用说明
