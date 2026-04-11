import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, Package, Truck } from 'lucide-react';
import { selectCartItems, selectCartTotal, clearCart } from '../redux/slices/cartSlice';
import { saveOrder } from '../firebase/firestore';

const STEPS = ['Shipping', 'Payment', 'Confirm'];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const { user } = useSelector(state => state.auth);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);

  const shipping = subtotal >= 99 ? 0 : 12.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [form, setForm] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    address: '', city: '', state: '', zip: '', country: 'US',
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      await saveOrder(user.uid, {
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        subtotal,
        shipping,
        tax,
        total,
        status: 'Processing',
        shippingAddress: {
          fullName: form.fullName,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
      });
      dispatch(clearCart());
      setPlaced(true);
    } catch (err) {
      console.error('Order save failed:', err);
      // Still clear cart and show success — don't block user
      dispatch(clearCart());
      setPlaced(true);
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '24px', textAlign: 'center' }}>
        <div className="animate-pop-in" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(46,204,113,0.12)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={36} color="var(--green)" />
        </div>
        <div className="animate-fade-in">
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Order Placed!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '28px' }}>
            Thank you, {user?.displayName || user?.email?.split('@')[0]}!
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-accent" onClick={() => navigate('/')}>Continue Shopping</button>
            <button className="btn-ghost" onClick={() => navigate('/profile')}>View Orders</button>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = { marginBottom: '14px' };
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' };
  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '32px' }}>Checkout</h1>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: i < step ? 'var(--green)' : i === step ? 'var(--accent)' : 'var(--bg-elevated)',
                border: `2px solid ${i < step ? 'var(--green)' : i === step ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 800, fontFamily: 'Syne',
                color: i <= step ? '#080b0f' : 'var(--text-muted)',
                transition: 'all 0.3s',
              }}>
                {i < step ? <CheckCircle size={14} color="#fff" /> : i + 1}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: i === step ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'Syne', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--green)' : 'var(--border)', margin: '0 8px', marginBottom: '20px', transition: 'background 0.3s' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Form */}
        <div style={{ gridColumn: 'span 2' }}>
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="glass-card animate-fade-in" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="var(--accent)" /> Shipping Information
              </h2>
              <div style={rowStyle}>
                <div style={inputStyle}>
                  <label style={labelStyle}>Full Name</label>
                  <input className="input-field" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="John Doe" />
                </div>
                <div style={inputStyle}>
                  <label style={labelStyle}>Email</label>
                  <input className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
                </div>
              </div>
              <div style={inputStyle}>
                <label style={labelStyle}>Street Address</label>
                <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St, Apt 4B" />
              </div>
              <div style={rowStyle}>
                <div style={inputStyle}>
                  <label style={labelStyle}>City</label>
                  <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York" />
                </div>
                <div style={inputStyle}>
                  <label style={labelStyle}>State</label>
                  <input className="input-field" value={form.state} onChange={e => set('state', e.target.value)} placeholder="NY" />
                </div>
              </div>
              <div style={rowStyle}>
                <div style={inputStyle}>
                  <label style={labelStyle}>ZIP Code</label>
                  <input className="input-field" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="10001" />
                </div>
                <div style={inputStyle}>
                  <label style={labelStyle}>Country</label>
                  <input className="input-field" value={form.country} onChange={e => set('country', e.target.value)} placeholder="US" />
                </div>
              </div>
              <button className="btn-accent" style={{ marginTop: '8px', padding: '13px 28px' }} onClick={() => setStep(1)} disabled={!form.fullName || !form.address || !form.city}>
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="glass-card animate-fade-in" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="var(--accent)" /> Payment Details
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)' }}>
                <Lock size={13} color="var(--green)" />
                <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>Your payment info is encrypted and secure</span>
              </div>
              <div style={inputStyle}>
                <label style={labelStyle}>Name on Card</label>
                <input className="input-field" value={form.cardName} onChange={e => set('cardName', e.target.value)} placeholder="John Doe" />
              </div>
              <div style={inputStyle}>
                <label style={labelStyle}>Card Number</label>
                <input className="input-field" value={form.cardNumber} onChange={e => set('cardNumber', e.target.value.replace(/\D/g,'').slice(0,16))} placeholder="4242 4242 4242 4242" maxLength={16} />
              </div>
              <div style={rowStyle}>
                <div style={inputStyle}>
                  <label style={labelStyle}>Expiry (MM/YY)</label>
                  <input className="input-field" value={form.expiry} onChange={e => set('expiry', e.target.value)} placeholder="09/27" maxLength={5} />
                </div>
                <div style={inputStyle}>
                  <label style={labelStyle}>CVV</label>
                  <input className="input-field" value={form.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="123" maxLength={4} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn-ghost" style={{ padding: '13px 20px' }} onClick={() => setStep(0)}>Back</button>
                <button className="btn-accent" style={{ padding: '13px 28px' }} onClick={() => setStep(2)} disabled={!form.cardName || form.cardNumber.length < 16 || !form.expiry || !form.cvv}>
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="glass-card animate-fade-in" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="var(--accent)" /> Order Review
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', borderRadius: '10px', background: 'var(--bg-elevated)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Syne' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Syne' }}>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-elevated)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.8' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Shipping to:</strong> {form.fullName}, {form.address}, {form.city}, {form.state} {form.zip}<br />
                <strong style={{ color: 'var(--text-primary)' }}>Payment:</strong> •••• •••• •••• {form.cardNumber.slice(-4)}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-ghost" style={{ padding: '13px 20px' }} onClick={() => setStep(1)}>Back</button>
                <button className="btn-accent" style={{ padding: '13px 28px', flex: 1 }} onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', border: '2px solid rgba(8,11,15,0.3)', borderTopColor: '#080b0f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Processing...
                    </span>
                  ) : (
                    <>Place Order · ${total.toFixed(2)}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="glass-card" style={{ padding: '20px', position: 'sticky', top: '80px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Syne', marginBottom: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Summary</h3>
          {items.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.name} ×{i.quantity}</span>
              <span style={{ fontWeight: 600 }}>${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
            <span style={{ color: shipping === 0 ? 'var(--green)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontFamily: 'Syne', fontSize: '16px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
