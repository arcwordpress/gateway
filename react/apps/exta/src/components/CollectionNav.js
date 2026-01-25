import { Link, useLocation } from 'react-router-dom';

const CollectionNav = ({ extensionKey, collectionKey }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      label: 'Config',
      path: `/extension/${extensionKey}/collection/${collectionKey}`
    },
    {
      label: 'Relationships',
      path: `/extension/${extensionKey}/collection/${collectionKey}/relationships`
    },
    {
      label: 'Fields',
      path: `/extension/${extensionKey}/collection/${collectionKey}/fields`
    },
    {
      label: 'Grid',
      path: `/extension/${extensionKey}/collection/${collectionKey}/grids`
    },
  ];

  return (
    <nav className="flex gap-2 mb-6 border-b border-slate-600">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-4 py-2 border-b-2 transition-colors ${
            isActive(item.path)
              ? 'border-slate-400 !text-slate-200'
              : 'border-transparent !text-slate-400 hover:!text-slate-200 hover:border-slate-500'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default CollectionNav;
