import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Pencil, Trash2, Upload, X, Check, Search,
  Package, Tag, DollarSign, Layers, AlignLeft,
  Image, Loader2, ShieldCheck, ChevronDown, BarChart2,
  ShoppingBag, Users, TrendingUp,
} from 'lucide-react';
import {
  addProduct, updateProduct, deleteProduct, fetchProducts,
} from '../firebase/firestore';
import { uploadToCloudinary } from '../cloudinary/config';
import { loadProducts, setItems } from '../redux/slices/productsSlice';
import { categories } from '../data/products';

const EMPTY_FORM = {
  name: '', price: '', category: 'Audio', description: '',
  badge: '', stock: '', image: '',
};

const STAT_CARDS = (products) => [
  { label: 'Total Products', value: products.length, icon: Package, color: 'var(--accent)' },
  { label: 'Categories', value: new Set(products.map(p => p.category)).size, icon: Layers, color: '#a78bfa' },
  { label: 'Low Stock', value: products.filter(p => p.stock <= 10).length, icon: TrendingUp, color: 'var(--red)' },
];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector(state => state.products);

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editing, setEditing] = useState(null); // product id or null
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    dispatch(loadProducts());
  }, [dispatch]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setImageFile(null);
    setImagePreview('');
    setView('form');
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      price: product.price || '',
      category: product.category || 'Audio',
      description: product.description || '',
      badge: product.badge || '',
      stock: product.stock || '',
      image: product.image || '',
    });
    setImagePreview(product.image || '');
    setImageFile(null);
    setEditing(product.id);
    setView('form');
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      showToast('Name, price, and category are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = form.image;

      // Upload new image to Cloudinary if one was selected
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(imageFile);
        setUploading(false);
      }

      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        category: form.category,
        description: form.description.trim(),
        badge: form.badge.trim() || null,
        stock: parseInt(form.stock) || 0,
        ...(editing ? {} : { rating: 0, reviews: 0 }),
        image: imageUrl,
      };

      if (editing) {
        await updateProduct(editing, payload);
        showToast('Product updated successfully!');
      } else {
        await addProduct(payload);
        showToast('Product added successfully!');
      }

      // Refresh products list in Redux
      const updated = await fetchProducts();
      dispatch(setItems(updated));
      setView('list');
    } catch (err) {
      showToast(err.message || 'Something went wrong.', 'error');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      const updated = await fetchProducts();
      dispatch(setItems(updated));
      showToast('Product deleted.');
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Styles ───────────────────────────────────────────────────────────────
  const label = (text) => (
    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
      {text}
    </label>
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 24px', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-dim)', border: '1px solid rgba(232,255,71,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={16} color="var(--accent)" />
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage your product catalogue</p>
        </div>
        {view === 'list' ? (
          <button className="btn-accent" onClick={openAdd} style={{ padding: '11px 22px' }}>
            <Plus size={16} /> Add Product
          </button>
        ) : (
          <button className="btn-ghost" onClick={() => setView('list')} style={{ padding: '10px 20px' }}>
            <X size={15} /> Cancel
          </button>
        )}
      </div>

      {/* Stats row */}
      {view === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {STAT_CARDS(products).map(({ label: lbl, value, icon: Icon, color }) => (
            <div key={lbl} className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Syne', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{lbl}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
      {view === 'list' && (
        <>
          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '20px' }}>
            <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '40px' }}
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
              <Loader2 size={22} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Loading products...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              <Package size={36} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p>No products found.</p>
            </div>
          ) : (
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 90px 80px 120px', gap: '12px', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Image', 'Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                ))}
              </div>

              {/* Table rows */}
              {filtered.map((product, i) => (
                <div
                  key={product.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr 100px 90px 80px 120px',
                    gap: '12px', padding: '14px 20px', alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={product.image} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} />

                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Syne', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                    {product.badge && <span className="badge" style={{ fontSize: '10px', marginTop: '3px', display: 'inline-block' }}>{product.badge}</span>}
                  </div>

                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{product.category}</span>

                  <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Syne' }}>${parseFloat(product.price).toFixed(2)}</span>

                  <span style={{ fontSize: '13px', color: product.stock <= 10 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                    {product.stock}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="qty-btn"
                      title="Edit"
                      onClick={() => openEdit(product)}
                      style={{ width: '32px', height: '32px' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,255,71,0.4)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="qty-btn"
                      title="Delete"
                      onClick={() => setConfirmDelete(product)}
                      disabled={deletingId === product.id}
                      style={{ width: '32px', height: '32px' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,71,87,0.4)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(255,71,87,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      {deletingId === product.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── FORM VIEW ─────────────────────────────────────────────────────── */}
      {view === 'form' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>

          {/* Left — main fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'Syne', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} color="var(--accent)" />
                {editing ? 'Edit Product' : 'New Product'}
              </h2>

              <div style={{ marginBottom: '14px' }}>
                {label('Product Name *')}
                <div style={{ position: 'relative' }}>
                  <Tag size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input-field" style={{ paddingLeft: '38px' }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Arc Wireless Headphones" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  {label('Price ($) *')}
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ paddingLeft: '34px' }} type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  {label('Category *')}
                  <div style={{ position: 'relative' }}>
                    <Layers size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <ChevronDown size={12} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <select className="input-field" style={{ paddingLeft: '38px', paddingRight: '32px', appearance: 'none', cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                {label('Description')}
                <div style={{ position: 'relative' }}>
                  <AlignLeft size={14} style={{ position: 'absolute', left: '13px', top: '14px', color: 'var(--text-muted)' }} />
                  <textarea
                    className="input-field"
                    style={{ paddingLeft: '38px', minHeight: '90px', resize: 'vertical' }}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Describe the product..."
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  {label('Badge')}
                  <input className="input-field" value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="e.g. New" />
                </div>
                <div>
                  {label('Stock')}
                  <input className="input-field" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          {/* Right — image upload + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'Syne', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Image size={16} color="var(--accent)" /> Product Image
              </h2>

              {/* Preview */}
              {imagePreview ? (
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border)' }} />
                  <button
                    onClick={() => { setImagePreview(''); setImageFile(null); set('image', ''); }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(8,11,15,0.8)', border: '1px solid var(--border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border)', borderRadius: '12px', padding: '40px 20px',
                    textAlign: 'center', cursor: 'pointer', marginBottom: '14px', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Upload size={28} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Click to upload image</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />

              <button className="btn-ghost" style={{ width: '100%', padding: '11px', fontSize: '13px' }} onClick={() => fileRef.current?.click()}>
                <Upload size={14} /> {imageFile ? 'Change Image' : 'Select Image'}
              </button>

              <div style={{ marginTop: '14px' }}>
                {label('Or paste image URL')}
                <input
                  className="input-field"
                  value={form.image}
                  onChange={e => { set('image', e.target.value); setImagePreview(e.target.value); setImageFile(null); }}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-accent"
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    {uploading ? 'Uploading image...' : 'Saving...'}
                  </>
                ) : (
                  <><Check size={15} /> {editing ? 'Save Changes' : 'Add Product'}</>
                )}
              </button>
              <button className="btn-ghost" style={{ width: '100%', padding: '12px' }} onClick={() => setView('list')}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
          <div className="glass-card animate-pop-in" style={{ padding: '28px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={22} color="var(--red)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Delete Product?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              "<strong>{confirmDelete.name}</strong>" will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost" style={{ flex: 1, padding: '12px' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                style={{ flex: 1, padding: '12px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={!!deletingId}
              >
                {deletingId ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="animate-slide-in" style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: 'var(--bg-elevated)', border: `1px solid ${toast.type === 'success' ? 'rgba(46,204,113,0.3)' : 'rgba(255,71,87,0.3)'}`,
          borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px',
          zIndex: 300, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', fontSize: '14px',
        }}>
          {toast.type === 'success'
            ? <Check size={16} color="var(--green)" />
            : <X size={16} color="var(--red)" />}
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
