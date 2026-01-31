"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _Logo = _interopRequireDefault(require("./Logo"));
var _Menu = _interopRequireDefault(require("./Menu"));
var _Buttons = _interopRequireDefault(require("./Buttons"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function Header(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/React.createElement("header", {
    className: "gty-admin-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gty-admin-header__container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gty-admin-header__row"
  }, children)));
}
Header.Logo = _Logo["default"];
Header.Menu = _Menu["default"];
Header.Buttons = _Buttons["default"];
var _default = exports["default"] = Header;