import { useMemo } from '@wordpress/element';
import { useLocation, useParams } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';

/**
 * Hook to generate breadcrumb segments based on current route
 * Returns an array of breadcrumb objects with { label, path }
 */
export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const { activeExtension, collections } = useActiveExtension();

  return useMemo(() => {
    const segments = [];
    const path = location.pathname;

    console.log('useBreadcrumbs - path:', path);
    console.log('useBreadcrumbs - params:', params);
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
        if (params.collectionKey) {
          // Add Collections segment
          segments.push({
            label: 'Collections',
            path: `/extension/${activeExtension.key}`
          });

          // Find collection title
          const collection = collections?.find(c => c.key === params.collectionKey);
          const collectionLabel = collection?.title || params.collectionKey;

          // Determine which section we're in
          if (path.includes('/fields')) {
            segments.push({
              label: collectionLabel,
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}`
            });
            segments.push({
              label: 'Fields',
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}/fields`
            });
          } else if (path.includes('/forms')) {
            segments.push({
              label: collectionLabel,
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}`
            });
            segments.push({
              label: 'Forms',
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}/forms`
            });
          } else if (path.includes('/grids')) {
            segments.push({
              label: collectionLabel,
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}`
            });
            segments.push({
              label: 'Grids',
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}/grids`
            });
          } else if (path.includes('/relationships')) {
            segments.push({
              label: collectionLabel,
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}`
            });
            segments.push({
              label: 'Relationships',
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}/relationships`
            });
          } else if (path.includes('/collection/')) {
            // Just collection overview
            segments.push({
              label: collectionLabel,
              path: `/extension/${activeExtension.key}/collection/${params.collectionKey}`
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
  }, [location.pathname, params, activeExtension, collections]);
};
