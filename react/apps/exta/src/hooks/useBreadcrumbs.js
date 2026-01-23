import { useMemo } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';

/**
 * Hook to generate breadcrumb segments based on current route
 * Returns an array of breadcrumb objects with { label, path }
 */
export const useBreadcrumbs = () => {
  const location = useLocation();
  const { activeExtension, collections } = useActiveExtension();

  return useMemo(() => {
    const segments = [];
    const path = location.pathname;

    // Parse route parameters from pathname since Breadcrumbs is outside <Routes>
    const pathMatch = path.match(/\/extension\/([^/]+)(?:\/collection\/([^/]+)(?:\/([^/]+))?)?/);
    const extensionKey = pathMatch?.[1];
    const collectionKey = pathMatch?.[2];
    const section = pathMatch?.[3]; // fields, forms, grids, relationships

    console.log('useBreadcrumbs - path:', path);
    console.log('useBreadcrumbs - parsed:', { extensionKey, collectionKey, section });
    console.log('useBreadcrumbs - activeExtension:', activeExtension);
    console.log('useBreadcrumbs - collections:', collections);

    // Always start with Dashboard
    segments.push({ label: 'Dashboard', path: '/' });

    // Check if we're on an extension route
    if (location.pathname.includes('/extension/')) {
      // Add Extensions segment
      segments.push({ label: 'Extensions', path: '/' });

      // Add Extension Title if we have active extension
      if (activeExtension) {
        segments.push({
          label: activeExtension.title || activeExtension.key,
          path: `/extension/${activeExtension.key}`
        });

        // Check if we're on a collection route
        if (collectionKey) {
          // Add Collections segment
          segments.push({
            label: 'Collections',
            path: `/extension/${activeExtension.key}`
          });

          // Find collection title
          const collection = collections?.find(c => c.key === collectionKey);
          const collectionLabel = collection?.title || collectionKey;

          // Add collection name segment
          segments.push({
            label: collectionLabel,
            path: `/extension/${activeExtension.key}/collection/${collectionKey}`
          });

          // Add section segment if present
          if (section === 'fields') {
            segments.push({
              label: 'Fields',
              path: `/extension/${activeExtension.key}/collection/${collectionKey}/fields`
            });
          } else if (section === 'forms') {
            segments.push({
              label: 'Forms',
              path: `/extension/${activeExtension.key}/collection/${collectionKey}/forms`
            });
          } else if (section === 'grids') {
            segments.push({
              label: 'Grids',
              path: `/extension/${activeExtension.key}/collection/${collectionKey}/grids`
            });
          } else if (section === 'relationships') {
            segments.push({
              label: 'Relationships',
              path: `/extension/${activeExtension.key}/collection/${collectionKey}/relationships`
            });
          }
        } else if (path.includes('/collection/create')) {
          segments.push({
            label: 'Collections',
            path: `/extension/${activeExtension.key}`
          });
          segments.push({
            label: 'Create Collection',
            path: `/extension/${activeExtension.key}/collection/create`
          });
        }
      } else if (path.includes('/create')) {
        segments.push({
          label: 'Create Extension',
          path: '/extension/create'
        });
      }
    } else if (location.pathname === '/settings') {
      segments.push({ label: 'Settings', path: '/settings' });
    }

    return segments;
  }, [location.pathname, activeExtension, collections]);
};
