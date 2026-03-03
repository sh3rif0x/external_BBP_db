# Bug Bounty Programs Tracker

A React application for browsing and searching active bug bounty programs.

## Project Structure

```
src/
├── App.jsx          # Main React component
├── App.css          # Styles (separated from component)
├── index.js         # React entry point
public/
├── index.html       # Base HTML file
hunting_ons.json     # Bug bounty program URLs data
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```
   Creates an optimized production build in the `build/` folder

## Features

- 🔍 Search bug bounty programs by name or domain
- 📊 Display total and visible programs count
- 🎯 Click any program to visit its website
- 🎨 Modern UI with gradient design
- 📱 Responsive design for all devices
- 🚀 Fast loading with React

## Technologies Used

- **React** - UI framework
- **CSS** - Styling (separated file)
- **JSON** - Data storage
