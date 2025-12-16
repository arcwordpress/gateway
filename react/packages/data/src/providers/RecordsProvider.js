import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import RecordsContext from '../contexts/RecordsContext';
import * as api from '../services/collectionApi';

/**
 * RecordsProvider - Lightweight provider for collection records without metadata
 *
 * Use this for public forms, read-only displays, or when you don't need
 * collection metadata (fields, filters, etc). Skips authentication checks
 * for collection info.
 *
 * @param {Object} props
 * @param {string} props.route - Full route path (e.g., 'gateway/v1/events')
 * @param {Object} props.queryParams - Optional query parameters for fetching records
 * @param {boolean} props.autoLoad - Whether to automatically load records (default: true)
 * @param {React.ReactNode} props.children - Child components
 */
export const RecordsProvider = ({
  route,
  queryParams = {},
  autoLoad = true,
  children,
}) => {
  const initialLoadDone = useRef(false);
  
  // Stabilize queryParams to prevent unnecessary re-renders
  const stableQueryParams = useMemo(() => queryParams, [JSON.stringify(queryParams)]);

  // Parse route into namespace and path
  const routeInfo = useMemo(() => {
    if (!route) return null;
    
    // Split route like 'gateway/v1/events' into namespace and path
    const parts = route.split('/');
    if (parts.length < 3) {
      console.error('Invalid route format. Expected format: "namespace/version/path" (e.g., "gateway/v1/events")');
      return null;
    }
    
    // Take first two parts as namespace, rest as route path
    const namespace = `${parts[0]}/${parts[1]}`;
    const routePath = parts.slice(2).join('/');
    
    return { namespace, route: routePath };
  }, [route]);

  // Records state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch collection records
   */
  const fetchRecords = useCallback(async () => {
    if (!routeInfo?.namespace || !routeInfo?.route) {
      setError('Invalid route format');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchRecords(
        routeInfo.namespace,
        routeInfo.route,
        stableQueryParams
      );
      // Extract items array from response: {data: {items: []}}
      const items = data?.data?.items || data?.items || data || [];
      setRecords(items);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [routeInfo?.namespace, routeInfo?.route, stableQueryParams]);

  /**
   * Create a new record
   */
  const createRecord = useCallback(
    async (data) => {
      if (!routeInfo?.namespace || !routeInfo?.route) {
        throw new Error('Route info not available');
      }

      try {
        const newRecord = await api.createRecord(
          routeInfo.namespace,
          routeInfo.route,
          data
        );

        // Optimistically add to records
        setRecords((prev) => [...prev, newRecord]);

        // Refresh to ensure consistency
        await fetchRecords();

        return newRecord;
      } catch (err) {
        console.error('Error creating record:', err);
        throw err;
      }
    },
    [routeInfo, fetchRecords]
  );

  /**
   * Get a record by ID from the current records
   */
  const getRecordById = useCallback(
    (id) => {
      // Ensure records is an array
      const recordsArray = Array.isArray(records) ? records : [];
      return recordsArray.find((record) => record.id === id) || null;
    },
    [records]
  );

  /**
   * Refresh records manually
   */
  const refresh = useCallback(async () => {
    await fetchRecords();
  }, [fetchRecords]);

  // Auto-load records when route is available
  useEffect(() => {
    if (autoLoad && routeInfo && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchRecords();
    }
  }, [autoLoad, routeInfo, fetchRecords]);

  // Reset initial load flag when route changes
  useEffect(() => {
    initialLoadDone.current = false;
  }, [route]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      records,
      loading,
      error,
      refresh,
      createRecord,
      getRecordById,
    }),
    [
      records,
      loading,
      error,
      refresh,
      createRecord,
      getRecordById,
    ]
  );

  return (
    <RecordsContext.Provider value={value}>
      {children}
    </RecordsContext.Provider>
  );
};

export default RecordsProvider;
