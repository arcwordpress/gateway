import { useState, useEffect } from '@wordpress/element';
import { SlugTracker, parseInlineMarkdown } from '../utils/slugify';

/**
 * Custom hook to extract headings from markdown content
 */
export function useHeadings(content) {
    const [headings, setHeadings] = useState([]);

    useEffect(() => {
        if (!content) {
            setHeadings([]);
            return;
        }

        console.log('[TOC] Processing content, length:', content?.length);

        // Parse markdown content to extract headings
        const lines = content.split('\n');
        const extractedHeadings = [];
        const slugTracker = new SlugTracker();

        lines.forEach((line) => {
            // Match markdown headings (## to ######)
            const match = line.match(/^(#{2,6})\s+(.+)$/);
            if (match) {
                const level = match[1].length; // Number of # symbols
                const text = match[2].trim();

                // Create unique slug using shared utility (strips markdown for clean ID)
                const slug = slugTracker.getUniqueSlug(text);

                // Parse inline markdown for display (keeps formatting)
                const parsedText = parseInlineMarkdown(text);

                console.log('[TOC] Found heading:', { level, text, slug });

                extractedHeadings.push({
                    level,
                    text: parsedText, // Store parsed parts for rendering
                    id: slug
                });
            }
        });

        console.log('[TOC] Total headings extracted:', extractedHeadings.length);
        setHeadings(extractedHeadings);
    }, [content]);

    return headings;
}

function TableOfContents({ content }) {
    const headings = useHeadings(content);

    if (headings.length === 0) {
        return null;
    }

    console.log('[TOC] Rendering TOC with', headings.length, 'headings');

    return (
        <nav className="toc border border-slate-900 rounded-lg p-4 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto bg-neutral-950">
            <h3 className="text-sm font-semibold text-slate-50 mb-3 uppercase tracking-wide">
                Table of Contents
                <span className="block mt-1 text-xs text-neutral-600 font-normal">({headings.length} headings)</span>
            </h3>
            <ul className="space-y-1 text-sm pr-2">
                {headings.map((heading) => {
                    // Calculate indentation based on heading level (h2 = 0, h3 = 1, etc.)
                    const indent = (heading.level - 2) * 12;

                    return (
                        <li key={heading.id} style={{ marginLeft: `${indent}px` }}>
                            <a
                                href={`#${heading.id}`}
                                className="text-slate-50 hover:text-neutral-600 transition-colors duration-150 block py-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(heading.id);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        // Update URL hash
                                        window.history.pushState(null, '', `#${heading.id}`);
                                    }
                                }}
                            >
                                {heading.text.map((part, idx) => {
                                    if (typeof part === 'string') {
                                        return part;
                                    } else if (part.type === 'code') {
                                        return <code key={idx} className="text-neutral-600 text-xs px-1 py-0.5 rounded">{part.content}</code>;
                                    }
                                    return null;
                                })}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default TableOfContents;
