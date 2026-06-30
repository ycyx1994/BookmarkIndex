import { BookmarkCard } from './BookmarkCard'
import type { BookmarkItem } from '../hooks/useBookmarks'

interface RecommendSectionProps {
  topBookmarks: BookmarkItem[]
  onBookmarkClick?: (url: string) => void
}

export function RecommendSection({ topBookmarks, onBookmarkClick }: RecommendSectionProps) {
  if (topBookmarks.length === 0) return null

  return (
    <section className="recommend-section">
      <div className="section-header">
        <h3 className="section-title">推荐书签</h3>
        <span className="section-subtitle">基于访问频次</span>
      </div>
      <div className="recommend-grid">
        {topBookmarks.map(bm => (
          <BookmarkCard key={bm.id} title={bm.title} url={bm.url} onClick={() => onBookmarkClick?.(bm.url)} />
        ))}
      </div>
    </section>
  )
}
