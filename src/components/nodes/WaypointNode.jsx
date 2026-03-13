import { memo, useCallback } from 'react'
import useDiagramStore from '../../store/diagramStore'

const SIZE = 24

const WaypointNode = memo(function WaypointNode({ data }) {
  const updateEdgeData = useDiagramStore((s) => s.updateEdgeData)

  const reset = useCallback((e) => {
    e.stopPropagation()
    updateEdgeData(data.edgeId, { waypoint: null })
  }, [data.edgeId, updateEdgeData])

  return (
    <div
      onDoubleClick={reset}
      title="Drag to bend · Double-click to reset"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: '50%',
        background: '#7B61FF',
        border: '3px solid white',
        boxShadow: '0 2px 8px rgba(123,97,255,0.45)',
        cursor: 'grab',
      }}
    />
  )
})

export { SIZE }
export default WaypointNode
