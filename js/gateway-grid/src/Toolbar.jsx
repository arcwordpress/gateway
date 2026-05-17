import { h } from 'preact';
import { SlidersHorizontal, Search } from 'lucide-preact';
import ViewSwitcher from './ViewSwitcher';

const Toolbar = ({ filtersEnabled, facetToggleEnabled, facetsVisible, onToggleFacets, view, onViewChange, enabledViews, search, onSearchChange }) => (
  <div class="gty-toolbar">
    <div class="gty-toolbar__controls">
      {filtersEnabled && facetToggleEnabled && (
        <button
          class={`gty-toolbar__btn${facetsVisible ? ' gty-toolbar__btn--on' : ''}`}
          onClick={onToggleFacets}
          title="Toggle filters"
          type="button"
        >
          <SlidersHorizontal size={14} strokeWidth={2} />
        </button>
      )}
      <div class="gty-toolbar__sep" />
      <ViewSwitcher view={view} onViewChange={onViewChange} enabledViews={enabledViews} />
    </div>
    <div class="gty-toolbar__search-wrap">
      <input
        class="gty-toolbar__search"
        type="search"
        placeholder="Search…"
        value={search}
        onInput={(e) => onSearchChange(e.target.value)}
      />
      <span class="gty-toolbar__search-icon"><Search size={12} strokeWidth={2} /></span>
    </div>
  </div>
);

export default Toolbar;
