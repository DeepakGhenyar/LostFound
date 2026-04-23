import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore auth from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
        console.log('✅ Auth restored from localStorage for:', parsedUser.name)
      } else {
        console.log('ℹ️ No saved auth found in localStorage')
      }
    } catch (err) {
      console.error('❌ Error restoring auth:', err)
      // Corrupted data — clear it
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData, tokenData) => {
    console.log('🔑 Login called for:', userData?.name, '| Token:', tokenData ? 'present' : 'missing')
    localStorage.setItem('token', tokenData)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(tokenData)
    setUser(userData)
  }

  const logout = () => {
    console.log('🚪 Logout called')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
