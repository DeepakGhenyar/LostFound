import {  Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protect routes - only logged-in users can access
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
