import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, X } from 'lucide-react';
import { removeFromCart, increaseQuantity, decreaseQuantity, clearCart, selectCartItems, selectCartTotal } from '../redux/slices/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const { user } = useSelector(state => state.auth);

  const shipping = total >= 99 ? 0 : 12.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '24px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={32} color="var(--text-muted)" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Add some products to get started.</p>
        <Link to="/"><button className="btn-accent">Continue Shopping</button></Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Your Cart
          <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '12px' }}>({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </h1>
        <button onClick={() => dispatch(clearCart())} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'DM Sans', transition: 'color 0.2s', padding: '6px 10px', borderRadius: '8px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: 'span 2' }}>
          {items.map(item => (
            <div key={item.id} className="glass-card animate-fade-in" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>

              <Link to={`/product/${item.id}`}>
                <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.target.style.opacity = '0.8'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                />
              </Link>


              <div style={{ flex: 1, minWidth: '160px' }}>
                <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.category}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne', marginTop: '2px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                  >{item.name}</div>
                </Link>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>${item.price.toFixed(2)} each</div>
              </div>


              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="qty-btn" onClick={() => dispatch(decreaseQuantity(item.id))}>
                  <Minus size={13} />
                </button>
                <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'Syne', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                <button className="qty-btn" onClick={() => dispatch(increaseQuantity(item.id))}>
                  <Plus size={13} />
                </button>
              </div>


              <div style={{ minWidth: '90px', textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'Syne' }}>${(item.price * item.quantity).toFixed(2)}</div>
              </div>


              <button onClick={() => dispatch(removeFromCart(item.id))} className="qty-btn" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,71,87,0.4)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(255,71,87,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>


        <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '80px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', fontFamily: 'Syne' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span style={{ fontWeight: 600 }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--green)' : 'var(--text-primary)' }}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {shipping > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '8px 10px' }}>
                Add ${(99 - total).toFixed(2)} more for free shipping
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tax (8%)</span>
              <span style={{ fontWeight: 600 }}>${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="divider" style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Syne' }}>Total</span>
            <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Syne', color: 'var(--accent)' }}>${orderTotal.toFixed(2)}</span>
          </div>

          <button
            className="btn-accent"
            style={{ width: '100%', padding: '15px', fontSize: '15px' }}
            onClick={() => user ? navigate('/checkout') : navigate('/login', { state: { from: { pathname: '/checkout' } } })}
          >
            {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            <ArrowRight size={16} />
          </button>

          <Link to="/"><button className="btn-ghost" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>Continue Shopping</button></Link>
        </div>
      </div>
    </div>
  );
}
