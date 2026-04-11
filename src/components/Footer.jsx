import { Link } from 'react-router-dom';
import { Zap, Globe, MessageCircle, Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: '80px', padding: '48px 24px 32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '26px', height: '26px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="#080b0f" fill="#080b0f" />
              </div>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '16px' }}>
                SHOP<span style={{ color: 'var(--accent)' }}>VERSE</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '200px' }}>
              Premium tech gear for the modern workspace.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Shop</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['All Products', 'Audio', 'Peripherals', 'Displays', 'Accessories'].map(item => (
                <Link key={item} to="/" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >{item}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Login', 'Sign Up', 'Profile', 'Orders'].map(item => (
                <Link key={item} to={`/${item.toLowerCase().replace(' ', '')}`} style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >{item}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Follow</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[Globe, MessageCircle, Camera].map((Icon, i) => (
                <button key={i} className="qty-btn" style={{ width: '36px', height: '36px' }}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>© 2025 Shopverse. All rights reserved.</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Built with React + Vite</span>
        </div>
      </div>
    </footer>
  );
}
