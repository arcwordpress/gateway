import { h } from 'preact';

const BAR_WIDTHS = [
  ['45%', '30%', '55%', '25%', '40%'],
  ['60%', '20%', '35%', '50%', '30%'],
  ['38%', '45%', '28%', '60%', '20%'],
  ['52%', '35%', '42%', '22%', '48%'],
  ['40%', '55%', '32%', '45%', '35%'],
  ['65%', '25%', '50%', '30%', '42%'],
];

const Bar = ({ width, height = '10px' }) => (
  <div class="gty-skeleton__bar" style={{ width, height }} />
);

const SkeletonLoader = () => (
  <div class="gty-skeleton">
    {/* toolbar */}
    <div class="gty-skeleton__toolbar">
      <div class="gty-skeleton__toolbar-inner">
        <Bar width="20px" height="16px" />
        <Bar width="20px" height="16px" />
        <Bar width="80px" height="24px" />
      </div>
    </div>

    {/* table header */}
    <div class="gty-skeleton__thead">
      {['28px', '22%', '18%', '20%', '16%'].map((w, i) => (
        <div key={i} class="gty-skeleton__th">
          <Bar width={w} height="8px" />
        </div>
      ))}
    </div>

    {/* rows */}
    {BAR_WIDTHS.map((cols, r) => (
      <div key={r} class={`gty-skeleton__row gty-skeleton__row--${r % 2 === 0 ? 'even' : 'odd'}`}>
        <div class="gty-skeleton__td"><Bar width="28px" height="9px" /></div>
        {cols.map((w, c) => (
          <div key={c} class="gty-skeleton__td"><Bar width={w} height="9px" /></div>
        ))}
      </div>
    ))}

    {/* footer */}
    <div class="gty-skeleton__footer">
      <Bar width="80px" height="8px" />
      <div class="gty-skeleton__footer-right">
        <Bar width="24px" height="24px" />
        <Bar width="24px" height="24px" />
        <Bar width="24px" height="24px" />
        <Bar width="24px" height="24px" />
        <Bar width="60px" height="24px" />
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
