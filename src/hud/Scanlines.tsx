export function Scanlines() {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{
        background: 'repeating-linear-gradient(\n          0deg,\n          transparent,\n          transparent 2px,\n          rgba(0, 0, 0, 0.08) 2px,\n          rgba(0, 0, 0, 0.08) 4px\n        )',
        zIndex: 1000,
        opacity: 0.3
      }}
    />
  )
}