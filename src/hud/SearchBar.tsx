import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGlobeStore } from '../store/useGlobeStore'
import { Search, ChevronRight } from 'lucide-react'
import type { City } from '../data'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<City[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cities = useGlobeStore(state => state.cities)
  const selectCity = useGlobeStore(state => state.selectCity)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const filtered = cities
      .filter(c => 
        c.n.toLowerCase().includes(query.toLowerCase()) || 
        c.c.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.p - a.p) // Sort by population
      .slice(0, 8)

    setResults(filtered)
  }, [query, cities])

  const handleSelect = (city: City) => {
    selectCity(city)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="SearchBar relative w-64 md:w-80">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="SEARCH CITIES..."
          className="w-full h-8 bg-black/40 border border-hud-cyan/30 rounded-full px-4 pl-10 text-xs text-hud-cyan placeholder:text-hud-cyan/40 focus:outline-none focus:border-hud-cyan/60 transition-all uppercase tracking-widest font-mono"
        />
        <Search className="absolute left-3 w-4 h-4 text-hud-cyan/60" strokeWidth={2.5} />
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-xl border border-hud-cyan/30 rounded-2xl overflow-hidden z-[100] shadow-2xl shadow-cyan-900/40"
          >
            {results.map((city, idx) => (
              <button
                key={`${city.n}-${city.la}-${idx}`}
                onClick={() => handleSelect(city)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-hud-cyan/10 transition-colors border-b border-hud-cyan/10 last:border-none group"
              >
                <div className="text-left">
                  <div className="text-sm font-medium text-white group-hover:text-hud-cyan transition-colors uppercase tracking-tight">
                    {city.n}
                  </div>
                  <div className="text-[10px] text-hud-cyan/50 font-mono uppercase">
                    {city.c} • {(city.p / 1000).toFixed(0)}K POP
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-hud-cyan/0 group-hover:text-hud-cyan transition-all" strokeWidth={3} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  )
}
