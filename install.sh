#!/bin/bash

# QForge Installation Script

echo "Installing QForge - Intelligent CI/CD Pipeline Generator"
echo "========================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ $NODE_MAJOR_VERSION -lt 16 ]; then
    echo "Error: Node.js version 16 or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

# Check if Amazon Q CLI is installed
if ! command -v q &> /dev/null; then
    echo "Warning: Amazon Q CLI is not installed."
    echo "Would you like to install it now? (y/n)"
    read -r INSTALL_Q
    
    if [[ $INSTALL_Q =~ ^[Yy]$ ]]; then
        echo "Installing Amazon Q CLI..."
        pip install amazon-q-cli
        
        if [ $? -ne 0 ]; then
            echo "Error: Failed to install Amazon Q CLI. Please install it manually."
            exit 1
        fi
    else
        echo "Warning: Amazon Q CLI is required for QForge to function properly."
        echo "Please install it manually using 'pip install amazon-q-cli'."
    fi
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building QForge..."
npm run build

# Link the CLI globally
echo "Linking QForge CLI globally..."
npm link

# Verify installation
if command -v qforge &> /dev/null; then
    echo "QForge installed successfully!"
    echo "You can now use the 'qforge' command to generate CI/CD pipelines."
    echo ""
    echo "Example usage:"
    echo "  qforge generate"
    echo ""
    echo "For more information, run:"
    echo "  qforge --help"
else
    echo "Error: Failed to link QForge CLI globally."
    echo "You can still use it by running 'node dist/cli.js' from the project directory."
fi

echo ""
echo "Thank you for installing QForge!"
