import { useState, useRef, useEffect, useCallback } from '@wordpress/element';
import { useParams } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import { collectionApi } from '@arcwp/gateway-data';
import CollectionNav from '../components/CollectionNav';

const RelationshipsEditor = () => {
  const { key: extensionKey, collectionKey } = useParams();
  const { collections: extensionCollections } = useActiveExtension();
  const [allCollections, setAllCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [dragState, setDragState] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [nodePositions, setNodePositions] = useState({});
  const containerRef = useRef(null);
  const nodeRefs = useRef({});

  // Current collection being edited
  const currentCollection = extensionCollections?.find(c => c.key === collectionKey);

  // Fetch all collections from the registry
  useEffect(() => {
    const fetchAllCollections = async () => {
      setCollectionsLoading(true);
      try {
        const data = await collectionApi.fetchCollections();
        // Ensure we have an array
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

    // Update positions after a short delay to ensure DOM is rendered
    const timeoutId = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePositions);
    };
  }, [allCollections, collectionsLoading]);

  const setNodeRef = useCallback((key, element) => {
    nodeRefs.current[key] = element;
  }, []);

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
      // Prevent duplicate relationships
      const exists = relationships.some(
        r => (r.from === dragState.sourceKey && r.to === targetKey) ||
             (r.from === targetKey && r.to === dragState.sourceKey)
      );

      if (!exists) {
        const sourceCol = allCollections.find(c => c.key === dragState.sourceKey) ||
                          (dragState.sourceKey === collectionKey ? currentCollection : null);
        const targetCol = allCollections.find(c => c.key === targetKey);

        const newRelationship = {
          id: Date.now(),
          from: dragState.sourceKey,
          to: targetKey,
          fromTitle: sourceCol?.title || dragState.sourceKey,
          toTitle: targetCol?.title || targetKey,
        };
        setRelationships([...relationships, newRelationship]);
      }
    }
    setDragState(null);
  };

  const handleContainerMouseUp = () => {
    setDragState(null);
  };

  const removeRelationship = (id) => {
    setRelationships(relationships.filter(r => r.id !== id));
  };

  // Get edge point on a node for drawing lines
  const getEdgePoint = (fromPos, toPos) => {
    if (!fromPos || !toPos) return null;

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const angle = Math.atan2(dy, dx);

    // Calculate intersection with node edge (approximate as circle)
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
      <div>
        <h1 className="text-2xl font-semibold !text-slate-200 mb-2">
          {currentCollection?.title || collectionKey}
        </h1>
      </div>

      <CollectionNav extensionKey={extensionKey} collectionKey={collectionKey} />

      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium !text-slate-200 mb-1">Relationship Builder</h2>
            <p className="text-sm !text-slate-400">
              Drag from the current collection to connect with other collections in the registry
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
              <span className="text-sm !text-slate-400">
                {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Relationship List */}
        {relationships.length > 0 && (
          <div className="mb-6 p-4 bg-neutral-800 rounded-lg">
            <h3 className="text-sm font-medium !text-slate-300 mb-3">Active Relationships</h3>
            <div className="space-y-2">
              {relationships.map((rel) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3 bg-neutral-700 rounded text-sm"
                >
                  <span className="!text-slate-300">
                    <span className="!text-slate-200 font-medium">{rel.fromTitle}</span>
                    {' → '}
                    <span className="!text-slate-200 font-medium">{rel.toTitle}</span>
                  </span>
                  <button
                    onClick={() => removeRelationship(rel.id)}
                    className="px-2 py-1 !text-red-400 hover:!text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
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
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>

            {/* Draw existing relationships */}
            {relationships.map((rel) => {
              const fromPos = nodePositions[rel.from];
              const toPos = nodePositions[rel.to];

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
                  stroke="#94a3b8"
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

              {/* Drag hint */}
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
                  r => r.from === col.key || r.to === col.key
                );
                const isDragTarget = dragState && dragState.sourceKey !== col.key;

                return (
                  <div
                    key={col.key}
                    ref={(el) => setNodeRef(col.key, el)}
                    className={`relative flex flex-col items-center justify-center p-4 min-h-[100px] rounded-xl border-2 transition-all cursor-pointer ${
                      isConnected
                        ? 'bg-green-900/30 border-green-500'
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
                    {col.package && (
                      <span className="text-xs !text-slate-600 mt-1">{col.package}</span>
                    )}
                    {isConnected && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
            <li>• Click and drag from the current collection circle at the top</li>
            <li>• Release on any target collection to create a relationship</li>
            <li>• You can also drag from any target collection back to create reverse relationships</li>
            <li>• Connected collections are highlighted in green</li>
          </ul>
          <p className="text-xs !text-slate-500 mt-3 italic">
            Note: This is a draft interface. Relationship types and persistence will be added in future iterations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelationshipsEditor;
