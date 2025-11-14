import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
 * @param {Object} props.queryParams - Optional query parameters for fetching records
 * @param {boolean} props.autoLoad - Whether to automatically load records (default: true)
 * @param {React.ReactNode} props.children - Child components
 */
export const CollectionProvider = ({
  collectionKey,
  queryParams = {},
  autoLoad = true,
  children,
}) => {
  // Collection metadata state
  const [collection, setCollection] = useState(null);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [collectionError, setCollectionError] = useState(null);

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
    if (!collection?.routes?.namespace || !collection?.routes?.route) {
      // Don't fetch records until we have collection metadata
      return;
    }

    try {
      setRecordsLoading(true);
      setRecordsError(null);
      const data = await api.fetchRecords(
        collection.routes.namespace,
        collection.routes.route,
        queryParams
      );
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecordsError(error.message || 'Failed to fetch records');
    } finally {
      setRecordsLoading(false);
    }
  }, [collection, queryParams]);

  /**
   * Create a new record
   */
  const createRecord = useCallback(
    async (data) => {
      if (!collection?.routes?.namespace || !collection?.routes?.route) {
        throw new Error('Collection not loaded');
      }

      try {
        const newRecord = await api.createRecord(
          collection.routes.namespace,
          collection.routes.route,
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
    [collection, fetchCollectionRecords]
  );

  /**
   * Update an existing record
   */
  const updateRecord = useCallback(
    async (id, data) => {
      if (!collection?.routes?.namespace || !collection?.routes?.route) {
        throw new Error('Collection not loaded');
      }

      try {
        const updatedRecord = await api.updateRecord(
          collection.routes.namespace,
          collection.routes.route,
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
    [collection, fetchCollectionRecords]
  );

  /**
   * Delete a record
   */
  const deleteRecord = useCallback(
    async (id) => {
      if (!collection?.routes?.namespace || !collection?.routes?.route) {
        throw new Error('Collection not loaded');
      }

      try {
        await api.deleteRecord(
          collection.routes.namespace,
          collection.routes.route,
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
    [collection, fetchCollectionRecords]
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

  // Initial load - fetch collection metadata
  useEffect(() => {
    fetchCollectionInfo();
  }, [fetchCollectionInfo]);

  // Auto-load records when collection is ready
  useEffect(() => {
    if (autoLoad && collection && !collectionLoading) {
      fetchCollectionRecords();
    }
  }, [autoLoad, collection, collectionLoading, fetchCollectionRecords]);

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
