import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var Modal = _ref => {
  var isOpen = _ref.isOpen,
    onClose = _ref.onClose,
    title = _ref.title,
    children = _ref.children;
  var modalRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    var handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return /*#__PURE__*/createPortal(/*#__PURE__*/_jsx("div", {
    className: "modal-overlay",
    onClick: onClose,
    children: /*#__PURE__*/_jsxs("div", {
      className: "modal-content",
      onClick: e => e.stopPropagation(),
      ref: modalRef,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "modal-title",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "modal-header",
        children: [title && /*#__PURE__*/_jsx("h2", {
          id: "modal-title",
          className: "modal-title",
          children: title
        }), /*#__PURE__*/_jsx("button", {
          className: "modal-close",
          onClick: onClose,
          "aria-label": "Close modal",
          children: "\xD7"
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "modal-body",
        children: children
      })]
    })
  }), document.body);
};
export default Modal;