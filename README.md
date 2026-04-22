# RealChat - Real-time Messaging Application

A modern, real-time messaging application built with Node.js/Express backend and React frontend.

## 📁 Project Structure

```
CNS_ISE/
├── backend/          # Express.js server with real-time messaging
│   ├── server/
│   │   ├── server.js             # Main server file
│   │   ├── firebaseAdmin.js      # Firebase configuration
│   │   └── middleware/
│   │       └── auth.js           # Authentication middleware
│   └── package.json              # Backend dependencies
│
└── client/           # React frontend with modern UI
    ├── src/
    │   ├── components/
    │   │   ├── Auth.jsx          # Login/Signup component
    │   │   ├── Chat.jsx          # Main chat interface
    │   │   └── *.css             # Component styling
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # Entry point
    │   └── index.css             # Global styles
    ├── index.html                # HTML entry point
    ├── vite.config.js            # Vite build config
    └── package.json              # Frontend dependencies
```

## ✨ Features

- **Real-time Messaging**: Messages broadcast instantly to all connected users using Socket.io
- **User Authentication**: Secure login/signup with JWT token support
- **Modern UI**: Clean, professional design with gradient theme
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Connection Status**: Visual indicator showing connection state
- **Message History**: View all messages from the session
- **User Profiles**: Each user has a display name and unique identifier

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v16 or higher)
- npm package manager

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd client
npm install
```

### Step 3: Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### Step 4: Start Frontend Application (in a new terminal)
```bash
cd client
npm run dev
```
The frontend will run on `http://localhost:3000`

### Step 5: Open in Browser
Go to `http://localhost:3000` and start messaging!

## 🔄 How Frontend & Backend Interact

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. User enters email/password in Login form          │   │
│  │ 2. App generates mock JWT token                      │   │
│  │ 3. User redirected to Chat interface                 │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────────────────────┘
           │ HTTP + Socket.io
┌──────────▼──────────────────────────────────────────────────┐
│                  SERVER (Node.js/Express)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Authentication Middleware: Verifies JWT token        │   │
│  │                                                       │   │
│  │ POST /send   → Receive message → Broadcast via socket│   │
│  │ GET /messages → Return all stored messages           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────────────────────┘
           │ Socket.io Emission
┌──────────▼──────────────────────────────────────────────────┐
│              ALL CONNECTED CLIENTS (Real-time)               │
│            Messages appear instantly for all users           │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Example

1. **User Sends Message**
   - User types in message input box
   - Presses Enter or clicks Send button
   - Frontend sends POST request to `/send` with token & message content
   - Backend verifies token, stores message, broadcasts via Socket.io

2. **User Receives Messages**
   - Frontend connects to Socket.io when component mounts
   - Listens for `message` event
   - When other users send messages, Socket.io emits event
   - Frontend receives and displays message in real-time

3. **Loading Previous Messages**
   - When user logs in, frontend fetches from GET `/messages`
   - Backend returns all messages stored in memory
   - Frontend displays in messages list

## 🔐 Authentication Details

### Demo Mode
- The app works in **demo mode** for easy testing
- Any email + password (6+ chars) will work
- Generates a mock JWT token stored in localStorage
- Token is sent with every request in Authorization header

### Production Setup (Future)
Would involve:
- Real Firebase authentication
- Secure token generation
- Backend token verification with actual JWT secrets
- Database storage for messages (instead of in-memory)

## 🎨 Design Features

### Color Scheme
- **Primary Gradient**: Purple (#667eea) → Dark Purple (#764ba2)
- **Background**: Light gray (#f8f9fa)
- **Text**: Dark gray (#333)
- **Accents**: Matching gradient for buttons and active states

### UI Components
- **Navbar**: Shows app title, connection status, user info, logout button
- **Chat Area**: Scrollable message list with auto-scroll to latest
- **Message Bubbles**: Different styling for sent (gradient) vs received (white)
- **Input Form**: Textarea with emoji send button
- **Empty State**: Friendly prompt when no messages
- **Loading States**: Visual feedback during API calls

### Responsive Breakpoints
- Desktop (1024px+): Full layout
- Tablet (768px): Adjusted spacing
- Mobile (480px): Compact layout, optimized touch targets

## 🛠️ Technology Stack

### Frontend
- **React 18**: UI library
- **Vite**: Fast build tool
- **Socket.io Client**: Real-time communication
- **Firebase SDK**: Authentication support (configured)

### Backend
- **Node.js + Express**: REST API server
- **Socket.io**: Real-time messaging
- **Firebase Admin**: Authentication verification
- **JWT**: Token validation
- **CORS**: Cross-origin support

## 📝 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/send` | Yes | Send a new message |
| GET | `/messages` | Yes | Retrieve all messages |
| Socket | `connection` | No | WebSocket connection |
| Socket | `message` | No | Receive real-time message |

## ⚙️ Environment Setup

### Backend (.env file)
```
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (.env file)
```
VITE_BACKEND_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Frontend won't load?
- Check if backend is running on port 5000
- Clear browser cache and reload
- Check browser console for errors

### Messages not sending?
- Verify backend is running (`npm run dev` in backend folder)
- Check that authentication token is valid
- Look for errors in browser dev tools (F12)

### Connection showing as disconnected?
- This is normal in demo mode
- Messages still work locally
- Real connection requires backend running

## 📚 For Presentation/Viva

**Key Points to Mention:**
1. This is a full-stack real-time messaging application
2. Frontend built with React for modern, interactive UI
3. Backend uses Node.js/Express with Socket.io for live updates
4. Shows complete frontend-backend integration
5. Includes proper authentication flow
6. Responsive design works on all devices
7. Clean, professional code structure

**Demo Flow:**
1. Show login page - explain it's demo auth
2. Create account with any email
3. Show chat interface
4. Send a message
5. Explain how message travels: Frontend → Backend → All Clients
6. Show code structure if asked

## 👨‍💻 Future Enhancements

- Add database (MongoDB) for persistent message storage
- Implement real Firebase authentication
- Add user search and direct messaging
- Add typing indicators
- Add message reactions/emojis
- Add file upload support
- Add voice/video calling
- Add user presence/online status
- Add message encryption

---

**Created for College Assignment - ISE Project**
Demonstrates full-stack development with modern web technologies.
