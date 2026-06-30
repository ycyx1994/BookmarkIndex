interface BookmarkCardProps {
  title: string
  url: string
  onClick?: () => void
}

export function BookmarkCard({ title, url, onClick }: BookmarkCardProps) {
  let hostname = ''
  try {
    hostname = new URL(url).hostname
  } catch {}

  const faviconUrl = hostname
    ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
    : ''

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bookmark-card"
      onClickCapture={onClick}
    >
      <div className="bookmark-card-header">
        {faviconUrl && (
          <img
            className="favicon-img"
            src={faviconUrl}
            alt=""
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        )}
        <span className="bookmark-card-title" title={title}>{title}</span>
      </div>
      <div className="bookmark-card-desc" title={hostname}>{hostname}</div>
    </a>
  )
}
