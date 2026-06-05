import { useCardsContext } from "../../context/CardsContext";
import CardsCard from "./CardsCard";

/**
 * CardsGrid — the `.cards-view__grid` container.
 *
 * Three usage modes:
 *   1. No children — renders a default CardsCard for every record.
 *   2. Render prop — called once per record, full control over each card:
 *        <CardsView.Grid>{(record) => <CardsView.Card record={record}>…</CardsView.Card>}</CardsView.Grid>
 *   3. Static children — render whatever you like inside the grid container.
 */
import { jsx as _jsx } from "react/jsx-runtime";
var CardsGrid = _ref => {
  var children = _ref.children;
  var _useCardsContext = useCardsContext(),
    data = _useCardsContext.data;
  return /*#__PURE__*/_jsx("div", {
    className: "cards-view__grid",
    children: typeof children === 'function' ? data.map(record => /*#__PURE__*/_jsx("div", {
      children: children(record)
    }, record.id)) : children !== null && children !== void 0 ? children : data.map(record => /*#__PURE__*/_jsx(CardsCard, {
      record: record
    }, record.id))
  });
};
export default CardsGrid;