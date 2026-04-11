import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Check, Zap } from 'lucide-react';
import { addToCart, selectCartItems } from '../redux/slices/cartSlice';
import { useState } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const inCart = cartItems.some(i => i.id === product.id);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addToCart(product));
    onAddToCart?.(product.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
          {product.badge && (
            <span className="badge" style={{ position: 'absolute', top: '12px', left: '12px' }}>
              {product.badge}
            </span>
          )}
          {product.stock <= 10 && (
            <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,71,87,0.9)', color: '#fff', fontSize: '11px', fontWeight: 700, borderRadius: '6px', padding: '2px 8px', fontFamily: 'Syne' }}>
              Low Stock
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, fontFamily: 'Syne', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {product.category}
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.3', fontFamily: 'Syne' }}>
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} fill={s <= Math.round(product.rating) ? 'var(--accent)' : 'none'} color={s <= Math.round(product.rating) ? 'var(--accent)' : 'var(--text-muted)'} />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{product.rating} ({product.reviews})</span>
          </div>

          {/* Price + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>
              ${product.price.toFixed(2)}
            </span>
            <button
              className="btn-accent"
              onClick={handleAdd}
              style={{ padding: '9px 14px', fontSize: '13px', borderRadius: '9px' }}
            >
              {added ? <Check size={14} /> : <ShoppingCart size={14} />}
              {added ? 'Added!' : inCart ? 'Add More' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
