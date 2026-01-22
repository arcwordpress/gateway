import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="px-8 py-3 flex items-center justify-between border-t border-slate-600">
      <Link
        to="/settings"
        className="text-xs !text-slate-500 hover:text-slate-300 transition-colors"
      >
        Settings
      </Link>
      <span className="text-xs text-slate-500">
        GATEWAY v1.1.11-rc1-dev
      </span>
    </footer>
  );
};

export default Footer;
