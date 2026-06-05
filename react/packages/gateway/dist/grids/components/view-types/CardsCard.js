import { useCardsContext } from "../../context/CardsContext";
import CardsCardHeader from "./CardsCardHeader";
import CardsCardBody from "./CardsCardBody";
import CardsCardFooter from "./CardsCardFooter";

/**
 * CardsCard — individual card shell.
 *
 * Without children renders the default header + body + footer.
 * Pass children to compose a fully custom card layout:
 *
 *   <CardsView.Card record={record}>
 *     <CardsView.CardHeader record={record} />
 *     <p>{record.custom_field}</p>
 *     <CardsView.CardFooter record={record} />
 *   </CardsView.Card>
 */
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
var CardsCard = _ref => {
  var record = _ref.record,
    children = _ref.children,
    _onClick = _ref.onClick;
  var _useCardsContext = useCardsContext(),
    handleViewRecord = _useCardsContext.handleViewRecord;
  return /*#__PURE__*/_jsx("div", {
    className: "cards-view__card",
    onClick: () => _onClick ? _onClick(record) : handleViewRecord(record),
    children: children !== null && children !== void 0 ? children : /*#__PURE__*/_jsxs(_Fragment, {
      children: [/*#__PURE__*/_jsx(CardsCardHeader, {
        record: record
      }), /*#__PURE__*/_jsx(CardsCardBody, {
        record: record
      }), /*#__PURE__*/_jsx(CardsCardFooter, {
        record: record
      })]
    })
  });
};
export default CardsCard;