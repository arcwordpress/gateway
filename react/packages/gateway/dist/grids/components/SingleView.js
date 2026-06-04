function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useRecord } from "../context/GridContext";
import { useGridContext } from "../context/GridContext";
import { getLabelField } from "../services/columnGenerator";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var humanize = key => String(key).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
var formatValue = value => {
  if (value === null || value === undefined || value === '') return /*#__PURE__*/_jsx("span", {
    style: {
      color: '#52525b',
      fontStyle: 'italic'
    },
    children: "\u2014"
  });
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ') || /*#__PURE__*/_jsx("span", {
    style: {
      color: '#52525b',
      fontStyle: 'italic'
    },
    children: "\u2014"
  });
  if (typeof value === 'object') return /*#__PURE__*/_jsx("span", {
    style: {
      fontFamily: 'monospace',
      fontSize: '0.8em'
    },
    children: JSON.stringify(value)
  });
  return String(value);
};
var Skeleton = _ref => {
  var _ref$width = _ref.width,
    width = _ref$width === void 0 ? '100%' : _ref$width,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? '0.9em' : _ref$height,
    _ref$style = _ref.style,
    style = _ref$style === void 0 ? {} : _ref$style;
  return /*#__PURE__*/_jsx("span", {
    style: _objectSpread({
      display: 'inline-block',
      background: 'var(--gty-bg-hover, #27272a)',
      borderRadius: 4,
      width,
      height,
      verticalAlign: 'middle'
    }, style),
    className: "single-view__skeleton"
  });
};
var SingleViewSkeleton = () => /*#__PURE__*/_jsxs("div", {
  className: "single-view",
  children: [/*#__PURE__*/_jsxs("div", {
    className: "single-view__header",
    children: [/*#__PURE__*/_jsx(Skeleton, {
      width: "2.5rem",
      height: "1.2rem"
    }), /*#__PURE__*/_jsx(Skeleton, {
      width: "9rem",
      height: "1.2rem",
      style: {
        marginLeft: '0.5rem'
      }
    })]
  }), /*#__PURE__*/_jsx("table", {
    className: "single-view__table",
    children: /*#__PURE__*/_jsx("tbody", {
      children: [80, 140, 100, 60, 120].map((w, i) => /*#__PURE__*/_jsxs("tr", {
        className: "single-view__row",
        children: [/*#__PURE__*/_jsx("th", {
          className: "single-view__th",
          children: /*#__PURE__*/_jsx(Skeleton, {
            width: "5rem"
          })
        }), /*#__PURE__*/_jsx("td", {
          className: "single-view__td",
          children: /*#__PURE__*/_jsx(Skeleton, {
            width: "".concat(w, "px")
          })
        })]
      }, i))
    })
  })]
});

/**
 * SingleView — displays a single record in a field-by-field table.
 *
 * Props:
 *   record        {Object|null}  – the record data object
 *   recordId      {string|number} – record ID (used as fallback when record is null)
 *   loading       {boolean}      – show skeleton while true and record is absent
 *   fields        {Array}        – [{name, label?, type?}] from Raptor field_list
 *   labelField    {string|null}  – field name to use as the record's primary label
 *   collectionTitle {string}     – human-readable collection name shown in header
 */
var SingleView = _ref2 => {
  var _record$id;
  var recordId = _ref2.recordId,
    directRecord = _ref2.record,
    _ref2$loading = _ref2.loading,
    propLoading = _ref2$loading === void 0 ? false : _ref2$loading,
    _ref2$fields = _ref2.fields,
    propFields = _ref2$fields === void 0 ? [] : _ref2$fields,
    _ref2$labelField = _ref2.labelField,
    propLabelField = _ref2$labelField === void 0 ? null : _ref2$labelField,
    _ref2$collectionTitle = _ref2.collectionTitle,
    collectionTitle = _ref2$collectionTitle === void 0 ? '' : _ref2$collectionTitle;
  // Inside a Grid the record may already be in context; outside (e.g. RecordView page) use directRecord.
  var contextRecord = useRecord(recordId);
  var _useGridContext = useGridContext(),
    collection = _useGridContext.collection;
  var record = directRecord || contextRecord;

  // Show skeleton while loading and record not yet available
  if (propLoading && !record) {
    return /*#__PURE__*/_jsx(SingleViewSkeleton, {});
  }

  // ── Determine label field ────────────────────────────────────────────────
  // Priority: explicit Raptor label_field prop > GridContext collection.grid.labelField > auto-detect
  var _getLabelField = getLabelField(collection),
    ctxLabelKey = _getLabelField.fieldKey;
  var labelKey = propLabelField || ctxLabelKey || null;
  var labelValue = record && labelKey ? record[labelKey] : null;

  // ── Determine display fields ─────────────────────────────────────────────
  // Priority: Raptor propFields > GridContext collection.fields > raw record keys
  var displayFields = [];
  if (propFields && propFields.length > 0) {
    // Raptor field definitions: [{name, label, type}]
    displayFields = propFields.map(f => ({
      name: f.name,
      label: f.label || humanize(f.name),
      type: f.type || 'text'
    }));
  } else if (collection !== null && collection !== void 0 && collection.fields && Object.keys(collection.fields).length > 0) {
    // Old Gateway API: collection.fields is {fieldName: {label, type, ...}}
    displayFields = Object.entries(collection.fields).map(_ref3 => {
      var _ref4 = _slicedToArray(_ref3, 2),
        name = _ref4[0],
        meta = _ref4[1];
      return {
        name,
        label: meta && meta.label || humanize(name),
        type: meta && meta.type || 'text'
      };
    });
  } else if (record) {
    // Fallback: all record keys except id
    displayFields = Object.keys(record).filter(k => k !== 'id').map(k => ({
      name: k,
      label: humanize(k),
      type: 'text'
    }));
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return /*#__PURE__*/_jsxs("div", {
    className: "single-view",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "single-view__header",
      children: [/*#__PURE__*/_jsxs("span", {
        className: "grid__id-badge",
        children: ["#", (_record$id = record === null || record === void 0 ? void 0 : record.id) !== null && _record$id !== void 0 ? _record$id : recordId]
      }), labelValue != null && /*#__PURE__*/_jsx("span", {
        className: "single-view__label",
        children: String(labelValue)
      }), labelValue == null && collectionTitle && /*#__PURE__*/_jsxs("span", {
        className: "single-view__label single-view__label--fallback",
        children: [collectionTitle, " Record"]
      })]
    }), displayFields.length > 0 ? /*#__PURE__*/_jsx("table", {
      className: "single-view__table",
      children: /*#__PURE__*/_jsx("tbody", {
        children: displayFields.map(_ref5 => {
          var name = _ref5.name,
            label = _ref5.label;
          return /*#__PURE__*/_jsxs("tr", {
            className: "single-view__row",
            children: [/*#__PURE__*/_jsx("th", {
              className: "single-view__th",
              children: label
            }), /*#__PURE__*/_jsx("td", {
              className: "single-view__td",
              children: record ? formatValue(record[name]) : /*#__PURE__*/_jsx(Skeleton, {
                width: "8rem"
              })
            })]
          }, name);
        })
      })
    }) : !record ? /*#__PURE__*/_jsx("div", {
      className: "single-view__empty",
      children: "No data available for this record."
    }) :
    /*#__PURE__*/
    /* Last-resort: show all raw record fields */
    _jsx("table", {
      className: "single-view__table",
      children: /*#__PURE__*/_jsx("tbody", {
        children: Object.entries(record).filter(_ref6 => {
          var _ref7 = _slicedToArray(_ref6, 1),
            k = _ref7[0];
          return k !== 'id';
        }).map(_ref8 => {
          var _ref9 = _slicedToArray(_ref8, 2),
            k = _ref9[0],
            v = _ref9[1];
          return /*#__PURE__*/_jsxs("tr", {
            className: "single-view__row",
            children: [/*#__PURE__*/_jsx("th", {
              className: "single-view__th",
              children: humanize(k)
            }), /*#__PURE__*/_jsx("td", {
              className: "single-view__td",
              children: formatValue(v)
            })]
          }, k);
        })
      })
    })]
  });
};
export default SingleView;