import { useState, useEffect } from 'react'

export function TopBar() {
  const [utcTime, setUtcTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatUTCTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-10 flex items-center justify-between px-6 border-b border-hud-cyan/50 bg-black/30 backdrop-blur-sm z-50">
      <div className="text-hud-cyan font-medium uppercase tracking-wider text-xs">
        CITY INTELLIGENCE GLOBE
      </div>
      <div className="text-hud-text text-sm font-mono">
        UTC {formatUTCTime(utcTime)}
      </div>
    </div>
  )
}