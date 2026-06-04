import { Link } from 'react-router-dom';
import { createExcerpt } from '../utils/markdown';

function DocsList({ docs, docsetSlug, groupSlug }) {
    if (docs.length === 0) {
        return <p className="text-slate-50">No docs found.</p>;
    }

    return (
        <ul className="space-y-2">
            {docs.map((doc) => (
                <li key={doc.id} className="border border-slate-900 rounded-lg hover:border-neutral-600 transition">
                    <Link to={`/${docsetSlug}/${groupSlug}/${doc.slug}`} className="block p-4">
                        <h3 className="font-semibold text-neutral-600 hover:opacity-70">{doc.title || 'Untitled'}</h3>
                        {doc.content && (
                            <p className="text-sm text-slate-50 mt-1 line-clamp-2">
                                {createExcerpt(doc.content, 150)}
                            </p>
                        )}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default DocsList;
