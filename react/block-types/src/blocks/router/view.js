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
 * Global router instance - single source of truth
 * Set during router initialization
 */
let routerInstance = null;

/**
 * Central navigation function - the single source of truth for routing
 * Updates router state, manages history, controls visibility
 *
 * @param {string} routePath - The route path to navigate to (e.g., "/", "/about")
 */
function navigateToRoute(routePath) {
	if (!routerInstance) {
		console.error('Router: router not initialized yet');
		return;
	}

	const { element, context, basePath, currentRoute } = routerInstance;

	// Don't navigate if already on this route
	if (currentRoute === routePath) {
		return;
	}

	// Construct full URL
	// If route is "/", use basePath (or "/" if basePath is empty)
	// Otherwise, append the route path to basePath
	const fullPath = routePath === '/'
		? (basePath || '/')
		: basePath + routePath;

	// Update router state everywhere
	routerInstance.currentRoute = routePath;
	element.dataset.currentRoute = routePath;
	context.route = routePath;

	// Update browser history
	window.history.pushState({ path: fullPath }, '', fullPath);

	// Update route visibility
	updateRouteVisibility(element, routePath);

	console.log(`[Router] Navigated to ${routePath} (${fullPath})`);
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
		 * Navigate to a new route
		 * This is the ONLY way to navigate - router manages everything
		 *
		 * Usage from a link:
		 * <button data-wp-on--click="actions.navigate" data-path="/about">
		 */
		navigate: (event) => {
			// Get path from event target
			const routePath = event.target.dataset.path || event.target.getAttribute('data-path');

			if (!routePath) {
				console.warn('Router: navigate action called without data-path attribute');
				return;
			}

			// Prevent default first
			event.preventDefault();

			// Call the internal navigation logic
			navigateToRoute(routePath);
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

			// Get all route paths from child route elements
			const routeElements = ref.querySelectorAll(':scope > [data-router-path]');
			const routePaths = Array.from(routeElements).map(el =>
				el.getAttribute('data-router-path')
			);

			// Set initial route from current browser path
			const fullPathname = getCurrentPathname();
			const routePath = getRouteFromPathname(fullPathname, routePaths);

			// Calculate base path
			// Base path is the prefix before the router's routes
			// If on homepage "/" with route "/", basePath should be empty
			// If on "/routing" with route "/", basePath should be "/routing"
			// If on "/routing/test2" with route "/test2", basePath should be "/routing"
			let basePath;
			if (fullPathname === '/' && routePath === '/') {
				basePath = '';
			} else if (routePath === '/') {
				basePath = fullPathname;
			} else {
				basePath = fullPathname.substring(0, fullPathname.length - routePath.length);
			}

			// Strip trailing slash from basePath to prevent double slashes
			// e.g., "/routing/" becomes "/routing"
			if (basePath.endsWith('/') && basePath !== '/') {
				basePath = basePath.slice(0, -1);
			}

			console.log('[Router] Path calculation:', { fullPathname, routePath, basePath });

			// Initialize global router instance
			routerInstance = {
				element: ref,
				context: context,
				basePath: basePath,
				currentRoute: routePath,
				routePaths: routePaths,
			};

			// Store in data attributes
			ref.dataset.basePath = basePath;
			ref.dataset.currentRoute = routePath;

			// Update context for interactivity API
			context.route = routePath;

			// Show initial route
			updateRouteVisibility(ref, routePath);

			console.log('[Router] Initialized', {
				basePath,
				currentRoute: routePath,
				availableRoutes: routePaths,
			});

			// Listen for browser back/forward navigation
			const handlePopState = (event) => {
				const fullPathname = getCurrentPathname();
				const routePath = getRouteFromPathname(fullPathname, routerInstance.routePaths);

				routerInstance.currentRoute = routePath;
				ref.dataset.currentRoute = routePath;
				context.route = routePath;

				updateRouteVisibility(ref, routePath);
			};

			window.addEventListener('popstate', handlePopState);

			// Intercept regular anchor links within the router
			const handleLinkClick = (event) => {
				const link = event.target.closest('a[href]');
				if (!link) return;

				const href = link.getAttribute('href');

				// Only handle internal links
				if (href.startsWith('/') || href.startsWith(window.location.origin)) {
					event.preventDefault();

					const fullPath = href.startsWith('/') ? href : new URL(href).pathname;
					const routePath = getRouteFromPathname(fullPath, routerInstance.routePaths);

					navigateToRoute(routePath);
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
