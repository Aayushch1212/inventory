import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/client';

const empty = { name: '', sku: '', description: '', price: '', stock_quantity: '', category: '' };

function stockClass(qty) {
  if (qty === 0) return 'stock-low';
  if (qty <= 5) return 'stock-warn';
  return 'stock-ok';
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setError(''); setModal('create'); };
  const openEdit = (p) => { setForm({ ...p, price: p.price, stock_quantity: p.stock_quantity }); setError(''); setModal(p); };
  const closeModal = () => setModal(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) };
      if (modal === 'create') await createProduct(payload);
      else await updateProduct(modal.id, payload);
      await load();
      closeModal();
    } catch (e) {
      setError(e.response?.data?.detail || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await deleteProduct(id); await load(); }
    catch (e) { alert(e.response?.data?.detail || 'Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Product</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading…</div> : products.length === 0 ? (
          <div className="empty"><div className="empty-icon">◈</div><div className="empty-text">No products yet</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>SKU</th><th>Category</th>
                  <th>Price</th><th>Stock</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong>{p.description && <div style={{color:'var(--text-muted)',fontSize:11,marginTop:2}}>{p.description.slice(0,60)}</div>}</td>
                    <td><span className="sku-tag">{p.sku}</span></td>
                    <td>{p.category || '—'}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td><span className={stockClass(p.stock_quantity)}>{p.stock_quantity}</span></td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal === 'create' ? 'New Product' : 'Edit Product'}</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
              </div>
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input className="form-input" name="sku" value={form.sku} onChange={handleChange} placeholder="PROD-001" disabled={modal !== 'create'} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" value={form.description || ''} onChange={handleChange} placeholder="Optional description" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price *</label>
                <input className="form-input" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input className="form-input" name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" name="category" value={form.category || ''} onChange={handleChange} placeholder="Electronics, Apparel…" />
            </div>
            <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving…' : modal === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
