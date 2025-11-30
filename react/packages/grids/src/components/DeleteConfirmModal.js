import Dialog from './Dialog';

const DeleteConfirmModal = ({ open, onCancel, onConfirm, loading }) => (
  <Dialog isOpen={open} onClose={onCancel} title="Confirm Delete">
    <div style={{ marginBottom: '1.5rem' }}>
      Are you sure you want to delete this record? This action cannot be undone.
    </div>
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
      <button
        type="button"
        className="grid__btn"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="button"
        className="grid__btn grid__btn--delete"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  </Dialog>
);

export default DeleteConfirmModal;