# Quick Start Guide - Backend Setup

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up MongoDB

**Option A: MongoDB Atlas (Easiest)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create free cluster
4. Get connection string
5. Replace `<password>` with your password

**Option B: Local MongoDB**
- Install MongoDB locally
- Use: `mongodb://localhost:27017/xpect-portal`

### Step 3: Create .env File

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start Server
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

### Step 5: Test It
Open browser: `http://localhost:5000/api/health`

Should see: `{"status":"OK","message":"Server is running"}`

## ✅ Done!

Your backend is now running. Keep this terminal open and start the frontend in another terminal.

---

## Frontend Setup (Next Step)

```bash
cd xpect-portal
# Create .env file with: VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

---

## Common Issues

**"Cannot connect to MongoDB"**
- Check MongoDB is running (local) or cluster is active (Atlas)
- Verify connection string is correct
- Check username/password

**"Port 5000 already in use"**
- Change `PORT=5001` in `.env`
- Update frontend `.env`: `VITE_API_URL=http://localhost:5001/api`

**"Failed to fetch" in frontend**
- Make sure backend is running
- Check `VITE_API_URL` matches backend port
