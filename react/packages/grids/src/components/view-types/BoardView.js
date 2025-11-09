import { useMemo } from '@wordpress/element';
import Board from '@asseinfo/react-kanban';

const UNCATEGORIZED_LANE_ID = 'uncategorized';

const getValueByPath = (record, path) => {
  if (!path || !record || typeof record !== 'object') {
    return undefined;
  }

  const segments = path.split('.');
  let current = record;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[segment];
  }

  return current;
};

const inferGroupByField = (records) => {
  for (const record of records) {
    if (!record || typeof record !== 'object') {
      continue;
    }

    if (record.status != null) {
      return 'status';
    }

    if (record.ticket_status != null) {
      return 'ticket_status';
    }

    if (record.ticket && typeof record.ticket === 'object') {
      if (record.ticket.status != null) {
        return 'ticket.status';
      }

      if (record.ticket.ticket_status != null) {
        return 'ticket.ticket_status';
      }
    }

    const keys = Object.keys(record);
    const exactStatusKey = keys.find((key) => key.toLowerCase() === 'status');
    if (exactStatusKey) {
      return exactStatusKey;
    }

    const containsStatusKey = keys.find((key) => key.toLowerCase().includes('status'));
    if (containsStatusKey) {
      return containsStatusKey;
    }
  }

  return null;
};

/**
 * BoardView Component
 * Renders collection data using a Kanban-style board.
 *
 * @param {Object[]} data - The records to display.
 * @param {Object} config - Configuration for lane grouping and card rendering.
 * @param {string} [config.groupByField] - Field (dot notation supported) used to group records into swimlanes.
 * @param {Array<{id: string|number, title?: string, label?: string}>} [config.lanes] - Optional lane definitions used to seed order and labels.
 * @param {string[]} [config.laneOrder] - Optional ordering of lane identifiers.
 * @param {Object<string, string>} [config.laneLabels] - Optional mapping of lane identifiers to display titles.
 * @param {Function} [config.getCardFromRecord] - Custom function to map a record to a board card.
 * @param {Function} [config.renderCard] - Custom render function for cards.
 * @param {Object} [config.boardProps] - Additional props to pass directly to the Board component.
 */
const BoardView = ({ data = [], config = {}, loading }) => {
  const {
    groupByField,
    lanes: laneDefinitions = [],
    laneOrder = [],
    laneLabels = {},
    getCardFromRecord,
    renderCard,
    boardProps = {},
  } = config;

  const resolvedGroupByField = useMemo(() => {
    if (groupByField) {
      return groupByField;
    }

    const inferred = inferGroupByField(data);
    return inferred || 'status';
  }, [groupByField, data]);

  const defaultGetCardFromRecord = (record, index) => {
    const fallbackTitle = record.title || record.name || `Card ${index + 1}`;

    return {
      id: record.id != null ? record.id : `${index}`,
      title: fallbackTitle,
      description: record.description || '',
      record,
    };
  };

  const boardModel = useMemo(() => {
    const lanes = new Map();
    const mergedLaneLabels = { ...laneLabels };

    if (Array.isArray(laneDefinitions)) {
      laneDefinitions.forEach((lane) => {
        if (!lane || lane.id == null) {
          return;
        }
        const laneId = String(lane.id);
        const label = lane.title || lane.label || mergedLaneLabels[laneId] || laneId;
        mergedLaneLabels[laneId] = label;
        lanes.set(laneId, {
          id: laneId,
          title: label,
          cards: [],
        });
      });
    }

    const uniqueLaneOrder = new Set();
    const cardFactory = getCardFromRecord || defaultGetCardFromRecord;

    data.forEach((record, index) => {
      const rawLaneId = getValueByPath(record, resolvedGroupByField);
      const laneId = rawLaneId != null && rawLaneId !== ''
        ? String(rawLaneId)
        : UNCATEGORIZED_LANE_ID;

      uniqueLaneOrder.add(laneId);

      if (!lanes.has(laneId)) {
        const title = mergedLaneLabels[laneId]
          || (laneId === UNCATEGORIZED_LANE_ID
            ? mergedLaneLabels[UNCATEGORIZED_LANE_ID] || 'Uncategorized'
            : laneId);

        lanes.set(laneId, {
          id: laneId,
          title,
          cards: [],
        });
      }

      const card = cardFactory(record, index, laneId);
      if (card) {
        lanes.get(laneId).cards.push(card);
      }
    });

    const explicitOrder = laneOrder.length
      ? laneOrder.map((value) => String(value))
      : [];

    const seededOrder = !explicitOrder.length && Array.isArray(laneDefinitions) && laneDefinitions.length
      ? laneDefinitions
          .filter((lane) => lane && lane.id != null)
          .map((lane) => String(lane.id))
      : [];

    const dynamicOrder = Array.from(uniqueLaneOrder);
    const combinedOrderSource = explicitOrder.length ? explicitOrder : seededOrder;
    const combinedOrder = Array.from(new Set([...(combinedOrderSource || []), ...dynamicOrder]));

    if (!combinedOrder.length) {
      combinedOrder.push(UNCATEGORIZED_LANE_ID);
    }

    const columns = combinedOrder.map((laneId) => {
      if (!lanes.has(laneId)) {
        const title = mergedLaneLabels[laneId]
          || (laneId === UNCATEGORIZED_LANE_ID
            ? mergedLaneLabels[UNCATEGORIZED_LANE_ID] || 'Uncategorized'
            : laneId);

        lanes.set(laneId, {
          id: laneId,
          title,
          cards: [],
        });
      }
      return lanes.get(laneId);
    });

    if (!columns.length) {
      columns.push({
        id: UNCATEGORIZED_LANE_ID,
        title: mergedLaneLabels[UNCATEGORIZED_LANE_ID] || 'Items',
        cards: [],
      });
    }

    return { columns };
  }, [
    data,
    laneDefinitions,
    laneLabels,
    laneOrder,
    getCardFromRecord,
    resolvedGroupByField,
  ]);

  const defaultRenderCard = (card) => (
    <div className="board-view__card">
      <div className="board-view__card-title">{card.title}</div>
      {card.description && (
        <div className="board-view__card-description">{card.description}</div>
      )}
    </div>
  );

  if (loading) {
    return <div className="board-view__loading">Loading...</div>;
  }

  if (!data.length) {
    return <div className="board-view__empty">No data available</div>;
  }

  return (
    <div className="board-view">
      <Board
        initialBoard={boardModel}
        renderCard={renderCard || defaultRenderCard}
        {...boardProps}
      />
    </div>
  );
};

export default BoardView;
