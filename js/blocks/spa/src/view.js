import { store, getContext } from '@wordpress/interactivity';

store('gateway/spa', {
  state: {
    get currentUrl() {
      return window.location.href;
    },
    get currentSlotLabel() {
      const ctx = getContext();
      return ctx.currentSlot || 'home';
    },
    get showHome() {
      const ctx = getContext();
      return ctx.currentSlot === 'home';
    },
    get showAbout() {
      const ctx = getContext();
      return ctx.currentSlot === 'about';
    },
    get showContact() {
      const ctx = getContext();
      return ctx.currentSlot === 'contact';
    },
    get isActive() {
      const ctx = getContext();
      const parentCtx = ctx.parent || {};
      return parentCtx.currentSlot === ctx.slot;
    },
  },
  actions: {
    navigate: (event) => {
      event.preventDefault();
      const ctx = getContext();
      const parentCtx = ctx.parent || {};

      // Get the slot from the link's context
      const targetSlot = ctx.slot;

      // Update parent context
      parentCtx.currentSlot = targetSlot;

      // Update URL hash for browser history
      window.history.pushState({}, '', `#${targetSlot}`);

      console.log(`Navigated to: ${targetSlot}`);
    },
    goHome: (event) => {
      const ctx = getContext();
      const parentCtx = ctx.parent || {};

      // Navigate back to home
      parentCtx.currentSlot = 'home';
      window.history.pushState({}, '', '#home');

      console.log('Navigated back to home');
    },
  },
  callbacks: {
    init: () => {
      const ctx = getContext();

      // Initialize from URL hash
      const hash = window.location.hash.replace('#', '');
      if (hash && ['home', 'about', 'contact'].includes(hash)) {
        ctx.currentSlot = hash;
      } else {
        ctx.currentSlot = 'home';
      }

      // Handle browser back/forward buttons
      window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.replace('#', '') || 'home';
        if (['home', 'about', 'contact'].includes(newHash)) {
          ctx.currentSlot = newHash;
          console.log(`Hash changed to: ${newHash}`);
        }
      });

      console.log('GT SPA Router initialized with slot:', ctx.currentSlot);
    },
  },
});
