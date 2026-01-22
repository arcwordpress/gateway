import { Link } from 'react-router-dom';
import { useExtensionList } from '../context/ExtensionListContext';

const ArrowIcon = () => {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500 group-hover:text-slate-200 transition-colors">
      <path d="M0.5 7.5H14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 0.5L14.5 7.5L7.5 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const Dashboard = () => {
  const { extensions, loading, error } = useExtensionList();

  if (loading) {
    return <div className="!text-slate-500">Loading extensions...</div>;
  }

  if (error) {
    return <div className="!text-red-500">Error loading extensions: {error}</div>;
  }

  if (extensions.length === 0) {
    return <div className="!text-slate-500">No extensions available</div>;
  }

  return (
    <div className="space-y-3">
      {extensions.map((extension) => (
        <Link
          key={extension.key}
          to={`/extension/${extension.key}`}
          className="group grid grid-cols-[1fr_auto] items-center gap-4 p-4 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <h2 className="!text-slate-200 text-lg font-medium">
            {extension.title || extension.key}
          </h2>
          <ArrowIcon />
        </Link>
      ))}
    </div>
  );
};

export default Dashboard;
