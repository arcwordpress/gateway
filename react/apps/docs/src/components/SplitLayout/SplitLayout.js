import './style.css';

function SplitLayout({ sidebar, header, children, sidebarWidth }) {
    return (
        <div
            className="gty-split-layout"
            style={{ '--sidebar-width': sidebarWidth || 'clamp(220px, 25vw, 320px)' }}
        >
            <aside className="gty-split-layout__sidebar">
                {sidebar}
            </aside>
            <header className="gty-split-layout__header">
                {header}
            </header>
            <main className="gty-split-layout__main">
                {children}
            </main>
        </div>
    );
}

export default SplitLayout;