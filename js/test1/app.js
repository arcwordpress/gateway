import { h, render } from 'https://esm.sh/preact@10';
import { useState, useCallback, useRef }  from 'https://esm.sh/preact@10/hooks';
import htm from 'https://esm.sh/htm';

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from 'https://esm.sh/@xyflow/react?external=react,react-dom,react-dom/client,react/jsx-runtime';

const html = htm.bind(h);

// ── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = [
  { type: 'gwHeading', label: 'Heading', icon: '𝐇', defaults: { text: 'Heading', level: 'h2' } },
  { type: 'gwText',    label: 'Text',    icon: '¶', defaults: { text: 'Paragraph text here.' } },
  { type: 'gwButton',  label: 'Button',  icon: '⬡', defaults: { label: 'Click me' } },
  { type: 'gwImage',   label: 'Image',   icon: '🖼', defaults: { alt: 'Image', w: 200, h: 120 } },
  { type: 'gwBox',     label: 'Box',     icon: '□', defaults: { bg: '#e0e7ff', w: 180, h: 90, r: 8 } },
  { type: 'gwDivider', label: 'Divider', icon: '─', defaults: { width: 220 } },
];

let _id = 1;
const uid = () => 'n' + _id++;

// ── Custom node components ───────────────────────────────────────────────────
// Defined at module scope so React Flow gets stable references.

function GwHeadingNode({ data }) {
  const T = data.level || 'h2';
  return html`<div style="padding:6px 10px;min-width:120px">
    <${T} style="margin:0;line-height:1.2">${data.text}</${T}>
  </div>`;
}

function GwTextNode({ data }) {
  return html`<div style="padding:6px 10px;max-width:300px">
    <p style="margin:0;line-height:1.5">${data.text}</p>
  </div>`;
}

function GwButtonNode({ data }) {
  return html`<div style="padding:6px 10px">
    <button style="padding:8px 20px;background:#4f46e5;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer">
      ${data.label}
    </button>
  </div>`;
}

function GwImageNode({ data }) {
  return html`<div style="padding:6px 10px">
    <div style=${{ width:data.w+'px', height:data.h+'px', background:'#e2e8f0', borderRadius:'4px',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:'4px', color:'#94a3b8', fontSize:'12px' }}>
      <span style="font-size:24px">🖼</span>
      <span>${data.alt}</span>
    </div>
  </div>`;
}

function GwBoxNode({ data }) {
  return html`<div style="padding:6px 10px">
    <div style=${{ width:data.w+'px', height:data.h+'px', background:data.bg,
      borderRadius:data.r+'px', border:'1px solid rgba(0,0,0,.08)' }} />
  </div>`;
}

function GwDividerNode({ data }) {
  return html`<div style="padding:10px">
    <hr style=${{ margin:0, width:data.width+'px', border:'none', borderTop:'2px solid #cbd5e1' }} />
  </div>`;
}

const nodeTypes = {
  gwHeading: GwHeadingNode,
  gwText:    GwTextNode,
  gwButton:  GwButtonNode,
  gwImage:   GwImageNode,
  gwBox:     GwBoxNode,
  gwDivider: GwDividerNode,
};

// ── Palette sidebar ──────────────────────────────────────────────────────────

function PaletteItem({ type, label, icon }) {
  return html`
    <div
      draggable="true"
      onDragStart=${e => { e.dataTransfer.setData('gw/type', type); e.dataTransfer.effectAllowed = 'copy'; }}
      style=${{
        display:'flex', alignItems:'center', gap:'8px',
        padding:'7px 10px', marginBottom:'6px',
        border:'1px solid #e2e8f0', borderRadius:'6px',
        background:'#f8fafc', cursor:'grab', userSelect:'none', fontSize:'13px',
      }}
    >
      <span style="width:20px;text-align:center;font-size:15px">${icon}</span>
      <span>${label}</span>
    </div>
  `;
}

// ── Properties panel ─────────────────────────────────────────────────────────

const inp = {
  width:'100%', padding:'6px 8px', border:'1px solid #e2e8f0',
  borderRadius:'4px', fontSize:'13px', boxSizing:'border-box',
};

function Field({ label, children }) {
  return html`
    <div style="margin-bottom:12px">
      <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;margin-bottom:4px">
        ${label}
      </label>
      ${children}
    </div>
  `;
}

function PropsPanel({ node, onUpdate, onDelete }) {
  if (!node) return html`
    <div style="padding:20px;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6">
      Select a node<br/>to edit properties.
    </div>
  `;

  const d   = node.data;
  const set = (k, v) => onUpdate(node.id, { [k]: v });

  return html`
    <div style="padding:16px">
      <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;margin-bottom:14px">
        ${node.type.replace('gw', '')}
      </div>

      ${node.type === 'gwHeading' && html`
        <${Field} label="Text">
          <input style=${inp} value=${d.text} onInput=${e => set('text', e.target.value)} />
        </${Field}>
        <${Field} label="Level">
          <select style=${inp} value=${d.level} onChange=${e => set('level', e.target.value)}>
            <option value="h1">H1</option><option value="h2">H2</option>
            <option value="h3">H3</option><option value="h4">H4</option>
          </select>
        </${Field}>
      `}

      ${node.type === 'gwText' && html`
        <${Field} label="Content">
          <textarea style=${{ ...inp, minHeight:'80px', resize:'vertical' }}
            onInput=${e => set('text', e.target.value)}>${d.text}</textarea>
        </${Field}>
      `}

      ${node.type === 'gwButton' && html`
        <${Field} label="Label">
          <input style=${inp} value=${d.label} onInput=${e => set('label', e.target.value)} />
        </${Field}>
      `}

      ${node.type === 'gwImage' && html`
        <${Field} label="Alt">
          <input style=${inp} value=${d.alt} onInput=${e => set('alt', e.target.value)} />
        </${Field}>
        <${Field} label="Width">
          <input type="number" style=${inp} value=${d.w} onInput=${e => set('w', +e.target.value || 40)} />
        </${Field}>
        <${Field} label="Height">
          <input type="number" style=${inp} value=${d.h} onInput=${e => set('h', +e.target.value || 40)} />
        </${Field}>
      `}

      ${node.type === 'gwBox' && html`
        <${Field} label="Color">
          <input type="color" style=${{ ...inp, height:'36px', padding:'2px 4px' }}
            value=${d.bg} onChange=${e => set('bg', e.target.value)} />
        </${Field}>
        <${Field} label="Width">
          <input type="number" style=${inp} value=${d.w} onInput=${e => set('w', +e.target.value || 40)} />
        </${Field}>
        <${Field} label="Height">
          <input type="number" style=${inp} value=${d.h} onInput=${e => set('h', +e.target.value || 40)} />
        </${Field}>
        <${Field} label="Radius">
          <input type="number" style=${inp} value=${d.r} onInput=${e => set('r', +e.target.value)} />
        </${Field}>
      `}

      ${node.type === 'gwDivider' && html`
        <${Field} label="Width">
          <input type="number" style=${inp} value=${d.width} onInput=${e => set('width', +e.target.value || 40)} />
        </${Field}>
      `}

      <div style="border-top:1px solid #f1f5f9;padding-top:12px;margin-top:4px">
        <button onClick=${onDelete}
          style="width:100%;padding:7px;background:#fef2f2;color:#ef4444;border:1px solid #fecaca;border-radius:5px;cursor:pointer;font-size:13px">
          Delete node
        </button>
      </div>
    </div>
  `;
}

// ── Inner canvas (needs access to rfInstance via onInit) ──────────────────────

function FlowCanvas({ nodes, edges, onNodesChange, onEdgesChange, onDrop, onNodeClick, onPaneClick, onInit }) {
  return html`
    <${ReactFlow}
      nodes=${nodes}
      edges=${edges}
      onNodesChange=${onNodesChange}
      onEdgesChange=${onEdgesChange}
      onDrop=${onDrop}
      onDragOver=${e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onNodeClick=${onNodeClick}
      onPaneClick=${onPaneClick}
      onInit=${onInit}
      nodeTypes=${nodeTypes}
      fitView
      deleteKeyCode=${null}
      style=${{ width:'100%', height:'100%' }}
    >
      <${Background} variant=${BackgroundVariant.Dots} gap=${24} size=${1} color="#cbd5e1" />
      <${Controls} />
      <${MiniMap} nodeStrokeWidth=${3} zoomable pannable />
    </${ReactFlow}>
  `;
}

// ── Root app ──────────────────────────────────────────────────────────────────

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, , onEdgesChange]         = useEdgesState([]);
  const [selectedId, setSelectedId]      = useState(null);
  const rfInstance                       = useRef(null);

  const selectedNode = nodes.find(n => n.id === selectedId) ?? null;

  const onDrop = useCallback(e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('gw/type');
    if (!type || !rfInstance.current) return;

    const def      = PALETTE.find(p => p.type === type);
    const position = rfInstance.current.screenToFlowPosition({ x: e.clientX, y: e.clientY });

    const node = {
      id:          uid(),
      type,
      position,
      data:        { ...def.defaults },
      connectable: false,
    };
    setNodes(nds => nds.concat(node));
    setSelectedId(node.id);
  }, [setNodes]);

  const onNodeClick  = useCallback((_, node) => setSelectedId(node.id), []);
  const onPaneClick  = useCallback(() => setSelectedId(null), []);
  const onInit       = useCallback(inst => { rfInstance.current = inst; }, []);

  const updateNode   = useCallback((id, patch) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
  }, [setNodes]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setNodes(nds => nds.filter(n => n.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, setNodes]);

  const clearAll = () => {
    if (!nodes.length || !confirm('Remove all nodes?')) return;
    setNodes([]);
    setSelectedId(null);
  };

  return html`
    <${ReactFlowProvider}>
      <div style=${{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden',
        fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color:'#0f172a' }}>

        <!-- Toolbar -->
        <div style=${{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 16px', height:'44px', background:'#1e293b', color:'#f1f5f9', flexShrink:0, gap:'12px' }}>
          <span style="font-size:14px;font-weight:600;letter-spacing:.3px">Gateway Builder</span>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:12px;color:#64748b">${nodes.length} node${nodes.length !== 1 ? 's' : ''}</span>
            ${selectedNode && html`
              <button onClick=${deleteSelected}
                style="padding:4px 12px;background:#ef4444;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">
                Delete
              </button>
            `}
            <button onClick=${clearAll}
              style="padding:4px 12px;background:transparent;color:#94a3b8;border:1px solid #334155;border-radius:4px;cursor:pointer;font-size:12px">
              Clear all
            </button>
          </div>
        </div>

        <!-- Three-column layout -->
        <div style=${{ display:'flex', flex:1, overflow:'hidden' }}>

          <!-- Palette -->
          <div style=${{ width:'192px', flexShrink:0, background:'#fff', borderRight:'1px solid #e2e8f0',
            padding:'14px 12px', overflowY:'auto' }}>
            <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">
              Elements
            </div>
            ${PALETTE.map(p => html`
              <${PaletteItem} key=${p.type} type=${p.type} label=${p.label} icon=${p.icon} />
            `)}
            <div style="margin-top:14px;padding-top:12px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;line-height:1.5">
              Drag an element onto the canvas. Select a node to reposition or edit it.
            </div>
          </div>

          <!-- React Flow canvas -->
          <div style=${{ flex:1, overflow:'hidden' }}>
            <${FlowCanvas}
              nodes=${nodes}
              edges=${edges}
              onNodesChange=${onNodesChange}
              onEdgesChange=${onEdgesChange}
              onDrop=${onDrop}
              onNodeClick=${onNodeClick}
              onPaneClick=${onPaneClick}
              onInit=${onInit}
            />
          </div>

          <!-- Properties -->
          <div style=${{ width:'220px', flexShrink:0, background:'#fff', borderLeft:'1px solid #e2e8f0', overflowY:'auto' }}>
            <div style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px">
              Properties
            </div>
            <${PropsPanel} node=${selectedNode} onUpdate=${updateNode} onDelete=${deleteSelected} />
          </div>

        </div>
      </div>
    </${ReactFlowProvider}>
  `;
}

render(html`<${App} />`, document.getElementById('gw-test1'));
