# 🚗 OmniDrive.co.ke

**Connecting you to the drive of your choice.**

---

## 📋 About OmniDrive

OmniDrive is Kenya's premier online vehicle marketplace - a comprehensive digital dealership connecting buyers to their dream vehicles from around the globe. Built with modern web technologies, it delivers a seamless, borderless car buying experience.

## 🚀 Core Features

### 🛒 Shopping Experience
- **Live Currency Conversion**: Real-time pricing in USD, EUR, JPY, KES, GBP via Open Exchange Rates API
- **Intelligent Filtering**: Search by brand, model, category, condition, body style, fuel type, drivetrain, color, price range, and rating
- **Advanced Comparison**: Compare up to 3 vehicles side-by-side with sticky tray
- **AI Recommendations**: Smart suggestions based on wishlist & browsing history
- **Test Drive Booking**: Book with calendar UI + WhatsApp confirmation
- **Animated Stats Counter**: Live vehicle/dealer/country counts
- **Newsletter Signup**: Email subscription with localStorage persistence
- **Wishlist Export**: Download wishlist as a text file
- **WhatsApp Direct Contact**: One-tap dealer contact from any vehicle card
- **Dark Mode Auto-Detect**: Respects system `prefers-color-scheme`
- **Vehicle Badges**: Hot Deal 🔥, New Arrival 🆕, Top Rated ⭐, Luxury 💎, Electric 🔋
- **Vehicle Customization (Pimp Your Ride)**:
  - Wheels: Stock to Gold Plated ($120-$8,000)
  - Paint: Metallic, Matte, Chrome, Candy Red, Flip Paint ($800-$4,500)
  - Body Kit: Sport, Wide Body, Carbon Fiber, Aero ($1,200-$8,000)
  - Interior: Leather, Nappa, Alcantara, Custom Stitching ($600-$4,500)
  - Engine: ECU Tune, Turbo, Supercharger ($800-$12,000)
  - Audio: Premium, Focal, Bose systems ($1,200-$4,500)
  - Windows & Accessories

### 💳 Payments
- **MPesa**: Instant mobile money payments (Kenya, Tanzania, Mozambique, Ghana, DRC)
- **Credit/Debit Cards**: Visa, Mastercard, AMEX
- **Bank Transfer**: Standard Chartered direct transfer
- **Price Alerts**: Get notified when prices drop

### 🔐 Account & Orders
- **User Authentication**: Login/register with localStorage persistence
- **Order Tracking**: Real-time timeline from placed → delivered
- **VIN Check**: Vehicle history verification
- **Referral Program**: Earn $500 per successful referral

### 🏪 Dealer Network
- **Global Dealer Locator**: Find nearest dealer with distance calculation
- **Test Drive Scheduling**: Book test drives with preferred dealer
- **Service Center Booking**: Schedule maintenance

### 📦 Logistics
- **Shipping Calculator**: Domestic and international freight
- **Import Duty Calculator**: Automated tax estimates by country
- **Trade-In Calculator**: Estimate your current vehicle's value
- **Insurance Quotes**: Get insurance estimates

### 🌙 User Experience
- **Dark/Light Theme**: Personalized UI themes
- **Responsive Design**: Works on desktop, tablet, mobile
- **Loading States**: Smooth spinners and animations
- **Chat Widget**: Real-time customer support

### 🔧 Admin Panel
- **Inventory Management**: Add, edit, delete vehicles
- **Export Data**: Download inventory as JSON

---

## 🛻 Product Categories

| Category | Count | Examples |
|----------|-------|----------|
| **Cars** | 125+ | Economy to Luxury, SUV, Sedan, Coupe, Convertible |
| **Bikes** | 50+ | Sports, Touring, Scooters, Adventure, Electric |
| **Buses** | 10+ | City Coaches, Electric, Double Decker |
| **Trucks** | 20+ | Pickups, Heavy Duty, Commercial |
| **Vans** | 10+ | Passenger, Cargo, Mini-vans |

### 🚗 Car Brands (Global)
- **Japanese**: Toyota, Honda, Nissan, Mazda, Subaru, Mitsubishi, Lexus, Infiniti, Acura, Suzuki
- **German**: BMW, Mercedes, Audi, Porsche, Volkswagen
- **American**: Ford, Chevrolet, GMC, Dodge, Jeep, Cadillac, Buick, Lincoln, Tesla, Rivian
- **British**: Aston Martin, Bentley, Rolls-Royce, Jaguar, Land Rover, Mini, McLaren, Lotus, Triumph
- **Italian**: Ferrari, Lamborghini, Maserati, Alfa Romeo, Ducati, Aprilia, Piaggio
- **French**: Peugeot, Renault, Bugatti
- **Swedish**: Volvo, Koenigsegg, Polestar
- **Korean**: Hyundai, Kia, Genesis
- **Chinese**: BYD, Wuling, Chery, Geely, Haval, MG, Yutong
- **Indian**: Tata, Mahindra, Maruti, Hero, Bajaj

### 🏍️ Motorcycle Brands
Ducati, Yamaha, Kawasaki, BMW, Honda, Suzuki, Harley-Davidson, Triumph, KTM, MV Agusta, Royal Enfield, Piaggio, Zero, Aprilia, CFMoto, Benelli, NIU

### 🚌 Bus Manufacturers
Mercedes-Benz, Volvo, Scania, MAN, Alexander Dennis, BYD, New Flyer, Gillig, Wrightbus, Yutong

---

## 🌐 Nationalities Available

Japan 🇯🇵 | USA 🇺🇸 | Germany 🇩🇪 | UK 🇬🇧 | Italy 🇮🇹 | France 🇫🇷 | Sweden 🇸🇪 | South Korea 🇰🇷 | China 🇨🇳 | India 🇮🇳 | Taiwan 🇹🇼 | Austria 🇦🇹 | Spain 🇪🇸 | Czech Republic 🇨🇿 | Indonesia 🇮🇩 | Malaysia 🇲🇾

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: localStorage for persistence
- **APIs**: Open Exchange Rates, Geolocation
- **PWA**: manifest.json for installability
- **SEO**: sitemap.xml, robots.txt, meta tags

---

## 📁 Project Structure

```
OmniDrive-dealership/
├── index.html          # Main application
├── script.js           # All JavaScript logic
├── styles.css          # Complete styling
├── server.js           # Node.js/Express MPesa backend
├── sw.js               # Service Worker (PWA offline support)
├── README.md           # This file
├── VISION.md           # Company vision
├── logo.svg            # Brand logo
├── favicon.svg         # Favicon
├── manifest.json       # PWA manifest
├── package.json        # Node dependencies
├── .env                # Environment variables (not committed)
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Crawler rules
├── privacy.html        # Privacy policy
├── terms.html          # Terms of service
├── dealer-register.html # Dealer onboarding page
└── assets/             # Images and media
```

---

## 🎯 Getting Started

1. Open `index.html` in a web browser (or run `npm start` for the backend)
2. Browse vehicles by category or use filters
3. Add vehicles to wishlist or compare up to 3 side-by-side
4. Customize your ride with Pimp Your Ride (optional)
5. Proceed to payment (MPesa/Card/Bank Transfer)
6. Track your order in real-time

---

## 🌐 Domain

**OmniDrive.co.ke** — Connecting you to the drive of your choice.

---

## 🖥️ Running the Backend

```bash
npm install
cp .env.example .env   # fill in your MPesa Daraja credentials
npm start              # starts Express server on port 3000
```

The frontend auto-connects to `http://localhost:3000` for MPesa STK Push.

---

## 📞 Support

- **Email**: info@omnidrive.co.ke
- **Phone**: +254 700 000 000
- **Dealer Registration**: [dealer-register.html](dealer-register.html)

*Your drive starts here.*
