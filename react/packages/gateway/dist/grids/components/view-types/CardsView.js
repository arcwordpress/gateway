function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { useState } from 'react';
import CardsContext from "../../context/CardsContext";
import { useGridContext } from "../../context/GridContext";
import { getLabelField } from "../../services/columnGenerator";
import CardsGrid from "./CardsGrid";
import CardsCard from "./CardsCard";
import CardsCardHeader from "./CardsCardHeader";
import CardsCardBody from "./CardsCardBody";
import CardsCardFooter from "./CardsCardFooter";
import CardsFooter from "./CardsFooter";
import Modal from "../Dialog";
import "../dialog.css";

/**
 * CardsView — compound component.
 *
 * Without children renders everything (grid + footer + detail modal).
 * Pass children to control exactly what renders:
 *
 *   <CardsView data={data}>
 *     <CardsView.Grid>
 *       {(record) => (
 *         <CardsView.Card record={record}>
 *           <CardsView.CardHeader record={record} />
 *           <p>{record.custom_field}</p>
 *           <CardsView.CardFooter record={record} />
 *         </CardsView.Card>
 *       )}
 *     </CardsView.Grid>
 *     <CardsView.Footer />
 *   </CardsView>
 */
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
var CardsView = _ref => {
  var _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    _ref$loading = _ref.loading,
    loading = _ref$loading === void 0 ? false : _ref$loading,
    onView = _ref.onView,
    externalSelectedRecord = _ref.selectedRecord,
    onCloseView = _ref.onCloseView,
    SingleViewComponent = _ref.singleViewComponent,
    children = _ref.children;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    internalSelectedRecord = _useState2[0],
    setInternalSelectedRecord = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isModalOpen = _useState4[0],
    setIsModalOpen = _useState4[1];
  var _useGridContext = useGridContext(),
    collection = _useGridContext.collection;
  var _getLabelField = getLabelField(collection),
    labelKey = _getLabelField.fieldKey,
    labelStatus = _getLabelField.status;
  var selectedRecord = externalSelectedRecord !== undefined ? externalSelectedRecord : internalSelectedRecord;
  var isViewOpen = externalSelectedRecord !== undefined ? !!externalSelectedRecord : isModalOpen;
  var handleViewRecord = record => {
    if (onView) {
      onView(record);
    } else {
      setInternalSelectedRecord(record);
      setIsModalOpen(true);
    }
  };
  var handleCloseView = () => {
    if (onCloseView) {
      onCloseView();
    } else {
      setInternalSelectedRecord(null);
      setIsModalOpen(false);
    }
  };
  if (loading) {
    return /*#__PURE__*/_jsx("div", {
      className: "cards-view__state cards-view__state--loading",
      children: /*#__PURE__*/_jsx("div", {
        className: "cards-view__message",
        children: "Loading..."
      })
    });
  }
  if (!data || data.length === 0) {
    return /*#__PURE__*/_jsx("div", {
      className: "cards-view__state cards-view__state--empty",
      children: /*#__PURE__*/_jsx("div", {
        className: "cards-view__message",
        children: "No records available."
      })
    });
  }
  var contextValue = {
    data,
    collection,
    labelKey,
    labelStatus,
    selectedRecord,
    isViewOpen,
    handleViewRecord,
    handleCloseView,
    SingleViewComponent
  };
  return /*#__PURE__*/_jsx(CardsContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsxs("div", {
      className: "cards-view",
      children: [children !== null && children !== void 0 ? children : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx(CardsGrid, {}), /*#__PURE__*/_jsx(CardsFooter, {})]
      }), /*#__PURE__*/_jsx(Modal, {
        isOpen: isViewOpen,
        onClose: handleCloseView,
        title: "Record Details",
        children: SingleViewComponent ? /*#__PURE__*/_jsx(SingleViewComponent, {
          record: selectedRecord
        }) : null
      })]
    })
  });
};
CardsView.Grid = CardsGrid;
CardsView.Card = CardsCard;
CardsView.CardHeader = CardsCardHeader;
CardsView.CardBody = CardsCardBody;
CardsView.CardFooter = CardsCardFooter;
CardsView.Footer = CardsFooter;
export default CardsView;