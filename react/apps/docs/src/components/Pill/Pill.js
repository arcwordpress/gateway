import './style.css';

function Pill({ children, className = '' }) {
    return <span className={`gty-pill${className ? ' ' + className : ''}`}>{children}</span>;
}
export default Pill;