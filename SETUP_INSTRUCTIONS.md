# Setup Instructions for Xpect Portal

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local MongoDB installation, OR
   - MongoDB Atlas account (free tier available)

## Step 1: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/xpect-portal
FRONTEND_URL=http://localhost:5173
```

**For MongoDB Atlas:**
- Replace `MONGODB_URI` with your Atlas connection string
- Example: `mongodb+srv://username:password@cluster.mongodb.net/xpect-portal`

4. Start MongoDB (if using local installation):
   - Windows: MongoDB should start automatically as a service
   - Mac/Linux: `mongod` or `brew services start mongodb-community`

5. Start the backend server:
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

## Step 2: Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd xpect-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `xpect-portal` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend should open at `http://localhost:5173` (or the port shown in terminal)

## Troubleshooting

### "Failed to fetch" Error

This error means the backend server is not running or not accessible.

**Solutions:**
1. ✅ Make sure the backend server is running (check terminal for "Server is running on port 5000")
2. ✅ Check that MongoDB is running
3. ✅ Verify the `VITE_API_URL` in frontend `.env` matches the backend port
4. ✅ Check CORS settings in `backend/server.js` - make sure `FRONTEND_URL` matches your frontend URL
5. ✅ Check firewall/antivirus isn't blocking the connection

### MongoDB Connection Error

**Solutions:**
1. ✅ Make sure MongoDB is installed and running
2. ✅ Check the `MONGODB_URI` in backend `.env` is correct
3. ✅ For local MongoDB: Make sure the service is running
4. ✅ For Atlas: Check your connection string and network access settings

### Port Already in Use

If port 5000 is already in use:
1. Change `PORT=5000` to another port (e.g., `PORT=5001`) in backend `.env`
2. Update `VITE_API_URL=http://localhost:5001/api` in frontend `.env`
3. Restart both servers

## Testing the Connection

1. Open browser console (F12)
2. Navigate to the application
3. Check for any network errors
4. Try submitting the onboarding form
5. Check backend terminal for incoming requests

## Production Deployment

For production:
1. Set `NODE_ENV=production` in backend `.env`
2. Use a production MongoDB instance (Atlas recommended)
3. Update CORS settings to allow your production frontend URL
4. Build the frontend: `npm run build` in `xpect-portal` directory
