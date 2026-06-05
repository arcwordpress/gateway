import { jsx as _jsx } from "react/jsx-runtime";
var CardsCardBody = _ref => {
  var record = _ref.record;
  if (!record.description) return null;
  return /*#__PURE__*/_jsx("div", {
    className: "cards-view__card-body",
    children: /*#__PURE__*/_jsx("div", {
      className: "cards-view__card-description",
      children: record.description
    })
  });
};
export default CardsCardBody;