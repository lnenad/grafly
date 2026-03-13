import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ConnectionMode,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import ShapeNode from './nodes/ShapeNode'
import CustomEdge from './edges/CustomEdge'
import useDiagramStore from '../store/diagramStore'

const nodeTypes = { shape: ShapeNode }
const edgeTypes = { custom: CustomEdge }

function CanvasInner({ onContextMenu }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onViewportChange,
    onSelectionChange,
    addNode,
    deleteSelected,
    selectNode,
    selectEdge,
    selectedNodes,
    selectedEdges,
    showMinimap,
    showGrid,
    snapToGrid,
    edgeType,
    viewport,
  } = useDiagramStore()

  const reactFlowInstance = useReactFlow()

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const payload = e.dataTransfer.getData('application/charty-shape')
    if (!payload) return

    const shapeData = JSON.parse(payload)
    const position  = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })

    addNode({
      id:   `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'shape',
      position: {
        x: position.x - shapeData.defaultWidth  / 2,
        y: position.y - shapeData.defaultHeight / 2,
      },
      data:   { ...shapeData.defaultData },
      width:  shapeData.defaultWidth,
      height: shapeData.defaultHeight,
    })
  }, [reactFlowInstance, addNode])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return
      deleteSelected()
    }
  }, [deleteSelected])

  const defaultEdgeOptions = useMemo(() => ({
    type: 'custom',
    data: {
      label:     '',
      edgeStyle: 'solid',
      edgeColor: '#9CA3AF',
      edgeWidth: 2,
      arrowType: 'filled',
      pathType:  edgeType,
    },
  }), [edgeType])

  return (
    <div
      className="w-full h-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        defaultEdgeOptions={defaultEdgeOptions}
        defaultViewport={viewport}
        onViewportChange={onViewportChange}
        snapToGrid={snapToGrid}
        snapGrid={[16, 16]}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        fitView={nodes.length === 0}
        minZoom={0.1}
        maxZoom={4}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        connectionMode={ConnectionMode.Loose}
        connectOnClick={false}
        elevateEdgesOnSelect
        elevateNodesOnSelect
        onNodeContextMenu={(e, node) => {
          e.preventDefault()
          if (!selectedNodes.some((n) => n.id === node.id)) selectNode(node.id)
          onContextMenu(e.clientX, e.clientY)
        }}
        onEdgeContextMenu={(e, edge) => {
          e.preventDefault()
          if (!selectedEdges.some((ed) => ed.id === edge.id)) selectEdge(edge.id)
          onContextMenu(e.clientX, e.clientY)
        }}
        onPaneContextMenu={(e) => { e.preventDefault(); onContextMenu(e.clientX, e.clientY) }}
      >
        {showGrid && (
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#D1D5DB" />
        )}
        <Controls showInteractive={false} style={{ bottom: 24, left: 24 }} />
        {showMinimap && (
          <MiniMap
            nodeColor={(n) => n.data?.fillColor || '#EEF2FF'}
            nodeStrokeColor={() => '#7B61FF'}
            nodeStrokeWidth={2}
            style={{ bottom: 24, right: 24 }}
            zoomable
            pannable
          />
        )}
      </ReactFlow>

      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 12,
        }}>
          <div style={{ fontSize: 40, opacity: 0.18 }}>⬡</div>
          <p style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>
            Drag shapes from the panel to get started
          </p>
          <p style={{ fontSize: 12, color: '#D1D5DB' }}>
            Then drag between handles to connect shapes
          </p>
        </div>
      )}
    </div>
  )
}

export default CanvasInner
