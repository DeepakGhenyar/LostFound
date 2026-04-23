import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'  // ← useNavigate add karo
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()  // ← ye add karo
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await API.post('/login', form)
      if (data.success) {
        login(data.user, data.token)
        navigate('/dashboard', { replace: true })  // ← ye add karo
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  // ... baaki same
}