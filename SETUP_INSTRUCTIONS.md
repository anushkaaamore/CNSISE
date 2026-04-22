# 🚀 RealChat - Complete Setup & Running Instructions

Welcome! This guide will help you set up and run RealChat on your Windows PC using PowerShell.

---

## 📋 Prerequisites (Install First)

Before running the project, make sure you have these installed:

### 1. **Node.js** (Required)
- Download: [https://nodejs.org/](https://nodejs.org/)
- Choose: **LTS version** (recommended)
- After installation, verify:
  ```powershell
  node --version
  npm --version
  ```

### 2. **Git** (Required for version control)
- Download: [https://git-scm.com/](https://git-scm.com/)
- After installation, verify:
  ```powershell
  git --version
  ```

### 3. **Code Editor** (Optional but recommended)
- **VS Code**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

---

## 🔧 Step-by-Step Setup (Windows PowerShell)

### **Step 1: Open PowerShell Terminal**

Press `Windows Key + R`, type `powershell`, and press Enter.

Or open VS Code terminal: `Ctrl + Backtick`

### **Step 2: Navigate to Project Folder**

```powershell
# Navigate to your project folder
cd C:\path\to\your\CNSISE\folder
```

Example:
```powershell
cd "C:\Users\Viktus\Downloads\23510110_Assignment11_ads\23510110_Assignment11\23510110_Assignment11\CNS_ISE\CNSISE"
```

### **Step 3: Install Backend Dependencies**

```powershell
# Move to backend folder
cd backend

# Install all required packages
npm install

# Check installation (should show all packages installed)
npm list
```

**What's being installed:**
- `express` - Web server framework
- `socket.io` - Real-time communication
- `cors` - Handle cross-origin requests
- `jsonwebtoken` - Authentication tokens

### **Step 4: Install Frontend Dependencies**

```powershell
# Go back to root, then into client folder
cd ..
cd client

# Install all required packages
npm install

# Check installation
npm list
```

**What's being installed:**
- `react` - UI framework
- `react-dom` - React DOM library
- `socket.io-client` - Connect to real-time server
- `vite` - Fast build tool

---

## 🎯 Running the Project

You need **two terminal windows** - one for backend, one for frontend.

### **Terminal 1: Start Backend Server**

```powershell
# From project root, go to backend
cd backend

# Start the server
npm run dev
```

**Expected Output:**
```
Server running on 5000
```

✅ Backend is running on `http://localhost:5000`

### **Terminal 2: Start Frontend Application**

Open a **new PowerShell window** and:

```powershell
# From project root, go to client
cd client

# Start the frontend development server
npm run dev
```

**Expected Output:**
```
Local: http://localhost:5173/
```

✅ Frontend is running on `http://localhost:5173`

---

## 🌐 Access the Application

Open your web browser and go to:

```
http://localhost:5173
```

---

## ✨ Using RealChat

### **1. Login / Signup**
- Enter your email (any valid email format)
- Enter password (minimum 6 characters)
- Click "Sign Up" to create account or "Log In" to sign in
- You'll be logged in with a mock token

### **2. Send Messages**
- Type your message in the input field
- Press `Enter` or click the send button (➤)
- Message appears instantly for all connected users

### **3. View Connection Status**
- Green indicator: Connected to server ✅
- Red indicator: Disconnected ❌

### **4. Logout**
- Click the "Logout" button in top right
- You'll be returned to login screen

---

## 🛠️ Troubleshooting

### **Problem: Port Already in Use (5000 or 5173)**

**Solution:**
Change the port in the backend. Edit `backend/server/server.js`:

```javascript
// Change 5000 to another port like 5001
server.listen(5001, () => {
  console.log("Server running on 5001");
})
```

Then update frontend. Edit `client/src/components/Chat.jsx`:

```javascript
const BACKEND_URL = 'http://localhost:5001'
```

### **Problem: "npm: command not found"**

**Solution:**
- Node.js is not installed or not in PATH
- Reinstall Node.js from [nodejs.org](https://nodejs.org/)
- Restart PowerShell after installation

### **Problem: "Cannot connect to server"**

**Solution:**
1. Make sure backend is running (`npm run dev` in terminal 1)
2. Check if both terminals show no errors
3. Browser console: Press `F12` and check Console tab for errors
4. Restart both servers

### **Problem: Blank Page or Errors in Browser**

**Solution:**
1. Hard refresh: Press `Ctrl + Shift + R`
2. Check browser console: Press `F12` → Console tab
3. Look for red errors and report them

---

## 📁 Project Structure

```
CNSISE/
├── backend/              # Node.js/Express server
│   ├── server/
│   │   ├── server.js            # Main server file
│   │   ├── middleware/
│   │   │   └── auth.js          # Authentication
│   │   ├── firebaseAdmin.js     # Firebase config
│   │   └── serviceAccountKey.json
│   ├── package.json
│   └── node_modules/           # Installed packages (after npm install)
│
├── client/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx         # Login/Signup
│   │   │   ├── Chat.jsx         # Main chat
│   │   │   ├── Auth.css
│   │   │   └── Chat.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── node_modules/           # Installed packages (after npm install)
│
├── README.md
├── SETUP_INSTRUCTIONS.md       # This file
├── PROJECT_EXPLANATION.md      # Project details
└── QUICK_START.md
```

---

## 🔄 How Data Flows in the Application

### **User Sends Message**

```
User Types Message
       ↓
Clicks Send Button
       ↓
Frontend (Chat.jsx) Calls: POST /send
       ↓
Backend Receives Request
       ↓
Backend Broadcasts via Socket.IO
       ↓
All Connected Clients Receive Message
       ↓
Display in Chat Interface
```

### **User Logs In**

```
User Enters Email & Password
       ↓
Clicks "Sign Up" / "Log In"
       ↓
Frontend Generates Mock Token
       ↓
Token Stored in localStorage
       ↓
Frontend Redirected to Chat Screen
       ↓
Backend Verifies Token on Every Request
```

---

## 📝 Common Commands

```powershell
# Install packages
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Stop server
Ctrl + C

# View logs
# Just watch the terminal output

# Clear node_modules (if needed)
rm -r node_modules
npm install
```

---

## 💡 Tips for Development

### **Hot Reload**
- Both servers auto-reload when you save files
- Frontend: Changes visible immediately in browser
- Backend: Restart may be needed for some changes

### **Testing Locally**
- Open app in multiple browser tabs to test real-time messaging
- Messages will sync across all open tabs in real-time

### **Debug in Browser**
- Press `F12` to open Developer Tools
- Network tab: See API calls
- Console tab: See JavaScript errors
- Application tab: See stored tokens

### **Kill a Port (if stuck)**

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

## 🚀 Deployment (Production)

To deploy this app to the internet:

### **Frontend** → Deploy to Vercel/Netlify
```powershell
cd client
npm run build
# Then upload the 'dist' folder
```

### **Backend** → Deploy to Render/Railway/Heroku
```powershell
# Prepare for production
# Push code to GitHub
# Connect GitHub to hosting service
```

---

## 📞 Getting Help

If you face issues:

1. **Check Terminal Output**: Look for red error messages
2. **Browser Console**: Press `F12` → Console tab
3. **Verify Setup**: Make sure Node.js and Git are installed
4. **Restart**: Close and re-open PowerShell terminals
5. **Check Ports**: Make sure ports 5000 and 5173 are free

---

## ✅ Checklist - Before You Start

- [ ] Node.js installed (`node --version` shows version)
- [ ] Git installed (`git --version` shows version)
- [ ] VS Code installed (optional)
- [ ] Project folder is accessible
- [ ] You can open PowerShell
- [ ] You know how to navigate folders with `cd` command

---

## 🎉 You're All Set!

Now you can:
1. Run the backend
2. Run the frontend
3. Open `http://localhost:5173` in your browser
4. Start chatting!

Happy coding! 🚀
