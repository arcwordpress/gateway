/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * Path matching utilities
 * Similar to react-router's path matching but lightweight
 */

/**
 * Convert a route path pattern into a regex and extract parameter names
 * Examples:
 *   "/" -> exact match for root
 *   "/about" -> exact match for /about
 *   "/products/:id" -> matches /products/123, captures id=123
 *   "/blog/:category/:slug" -> matches /blog/tech/hello, captures category=tech, slug=hello
 *   "/docs/*" -> matches /docs/anything/nested
 */
function compilePath(path) {
	// Handle exact matches (no dynamic segments or wildcards)
	if (!path.includes(':') && !path.includes('*')) {
		return {
			regex: new RegExp(`^${path}$`),
			keys: [],
		};
	}

	const keys = [];

	// Replace :param with named capture groups
	// Replace * with wildcard match
	let regexPattern = path
		.replace(/\/:([^/]+)/g, (match, paramName) => {
			keys.push(paramName);
			return '/([^/]+)';
		})
		.replace(/\/\*/g, '/(.*)');

	// Ensure exact match (unless wildcard at end)
	if (!regexPattern.endsWith('(.*)')) {
		regexPattern = `^${regexPattern}$`;
	} else {
		regexPattern = `^${regexPattern}`;
	}

	return {
		regex: new RegExp(regexPattern),
		keys,
	};
}

/**
 * Match a pathname against a route path pattern
 * Returns null if no match, or an object with params if matched
 */
function matchPath(pathname, routePath) {
	const { regex, keys } = compilePath(routePath);
	const match = pathname.match(regex);

	if (!match) {
		return null;
	}

	// Extract params from capture groups
	const params = {};
	keys.forEach((key, index) => {
		params[key] = match[index + 1];
	});

	return {
		path: routePath,
		pathname,
		params,
	};
}

/**
 * Get the current pathname from the browser
 * Strips the origin and returns just the path
 */
function getCurrentPathname() {
	return window.location.pathname;
}

/**
 * Gateway Router Store
 *
 * Handles client-side routing similar to React Router.
 * Routes are defined as child blocks with data-router-path attributes.
 * The router matches the current path and shows/hides routes accordingly.
 */
store('gateway/router', {
	state: {
		/**
		 * Get the current active route path from context
		 */
		get currentPath() {
			const context = getContext();
			return context.route || '/';
		},

		/**
		 * Check if a specific route path matches the current path
		 * This is used by route blocks to determine if they should be visible
		 */
		get isActive() {
			const context = getContext();
			const currentPath = context.route || '/';
			const routePath = context.routePath || '/';

			return matchPath(currentPath, routePath) !== null;
		},

		/**
		 * Get the matched params for the current route
		 * Returns an object with dynamic segment values
		 * Example: for route "/products/:id" and path "/products/123"
		 *          returns { id: "123" }
		 */
		get params() {
			const context = getContext();
			const currentPath = context.route || '/';
			const routePath = context.routePath || '/';

			const match = matchPath(currentPath, routePath);
			return match ? match.params : {};
		},
	},

	actions: {
		/**
		 * Navigate to a new path
		 * Updates the router context and browser history
		 *
		 * Usage:
		 * <button data-wp-on--click="actions.navigate" data-path="/about">
		 */
		navigate: (event) => {
			const context = getContext();
			const { ref } = getElement();

			// Get path from event target's data-path attribute
			const path = event.target.dataset.path || event.target.getAttribute('data-path');

			if (!path) {
				console.warn('Router: navigate action called without data-path attribute');
				return;
			}

			// Don't navigate if already on this path
			if (context.route === path) {
				return;
			}

			// Update context
			context.route = path;

			// Update browser history
			window.history.pushState({ path }, '', path);

			// Update route visibility
			updateRouteVisibility(ref, path);

			// Prevent default link behavior if this is a link
			event.preventDefault();
		},

		/**
		 * Navigate to a path programmatically
		 * Can be called from other actions or external code
		 *
		 * Usage in another store:
		 * const { actions } = store('gateway/router');
		 * actions.navigateTo('/products/123');
		 */
		navigateTo: (path) => {
			const context = getContext();
			const { ref } = getElement();

			if (!path || context.route === path) {
				return;
			}

			context.route = path;
			window.history.pushState({ path }, '', path);
			updateRouteVisibility(ref, path);
		},
	},

	callbacks: {
		/**
		 * Initialize the router when the block mounts
		 * Sets up history listener and initial route
		 */
		init: () => {
			const { ref } = getElement();
			const context = getContext();

			// Set initial route from current browser path
			const currentPath = getCurrentPathname();
			context.route = currentPath;

			// Update route visibility on init
			updateRouteVisibility(ref, currentPath);

			// Listen for browser back/forward navigation
			const handlePopState = (event) => {
				const newPath = getCurrentPathname();
				context.route = newPath;
				updateRouteVisibility(ref, newPath);
			};

			window.addEventListener('popstate', handlePopState);

			// Intercept clicks on links within the router to enable SPA navigation
			const handleLinkClick = (event) => {
				const link = event.target.closest('a[href]');

				if (!link) return;

				const href = link.getAttribute('href');

				// Only handle internal links (relative paths or same-origin)
				if (href.startsWith('/') || href.startsWith(window.location.origin)) {
					event.preventDefault();

					const path = href.startsWith('/')
						? href
						: new URL(href).pathname;

					if (context.route !== path) {
						context.route = path;
						window.history.pushState({ path }, '', path);
						updateRouteVisibility(ref, path);
					}
				}
			};

			ref.addEventListener('click', handleLinkClick);

			// Cleanup function
			return () => {
				window.removeEventListener('popstate', handlePopState);
				ref.removeEventListener('click', handleLinkClick);
			};
		},
	},
});

/**
 * Update the visibility of route blocks based on current path
 * Shows the first matching route, hides all others
 */
function updateRouteVisibility(routerElement, currentPath) {
	// Find all route blocks (direct children with data-router-path)
	const routeElements = routerElement.querySelectorAll(':scope > [data-router-path]');

	let foundMatch = false;

	routeElements.forEach((routeElement) => {
		const routePath = routeElement.getAttribute('data-router-path');
		const matches = matchPath(currentPath, routePath);

		if (matches && !foundMatch) {
			// Show this route (first match wins)
			routeElement.style.display = '';
			foundMatch = true;

			// Store matched params in a data attribute for potential use
			routeElement.dataset.matchedParams = JSON.stringify(matches.params);
		} else {
			// Hide this route
			routeElement.style.display = 'none';
		}
	});

	// If no route matched, show the default route (if specified)
	if (!foundMatch) {
		const defaultPath = routerElement.getAttribute('data-wp-context');
		if (defaultPath) {
			try {
				const contextData = JSON.parse(defaultPath);
				const defaultRoute = contextData.defaultRoute || '/';

				routeElements.forEach((routeElement) => {
					const routePath = routeElement.getAttribute('data-router-path');
					if (routePath === defaultRoute) {
						routeElement.style.display = '';
					}
				});
			} catch (e) {
				console.error('Router: Failed to parse context data', e);
			}
		}
	}
}
