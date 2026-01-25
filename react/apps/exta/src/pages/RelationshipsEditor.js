import { useState, useRef } from '@wordpress/element';
import { useParams } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import CollectionNav from '../components/CollectionNav';

const RelationshipsEditor = () => {
  const { key: extensionKey, collectionKey } = useParams();
  const { activeExtension, collections } = useActiveExtension();
  const [dragState, setDragState] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const containerRef = useRef(null);

  const collection = collections?.find(c => c.key === collectionKey);

  const handleConnectorMouseDown = (e, sourceCollection) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setDragState({
      sourceCollection,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });
  };

  const handleMouseMove = (e) => {
    if (dragState) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragState({
        ...dragState,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = (e, targetCollection) => {
    if (dragState && targetCollection && targetCollection.key !== dragState.sourceCollection.key) {
      // Create a new relationship
      const newRelationship = {
        id: Date.now(),
        from: dragState.sourceCollection.key,
        to: targetCollection.key,
        fromTitle: dragState.sourceCollection.title,
        toTitle: targetCollection.title,
      };
      setRelationships([...relationships, newRelationship]);
    }
    setDragState(null);
  };

  const handleContainerMouseUp = () => {
    setDragState(null);
  };

  const removeRelationship = (id) => {
    setRelationships(relationships.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold !text-slate-200 mb-2">
          {collection?.title || collectionKey}
        </h1>
      </div>

      <CollectionNav extensionKey={extensionKey} collectionKey={collectionKey} />

      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium !text-slate-200 mb-1">Relationship Builder</h2>
            <p className="text-sm !text-slate-400">
              Drag from a collection's connector circle to another collection to create a relationship
            </p>
          </div>
          {relationships.length > 0 && (
            <span className="text-sm !text-slate-400">
              {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
            </span>
          )}
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

        {/* Collections Grid with Drag Canvas */}
        <div
          ref={containerRef}
          className="relative min-h-[400px] bg-neutral-800 rounded-lg p-6"
          onMouseMove={handleMouseMove}
          onMouseUp={handleContainerMouseUp}
          onMouseLeave={handleContainerMouseUp}
        >
          {/* SVG Layer for drawing connection lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {/* Draw existing relationships */}
            {relationships.map((rel) => {
              // This is simplified - in a real implementation, you'd calculate actual positions
              return null; // Will implement proper line drawing later
            })}

            {/* Draw active drag line */}
            {dragState && (
              <line
                x1={dragState.startX}
                y1={dragState.startY}
                x2={dragState.currentX}
                y2={dragState.currentY}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* Collections Grid */}
          <div className="relative grid grid-cols-3 gap-6" style={{ zIndex: 2 }}>
            {collections?.map((col) => (
              <div
                key={col.key}
                className="relative"
                onMouseUp={(e) => handleMouseUp(e, col)}
              >
                {/* Collection Card */}
                <div
                  className={`relative p-4 bg-neutral-700 border-2 rounded-lg transition-all ${
                    dragState?.sourceCollection?.key === col.key
                      ? 'border-slate-400 shadow-lg'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <h3 className="text-sm font-medium !text-slate-200 mb-1">
                    {col.title || col.key}
                  </h3>
                  <p className="text-xs !text-slate-500">
                    {col.fields?.length || 0} field{col.fields?.length !== 1 ? 's' : ''}
                  </p>

                  {/* Connector Circle - Right side */}
                  <div
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-600 border-2 border-slate-400 rounded-full cursor-pointer hover:bg-slate-500 hover:scale-110 transition-all flex items-center justify-center"
                    onMouseDown={(e) => handleConnectorMouseDown(e, col)}
                    style={{ zIndex: 10 }}
                  >
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>

                  {/* Connector Circle - Left side (for incoming connections) */}
                  <div
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-600 border-2 border-slate-400 rounded-full cursor-pointer hover:bg-slate-500 hover:scale-110 transition-all flex items-center justify-center"
                    style={{ zIndex: 10 }}
                  >
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!collections || collections.length === 0 && (
            <div className="text-center py-12">
              <p className="!text-slate-500">No collections available to create relationships.</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-neutral-800 rounded-lg border border-slate-700">
          <h3 className="text-sm font-medium !text-slate-300 mb-2">How to use:</h3>
          <ul className="text-sm !text-slate-400 space-y-1">
            <li>• Click and drag from a collection's connector circle (right side)</li>
            <li>• Drag to another collection and release to create a relationship</li>
            <li>• You can connect any collection to any other collection</li>
            <li>• Remove relationships from the list above</li>
          </ul>
          <p className="text-xs !text-slate-500 mt-3 italic">
            Note: This is a draft interface. Relationship configuration and persistence will be added in future iterations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelationshipsEditor;
