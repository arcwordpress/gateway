import { store, getContext } from '@wordpress/interactivity';

// This store pattern works for multiple view instances
// Each view gets its own namespace: gateway/view-{viewKey}
const { state } = store('gateway/view', {
  state: {
    get isReady() {
      const context = getContext();
      return context.apiRoute && context.apiRoute.length > 0;
    },
  },
  actions: {
    *loadRecords() {
      const context = getContext();
      
      if (!context.apiRoute) {
        context.error = 'No API route configured';
        return;
      }
      
      context.isLoading = true;
      context.error = null;
      
      try {
        const url = new URL(context.apiRoute);
        url.searchParams.set('per_page', context.perPage || 10);
        url.searchParams.set('page', context.currentPage || 1);
        
        const response = yield fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const json = yield response.json();
        
        // Handle different response formats
        if (json.data && json.data.items) {
          context.records = json.data.items;
          if (json.data.pagination) {
            context.totalPages = json.data.pagination.total_pages || 1;
          }
        } else if (Array.isArray(json)) {
          context.records = json;
        } else if (json.items) {
          context.records = json.items;
        } else {
          context.records = [];
        }
        
        context.isLoading = false;
      } catch (error) {
        context.error = error.message || 'Failed to load records';
        context.isLoading = false;
        context.records = [];
      }
    },
    
    nextPage() {
      const context = getContext();
      if (context.currentPage < context.totalPages) {
        context.currentPage += 1;
        this.loadRecords();
      }
    },
    
    prevPage() {
      const context = getContext();
      if (context.currentPage > 1) {
        context.currentPage -= 1;
        this.loadRecords();
      }
    },
    
    refresh() {
      this.loadRecords();
    },
  },
});
