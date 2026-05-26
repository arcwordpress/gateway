import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CollectionContext from '../contexts/CollectionContext';
import * as api from '../services/collectionApi';

/**
 * CollectionProvider - Main provider for a specific collection
 *
 * Manages both collection metadata and records in a unified state.
 * Provides CRUD operations that automatically refresh the records state.
 *
 * @param {Object} props
 * @param {string} props.collectionKey - Collection key (e.g., 'events')
 * @param {Object} props.directAccess - Optional direct route info to skip metadata fetch: { namespace, route }
 * @param {boolean} props.skipMetadata - Skip fetching collection metadata (default: false)
 * @param {Object} props.queryParams - Optional query parameters for fetching records
 * @param {boolean} props.autoLoad - Whether to automatically load records (default: true)
 * @param {React.ReactNode} props.children - Child components
 */
export const CollectionProvider = ({
  collectionKey,
  directAccess,
  skipMetadata = false,
  queryParams = {},
  autoLoad = true,
  children,
}) => {
  // Use ref to track if initial load has occurred
  const initialLoadDone = useRef(false);

  // Collection metadata state — declared before routeInfo so the useMemo
  // dependency array sees the current value, not the hoisted undefined.
  const [collection, setCollection] = useState(null);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [collectionError, setCollectionError] = useState(null);

  // Stabilize queryParams to prevent unnecessary re-renders
  const stableQueryParams = useMemo(() => queryParams, [JSON.stringify(queryParams)]);

  // Determine route info from either directAccess or collection metadata
  const routeInfo = useMemo(() => {
    if (directAccess?.namespace && directAccess?.route) {
      return {
        namespace: directAccess.namespace,
        route: directAccess.route
      };
    }
    const getManyRoute = collection?.routes?.find(r => r.type === 'get_many');
    if (getManyRoute) {
      return {
        namespace: getManyRoute.namespace,
        route: getManyRoute.path
      };
    }
    return null;
  }, [directAccess, collection?.routes]);

  // Collection records state
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState(null);

  /**
   * Fetch collection metadata
   */
  const fetchCollectionInfo = useCallback(async () => {
    if (!collectionKey) {
      setCollectionError('Collection key is required');
      setCollectionLoading(false);
      return;
    }

    try {
      setCollectionLoading(true);
      setCollectionError(null);
      const data = await api.fetchCollection(collectionKey);
      setCollection(data);
    } catch (error) {
      console.error('Error fetching collection:', error);
      setCollectionError(error.message || 'Failed to fetch collection');
    } finally {
      setCollectionLoading(false);
    }
  }, [collectionKey]);

  /**
   * Fetch collection records
   */
  const fetchCollectionRecords = useCallback(async () => {
    if (!routeInfo?.namespace || !routeInfo?.route) {
      // Don't fetch records until we have route info (from metadata or directAccess)
      return;
    }

    try {
      setRecordsLoading(true);
      setRecordsError(null);
      const data = await api.fetchRecords(
        routeInfo.namespace,
        routeInfo.route,
        stableQueryParams
      );
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecordsError(error.message || 'Failed to fetch records');
    } finally {
      setRecordsLoading(false);
    }
  }, [routeInfo?.namespace, routeInfo?.route, stableQueryParams]);

  /**
   * Create a new record
   */
  const createRecord = useCallback(
    async (data) => {
      if (!routeInfo?.namespace || !routeInfo?.route) {
        throw new Error('Collection route info not available');
      }

      try {
        const newRecord = await api.createRecord(
          routeInfo.namespace,
          routeInfo.route,
          data
        );

        // Optimistically add to records
        setRecords((prev) => [...prev, newRecord]);

        // Optionally refresh to ensure consistency
        await fetchCollectionRecords();

        return newRecord;
      } catch (error) {
        console.error('Error creating record:', error);
        throw error;
      }
    },
    [routeInfo, fetchCollectionRecords]
  );

  /**
   * Update an existing record
   */
  const updateRecord = useCallback(
    async (id, data) => {
      if (!routeInfo?.namespace || !routeInfo?.route) {
        throw new Error('Collection route info not available');
      }

      try {
        const updatedRecord = await api.updateRecord(
          routeInfo.namespace,
          routeInfo.route,
          id,
          data
        );

        // Optimistically update in records
        setRecords((prev) =>
          prev.map((record) => (record.id === id ? updatedRecord : record))
        );

        // Optionally refresh to ensure consistency
        await fetchCollectionRecords();

        return updatedRecord;
      } catch (error) {
        console.error('Error updating record:', error);
        // Rollback on error by refreshing
        await fetchCollectionRecords();
        throw error;
      }
    },
    [routeInfo, fetchCollectionRecords]
  );

  /**
   * Delete a record
   */
  const deleteRecord = useCallback(
    async (id) => {
      if (!routeInfo?.namespace || !routeInfo?.route) {
        throw new Error('Collection route info not available');
      }

      try {
        await api.deleteRecord(
          routeInfo.namespace,
          routeInfo.route,
          id
        );

        // Optimistically remove from records
        setRecords((prev) => prev.filter((record) => record.id !== id));

        // Optionally refresh to ensure consistency
        await fetchCollectionRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        // Rollback on error by refreshing
        await fetchCollectionRecords();
        throw error;
      }
    },
    [routeInfo, fetchCollectionRecords]
  );

  /**
   * Get a record by ID from the current records
   */
  const getRecordById = useCallback(
    (id) => {
      return records.find((record) => record.id === id) || null;
    },
    [records]
  );

  /**
   * Refresh records manually
   */
  const refreshRecords = useCallback(async () => {
    await fetchCollectionRecords();
  }, [fetchCollectionRecords]);

  /**
   * Refresh collection metadata manually
   */
  const refreshCollection = useCallback(async () => {
    await fetchCollectionInfo();
  }, [fetchCollectionInfo]);

  // Initial load - fetch collection metadata (unless skipped)
  useEffect(() => {
    if (!skipMetadata) {
      fetchCollectionInfo();
    } else {
      // If skipping metadata, mark as not loading
      setCollectionLoading(false);
    }
  }, [skipMetadata, fetchCollectionInfo]);

  // Auto-load records when route info is available
  useEffect(() => {
    if (autoLoad && routeInfo && !collectionLoading && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchCollectionRecords();
    }
  }, [autoLoad, routeInfo, collectionLoading, fetchCollectionRecords]);

  // Reset initial load flag when collectionKey changes
  useEffect(() => {
    initialLoadDone.current = false;
  }, [collectionKey]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // Collection metadata
      collection,
      collectionLoading,
      collectionError,

      // Collection records
      records,
      recordsLoading,
      recordsError,

      // CRUD operations
      createRecord,
      updateRecord,
      deleteRecord,
      refreshRecords,
      refreshCollection,

      // Utility
      getRecordById,
    }),
    [
      collection,
      collectionLoading,
      collectionError,
      records,
      recordsLoading,
      recordsError,
      createRecord,
      updateRecord,
      deleteRecord,
      refreshRecords,
      refreshCollection,
      getRecordById,
    ]
  );

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export default CollectionProvider;
