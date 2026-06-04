function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import React, { useRef, useState, useEffect } from 'react';
import { useGatewayForm } from "../../utils/gatewayFormContext";
import "./style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function Field(_ref) {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config,
    name = _ref.name,
    children = _ref.children,
    fieldControl = _ref.fieldControl;
  var labelRef = useRef(null);
  var helpRef = useRef(null);
  var headerRef = useRef(null);
  var bodyRef = useRef(null);
  var controlRef = useRef(null);
  var footerRef = useRef(null);
  var instructionsRef = useRef(null);
  var _useGatewayForm = useGatewayForm(),
    registerFieldRefs = _useGatewayForm.registerFieldRefs,
    unregisterFieldRefs = _useGatewayForm.unregisterFieldRefs;
  useEffect(() => {
    if (config.name) {
      registerFieldRefs(config.name, {
        label: labelRef,
        help: helpRef,
        header: headerRef,
        body: bodyRef,
        control: controlRef,
        footer: footerRef,
        instructions: instructionsRef
      });
      return () => {
        unregisterFieldRefs(config.name);
      };
    }
  }, [config.name, registerFieldRefs, unregisterFieldRefs]);

  // Render a consumer composition if children are provided.
  if (children) {
    return /*#__PURE__*/_jsx("div", {
      className: "field",
      children: children
    });
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "field",
    children: [/*#__PURE__*/_jsxs(Field.Header, {
      innerRef: headerRef,
      children: [config.label && /*#__PURE__*/_jsx(Field.Label, {
        label: config.label,
        innerRef: labelRef
      }), config.help && /*#__PURE__*/_jsx(Field.Help, {
        help: config.help,
        innerRef: helpRef
      })]
    }), /*#__PURE__*/_jsx(Field.Body, {
      innerRef: bodyRef,
      children: /*#__PURE__*/_jsx(Field.Control, {
        fieldControl: fieldControl,
        innerRef: controlRef
      })
    }), /*#__PURE__*/_jsx(Field.Footer, {
      innerRef: footerRef,
      children: config.instructions && /*#__PURE__*/_jsx(Field.Instructions, {
        instructions: config.instructions,
        innerRef: instructionsRef
      })
    })]
  });
}
Field.Label = function Label(_ref2) {
  var label = _ref2.label,
    innerRef = _ref2.innerRef;
  if (!label) return null;
  return /*#__PURE__*/_jsx("label", {
    ref: innerRef,
    className: "field__label",
    children: label
  });
};
Field.Help = function Help(_ref3) {
  var help = _ref3.help,
    innerRef = _ref3.innerRef;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isOpen = _useState2[0],
    setIsOpen = _useState2[1];
  var popoverRef = useRef(null);
  if (!help) return null;
  var toggle = () => setIsOpen(prev => !prev);
  var handleClickOutside = e => {
    if (popoverRef.current && !popoverRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  return /*#__PURE__*/_jsxs("div", {
    ref: innerRef,
    className: "field__help",
    style: {
      position: 'relative',
      display: 'inline-block'
    },
    children: [/*#__PURE__*/_jsx("button", {
      type: "button",
      onClick: toggle,
      "aria-label": "Show help",
      className: "field__help-icon",
      children: /*#__PURE__*/_jsx("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 32 32",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: /*#__PURE__*/_jsx("path", {
          d: "M16 0C7.1632 0 0 7.16373 0 16C0 24.8363 7.1632 32 16 32C24.8363 32 32 24.8363 32 16C32 7.16373 24.8363 0 16 0ZM18.4331 26.0581C18.4331 26.3531 18.1947 26.5915 17.8997 26.5915H14.2811C13.9867 26.5915 13.7477 26.3531 13.7477 26.0581V22.5611C13.7477 22.2661 13.9867 22.0277 14.2811 22.0277H17.8997C18.1947 22.0277 18.4331 22.2661 18.4331 22.5611V26.0581ZM21.784 14.0763C21.4459 14.5595 20.8341 15.1429 19.9136 15.8597L19.0581 16.5253C18.6741 16.8235 18.4293 17.1541 18.3088 17.5371C18.2539 17.7083 18.1867 18.0683 18.1771 18.8101C18.1728 19.1019 17.9355 19.336 17.6437 19.336H14.3659C14.2213 19.336 14.0827 19.2773 13.9819 19.1728C13.8816 19.0688 13.8277 18.9285 13.8325 18.784C13.8832 17.3461 14.0224 16.3632 14.2576 15.7781C14.5045 15.1637 15.0875 14.504 16.0384 13.7611L16.9296 13.064C17.168 12.8864 17.3627 12.6885 17.5157 12.4667C17.7723 12.1099 17.8976 11.7333 17.8976 11.3152C17.8976 10.8107 17.7536 10.3637 17.4581 9.94827C17.208 9.59573 16.6949 9.41707 15.9333 9.41707C15.1899 9.41707 14.688 9.64 14.3989 10.0976C14.0608 10.6368 13.8965 11.1771 13.8965 11.7499C13.8965 12.0443 13.6576 12.2832 13.3632 12.2832H9.86667C9.7216 12.2832 9.5824 12.224 9.4816 12.1189C9.38133 12.0144 9.32747 11.8731 9.33387 11.7275C9.43733 9.25653 10.3301 7.4688 11.9856 6.4144C13.0203 5.74827 14.2981 5.41067 15.7824 5.41067C17.7083 5.41067 19.3413 5.88427 20.6368 6.8176C21.984 7.78987 22.6672 9.23787 22.6672 11.1211C22.6667 12.2784 22.3675 13.2757 21.784 14.0763Z",
          fill: "currentColor"
        })
      })
    }), isOpen && /*#__PURE__*/_jsxs("div", {
      ref: popoverRef,
      className: "field__help-popover",
      style: {
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
        background: '#333',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        maxWidth: '300px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        whiteSpace: 'normal'
      },
      role: "tooltip",
      children: [help, /*#__PURE__*/_jsx("div", {
        style: {
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid #333'
        }
      })]
    })]
  });
};
Field.Header = function Header(_ref4) {
  var children = _ref4.children,
    innerRef = _ref4.innerRef;
  if (!children) return null;
  return /*#__PURE__*/_jsx("div", {
    ref: innerRef,
    className: "field__header",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    children: children
  });
};
Field.Body = function Body(_ref5) {
  var children = _ref5.children,
    innerRef = _ref5.innerRef;
  return /*#__PURE__*/_jsx("div", {
    ref: innerRef,
    className: "field__body",
    children: children
  });
};
Field.Control = function Control(_ref6) {
  var fieldControl = _ref6.fieldControl,
    innerRef = _ref6.innerRef;
  if (!fieldControl || typeof fieldControl !== 'object' && typeof fieldControl !== 'function') {
    return null;
  }
  if (/*#__PURE__*/React.isValidElement(fieldControl)) {
    return /*#__PURE__*/_jsx("div", {
      ref: innerRef,
      className: "field__control",
      children: fieldControl
    });
  }
  if (typeof fieldControl === 'function') {
    return /*#__PURE__*/_jsx("div", {
      ref: innerRef,
      className: "field__control",
      children: fieldControl()
    });
  }
  return null;
};
Field.Footer = function Footer(_ref7) {
  var children = _ref7.children,
    innerRef = _ref7.innerRef;
  if (!children) return null;
  return /*#__PURE__*/_jsx("div", {
    ref: innerRef,
    className: "field__footer",
    children: children
  });
};
Field.Instructions = function Instructions(_ref8) {
  var instructions = _ref8.instructions,
    innerRef = _ref8.innerRef;
  if (!instructions) return null;
  return /*#__PURE__*/_jsx("div", {
    ref: innerRef,
    className: "field__instructions",
    children: instructions
  });
};
export default Field;