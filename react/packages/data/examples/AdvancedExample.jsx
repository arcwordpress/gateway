import React from 'react';
import {
  GatewayDataProvider,
  CollectionProvider,
  useCollectionInfo,
  useCollectionRecords,
} from '@arcwp/gateway-data';

/**
 * Example: Advanced Usage Patterns
 *
 * Demonstrates:
 * - Multiple collections in one app
 * - Custom API configuration with GatewayDataProvider
 * - Nested providers with different auth
 * - Query parameters for filtering/pagination
 */

// Example 1: Multiple Collections
export function MultiCollectionApp() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <CollectionProvider collectionKey="events">
        <CollectionSection title="Events" />
      </CollectionProvider>

      <CollectionProvider collectionKey="tickets">
        <CollectionSection title="Tickets" />
      </CollectionProvider>
    </div>
  );
}

function CollectionSection({ title }) {
  const { collection, loading: infoLoading } = useCollectionInfo();
  const { records, loading: recordsLoading } = useCollectionRecords();

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px' }}>
      <h2>{title}</h2>

      {infoLoading ? (
        <p>Loading collection info...</p>
      ) : (
        <p>
          <strong>Endpoint:</strong> {collection?.routes?.endpoint}
        </p>
      )}

      {recordsLoading ? (
        <p>Loading records...</p>
      ) : (
        <p>
          <strong>Total Records:</strong> {records.length}
        </p>
      )}

      <ul>
        {records.slice(0, 5).map((record) => (
          <li key={record.id}>{record.title || record.name || record.id}</li>
        ))}
      </ul>
    </div>
  );
}

// Example 2: Custom API Configuration
export function CustomApiConfigApp() {
  return (
    <GatewayDataProvider
      apiUrl="https://custom-api.example.com/wp-json/"
      auth={{ username: 'admin', password: 'secret' }}
    >
      <CollectionProvider collectionKey="events">
        <h2>Using Custom API URL and Auth</h2>
        <EventsList />
      </CollectionProvider>
    </GatewayDataProvider>
  );
}

function EventsList() {
  const { records, loading } = useCollectionRecords();

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {records.map((record) => (
        <li key={record.id}>{record.title}</li>
      ))}
    </ul>
  );
}

// Example 3: Nested Providers with Different Auth
export function MultiAuthApp() {
  return (
    <GatewayDataProvider apiUrl="/wp-json/">
      <h1>Public and Private Collections</h1>

      {/* Public collection - uses default auth (nonce or no auth) */}
      <div>
        <h2>Public Events</h2>
        <CollectionProvider collectionKey="public-events">
          <EventsList />
        </CollectionProvider>
      </div>

      {/* Private collection - uses Basic Auth */}
      <GatewayDataProvider auth={{ username: 'admin', password: 'secret' }}>
        <div>
          <h2>Admin Events (with Basic Auth)</h2>
          <CollectionProvider collectionKey="admin-events">
            <EventsList />
          </CollectionProvider>
        </div>
      </GatewayDataProvider>
    </GatewayDataProvider>
  );
}

// Example 4: Query Parameters for Filtering and Pagination
export function FilteredCollectionApp() {
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState('published');

  return (
    <div>
      <h2>Filtered Events</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
          </select>
        </label>

        <label style={{ marginLeft: '20px' }}>
          Page:
          <input
            type="number"
            value={page}
            onChange={(e) => setPage(parseInt(e.target.value))}
            min="1"
          />
        </label>
      </div>

      <CollectionProvider
        collectionKey="events"
        queryParams={{
          status,
          page,
          per_page: 10,
        }}
      >
        <FilteredEventsList currentPage={page} onPageChange={setPage} />
      </CollectionProvider>
    </div>
  );
}

function FilteredEventsList({ currentPage, onPageChange }) {
  const { records, loading } = useCollectionRecords();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p>Showing {records.length} events</p>

      <ul>
        {records.map((record) => (
          <li key={record.id}>
            {record.title} - {record.status}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>Page {currentPage}</span>
        <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
      </div>
    </div>
  );
}

// Example 5: Manual Loading Control
export function ManualLoadApp() {
  return (
    <CollectionProvider collectionKey="events" autoLoad={false}>
      <ManualLoadComponent />
    </CollectionProvider>
  );
}

function ManualLoadComponent() {
  const { collection, loading: infoLoading } = useCollectionInfo();
  const {
    records,
    loading: recordsLoading,
    refresh,
  } = useCollectionRecords();

  return (
    <div>
      <h2>Manual Load Example</h2>

      {infoLoading ? (
        <p>Loading collection info...</p>
      ) : (
        <p>Collection: {collection?.titlePlural}</p>
      )}

      <button onClick={refresh} disabled={recordsLoading}>
        {recordsLoading ? 'Loading...' : 'Load Events'}
      </button>

      {records.length > 0 && (
        <div>
          <p>Loaded {records.length} events</p>
          <ul>
            {records.map((record) => (
              <li key={record.id}>{record.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Example 6: Error Handling
export function ErrorHandlingApp() {
  return (
    <CollectionProvider collectionKey="invalid-collection">
      <ErrorHandlingComponent />
    </CollectionProvider>
  );
}

function ErrorHandlingComponent() {
  const { collection, loading, error, refresh } = useCollectionInfo();
  const {
    records,
    loading: recordsLoading,
    error: recordsError,
  } = useCollectionRecords();

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>
        <h3>Error Loading Collection</h3>
        <p>{error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  if (recordsError) {
    return (
      <div style={{ color: 'orange', padding: '20px', border: '1px solid orange' }}>
        <h3>Error Loading Records</h3>
        <p>{recordsError}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>{collection?.titlePlural}</h2>
      {recordsLoading ? (
        <p>Loading records...</p>
      ) : (
        <p>{records.length} records loaded</p>
      )}
    </div>
  );
}

export default {
  MultiCollectionApp,
  CustomApiConfigApp,
  MultiAuthApp,
  FilteredCollectionApp,
  ManualLoadApp,
  ErrorHandlingApp,
};
