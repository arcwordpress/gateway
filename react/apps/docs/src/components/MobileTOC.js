import { useState } from '@wordpress/element';
import { useHeadings } from './TableOfContents';

/**
 * Mobile Table of Contents with Hamburger Menu
 * Shows as button on mobile, opens full-screen overlay when clicked
 */
function MobileTOC({ content }) {
    const [isOpen, setIsOpen] = useState(false);
    const headings = useHeadings(content);

    if (!headings || headings.length === 0) {
        return null;
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLinkClick = (headingId) => {
        const element = document.getElementById(headingId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.pushState(null, '', `#${headingId}`);
        }
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="md:hidden flex items-center gap-2 w-full px-4 py-3 mb-4 bg-slate-900 text-slate-50 rounded-lg hover:opacity-90 transition-opacity"
                aria-label="Toggle Table of Contents"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
                <span className="font-semibold">Table of Contents</span>
                <span className="ml-auto text-xs bg-neutral-600 px-2 py-1 rounded">
                    {headings.length}
                </span>
            </button>

            {/* Full-Screen Overlay */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
                    {/* Header with Close Button */}
                    <div className="sticky top-0 bg-slate-900 text-slate-50 p-4 border-b border-slate-700 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Table of Contents</h2>
                        <button
                            onClick={toggleMenu}
                            className="p-2 hover:bg-slate-700 rounded transition-colors"
                            aria-label="Close Table of Contents"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* TOC Content */}
                    <nav className="p-6">
                        <ul className="space-y-1">
                            {headings.map((heading) => {
                                const indent = (heading.level - 2) * 16;

                                return (
                                    <li key={heading.id} style={{ marginLeft: `${indent}px` }}>
                                        <button
                                            onClick={() => handleLinkClick(heading.id)}
                                            className="text-left w-full text-slate-50 hover:text-neutral-600 transition-colors duration-150 block py-2 text-base"
                                        >
                                            {heading.text.map((part, idx) => {
                                                if (typeof part === 'string') {
                                                    return part;
                                                } else if (part.type === 'code') {
                                                    return <code key={idx} className="text-neutral-600 text-sm px-1 py-0.5 rounded">{part.content}</code>;
                                                }
                                                return null;
                                            })}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            )}
        </>
    );
}

export default MobileTOC;
