import './style.css';

function Menu({ children, dir = 'v', className = '' }) {
    const directionClass = dir === 'h' ? 'gty-menu--horizontal' : 'gty-menu--vertical';
    return (
        <ul className={`gty-menu ${directionClass} ${className}`}>
            {children}
        </ul>
    );
}

export default Menu;