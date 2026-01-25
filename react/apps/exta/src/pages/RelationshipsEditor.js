import { useState, useRef, useEffect, useCallback } from '@wordpress/element';
import { useParams } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import { collectionApi } from '@arcwp/gateway-data';
import CollectionNav from '../components/CollectionNav';
import axios from 'axios';

// Relationship type definitions with Eloquent-compatible settings
const RELATIONSHIP_TYPES = {
  belongsTo: {
    label: 'Belongs To',
    description: 'This collection belongs to another (e.g., Ticket belongs to TicketStatus)',
    foreignKeyDefault: (targetKey) => `${targetKey}_id`,
    ownerKeyDefault: 'id',
  },
  hasMany: {
    label: 'Has Many',
    description: 'This collection has many of another (e.g., TicketStatus has many Tickets)',
    foreignKeyDefault: (sourceKey) => `${sourceKey}_id`,
    ownerKeyDefault: 'id',
  },
};

const RelationshipsEditor = () => {
  const { key: extensionKey, collectionKey } = useParams();
  const { collections: extensionCollections, refetchCollections } = useActiveExtension();
  const [allCollections, setAllCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [dragState, setDragState] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [nodePositions, setNodePositions] = useState({});
  const [editingRelationship, setEditingRelationship] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const containerRef = useRef(null);
  const nodeRefs = useRef({});

  // Current collection being edited
  const currentCollection = extensionCollections?.find(c => c.key === collectionKey);

  // Load existing relationships from collection data
  useEffect(() => {
    if (currentCollection?.relationships) {
      setRelationships(currentCollection.relationships);
    }
  }, [currentCollection]);

  // Fetch all collections from the registry
  useEffect(() => {
    const fetchAllCollections = async () => {
      setCollectionsLoading(true);
      try {
        const data = await collectionApi.fetchCollections();
        const collectionsArray = Array.isArray(data) ? data : (data?.collections || []);
        setAllCollections(collectionsArray);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
        setAllCollections([]);
      } finally {
        setCollectionsLoading(false);
      }
    };

    fetchAllCollections();
  }, []);

  // Calculate node positions after render
  useEffect(() => {
    if (!containerRef.current) return;

    const updatePositions = () => {
      const containerRect = containerRef.current.getBoundingClientRect();
      const positions = {};

      Object.entries(nodeRefs.current).forEach(([key, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          positions[key] = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
          };
        }
      });

      setNodePositions(positions);
    };

    const timeoutId = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePositions);
    };
  }, [allCollections, collectionsLoading, relationships]);

  const setNodeRef = useCallback((key, element) => {
    nodeRefs.current[key] = element;
  }, []);

  // Save relationships to collection JSON
  const saveRelationships = async (relationshipsToSave) => {
    if (!currentCollection) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const updatedCollection = {
        ...currentCollection,
        relationships: relationshipsToSave,
      };

      const response = await axios({
        method: 'PUT',
        url: `${window.gatewayAdminScript.apiUrl}gateway/v1/extensions/${extensionKey}/collections/${collectionKey}`,
        data: updatedCollection,
        headers: {
          'X-WP-Nonce': window.gatewayAdminScript.nonce,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus(null), 2000);

        // Refresh collections to get updated data
        if (refetchCollections) {
          refetchCollections();
        }
      } else {
        setSaveStatus('error');
        console.error('Failed to save relationships:', response.data.message);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving relationships:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate default method name from target collection
  const generateMethodName = (targetKey, type) => {
    // Convert snake_case to camelCase
    const camelCase = targetKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    if (type === 'hasMany') {
      // Pluralize for hasMany (simple pluralization)
      return camelCase.endsWith('s') ? camelCase : `${camelCase}s`;
    }
    return camelCase;
  };

  const handleConnectorMouseDown = (e, sourceKey) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setDragState({
      sourceKey,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });
  };

  const handleMouseMove = (e) => {
    if (dragState && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragState({
        ...dragState,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top,
      });
    }
  };

  const handleNodeMouseUp = (targetKey) => {
    if (dragState && targetKey && targetKey !== dragState.sourceKey) {
      // Get source and target info
      const sourceCol = allCollections.find(c => c.key === dragState.sourceKey) ||
                        (dragState.sourceKey === collectionKey ? currentCollection : null);
      const targetCol = allCollections.find(c => c.key === targetKey) ||
                        (targetKey === collectionKey ? currentCollection : null);

      // Open editor modal for new relationship
      const newRelationship = {
        id: crypto.randomUUID ? crypto.randomUUID() : `rel-${Date.now()}`,
        source: dragState.sourceKey,
        target: targetKey,
        sourceTitle: sourceCol?.title || dragState.sourceKey,
        targetTitle: targetCol?.title || targetKey,
        type: 'belongsTo',
        methodName: generateMethodName(targetKey, 'belongsTo'),
        foreignKey: RELATIONSHIP_TYPES.belongsTo.foreignKeyDefault(targetKey),
        ownerKey: 'id',
        isNew: true,
      };

      setEditingRelationship(newRelationship);
    }
    setDragState(null);
  };

  const handleContainerMouseUp = () => {
    setDragState(null);
  };

  const handleRelationshipTypeChange = (type) => {
    if (!editingRelationship) return;

    const typeConfig = RELATIONSHIP_TYPES[type];
    const targetKey = editingRelationship.target;
    const sourceKey = editingRelationship.source;

    setEditingRelationship({
      ...editingRelationship,
      type,
      methodName: generateMethodName(targetKey, type),
      foreignKey: type === 'belongsTo'
        ? typeConfig.foreignKeyDefault(targetKey)
        : typeConfig.foreignKeyDefault(sourceKey),
      ownerKey: typeConfig.ownerKeyDefault,
    });
  };

  const handleSaveRelationship = () => {
    if (!editingRelationship) return;

    const { isNew, sourceTitle, targetTitle, ...relationshipData } = editingRelationship;

    let updatedRelationships;
    if (isNew) {
      // Check for duplicates
      const exists = relationships.some(
        r => r.source === relationshipData.source &&
             r.target === relationshipData.target &&
             r.type === relationshipData.type
      );

      if (exists) {
        alert('This relationship already exists.');
        return;
      }

      updatedRelationships = [...relationships, relationshipData];
    } else {
      updatedRelationships = relationships.map(r =>
        r.id === relationshipData.id ? relationshipData : r
      );
    }

    setRelationships(updatedRelationships);
    setEditingRelationship(null);
    setHasUnsavedChanges(true);

    // Auto-save
    saveRelationships(updatedRelationships);
  };

  const handleEditRelationship = (rel) => {
    const sourceCol = allCollections.find(c => c.key === rel.source) || currentCollection;
    const targetCol = allCollections.find(c => c.key === rel.target);

    setEditingRelationship({
      ...rel,
      sourceTitle: sourceCol?.title || rel.source,
      targetTitle: targetCol?.title || rel.target,
      isNew: false,
    });
  };

  const handleDeleteRelationship = (id) => {
    const updatedRelationships = relationships.filter(r => r.id !== id);
    setRelationships(updatedRelationships);
    setHasUnsavedChanges(true);
    saveRelationships(updatedRelationships);
  };

  // Get edge point on a node for drawing lines
  const getEdgePoint = (fromPos, toPos) => {
    if (!fromPos || !toPos) return null;

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const angle = Math.atan2(dy, dx);

    const radius = Math.min(fromPos.width, fromPos.height) / 2 + 4;

    return {
      x: fromPos.x + Math.cos(angle) * radius,
      y: fromPos.y + Math.sin(angle) * radius,
    };
  };

  // Filter out the current collection from the target list
  const targetCollections = allCollections.filter(c => c.key !== collectionKey);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold !text-slate-200 mb-2">
            {currentCollection?.title || collectionKey}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="text-sm !text-slate-500">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm !text-green-500">✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm !text-red-500">✕ Error saving</span>
          )}
        </div>
      </div>

      <CollectionNav extensionKey={extensionKey} collectionKey={collectionKey} />

      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium !text-slate-200 mb-1">Relationship Builder</h2>
            <p className="text-sm !text-slate-400">
              Drag from the current collection to connect with other collections
            </p>
          </div>
          <div className="flex items-center gap-4">
            {collectionsLoading && (
              <span className="text-sm !text-slate-500">Loading collections...</span>
            )}
            {!collectionsLoading && (
              <span className="text-sm !text-slate-400">
                {targetCollections.length} collection{targetCollections.length !== 1 ? 's' : ''} available
              </span>
            )}
            {relationships.length > 0 && (
              <span className="text-sm !text-blue-400 font-medium">
                {relationships.length} relationship{relationships.length !== 1 ? 's' : ''} defined
              </span>
            )}
          </div>
        </div>

        {/* Relationship List */}
        {relationships.length > 0 && (
          <div className="mb-6 p-4 bg-neutral-800 rounded-lg">
            <h3 className="text-sm font-medium !text-slate-300 mb-3">Defined Relationships</h3>
            <div className="space-y-2">
              {relationships.map((rel) => {
                const sourceCol = allCollections.find(c => c.key === rel.source) || currentCollection;
                const targetCol = allCollections.find(c => c.key === rel.target);
                const typeInfo = RELATIONSHIP_TYPES[rel.type];

                return (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-3 bg-neutral-700 rounded text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                        {typeInfo?.label || rel.type}
                      </span>
                      <span className="!text-slate-300">
                        <span className="!text-slate-200 font-medium">{sourceCol?.title || rel.source}</span>
                        {' → '}
                        <span className="!text-slate-200 font-medium">{targetCol?.title || rel.target}</span>
                      </span>
                      <span className="!text-slate-500 text-xs">
                        {rel.methodName}()
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditRelationship(rel)}
                        className="px-2 py-1 !text-slate-400 hover:!text-slate-200 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRelationship(rel.id)}
                        className="px-2 py-1 !text-red-400 hover:!text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Relationship Canvas */}
        <div
          ref={containerRef}
          className="relative min-h-[500px] bg-neutral-800 rounded-lg p-8"
          onMouseMove={handleMouseMove}
          onMouseUp={handleContainerMouseUp}
          onMouseLeave={handleContainerMouseUp}
        >
          {/* SVG Layer for connection lines */}
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ zIndex: 1 }}
            width="100%"
            height="100%"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
              <marker
                id="arrowhead-green"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
              </marker>
            </defs>

            {/* Draw existing relationships */}
            {relationships.map((rel) => {
              const fromPos = nodePositions[rel.source];
              const toPos = nodePositions[rel.target];

              if (!fromPos || !toPos) return null;

              const startPoint = getEdgePoint(fromPos, toPos);
              const endPoint = getEdgePoint(toPos, fromPos);

              if (!startPoint || !endPoint) return null;

              return (
                <line
                  key={rel.id}
                  x1={startPoint.x}
                  y1={startPoint.y}
                  x2={endPoint.x}
                  y2={endPoint.y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}

            {/* Draw active drag line */}
            {dragState && (
              <line
                x1={dragState.startX}
                y1={dragState.startY}
                x2={dragState.currentX}
                y2={dragState.currentY}
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* Current Collection - Center Node */}
          <div className="flex justify-center mb-12" style={{ zIndex: 2, position: 'relative' }}>
            <div
              ref={(el) => setNodeRef(collectionKey, el)}
              className={`relative flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 transition-all cursor-pointer ${
                dragState?.sourceKey === collectionKey
                  ? 'bg-blue-900 border-blue-400 shadow-lg shadow-blue-500/30'
                  : 'bg-neutral-700 border-slate-400 hover:border-slate-300'
              }`}
              onMouseDown={(e) => handleConnectorMouseDown(e, collectionKey)}
              onMouseUp={() => handleNodeMouseUp(collectionKey)}
            >
              <span className="text-sm font-medium !text-slate-200 text-center px-2">
                {currentCollection?.title || collectionKey}
              </span>
              <span className="text-xs !text-slate-400 mt-1">Current</span>

              <div className="absolute -bottom-6 text-xs !text-slate-500">
                Drag to connect
              </div>
            </div>
          </div>

          {/* Target Collections Grid */}
          {collectionsLoading ? (
            <div className="text-center py-12">
              <p className="!text-slate-500">Loading collections from registry...</p>
            </div>
          ) : targetCollections.length === 0 ? (
            <div className="text-center py-12">
              <p className="!text-slate-500">No other collections found in the registry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" style={{ zIndex: 2, position: 'relative' }}>
              {targetCollections.map((col) => {
                const isConnected = relationships.some(
                  r => r.source === col.key || r.target === col.key
                );
                const isDragTarget = dragState && dragState.sourceKey !== col.key;

                return (
                  <div
                    key={col.key}
                    ref={(el) => setNodeRef(col.key, el)}
                    className={`relative flex flex-col items-center justify-center p-4 min-h-[100px] rounded-xl border-2 transition-all cursor-pointer ${
                      isConnected
                        ? 'bg-blue-900/30 border-blue-500'
                        : isDragTarget
                        ? 'bg-blue-900/20 border-blue-400 hover:bg-blue-900/40'
                        : 'bg-neutral-700 border-slate-600 hover:border-slate-400'
                    }`}
                    onMouseUp={() => handleNodeMouseUp(col.key)}
                    onMouseDown={(e) => handleConnectorMouseDown(e, col.key)}
                  >
                    <span className="text-sm font-medium !text-slate-200 text-center">
                      {col.title || col.key}
                    </span>
                    <span className="text-xs !text-slate-500 mt-1">{col.key}</span>
                    {isConnected && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-neutral-800 rounded-lg border border-slate-700">
          <h3 className="text-sm font-medium !text-slate-300 mb-2">How to use:</h3>
          <ul className="text-sm !text-slate-400 space-y-1">
            <li>• Click and drag from the current collection to create a relationship</li>
            <li>• Configure the relationship type (belongsTo, hasMany) in the dialog</li>
            <li>• Relationships are automatically saved to the collection JSON</li>
            <li>• These will generate Eloquent relationship methods in your PHP collection class</li>
          </ul>
        </div>
      </div>

      {/* Relationship Editor Modal */}
      {editingRelationship && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setEditingRelationship(null)}
        >
          <div
            className="bg-neutral-900 rounded-lg p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="!text-lg font-medium !text-slate-200">
                {editingRelationship.isNew ? 'Create Relationship' : 'Edit Relationship'}
              </h2>
              <button
                onClick={() => setEditingRelationship(null)}
                className="p-2 !text-slate-400 hover:!text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Relationship Direction */}
              <div className="p-4 bg-neutral-800 rounded-lg">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="!text-slate-200 font-medium">{editingRelationship.sourceTitle}</span>
                  <span className="!text-slate-400">→</span>
                  <span className="!text-slate-200 font-medium">{editingRelationship.targetTitle}</span>
                </div>
              </div>

              {/* Relationship Type */}
              <div>
                <label className="block text-sm font-medium !text-slate-400 mb-3">
                  Relationship Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(RELATIONSHIP_TYPES).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => handleRelationshipTypeChange(type)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        editingRelationship.type === type
                          ? 'bg-blue-900/50 border-blue-500'
                          : 'bg-neutral-800 border-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <div className="font-medium !text-slate-200 mb-1">{config.label}</div>
                      <div className="text-xs !text-slate-400">{config.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Name */}
              <div>
                <label className="block text-sm font-medium !text-slate-400 mb-2">
                  Method Name
                </label>
                <input
                  type="text"
                  value={editingRelationship.methodName}
                  onChange={(e) => setEditingRelationship({
                    ...editingRelationship,
                    methodName: e.target.value,
                  })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., status, tickets"
                />
                <p className="mt-1 text-xs !text-slate-500">
                  The method name to call this relationship (e.g., $ticket-&gt;{editingRelationship.methodName}())
                </p>
              </div>

              {/* Foreign Key */}
              <div>
                <label className="block text-sm font-medium !text-slate-400 mb-2">
                  Foreign Key
                </label>
                <input
                  type="text"
                  value={editingRelationship.foreignKey}
                  onChange={(e) => setEditingRelationship({
                    ...editingRelationship,
                    foreignKey: e.target.value,
                  })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ticket_status_id"
                />
                <p className="mt-1 text-xs !text-slate-500">
                  The column that references the related model
                </p>
              </div>

              {/* Owner Key */}
              <div>
                <label className="block text-sm font-medium !text-slate-400 mb-2">
                  Owner Key
                </label>
                <input
                  type="text"
                  value={editingRelationship.ownerKey}
                  onChange={(e) => setEditingRelationship({
                    ...editingRelationship,
                    ownerKey: e.target.value,
                  })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., id"
                />
                <p className="mt-1 text-xs !text-slate-500">
                  The column on the related model (usually "id")
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-neutral-800 rounded-lg">
                <div className="text-xs font-medium !text-slate-400 mb-2">Generated Code Preview</div>
                <pre className="text-sm !text-green-400 font-mono">
{`public function ${editingRelationship.methodName}()
{
    return $this->${editingRelationship.type}(
        ${editingRelationship.target}::class,
        '${editingRelationship.foreignKey}',
        '${editingRelationship.ownerKey}'
    );
}`}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingRelationship(null)}
                  className="px-4 py-2 bg-neutral-700 !text-slate-300 rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRelationship}
                  className="px-4 py-2 bg-blue-600 !text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  {editingRelationship.isNew ? 'Create Relationship' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipsEditor;
