import { useState, useEffect } from 'react';
import { getOrders, createOrder, updateOrder, deleteOrder, getCustomers, getProducts } from '../api/client';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | order
  const [statusModal, setStatusModal] = useState(null);
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }], notes: '' });
  const [statusForm, setStatusForm] = useState({ status: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    getOrders().then(r => setOrders(r.data)),
    getCustomers().then(r => setCustomers(r.data)),
    getProducts().then(r => setProducts(r.data)),
  ]).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }], notes: '' });
    setError('');
    setModal('create');
  };

  const openStatus = (order) => {
    setStatusForm({ status: order.status });
    setStatusModal(order);
  };

  const closeModal = () => setModal(null);
  const closeStatus = () => setStatusModal(null);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, key, val) => setForm(f => ({
    ...f,
    items: f.items.map((item, idx) => idx === i ? { ...item, [key]: val } : item)
  }));

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        customer_id: parseInt(form.customer_id),
        items: form.items.filter(i => i.product_id).map(i => ({
          product_id: parseInt(i.product_id),
          quantity: parseInt(i.quantity)
        })),
        notes: form.notes || null,
      };
      await createOrder(payload);
      await load();
      closeModal();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateOrder(statusModal.id, statusForm);
      await load();
      closeStatus();
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order and restore inventory?')) return;
    try { await deleteOrder(id); await load(); }
    catch (e) { alert(e.response?.data?.detail || 'Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Order</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading…</div> : orders.length === 0 ? (
          <div className="empty"><div className="empty-icon">◎</div><div className="empty-text">No orders yet</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{o.id}</td>
                    <td><strong>{o.customer?.name || `#${o.customer_id}`}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.customer?.email}</div>
                    </td>
                    <td>{o.items?.length ?? 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{ color: 'var(--accent3)', fontWeight: 600 }}>${o.total_amount.toFixed(2)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-ghost btn-sm" onClick={() => openStatus(o)}>Status</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">New Order</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select className="form-select" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Order Items *</label>
              {form.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <select className="form-select" value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                        {p.name} — ${p.price.toFixed(2)} (stock: {p.stock_quantity})
                      </option>
                    ))}
                  </select>
                  <input className="form-input" type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                  {form.items.length > 1 && (
                    <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18 }} onClick={() => removeItem(i)}>×</button>
                  )}
                </div>
              ))}
              <button className="add-item-btn" onClick={addItem}>+ Add item</button>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes…" />
            </div>
            <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Placing…' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusModal && (
        <div className="modal-overlay" onClick={closeStatus}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className="modal-title">Update Order #{statusModal.id}</div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={statusForm.status} onChange={e => setStatusForm({ status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={closeStatus}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
