import { Link } from 'react-router-dom';
import './style.css';

function MenuItem({ to, children, className = '' }) {
    return (
        <li className={`gty-menu-item ${className}`}>
            <Link to={to}>{children}</Link>
        </li>
    );
}

export default MenuItem;