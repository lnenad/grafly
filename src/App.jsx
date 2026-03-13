import { useEffect, useCallback, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Toolbar from './components/Toolbar'
import ShapeLibrary from './components/ShapeLibrary'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import ContextMenu from './components/ContextMenu'
import useDiagramStore from './store/diagramStore'

function App() {
  const { undo, redo, canUndo, canRedo, deleteSelected, copySelected, paste } = useDiagramStore()
  const [contextMenu, setContextMenu] = useState(null)

  // Global keyboard shortcuts
  const onKeyDown = useCallback(
    (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      if (isInput) return

      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if (meta && e.key === 'c') {
        e.preventDefault()
        copySelected()
      } else if (meta && e.key === 'v') {
        e.preventDefault()
        paste()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      }
    },
    [undo, redo, deleteSelected, copySelected, paste]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden">
        {/* Top toolbar */}
        <Toolbar />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: shape library */}
          <ShapeLibrary />

          {/* Center: canvas */}
          <div className="flex-1 relative overflow-hidden">
            <Canvas onContextMenu={(x, y) => setContextMenu({ x, y })} />
          </div>

          {/* Right: properties panel */}
          <PropertiesPanel />
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </ReactFlowProvider>
  )
}

export default App
