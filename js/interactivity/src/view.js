import { store } from '@wordpress/interactivity';

console.log('Gateway Interactivity loading...');

store('gateway/projects', {
    state: {
        get filteredRecords() {
            console.log('filteredRecords getter called');
            const { state } = store('gateway/projects');
            if (!state.searchTerm) return state.records || [];
            return (state.records || []).filter(r => 
                r.title?.toLowerCase().includes(state.searchTerm.toLowerCase())
            );
        }
    },
    actions: {
        updateSearch: (event) => {
            console.log('updateSearch action triggered', event.target.value);
            const { state } = store('gateway/projects');
            state.searchTerm = event.target.value;
        }
    }
});

console.log('Gateway Interactivity loaded');