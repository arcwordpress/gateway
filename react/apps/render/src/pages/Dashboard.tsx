import { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { saveApp, type LogEntry } from '../lib/api'

const APP_KEY = 'test1'

const nodeStyle = {
  background: '#27272a',
  border: '1px solid #3f3f46',
  color: '#f4f4f5',
  borderRadius: '0.5rem',
}

const initialNodes = [
  { id: '1', type: 'default', position: { x: 200, y: 100 }, data: { label: 'Start' }, style: nodeStyle },
  { id: '2', type: 'default', position: { x: 500, y: 100 }, data: { label: 'Render' }, style: nodeStyle },
]

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }]

type SaveState = 'idle' | 'saving' | 'done'

export default function Dashboard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const nextId = useRef(initialNodes.length + 1)

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [log, setLog] = useState<LogEntry[]>([])
  const [appUrl, setAppUrl] = useState<string | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const addNode = useCallback(() => {
    const id = String(nextId.current++)
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'default',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 50 },
        data: { label: `Node ${id}` },
        style: nodeStyle,
      },
    ])
  }, [setNodes])

  const handleSave = useCallback(async () => {
    setSaveState('saving')
    setLog([{ level: 'info', message: `Starting build for "${APP_KEY}"...` }])
    setAppUrl(null)
    try {
      const result = await saveApp(APP_KEY)
      setLog(result.log)
      if (result.url) setAppUrl(result.url)
      setSaveState('done')
    } catch (err) {
      setLog([{ level: 'error', message: String(err) }])
      setSaveState('done')
    }
  }, [])

  return (
    <div className="render-dashboard">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="render-dashboard__header">
        <span className="render-dashboard__title">Render</span>
        <div className="render-dashboard__actions">
          <button className="render-btn" onClick={addNode}>Add node</button>
          <button
            className={`render-btn render-btn--primary${saveState === 'saving' ? ' render-btn--loading' : ''}`}
            onClick={handleSave}
            disabled={saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Building…' : 'Save'}
          </button>
        </div>
      </header>

      {/* ── Body (relative — panels are absolute inside) ───────────────── */}
      <div className="render-dashboard__body">

        <div className="render-panel render-panel--top">
          <span className="render-panel__label">Canvas</span>
        </div>

        <div className="render-dashboard__mid">
          <div className="render-panel render-panel--left">
            <span className="render-panel__label">Layers</span>
          </div>

          <div className="render-dashboard__canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              colorMode="dark"
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>

          <div className="render-panel render-panel--right">
            <span className="render-panel__label">Properties</span>
          </div>
        </div>

        {/* ── Bottom: build console ────────────────────────────────────── */}
        <div className="render-panel render-panel--bottom">
          <div className="render-console">
            <div className="render-console__bar">
              <span className="render-console__label">Output</span>
              {appUrl && (
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="render-console__link"
                >
                  Open app ↗
                </a>
              )}
            </div>
            <div className="render-console__body">
              {log.length === 0 && saveState === 'idle' && (
                <span className="render-console__empty">Press Save to build the app.</span>
              )}
              {log.map((entry, i) => (
                <div key={i} className={`render-console__line render-console__line--${entry.level}`}>
                  <span className="render-console__prefix">
                    {entry.level === 'success' ? '✓' : entry.level === 'error' ? '✗' : '›'}
                  </span>
                  <span>{entry.message}</span>
                </div>
              ))}
              {saveState === 'saving' && (
                <div className="render-console__line render-console__line--info">
                  <span className="render-console__prefix render-console__prefix--spin">◌</span>
                  <span>Building…</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
