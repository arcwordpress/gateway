import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { Rows2, List, Grid3x2 } from 'lucide-preact';

const VIEW_CONFIGS = {
  table: { label: 'Table', Icon: Rows2    },
  list:  { label: 'List',  Icon: List     },
  cards: { label: 'Cards', Icon: Grid3x2  },
};

const ViewSwitcher = ({ view, onViewChange, enabledViews = ['table', 'list', 'cards'] }) => {
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);
  const otherViews        = enabledViews.filter(v => v !== view);

  // Hide when only one view is available
  if (enabledViews.length < 2) return null;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = VIEW_CONFIGS[view] ?? VIEW_CONFIGS.table;

  return (
    <div class="gbd-vsw" ref={ref}>
      <button
        class={`gbd-toolbar__btn${open ? ' gbd-toolbar__btn--on' : ''}`}
        onClick={() => setOpen(v => !v)}
        title={`View: ${current.label}`}
        type="button"
      >
        <current.Icon size={14} strokeWidth={2} />
      </button>

      {open && (
        <ul class="gbd-vsw__dropdown">
          {otherViews.map((key) => {
            const cfg = VIEW_CONFIGS[key];
            if (!cfg) return null;
            return (
              <li key={key}>
                <button
                  class="gbd-vsw__option"
                  type="button"
                  onClick={() => { setOpen(false); onViewChange(key); }}
                >
                  <cfg.Icon size={14} strokeWidth={2} />
                  <span>{cfg.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ViewSwitcher;
