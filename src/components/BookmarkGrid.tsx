import { useMemo } from 'react'
import { BookmarkCard } from './BookmarkCard'
import type { BookmarkItem, FolderItem } from '../hooks/useBookmarks'

interface BookmarkGridProps {
  bookmarks: BookmarkItem[]
  folders: FolderItem[]
  activeCategory: string | null
  searchQuery: string
  loading: boolean
  error: string | null
  onBookmarkClick?: (url: string) => void
}

export function BookmarkGrid({ bookmarks, folders, activeCategory, searchQuery, loading, error, onBookmarkClick }: BookmarkGridProps) {
  if (loading) {
    return <div className="loading"><p>加载中...</p></div>
  }

  if (error) {
    return <div className="error-message"><p>{error}</p></div>
  }

  const filtered = bookmarks.filter(bm => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return bm.title.toLowerCase().includes(q) || bm.url.toLowerCase().includes(q)
    }
    if (activeCategory && bm.folderId !== activeCategory) return false
    return true
  })

  if (filtered.length === 0) {
    return <div className="no-results"><p>未找到匹配的书签</p></div>
  }

  // 选了具体分类或搜索模式 → 不分组，平铺展示
  if (activeCategory || searchQuery) {
    return (
      <div className="bookmark-grid">
        {filtered.map(bm => (
          <BookmarkCard key={bm.id} title={bm.title} url={bm.url} onClick={() => onBookmarkClick?.(bm.url)} />
        ))}
      </div>
    )
  }

  // 全部书签 → 按文件夹分段展示
  return <GroupedBookmarkGrid bookmarks={filtered} folders={folders} onBookmarkClick={onBookmarkClick} />
}

function GroupedBookmarkGrid({ bookmarks, folders, onBookmarkClick }: { bookmarks: BookmarkItem[]; folders: FolderItem[]; onBookmarkClick?: (url: string) => void }) {
  const folderMap = useMemo(() => {
    const m = new Map<string, FolderItem>()
    for (const f of folders) m.set(f.id, f)
    return m
  }, [folders])

  // 按 folderId 分组，保持文件夹顺序
  const groups = useMemo(() => {
    const map = new Map<string | null, BookmarkItem[]>()
    for (const bm of bookmarks) {
      const key = bm.folderId ?? null
      const list = map.get(key) || []
      list.push(bm)
      map.set(key, list)
    }

    const result: { folderId: string | null; name: string; items: BookmarkItem[] }[] = []
    for (const folder of folders) {
      const items = map.get(folder.id)
      if (items && items.length > 0) {
        result.push({ folderId: folder.id, name: folder.name, items })
      }
    }
    // 未分类的放最后
    const unsorted = map.get(null)
    if (unsorted && unsorted.length > 0) {
      result.push({ folderId: null, name: '未分类', items: unsorted })
    }
    return result
  }, [bookmarks, folders, folderMap])

  return (
    <div className="groups-container">
      {groups.map(group => (
        <section key={group.folderId ?? '__none__'} className="group-section">
          <div className="group-header">
            <h2 className="group-title">{group.name}</h2>
            <span className="group-count">{group.items.length} 个书签</span>
          </div>
          <div className="bookmark-grid">
            {group.items.map(bm => (
              <BookmarkCard key={bm.id} title={bm.title} url={bm.url} onClick={() => onBookmarkClick?.(bm.url)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
