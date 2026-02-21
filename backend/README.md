# Xpect Portal Backend

Backend server for the Xpect Portal application using Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/xpect-portal
FRONTEND_URL=http://localhost:5173
```

3. Make sure MongoDB is running:
   - Local: Start MongoDB service
   - Atlas: Use your MongoDB Atlas connection string

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Cleaners

- `GET /api/cleaners` - Get all cleaners
- `GET /api/cleaners/:id` - Get cleaner by ID
- `POST /api/cleaners` - Create new cleaner
- `PATCH /api/cleaners/:id` - Update cleaner
- `DELETE /api/cleaners/:id` - Delete cleaner
- `GET /api/cleaners/status/:status` - Get cleaners by status

### Documents

- `GET /api/documents/cleaner/:cleanerId` - Get all documents for a cleaner
- `POST /api/documents/cleaner/:cleanerId` - Add document to cleaner
- `PUT /api/documents/cleaner/:cleanerId/document/:documentId` - Update document
- `DELETE /api/documents/cleaner/:cleanerId/document/:documentId` - Delete document

### Health Check

- `GET /api/health` - Server health check

## Database Schema

The `Cleaner` model includes:
- Personal information (name, email, phone, DOB, address, gender)
- Employment details (type, status, location)
- Onboarding information (citizenship, visa, documents)
- Employment allocation (pay rate, shift type, contract status)
- Documents array with status tracking
