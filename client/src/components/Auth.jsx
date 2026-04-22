import React, { useState } from 'react'
import './Auth.css'

function Auth({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generateMockToken = () => {
    return 'mock_token_' + Math.random().toString(36).substr(2, 9)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!email || !password) {
        throw new Error('Email and password are required')
      }
      if (isSignup && !name) {
        throw new Error('Name is required for signup')
      }

      // Mock authentication (for demo purposes)
      // In production, this would call your backend auth endpoint
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email')
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Create mock user object
      const userInfo = {
        uid: Math.random().toString(36).substr(2, 9),
        email: email,
        name: isSignup ? name : email.split('@')[0],
        joinedAt: new Date().toISOString()
      }

      // Generate mock token
      const mockToken = generateMockToken()

      // Call success handler
      onLoginSuccess(userInfo, mockToken)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💬 RealChat</h1>
          <p>Real-time Messaging Application</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-title">
            <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isSignup && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              className="toggle-link"
              onClick={() => setIsSignup(!isSignup)}
              disabled={loading}
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="auth-demo">
          <p className="demo-text">💡 Demo: Use any email and password (min 6 chars)</p>
        </div>
      </div>
    </div>
  )
}

export default Auth
