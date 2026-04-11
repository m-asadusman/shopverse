import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, SlidersHorizontal, ChevronDown, Zap, Shield, Truck, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import Toast from '../components/Toast';
import { setCategory, setSearch, setSortBy, loadProducts } from '../redux/slices/productsSlice';
import { categories } from '../data/products';
import { useToast } from '../hooks/useToast';

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const PERKS = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders over $99' },
  { icon: Shield, label: 'Secure Checkout', sub: '256-bit SSL encryption' },
  { icon: RotateCcw, label: '30-Day Returns', sub: 'Hassle-free policy' },
  { icon: Zap, label: 'Fast Dispatch', sub: 'Ships within 24 hours' },
];

export default function Home() {
  const dispatch = useDispatch();
  const { filteredItems, selectedCategory, searchQuery, sortBy, loading: storeLoading } = useSelector(state => state.products);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast, showToast } = useToast();

  useEffect(() => {
    dispatch(loadProducts()).finally(() => setPageLoading(false));
  }, [dispatch]);

  return (
    <div style={{ minHeight: '100vh' }}>

      <section style={{
        padding: '80px 24px 60px',
        background: 'linear-gradient(180deg, rgba(232,255,71,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }} className="animate-fade-in">
          <span className="badge" style={{ marginBottom: '16px', display: 'inline-block' }}>New Arrivals Weekly</span>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Tech Gear for the{' '}
            <span style={{ color: 'var(--accent)' }}>Modern Setup</span>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            Handpicked peripherals, audio, and accessories that elevate your workspace and workflow.
          </p>
          <a href="#products">
            <button className="btn-accent" style={{ fontSize: '15px', padding: '14px 32px' }}>
              <Zap size={16} fill="#080b0f" />
              Shop Now
            </button>
          </a>
        </div>
      </section>


      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0' }}>
          {PERKS.map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Syne', color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>


      <section id="products" style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => dispatch(setSearch(e.target.value))}
              />
            </div>


            <div style={{ position: 'relative' }}>
              <SlidersHorizontal size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <ChevronDown size={12} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select
                className="input-field"
                style={{ paddingLeft: '38px', paddingRight: '32px', appearance: 'none', cursor: 'pointer', minWidth: '180px' }}
                value={sortBy}
                onChange={e => dispatch(setSortBy(e.target.value))}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {filteredItems.length} product{filteredItems.length !== 1 ? 's' : ''}
            </span>
          </div>


          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => dispatch(setCategory(cat))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1px solid ${selectedCategory === cat ? 'var(--accent)' : 'var(--border)'}`,
                  background: selectedCategory === cat ? 'var(--accent-dim)' : 'transparent',
                  color: selectedCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>


        {pageLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <Search size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--text-secondary)' }}>No products found</h3>
            <p style={{ fontSize: '14px' }}>Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {filteredItems.map((product, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
                <ProductCard product={product} onAddToCart={(name) => showToast(`${name} added to cart`)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <Toast toast={toast} onClose={() => {}} />
    </div>
  );
}
