import { store } from '@wordpress/interactivity';

const { state, actions } = store('gateway/forest', {
  state: {
    records: [
      {
        id: 1,
        title: 'Spring Conference 2026',
        description: 'Annual spring conference bringing together industry leaders and innovators.',
        date: '2026-04-15'
      },
      {
        id: 2,
        title: 'Web Development Workshop',
        description: 'Hands-on workshop covering modern web development best practices.',
        date: '2026-03-20'
      },
      {
        id: 3,
        title: 'Networking Mixer',
        description: 'Casual networking event for professionals in tech and business.',
        date: '2026-03-25'
      },
      {
        id: 4,
        title: 'Design Thinking Summit',
        description: 'Explore innovative design methodologies and creative problem-solving.',
        date: '2026-05-10'
      },
      {
        id: 5,
        title: 'Cloud Infrastructure Seminar',
        description: 'Deep dive into cloud technologies, scalability, and deployment strategies.',
        date: '2026-04-08'
      }
    ],
    isLoading: false,
    error: null,
  },
  actions: {
    *loadRecords() {
      if (!state.apiRoute) {
        return;
      }
      
      state.isLoading = true;
      state.error = null;
      try {
        const response = yield fetch(state.apiRoute);
        state.records = yield response.json();
      } catch (err) {
        state.error = err.message;
      }
      state.isLoading = false;
    },
    logStoreState() {
      console.log('🧪 GATEWAY STORE STATE:', {
        records: state.records,
        isLoading: state.isLoading,
        error: state.error,
        apiRoute: state.apiRoute,
        catfeet: state.catfeet
      });
    }
  },
  callbacks: {
    *onReady() {
      console.log('🧪 onReady callback fired, apiRoute:', state.apiRoute);
      if (state.apiRoute && !state.isLoading && state.records.length === 0) {
        yield actions.loadRecords();
      }
    }
  }
});
