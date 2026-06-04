import Dialog from "./Dialog";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var DeleteConfirmModal = _ref => {
  var open = _ref.open,
    onCancel = _ref.onCancel,
    onConfirm = _ref.onConfirm,
    loading = _ref.loading;
  return /*#__PURE__*/_jsxs(Dialog, {
    isOpen: open,
    onClose: onCancel,
    title: "Confirm Delete",
    children: [/*#__PURE__*/_jsx("div", {
      style: {
        marginBottom: '1.5rem'
      },
      children: "Are you sure you want to delete this record? This action cannot be undone."
    }), /*#__PURE__*/_jsxs("div", {
      style: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end'
      },
      children: [/*#__PURE__*/_jsx("button", {
        type: "button",
        className: "grid__btn",
        onClick: onCancel,
        disabled: loading,
        children: "Cancel"
      }), /*#__PURE__*/_jsx("button", {
        type: "button",
        className: "grid__btn grid__btn--delete",
        onClick: onConfirm,
        disabled: loading,
        children: loading ? 'Deleting...' : 'Delete'
      })]
    })]
  });
};
export default DeleteConfirmModal;