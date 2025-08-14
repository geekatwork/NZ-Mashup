# NZ Mashup

A comprehensive New Zealand mapping application that combines OpenStreetMap data with official LINZ datasets, featuring gravel roads, cadastral boundaries, and real-time geographic overlays.

## Features

- **Interactive Mapping**: Built with React, Vite, and Leaflet
- **Multiple Base Layers**: OSM, Topographic, Satellite imagery (Esri, Google), and LINZ Topo50
- **Real-time Data**: Live gravel/unsealed roads from OpenStreetMap via Overpass API
- **Official Overlays**: LINZ cadastral boundaries, building outlines, road centrelines
- **Data Persistence**: Azure Cosmos DB integration for caching and analytics
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Set up environment variables:**

   ```sh
   # Copy the example environment file
   cp .env.example .env.local

   # Edit .env.local and add your LINZ API key
   # Get a free API key from: https://data.linz.govt.nz/
   ```

3. **Start the development server:**

   ```sh
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- Interactive map using Leaflet
- Multiple base layer options: OSM, Topographic, Satellite (Esri, Google), and LINZ imagery
- **New Zealand Cadastral Data**: Property parcels, paper roads, building outlines, and survey network
- Loads and filters GeoJSON overlays (school zones, loading zones)
- CSV data support for territorial authorities
- Modern React structure with custom hooks and error boundaries
- Linting and formatting with ESLint and Prettier
- Docker support for consistent development environments

## Cadastral Data

This app now includes comprehensive NZ cadastral and paper road data from LINZ:

- Property boundaries and parcels
- Paper roads (legal roads that may not be physically constructed)
- Building outlines and footprints
- Road names and street labels
- Cadastral survey network points

See [CADASTRAL_DATA.md](./CADASTRAL_DATA.md) for detailed information about the available layers.

## Project Structure

```
├── data/                  # GeoJSON data files
├── public/                # Static assets (favicon, icons)
├── src/
│   ├── assets/            # App images/icons
│   ├── components/        # React components (App, SidePanel, Layers, ErrorBoundary)
│   ├── hooks/             # Custom React hooks (useGeoJsonData, useMapFilteredZones)
│   ├── services/          # Database and API services (Cosmos DB)
│   ├── config/            # Configuration files
│   ├── index.css          # Global styles
│   └── main.jsx           # App entry point
├── .env.example           # Environment variables template
├── .env.local             # Local environment variables (not in git)
├── .gitignore             # Git ignore rules
├── .editorconfig          # Editor config
├── .prettierrc            # Prettier config
├── eslint.config.js       # ESLint flat config
├── docker-compose.yml     # Docker configuration with Cosmos DB
├── index.html             # Main HTML file
├── package.json           # Project metadata and scripts
└── README.md              # This file
```

## Environment Variables

This project uses environment variables for API keys and configuration:

- **`VITE_LINZ_API_KEY`** - Your LINZ Data Service API key (get free at https://data.linz.govt.nz/)
- **`VITE_COSMOS_DB_ENDPOINT`** - Cosmos DB endpoint URL
- **`VITE_COSMOS_DB_KEY`** - Cosmos DB access key
- **`VITE_DATABASE_NAME`** - Database name (default: MappingAppDB)

Copy `.env.example` to `.env.local` and fill in your values.

## Useful Commands

- **Start dev server:**
  ```sh
  npm run dev
  ```
- **Build for production:**
  ```sh
  npm run build
  ```
- **Preview production build:**
  ```sh
  npm run preview
  ```
- **Lint code:**
  ```sh
  npx eslint .
  ```
- **Format code:**
  ```sh
  npx prettier --check .
  npx prettier --write .
  ```

## Docker Setup

For consistent development environments, you can run this project using Docker:

### Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker)

### Quick Start with Docker

1. **Build and run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
2. **Access the application:**
   - Open [http://localhost:5173](http://localhost:5173) in your browser

### Docker Commands

- **Build the image:**
  ```sh
  docker build -t nz-mashup .
  ```
- **Run the container:**
  ```sh
  docker run -p 5173:5173 nz-mashup
  ```
- **Run in development mode with volume mounting:**
  ```sh
  docker run -p 5173:5173 -v $(pwd):/app nz-mashup npm run dev
  ```

### Docker Benefits

- ✅ **Consistent environment** across different machines
- ✅ **All dependencies** pre-installed and locked
- ✅ **No local Node.js** installation required
- ✅ **Easy deployment** and distribution

## Testing

This project includes a comprehensive testing strategy with multiple testing levels:

### Unit Testing (Jest + React Testing Library)

Run unit tests for components, hooks, and utilities:

```sh
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Current Coverage:**
- Components: ErrorBoundary (100%), GravelRoadsControl (partial)
- Hooks: useGeoJsonData (100%), useMapFilteredZones (95.55%)

### End-to-End Testing (Playwright)

Run comprehensive E2E tests across multiple browsers:

```sh
# Install Playwright browsers (first time)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (with browser UI)
npm run test:e2e:headed
```

### Cross-Browser Testing (WebDriverIO)

Run compatibility tests across different browsers:

```sh
# Run WebDriverIO tests
npm run test:wdio
```

### Running All Tests

```sh
# Run all test suites
npm run test:all
```

### Testing Configuration

- **Jest**: Unit test configuration in `jest.config.js`
- **Playwright**: E2E test configuration in `playwright.config.js`
- **WebDriverIO**: Cross-browser test configuration in `wdio.conf.js`

Tests are automatically run in CI/CD pipeline with coverage reporting.

---

This project was bootstrapped manually for maximum compatibility and follows modern React best practices.
