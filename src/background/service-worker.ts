// Background Service Worker
// 监听书签变更事件，自动同步 chrome.storage.local 缓存

chrome.bookmarks.onCreated.addListener(syncBookmarks)
chrome.bookmarks.onRemoved.addListener(syncBookmarks)
chrome.bookmarks.onChanged.addListener(syncBookmarks)
chrome.bookmarks.onMoved.addListener(syncBookmarks)

async function syncBookmarks() {
  const tree = await chrome.bookmarks.getTree()
  const { folders, bookmarks } = flattenBookmarks(tree)
  await chrome.storage.local.set({ folders, bookmarks })
}

interface BookmarkItem {
  id: string
  title: string
  url: string
  folderId: string | null
}

interface FolderItem {
  id: string
  name: string
}

function flattenBookmarks(tree: chrome.bookmarks.BookmarkTreeNode[]): {
  folders: FolderItem[]
  bookmarks: BookmarkItem[]
} {
  const folders: FolderItem[] = []
  const bookmarks: BookmarkItem[] = []

  function walk(nodes: chrome.bookmarks.BookmarkTreeNode[], parentId: string | null) {
    for (const node of nodes) {
      if (node.url) {
        bookmarks.push({
          id: node.id,
          title: node.title,
          url: node.url,
          folderId: parentId,
        })
      } else if (node.children) {
        if (node.id !== '0') {
          folders.push({ id: node.id, name: node.title })
        }
        walk(node.children, node.id !== '0' ? node.id : null)
      }
    }
  }

  walk(tree, null)
  return { folders, bookmarks }
}

// 扩展安装时初始化缓存
chrome.runtime.onInstalled.addListener(() => {
  syncBookmarks()
})
