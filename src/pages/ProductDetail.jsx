import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, ArrowLeft, Check, Package, Zap, ChevronRight } from 'lucide-react';
import { addToCart, selectCartItems } from '../redux/slices/cartSlice';
import Toast from '../components/Toast';
import ProductCard from '../components/ProductCard';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const { items: products } = useSelector(state => state.products);
  const { toast, showToast } = useToast();
  const [added, setAdded] = useState(false);

  const product = products.find(p => String(p.id) === String(id));
  const related = products.filter(p => String(p.id) !== String(id) && p.category === product?.category).slice(0, 4);
  const inCart = cartItems.some(i => String(i.id) === String(id));

  if (!product) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <h2 style={{ color: 'var(--text-secondary)' }}>Product not found</h2>
        <button className="btn-accent" onClick={() => navigate('/')}>Back to Shop</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    showToast(`${product.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: 0, fontFamily: 'DM Sans' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={14} /> Home
        </button>
        <ChevronRight size={12} color="var(--text-muted)" />
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{product.category}</span>
        <ChevronRight size={12} color="var(--text-muted)" />
        <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</span>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', marginBottom: '64px' }} className="animate-fade-in">
        {/* Image */}
        <div style={{ position: 'relative' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', aspectRatio: '4/3' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {product.badge && (
            <span className="badge" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '12px' }}>{product.badge}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Syne', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.2, marginTop: '8px', letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>
          </div>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{product.description}</p>

          {/* Features */}
          {product.features?.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontFamily: 'Syne', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Key Features</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {product.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(232,255,71,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color="var(--accent)" />
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '9px', background: product.stock > 10 ? 'rgba(46,204,113,0.08)' : 'rgba(255,71,87,0.08)', border: `1px solid ${product.stock > 10 ? 'rgba(46,204,113,0.2)' : 'rgba(255,71,87,0.2)'}` }}>
            <Package size={14} color={product.stock > 10 ? 'var(--green)' : 'var(--red)'} />
            <span style={{ fontSize: '13px', color: product.stock > 10 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {product.stock > 10 ? `In Stock (${product.stock} available)` : `Low Stock — Only ${product.stock} left!`}
            </span>
          </div>

          {/* Price + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '36px', fontFamily: 'Syne', fontWeight: 800, letterSpacing: '-0.02em' }}>
              ${parseFloat(product.price).toFixed(2)}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn-accent" onClick={handleAddToCart} style={{ flex: 1, minWidth: '160px', padding: '14px 24px', fontSize: '15px' }}>
                {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                {added ? 'Added to Cart!' : inCart ? 'Add More to Cart' : 'Add to Cart'}
              </button>
              <button className="btn-ghost" onClick={() => { dispatch(addToCart(product)); navigate('/cart'); }} style={{ padding: '14px 20px' }}>
                <Zap size={15} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '4px', height: '22px', background: 'var(--accent)', borderRadius: '2px', display: 'inline-block' }} />
            More in {product.category}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {related.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={(name) => showToast(`${name} added to cart`)} />
            ))}
          </div>
        </section>
      )}

      <Toast toast={toast} onClose={() => {}} />
    </div>
  );
}
