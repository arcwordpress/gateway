import { useRecord } from '../context/GridContext';

/**
 * SingleView Component
 * Displays a detailed view of a single record
 * 
 * @param {Object} props
 * @param {number|string} props.recordId - Record ID to fetch from context
 * @param {Object} props.record - Optional: Direct record object (bypasses context)
 * @param {string} props.collectionKey - Optional: Collection key (for standalone usage)
 */
const SingleView = ({ recordId, record: directRecord, collectionKey }) => {
    // Try to get record from context first (if recordId provided)
    const contextRecord = useRecord(recordId);
    
    // Use direct record if provided, otherwise use context record
    const record = directRecord || contextRecord;

    // Fallback to placeholder if no record found
    const data = record || {
        id: recordId || 1,
        title: 'Record Not Found',
        description: 'This record could not be loaded. It may not exist or data may still be loading.'
    };

    return (
        <div className="single-view">
            <div className="single-view__header">
                <h2>{data.title || `Record #${data.id}`}</h2>
                <span className="single-view__id">ID: {data.id}</span>
            </div>
            <div className="single-view__content">
                {data.description && <p>{data.description}</p>}
                
                {/* Render all fields dynamically */}
                <div className="single-view__fields">
                    {Object.entries(data).map(([key, value]) => {
                        // Skip rendering certain system fields
                        if (['id', 'title', 'description'].includes(key)) return null;
                        
                        return (
                            <div key={key} className="single-view__field">
                                <strong className="single-view__field-label">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </strong>
                                <span className="single-view__field-value">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SingleView;