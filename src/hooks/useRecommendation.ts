import { useState, useEffect } from 'react'
import type { BookmarkItem } from './useBookmarks'

interface ClickStats {
  [url: string]: number
}

interface UseRecommendationResult {
  topBookmarks: BookmarkItem[]
  recordClick: (url: string) => void
}

const STORAGE_KEY = 'clickStats'
const TOP_N = 5

export function useRecommendation(): UseRecommendationResult {
  const [stats, setStats] = useState<ClickStats>({})
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])

  useEffect(() => {
    async function load() {
      const stored = await chrome.storage.local.get([STORAGE_KEY, 'bookmarks']) as { clickStats?: ClickStats; bookmarks?: BookmarkItem[] }
      setStats(stored[STORAGE_KEY] || {})
      setBookmarks(stored.bookmarks || [])
    }
    load()
  }, [])

  const topBookmarks: BookmarkItem[] = (() => {
    const sorted = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, TOP_N)
      .map(([url]) => url)

    return sorted
      .map(url => bookmarks.find(bm => bm.url === url))
      .filter((bm): bm is BookmarkItem => !!bm)
  })()

  function recordClick(url: string) {
    const updated = { ...stats, [url]: (stats[url] || 0) + 1 }
    setStats(updated)
    chrome.storage.local.set({ [STORAGE_KEY]: updated })
  }

  return { topBookmarks, recordClick }
}
