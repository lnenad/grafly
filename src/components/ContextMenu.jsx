import { useEffect, useRef } from 'react'
import useDiagramStore from '../store/diagramStore'

function MenuItem({ onClick, children, danger, disabled }) {
  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
        disabled
          ? 'opacity-40 cursor-not-allowed text-gray-400'
          : danger
            ? 'text-red-500 hover:bg-red-50'
            : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function MenuDivider() {
  return <div className="my-1 border-t border-gray-100" />
}

function MenuLabel({ children }) {
  return (
    <div className="px-3 pt-1 pb-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
      {children}
    </div>
  )
}

export default function ContextMenu({ x, y, onClose }) {
  const ref = useRef(null)

  const selectedNodes    = useDiagramStore((s) => s.selectedNodes)
  const selectedEdges    = useDiagramStore((s) => s.selectedEdges)
  const clipboard        = useDiagramStore((s) => s.clipboard)
  const copySelected     = useDiagramStore((s) => s.copySelected)
  const paste            = useDiagramStore((s) => s.paste)
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected)
  const deleteSelected   = useDiagramStore((s) => s.deleteSelected)
  const bringToFront     = useDiagramStore((s) => s.bringToFront)
  const sendToBack       = useDiagramStore((s) => s.sendToBack)
  const bringForward     = useDiagramStore((s) => s.bringForward)
  const sendBackward     = useDiagramStore((s) => s.sendBackward)
  const alignNodes       = useDiagramStore((s) => s.alignNodes)

  const hasNodes     = selectedNodes.length > 0
  const hasSelection = hasNodes || selectedEdges.length > 0
  const multiNode    = selectedNodes.length > 1
  const hasClipboard = !!clipboard?.nodes?.length

  // Close on outside click is handled by the backdrop below

  // Close on Escape or scroll
  useEffect(() => {
    const onKey    = (e) => { if (e.key === 'Escape') onClose() }
    const onScroll = () => onClose()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [onClose])

  const act = (fn) => () => { fn(); onClose() }

  // Flip menu if it would overflow the viewport
  const menuW = 188, menuH = 340
  const left = x + menuW > window.innerWidth  ? x - menuW : x
  const top  = y + menuH > window.innerHeight ? y - menuH : y

  return (
    <>
      {/* Backdrop — catches any click outside the menu */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose() }}
      />
    <div
      ref={ref}
      style={{ position: 'fixed', left, top, zIndex: 9999, minWidth: menuW }}
      className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 select-none"
    >
      {/* Clipboard */}
      {hasSelection && <MenuItem onClick={act(copySelected)}>Copy</MenuItem>}
      {hasClipboard  && <MenuItem onClick={act(paste)}>Paste</MenuItem>}
      {hasNodes      && <MenuItem onClick={act(duplicateSelected)}>Duplicate</MenuItem>}

      {/* Delete */}
      {hasSelection && (
        <>
          <MenuDivider />
          <MenuItem onClick={act(deleteSelected)} danger>Delete</MenuItem>
        </>
      )}

      {/* Nothing at all */}
      {!hasSelection && !hasClipboard && (
        <MenuItem disabled>Nothing selected</MenuItem>
      )}
      {!hasSelection && hasClipboard && (
        <MenuItem onClick={act(paste)}>Paste</MenuItem>
      )}

      {/* Layering */}
      {hasNodes && (
        <>
          <MenuDivider />
          <MenuLabel>Layer</MenuLabel>
          <MenuItem onClick={act(bringToFront)}>Bring to Front</MenuItem>
          <MenuItem onClick={act(bringForward)}>Bring Forward</MenuItem>
          <MenuItem onClick={act(sendBackward)}>Send Backward</MenuItem>
          <MenuItem onClick={act(sendToBack)}>Send to Back</MenuItem>
        </>
      )}

      {/* Alignment */}
      {multiNode && (
        <>
          <MenuDivider />
          <MenuLabel>Align</MenuLabel>
          <MenuItem onClick={act(() => alignNodes('left'))}>Align Left</MenuItem>
          <MenuItem onClick={act(() => alignNodes('center-h'))}>Align Center (H)</MenuItem>
          <MenuItem onClick={act(() => alignNodes('right'))}>Align Right</MenuItem>
          <MenuItem onClick={act(() => alignNodes('top'))}>Align Top</MenuItem>
          <MenuItem onClick={act(() => alignNodes('center-v'))}>Align Center (V)</MenuItem>
          <MenuItem onClick={act(() => alignNodes('bottom'))}>Align Bottom</MenuItem>
        </>
      )}
    </div>
    </>
  )
}
