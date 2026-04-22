import React, { useState, useEffect } from 'react'
import './App.css'
import AuthComponent from './components/Auth'
import ChatComponent from './components/Chat'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Check if user is already logged in (token in localStorage)
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const handleLoginSuccess = (userInfo, authToken) => {
    setUser(userInfo)
    setToken(authToken)
    setIsAuthenticated(true)
    localStorage.setItem('authToken', authToken)
    localStorage.setItem('user', JSON.stringify(userInfo))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <AuthComponent onLoginSuccess={handleLoginSuccess} />
      ) : (
        <ChatComponent user={user} token={token} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
