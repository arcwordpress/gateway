/**
 * AdminEditLink Component
 * Displays an edit link to the WordPress admin for docs, doc groups, and doc sets
 * Only visible to logged-in users with manage_options capability
 */

import './AdminEditLink.css';

function AdminEditLink({ type, id, label }) {
    // Check if user can manage docs
    const canManageDocs = window.waypointData?.canManageDocs;
    const adminUrl = window.waypointData?.adminUrl;

    // Don't render if user doesn't have permission or required data is missing
    if (!canManageDocs || !adminUrl || !type || !id) {
        return null;
    }

    // Generate the edit URL based on the pattern:
    // {admin_url}/admin.php?page=gateway-collections#/collection/{type}/edit/{id}
    const editUrl = `${adminUrl}#/collection/${type}/edit/${id}`;

    return (
        <a
            href={editUrl}
            className="admin-edit-link"
            target="_blank"
            rel="noopener noreferrer"
        >
            <svg
                className="admin-edit-link__icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
            </svg>
            <span>{label || 'Edit in Admin'}</span>
        </a>
    );
}

export default AdminEditLink;
