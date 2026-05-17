import { h } from 'preact';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-preact';

const Footer = ({ totalCount, page, totalPages, onPageChange, perPage, onPerPageChange }) => {
  const base      = [10, 20, 50, 100];
  const showAll   = perPage === 0;
  const numeric   = [...new Set([...base, ...(showAll ? [] : [perPage])])].sort((a, b) => a - b);

  const atFirst = page <= 1;
  const atLast  = page >= totalPages;

  return (
    <div class="gty-footer">

      <div class="gty-footer__left">
        <div class="gty-footer__pagination">
          <button class="gty-footer__btn" disabled={atFirst} onClick={() => onPageChange(1)} title="First page">
            <ChevronsLeft size={14} strokeWidth={2} />
          </button>
          <button class="gty-footer__btn" disabled={atFirst} onClick={() => onPageChange(page - 1)} title="Previous page">
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
          <button class="gty-footer__btn" disabled={atLast} onClick={() => onPageChange(page + 1)} title="Next page">
            <ChevronRight size={14} strokeWidth={2} />
          </button>
          <button class="gty-footer__btn" disabled={atLast} onClick={() => onPageChange(totalPages)} title="Last page">
            <ChevronsRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div class="gty-footer__center">
        <span class="gty-footer__page">Page {page} of {totalPages}</span>
      </div>

      <div class="gty-footer__right">
        <span class="gty-footer__count">{totalCount} {totalCount === 1 ? 'record' : 'records'}</span>
        <select
          class="gty-footer__select"
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
