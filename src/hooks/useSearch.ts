import { useMemo } from 'react'
import type { BookmarkItem } from './useBookmarks'

export function useSearch(bookmarks: BookmarkItem[], query: string) {
  return useMemo(() => {
    if (!query.trim()) return bookmarks
    const q = query.toLowerCase()
    return bookmarks.filter(
      bm => bm.title.toLowerCase().includes(q) || bm.url.toLowerCase().includes(q)
    )
  }, [bookmarks, query])
}
