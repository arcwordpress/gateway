import { h } from 'preact';
import { Filter } from 'lucide-preact';
import ViewSwitcher from './ViewSwitcher';

const Toolbar = ({ filtersEnabled, facetsVisible, onToggleFacets, view, onViewChange, enabledViews, search, onSearchChange }) => (
  <div class="gbd-toolbar">
    <div class="gbd-toolbar__controls">
      {filtersEnabled && (
        <button
          class={`gbd-toolbar__btn${facetsVisible ? ' gbd-toolbar__btn--on' : ''}`}
          onClick={onToggleFacets}
          title="Toggle filters"
          type="button"
        >
          <Filter size={14} strokeWidth={2} />
        </button>
      )}
      <div class="gbd-toolbar__sep" />
      <ViewSwitcher view={view} onViewChange={onViewChange} enabledViews={enabledViews} />
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
