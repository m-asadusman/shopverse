import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Loader2, ShieldOff } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, role, loading } = useSelector(state => state.auth);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role !== 'admin') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldOff size={28} color="var(--red)" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '320px' }}>
          You don't have admin privileges. Contact the site owner to get access.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
}
