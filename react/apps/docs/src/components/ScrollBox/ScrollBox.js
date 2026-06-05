import './style.css';

function ScrollBox({ children, height = '100vh', maxHeight, className = '' }) {
    const style = {
        height,
        ...(maxHeight ? { maxHeight } : {})
    };
    return (
        <div className={`gty-scroll-box ${className}`} style={style}>
            {children}
        </div>
    );
}

export default ScrollBox;