import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, LogOut, Zap, Menu, X, ShieldCheck } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { logout } from '../redux/slices/authSlice';
import { selectCartCount } from '../redux/slices/cartSlice';
import { useState } from 'react';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);
  const { user, role } = useSelector(state => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = role === 'admin';

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,11,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#080b0f" fill="#080b0f" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            SHOP<span style={{ color: 'var(--accent)' }}>VERSE</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Home</NavLink>
          {user && !isAdmin && <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Profile</NavLink>}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={13} color="var(--accent)" /> Admin
              </span>
            </NavLink>
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Cart — hidden for admin */}
          {!isAdmin && (
            <Link to="/cart" style={{ position: 'relative', padding: '8px', display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="badge animate-pop-in" style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '10px', padding: '1px 5px', minWidth: '18px', textAlign: 'center' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to={isAdmin ? '/admin' : '/profile'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isAdmin ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: isAdmin ? '#080b0f' : 'var(--text-primary)', fontFamily: 'Syne' }}>
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                {isAdmin && <ShieldCheck size={12} color="var(--accent)" />}
              </Link>
              <button onClick={handleLogout} className="qty-btn" title="Logout" style={{ width: '36px', height: '36px' }}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login"><button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>Login</button></Link>
              <Link to="/signup"><button className="btn-accent" style={{ padding: '8px 16px', fontSize: '13px' }}>Sign Up</button></Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="qty-btn"
            style={{ display: 'none', width: '36px', height: '36px' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-btn"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Home</NavLink>
          {user && !isAdmin && <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Profile</NavLink>}
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Admin</NavLink>}
          {!isAdmin && <NavLink to="/cart" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Cart ({cartCount})</NavLink>}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
