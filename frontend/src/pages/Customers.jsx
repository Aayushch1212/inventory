import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/client';

const empty = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setError(''); setModal('create'); };
  const openEdit = (c) => { setForm({ ...c }); setError(''); setModal(c); };
  const closeModal = () => setModal(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      if (modal === 'create') await createCustomer(form);
      else await updateCustomer(modal.id, form);
      await load();
      closeModal();
    } catch (e) {
      setError(e.response?.data?.detail || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await deleteCustomer(id); await load(); }
    catch (e) { alert(e.response?.data?.detail || 'Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Customer</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading…</div> : customers.length === 0 ? (
          <div className="empty"><div className="empty-icon">◉</div><div className="empty-text">No customers yet</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Since</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td style={{ color: 'var(--accent)' }}>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.address ? c.address.slice(0, 40) + (c.address.length > 40 ? '…' : '') : '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Del</button>
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
            <div className="modal-title">{modal === 'create' ? 'New Customer' : 'Edit Customer'}</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" value={form.phone || ''} onChange={handleChange} placeholder="+1 555 0100" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" name="address" value={form.address || ''} onChange={handleChange} placeholder="123 Main St" />
              </div>
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
