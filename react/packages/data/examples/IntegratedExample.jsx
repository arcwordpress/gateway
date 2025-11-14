import React, { useState } from 'react';
import { CollectionProvider, useCollectionInfo, useCollectionRecords, useRecord } from '@arcwp/gateway-data';
import { Grid } from '@arcwp/gateway-grids';
import { AppForm } from '@arcwp/gateway-forms';

/**
 * Example: Integrated Grid + Form with Shared State
 *
 * This example demonstrates how Forms and Grids can share data through
 * the CollectionProvider. When a record is updated in the form, the grid
 * automatically refreshes to show the changes.
 */

// Main app component wrapping both Grid and Form
export function EventsApp() {
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  return (
    <CollectionProvider collectionKey="events">
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 2 }}>
          <h2>Events Grid</h2>
          <EventsGrid onSelectRecord={setSelectedRecordId} />
        </div>

        <div style={{ flex: 1 }}>
          <h2>Edit Event</h2>
          {selectedRecordId ? (
            <EventForm recordId={selectedRecordId} />
          ) : (
            <p>Select an event to edit</p>
          )}
        </div>
      </div>
    </CollectionProvider>
  );
}

// Grid component using the shared data
function EventsGrid({ onSelectRecord }) {
  const { records, loading, deleteRecord } = useCollectionRecords();
  const { collection } = useCollectionInfo();

  if (loading) return <div>Loading events...</div>;

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteRecord(id);
      // No need to manually refresh - the provider handles it!
    }
  };

  return (
    <div>
      <p>Total events: {records.length}</p>

      {/* Option 1: Use the Grid component from @arcwp/gateway-grids */}
      <Grid
        collectionKey="events"
        onRowClick={(record) => onSelectRecord(record.id)}
      />

      {/* Option 2: Custom table using the data directly */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.title}</td>
              <td>{record.date}</td>
              <td>
                <button onClick={() => onSelectRecord(record.id)}>Edit</button>
                <button onClick={() => handleDelete(record.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Form component using the shared data
function EventForm({ recordId }) {
  const { record, update } = useRecord(recordId);
  const { collection } = useCollectionInfo();

  if (!record) return <div>Loading record...</div>;
  if (!collection) return <div>Loading collection metadata...</div>;

  const handleFieldUpdate = async (fieldName, value) => {
    try {
      await update({ [fieldName]: value });
      // The grid automatically sees the update!
      console.log('Record updated, grid will refresh automatically');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div>
      {/* Option 1: Use AppForm component from @arcwp/gateway-forms */}
      <AppForm
        collectionKey="events"
        recordId={recordId}
        onFieldUpdate={handleFieldUpdate}
      />

      {/* Option 2: Custom form using the data directly */}
      <form>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={record.title || ''}
            onChange={(e) => handleFieldUpdate('title', e.target.value)}
          />
        </div>

        <div>
          <label>Date:</label>
          <input
            type="date"
            value={record.date || ''}
            onChange={(e) => handleFieldUpdate('date', e.target.value)}
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            value={record.description || ''}
            onChange={(e) => handleFieldUpdate('description', e.target.value)}
          />
        </div>
      </form>
    </div>
  );
}

export default EventsApp;
