import { h } from 'preact';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-preact';

const Footer = ({ totalRows, perPage, onPerPageChange }) => {
  const base      = [10, 20, 50, 100];
  // 0 = show all; keep it out of the numeric sort, append separately
  const showAll   = perPage === 0;
  const numeric   = [...new Set([...base, ...(showAll ? [] : [perPage])])].sort((a, b) => a - b);

  return (
    <div class="gbd-footer">

      <div class="gbd-footer__left">
        <div class="gbd-footer__pagination">
          <button class="gbd-footer__btn" disabled title="First page">
            <ChevronsLeft size={14} />
          </button>
          <button class="gbd-footer__btn" disabled title="Previous page">
            <ChevronLeft size={14} />
          </button>
          <button class="gbd-footer__btn" disabled title="Next page">
            <ChevronRight size={14} />
          </button>
          <button class="gbd-footer__btn" disabled title="Last page">
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>

      <div class="gbd-footer__center">
        <span class="gbd-footer__page">Page 1 of 1</span>
      </div>

      <div class="gbd-footer__right">
        <span class="gbd-footer__count">{totalRows} {totalRows === 1 ? 'row' : 'rows'}</span>
        <select
          class="gbd-footer__select"
          value={perPage}
          onChange={(e) => onPerPageChange && onPerPageChange(Number(e.target.value))}
        >
          {numeric.map((n) => (
            <option key={n} value={n}>Show {n}</option>
          ))}
          <option value={0}>Show all</option>
        </select>
      </div>

    </div>
  );
};

export default Footer;
