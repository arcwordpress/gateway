import { h } from 'preact';

const Footer = ({ totalRows, perPage, onPerPageChange }) => {
  const pageSizes = [10, 20, 50, 100];

  return (
    <div class="gbd-footer">
      <div class="gbd-footer__pagination">
        <button class="gbd-footer__btn" disabled title="First page">&lt;&lt;</button>
        <button class="gbd-footer__btn" disabled title="Previous page">&lt;</button>
        <button class="gbd-footer__btn" disabled title="Next page">&gt;</button>
        <button class="gbd-footer__btn" disabled title="Last page">&gt;&gt;</button>
      </div>

      <span class="gbd-footer__count">{totalRows} {totalRows === 1 ? 'row' : 'rows'}</span>

      <span class="gbd-footer__page">Page 1 of 1</span>

      <div class="gbd-footer__per-page">
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
