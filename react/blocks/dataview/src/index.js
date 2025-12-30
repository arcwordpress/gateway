import { registerBlockType } from '@wordpress/blocks';
import { DataViews } from '@wordpress/dataviews/wp';
import { useState } from '@wordpress/element';

function Edit() {
        
    const [view, setView] = useState({
        type: 'table',
        perPage: 10,
        page: 1,
    });

    // Dummy function for infiniteScrollHandler
    const infiniteScrollHandler = () => {};

    const data = [
        {
            id: 1,
            title: 'First Post',
            date: '2025-12-01T10:00:00',
            author: 'Alice',
        },
        {
            id: 2,
            title: 'Second Post',
            date: '2025-12-01T12:00:00',
            author: 'Bob',
        },
    ];

    const { __ } = wp.i18n;
    function getFormattedDate(date) {
        // Simple ISO to locale string for demo; replace with your formatting as needed
        return new Date(date).toLocaleString();
    }

    const fields = [
        {
            id: 'title',
            type: 'text',
            label: 'Title',
        },
    ];

    return (
        <DataViews
            data={data}
            fields={fields}
            view={view}
            onChangeView={setView}
            paginationInfo={{
                totalItems: data.length,
                totalPages: 1,
                infiniteScrollHandler,
            }}
            defaultLayouts={{ table: {} }}
        >
            <h1>{ __( 'Free composition' ) }</h1>
            <DataViews.Search />
            <DataViews.FiltersToggle />
            <DataViews.Layout />
        </DataViews>
    );
}

function Save() {
    return null;
}

registerBlockType('gateway/dataview', {
    edit: Edit,
    save: Save,
});