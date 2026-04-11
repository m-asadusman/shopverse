import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { logout } from '../redux/slices/authSlice';
import { fetchUserOrders } from '../firebase/firestore';
import { selectCartItems, selectCartTotal } from '../redux/slices/cartSlice';
import { LogOut, ShoppingBag, User, Mail, Calendar, Package, ArrowRight, ShoppingCart, Loader2 } from 'lucide-react';
const STATUS_COLORS = {
  Processing: '#f59e0b',
  Shipped: '#3b82f6',
  Delivered: 'var(--green)',
  Cancelled: 'var(--red)',
};

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useSelector(state => state.auth);

  // Admins don't have a profile page — redirect to dashboard
  useEffect(() => {
    if (role === 'admin') navigate('/admin', { replace: true });
  }, [role, navigate]);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    setOrdersLoading(true);
    fetchUserOrders(user.uid)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user?.uid]);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  const joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const STATS = [
    { label: 'Orders Placed', value: ordersLoading ? '—' : orders.length, icon: Package },
    { label: 'Items in Cart', value: cartItems.reduce((s, i) => s + i.quantity, 0), icon: ShoppingCart },
    { label: 'Cart Value', value: `$${cartTotal.toFixed(2)}`, icon: ShoppingBag },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div className="glass-card animate-fade-in" style={{ padding: '32px', marginBottom: '24px', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 0 4px var(--accent-dim)' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#080b0f', fontFamily: 'Syne' }}>
              {user.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {user.displayName || 'Account'}
            </h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <Mail size={13} /> {user.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <Calendar size={13} /> Member since {joinDate}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {STATS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon size={18} color="var(--accent)" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Syne', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Cart summary */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'Syne', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={16} color="var(--accent)" /> Current Cart
            </h2>
            <Link to="/cart" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              View <ArrowRight size={12} />
            </Link>
          </div>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Your cart is empty.{' '}
              <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Shop now</Link>
            </div>
          ) : (
            <>
              {cartItems.slice(0, 3).map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Syne', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>×{item.quantity} · ${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {cartItems.length > 3 && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>+{cartItems.length - 3} more items</div>}
              <Link to="/checkout">
                <button className="btn-accent" style={{ width: '100%', marginTop: '8px', padding: '11px' }}>
                  Checkout · ${cartTotal.toFixed(2)} <ArrowRight size={14} />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Order history — real from Firestore */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'Syne', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Package size={16} color="var(--accent)" /> Order History
          </h2>

          {ordersLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '8px', color: 'var(--text-muted)' }}>
              <Loader2 size={16} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px' }}>Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <Package size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>No orders yet.</p>
              <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px' }}>Start shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orders.map(order => {
                const date = order.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—';
                const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                const statusColor = STATUS_COLORS[order.status] || 'var(--text-muted)';
                return (
                  <div key={order.id} style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'Syne', marginBottom: '2px', color: 'var(--text-primary)' }}>
                        {order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {date} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>${parseFloat(order.total).toFixed(2)}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: statusColor }}>{order.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'Syne', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <User size={16} color="var(--accent)" /> Account Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Display Name', value: user.displayName || 'Not set' },
              { label: 'Email', value: user.email },
              { label: 'User ID', value: user.uid?.slice(0, 12) + '...' },
              { label: 'Account Type', value: 'Standard' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
