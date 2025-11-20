import { useMemo } from '@wordpress/element';
import Board from '@asseinfo/react-kanban';
import { useGridContext } from '../../context/GridContext';
import { updateRecord } from '@arcwp/gateway-data/src/services/collectionApi';

const UNCATEGORIZED_LANE_ID = 'uncategorized';

/**
 * BoardView Component
 * Displays data in a Kanban board layout grouped by a field
 */
const BoardView = ({ 
  data = [], 
  config = {},
  loading = false,
  onView,
}) => {
  const {
    groupByField = 'status',
    lanes: configLanes = [],
    getCardFromRecord,
    renderCard,
    ...boardProps
  } = config;

  // Get namespace and route from context (if available)
  const gridContext = useGridContext();

  // Helper function to extract group ID from record - JUST THE ID
  const getGroupId = (record, field) => {
    const value = record[field];
    
    // If value is null/undefined
    if (value === null || value === undefined) {
      return UNCATEGORIZED_LANE_ID;
    }
    
    // If value is an object (related object), extract ID only
    if (typeof value === 'object') {
      const id = value.id || value.ID || value._id;
      
      if (id !== undefined) {
        return String(id);
      }
      
      console.error(`BoardView: ${field} is an object but has no id:`, value);
      return UNCATEGORIZED_LANE_ID;
    }
    
    // If value is a primitive (string, number, etc.)
    return String(value);
  };

  // Helper function to make a human-readable title from a value
  const makeTitle = (value) => {
    if (!value) {
      return 'Uncategorized';
    }

    // If value is an object, try to get a display name
    if (typeof value === 'object') {
      // Try title first, then name, fallback to id
      const title = value.title || value.name || value.id || value.ID || value._id;
      return String(title);
    }

    // If value is a primitive, use it directly
    return String(value);
  };

  // Infer lanes from data if not provided in config
  const lanes = useMemo(() => {
    if (configLanes && configLanes.length > 0) {
      console.log('BoardView: Using configured lanes:', configLanes);
      return configLanes;
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('BoardView: No lanes configured and no data available to infer lanes from');
      return [];
    }

    console.log('BoardView: No lanes configured, inferring from data...');

    // Extract unique IDs and titles from data
    const uniqueLanes = new Map();
    
    data.forEach(record => {
      if (!record || typeof record !== 'object') return;
      
      const id = getGroupId(record, groupByField);
      if (id !== UNCATEGORIZED_LANE_ID && !uniqueLanes.has(id)) {
        const value = record[groupByField];
        const title = makeTitle(value);
        uniqueLanes.set(id, title);
      }
    });

    const inferredLanes = Array.from(uniqueLanes.entries()).map(([id, title]) => ({
      id: id,
      title: title
    }));

    console.log('BoardView: Inferred lanes from data:', inferredLanes);

    return inferredLanes;
  }, [configLanes, data, groupByField]);

  // Build board model from data
  const boardModel = useMemo(() => {
    // Early validation
    if (!Array.isArray(data)) {
      console.warn('BoardView: data must be an array');
      return { columns: [] };
    }

    if (!Array.isArray(lanes) || lanes.length === 0) {
      console.warn('BoardView: No lanes available (neither configured nor inferred)');
      return { columns: [] };
    }

    if (data.length === 0) {
      return { 
        columns: lanes.map(lane => ({
          id: String(lane.id),
          title: String(lane.title || lane.id),
          cards: []
        }))
      };
    }

    // Group records by ID
    const grouped = data.reduce((acc, record) => {
      if (!record || typeof record !== 'object') {
        console.warn('BoardView: invalid record in data', record);
        return acc;
      }
      
      const groupId = getGroupId(record, groupByField);
      
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(record);
      return acc;
    }, {});

    console.log('BoardView - Grouped data:', {
      groupByField,
      groupKeys: Object.keys(grouped),
      groupCounts: Object.entries(grouped).map(([key, items]) => ({ [key]: items.length })),
    });

    // Build columns structure
    const boardColumns = lanes.map(lane => {
      if (!lane || !lane.id) {
        console.warn('BoardView: invalid lane config', lane);
        return { id: 'invalid', title: 'Invalid', cards: [] };
      }
      
      const laneId = String(lane.id);
      const laneRecords = grouped[laneId] || [];
      
      console.log(`BoardView - Lane "${lane.title}" (id: ${laneId}):`, {
        recordCount: laneRecords.length,
      });
      
      return {
        id: laneId,
        title: String(lane.title || lane.id), // Use title from lane, fallback to id
        cards: Array.isArray(laneRecords) 
          ? laneRecords.map(record => {
              if (getCardFromRecord) {
                return getCardFromRecord(record);
              }
              return {
                id: record.id,
                title: record.title || record.name || `Record ${record.id}`,
                description: record.description || '',
                record,
              };
            })
          : [],
      };
    });

    // Add uncategorized column if there are ungrouped records
    if (grouped[UNCATEGORIZED_LANE_ID] && Array.isArray(grouped[UNCATEGORIZED_LANE_ID]) && grouped[UNCATEGORIZED_LANE_ID].length > 0) {
      boardColumns.push({
        id: UNCATEGORIZED_LANE_ID,
        title: 'Uncategorized',
        cards: grouped[UNCATEGORIZED_LANE_ID].map(record => {
          if (getCardFromRecord) {
            return getCardFromRecord(record);
          }
          return {
            id: record.id,
            title: record.title || record.name || `Record ${record.id}`,
            description: record.description || '',
            record,
          };
        }),
      });
    }

    console.log('BoardView - Final board model:', {
      columnCount: boardColumns.length,
      columns: boardColumns.map(col => ({ id: col.id, title: col.title, cardCount: col.cards.length })),
    });

    return { columns: boardColumns };
  }, [data, groupByField, lanes, getCardFromRecord]);

  // Handle card click to view details
  const handleCardClick = (card) => {
    if (onView && card.record) {
      onView(card.record);
    }
  };

  // Default card renderer with click handler
  const defaultRenderCard = (card) => (
    <div 
      className="board-view__card"
      onClick={() => handleCardClick(card)}
      style={{ cursor: onView ? 'pointer' : 'default' }}
    >
      <div className="board-view__card-title">{card.title}</div>
      {card.description && (
        <div className="board-view__card-description">{card.description}</div>
      )}
    </div>
  );

  // Handle card move between columns
  const handleCardMove = async (card, source, destination) => {
    console.log('Card moved:', { card, source, destination });

    const namespace = gridContext.namespace;
    const route = gridContext.route;
    const auth = gridContext.auth;

    if (!namespace || !route) {
      console.warn('BoardView: namespace and route not available in context. Card move will not be persisted.');
      return;
    }

    const sourceColumnId = source.fromColumnId;
    const destColumnId = destination.toColumnId;

    // Only update if moved to different column
    if (sourceColumnId === destColumnId) {
      console.log('Card moved within same column, no status update needed');
      return;
    }

    try {
      // Update the status_id field
      const updateField = groupByField.includes('_id') ? groupByField : `${groupByField}_id`;

      const updateData = {
        [updateField]: destColumnId === UNCATEGORIZED_LANE_ID ? null : destColumnId,
      };

      console.log(`Updating record ${card.id} ${updateField} to:`, updateData[updateField]);

      await updateRecord(namespace, route, card.id, updateData, { auth });

      console.log(`Successfully updated record ${card.id}`);

      // Call onRefresh callback if provided in context
      if (gridContext.onRefresh) {
        gridContext.onRefresh();
      }
    } catch (error) {
      console.error('Error updating card status:', error);
    }
  };

  if (loading) {
    return (
      <div className="board-view__state board-view__state--loading">
        <div className="board-view__message">Loading board...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="board-view__state board-view__state--empty">
        <div className="board-view__message">No data available</div>
      </div>
    );
  }

  // Wrap custom renderCard to add click handler
  const cardRenderer = renderCard 
    ? (card) => (
        <div 
          onClick={() => handleCardClick(card)}
          style={{ cursor: onView ? 'pointer' : 'default' }}
        >
          {renderCard(card)}
        </div>
      )
    : defaultRenderCard;

  return (
    <div className="board-view">
      <Board
        initialBoard={boardModel}
        renderCard={cardRenderer}
        onCardDragEnd={handleCardMove}
        disableLaneDrag={true}
        disableLaneRename={true}
        {...boardProps}
      />
    </div>
  );
};

export default BoardView;
