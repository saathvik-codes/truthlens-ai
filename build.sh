#!/bin/bash
set -e

echo "Building TruthLens AI Backend..."

# Navigate to backend
cd backend

# Configure git to use GitHub token if available
if [ -n "$GITHUB_TOKEN" ]; then
    git config --global url."https://oauth2:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
    echo "✓ Git authentication configured"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install gunicorn for production
pip install gunicorn

echo "✓ Build completed successfully!"
