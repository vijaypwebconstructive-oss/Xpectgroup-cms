# Complete Backend Setup Guide for Xpect Portal

This guide will walk you through setting up the backend server and database for the Xpect Portal application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Setup](#mongodb-setup)
3. [Backend Installation](#backend-installation)
4. [Configuration](#configuration)
5. [Starting the Server](#starting-the-server)
6. [Frontend Configuration](#frontend-configuration)
7. [Testing the Setup](#testing-the-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **MongoDB** (choose one):
  - Local MongoDB installation, OR
  - MongoDB Atlas account (free tier available)

### Verify Installation

Open a terminal/command prompt and run:

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

---

## MongoDB Setup

You have two options for MongoDB:

### Option 1: MongoDB Atlas (Cloud - Recommended for Beginners)

1. **Create a free account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a cluster:**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select a cloud provider and region (choose closest to you)
   - Click "Create"

3. **Set up database access:**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Set up network access:**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address
   - Click "Confirm"

5. **Get connection string:**
   - Go to "Database" in the left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/xpect-portal?retryWrites=true&w=majority`

### Option 2: Local MongoDB Installation

#### Windows:
1. Download MongoDB from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service (recommended)
5. MongoDB will start automatically

#### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Local MongoDB Connection String:**
```
mongodb://localhost:27017/xpect-portal
```

---

## Backend Installation

### Step 1: Navigate to Backend Directory

Open a terminal/command prompt and navigate to the backend folder:

```bash
cd backend
```

### Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

This will install:
- Express.js (web server)
- Mongoose (MongoDB driver)
- CORS (cross-origin resource sharing)
- dotenv (environment variables)
- Multer (file uploads)

**Expected output:**
```
added 150 packages, and audited 151 packages in 5s
```

### Step 3: Create Environment File

Create a `.env` file in the `backend` directory:

**Windows (Command Prompt):**
```bash
type nul > .env
```

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**macOS/Linux:**
```bash
touch .env
```

### Step 4: Configure Environment Variables

Open the `.env` file in a text editor and add:

**For MongoDB Atlas:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/xpect-portal?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
```

**For Local MongoDB:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/xpect-portal
FRONTEND_URL=http://localhost:5173
```

**Important:**
- Replace `username` and `password` with your MongoDB credentials
- Replace the cluster URL with your actual Atlas cluster URL (if using Atlas)
- Keep `FRONTEND_URL` as `http://localhost:5173` (or change if your frontend runs on a different port)

---

## Starting the Server

### Start the Backend Server

In the `backend` directory, run:

```bash
npm run dev
```

**Expected output:**
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

### Verify Server is Running

Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

**Keep this terminal window open!** The server needs to keep running.

---

## Frontend Configuration

### Step 1: Navigate to Frontend Directory

Open a **new** terminal window and navigate to the frontend:

```bash
cd xpect-portal
```

### Step 2: Create Frontend Environment File

Create a `.env` file in the `xpect-portal` directory:

**Windows (Command Prompt):**
```bash
type nul > .env
```

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**macOS/Linux:**
```bash
touch .env
```

### Step 3: Configure Frontend Environment

Open the `.env` file and add:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note:** If your backend runs on a different port, update this accordingly.

### Step 4: Install Frontend Dependencies (if not done)

```bash
npm install
```

### Step 5: Start Frontend Server

```bash
npm run dev
```

The frontend should open automatically at `http://localhost:5173`

---

## Testing the Setup

### Test 1: Backend Health Check

1. Open browser
2. Go to: `http://localhost:5000/api/health`
3. Should see: `{"status":"OK","message":"Server is running"}`

### Test 2: API Endpoint Test

1. Open browser
2. Go to: `http://localhost:5000/api/cleaners`
3. Should see: `[]` (empty array - this is normal if no data exists)

### Test 3: Frontend Connection

1. Open the frontend application
2. Open browser console (F12)
3. Navigate to Dashboard or Cleaners List
4. Check console for any errors
5. Should see data loading (or empty state if no cleaners exist)

### Test 4: Submit Onboarding Form

1. Click "Start Onboarding" or navigate to onboarding
2. Fill out the form
3. Submit the form
4. Should successfully create a cleaner and redirect to thank you page
5. Check backend terminal for: `POST /api/cleaners` log

---

## Troubleshooting

### ❌ "Cannot find module" Error

**Problem:** Dependencies not installed

**Solution:**
```bash
cd backend
npm install
```

### ❌ "MongoDB connection error"

**Problem:** MongoDB not running or wrong connection string

**Solutions:**

1. **For Local MongoDB:**
   - Check if MongoDB service is running:
     - Windows: Services → MongoDB
     - Mac: `brew services list`
     - Linux: `sudo systemctl status mongodb`
   - Start MongoDB if not running

2. **For MongoDB Atlas:**
   - Verify connection string is correct
   - Check username/password are correct
   - Verify network access allows your IP
   - Check cluster is not paused

### ❌ "Port 5000 already in use"

**Problem:** Another application is using port 5000

**Solutions:**

1. **Change backend port:**
   - Edit `backend/.env`
   - Change `PORT=5000` to `PORT=5001`
   - Update `xpect-portal/.env`: `VITE_API_URL=http://localhost:5001/api`
   - Restart both servers

2. **Or stop the application using port 5000:**
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
   - Mac/Linux: `lsof -ti:5000 | xargs kill`

### ❌ "Failed to fetch" in Frontend

**Problem:** Backend server not running or CORS issue

**Solutions:**

1. ✅ Verify backend server is running (check terminal)
2. ✅ Check `VITE_API_URL` in frontend `.env` matches backend port
3. ✅ Check `FRONTEND_URL` in backend `.env` matches frontend URL
4. ✅ Restart both servers

### ❌ "EADDRINUSE" Error

**Problem:** Port is already in use

**Solution:** Change the port in `.env` file (see above)

### ❌ "ValidationError" when creating cleaner

**Problem:** Required fields missing or invalid data

**Solution:** Check the form data includes all required fields:
- name, email, phoneNumber, dob, address
- citizenshipStatus
- declarations (all must be true)
- employmentType

### ❌ Frontend shows "Loading..." forever

**Problem:** Backend not responding or network issue

**Solutions:**

1. Check backend terminal for errors
2. Verify backend is running: `http://localhost:5000/api/health`
3. Check browser console (F12) for errors
4. Verify CORS settings in `backend/server.js`

---

## Project Structure

```
Onboarding/
├── backend/                 # Backend server
│   ├── models/             # Database models
│   │   └── Cleaner.js
│   ├── routes/             # API routes
│   │   ├── cleaners.js
│   │   └── documents.js
│   ├── server.js           # Server entry point
│   ├── package.json
│   └── .env               # Environment variables (create this)
│
└── xpect-portal/           # Frontend application
    ├── src/
    │   ├── services/
    │   │   └── api.ts      # API client
    │   └── ...
    ├── package.json
    └── .env               # Environment variables (create this)
```

---

## Quick Start Checklist

Use this checklist to ensure everything is set up:

- [ ] Node.js installed (v18+)
- [ ] MongoDB set up (Atlas or Local)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Backend `.env` file created with correct MongoDB URI
- [ ] Backend server starts without errors (`npm run dev`)
- [ ] Health check works (`http://localhost:5000/api/health`)
- [ ] Frontend dependencies installed (`cd xpect-portal && npm install`)
- [ ] Frontend `.env` file created with `VITE_API_URL`
- [ ] Frontend server starts (`npm run dev`)
- [ ] Frontend can connect to backend (no "Failed to fetch" errors)
- [ ] Can submit onboarding form successfully

---

## Next Steps

Once everything is working:

1. ✅ Test creating a cleaner through onboarding form
2. ✅ Test viewing cleaners in the list
3. ✅ Test editing cleaner details
4. ✅ Test document uploads
5. ✅ Test employment allocation updates

---

## Need Help?

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Check backend terminal for error messages
3. Check browser console (F12) for frontend errors
4. Verify all environment variables are set correctly
5. Ensure both servers are running simultaneously

---

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend `.env`
2. Use a production MongoDB instance (Atlas recommended)
3. Update CORS to allow your production domain
4. Use environment variables for sensitive data
5. Build frontend: `cd xpect-portal && npm run build`
6. Use a process manager like PM2 for the backend

---

**Happy Coding! 🚀**
