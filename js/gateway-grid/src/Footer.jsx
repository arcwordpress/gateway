import { h } from 'preact';

const Footer = ({ totalRows, perPage, onPerPageChange }) => {
  const pageSizes = [10, 20, 50, 100];

  return (
    <div class="gbd-footer" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.5rem 0">

      <div class="gbd-footer__left">
        <div class="gbd-footer__pagination" style="display:flex;gap:.25rem">
          <button class="gbd-footer__btn" disabled title="First page">&lt;&lt;</button>
          <button class="gbd-footer__btn" disabled title="Previous page">&lt;</button>
          <button class="gbd-footer__btn" disabled title="Next page">&gt;</button>
          <button class="gbd-footer__btn" disabled title="Last page">&gt;&gt;</button>
        </div>
      </div>

      <div class="gbd-footer__center" style="flex:1;text-align:center">
        <span class="gbd-footer__page">Page 1 of 1</span>
      </div>

      <div class="gbd-footer__right" style="display:flex;align-items:center;gap:.75rem">
        <span class="gbd-footer__count">{totalRows} {totalRows === 1 ? 'row' : 'rows'}</span>
        <select
          class="gbd-footer__select"
          value={perPage}
          onChange={(e) => onPerPageChange && onPerPageChange(Number(e.target.value))}
        >
          {pageSizes.map((n) => (
            <option key={n} value={n}>Show {n}</option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default Footer;
