import { h, render } from 'https://esm.sh/preact';
import { useState, useRef, useCallback, useEffect } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

// ── Palette definitions ──────────────────────────────────────────────────────

const PALETTE = [
  { type: 'heading', label: 'Heading', icon: '𝐇', defaults: { text: 'Heading', level: 'h2' } },
  { type: 'text',    label: 'Text',    icon: '¶', defaults: { text: 'Paragraph text here.' } },
  { type: 'button',  label: 'Button',  icon: '⬡', defaults: { label: 'Click me' } },
  { type: 'image',   label: 'Image',   icon: '🖼', defaults: { alt: 'Image', w: 200, h: 120 } },
  { type: 'box',     label: 'Box',     icon: '□', defaults: { bg: '#e0e7ff', w: 200, h: 100, r: 8 } },
  { type: 'divider', label: 'Divider', icon: '─', defaults: { width: 240 } },
];

let _id = 1;
const uid = () => 'e' + _id++;

// ── Element renderers ────────────────────────────────────────────────────────

function Preview({ el }) {
  const p = el.props;
  if (el.type === 'heading') {
    const T = p.level || 'h2';
    return html`<${T} style="margin:0;line-height:1.2">${p.text}</${T}>`;
  }
  if (el.type === 'text')
    return html`<p style="margin:0;max-width:320px;line-height:1.5">${p.text}</p>`;
  if (el.type === 'button')
    return html`<button style="padding:8px 20px;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">${p.label}</button>`;
  if (el.type === 'image')
    return html`<div style=${{ width:p.w+'px', height:p.h+'px', background:'#e2e8f0', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'4px', color:'#94a3b8', fontSize:'12px' }}>
      <span style="font-size:24px">🖼</span><span>${p.alt}</span>
    </div>`;
  if (el.type === 'box')
    return html`<div style=${{ width:p.w+'px', height:p.h+'px', background:p.bg, borderRadius:p.r+'px', border:'1px solid rgba(0,0,0,.08)' }} />`;
  if (el.type === 'divider')
    return html`<hr style=${{ margin:0, width:p.width+'px', border:'none', borderTop:'2px solid #cbd5e1' }} />`;
  return null;
}

// ── Placed canvas element (free-drag) ────────────────────────────────────────

function CanvasEl({ el, selected, onSelect, onMove }) {
  const drag = useRef(false);
  const o    = useRef({});

  function onMouseDown(e) {
    e.stopPropagation();
    onSelect(el.id);
    drag.current = true;
    o.current = { mx: e.clientX, my: e.clientY, ox: el.x, oy: el.y };

    const mv = e => {
      if (!drag.current) return;
      onMove(el.id,
        o.current.ox + e.clientX - o.current.mx,
        o.current.oy + e.clientY - o.current.my,
      );
    };
    const up = () => {
      drag.current = false;
      removeEventListener('mousemove', mv);
      removeEventListener('mouseup', up);
    };
    addEventListener('mousemove', mv);
    addEventListener('mouseup', up);
  }

  return html`
    <div onMouseDown=${onMouseDown} style=${{
      position: 'absolute', left: el.x+'px', top: el.y+'px',
      cursor: 'move', userSelect: 'none', padding: '4px',
      outline: selected ? '2px solid #4f46e5' : '2px solid transparent',
      outlineOffset: '3px', borderRadius: '4px',
    }}>
      <${Preview} el=${el} />
    </div>
  `;
}

// ── Canvas drop zone ─────────────────────────────────────────────────────────

function Canvas({ elements, selectedId, onDrop, onSelect, onMove }) {
  const ref = useRef(null);

  return html`
    <div ref=${ref}
      onDragOver=${e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop=${e => {
        e.preventDefault();
        const type = e.dataTransfer.getData('gw/type');
        if (!type) return;
        const r = ref.current.getBoundingClientRect();
        onDrop(type, e.clientX - r.left - 40, e.clientY - r.top - 20);
      }}
      onMouseDown=${e => { if (e.target === ref.current) onSelect(null); }}
      style=${{
        position: 'relative', flex: 1, overflow: 'auto',
        background: '#fff',
        backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      ${elements.map(el => html`
        <${CanvasEl} key=${el.id} el=${el}
          selected=${el.id === selectedId}
          onSelect=${onSelect} onMove=${onMove} />
      `)}
      ${elements.length === 0 && html`
        <div style=${{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', color:'#94a3b8', pointerEvents:'none', gap:'10px' }}>
          <span style="font-size:48px">🎨</span>
          <span style="font-size:14px">Drag elements here to build</span>
        </div>
      `}
    </div>
  `;
}

// ── Palette sidebar ──────────────────────────────────────────────────────────

function PaletteItem({ type, label, icon }) {
  return html`
    <div draggable="true"
      onDragStart=${e => { e.dataTransfer.setData('gw/type', type); e.dataTransfer.effectAllowed = 'copy'; }}
      style=${{
        display:'flex', alignItems:'center', gap:'8px',
        padding:'7px 10px', marginBottom:'6px',
        border:'1px solid #e2e8f0', borderRadius:'6px',
        background:'#f8fafc', cursor:'grab', userSelect:'none', fontSize:'13px',
      }}>
      <span style="width:20px;text-align:center;font-size:15px">${icon}</span>
      <span>${label}</span>
    </div>
  `;
}

// ── Properties panel ─────────────────────────────────────────────────────────

const inp = { width:'100%', padding:'6px 8px', border:'1px solid #e2e8f0', borderRadius:'4px', fontSize:'13px', boxSizing:'border-box' };

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

function PropsPanel({ el, onChange, onDelete }) {
  if (!el) return html`
    <div style="padding:20px;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6">
      Select an element<br/>to edit properties.
    </div>
  `;

  const set = (k, v) => onChange(el.id, { ...el.props, [k]: v });

  return html`
    <div style="padding:16px">
      <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;margin-bottom:14px">
        ${el.type}
      </div>

      ${el.type === 'heading' && html`
        <${Field} label="Text">
          <input style=${inp} value=${el.props.text} onInput=${e => set('text', e.target.value)} />
        </${Field}>
        <${Field} label="Level">
          <select style=${inp} value=${el.props.level} onChange=${e => set('level', e.target.value)}>
            <option value="h1">H1</option><option value="h2">H2</option>
            <option value="h3">H3</option><option value="h4">H4</option>
          </select>
        </${Field}>
      `}

      ${el.type === 'text' && html`
        <${Field} label="Content">
          <textarea style=${{ ...inp, minHeight:'80px', resize:'vertical' }}
            onInput=${e => set('text', e.target.value)}>${el.props.text}</textarea>
        </${Field}>
      `}

      ${el.type === 'button' && html`
        <${Field} label="Label">
          <input style=${inp} value=${el.props.label} onInput=${e => set('label', e.target.value)} />
        </${Field}>
      `}

      ${el.type === 'image' && html`
        <${Field} label="Alt">
          <input style=${inp} value=${el.props.alt} onInput=${e => set('alt', e.target.value)} />
        </${Field}>
        <${Field} label="Width">
          <input type="number" style=${inp} value=${el.props.w} onInput=${e => set('w', +e.target.value || 40)} />
        </${Field}>
        <${Field} label="Height">
          <input type="number" style=${inp} value=${el.props.h} onInput=${e => set('h', +e.target.value || 40)} />
        </${Field}>
      `}

      ${el.type === 'box' && html`
        <${Field} label="Color">
          <input type="color" style=${{ ...inp, height:'36px', padding:'2px 4px' }}
            value=${el.props.bg} onChange=${e => set('bg', e.target.value)} />
        </${Field}>
        <${Field} label="Width">
          <input type="number" style=${inp} value=${el.props.w} onInput=${e => set('w', +e.target.value || 40)} />
        </${Field}>
        <${Field} label="Height">
          <input type="number" style=${inp} value=${el.props.h} onInput=${e => set('h', +e.target.value || 40)} />
        </${Field}>
        <${Field} label="Radius">
          <input type="number" style=${inp} value=${el.props.r} onInput=${e => set('r', +e.target.value)} />
        </${Field}>
      `}

      ${el.type === 'divider' && html`
        <${Field} label="Width">
          <input type="number" style=${inp} value=${el.props.width} onInput=${e => set('width', +e.target.value || 40)} />
        </${Field}>
      `}

      <div style="border-top:1px solid #f1f5f9;padding-top:12px;margin-top:4px">
        <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">
          Position: ${Math.round(el.x)}, ${Math.round(el.y)}
        </div>
        <button onClick=${onDelete}
          style="width:100%;padding:7px;background:#fef2f2;color:#ef4444;border:1px solid #fecaca;border-radius:5px;cursor:pointer;font-size:13px">
          Delete element
        </button>
      </div>
    </div>
  `;
}

// ── Root app ─────────────────────────────────────────────────────────────────

function App() {
  const [elements,   setElements]   = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const selected = elements.find(e => e.id === selectedId) ?? null;

  const addElement = useCallback((type, x, y) => {
    const def = PALETTE.find(p => p.type === type);
    if (!def) return;
    const el = { id: uid(), type, x: Math.max(0, x), y: Math.max(0, y), props: { ...def.defaults } };
    setElements(p => [...p, el]);
    setSelectedId(el.id);
  }, []);

  const moveElement = useCallback((id, x, y) =>
    setElements(p => p.map(e => e.id === id ? { ...e, x: Math.max(0, x), y: Math.max(0, y) } : e)), []);

  const updateProps = useCallback((id, props) =>
    setElements(p => p.map(e => e.id === id ? { ...e, props } : e)), []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements(p => p.filter(e => e.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const clearAll = () => {
    if (!elements.length || !confirm('Remove all elements?')) return;
    setElements([]);
    setSelectedId(null);
  };

  useEffect(() => {
    const fn = e => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) deleteSelected();
      if (e.key === 'Escape') setSelectedId(null);
    };
    addEventListener('keydown', fn);
    return () => removeEventListener('keydown', fn);
  }, [deleteSelected, selectedId]);

  return html`
    <div style=${{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', color:'#0f172a',
      fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      <!-- Toolbar -->
      <div style=${{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 16px', height:'44px', background:'#1e293b', color:'#f1f5f9', flexShrink:0, gap:'12px' }}>
        <span style="font-size:14px;font-weight:600;letter-spacing:.3px">Gateway Builder</span>
        <div style="display:flex;gap:8px;align-items:center">
          <span style="font-size:12px;color:#64748b">${elements.length} element${elements.length !== 1 ? 's' : ''}</span>
          ${selected && html`
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
        <div style=${{ width:'192px', flexShrink:0, background:'#fff', borderRight:'1px solid #e2e8f0', padding:'14px 12px', overflowY:'auto' }}>
          <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">
            Elements
          </div>
          ${PALETTE.map(p => html`
            <${PaletteItem} key=${p.type} type=${p.type} label=${p.label} icon=${p.icon} />
          `)}
        </div>

        <!-- Canvas -->
        <${Canvas} elements=${elements} selectedId=${selectedId}
          onDrop=${addElement} onSelect=${setSelectedId} onMove=${moveElement} />

        <!-- Properties -->
        <div style=${{ width:'220px', flexShrink:0, background:'#fff', borderLeft:'1px solid #e2e8f0', overflowY:'auto' }}>
          <div style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px">
            Properties
          </div>
          <${PropsPanel} el=${selected} onChange=${updateProps} onDelete=${deleteSelected} />
        </div>

      </div>
    </div>
  `;
}

render(html`<${App} />`, document.getElementById('gw-test1'));
