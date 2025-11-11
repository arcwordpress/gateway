const SingleView = ({ record }) => {
    // Placeholder data
    const data = record || {
        id: 1,
        title: 'Sample Title',
        description: 'This is a sample description for the record.'
    };

    return (
        <div className="single-view">
            <div className="single-view__header">
                <h2>{data.title}</h2>
                <span className="single-view__id">ID: {data.id}</span>
            </div>
            <div className="single-view__content">
                <p>{data.description}</p>
            </div>
        </div>
    );
};

export default SingleView;