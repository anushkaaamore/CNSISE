import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import './Chat.css'

function Chat({ user, token, onLogout }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  // Connect to Socket.IO and fetch messages
  useEffect(() => {
    // Connect to socket
    socketRef.current = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
      setError('')
    })

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    socketRef.current.on('message', (message) => {
      setMessages(prev => [...prev, message])
    })

    socketRef.current.on('connect_error', (err) => {
      console.error('Connection error:', err)
      setError('Connection error. Using demo mode.')
      // In demo mode, we'll just show mock messages
    })

    // Fetch existing messages
    fetchMessages()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`${BACKEND_URL}/messages`, {
        headers: {
          'Authorization': token
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data || [])
      } else if (response.status === 401) {
        // Token expired
        handleLogoutClick()
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      // In demo mode, show mock messages
      setMessages([
        {
          id: 1,
          author: 'Demo User',
          content: 'Welcome to RealChat! 👋',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          avatar: '👤'
        },
        {
          id: 2,
          author: 'Assistant',
          content: 'This is a real-time messaging application. You can send messages that will be broadcast to all connected users.',
          timestamp: new Date().toISOString(),
          avatar: '🤖'
        }
      ])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) {
      return
    }

    const messageData = {
      id: Date.now(),
      author: user.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      avatar: user.name.charAt(0).toUpperCase()
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${BACKEND_URL}/send`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        // Message will be received via Socket.IO
        setNewMessage('')
      } else if (response.status === 401) {
        handleLogoutClick()
        setError('Session expired. Please login again.')
      } else {
        setError('Failed to send message')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      // In demo mode, add message locally
      setMessages(prev => [...prev, messageData])
      setNewMessage('')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutClick = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    onLogout()
  }

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="chat-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h1 className="navbar-title">💬 RealChat</h1>
            <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
          <div className="navbar-right">
            <span className="user-info">👤 {user.name}</span>
            <button className="logout-button" onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Messages Display */}
        <div className="messages-container">
          {isLoadingMessages && (
            <div className="loading-state">
              <p>Loading messages...</p>
            </div>
          )}

          {!isLoadingMessages && messages.length === 0 && (
            <div className="empty-state">
              <p className="empty-icon">💬</p>
              <h3>No messages yet</h3>
              <p>Start a conversation by sending your first message!</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div 
              key={message.id || index} 
              className={`message ${message.author === user.name ? 'sent' : 'received'}`}
            >
              <div className="message-avatar">{message.avatar || message.author.charAt(0)}</div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">{message.author}</span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
                <p className="message-text">{message.content}</p>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form className="message-form" onSubmit={handleSendMessage}>
          {error && <div className="form-error">{error}</div>}
          
          <div className="input-wrapper">
            <textarea
              className="message-input"
              placeholder="Type your message... (Shift+Enter for new line)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              disabled={loading}
              rows="1"
            />
            <button
              type="submit"
              className="send-button"
              disabled={loading || !newMessage.trim()}
            >
              {loading ? '...' : '📤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat
