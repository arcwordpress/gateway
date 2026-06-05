import { useCardsContext } from "../../context/CardsContext";
import { jsxs as _jsxs } from "react/jsx-runtime";
var CardsFooter = () => {
  var _useCardsContext = useCardsContext(),
    data = _useCardsContext.data;
  return /*#__PURE__*/_jsxs("div", {
    className: "cards-view__footer",
    children: [data.length, " card(s)"]
  });
};
export default CardsFooter;