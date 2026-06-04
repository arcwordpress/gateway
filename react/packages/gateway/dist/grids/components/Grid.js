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
import { useState, useEffect, useMemo } from 'react';
import { useGridContext } from "../context/GridContext";
import TableView from "./view-types/TableView";
import ListView from "./view-types/ListView";
import CardsView from "./view-types/CardsView";
import GridFilters from "./GridFilters";
import FilterIcon from "./FilterIcon";
import { GridProvider } from "../context/GridContext";
import { collectionApi } from "../../data";
import { generateColumns } from "../services/columnGenerator";
import { applyFilters } from "../utils/filterUtils";
import SingleView from "./SingleView";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ViewSwitcher from "./ViewSwitcher";
import TextFilter from "./filter-types/text/TextFilter";

/**
 * Main Grid Component
 * Displays a data grid for a Gateway collection
 */
/**
 * @param {object} props
 * @param {string} props.collectionKey
 * @param {Array} [props.viewColumns] - Column definitions from the View object (overrides auto-generation)
 * @param {function} [props.onEdit]
 * @param {function} [props.onDelete]
 * @param {function} [props.onView]
 * @param {object} [props.selectedRecord]
 * @param {function} [props.onCloseView]
 * @param {boolean} [props.showActions]
 * @param {boolean} [props.showFilters]
 * @param {object} [props.externalFilters]
 * @param {string} [props.viewType]
 *@param {React.ComponentType} [props.singleViewComponent] - Custom component for single record view
 * @param {string} [props.title] - Title to display in the grid toolbar
 * @param {React.ReactNode} [props.toolbarActions] - Custom toolbar actions (e.g., create button)
 * @param {boolean} [props.showSearch] - Whether to show the search input (default true)
 * @param {React.ReactNode} [props.children]
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var Grid = _ref => {
  var _collection$grid2;
  var collectionKey = _ref.collectionKey,
    _ref$viewColumns = _ref.viewColumns,
    viewColumns = _ref$viewColumns === void 0 ? null : _ref$viewColumns,
    onEdit = _ref.onEdit,
    onDelete = _ref.onDelete,
    onView = _ref.onView,
    selectedRecord = _ref.selectedRecord,
    onCloseView = _ref.onCloseView,
    _ref$showActions = _ref.showActions,
    showActions = _ref$showActions === void 0 ? true : _ref$showActions,
    _ref$showFilters = _ref.showFilters,
    showFilters = _ref$showFilters === void 0 ? true : _ref$showFilters,
    _ref$showSearch = _ref.showSearch,
    showSearch = _ref$showSearch === void 0 ? true : _ref$showSearch,
    _ref$viewType = _ref.viewType,
    viewType = _ref$viewType === void 0 ? 'table' : _ref$viewType,
    _ref$singleViewCompon = _ref.singleViewComponent,
    singleViewComponent = _ref$singleViewCompon === void 0 ? SingleView : _ref$singleViewCompon,
    _ref$title = _ref.title,
    title = _ref$title === void 0 ? '' : _ref$title,
    _ref$toolbarActions = _ref.toolbarActions,
    toolbarActions = _ref$toolbarActions === void 0 ? null : _ref$toolbarActions,
    children = _ref.children;
  var _useGridContext = useGridContext(),
    auth = _useGridContext.auth;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    collection = _useState2[0],
    setCollection = _useState2[1];
  var _useState3 = useState([]),
    _useState4 = _slicedToArray(_useState3, 2),
    data = _useState4[0],
    setData = _useState4[1];
  var _useState5 = useState(true),
    _useState6 = _slicedToArray(_useState5, 2),
    loading = _useState6[0],
    setLoading = _useState6[1];
  var _useState7 = useState(null),
    _useState8 = _slicedToArray(_useState7, 2),
    error = _useState8[0],
    setError = _useState8[1];
  var _useState9 = useState(null),
    _useState0 = _slicedToArray(_useState9, 2),
    deleteConfirm = _useState0[0],
    setDeleteConfirm = _useState0[1];
  var _useState1 = useState({}),
    _useState10 = _slicedToArray(_useState1, 2),
    filterValues = _useState10[0],
    setFilterValues = _useState10[1];
  var _useState11 = useState(viewType),
    _useState12 = _slicedToArray(_useState11, 2),
    currentView = _useState12[0],
    setCurrentView = _useState12[1];
  var _useState13 = useState(''),
    _useState14 = _slicedToArray(_useState13, 2),
    searchText = _useState14[0],
    setSearchText = _useState14[1];
  var _useState15 = useState(true),
    _useState16 = _slicedToArray(_useState15, 2),
    filtersOpen = _useState16[0],
    setFiltersOpen = _useState16[1];

  // Combined effect to load collection and data
  var loadAll = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* () {
      if (!collectionKey) {
        setError('No collection key provided');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        var _ref3, _routesArr$find;
        // Fetch collection metadata
        var collectionData = yield collectionApi.fetchCollection(collectionKey, {
          auth
        });
        setCollection(collectionData);

        // Fetch collection records — routes is an array; find the get_many entry
        var routesArr = Array.isArray(collectionData.routes) ? collectionData.routes : [];
        var getManyRoute = (_ref3 = (_routesArr$find = routesArr.find(r => r.type === 'get_many')) !== null && _routesArr$find !== void 0 ? _routesArr$find : routesArr[0]) !== null && _ref3 !== void 0 ? _ref3 : null;
        var namespace = getManyRoute === null || getManyRoute === void 0 ? void 0 : getManyRoute.namespace;
        var route = getManyRoute === null || getManyRoute === void 0 ? void 0 : getManyRoute.path;
        var records = yield collectionApi.fetchRecords(namespace, route, {
          relations: true
        }, {
          auth
        });

        // Normalise: ensure every record has a lowercase `id` equal to its actual
        // primary key value so consumers and action handlers can always use `record.id`
        // regardless of whether the collection uses ID, comment_ID, term_id, etc.
        var pkField = collectionData.primaryKey || 'id';
        var items = (records.data.items || []).map(r => pkField === 'id' || r.id !== undefined ? r : _objectSpread({
          id: r[pkField]
        }, r));
        setData(items);
        setError(null);
      } catch (err) {
        setError("Failed to load collection or data: ".concat(err.message));
        console.error('Error loading collection or data:', err);
        setCollection(null);
        setData([]);
      } finally {
        setLoading(false);
      }
    });
    return function loadAll() {
      return _ref2.apply(this, arguments);
    };
  }();
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionKey]);

  // Update currentView when viewType prop changes
  useEffect(() => {
    setCurrentView(viewType);
  }, [viewType]);

  // Get facets from collection metadata (defined under grid.facets)
  var filters = useMemo(() => {
    var _collection$grid;
    return (collection === null || collection === void 0 || (_collection$grid = collection.grid) === null || _collection$grid === void 0 ? void 0 : _collection$grid.facets) || [];
  }, [collection]);

  // collection.grid.show_search === false overrides the showSearch prop
  var effectiveShowSearch = showSearch && (collection === null || collection === void 0 || (_collection$grid2 = collection.grid) === null || _collection$grid2 === void 0 ? void 0 : _collection$grid2.show_search) !== false;

  // Unified filtering logic
  var filteredData = useMemo(() => {
    var result = applyFilters(data, filters, filterValues);
    if (searchText.trim()) {
      var lower = searchText.trim().toLowerCase();
      result = result.filter(item => Object.values(item).some(val => typeof val === 'string' && val.toLowerCase().includes(lower)));
    }
    return result;
  }, [data, filters, filterValues, searchText]);

  // Handle delete with confirmation
  var handleDeleteClick = recordId => {
    setDeleteConfirm({
      id: recordId,
      loading: false
    });
  };
  var handleDeleteConfirm = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(function* () {
      if (!deleteConfirm || !collection) return;
      setDeleteConfirm(_objectSpread(_objectSpread({}, deleteConfirm), {}, {
        loading: true
      }));
      try {
        var _ref5, _routesArr$find2;
        var routesArr = Array.isArray(collection.routes) ? collection.routes : [];
        var getManyRoute = (_ref5 = (_routesArr$find2 = routesArr.find(r => r.type === 'get_many')) !== null && _routesArr$find2 !== void 0 ? _routesArr$find2 : routesArr[0]) !== null && _ref5 !== void 0 ? _ref5 : null;
        var namespace = getManyRoute === null || getManyRoute === void 0 ? void 0 : getManyRoute.namespace;
        var route = getManyRoute === null || getManyRoute === void 0 ? void 0 : getManyRoute.path;
        yield collectionApi.deleteRecord(namespace, route, deleteConfirm.id, {
          auth
        });
        setData(prevData => prevData.filter(record => String(record.id) !== String(deleteConfirm.id)));
        if (onDelete) {
          onDelete(deleteConfirm.id);
        }
        setDeleteConfirm(null);
      } catch (err) {
        console.error('Error deleting record:', err);
        alert("Failed to delete record: ".concat(err.message));
        setDeleteConfirm(_objectSpread(_objectSpread({}, deleteConfirm), {}, {
          loading: false
        }));
      }
    });
    return function handleDeleteConfirm() {
      return _ref4.apply(this, arguments);
    };
  }();
  var handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // Generate columns: use view-defined columns if provided, otherwise auto-generate from collection
  var columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    // viewColumns are [{field, label, sortable}] — same shape as collection.grid.columns
    var source = viewColumns ? _objectSpread(_objectSpread({}, collection), {}, {
      grid: {
        columns: viewColumns
      }
    }) : collection;
    var baseColumns = generateColumns(source);
    if (showActions && (onEdit || onDelete || onView)) {
      baseColumns.push({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableColumnFilter: false,
        cell: _ref6 => {
          var row = _ref6.row;
          var recordId = row.original.id;
          return /*#__PURE__*/_jsxs("div", {
            className: "grid__actions",
            children: [onView && /*#__PURE__*/_jsx("button", {
              onClick: () => onView(row.original),
              className: "grid__btn grid__btn--view",
              children: "View"
            }), onEdit && /*#__PURE__*/_jsx("button", {
              onClick: () => onEdit(recordId),
              className: "grid__btn grid__btn--edit",
              children: "Edit"
            }), onDelete && /*#__PURE__*/_jsx("button", {
              onClick: () => handleDeleteClick(recordId),
              className: "grid__btn grid__btn--delete",
              children: "Delete"
            })]
          });
        }
      });
    }
    return baseColumns;
  }, [data, collection, viewColumns, showActions, onEdit, onDelete, onView]);

  // Context value for child components
  var gridContextValue = useMemo(() => {
    var _ref7, _ctxRoutesArr$find;
    var ctxRoutesArr = Array.isArray(collection === null || collection === void 0 ? void 0 : collection.routes) ? collection.routes : [];
    var ctxGetMany = (_ref7 = (_ctxRoutesArr$find = ctxRoutesArr.find(r => r.type === 'get_many')) !== null && _ctxRoutesArr$find !== void 0 ? _ctxRoutesArr$find : ctxRoutesArr[0]) !== null && _ref7 !== void 0 ? _ref7 : null;
    return {
      namespace: (ctxGetMany === null || ctxGetMany === void 0 ? void 0 : ctxGetMany.namespace) || null,
      route: (ctxGetMany === null || ctxGetMany === void 0 ? void 0 : ctxGetMany.path) || null,
      collection,
      records: data,
      getRecordById: id => {
        if (!data || data.length === 0) return null;
        // Support both numeric and string IDs
        return data.find(record => record.id == id) || null;
      },
      onRefresh: loadAll,
      auth
    };
  }, [collection, data, auth, collectionKey]);
  if (error) {
    return /*#__PURE__*/_jsxs("div", {
      className: "grid__error",
      children: [/*#__PURE__*/_jsx("h3", {
        className: "grid__error-title",
        children: "Error"
      }), /*#__PURE__*/_jsx("p", {
        className: "grid__error-message",
        children: error
      })]
    });
  }
  if (loading && !collection) {
    var skeletonWidths = [55, 30, 20, 15];
    return /*#__PURE__*/_jsxs("div", {
      className: "grid",
      children: [/*#__PURE__*/_jsx("div", {
        className: "grid__toolbar-row",
        children: /*#__PURE__*/_jsxs("div", {
          className: "grid__toolbar-end",
          children: [/*#__PURE__*/_jsx("div", {
            className: "grid__skeleton-bar",
            style: {
              width: 26,
              height: 26,
              borderRadius: '0.25rem'
            }
          }), /*#__PURE__*/_jsx("div", {
            className: "grid__skeleton-bar",
            style: {
              width: 26,
              height: 26,
              borderRadius: '0.25rem'
            }
          }), /*#__PURE__*/_jsx("div", {
            className: "grid__skeleton-bar",
            style: {
              width: 160,
              height: 26,
              borderRadius: 0
            }
          })]
        })
      }), /*#__PURE__*/_jsxs("table", {
        className: "grid__skeleton-table",
        children: [/*#__PURE__*/_jsx("thead", {
          children: /*#__PURE__*/_jsx("tr", {
            className: "grid__skeleton-row",
            children: skeletonWidths.map((w, i) => /*#__PURE__*/_jsx("th", {
              className: "grid__skeleton-th",
              children: /*#__PURE__*/_jsx("div", {
                className: "grid__skeleton-bar",
                style: {
                  width: "".concat(w, "%")
                }
              })
            }, i))
          })
        }), /*#__PURE__*/_jsx("tbody", {
          children: Array.from({
            length: 7
          }).map((_, i) => /*#__PURE__*/_jsx("tr", {
            className: "grid__skeleton-row",
            children: skeletonWidths.map((w, j) => /*#__PURE__*/_jsx("td", {
              className: "grid__skeleton-cell",
              children: /*#__PURE__*/_jsx("div", {
                className: "grid__skeleton-bar",
                style: {
                  width: "".concat(w, "%")
                }
              })
            }, j))
          }, i))
        })]
      })]
    });
  }
  if (!collection) {
    return null;
  }
  return /*#__PURE__*/_jsxs(GridProvider, {
    value: gridContextValue,
    children: [/*#__PURE__*/_jsxs("div", {
      className: "grid",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "grid__toolbar-row",
        children: [toolbarActions && /*#__PURE__*/_jsx("div", {
          className: "grid__toolbar-left",
          children: toolbarActions
        }), /*#__PURE__*/_jsxs("div", {
          className: "grid__toolbar-end",
          children: [showFilters && filters.length > 0 && /*#__PURE__*/_jsx(FilterIcon, {
            onClick: () => setFiltersOpen(v => !v),
            isOpen: filtersOpen
          }), /*#__PURE__*/_jsx(ViewSwitcher, {
            currentView: currentView,
            onViewChange: setCurrentView,
            enabledViews: ['table', 'list', 'cards']
          }), effectiveShowSearch && /*#__PURE__*/_jsx(TextFilter, {
            value: searchText,
            onChange: setSearchText,
            placeholder: "Search\u2026",
            className: "grid__toolbar-search"
          })]
        })]
      }), showFilters && filters.length > 0 && /*#__PURE__*/_jsx(GridFilters, {
        filters: filters,
        values: filterValues,
        onChange: setFilterValues,
        data: data,
        isOpen: filtersOpen
      }), (() => {
        var ViewComponent;
        var viewProps;
        switch (currentView) {
          case 'list':
            ViewComponent = ListView;
            viewProps = {
              onView,
              selectedRecord,
              onCloseView,
              singleViewComponent
            };
            break;
          case 'cards':
            ViewComponent = CardsView;
            viewProps = {
              onView,
              selectedRecord,
              onCloseView,
              singleViewComponent
            };
            break;
          case 'table':
          default:
            ViewComponent = TableView;
            viewProps = {
              columns
            };
            break;
        }
        return /*#__PURE__*/_jsx(ViewComponent, _objectSpread({
          data: filteredData,
          loading: loading
        }, viewProps));
      })(), deleteConfirm && /*#__PURE__*/_jsx(DeleteConfirmModal, {
        open: !!deleteConfirm,
        onCancel: handleDeleteCancel,
        onConfirm: handleDeleteConfirm,
        loading: deleteConfirm.loading
      })]
    }), children]
  });
};
export default Grid;