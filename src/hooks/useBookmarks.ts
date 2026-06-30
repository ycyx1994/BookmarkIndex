import { useState, useEffect } from 'react'

export interface BookmarkItem {
  id: string
  title: string
  url: string
  folderId: string | null
}

export interface FolderItem {
  id: string
  name: string
}

interface UseBookmarksResult {
  bookmarks: BookmarkItem[]
  folders: FolderItem[]
  loading: boolean
  error: string | null
}

export function useBookmarks(): UseBookmarksResult {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const stored = await chrome.storage.local.get(['bookmarks', 'folders']) as { bookmarks?: BookmarkItem[]; folders?: FolderItem[] }
        if (stored.bookmarks && stored.folders) {
          setBookmarks(stored.bookmarks)
          setFolders(stored.folders)
        } else {
          // 首次加载，直接从 API 读取
          const tree = await chrome.bookmarks.getTree()
          const { folders: f, bookmarks: b } = flattenBookmarks(tree)
          setFolders(f)
          setBookmarks(b)
          await chrome.storage.local.set({ folders: f, bookmarks: b })
        }
      } catch (e) {
        setError('加载书签失败')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { bookmarks, folders, loading, error }
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
        bookmarks.push({ id: node.id, title: node.title, url: node.url, folderId: parentId })
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
