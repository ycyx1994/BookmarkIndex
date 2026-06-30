import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useBookmarks } from '../hooks/useBookmarks'
import { useRecommendation } from '../hooks/useRecommendation'
import { Sidebar } from '../components/Sidebar'
import { SearchBar } from '../components/SearchBar'
import { BookmarkGrid } from '../components/BookmarkGrid'
import { RecommendSection } from '../components/RecommendSection'
import { SettingsPanel } from '../components/SettingsPanel'

export function App() {
  const { bookmarks, folders, loading, error } = useBookmarks()
  const { topBookmarks, recordClick } = useRecommendation()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const folderCounts = new Map<string, number>()
  for (const bm of bookmarks) {
    if (bm.folderId) {
      folderCounts.set(bm.folderId, (folderCounts.get(bm.folderId) || 0) + 1)
    }
  }

  return (
    <div className="app">
      <header className="top-bar">
        <h1 className="top-bar-title">BookmarkIndex</h1>
        <SearchBar query={searchQuery} onChange={setSearchQuery} />
        <button className="icon-btn" title="设置" onClick={() => setShowSettings(true)}>
          <Settings size={18} />
        </button>
      </header>
      <div className="layout">
        <Sidebar
          folders={folders}
          folderCounts={folderCounts}
          totalCount={bookmarks.length}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
        <main className="main-content">
          {!searchQuery && <RecommendSection topBookmarks={topBookmarks} onBookmarkClick={recordClick} />}
          <BookmarkGrid
            bookmarks={bookmarks}
            folders={folders}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            loading={loading}
            error={error}
            onBookmarkClick={recordClick}
          />
        </main>
      </div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}
