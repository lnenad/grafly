import { memo, useState, useCallback } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getStraightPath, getSmoothStepPath } from '@xyflow/react'
import useDiagramStore from '../../store/diagramStore'

const CustomEdge = memo(function CustomEdge({
  id,
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  data = {},
  selected,
}) {
  const [editing, setEditing] = useState(false)
  const [labelText, setLabelText] = useState(data.label || '')
  const updateEdgeData = useDiagramStore((s) => s.updateEdgeData)

  const color       = data.edgeColor || '#6B7280'
  const strokeWidth = data.edgeWidth || 2
  const dashArray   = data.edgeStyle === 'dashed' ? '6 4' : data.edgeStyle === 'dotted' ? '2 3' : undefined
  const arrowStyle  = data.arrowType || 'filled'
  const pathType = data.pathType || 'smoothstep'

  const pathArgs = { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition }
  const [pathStr, labelX, labelY] = pathType === 'straight'
    ? getStraightPath(pathArgs)
    : pathType === 'bezier'
    ? getBezierPath(pathArgs)
    : getSmoothStepPath(pathArgs)

  const markerId = `arrow-${id}`

  const commitLabel = useCallback(() => {
    updateEdgeData(id, { label: labelText })
    setEditing(false)
  }, [id, labelText, updateEdgeData])

  return (
    <>
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          {arrowStyle === 'open'
            ? <path d="M0,0 L6,3 L0,6" fill="none" stroke={selected ? '#7B61FF' : color} strokeWidth="1.5" />
            : <path d="M0,0 L0,6 L8,3 z" fill={selected ? '#7B61FF' : color} />}
        </marker>
        {data.arrowStart && (
          <marker id={`${markerId}-start`} markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto-start-reverse">
            <path d="M0,0 L0,6 L8,3 z" fill={selected ? '#7B61FF' : color} />
          </marker>
        )}
      </defs>

      {/* Wide transparent hit-area */}
      <path d={pathStr} fill="none" stroke="transparent" strokeWidth={16} style={{ cursor: 'pointer' }} />

      <BaseEdge
        path={pathStr}
        style={{
          stroke:          selected ? '#7B61FF' : color,
          strokeWidth:     selected ? Math.max(strokeWidth, 2) : strokeWidth,
          strokeDasharray: dashArray,
          strokeLinecap:   'round',
        }}
        markerEnd={`url(#${markerId})`}
        markerStart={data.arrowStart ? `url(#${markerId}-start)` : undefined}
      />

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
                background: 'white', border: `1px solid ${selected ? '#7B61FF' : '#E5E7EB'}`,
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
