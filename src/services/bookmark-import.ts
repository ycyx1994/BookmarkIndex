import type { BookmarkItem, FolderItem } from '../hooks/useBookmarks'

interface ImportedData {
  folders: FolderItem[]
  bookmarks: BookmarkItem[]
}

/** 解析 Netscape Bookmark HTML 格式 */
export function parseBookmarkHtml(html: string): ImportedData {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const folders: FolderItem[] = []
  const bookmarks: BookmarkItem[] = []

  let nextId = 10000

  function walkList(ul: Element, folderId: string | null) {
    for (const li of ul.children) {
      if (li.tagName !== 'LI') continue

      const anchor = li.querySelector(':scope > A') as HTMLAnchorElement | null
      const subUl = li.querySelector(':scope > DL') as Element | null
      const h3 = li.querySelector(':scope > H3') as HTMLElement | null

      if (h3 && subUl) {
        // 这是一个文件夹
        const id = `imported-${nextId++}`
        folders.push({ id, name: h3.textContent?.trim() || '未命名' })
        walkList(subUl, id)
      } else if (anchor) {
        // 这是一个书签
        const url = anchor.getAttribute('HREF') || anchor.href
        if (url && /^https?:\/\//.test(url)) {
          bookmarks.push({
            id: `imported-${nextId++}`,
            title: anchor.textContent?.trim() || url,
            url,
            folderId,
          })
        }
      }
    }
  }

  const dl = doc.querySelector('DL')
  if (dl) walkList(dl, null)

  return { folders, bookmarks }
}

/** 将书签导出为 Netscape Bookmark HTML 格式 */
export function exportBookmarkHtml(folders: FolderItem[], bookmarks: BookmarkItem[]): string {
  const lines: string[] = [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
  ]

  // 按文件夹分组
  const grouped = new Map<string | null, BookmarkItem[]>()
  for (const bm of bookmarks) {
    const list = grouped.get(bm.folderId) || []
    list.push(bm)
    grouped.set(bm.folderId, list)
  }

  // 无文件夹的书签
  for (const bm of grouped.get(null) || []) {
    lines.push(`    <DT><A HREF="${escapeAttr(bm.url)}">${escapeHtml(bm.title)}</A>`)
  }

  // 各文件夹内的书签
  for (const folder of folders) {
    const items = grouped.get(folder.id)
    if (!items || items.length === 0) continue
    lines.push(`    <DT><H3>${escapeHtml(folder.name)}</H3>`)
    lines.push('    <DL><p>')
    for (const bm of items) {
      lines.push(`        <DT><A HREF="${escapeAttr(bm.url)}">${escapeHtml(bm.title)}</A>`)
    }
    lines.push('    </DL><p>')
  }

  lines.push('</DL><p>')
  return lines.join('\n')
}

/** 触发文件下载 */
export function downloadFile(content: string, filename: string, mimeType = 'text/html') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
