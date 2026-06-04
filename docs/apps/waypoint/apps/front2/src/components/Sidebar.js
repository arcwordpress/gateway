import { Link, useParams } from 'react-router-dom';
import AdminEditLink from './AdminEditLink';

function Sidebar({ docset, docGroups, allDocs, data }) {
    const { docsetSlug, groupSlug, docSlug } = useParams();

    return (
        <aside className="w-64 flex-shrink-0 border-r border-slate-700 p-6 sticky top-0 h-screen overflow-y-auto hidden md:block">
            <h2 className="text-xl font-bold font-lexend text-slate-50 mb-4">{docset.name}</h2>

            <nav>
                {docGroups.map((group) => {
                    const docs = data.getDocsByDocGroupId(group.id);

                    const isActiveGroup = group.slug === groupSlug;

                    return (
                        <div key={group.id} className="mb-4">
                            <Link
                                to={`/${docsetSlug}/${group.slug}`}
                                className={`block text-base font-semibold mb-2 ${
                                    isActiveGroup ? 'text-neutral-600' : 'text-slate-50 hover:text-neutral-600'
                                }`}
                            >
                                {group.title}
                            </Link>

                            {docs.length > 0 && (
                                <ul className="ml-3 space-y-1">
                                    {docs.map((doc) => {
                                        const isActiveDoc = doc.slug === docSlug;

                                        return (
                                            <li key={doc.id}>
                                                <Link
                                                    to={`/${docsetSlug}/${group.slug}/${doc.slug}`}
                                                    className={`block text-sm py-1 ${
                                                        isActiveDoc
                                                            ? 'text-neutral-600 font-medium'
                                                            : 'text-slate-50 hover:text-neutral-600'
                                                    }`}
                                                >
                                                    {doc.title}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Admin Edit Links - Shows appropriate edit link based on current page */}
            {docSlug && (() => {
                const docGroup = data.getDocGroupBySlugAndDocSetId(groupSlug, docset.id);
                const doc = docGroup ? data.getDocBySlugAndDocGroupId(docSlug, docGroup.id) : null;
                return doc ? <AdminEditLink type="docs" id={doc.id} label="Edit Doc" /> : null;
            })()}

            {!docSlug && groupSlug && (() => {
                const docGroup = data.getDocGroupBySlugAndDocSetId(groupSlug, docset.id);
                return docGroup ? <AdminEditLink type="doc_groups" id={docGroup.id} label="Edit Doc Group" /> : null;
            })()}

            {!docSlug && !groupSlug && docset && (
                <AdminEditLink type="doc_sets" id={docset.id} label="Edit Doc Set" />
            )}

            <Link to="/" className="text-neutral-600 hover:opacity-70 text-sm mt-8 inline-block">
                &larr; All Documentation
            </Link>
        </aside>
    );
}

export default Sidebar;
