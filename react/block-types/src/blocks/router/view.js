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
 * Extract the route path from a full pathname
 * Handles cases where the router is on a subpage
 *
 * Examples:
 *   - Page at /routing, URL /routing -> returns /
 *   - Page at /routing, URL /routing/test -> returns /test
 *   - Page at /routing, URL /routing/products/123 -> returns /products/123
 */
function getRouteFromPathname(fullPathname, routePaths) {
	// Try each route path to see if it matches when appended to various base paths
	// We'll try removing path segments from the left until we find a match

	// If the pathname exactly matches a route path, use it as-is
	if (routePaths.includes(fullPathname)) {
		return fullPathname;
	}

	// Split pathname into segments
	const segments = fullPathname.split('/').filter(Boolean);

	// Try progressively removing segments from the start
	for (let i = 0; i < segments.length; i++) {
		const potentialRoute = '/' + segments.slice(i).join('/');

		// Check if this matches any route path pattern
		for (const routePath of routePaths) {
			if (matchPath(potentialRoute, routePath)) {
				return potentialRoute;
			}
		}
	}

	// If nothing matched, assume we're at the root route
	return '/';
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
			// Get path from event target's data-path attribute
			const routePath = event.target.dataset.path || event.target.getAttribute('data-path');

			if (!routePath) {
				console.warn('Router: navigate action called without data-path attribute');
				return;
			}

			// Find the nearest router element
			const routerElement = event.target.closest('[data-wp-interactive="gateway/router"]');

			if (!routerElement) {
				console.error('Router: navigate action called outside of router context');
				return;
			}

			// Get the router's context from its data attribute
			const contextAttr = routerElement.getAttribute('data-wp-context');
			if (!contextAttr) {
				console.error('Router: router element missing context data');
				return;
			}

			let routerContext;
			try {
				routerContext = JSON.parse(contextAttr);
			} catch (e) {
				console.error('Router: failed to parse router context', e);
				return;
			}

			// Don't navigate if already on this path
			if (routerContext.route === routePath) {
				event.preventDefault();
				return;
			}

			// Get base path and construct full URL
			const basePath = routerElement.dataset.basePath || '';
			const fullPath = basePath + routePath;

			// Update context
			routerContext.route = routePath;
			routerElement.setAttribute('data-wp-context', JSON.stringify(routerContext));

			// Update browser history with full path
			window.history.pushState({ path: fullPath }, '', fullPath);

			// Update route visibility (use route path, not full path)
			updateRouteVisibility(routerElement, routePath);

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
		navigateTo: (routePath) => {
			const context = getContext();
			const { ref } = getElement();

			if (!routePath || context.route === routePath) {
				return;
			}

			// Get base path and construct full URL
			const basePath = ref.dataset.basePath || '';
			const fullPath = basePath + routePath;

			context.route = routePath;
			window.history.pushState({ path: fullPath }, '', fullPath);
			updateRouteVisibility(ref, routePath);
		},
	},

	callbacks: {
		/**
		 * Initialize the router when the block mounts
		 * Sets up history listener and initial route
		 */
		init: () => {
			console.log('[Router] Init callback called');
			const { ref } = getElement();
			const context = getContext();

			console.log('[Router] Element ref:', ref);
			console.log('[Router] Initial context:', context);

			// Get all route paths from child route elements
			const routeElements = ref.querySelectorAll(':scope > [data-router-path]');
			const routePaths = Array.from(routeElements).map(el =>
				el.getAttribute('data-router-path')
			);

			console.log('[Router] Available route paths:', routePaths);

			// Set initial route from current browser path
			const fullPathname = getCurrentPathname();
			const routePath = getRouteFromPathname(fullPathname, routePaths);

			console.log('[Router] Current pathname:', fullPathname);
			console.log('[Router] Extracted route:', routePath);

			// Store base path for future navigations
			const basePath = fullPathname.substring(0, fullPathname.length - routePath.length) || '';
			ref.dataset.basePath = basePath;
			console.log('[Router] Base path:', basePath);

			context.route = routePath;

			// Update route visibility on init
			console.log('[Router] Calling updateRouteVisibility');
			updateRouteVisibility(ref, routePath);

			// Listen for browser back/forward navigation
			const handlePopState = (event) => {
				const fullPathname = getCurrentPathname();
				const routePath = getRouteFromPathname(fullPathname, routePaths);
				context.route = routePath;
				updateRouteVisibility(ref, routePath);
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

					const fullPath = href.startsWith('/')
						? href
						: new URL(href).pathname;

					const routePath = getRouteFromPathname(fullPath, routePaths);

					if (context.route !== routePath) {
						context.route = routePath;
						window.history.pushState({ path: fullPath }, '', fullPath);
						updateRouteVisibility(ref, routePath);
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
	console.log('[Router] updateRouteVisibility called', { routerElement, currentPath });

	// Find all route blocks (direct children with data-router-path)
	const routeElements = routerElement.querySelectorAll(':scope > [data-router-path]');
	console.log('[Router] Found route elements:', routeElements.length, routeElements);

	let foundMatch = false;

	routeElements.forEach((routeElement) => {
		const routePath = routeElement.getAttribute('data-router-path');
		console.log('[Router] Checking route:', routePath, 'against current:', currentPath);
		const matches = matchPath(currentPath, routePath);
		console.log('[Router] Match result:', matches);

		if (matches && !foundMatch) {
			// Show this route (first match wins)
			console.log('[Router] Showing route:', routePath);
			routeElement.style.display = '';
			foundMatch = true;

			// Store matched params in a data attribute for potential use
			routeElement.dataset.matchedParams = JSON.stringify(matches.params);
		} else {
			// Hide this route
			console.log('[Router] Hiding route:', routePath);
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
