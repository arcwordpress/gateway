import { useCardsContext } from "../../context/CardsContext";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
var CardsCardHeader = _ref => {
  var record = _ref.record;
  var _useCardsContext = useCardsContext(),
    labelKey = _useCardsContext.labelKey,
    labelStatus = _useCardsContext.labelStatus;
  return /*#__PURE__*/_jsxs("div", {
    className: "cards-view__card-header",
    children: [/*#__PURE__*/_jsxs("span", {
      className: "grid__id-badge",
      children: ["#", record.id]
    }), /*#__PURE__*/_jsx("div", {
      className: "cards-view__card-title",
      children: labelStatus === 'none' ? /*#__PURE__*/_jsx("span", {
        className: "grid__no-label",
        children: "No default label field set for this collection."
      }) : record[labelKey] || /*#__PURE__*/_jsx("span", {
        className: "grid__no-label grid__no-label--empty",
        children: "\u2014"
      })
    })]
  });
};
export default CardsCardHeader;