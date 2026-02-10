/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * Gateway Viewport Store
 *
 * Detects when the block enters the viewport using the Intersection Observer API
 * and updates the context to notify child blocks for animation triggers.
 *
 * This works similarly to GSAP ScrollTrigger or anime.js viewport detection,
 * providing a reactive `inViewport` context that child blocks can use.
 */
store('gateway/viewport', {
	state: {
		get inViewport() {
			const context = getContext();
			return context.inViewport || false;
		},
	},

	callbacks: {
		/**
		 * Initialize the Intersection Observer when the block mounts
		 * This is called via data-wp-init directive
		 */
		initViewport: () => {
			const { ref } = getElement();
			const context = getContext();

			// Create an Intersection Observer
			// threshold: 0 means trigger as soon as any part is visible
			// You can adjust this for different trigger points:
			// - 0: As soon as any pixel is visible
			// - 0.5: When 50% is visible
			// - 1: When 100% is visible
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						// Update the context when intersection state changes
						context.inViewport = entry.isIntersecting;
					});
				},
				{
					threshold: 0, // Trigger as soon as any part enters viewport
					rootMargin: '0px', // No margin adjustment
				}
			);

			// Start observing the element
			observer.observe(ref);

			// Cleanup: disconnect observer when element is removed
			return () => {
				observer.disconnect();
			};
		},
	},
});
