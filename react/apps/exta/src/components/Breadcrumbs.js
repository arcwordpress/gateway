import { Link, useLocation, useParams } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';

const Breadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const { activeExtension } = useActiveExtension();

  const breadcrumbs = [
    { label: 'Dashboard', path: '/' }
  ];

  // Add extension breadcrumb if on extension route
  if (location.pathname.startsWith('/extension/') && activeExtension) {
    breadcrumbs.push({
      label: activeExtension.title || activeExtension.key,
      path: `/extension/${activeExtension.key}`
    });

    // Add collection breadcrumb if on collection route
    if (params.collectionKey) {
      breadcrumbs.push({
        label: params.collectionKey,
        path: `/extension/${activeExtension.key}/${params.collectionKey}`
      });
    }
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
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
