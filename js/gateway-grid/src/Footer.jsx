import { h } from 'preact';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-preact';

const Footer = ({ totalCount, page, totalPages, onPageChange, perPage, onPerPageChange }) => {
  const base      = [10, 20, 50, 100];
  const showAll   = perPage === 0;
  const numeric   = [...new Set([...base, ...(showAll ? [] : [perPage])])].sort((a, b) => a - b);

  const atFirst = page <= 1;
  const atLast  = page >= totalPages;

  return (
    <div class="gbd-footer">

      <div class="gbd-footer__left">
        <div class="gbd-footer__pagination">
          <button class="gbd-footer__btn" disabled={atFirst} onClick={() => onPageChange(1)} title="First page">
            <ChevronsLeft size={14} strokeWidth={2} />
          </button>
          <button class="gbd-footer__btn" disabled={atFirst} onClick={() => onPageChange(page - 1)} title="Previous page">
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
          <button class="gbd-footer__btn" disabled={atLast} onClick={() => onPageChange(page + 1)} title="Next page">
            <ChevronRight size={14} strokeWidth={2} />
          </button>
          <button class="gbd-footer__btn" disabled={atLast} onClick={() => onPageChange(totalPages)} title="Last page">
            <ChevronsRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div class="gbd-footer__center">
        <span class="gbd-footer__page">Page {page} of {totalPages}</span>
      </div>

      <div class="gbd-footer__right">
        <span class="gbd-footer__count">{totalCount} {totalCount === 1 ? 'record' : 'records'}</span>
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
