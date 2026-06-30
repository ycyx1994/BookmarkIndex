import { useState, useEffect, useRef, useCallback } from 'react'

interface SearchBarProps {
  query: string
  onChange: (query: string) => void
}

export function SearchBar({ query, onChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(query)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number>(0)

  // 外部清空 query 时同步到本地
  useEffect(() => {
    if (query === '') setLocalValue('')
  }, [query])

  // 防抖：停止输入 200ms 后才触发 onChange
  const handleChange = useCallback((value: string) => {
    setLocalValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => onChange(value), 200)
  }, [onChange])

  // 清除按钮：立即清空
  const handleClear = useCallback(() => {
    clearTimeout(debounceRef.current)
    setLocalValue('')
    onChange('')
  }, [onChange])

  // Escape 键清空并失焦
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear()
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClear])

  return (
    <div className="search-bar">
      <div className="search-container">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={e => handleChange(e.target.value)}
          placeholder="搜索书签..."
          autoComplete="off"
        />
        {localValue && (
          <button className="clear-btn" onClick={handleClear}>×</button>
        )}
      </div>
    </div>
  )
}
