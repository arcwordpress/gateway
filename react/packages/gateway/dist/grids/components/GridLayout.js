function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import Grid from "./Grid";
import GridFilters from "./GridFilters";
import GridPagination from "./GridPagination";
import TableView from "./view-types/TableView";
import ListView from "./view-types/ListView";
import CardsView from "./view-types/CardsView";
import SingleView from "./SingleView";
import Modal from "./Dialog";
import ViewSwitcher from "./ViewSwitcher";
import Filter from "./Filter";
import FilterGroup from "./Filters";
import SearchFilter from "./filter-types/text/TextFilter";
import SelectFilter from "./filter-types/select/SelectFilter";
import DateFilter from "./filter-types/date_range/DateRangeFilter";
import RangeFilter from "./filter-types/range/RangeFilter";
import CheckboxFacet from "./filter-types/checkbox/CheckboxFacet";
import { jsx as _jsx } from "react/jsx-runtime";
var GridLayout = props => /*#__PURE__*/_jsx(Grid, _objectSpread({}, props));
GridLayout.displayName = 'GridLayout';
GridLayout.Pagination = GridPagination;
GridLayout.Facets = GridFilters;
GridLayout.Filters = GridFilters;
GridLayout.Table = TableView;
GridLayout.TableView = TableView;
GridLayout.List = ListView;
GridLayout.ListView = ListView;
GridLayout.Cards = CardsView;
GridLayout.CardsView = CardsView;
GridLayout.SingleView = SingleView;
GridLayout.Modal = Modal;
GridLayout.ViewSwitcher = ViewSwitcher;
GridLayout.Filter = Filter;
GridLayout.FilterGroup = FilterGroup;
GridLayout.SearchFilter = SearchFilter;
GridLayout.SelectFilter = SelectFilter;
GridLayout.DateFilter = DateFilter;
GridLayout.RangeFilter = RangeFilter;
GridLayout.CheckboxFacet = CheckboxFacet;
export default GridLayout;