#!/bin/bash
set -e

echo "Building TruthLens AI Backend..."
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Navigate to backend directory
echo "Changing to backend directory..."
cd backend
echo "Now in directory: $(pwd)"

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install gunicorn for production
pip install gunicorn

echo "✓ Build completed successfully!"
