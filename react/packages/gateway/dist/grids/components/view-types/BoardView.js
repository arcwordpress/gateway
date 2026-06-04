var _excluded = ["groupByField", "lanes", "getCardFromRecord", "renderCard"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
import { useMemo } from 'react';
import Board from '@asseinfo/react-kanban';
import { useGridContext } from "../../context/GridContext";
import { getLabelField } from "../../services/columnGenerator";
import { collectionApi } from "../../../data";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var UNCATEGORIZED_LANE_ID = 'uncategorized';

/**
 * BoardView Component
 * Displays data in a Kanban board layout grouped by a field
 */
var BoardView = _ref => {
  var _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config,
    _ref$loading = _ref.loading,
    loading = _ref$loading === void 0 ? false : _ref$loading,
    onView = _ref.onView;
  var _config$groupByField = config.groupByField,
    groupByField = _config$groupByField === void 0 ? 'status' : _config$groupByField,
    _config$lanes = config.lanes,
    configLanes = _config$lanes === void 0 ? [] : _config$lanes,
    getCardFromRecord = config.getCardFromRecord,
    renderCard = config.renderCard,
    boardProps = _objectWithoutProperties(config, _excluded);

  // Get namespace and route from context (if available)
  var gridContext = useGridContext();
  var _getLabelField = getLabelField(gridContext === null || gridContext === void 0 ? void 0 : gridContext.collection),
    labelKey = _getLabelField.fieldKey,
    labelStatus = _getLabelField.status;

  // Helper function to extract group ID from record - JUST THE ID
  var getGroupId = (record, field) => {
    var value = record[field];

    // If value is null/undefined
    if (value === null || value === undefined) {
      return UNCATEGORIZED_LANE_ID;
    }

    // If value is an object (related object), extract ID only
    if (typeof value === 'object') {
      var id = value.id || value.ID || value._id;
      if (id !== undefined) {
        return String(id);
      }
      console.error("BoardView: ".concat(field, " is an object but has no id:"), value);
      return UNCATEGORIZED_LANE_ID;
    }

    // If value is a primitive (string, number, etc.)
    return String(value);
  };

  // Helper function to make a human-readable title from a value
  var makeTitle = value => {
    if (!value) {
      return 'Uncategorized';
    }

    // If value is an object, try to get a display name
    if (typeof value === 'object') {
      // Try title first, then name, fallback to id
      var title = value.title || value.name || value.id || value.ID || value._id;
      return String(title);
    }

    // If value is a primitive, use it directly
    return String(value);
  };

  // Infer lanes from data if not provided in config
  var lanes = useMemo(() => {
    if (configLanes && configLanes.length > 0) {
      return configLanes;
    }
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('BoardView: No lanes configured and no data available to infer lanes from');
      return [];
    }

    // Extract unique IDs and titles from data
    var uniqueLanes = new Map();
    data.forEach(record => {
      if (!record || typeof record !== 'object') return;
      var id = getGroupId(record, groupByField);
      if (id !== UNCATEGORIZED_LANE_ID && !uniqueLanes.has(id)) {
        var value = record[groupByField];
        var title = makeTitle(value);
        uniqueLanes.set(id, title);
      }
    });
    var inferredLanes = Array.from(uniqueLanes.entries()).map(_ref2 => {
      var _ref3 = _slicedToArray(_ref2, 2),
        id = _ref3[0],
        title = _ref3[1];
      return {
        id: id,
        title: title
      };
    });
    return inferredLanes;
  }, [configLanes, data, groupByField]);

  // Build board model from data
  var boardModel = useMemo(() => {
    // Early validation
    if (!Array.isArray(data)) {
      console.warn('BoardView: data must be an array');
      return {
        columns: []
      };
    }
    if (!Array.isArray(lanes) || lanes.length === 0) {
      console.warn('BoardView: No lanes available (neither configured nor inferred)');
      return {
        columns: []
      };
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
    var grouped = data.reduce((acc, record) => {
      if (!record || typeof record !== 'object') {
        console.warn('BoardView: invalid record in data', record);
        return acc;
      }
      var groupId = getGroupId(record, groupByField);
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(record);
      return acc;
    }, {});

    // Build columns structure
    var boardColumns = lanes.map(lane => {
      if (!lane || !lane.id) {
        console.warn('BoardView: invalid lane config', lane);
        return {
          id: 'invalid',
          title: 'Invalid',
          cards: []
        };
      }
      var laneId = String(lane.id);
      var laneRecords = grouped[laneId] || [];
      return {
        id: laneId,
        title: String(lane.title || lane.id),
        // Use title from lane, fallback to id
        cards: Array.isArray(laneRecords) ? laneRecords.map(record => {
          if (getCardFromRecord) {
            return getCardFromRecord(record);
          }
          return {
            id: record.id,
            title: labelStatus !== 'none' && labelKey ? record[labelKey] || "#".concat(record.id) : "#".concat(record.id),
            description: record.description || '',
            record
          };
        }) : []
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
            title: record.title || record.name || "Record ".concat(record.id),
            description: record.description || '',
            record
          };
        })
      });
    }
    return {
      columns: boardColumns
    };
  }, [data, groupByField, lanes, getCardFromRecord]);

  // Handle card click to view details
  var handleCardClick = card => {
    if (onView && card.record) {
      onView(card.record);
    }
  };

  // Default card renderer with click handler
  var defaultRenderCard = card => /*#__PURE__*/_jsxs("div", {
    className: "board-view__card",
    onClick: () => handleCardClick(card),
    style: {
      cursor: onView ? 'pointer' : 'default'
    },
    children: [/*#__PURE__*/_jsx("div", {
      className: "board-view__card-title",
      children: card.title
    }), card.description && /*#__PURE__*/_jsx("div", {
      className: "board-view__card-description",
      children: card.description
    })]
  });

  // Handle card move between columns
  var handleCardMove = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(function* (card, source, destination) {
      var namespace = gridContext.namespace;
      var route = gridContext.route;
      var auth = gridContext.auth;
      if (!namespace || !route) {
        console.warn('BoardView: namespace and route not available in context. Card move will not be persisted.');
        return;
      }
      var sourceColumnId = source.fromColumnId;
      var destColumnId = destination.toColumnId;

      // Only update if moved to different column
      if (sourceColumnId === destColumnId) {
        return;
      }
      try {
        // Update the status_id field
        var updateField = groupByField.includes('_id') ? groupByField : "".concat(groupByField, "_id");
        var updateData = {
          [updateField]: destColumnId === UNCATEGORIZED_LANE_ID ? null : destColumnId
        };
        yield collectionApi.updateRecord(namespace, route, card.id, updateData, {
          auth
        });

        // Call onRefresh callback if provided in context
        if (gridContext.onRefresh) {
          gridContext.onRefresh();
        }
      } catch (error) {
        console.error('Error updating card status:', error);
      }
    });
    return function handleCardMove(_x, _x2, _x3) {
      return _ref4.apply(this, arguments);
    };
  }();
  if (loading) {
    return /*#__PURE__*/_jsx("div", {
      className: "board-view__state board-view__state--loading",
      children: /*#__PURE__*/_jsx("div", {
        className: "board-view__message",
        children: "Loading board..."
      })
    });
  }
  if (!data || data.length === 0) {
    return /*#__PURE__*/_jsx("div", {
      className: "board-view__state board-view__state--empty",
      children: /*#__PURE__*/_jsx("div", {
        className: "board-view__message",
        children: "No records available."
      })
    });
  }

  // Wrap custom renderCard to add click handler
  var cardRenderer = renderCard ? card => /*#__PURE__*/_jsx("div", {
    onClick: () => handleCardClick(card),
    style: {
      cursor: onView ? 'pointer' : 'default'
    },
    children: renderCard(card)
  }) : defaultRenderCard;
  return /*#__PURE__*/_jsx("div", {
    className: "board-view",
    children: /*#__PURE__*/_jsx(Board, _objectSpread({
      initialBoard: boardModel,
      renderCard: cardRenderer,
      onCardDragEnd: handleCardMove,
      disableLaneDrag: true,
      disableLaneRename: true
    }, boardProps))
  });
};
export default BoardView;