import { h, Fragment } from 'preact';
import { SlidersHorizontal, Search, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-preact';
import ViewSwitcher from './ViewSwitcher';

const Toolbar = ({
  filtersEnabled, facetToggleEnabled, facetsVisible, onToggleFacets,
  view, onViewChange, enabledViews,
  search, onSearchChange,
  sortFields, sortField, sortDir, onSortFieldChange, onSortDirToggle,
}) => {
  const showSort = view !== 'table' && sortFields && sortFields.length > 0;

  return (
    <div class="gty-toolbar">
      <div class="gty-toolbar__controls">
        {filtersEnabled && facetToggleEnabled && (
          <button
            class={`gty-toolbar__btn${facetsVisible ? ' gty-toolbar__btn--on' : ''}`}
            onClick={onToggleFacets}
            title="Toggle filters"
            type="button"
          >
            <SlidersHorizontal size={16} strokeWidth={2} />
          </button>
        )}
        <ViewSwitcher view={view} onViewChange={onViewChange} enabledViews={enabledViews} />
        {showSort && (
          <>
            <select
              class="gty-toolbar__sort-select"
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value)}
            >
              <option value="">Sort by…</option>
              {sortFields.map(f => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
            {sortField && (
              <button
                class="gty-toolbar__btn"
                onClick={onSortDirToggle}
                title={sortDir === 'asc' ? 'Ascending — click for descending' : 'Descending — click for ascending'}
                type="button"
              >
                {sortDir === 'asc'
                  ? <ArrowDownNarrowWide size={16} strokeWidth={2} />
                  : <ArrowUpNarrowWide size={16} strokeWidth={2} />
                }
              </button>
            )}
          </>
        )}
      </div>
      <div class="gty-toolbar__search-wrap">
        <input
          class="gty-toolbar__search"
          type="search"
          placeholder="Search…"
          value={search}
          onInput={(e) => onSearchChange(e.target.value)}
        />
        <span class="gty-toolbar__search-icon"><Search size={14} strokeWidth={2} /></span>
      </div>
    </div>
  );
};

export default Toolbar;
