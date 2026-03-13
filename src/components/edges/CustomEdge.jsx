import { memo, useState, useRef } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  useReactFlow,
} from '@xyflow/react'
import useDiagramStore from '../../store/diagramStore'
import {
  COLOR_PRIMARY,
  COLOR_BORDER_DEFAULT,
  COLOR_EDGE_DEFAULT,
  STROKE_DASH_DOTTED,
  EDGE_DASH_DASHED,
} from '../../utils/styleConstants'

const CustomEdge = memo(function CustomEdge({
  id,
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  data = {},
  selected,
}) {
  const [editing, setEditing]     = useState(false)
  const [labelText, setLabelText] = useState(data.label || '')
  const updateEdgeData            = useDiagramStore((s) => s.updateEdgeData)
  const pushHistory               = useDiagramStore((s) => s.pushHistory)
  const { screenToFlowPosition }  = useReactFlow()

  const color       = data.edgeColor || COLOR_EDGE_DEFAULT
  const strokeWidth = data.edgeWidth || 2
  const dashArray   = data.edgeStyle === 'dashed' ? EDGE_DASH_DASHED : data.edgeStyle === 'dotted' ? STROKE_DASH_DOTTED : undefined
  const arrowStyle  = data.arrowType || 'filled'
  const pathType    = data.pathType  || 'smoothstep'
  const wp          = data.waypoint  || null

  // Stable refs so closure callbacks always have the latest values
  const sfpRef     = useRef(screenToFlowPosition)
  const updateRef  = useRef(updateEdgeData)
  const historyRef = useRef(pushHistory)
  const edgeRef    = useRef({ sourceX, sourceY, targetX, targetY, pathType })
  sfpRef.current    = screenToFlowPosition
  updateRef.current = updateEdgeData
  historyRef.current = pushHistory
  edgeRef.current   = { sourceX, sourceY, targetX, targetY, pathType }

  let pathStr, labelX, labelY
  if (pathType === 'straight') {
    ;[pathStr, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  } else if (pathType === 'bezier') {
    if (wp) {
      // wp is the point ON the curve at t=0.5; back-calculate the control point
      // B(0.5) = 0.25*P0 + 0.5*P1 + 0.25*P2  =>  P1 = 2*wp - 0.5*(P0+P2)
      const cpx = 2 * wp.x - 0.5 * (sourceX + targetX)
      const cpy = 2 * wp.y - 0.5 * (sourceY + targetY)
      pathStr = `M ${sourceX},${sourceY} Q ${cpx},${cpy} ${targetX},${targetY}`
      labelX  = wp.x
      labelY  = wp.y
    } else {
      ;[pathStr, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
    }
  } else {
    ;[pathStr, labelX, labelY] = getSmoothStepPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      ...(wp ? { centerX: wp.x, centerY: wp.y } : {}),
    })
  }

  const markerId = `arrow-${id}`

  // Drag the edge line directly — mousedown on hit-area starts drag immediately.
  // Uses document-level listeners with capture:true so React Flow's handlers
  // can't intercept or block the mousemove events.
  const onHitAreaMouseDown = (e) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()

    const onMove = (mv) => {
      const pos = sfpRef.current({ x: mv.clientX, y: mv.clientY })
      const { sourceX: sx, sourceY: sy, targetX: tx, targetY: ty, pathType: pt } = edgeRef.current
      const wpPos = pt === 'smoothstep' ? {
        x: Math.min(Math.max(pos.x, Math.min(sx, tx)), Math.max(sx, tx)),
        y: Math.min(Math.max(pos.y, Math.min(sy, ty)), Math.max(sy, ty)),
      } : pos
      updateRef.current(id, { waypoint: wpPos }, { skipHistory: true })
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove, { capture: true })
      document.removeEventListener('mouseup',   onUp,   { capture: true })
      historyRef.current()
    }
    document.addEventListener('mousemove', onMove, { capture: true })
    document.addEventListener('mouseup',   onUp,   { capture: true })
  }

  const resetWaypoint = (e) => {
    e.stopPropagation()
    updateEdgeData(id, { waypoint: null })
  }

  const commitLabel = () => {
    updateEdgeData(id, { label: labelText })
    setEditing(false)
  }

  return (
    <>
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          {arrowStyle === 'open'
            ? <path d="M0,0 L6,3 L0,6" fill="none" stroke={selected ? COLOR_PRIMARY : color} strokeWidth="1.5" />
            : <path d="M0,0 L0,6 L8,3 z" fill={selected ? COLOR_PRIMARY : color} />}
        </marker>
        {data.arrowStart && (
          <marker id={`${markerId}-start`} markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto-start-reverse">
            <path d="M0,0 L0,6 L8,3 z" fill={selected ? COLOR_PRIMARY : color} />
          </marker>
        )}
      </defs>

      <BaseEdge
        path={pathStr}
        style={{
          stroke:          selected ? COLOR_PRIMARY : color,
          strokeWidth:     selected ? Math.max(strokeWidth, 2) : strokeWidth,
          strokeDasharray: dashArray,
          strokeLinecap:   'round',
        }}
        markerEnd={`url(#${markerId})`}
        markerStart={data.arrowStart ? `url(#${markerId}-start)` : undefined}
      />

      {/* Wide hit-area on top — mousedown here starts the bend drag */}
      {pathType !== 'straight' && (
        <path
          d={pathStr}
          fill="none"
          stroke="rgba(0,0,0,0)"
          strokeWidth={16}
          pointerEvents="stroke"
          style={{ cursor: 'grab' }}
          onMouseDown={onHitAreaMouseDown}
          onDoubleClick={resetWaypoint}
        />
      )}

      {/* Dot shown when a waypoint is set */}
      {wp && pathType !== 'straight' && (
        <circle cx={labelX} cy={labelY} r={5} fill="#7B61FF" stroke="white" strokeWidth={2} style={{ pointerEvents: 'none' }} />
      )}

      {/* Label */}
      {(data.label || editing) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position:  'absolute',
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
            onDoubleClick={(e) => { e.stopPropagation(); setLabelText(data.label || ''); setEditing(true) }}
          >
            {editing ? (
              <input
                autoFocus
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                onBlur={commitLabel}
                onKeyDown={(e) => { if (e.key === 'Enter') commitLabel(); if (e.key === 'Escape') setEditing(false) }}
                style={{
                  background: 'white', border: '1px solid #7B61FF', borderRadius: 4,
                  padding: '2px 6px', fontSize: 12, outline: 'none', minWidth: 60, textAlign: 'center',
                }}
              />
            ) : (
              <div style={{
                background: 'white', border: `1px solid ${selected ? COLOR_PRIMARY : COLOR_BORDER_DEFAULT}`,
                borderRadius: 4, padding: '2px 8px', fontSize: 12, color: '#374151',
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', userSelect: 'none',
              }}>
                {data.label}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

export default CustomEdge
