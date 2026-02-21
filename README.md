# Xpect Portal - Onboarding System

A comprehensive onboarding system for managing cleaner staff with full-stack implementation.

## Project Structure

```
.
├── backend/              # Node.js/Express backend server
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Server entry point
├── xpect-portal/        # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React Context providers
│   │   ├── services/    # API service layer
│   │   └── views/       # Page components
│   └── package.json
└── README.md
```

## Getting Started

### 📚 Complete Setup Guide

For detailed step-by-step instructions, see:
- **[BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)** - Comprehensive setup guide
- **[backend/QUICK_START.md](./backend/QUICK_START.md)** - Quick 5-minute setup

### Quick Start

**Backend:**
```bash
cd backend
npm install
# Create .env file (see BACKEND_SETUP_GUIDE.md)
npm run dev
```

**Frontend:**
```bash
cd xpect-portal
npm install
# Create .env file with: VITE_API_URL=http://localhost:5000/api
npm run dev
```

### Environment Files Required

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/xpect-portal
FRONTEND_URL=http://localhost:5173
```

**xpect-portal/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

## Features

- ✅ Multi-step onboarding form with validation
- ✅ Document upload and management
- ✅ Employee profile management
- ✅ Employment allocation tracking
- ✅ Verification status management
- ✅ MongoDB database integration
- ✅ RESTful API endpoints
- ✅ Real-time data synchronization

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin requests

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Vite

## API Documentation

See `backend/README.md` for detailed API endpoint documentation.
