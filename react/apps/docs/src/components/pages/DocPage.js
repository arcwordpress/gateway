import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useDataStore } from '../../store/dataStore';
import Sidebar from '../Sidebar';
import MobileSidebar from '../MobileSidebar';
import TableOfContents from '../TableOfContents';
import MobileTOC from '../MobileTOC';
import CopyCodeButton from '../CopyCodeButton';
import { SlugTracker } from '../../utils/slugify';
import '../CodeBlock.css';

function DocPage() {
    const { docsetSlug, groupSlug, docSlug } = useParams();
    const { data, loading, error } = useDataStore();

    // Create a slug tracker for heading IDs
    // This must be recreated for each render to match TOC
    const slugTracker = new SlugTracker();

    // Customize syntax highlighter style to remove background (we handle it with <pre>)
    const codeStyle = {
        ...oneDark,
        'pre[class*="language-"]': {
            ...oneDark['pre[class*="language-"]'],
            background: 'transparent',
            margin: 0,
            padding: 0,
        },
        'code[class*="language-"]': {
            ...oneDark['code[class*="language-"]'],
            background: 'transparent',
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-slate-700 opacity-40 rounded w-3/4 min-h-10"></div>
                    <div className="h-4 bg-slate-700 opacity-40 rounded w-full mt-6 min-h-4"></div>
                    <div className="h-4 bg-slate-700 opacity-40 rounded w-5/6 min-h-4"></div>
                    <div className="h-4 bg-slate-700 opacity-40 rounded w-4/5 min-h-4"></div>
                    <div className="h-32 bg-slate-700 opacity-40 rounded w-full mt-6 min-h-32"></div>
                    <div className="h-4 bg-slate-700 opacity-40 rounded w-full min-h-4"></div>
                    <div className="h-4 bg-slate-700 opacity-40 rounded w-3/4 min-h-4"></div>
                </div>
            </div>
        );
    }

    if (error) return <div className="p-8 max-w-4xl mx-auto"><p className="text-neutral-600">Error: {error}</p></div>;
    if (!data) return <div className="p-8 max-w-4xl mx-auto"><p className="text-slate-50">No data available</p></div>;

    const docset = data.getDocSetBySlug(docsetSlug);
    if (!docset) return <div className="p-8 max-w-4xl mx-auto"><p className="text-slate-50">Docset not found</p></div>;

    const docGroups = data.getDocGroupsByDocSetId(docset.id);
    const docGroup = data.getDocGroupBySlugAndDocSetId(groupSlug, docset.id);
    if (!docGroup) return <div className="p-8 max-w-4xl mx-auto"><p className="text-slate-50">Doc group not found</p></div>;

    const allDocs = docGroups.flatMap(group => data.getDocsByDocGroupId(group.id));
    const doc = data.getDocBySlugAndDocGroupId(docSlug, docGroup.id);

    return (
        <div className="flex min-h-screen items-start">
            <Sidebar docset={docset} docGroups={docGroups} allDocs={allDocs} data={data} />

            <main className="flex-1 min-w-0">
                {doc?.content ? (
                    <div className="flex gap-8 p-8">
                        <div className="flex-1 min-w-0 max-w-[65ch]">
                            {doc.title && <h1 className="text-4xl font-black text-slate-50 mb-6 break-words">{doc.title}</h1>}

                            {/* Mobile Navigation - Shows only on mobile */}
                            <MobileSidebar docset={docset} docGroups={docGroups} data={data} />

                            {/* Mobile TOC - Shows only on mobile */}
                            <MobileTOC content={doc.content} />
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({ node, children }) => {
                                        const id = slugTracker.getUniqueSlug(children);
                                        console.log('[DocPage] h2 ID:', id, 'for text:', children);
                                        return <h2 id={id} className="text-3xl font-extrabold text-slate-50 mt-12 mb-4 break-words">{children}</h2>;
                                    },
                                    h3: ({ node, children }) => {
                                        const id = slugTracker.getUniqueSlug(children);
                                        return <h3 id={id} className="text-2xl font-bold text-slate-50 mt-8 mb-3 break-words">{children}</h3>;
                                    },
                                    h4: ({ node, children }) => {
                                        const id = slugTracker.getUniqueSlug(children);
                                        return <h4 id={id} className="text-xl font-bold text-slate-50 mt-6 mb-2 break-words">{children}</h4>;
                                    },
                                    h5: ({ node, children }) => {
                                        const id = slugTracker.getUniqueSlug(children);
                                        return <h5 id={id} className="text-lg font-semibold text-slate-50 mt-4 mb-2 break-words">{children}</h5>;
                                    },
                                    h6: ({ node, children }) => {
                                        const id = slugTracker.getUniqueSlug(children);
                                        return <h6 id={id} className="text-base font-semibold text-slate-50 mt-4 mb-2 break-words">{children}</h6>;
                                    },
                                    p: ({ node, children }) => {
                                        return <p className="my-5 text-slate-50 leading-7 break-words">{children}</p>;
                                    },
                                    a: ({ node, children, href, ...props }) => {
                                        return <a href={href} className="text-neutral-600 hover:opacity-70 font-medium transition-opacity" {...props}>{children}</a>;
                                    },
                                    ul: ({ node, children }) => {
                                        return <ul className="my-5 pl-7 list-disc text-slate-50">{children}</ul>;
                                    },
                                    ol: ({ node, children }) => {
                                        return <ol className="my-5 pl-7 list-decimal text-slate-50">{children}</ol>;
                                    },
                                    li: ({ node, children }) => {
                                        return <li className="my-2">{children}</li>;
                                    },
                                    strong: ({ node, children }) => {
                                        return <strong className="font-semibold text-slate-50">{children}</strong>;
                                    },
                                    em: ({ node, children }) => {
                                        return <em className="italic">{children}</em>;
                                    },
                                    blockquote: ({ node, children }) => {
                                        return <blockquote className="border-l-4 border-slate-900 pl-4 my-6 italic text-slate-50">{children}</blockquote>;
                                    },
                                    pre: ({ node, children }) => {
                                        return <pre className="code-block">{children}</pre>;
                                    },
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');

                                        if (!inline && match) {
                                            const codeText = String(children).replace(/\n$/, '');
                                            return (
                                                <div className="code-block-wrapper">
                                                    <CopyCodeButton code={codeText} />
                                                    <SyntaxHighlighter
                                                        style={codeStyle}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {codeText}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        }

                                        return (
                                            <code className="code-inline" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    hr: ({ node }) => {
                                        return <hr className="my-8 border-slate-700" />;
                                    },
                                    table: ({ node, children }) => {
                                        return <div className="overflow-x-auto my-6"><table className="min-w-full border border-slate-700">{children}</table></div>;
                                    },
                                    thead: ({ node, children }) => {
                                        return <thead className="bg-slate-800">{children}</thead>;
                                    },
                                    tbody: ({ node, children }) => {
                                        return <tbody>{children}</tbody>;
                                    },
                                    tr: ({ node, children }) => {
                                        return <tr className="border-b border-slate-700">{children}</tr>;
                                    },
                                    th: ({ node, children }) => {
                                        return <th className="px-4 py-2 text-left font-semibold text-slate-50">{children}</th>;
                                    },
                                    td: ({ node, children }) => {
                                        return <td className="px-4 py-2 text-slate-50">{children}</td>;
                                    }
                                }}
                            >
                                {doc.content}
                            </ReactMarkdown>
                        </div>

                        {/* Desktop TOC - Hidden on mobile (below 768px) */}
                        <div className="w-64 flex-shrink-0 hidden md:block">
                            <TableOfContents content={doc.content} />
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-50 p-8">No content available</p>
                )}
            </main>
        </div>
    );
}

export default DocPage;
