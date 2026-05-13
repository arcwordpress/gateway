const FilterIcon = ({ onClick, isOpen }) => (
  <button
    onClick={onClick}
    className="filter-icon-button"
    aria-label="Toggle filters"
    aria-expanded={isOpen}
  >
    <svg width="20" height="20" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.3333 1H1L14.3333 16.7667V27.6667L21 31V16.7667L34.3333 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

export default FilterIcon;