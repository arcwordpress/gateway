import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path + index} className="flex items-center gap-2">
          {index > 0 && <span className="!text-slate-500">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="!text-slate-200">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="!text-slate-500 hover:opacity-70 transition-opacity"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
