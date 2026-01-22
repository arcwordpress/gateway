import { Link, useLocation } from 'react-router-dom';
import { useExtensionList } from '../context/ExtensionListContext';

const LeftSidebar = () => {
  const { extensions, loading } = useExtensionList();
  const location = useLocation();

  if (loading) {
    return (
      <aside className="w-64 border-r border-gray-200 p-4">
        <div className="text-gray-500">Loading...</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">
        Extensions ({extensions.length})
      </h2>

      {extensions.length === 0 ? (
        <div className="text-gray-500">—</div>
      ) : (
        <nav className="space-y-1">
          {extensions.map((extension) => {
            const isActive = location.pathname.startsWith(`/extension/${extension.key}`);
            return (
              <Link
                key={extension.key}
                to={`/extension/${extension.key}`}
                className={`block px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {extension.title || extension.key}
              </Link>
            );
          })}
        </nav>
      )}
    </aside>
  );
};

export default LeftSidebar;
