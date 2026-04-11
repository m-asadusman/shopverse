import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, ArrowLeft, Star, Check, Package, Zap, ChevronRight, Send, Loader2 } from 'lucide-react';
import { addToCart, selectCartItems } from '../redux/slices/cartSlice';
import Toast from '../components/Toast';
import ProductCard from '../components/ProductCard';
import { useToast } from '../hooks/useToast';
import { useState, useEffect } from 'react';
import {
  fetchProductReviews,
  submitReview,
  hasUserReviewedProduct,
  hasUserPurchasedProduct,
} from '../firebase/firestore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const { items: products } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  const { toast, showToast } = useToast();
  const [added, setAdded] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false); // purchased but not yet reviewed
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const product = products.find(p => String(p.id) === String(id));
  const related = products.filter(p => String(p.id) !== String(id) && p.category === product?.category).slice(0, 4);
  const inCart = cartItems.some(i => String(i.id) === String(id));

  // Load reviews and check purchase/review status
  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    fetchProductReviews(id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));

    if (user) {
      Promise.all([
        hasUserPurchasedProduct(user.uid, id),
        hasUserReviewedProduct(user.uid, id),
      ]).then(([purchased, reviewed]) => {
        setAlreadyReviewed(reviewed);
        setCanReview(purchased && !reviewed);
      }).catch(() => {});
    }
  }, [id, product, user]);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    showToast(`${product.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleSubmitReview = async () => {
    if (!myRating) { showToast('Please select a star rating.', 'error'); return; }
    setSubmitting(true);
    try {
      await submitReview({
        productId: id,
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0],
        rating: myRating,
        comment: comment.trim(),
      });
      const updated = await fetchProductReviews(id);
      setReviews(updated);
      setCanReview(false);
      setAlreadyReviewed(true);
      setMyRating(0);
      setComment('');
      showToast('Review submitted!');
    } catch (err) {
      showToast('Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <h2 style={{ color: 'var(--text-secondary)' }}>Product not found</h2>
        <button className="btn-accent" onClick={() => navigate('/')}>Back to Shop</button>
      </div>
    );
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

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

          {/* Rating summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16}
                  fill={avgRating && s <= Math.round(parseFloat(avgRating)) ? 'var(--accent)' : 'none'}
                  color={avgRating && s <= Math.round(parseFloat(avgRating)) ? 'var(--accent)' : 'var(--text-muted)'}
                />
              ))}
            </div>
            {avgRating
              ? <><span style={{ fontSize: '14px', fontWeight: 600 }}>{avgRating}</span><span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span></>
              : <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No reviews yet</span>
            }
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

      {/* ── Reviews Section ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '4px', height: '22px', background: 'var(--accent)', borderRadius: '2px', display: 'inline-block' }} />
          Customer Reviews
          {reviews.length > 0 && <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 400 }}>({reviews.length})</span>}
        </h2>

        {/* Write a review */}
        {canReview && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(232,255,71,0.15)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'Syne', marginBottom: '16px' }}>Leave a Review</h3>

            {/* Star picker */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Your Rating *</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    onClick={() => setMyRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', transition: 'transform 0.1s' }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Star
                      size={28}
                      fill={s <= (hoverRating || myRating) ? 'var(--accent)' : 'none'}
                      color={s <= (hoverRating || myRating) ? 'var(--accent)' : 'var(--text-muted)'}
                    />
                  </button>
                ))}
                {myRating > 0 && (
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', alignSelf: 'center', marginLeft: '8px' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][myRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Comment (optional)</div>
              <textarea
                className="input-field"
                style={{ minHeight: '80px', resize: 'vertical' }}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
              />
            </div>

            <button className="btn-accent" onClick={handleSubmitReview} disabled={submitting || !myRating} style={{ padding: '11px 22px' }}>
              {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Already reviewed */}
        {alreadyReviewed && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--green)' }}>
            <Check size={14} /> You've already reviewed this product.
          </div>
        )}

        {/* Not purchased nudge */}
        {user && !canReview && !alreadyReviewed && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Only verified buyers can leave a review.
          </div>
        )}

        {/* Not logged in nudge */}
        {!user && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span
              onClick={() => navigate('/login')}
              style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            >Sign in</span> and purchase this product to leave a review.
          </div>
        )}

        {/* Reviews list */}
        {reviewsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '32px', color: 'var(--text-muted)' }}>
            <Loader2 size={18} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px' }}>Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <Star size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px' }}>No reviews yet. Be the first to review this product.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map(review => {
              const date = review.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '';
              return (
                <div key={review.id} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>
                        {review.displayName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Syne' }}>{review.displayName}</div>
                        <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} fill={s <= review.rating ? 'var(--accent)' : 'none'} color={s <= review.rating ? 'var(--accent)' : 'var(--text-muted)'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{date}</span>
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{review.comment}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
