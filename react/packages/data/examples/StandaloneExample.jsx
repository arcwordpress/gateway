import React, { useState } from 'react';
import {
  CollectionProvider,
  useCollectionInfo,
  useCollectionRecords,
  useRecord,
} from '@arcwp/gateway-data';

/**
 * Example: Standalone Usage Without Forms or Grids
 *
 * This example shows how to use the data package directly without
 * the Forms or Grids packages. Perfect for custom implementations.
 */

export function EventsDashboard() {
  return (
    <CollectionProvider collectionKey="events">
      <div>
        <CollectionMetadata />
        <EventsList />
        <CreateEventForm />
      </div>
    </CollectionProvider>
  );
}

// Display collection metadata
function CollectionMetadata() {
  const { collection, loading } = useCollectionInfo();

  if (loading) return <div>Loading metadata...</div>;
  if (!collection) return null;

  return (
    <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
      <h3>{collection.titlePlural || 'Events'}</h3>
      <p>
        <strong>Collection Key:</strong> {collection.key}
      </p>
      <p>
        <strong>Endpoint:</strong> {collection.routes?.endpoint}
      </p>
      <p>
        <strong>Fields:</strong> {Object.keys(collection.fields || {}).join(', ')}
      </p>
    </div>
  );
}

// List all events with CRUD operations
function EventsList() {
  const { records, loading, deleteRecord } = useCollectionRecords();
  const [editingId, setEditingId] = useState(null);

  if (loading) return <div>Loading events...</div>;

  const handleDelete = async (id) => {
    if (confirm('Delete this event?')) {
      try {
        await deleteRecord(id);
        alert('Event deleted!');
      } catch (error) {
        alert('Delete failed: ' + error.message);
      }
    }
  };

  return (
    <div>
      <h3>Events ({records.length})</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {records.map((record) =>
          editingId === record.id ? (
            <EditEventInline
              key={record.id}
              recordId={record.id}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={record.id}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '4px',
              }}
            >
              <h4>{record.title}</h4>
              <p>
                <strong>Date:</strong> {record.date}
              </p>
              <p>{record.description}</p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setEditingId(record.id)}>Edit</button>
                <button onClick={() => handleDelete(record.id)}>Delete</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Inline edit component
function EditEventInline({ recordId, onCancel }) {
  const { record, update, loading } = useRecord(recordId);
  const [formData, setFormData] = useState(record || {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await update(formData);
      alert('Event updated!');
      onCancel();
    } catch (error) {
      alert('Update failed: ' + error.message);
    }
  };

  if (loading || !record) return <div>Loading...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: '2px solid #007bff',
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Title:</strong>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            style={{ width: '100%', marginTop: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Date:</strong>
          <input
            type="date"
            value={formData.date || ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={{ width: '100%', marginTop: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Description:</strong>
          <textarea
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            style={{ width: '100%', marginTop: '5px', minHeight: '80px' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// Create new event form
function CreateEventForm() {
  const { createRecord } = useCollectionRecords();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRecord(formData);
      alert('Event created!');
      setFormData({ title: '', date: '', description: '' });
      setIsOpen(false);
    } catch (error) {
      alert('Create failed: ' + error.message);
    }
  };

  if (!isOpen) {
    return (
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => setIsOpen(true)}>+ Create New Event</button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px' }}>
      <h3>Create New Event</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Title:
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              style={{ width: '100%', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Date:
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              style={{ width: '100%', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Description:
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={{ width: '100%', marginTop: '5px', minHeight: '80px' }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">Create Event</button>
          <button type="button" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventsDashboard;
