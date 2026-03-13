import { useEffect, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Toolbar from './components/Toolbar'
import ShapeLibrary from './components/ShapeLibrary'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import useDiagramStore from './store/diagramStore'

function App() {
  const { undo, redo, canUndo, canRedo, deleteSelected } = useDiagramStore()

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
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      }
    },
    [undo, redo, deleteSelected]
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
            <Canvas />
          </div>

          {/* Right: properties panel */}
          <PropertiesPanel />
        </div>
      </div>
    </ReactFlowProvider>
  )
}

export default App
