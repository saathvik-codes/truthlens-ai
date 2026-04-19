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

# Configure git to use GitHub token if available
if [ -n "$GITHUB_TOKEN" ]; then
    echo "Configuring GitHub authentication..."
    git config --global url."https://oauth2:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
    echo "✓ Git authentication configured"
else
    echo "⚠ GITHUB_TOKEN not set"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install gunicorn for production
pip install gunicorn

echo "✓ Build completed successfully!"
