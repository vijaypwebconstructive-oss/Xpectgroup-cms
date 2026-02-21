# 🚀 How to Start the Backend Server - FIX YOUR ERROR

## Your Current Error

```
Failed to add cleaner: ApiError: Cannot connect to server. 
Please make sure the backend server is running at http://localhost:5000
```

## ✅ Solution: Start the Backend Server

### Method 1: Using the Batch File (Easiest - Windows)

1. **Double-click** the file: `START_BACKEND_NOW.bat`
2. Wait for the server to start
3. You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server is running on port 5000
   ```
4. **Keep that window open!**
5. Now try submitting your form again

### Method 2: Using Terminal/Command Prompt

1. **Open a NEW terminal/command prompt**
   - Keep your frontend terminal running
   - Open a separate terminal for backend

2. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **You should see:**
   ```
   ✅ Connected to MongoDB
   🚀 Server is running on port 5000
   ```

5. **Keep this terminal window open!**

6. **Test it:**
   - Open browser: `http://localhost:5000/api/health`
   - Should see: `{"status":"OK","message":"Server is running"}`

7. **Now try submitting your form!**

## ⚠️ Important: You Need TWO Terminal Windows

```
┌─────────────────────────────────────┐
│  Terminal 1: Backend Server         │
│  cd backend                         │
│  npm run dev                        │
│  ✅ Connected to MongoDB            │
│  🚀 Server running on port 5000    │
│  ← KEEP THIS RUNNING                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Terminal 2: Frontend Server        │
│  cd xpect-portal                    │
│  npm run dev                        │
│  ← KEEP THIS RUNNING                │
└─────────────────────────────────────┘
```

**Both must be running at the same time!**

## 🔍 Check Your Setup

Run this to verify everything is ready:

```bash
cd backend
npm run check
```

This will tell you if anything is missing.

## ❌ If Port 5000 is Already in Use

If you see "Port 5000 already in use":

### Option 1: Stop the Existing Process

**Windows:**
```bash
netstat -ano | findstr :5000
# Note the PID (last number)
taskkill /PID <PID_NUMBER> /F
```

Then start the server again:
```bash
cd backend
npm run dev
```

### Option 2: Use a Different Port

1. Edit `backend/.env`:
   ```env
   PORT=5001
   ```

2. Edit `xpect-portal/.env`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

3. Restart both servers

## ✅ Verification Steps

After starting the backend:

1. ✅ Check terminal shows: "Server is running on port 5000"
2. ✅ Open browser: `http://localhost:5000/api/health`
3. ✅ Should see: `{"status":"OK","message":"Server is running"}`
4. ✅ Try submitting the onboarding form
5. ✅ Should work without errors!

## 🐛 Still Not Working?

1. **Check MongoDB:**
   - If using local MongoDB: Make sure it's running
   - If using Atlas: Verify connection string is correct

2. **Check .env file:**
   - Make sure `MONGODB_URI` is correct
   - Make sure `PORT=5000`

3. **Check backend terminal:**
   - Look for error messages
   - Common: MongoDB connection errors

4. **Restart everything:**
   - Stop both servers (Ctrl+C)
   - Start backend first
   - Then start frontend

## 📝 Quick Checklist

- [ ] Backend folder exists
- [ ] Dependencies installed (`npm install` in backend folder)
- [ ] `.env` file exists in backend folder
- [ ] MongoDB is running/configured
- [ ] Backend server started (`npm run dev`)
- [ ] Server shows "✅ Connected to MongoDB"
- [ ] Server shows "🚀 Server is running on port 5000"
- [ ] Health check works: `http://localhost:5000/api/health`
- [ ] Frontend `.env` has: `VITE_API_URL=http://localhost:5000/api`
- [ ] Both servers running simultaneously

---

**Once the backend is running, your form submission will work!** 🎉
