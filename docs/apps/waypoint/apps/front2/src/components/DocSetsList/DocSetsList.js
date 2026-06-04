import { Link } from 'react-router-dom';
import './styles.css';

function DocSetsList({ docsets }) {
    if (docsets.length === 0) {
        return <p className="text-slate-50">No docsets found.</p>;
    }

    return (
        <ul className="doc-set-list space-y-2">
            {docsets.map((docset) => (
                <li key={docset.id} className="doc-set-list__item border border-slate-900 rounded-lg hover:border-neutral-600 transition">
                    <Link to={`/${docset.slug}`} className="doc-set-list__link block p-4">
                        <h3 className="font-semibold text-neutral-600 hover:opacity-70">{docset.name || 'Untitled'}</h3>
                        {docset.description && <p className="text-sm text-slate-50 mt-1">{docset.description}</p>}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default DocSetsList;
