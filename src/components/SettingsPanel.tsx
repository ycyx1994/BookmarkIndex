import { useState, useRef } from 'react'
import { useBookmarks, type FolderItem, type BookmarkItem } from '../hooks/useBookmarks'
import { parseBookmarkHtml, exportBookmarkHtml, downloadFile } from '../services/bookmark-import'

interface SettingsPanelProps {
  onClose: () => void
}

type ImportState = 'idle' | 'confirm' | 'importing' | 'done'

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { folders, bookmarks } = useBookmarks()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importState, setImportState] = useState<ImportState>('idle')
  const [importData, setImportData] = useState<{ folders: FolderItem[]; bookmarks: BookmarkItem[] } | null>(null)
  const [backupBeforeReplace, setBackupBeforeReplace] = useState(true)
  const [message, setMessage] = useState('')

  // 触发文件选择
  function handleImportClick() {
    fileRef.current?.click()
  }

  // 读取文件后进入确认
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const html = reader.result as string
      const data = parseBookmarkHtml(html)
      if (data.bookmarks.length === 0) {
        setMessage('未从文件中解析到有效书签')
        return
      }
      setImportData(data)
      setImportState('confirm')
      setMessage('')
    }
    reader.readAsText(file)
    // 清空 input 以便重复选择同一文件
    e.target.value = ''
  }

  // 确认导入
  async function handleConfirmImport() {
    if (!importData) return
    setImportState('importing')

    try {
      if (backupBeforeReplace) {
        const backupHtml = exportBookmarkHtml(folders, bookmarks)
        downloadFile(backupHtml, `bookmarks-backup-${Date.now()}.html`)
      }

      await chrome.storage.local.set({
        importedFolders: importData.folders,
        importedBookmarks: importData.bookmarks,
      })

      // 合并写入（Chrome 原生 + 导入）
      const mergedFolders = [...folders, ...importData.folders]
      const mergedBookmarks = [...bookmarks, ...importData.bookmarks]
      await chrome.storage.local.set({
        folders: mergedFolders,
        bookmarks: mergedBookmarks,
      })

      setImportState('done')
      setMessage(`成功导入 ${importData.bookmarks.length} 个书签，${importData.folders.length} 个分类`)
    } catch (e) {
      setMessage('导入失败：' + (e instanceof Error ? e.message : String(e)))
      setImportState('idle')
    }
  }

  // 导出
  function handleExport() {
    const html = exportBookmarkHtml(folders, bookmarks)
    downloadFile(html, `bookmarks-export-${Date.now()}.html`)
    setMessage('导出完成')
  }

  // 清除推荐数据
  async function handleClearStats() {
    await chrome.storage.local.remove('clickStats')
    setMessage('推荐数据已清除')
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h3>设置</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="settings-body">
          <input
            ref={fileRef}
            type="file"
            accept=".html,.htm"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* 导入 */}
          <div className="settings-section">
            <h4>导入书签</h4>
            <p className="settings-desc">从 HTML 书签文件导入（Netscape 格式）</p>

            {importState === 'idle' && (
              <button className="settings-action-btn" onClick={handleImportClick}>
                选择文件
              </button>
            )}

            {importState === 'confirm' && importData && (
              <div className="import-confirm">
                <div className="import-info">
                  <span>书签：{importData.bookmarks.length} 个</span>
                  <span>分类：{importData.folders.length} 个</span>
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={backupBeforeReplace}
                    onChange={e => setBackupBeforeReplace(e.target.checked)}
                  />
                  导入前备份现有书签
                </label>
                <div className="import-actions">
                  <button className="settings-action-btn primary" onClick={handleConfirmImport}>
                    确认导入
                  </button>
                  <button className="settings-action-btn" onClick={() => { setImportState('idle'); setImportData(null) }}>
                    取消
                  </button>
                </div>
              </div>
            )}

            {importState === 'importing' && <p className="settings-status">导入中...</p>}
            {importState === 'done' && (
              <button className="settings-action-btn" onClick={() => { setImportState('idle'); setImportData(null) }}>
                继续导入
              </button>
            )}
          </div>

          {/* 导出 */}
          <div className="settings-section">
            <h4>导出书签</h4>
            <p className="settings-desc">将所有书签导出为 HTML 文件</p>
            <button className="settings-action-btn" onClick={handleExport}>
              导出为 HTML
            </button>
          </div>

          {/* 推荐数据 */}
          <div className="settings-section">
            <h4>推荐数据</h4>
            <p className="settings-desc">清除基于点击频次的推荐记录</p>
            <button className="settings-action-btn danger" onClick={handleClearStats}>
              清除推荐数据
            </button>
          </div>

          {message && <p className="settings-message">{message}</p>}
        </div>
      </div>
    </div>
  )
}
