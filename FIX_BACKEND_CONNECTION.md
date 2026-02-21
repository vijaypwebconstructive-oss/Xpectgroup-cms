# Fix: "Cannot connect to server" Error

## The Problem

You're seeing this error:
```
Failed to add cleaner: ApiError: Cannot connect to server. 
Please make sure the backend server is running at http://localhost:5000
```

**This means your backend server is NOT running.**

## Solution: Start the Backend Server

### Quick Steps:

1. **Open a NEW terminal window** (keep frontend running in the other terminal)

2. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

3. **Check your setup:**
   ```bash
   npm run check
   ```
   This will tell you what's missing.

4. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

5. **Create .env file (if missing):**
   
   Create a file named `.env` in the `backend` folder:
   
   **For Local MongoDB:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/xpect-portal
   FRONTEND_URL=http://localhost:5173
   ```
   
   **For MongoDB Atlas:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/xpect-portal?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:5173
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```

7. **You should see:**
   ```
   ✅ Connected to MongoDB
   🚀 Server is running on port 5000
   ```

8. **Test it:**
   - Open browser: `http://localhost:5000/api/health`
   - Should see: `{"status":"OK","message":"Server is running"}`

9. **Now try submitting the form again!**

## Important: Keep Both Servers Running

You need **TWO terminal windows open**:

- **Terminal 1:** Backend (`cd backend && npm run dev`)
- **Terminal 2:** Frontend (`cd xpect-portal && npm run dev`)

**Both must be running simultaneously!**

## If Port 5000 is Already in Use

If you see "Port 5000 already in use":

1. **Check what's using it:**
   ```bash
   netstat -ano | findstr :5000
   ```

2. **Option A: Use different port**
   - Change `PORT=5001` in `backend/.env`
   - Change `VITE_API_URL=http://localhost:5001/api` in `xpect-portal/.env`
   - Restart both servers

3. **Option B: Stop the process**
   ```bash
   taskkill /PID <PID_NUMBER> /F
   ```

## Still Having Issues?

1. ✅ Check MongoDB is running (if using local)
2. ✅ Verify .env file has correct MongoDB URI
3. ✅ Check backend terminal for error messages
4. ✅ Try accessing `http://localhost:5000/api/health` in browser
5. ✅ Check firewall/antivirus isn't blocking port 5000

## Visual Guide

```
┌─────────────────────────────────────┐
│  Terminal 1: Backend Server         │
│  cd backend                         │
│  npm run dev                        │
│  ✅ Connected to MongoDB            │
│  🚀 Server running on port 5000    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Terminal 2: Frontend Server        │
│  cd xpect-portal                    │
│  npm run dev                        │
│  Frontend running on port 5173     │
└─────────────────────────────────────┘
```

Both terminals must be running at the same time!
