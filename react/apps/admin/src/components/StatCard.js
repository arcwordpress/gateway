
function StatCard({ title, value }) {
  return (
    <div className="gty-stat-card">
      <div className="gty-stat-card__value">{value}</div>
      <div className="gty-stat-card__title">{title}</div>
    </div>
  );
}

export default StatCard;
