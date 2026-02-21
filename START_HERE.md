# 🚨 FIX: "Cannot connect to server" Error

## The Problem

Your error means: **The backend server is NOT running**

```
Failed to add cleaner: ApiError: Cannot connect to server. 
Please make sure the backend server is running at http://localhost:5000
```

## ✅ The Solution (3 Simple Steps)

### Step 1: Open a NEW Terminal Window

- Keep your frontend terminal running
- Open a **NEW** terminal window for the backend

### Step 2: Start the Backend Server

**Option A: Double-click this file** (Easiest!)
```
START_BACKEND_NOW.bat
```

**Option B: Use Terminal**
```bash
cd backend
npm run dev
```

### Step 3: Wait for This Message

You should see:
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

**Keep that terminal window open!**

### Step 4: Test It

1. Open browser: `http://localhost:5000/api/health`
2. Should see: `{"status":"OK","message":"Server is running"}`
3. Now try submitting your form - it will work! ✅

---

## 📋 Quick Checklist

- [ ] Backend server terminal is open
- [ ] Ran `npm run dev` in backend folder
- [ ] See "✅ Connected to MongoDB"
- [ ] See "🚀 Server is running on port 5000"
- [ ] Health check works: `http://localhost:5000/api/health`
- [ ] Both terminals running (backend + frontend)

---

## ⚠️ Common Issues

### "Port 5000 already in use"

**Fix:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Stop it (replace <PID> with the number you see)
taskkill /PID <PID> /F

# Then start server again
cd backend
npm run dev
```

### "MongoDB connection error"

**For Local MongoDB:**
- Make sure MongoDB service is running
- Windows: Check Services → MongoDB

**For MongoDB Atlas:**
- Check your connection string in `backend/.env`
- Verify username/password are correct

---

## 🎯 What You Should See

**Backend Terminal:**
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

**Browser (http://localhost:5000/api/health):**
```json
{"status":"OK","message":"Server is running"}
```

**Then your form submission will work!** 🎉

---

## Need More Help?

See detailed guides:
- `HOW_TO_START_BACKEND.md` - Detailed instructions
- `BACKEND_SETUP_GUIDE.md` - Complete setup guide
- `backend/QUICK_START.md` - Quick reference
