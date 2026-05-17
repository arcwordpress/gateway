import { h } from 'preact';
import { Filter, Table2, LayoutList } from 'lucide-preact';

const VIEWS = [
  { key: 'table', Icon: Table2,     label: 'Table view' },
  { key: 'list',  Icon: LayoutList, label: 'List view'  },
];

const Toolbar = ({ filtersEnabled, facetsVisible, onToggleFacets, view, onViewChange, search, onSearchChange }) => (
  <div class="gbd-toolbar">
    <div class="gbd-toolbar__controls">
      {filtersEnabled && (
        <button
          class={`gbd-toolbar__btn${facetsVisible ? ' gbd-toolbar__btn--on' : ''}`}
          onClick={onToggleFacets}
          title="Toggle filters"
        >
          <Filter size={14} strokeWidth={2} />
        </button>
      )}
      <div class="gbd-toolbar__sep" />
      {VIEWS.map(({ key, Icon, label }) => (
        <button
          key={key}
          class={`gbd-toolbar__btn${view === key ? ' gbd-toolbar__btn--on' : ''}`}
          onClick={() => onViewChange(key)}
          title={label}
        >
          <Icon size={14} strokeWidth={2} />
        </button>
      ))}
    </div>
    <input
      class="gbd-toolbar__search"
      type="search"
      placeholder="Search…"
      value={search}
      onInput={(e) => onSearchChange(e.target.value)}
    />
  </div>
);

export default Toolbar;
