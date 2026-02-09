/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * Match a route path pattern against a URL pathname.
 * Supports React Router-style syntax:
 *   /users        → exact match
 *   /users/:id    → named parameter
 *   /files/*      → wildcard / splat
 *   /docs/:id?    → optional parameter
 *
 * @param {string} pattern - Route pattern (e.g. "/users/:id")
 * @param {string} pathname - Actual URL path to test
 * @return {{ match: boolean, params: Object }} Result with match flag and extracted params
 */
function matchPath( pattern, pathname ) {
	// Normalize both to comparable form
	const normPattern = '/' + pattern.replace( /^\/|\/$/g, '' );
	const normPath = '/' + pathname.replace( /^\/|\/$/g, '' );

	// Exact match shortcut
	if ( normPattern === normPath ) {
		return { match: true, params: {} };
	}

	// Root catch-all
	if ( pattern === '*' ) {
		return { match: true, params: { '*': pathname } };
	}

	const patternSegments = normPattern.split( '/' ).filter( Boolean );
	const pathSegments = normPath.split( '/' ).filter( Boolean );

	// Handle root path
	if ( patternSegments.length === 0 && pathSegments.length === 0 ) {
		return { match: true, params: {} };
	}
	if ( patternSegments.length === 0 && pathSegments.length > 0 ) {
		return { match: false, params: {} };
	}

	const params = {};

	for ( let i = 0; i < patternSegments.length; i++ ) {
		const pat = patternSegments[ i ];

		// Wildcard / splat — matches rest of the path
		if ( pat === '*' ) {
			params[ '*' ] = pathSegments.slice( i ).join( '/' );
			return { match: true, params };
		}

		// Optional parameter — :name?
		if ( pat.startsWith( ':' ) && pat.endsWith( '?' ) ) {
			const paramName = pat.slice( 1, -1 );
			params[ paramName ] = pathSegments[ i ]
				? decodeURIComponent( pathSegments[ i ] )
				: undefined;
			continue;
		}

		// Required parameter — :name
		if ( pat.startsWith( ':' ) ) {
			if ( i >= pathSegments.length ) {
				return { match: false, params: {} };
			}
			params[ pat.slice( 1 ) ] = decodeURIComponent( pathSegments[ i ] );
			continue;
		}

		// Literal segment
		if ( i >= pathSegments.length || pat !== pathSegments[ i ] ) {
			return { match: false, params: {} };
		}
	}

	// If path has more segments than pattern, no match (unless last was splat)
	if ( pathSegments.length > patternSegments.length ) {
		return { match: false, params: {} };
	}

	return { match: true, params };
}

/**
 * Rank a pattern for specificity so the best match wins.
 *   literal segment  → 3
 *   :param           → 2
 *   :param?          → 1
 *   *                → 0
 */
function rankPattern( pattern ) {
	if ( pattern === '*' ) {
		return 0;
	}
	return pattern
		.replace( /^\/|\/$/g, '' )
		.split( '/' )
		.filter( Boolean )
		.reduce( ( score, seg ) => {
			if ( seg === '*' ) return score;
			if ( seg.startsWith( ':' ) && seg.endsWith( '?' ) ) return score + 1;
			if ( seg.startsWith( ':' ) ) return score + 2;
			return score + 3;
		}, 0 );
}

/**
 * Get the current routing path from the URL hash.
 * Uses hash-based routing (#/path) so it works on any WordPress page
 * without server-side rewrite rules.
 */
function getCurrentPath() {
	const hash = window.location.hash.replace( /^#/, '' );
	return hash || '/';
}

/**
 * Update which route elements are visible based on the current path.
 * Shows the best matching route and hides all others.
 *
 * @param {Element} routerEl - The router container element
 * @param {string} currentPath - The current route path
 * @return {{ params: Object, pattern: string }|null} The matched route info or null
 */
function updateRouteVisibility( routerEl, currentPath ) {
	const routes = routerEl.querySelectorAll( '[data-router-path]' );
	let bestMatch = null;
	let bestRank = -1;
	let bestEl = null;

	routes.forEach( ( routeEl ) => {
		const pattern = routeEl.getAttribute( 'data-router-path' );
		if ( ! pattern ) return;

		const result = matchPath( pattern, currentPath );
		if ( result.match ) {
			const rank = rankPattern( pattern );
			if ( rank > bestRank ) {
				bestRank = rank;
				bestMatch = result;
				bestEl = routeEl;
			}
		}
	} );

	// Hide all routes, then show the match
	routes.forEach( ( routeEl ) => {
		routeEl.setAttribute( 'data-route-active', 'false' );
	} );

	if ( bestEl ) {
		bestEl.setAttribute( 'data-route-active', 'true' );
	}

	return bestMatch
		? { params: bestMatch.params, pattern: bestEl.getAttribute( 'data-router-path' ) }
		: null;
}

/**
 * Gateway Router Store
 *
 * Client-side routing using the WordPress Interactivity API.
 * Route patterns follow React Router conventions:
 *   path="/"             exact match
 *   path="/users/:id"    named parameter
 *   path="/files/*"      wildcard splat
 *   path="/docs/:slug?"  optional parameter
 *
 * Navigation is hash-based (#/path) so it works on any WordPress page.
 * Links inside the router with href="#/..." are automatically intercepted.
 */
store( 'gateway/router', {
	state: {
		get currentRoute() {
			const context = getContext();
			return context.route || '/';
		},

		get params() {
			const context = getContext();
			return context.params || {};
		},

		get matchedPattern() {
			const context = getContext();
			return context.matchedPattern || '';
		},
	},

	actions: {
		/**
		 * Navigate to a route. Usable from interactivity directives:
		 *   data-wp-on--click="actions.navigate"
		 * Reads the target path from:
		 *   1. The nearest <a href="#/path"> ancestor
		 *   2. context.navigateTo
		 */
		navigate( event ) {
			event?.preventDefault?.();

			let path;

			if ( event?.target ) {
				const link = event.target.closest( 'a[href]' );
				if ( link ) {
					const href = link.getAttribute( 'href' );
					if ( href.startsWith( '#' ) ) {
						path = href.slice( 1 ) || '/';
					}
				}
			}

			if ( ! path ) {
				const context = getContext();
				path = context.navigateTo || '/';
			}

			window.location.hash = '#' + path;
		},
	},

	callbacks: {
		/**
		 * Initialize the router on mount.
		 * Sets up hash-change listening, initial route matching,
		 * and link-click interception.
		 */
		init() {
			const context = getContext();
			const element = getElement();
			const routerEl = element.ref;

			if ( ! routerEl ) return;

			// Determine the initial path
			const hashPath = getCurrentPath();
			const initialPath =
				hashPath !== '/'
					? hashPath
					: context.defaultRoute || '/';

			// Set the hash if it wasn't already present
			if ( ! window.location.hash ) {
				window.location.hash = '#' + initialPath;
			}

			context.route = initialPath;
			context.params = {};
			context.matchedPattern = '';

			// Initial route match
			const initialMatch = updateRouteVisibility( routerEl, initialPath );
			if ( initialMatch ) {
				context.params = initialMatch.params;
				context.matchedPattern = initialMatch.pattern;
			}

			// Listen for hash changes
			window.addEventListener( 'hashchange', () => {
				const path = getCurrentPath();
				context.route = path;

				const matched = updateRouteVisibility( routerEl, path );
				if ( matched ) {
					context.params = matched.params;
					context.matchedPattern = matched.pattern;
				} else {
					context.params = {};
					context.matchedPattern = '';
				}
			} );

			// Intercept clicks on route links within this router
			routerEl.addEventListener( 'click', ( event ) => {
				const link = event.target.closest(
					'a[href^="#/"], a[data-route]'
				);
				if ( ! link ) return;

				event.preventDefault();

				const path = link.hasAttribute( 'data-route' )
					? link.getAttribute( 'data-route' )
					: link.getAttribute( 'href' ).slice( 1 );

				window.location.hash = '#' + ( path || '/' );
			} );
		},
	},
} );
