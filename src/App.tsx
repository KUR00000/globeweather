import './index.css'
import { GlobeCanvas } from './globe/GlobeCanvas'
import { PanelContainer } from './panels/PanelContainer'
import { TopBar } from './hud/TopBar'
import { HintText } from './hud/HintText'
import { Scanlines } from './hud/Scanlines'

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-black via-cyan-900/20 to-purple-900/20">
      {/* HUD Overlays */}
      <TopBar />
      <HintText />
      <Scanlines />

      {/* Main Canvas */}
      <GlobeCanvas className="canvas-container" />

      {/* Data Panels - managed by PanelContainer */}
      <PanelContainer />
    </div>
  )
}

export default App