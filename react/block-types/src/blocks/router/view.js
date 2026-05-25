( function () {
	function initRouter( router ) {
		const defaultPath = router.dataset.gtyDefaultPath || '/';

		function normalisePath( raw ) {
			const s = raw.startsWith( '/' ) ? raw : '/' + raw;
			return s === '/' ? s : s.replace( /\/$/, '' );
		}

		function currentPath() {
			const hash = window.location.hash.slice( 1 );
			return hash ? normalisePath( hash ) : defaultPath;
		}

		function activate( path ) {
			let matched = false;

			router.querySelectorAll( '[data-gty-route]' ).forEach( ( route ) => {
				const active = normalisePath( route.dataset.gtyPath || '/' ) === path;
				if ( active ) matched = true;
				route.hidden = ! active;
			} );

			// Fall back to default path if nothing matched.
			if ( ! matched ) {
				router.querySelectorAll( '[data-gty-route]' ).forEach( ( route ) => {
					route.hidden =
						normalisePath( route.dataset.gtyPath || '/' ) !== defaultPath;
				} );
			}

			// Update nav link active states.
			router.querySelectorAll( '[data-gty-nav-link]' ).forEach( ( link ) => {
				const linkPath = normalisePath( link.dataset.gtyPath || '/' );
				const isActive =
					linkPath === path ||
					( ! matched && linkPath === defaultPath );
				link.classList.toggle( 'is-active', isActive );
				link.setAttribute( 'aria-current', isActive ? 'page' : 'false' );
			} );
		}

		activate( currentPath() );
		window.addEventListener( 'hashchange', () => activate( currentPath() ) );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', () =>
			document.querySelectorAll( '[data-gty-router]' ).forEach( initRouter )
		);
	} else {
		document.querySelectorAll( '[data-gty-router]' ).forEach( initRouter );
	}
} )();
