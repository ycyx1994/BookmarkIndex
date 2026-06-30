import type { FolderItem } from '../hooks/useBookmarks'

interface SidebarProps {
  folders: FolderItem[]
  folderCounts: Map<string, number>
  totalCount: number
  activeCategory: string | null
  onSelect: (category: string | null) => void
}

export function Sidebar({ folders, folderCounts, totalCount, activeCategory, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>分类</h2>
      </div>
      <nav className="sidebar-nav">
        <div
          className={`sidebar-nav-item ${activeCategory === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className="nav-label">全部书签</span>
          <span className="nav-count">{totalCount}</span>
        </div>
        {folders.map(folder => (
          <div
            key={folder.id}
            className={`sidebar-nav-item ${activeCategory === folder.id ? 'active' : ''}`}
            onClick={() => onSelect(folder.id)}
          >
            <span className="nav-label">{folder.name}</span>
            <span className="nav-count">{folderCounts.get(folder.id) || 0}</span>
          </div>
        ))}
      </nav>
    </aside>
  )
}
