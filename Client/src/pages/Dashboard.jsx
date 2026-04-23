import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

// ─── Navbar Component ──────────────────────────
function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="icon">🔍</span>
        <span>Lost &amp; Found</span>
      </div>
      <div className="navbar-right">
        <span className="user-badge">👤 {user?.name}</span>
        <button id="logout-btn" className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

// ─── Item Card Component ───────────────────────
function ItemCard({ item, currentUserId, onEdit, onDelete }) {
  const isOwner = item.postedBy?._id === currentUserId || item.postedBy === currentUserId
  const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-IN') : 'N/A'

  return (
    <div className="item-card">
      <div className="item-card-header">
        <span className="item-name">{item.itemName}</span>
        <span className={`badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>
          {item.type}
        </span>
      </div>
      <p className="item-desc">{item.description}</p>
      <div className="item-meta">
        <div className="item-meta-row">
          <span className="meta-icon">📍</span>
          <span>{item.location}</span>
        </div>
        <div className="item-meta-row">
          <span className="meta-icon">📅</span>
          <span>{dateStr}</span>
        </div>
        <div className="item-meta-row">
          <span className="meta-icon">📞</span>
          <span>{item.contactInfo}</span>
        </div>
        <div className="item-meta-row">
          <span className="meta-icon">👤</span>
          <span>{item.postedBy?.name || 'Unknown'}</span>
        </div>
      </div>
      {isOwner && (
        <div className="item-actions">
          <button
            id={`edit-btn-${item._id}`}
            className="btn btn-edit btn-sm"
            onClick={() => onEdit(item)}
          >
            ✏️ Edit
          </button>
          <button
            id={`delete-btn-${item._id}`}
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(item._id)}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Edit Modal Component ──────────────────────
function EditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    itemName: item.itemName,
    description: item.description,
    type: item.type,
    location: item.location,
    contactInfo: item.contactInfo,
    date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await API.put(`/items/${item._id}`, form)
      if (data.success) {
        onSave(data.item)
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✏️ Edit Item</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

        <div className="form-group">
          <label>Item Name</label>
          <input name="itemName" value={form.itemName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>
        <div className="form-group">
          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Contact Info</label>
          <input name="contactInfo" value={form.contactInfo} onChange={handleChange} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            id="save-edit-btn"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Page ────────────────────────────
export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [editItem, setEditItem] = useState(null)

  const [form, setForm] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactInfo: '',
  })
  const [addLoading, setAddLoading] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let url = '/items'
      const params = []
      if (search) params.push(`name=${encodeURIComponent(search)}`)
      if (filterType) params.push(`category=${filterType}`)
      if (params.length > 0) url = `/items/search?${params.join('&')}`

      console.log('📡 Fetching items from:', url)
      const { data } = await API.get(url)
      console.log('✅ Items fetched:', data)
      setItems(data.items || [])
    } catch (err) {
      console.error('❌ Fetch items error:', err.response?.status, err.message)
      // ⚠️ DO NOT auto-logout on 401 — just show an error
      // The user is already authenticated, the server might just be having issues
      if (err.response?.status === 401) {
        setError('Session may have expired. Try logging out and back in.')
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setError('Cannot connect to server. Make sure backend is running.')
      } else {
        setError('Failed to load items. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [search, filterType])

  useEffect(() => {
    console.log('📋 Dashboard mounted | User:', user?.name, '| Token:', token ? 'present' : 'missing')
    fetchItems()
  }, [fetchItems])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await API.post('/items', form)
      if (data.success) {
        setSuccess('Item reported successfully!')
        setForm({ itemName: '', description: '', type: 'Lost', location: '', date: new Date().toISOString().split('T')[0], contactInfo: '' })
        fetchItems()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item')
    } finally {
      setAddLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await API.delete(`/items/${id}`)
      setItems((prev) => prev.filter((i) => i._id !== id))
      setSuccess('Item deleted!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleEditSave = (updatedItem) => {
    setItems((prev) => prev.map((i) => (i._id === updatedItem._id ? updatedItem : i)))
    setSuccess('Item updated!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const totalItems = items.length
  const lostCount = items.filter((i) => i.type === 'Lost').length
  const foundCount = items.filter((i) => i.type === 'Found').length

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h2>
            Welcome back, <span className="gradient-text">{user?.name}</span>! 👋
          </h2>
          <p>Manage lost and found items across the campus</p>
        </div>

        {/* Alerts */}
        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
        {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{totalItems}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: 'var(--error)' }}>{lostCount}</div>
            <div className="stat-label">Lost Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: 'var(--success)' }}>{foundCount}</div>
            <div className="stat-label">Found Items</div>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="add-item-card">
          <h3>📦 Report an Item</h3>
          <form onSubmit={handleAddItem}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="itemName">Item Name</label>
                <input
                  id="itemName"
                  type="text"
                  placeholder="e.g. Blue Backpack"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Describe the item in detail..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Library, Block A"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="contactInfo">Contact Info</label>
                <input
                  id="contactInfo"
                  type="text"
                  placeholder="Phone number or email"
                  value={form.contactInfo}
                  onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                  required
                />
              </div>
            </div>
            <button
              id="add-item-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: 'auto', marginTop: '0.5rem' }}
              disabled={addLoading}
            >
              {addLoading ? 'Reporting...' : '➕ Report Item'}
            </button>
          </form>
        </div>

        {/* Search & Filter */}
        <div className="search-bar">
          <input
            id="search-input"
            type="text"
            placeholder="🔍 Search items by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            id="filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>

        {/* Items List */}
        <div className="items-section">
          <h3>📋 All Items ({totalItems})</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem' }}>Loading items...</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No items found. Be the first to report one!</p>
                </div>
              ) : (
                items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    currentUserId={user?.id}
                    onEdit={setEditItem}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
