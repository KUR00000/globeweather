# 🌍 Sentinel Globe

**Sentinel Globe** is an interactive, visually-rich 3D web application that renders a realistic Earth globe to display real-time weather and forecast data for various cities worldwide. Built with modern web technologies, it features smooth animations, stunning 3D graphics, and an intuitive user interface.

## ✨ Features

- **Interactive 3D Globe**: Built with Three.js, offering interactive spinning, zooming, and panning.
- **Real-time Weather Data**: Integrated UI panels to display current local weather conditions and extended forecasts.
- **City Markers**: Interactive markers placed accurately on the globe based on real geographical coordinates.
- **Smooth Animations**: Powered by Framer Motion for a seamless, floating, and premium user experience.
- **Modern UI**: Styled with Tailwind CSS for a responsive, glassmorphism-inspired, and visually stunning interface.
- **Global State Management**: Utilizes Zustand for lightweight, fast, and scalable state handling.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **3D Rendering**: [Three.js](https://threejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd sentinel-globe
```

2. Install the dependencies:

```bash
npm install
```

### Running the App Locally

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified by Vite).

### Building for Production

To create an optimized production build:

```bash
npm run build
```

You can preview the production build locally using:

```bash
npm run preview
```

## 📂 Architecture Overview

The core architecture separates the 3D rendering context away from the standard React DOM overlay:

- `src/globe/`: Contains the Three.js imperative code for the 3D canvas (`Globe.ts`, `CityMarkers.ts`).
- `src/panels/`: Contains the React UI overlays that float above the globe (`WeatherPanel.tsx`, `ForecastPanel.tsx`).
- `src/store/`: Contains Zustand store for managing cross-component communication.
- `src/App.tsx`: The main root component that orchestrates the UI and the 3D scene instance.

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server with HMR.
- `npm run build`: Compiles TypeScript and bundles the application for production.
- `npm run preview`: Starts a local web server to serve the constructed production bundle.
- `npm run lint`: Runs ESLint to find and fix problems in the codebase.
