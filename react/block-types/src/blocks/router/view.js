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
 * Get all current route params (global helper)
 * Can be imported and used from any block
 *
 * @returns {Object} Current route parameters (e.g., { courseSlug: "web-dev" })
 */
export function getRouteParams() {
	return routerInstance?.currentParams || {};
}

/**
 * Get a specific route param by key (global helper)
 * Can be imported and used from any block
 *
 * @param {string} key - The param name (e.g., "courseSlug")
 * @returns {string|undefined} The param value
 */
export function getRouteParam(key) {
	console.log('[Router] 🔍 getRouteParam called with key:', key);
	console.log('[Router] 🔍 routerInstance exists:', !!routerInstance);
	console.log('[Router] 🔍 routerInstance?.currentParams:', routerInstance?.currentParams);

	const value = routerInstance?.currentParams?.[key];
	console.log('[Router] 🔍 Returning value:', value);

	return value;
}

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

	// Clear old params before navigating
	routerInstance.currentParams = {};

	// Update router state everywhere
	routerInstance.currentRoute = routePath;
	element.dataset.currentRoute = routePath;
	context.route = routePath;

	// Update browser history
	window.history.pushState({ path: fullPath }, '', fullPath);

	// Update route visibility (this will set new params)
	updateRouteVisibility(element, routePath);

	console.log(`[Router] Navigated to ${routePath} (${fullPath})`);

	// Log params if any were matched
	if (routerInstance.currentParams && Object.keys(routerInstance.currentParams).length > 0) {
		console.log(`[Router] 🎯 Route params:`, routerInstance.currentParams);
	}
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
		 * Get the matched params for the current route (GLOBAL ACCESS)
		 * Returns an object with dynamic segment values from the global router instance
		 * This works from ANY block, even outside the router context
		 *
		 * Example: for route "/course/:courseSlug" and path "/course/web-dev"
		 *          returns { courseSlug: "web-dev" }
		 *
		 * Usage from any block:
		 *   const { state } = getStore('gateway/router');
		 *   const slug = state.params?.courseSlug;
		 */
		get params() {
			// Return global params - accessible from anywhere
			return routerInstance?.currentParams || {};
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
			// Get path from event target or traverse up to find element with data-path
			// This handles clicks on nested elements (like SVG inside logo button)
			const element = event.target.closest('[data-path]');
			const routePath = element?.dataset.path || element?.getAttribute('data-path');

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
			console.log('[Router] 🚀 ========== INIT CALLBACK CALLED ==========');
			const { ref } = getElement();
			const context = getContext();

			// Get all route paths from child route elements
			const routeElements = ref.querySelectorAll(':scope > [data-router-path]');
			const routePaths = Array.from(routeElements).map(el =>
				el.getAttribute('data-router-path')
			);

			console.log('[Router] 📋 Registered route patterns:', routePaths);

			// Set initial route from current browser path
			const fullPathname = getCurrentPathname();
			console.log('[Router] 🌐 Current browser URL path:', fullPathname);

			const routePath = getRouteFromPathname(fullPathname, routePaths);
			console.log('[Router] 🎯 Matched initial route:', routePath);

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

			// Initialize global router instance
			routerInstance = {
				element: ref,
				context: context,
				basePath: basePath,
				currentRoute: routePath,
				currentParams: {}, // Global param storage for access from any block
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

				// Clear params before updating route
				routerInstance.currentParams = {};

				routerInstance.currentRoute = routePath;
				ref.dataset.currentRoute = routePath;
				context.route = routePath;

				updateRouteVisibility(ref, routePath);

				// Log params if any were matched (for back/forward testing)
				if (routerInstance.currentParams && Object.keys(routerInstance.currentParams).length > 0) {
					console.log(`[Router] ⬅️ Back/forward navigation params:`, routerInstance.currentParams);
				}
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
 * Stores matched params globally in routerInstance for access from any block
 */
function updateRouteVisibility(routerElement, currentPath) {
	console.log('[Router] 🔄 updateRouteVisibility called with currentPath:', currentPath);
	console.log('[Router] 🔄 routerInstance exists:', !!routerInstance);
	console.log('[Router] 🔄 routerInstance.currentParams before update:', routerInstance?.currentParams);

	// Find all route blocks (direct children with data-router-path)
	const routeElements = routerElement.querySelectorAll(':scope > [data-router-path]');
	console.log('[Router] 🔄 Found route elements:', routeElements.length);

	let foundMatch = false;
	let matchedParams = {};

	routeElements.forEach((routeElement) => {
		const routePath = routeElement.getAttribute('data-router-path');
		console.log('[Router] 🔄 Checking route pattern:', routePath);
		const matches = matchPath(currentPath, routePath);
		console.log('[Router] 🔄 Match result for', routePath, ':', matches);

		if (matches && !foundMatch) {
			// Show this route (first match wins)
			routeElement.style.display = '';
			foundMatch = true;
			matchedParams = matches.params;

			// Store matched params in data attribute (legacy support)
			routeElement.dataset.matchedParams = JSON.stringify(matches.params);

			// 🆕 Store params globally for access from any block
			if (routerInstance) {
				routerInstance.currentParams = matches.params;
			}

			// Log dynamic route matches for testing
			if (Object.keys(matches.params).length > 0) {
				console.log(`[Router] 🎯 Dynamic route matched:`, {
					pattern: routePath,
					path: currentPath,
					params: matches.params
				});
			}
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

	// 🆕 Dispatch custom event when route params are ready
	// This allows other blocks to wait for router to finish before reading params
	const routerReadyEvent = new CustomEvent('router:ready', {
		detail: {
			currentPath,
			params: routerInstance?.currentParams || {},
			matchedRoute: foundMatch
		},
		bubbles: true,
		composed: true
	});

	console.log('[Router] 📡 Dispatching router:ready event with params:', routerInstance?.currentParams);
	routerElement.dispatchEvent(routerReadyEvent);
}
