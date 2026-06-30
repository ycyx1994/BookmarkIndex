## 新增需求

### 需求:系统必须通过 Chrome Bookmarks API 读取浏览器书签
系统必须使用 `chrome.bookmarks.getTree()` 获取完整的书签树，并将其转换为内部数据结构（folders + bookmarks）。

#### 场景:成功读取 Chrome 书签
- **当** 扩展初始化或 background service worker 启动时
- **那么** 系统必须调用 `chrome.bookmarks.getTree()` 获取书签树
- **并且** 将顶层文件夹（书签栏、其他书签）的子文件夹提取为分类列表
- **并且** 将所有书签条目提取为书签列表，关联到对应的文件夹 ID

#### 场景:书签文件夹展平为一级分类
- **当** Chrome 书签存在嵌套文件夹（如"工作/前端/React"）时
- **那么** 系统必须只取顶层文件夹作为分类（"工作"）
- **并且** 子文件夹中的书签归入顶层文件夹

#### 场景:书签树为空
- **当** 用户 Chrome 中没有任何书签时
- **那么** 系统必须显示空状态提示，不能报错

### 需求:系统必须将书签数据缓存到 chrome.storage.local
系统必须将解析后的书签数据（folders 和 bookmarks）存储到 `chrome.storage.local`，新标签页直接读取缓存而非实时调用 API。

#### 场景:首次加载缓存数据
- **当** 扩展首次安装或缓存为空时
- **那么** 系统必须调用 Chrome API 读取书签
- **并且** 将结果写入 `chrome.storage.local` 的 `folders` 和 `bookmarks` key

#### 场景:新标签页从缓存读取
- **当** 用户打开新标签页时
- **那么** 系统必须直接从 `chrome.storage.local` 读取书签数据
- **并且** 不调用 `chrome.bookmarks.getTree()` API

### 需求:background service worker 必须监听书签变更事件
系统必须在 background service worker 中监听 `chrome.bookmarks.onCreated`、`onRemoved`、`onChanged`、`onMoved` 事件，自动更新缓存。

#### 场景:用户新增书签
- **当** 用户在 Chrome 中新增一个书签
- **那么** 系统必须收到 `onCreated` 事件
- **并且** 将新书签添加到 `chrome.storage.local` 缓存中

#### 场景:用户删除书签
- **当** 用户在 Chrome 中删除一个书签
- **那么** 系统必须收到 `onRemoved` 事件
- **并且** 从缓存中移除对应书签

#### 场景:用户修改书签
- **当** 用户在 Chrome 中修改书签标题或 URL
- **那么** 系统必须收到 `onChanged` 事件
- **并且** 更新缓存中对应书签的数据

### 需求:系统必须支持 Chrome 书签和导入书签合并展示
系统必须将 Chrome 书签和 HTML 导入的书签合并为统一数据源，同名文件夹自动合并。

#### 场景:同名文件夹合并
- **当** Chrome 书签有"工作"文件夹，导入书签也有"工作"文件夹时
- **那么** 系统必须将两者合并为一个"工作"分类
- **并且** 该分类包含两个来源的所有书签

#### 场景:按 URL 去重
- **当** Chrome 书签和导入书签包含相同 URL 时
- **那么** 系统必须保留 Chrome 书签版本，忽略导入的重复项
