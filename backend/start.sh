#!/bin/bash

echo "===================================="
echo "  Xpect Portal Backend Server"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found!"
    echo ""
    echo "Please create a .env file with:"
    echo "  PORT=5000"
    echo "  NODE_ENV=development"
    echo "  MONGODB_URI=your_mongodb_connection_string"
    echo "  FRONTEND_URL=http://localhost:5173"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting backend server..."
echo ""
npm run dev
