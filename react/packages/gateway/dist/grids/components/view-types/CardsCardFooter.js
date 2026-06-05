import { useCardsContext } from "../../context/CardsContext";
import { jsx as _jsx } from "react/jsx-runtime";
var CardsCardFooter = _ref => {
  var record = _ref.record;
  var _useCardsContext = useCardsContext(),
    handleViewRecord = _useCardsContext.handleViewRecord;
  return /*#__PURE__*/_jsx("div", {
    className: "cards-view__card-footer",
    children: /*#__PURE__*/_jsx("button", {
      onClick: e => {
        e.stopPropagation();
        handleViewRecord(record);
      },
      className: "grid__btn grid__btn--view",
      children: "View"
    })
  });
};
export default CardsCardFooter;