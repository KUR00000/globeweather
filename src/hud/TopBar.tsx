import { useState, useEffect } from 'react'
import { SearchBar } from './SearchBar'
import { Cpu, Clock } from 'lucide-react'

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
    <div className="top-bar-hud fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-6 border-b border-hud-cyan/30 bg-black/40 backdrop-blur-md z-[1000]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-hud-cyan font-bold uppercase tracking-widest text-[10px] sm:text-xs">
          <Cpu size={16} strokeWidth={2.5} />
          <span>SENTINEL GLOBE</span>
        </div>
        <div className="hidden md:block w-px h-6 bg-hud-cyan/20" />
      </div>

      <div className="flex-1 flex justify-center max-w-xl mx-auto px-4">
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-hud-cyan/40 text-[9px] font-mono tracking-tighter uppercase">
          <Clock size={10} />
          <span>UTC CHRONO</span>
        </div>
        <div className="text-hud-cyan text-sm font-mono font-bold tracking-widest">
          {formatUTCTime(utcTime)}
        </div>
      </div>
    </div>
  )
}