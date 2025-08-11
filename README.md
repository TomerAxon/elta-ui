# Electron React App

A simple Electron application with a React panel displaying a "Hello World" heading.

## Features

- Electron desktop application
- React frontend with modern styling
- Webpack bundling
- Hot reloading in development

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the React app:
```bash
npm run build
```

3. Start the Electron app:
```bash
npm start
```

## Development

For development with hot reloading:
```bash
npm run dev
```

This will start both the Electron app and webpack in watch mode.

## Project Structure

- `main.js` - Main Electron process
- `preload.js` - Preload script for secure context isolation
- `src/` - React application source code
- `dist/` - Built React bundle (generated)
- `webpack.config.js` - Webpack configuration
- `package.json` - Project dependencies and scripts
