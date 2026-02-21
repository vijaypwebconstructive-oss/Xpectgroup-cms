# How to Start the Backend Server

## The Error You're Seeing

```
Failed to add cleaner: ApiError: Cannot connect to server. 
Please make sure the backend server is running at http://localhost:5000
```

This means the **backend server is not running** or not accessible.

## Quick Fix - Start the Backend Server

### Step 1: Open a New Terminal/Command Prompt

**Important:** Keep your frontend terminal running, open a **NEW** terminal window for the backend.

### Step 2: Navigate to Backend Folder

```bash
cd backend
```

### Step 3: Check if Dependencies are Installed

```bash
npm list express mongoose cors dotenv
```

If you see errors, install dependencies:
```bash
npm install
```

### Step 4: Check if .env File Exists

**Windows (Command Prompt):**
```bash
dir .env
```

**Windows (PowerShell):**
```powershell
Test-Path .env
```

**If .env doesn't exist, create it:**

Create a file named `.env` in the `backend` folder with this content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/xpect-portal
FRONTEND_URL=http://localhost:5173
```

**For MongoDB Atlas, use:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/xpect-portal?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
```

### Step 5: Start the Server

```bash
npm run dev
```

**You should see:**
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

### Step 6: Verify Server is Running

Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{"status":"OK","message":"Server is running"}
```

## If Port 5000 is Already in Use

If you see "Port 5000 already in use", you have two options:

### Option 1: Use a Different Port

1. Edit `backend/.env`:
   ```env
   PORT=5001
   ```

2. Edit `xpect-portal/.env`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

3. Restart both servers

### Option 2: Stop What's Using Port 5000

**Windows:**
```bash
netstat -ano | findstr :5000
# Note the PID number
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill
```

## Troubleshooting

### "Cannot find module" Error

**Solution:**
```bash
cd backend
npm install
```

### "MongoDB connection error"

**Solutions:**

1. **For Local MongoDB:**
   - Make sure MongoDB service is running
   - Windows: Check Services → MongoDB
   - Or start manually: `mongod`

2. **For MongoDB Atlas:**
   - Verify connection string is correct
   - Check username/password
   - Verify network access allows your IP

### Server Starts but Frontend Still Can't Connect

1. Check CORS settings in `backend/server.js`
2. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
3. Check firewall/antivirus isn't blocking the connection
4. Try accessing `http://localhost:5000/api/health` directly in browser

## Visual Checklist

```
✅ Backend folder exists
✅ Dependencies installed (npm install)
✅ .env file created with correct settings
✅ MongoDB running (local or Atlas)
✅ Backend server started (npm run dev)
✅ Server shows "✅ Connected to MongoDB"
✅ Server shows "🚀 Server is running on port 5000"
✅ Health check works (http://localhost:5000/api/health)
✅ Frontend .env has correct VITE_API_URL
```

## Keep Both Servers Running

You need **TWO terminal windows**:

1. **Terminal 1:** Backend server (`cd backend && npm run dev`)
2. **Terminal 2:** Frontend server (`cd xpect-portal && npm run dev`)

**Both must be running at the same time!**
