# OmniDrive Web App

A cross-platform React web application for the OmniDrive vehicle marketplace that works on any device.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Vehicle Browse**: Search and filter vehicles by category, fuel type, and keywords
- **Vehicle Details**: Detailed specifications and information for each vehicle
- **Modern UI**: Dark theme with smooth animations and hover effects
- **Fast Search**: Real-time filtering with loading states

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (irreversible)

## Project Structure

```
web/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── VehicleCard.js
│   │   └── FilterBar.js
│   ├── pages/
│   │   ├── BrowsePage.js
│   │   ├── VehicleDetailPage.js
│   │   ├── AccountPage.js
│   │   ├── PaymentPage.js
│   │   └── WishlistPage.js
│   ├── utils/
│   │   └── inventory.js
│   ├── App.js
│   └── index.js
└── package.json
```

## Technologies Used

- **React**: Frontend framework
- **React Router**: Client-side routing
- **CSS3**: Styling with responsive design
- **Create React App**: Build tooling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices/browsers
5. Submit a pull request

## License

This project is part of the OmniDrive ecosystem.