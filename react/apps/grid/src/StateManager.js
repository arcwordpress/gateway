/**
 * Shared State Manager for Gateway Components
 * Allows filters and grids to communicate across separate React roots
 */
class StateManager {
  constructor() {
    this.collections = new Map();
    this.listeners = new Map();
  }

  /**
   * Get or create collection state
   */
  getCollectionState(collectionKey) {
    if (!this.collections.has(collectionKey)) {
      this.collections.set(collectionKey, {
        filterValues: {},
        data: [],
        filteredData: [],
      });
      this.listeners.set(collectionKey, new Set());
    }
    return this.collections.get(collectionKey);
  }

  /**
   * Update filter values for a collection
   */
  updateFilters(collectionKey, filterValues) {
    const state = this.getCollectionState(collectionKey);
    state.filterValues = { ...state.filterValues, ...filterValues };
    this.notify(collectionKey, 'filters', state.filterValues);
  }

  /**
   * Update data for a collection
   */
  updateData(collectionKey, data) {
    const state = this.getCollectionState(collectionKey);
    state.data = data;
    this.notify(collectionKey, 'data', data);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(collectionKey, callback) {
    const listeners = this.listeners.get(collectionKey) || new Set();
    listeners.add(callback);
    this.listeners.set(collectionKey, listeners);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  notify(collectionKey, type, value) {
    const listeners = this.listeners.get(collectionKey);
    if (listeners) {
      listeners.forEach((callback) => {
        callback({ type, value, collectionKey });
      });
    }
  }
}

// Create singleton instance
const stateManager = new StateManager();

export default stateManager;
