import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      className="animate-slide-in"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: 'var(--bg-elevated)',
        border: `1px solid ${isSuccess ? 'rgba(46,204,113,0.3)' : 'rgba(255,71,87,0.3)'}`,
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 1000,
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        maxWidth: '340px',
      }}
    >
      {isSuccess
        ? <CheckCircle size={18} color="var(--green)" />
        : <AlertCircle size={18} color="var(--red)" />
      }
      <span style={{ fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>{toast.message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
        <X size={14} />
      </button>
    </div>
  );
}
