#!/bin/bash

# Universal Document Creator - Startup Script
echo "Starting Universal Document Creator..."

cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

echo "Backend started on port 8000 (PID: $BACKEND_PID)"
echo "Frontend built in dist/ directory"
echo ""
echo "To run frontend dev server: npm run dev"
echo "To serve built files: npx serve dist"
