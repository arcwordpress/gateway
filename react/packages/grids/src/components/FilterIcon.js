import { ListFilter } from 'lucide-react';

const FilterIcon = ({ onClick, isOpen }) => (
  <button
    onClick={onClick}
    className="filter-icon-button"
    aria-label="Toggle filters"
    aria-expanded={isOpen}
  >
    <ListFilter size={24} className="view-switcher__icon" />
  </button>
);

export default FilterIcon;
