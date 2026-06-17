#!/bin/bash

# zero-to-agentic-workflows Environment Setup Script
# This script ensures Node.js/npm is installed and then runs the OpenRouter token setup wizard.

echo "============================================="
echo "  zero-to-agentic-workflows: Environment Setup"
echo "============================================="

# Detect OS
OS_TYPE="$(uname -s)"
case "${OS_TYPE}" in
    Linux*)     OS=Linux;;
    Darwin*)    OS=Mac;;
    CYGWIN*|MINGW32*|MSYS*|MINGW*) OS=Windows;;
    *)          OS="UNKNOWN"
esac

echo "Detected OS: $OS"

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not detected. Attempting to install it..."
    
    if [ "$OS" = "Mac" ] || [ "$OS" = "Linux" ]; then
        # Check if nvm is installed
        export NVM_DIR="$HOME/.nvm"
        if [ -s "$NVM_DIR/nvm.sh" ]; then
            echo "Loading NVM..."
            \. "$NVM_DIR/nvm.sh"
        else
            echo "Installing NVM (Node Version Manager)..."
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
            
            # Load NVM
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        fi
        
        # Verify nvm command is available
        if command -v nvm &> /dev/null; then
            echo "Installing Node.js LTS version..."
            nvm install --lts
            nvm use --lts
            nvm alias default 'lts/*'
        else
            echo "Error: Failed to install or load NVM. Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    elif [ "$OS" = "Windows" ]; then
        echo "=========================================================="
        echo "ACTION REQUIRED: Windows environment detected."
        echo "Please download and install Node.js (LTS version) manually:"
        echo "👉 https://nodejs.org/"
        echo "After installing, please restart your terminal and run this script again."
        echo "=========================================================="
        exit 1
    else
        echo "Unknown OS. Please install Node.js (LTS version) manually from https://nodejs.org/"
        exit 1
    fi
fi

# Verify final Node.js and npm installation
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "✅ Node.js $(node -v) is installed!"
    echo "✅ npm $(npm -v) is installed!"
else
    echo "❌ Node.js or npm is missing. Please install Node.js manually."
    exit 1
fi

echo "Starting the OpenRouter Token Setup Wizard..."
# Start the setup script
node scripts/setup-token.js
