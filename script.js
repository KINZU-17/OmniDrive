// ============================================
// CONFIGURATION & STATE
// ============================================

const imageDatabase = {
    "Nissan Skyline GT-R": "https://upload.wikimedia.org/wikipedia/commons/5/55/Nissan_Skyline_GT-R_V-Spec_II_N%C3%BCr_R34.jpg",
    "Nissan GT-R": "https://upload.wikimedia.org/wikipedia/commons/5/55/Nissan_Skyline_GT-R_V-Spec_II_N%C3%BCr_R34.jpg",
    "Nissan": "https://upload.wikimedia.org/wikipedia/commons/5/55/Nissan_Skyline_GT-R_V-Spec_II_N%C3%BCr_R34.jpg",
    "Honda Super Cub": "https://upload.wikimedia.org/wikipedia/commons/5/54/Honda_Super_Cub_125.jpg",
    "Honda": "https://upload.wikimedia.org/wikipedia/commons/5/54/Honda_Super_Cub_125.jpg",
    "Porsche 911 GT3": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Porsche_911_GT3_Mk_I.jpg",
    "Porsche 911": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Porsche_911_GT3_Mk_I.jpg",
    "Porsche": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Porsche_911_GT3_Mk_I.jpg",
    "Mercedes Citaro": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "Mercedes-Benz": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "Mercedes": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "Ducati Panigale": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ducati_Panigale_V4.jpg",
    "Ducati": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ducati_Panigale_V4.jpg",
    "Ford F-150 Lightning": "https://upload.wikimedia.org/wikipedia/commons/a/a2/2022_Ford_F-150_Lariat_Range_01.jpg",
    "Ford F-150": "https://upload.wikimedia.org/wikipedia/commons/a/a2/2022_Ford_F-150_Lariat_Range_01.jpg",
    "Ford": "https://upload.wikimedia.org/wikipedia/commons/a/a2/2022_Ford_F-150_Lariat_Range_01.jpg",
    "Tesla Model S": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Tesla_Model_S_long_range.jpg",
    "Tesla Model 3": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Tesla_Model_S_long_range.jpg",
    "Tesla": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Tesla_Model_S_long_range.jpg",
    "Volvo 9700": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Volvo_9700_hoge_1.jpg",
    "Volvo Coach": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Volvo_9700_hoge_1.jpg",
    "Volvo": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Volvo_9700_hoge_1.jpg",
    "Royal Enfield Interceptor": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Royal_Enfield_Interceptor_650.jpg",
    "Royal Enfield": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Royal_Enfield_Interceptor_650.jpg",
    "BYD K9": "https://upload.wikimedia.org/wikipedia/commons/f/f8/BYD_K9_electrical_bus_in_Shanghai%2C_China.jpg",
    "Toyota Supra": "https://upload.wikimedia.org/wikipedia/commons/3/39/Toyota_GR_Supra.jpg",
    "Toyota GR Supra": "https://upload.wikimedia.org/wikipedia/commons/3/39/Toyota_GR_Supra.jpg",
    "Toyota": "https://upload.wikimedia.org/wikipedia/commons/3/39/Toyota_GR_Supra.jpg",
    "BMW M3": "https://upload.wikimedia.org/wikipedia/commons/f/f3/BMW_M3_Competition.jpg",
    "BMW": "https://upload.wikimedia.org/wikipedia/commons/f/f3/BMW_M3_Competition.jpg",
    "Audi RS7": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Audi_RS7_Sportback_2023.jpg",
    "Audi": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Audi_RS7_Sportback_2023.jpg",
    "Lamborghini Huracan": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Lamborghini_Hurac%C3%A1n_STO.jpg",
    "Lamborghini": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Lamborghini_Hurac%C3%A1n_STO.jpg",
    "Ferrari 296": "https://upload.wikimedia.org/wikipedia/commons/3/31/Ferrari_458_Italia.jpg",
    "Ferrari": "https://upload.wikimedia.org/wikipedia/commons/3/31/Ferrari_458_Italia.jpg",
    "Yamaha YZF": "https://upload.wikimedia.org/wikipedia/commons/6/68/Yamaha_YZF-R1.jpg",
    "Yamaha": "https://upload.wikimedia.org/wikipedia/commons/6/68/Yamaha_YZF-R1.jpg",
    "Kawasaki Ninja": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Kawasaki_Ninja_ZX-6R.jpg",
    "Kawasaki": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Kawasaki_Ninja_ZX-6R.jpg",
    "Suzuki GSX": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Suzuki_GSX-R1000.jpg",
    "Suzuki": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Suzuki_GSX-R1000.jpg",
    "Harley-Davidson": "https://upload.wikimedia.org/wikipedia/commons/8/89/Harley-Davidson_Sportster.jpg",
    "Lexus LC": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Lexus_LC_500.jpg",
    "Lexus": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Lexus_LC_500.jpg",
    "BYD": "https://upload.wikimedia.org/wikipedia/commons/f/f8/BYD_K9_electrical_bus_in_Shanghai%2C_China.jpg",
    "Toyota Supra": "https://upload.wikimedia.org/wikipedia/commons/5/5e/2022_Toyota_GR_Supra_3.0L_Premium_007.jpg",
    "Toyota": "https://upload.wikimedia.org/wikipedia/commons/5/5e/2022_Toyota_GR_Supra_3.0L_Premium_007.jpg",
    "BMW M3": "https://upload.wikimedia.org/wikipedia/commons/f/f3/BMW_M3_Competition.jpg",
    "BMW": "https://upload.wikimedia.org/wikipedia/commons/f/f3/BMW_M3_Competition.jpg",
    "Audi RS7": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Audi_RS7_Sportback_2023.jpg",
    "Audi": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Audi_RS7_Sportback_2023.jpg",
    "Lamborghini": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Lamborghini_Hurac%C3%A1n_STO.jpg",
    "Ferrari": "https://upload.wikimedia.org/wikipedia/commons/3/31/Ferrari_458_Italia.jpg",
    "McLaren": "https://upload.wikimedia.org/wikipedia/commons/a/a7/McLaren_720S_Genf_2018.jpg",
    "Lamborghini": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Lamborghini_Hurac%C3%A1n_STO.jpg",
    "Yamaha": "https://upload.wikimedia.org/wikipedia/commons/6/68/Yamaha_YZF-R1.jpg",
    "Kawasaki": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Kawasaki_Ninja_ZX-6R.jpg",
    "Suzuki": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Suzuki_GSX-R1000.jpg",
    "Harley-Davidson": "https://upload.wikimedia.org/wikipedia/commons/8/89/Harley-Davidson_Sportster.jpg",
    "Toyota Crown": "https://upload.wikimedia.org/wikipedia/commons/5/5e/2022_Toyota_GR_Supra_3.0L_Premium_007.jpg",
    "Lexus": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Lexus_LC_500.jpg",
    "Mazda RX-7": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Mazda_RX-7_Type_R.jpg",
    "Mazda": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Mazda_RX-7_Type_R.jpg",
    "Subaru WRX": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Mazda_RX-7_Type_R.jpg",
    "Subaru": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Mazda_RX-7_Type_R.jpg",
    "Mitsubishi Lancer": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Mitsubishi_Lancer_Evolution.jpg",
    "Mitsubishi": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Mitsubishi_Lancer_Evolution.jpg",
    "Ducati Panigale V4": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ducati_Panigale_V4.jpg",
    "Yamaha YZF-R1": "https://upload.wikimedia.org/wikipedia/commons/6/68/Yamaha_YZF-R1.jpg",
    "Kawasaki Ninja": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Kawasaki_Ninja_ZX-6R.jpg",
    "Suzuki GSX-R1000": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Suzuki_GSX-R1000.jpg",
    "Harley-Davidson": "https://upload.wikimedia.org/wikipedia/commons/8/89/Harley-Davidson_Sportster.jpg",
    "Honda CBR": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Tesla_Model_S_long_range.jpg",
    "BMW M1000": "https://upload.wikimedia.org/wikipedia/commons/f/f3/BMW_M3_Competition.jpg",
    "KTM": "https://upload.wikimedia.org/wikipedia/commons/6/68/Yamaha_YZF-R1.jpg",
    "Triumph": "https://upload.wikimedia.org/wikipedia/commons/6/68/Yamaha_YZF-R1.jpg",
    "MV Agusta": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ducati_Panigale_V4.jpg",
    "Royal Enfield": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Royal_Enfield_Interceptor_650.jpg",
    "Piaggio": "https://upload.wikimedia.org/wikipedia/commons/5/54/Honda_Super_Cub_125.jpg",
    "Zero": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Tesla_Model_S_long_range.jpg",
    "Aprilia": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ducati_Panigale_V4.jpg",
    "Volvo 9700": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Volvo_9700_hoge_1.jpg",
    "Scania": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Volvo_9700_hoge_1.jpg",
    "MAN": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "Alexander Dennis": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "New Flyer": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "Gillig": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "Wrightbus": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "Yutong": "https://upload.wikimedia.org/wikipedia/commons/f/f8/BYD_K9_electrical_bus_in_Shanghai%2C_China.jpg"
};

const brandColors = {
    "Nissan": "c62828", "Honda": "ff5722", "Porsche": "d32f2f", "Mercedes": "1565c0",
    "Ducati": "b71c1c", "Ford": "283593", "Tesla": "c62828", "Volvo": "263238",
    "Royal Enfield": "33691e", "BYD": "00838f", "Toyota": "d32f2f", "BMW": "1565c0",
    "Audi": "c62828", "Lamborghini": "ffb300", "Ferrari": "c62828", "McLaren": "fbc02d",
    "Yamaha": "0d47a1", "Kawasaki": "00695c", "Suzuki": "01579b", "Harley-Davidson": "bf360c",
    "Lexus": "0d47a1", "Mazda": "0d47a1", "Subaru": "0d47a1", "Mitsubishi": "1565c0",
    "Aprilia": "e63946", "KTM": "ff6700", "MV Agusta": "cc0000", "Triumph": "1a1a1a",
    "Piaggio": "1e90ff", "Zero": "2d2d2d", "Scania": "007bff", "MAN": "fdb813",
    "Alexander Dennis": "dc143c", "New Flyer": "ffc107", "Gillig": "4a90d9", "Wrightbus": "228b22",
    "Yutong": "0066cc"
};

function getCarImage(brand, model) {
    const fullName = brand + " " + (model || "").split(" ")[0];
    const brandKey = brand.split(" ")[0];
    
    for (const [key, url] of Object.entries(imageDatabase)) {
        if (fullName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(brandKey.toLowerCase())) {
            return url + "?w=400";
        }
    }
    
    const color = brandColors[brandKey] || "131921";
    return `https://placehold.co/400x250/${color}/ffffff?text=${encodeURIComponent(brand + " " + model)}`;
}

// Filter options data
const filterOptions = {
    fuelTypes: ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"],
    bodyStyles: ["Sedan", "SUV", "Coupe", "Convertible", "Truck", "Van", "Hatchback", "Wagon"],
    drivetrains: ["AWD", "RWD", "FWD", "4WD"],
    conditions: ["New", "Used", "Certified Pre-Owned"],
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
    colors: ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Orange", "Brown", "Gold", "Beige"]
};

let inventory = [
    { id: 1, brand: "Acura", model: "NSX", price: 165000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "AWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Acura", "NSX"), engine: "3.5L Twin Turbo Hybrid", horsepower: 573, transmission: "9-Speed DCT", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 2, brand: "Alfa Romeo", model: "Giulia Quadrifoglio", price: 95000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sedan", color: "Red", img: getCarImage("Alfa Romeo", "Giulia"), engine: "2.9L Twin Turbo V6", horsepower: 505, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.7 },
    { id: 3, brand: "Aston Martin", model: "DB12", price: 245000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Silver", img: getCarImage("Aston Martin", "DB12"), engine: "5.2L Twin Turbo V12", horsepower: 680, transmission: "8-Speed Auto", availability: "Low Stock", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 4, brand: "Bentley", model: "Continental GT", price: 215000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Coupe", color: "Blue", img: getCarImage("Bentley", "Continental GT"), engine: "6.0L Twin Turbo W12", horsepower: 626, transmission: "8-Speed Auto", availability: "In Stock", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 5, brand: "BMW", model: "M5 Competition", price: 105000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Sedan", color: "Gray", img: getCarImage("BMW", "M5"), engine: "4.4L Twin Turbo V8", horsepower: 617, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 6, brand: "Bugatti", model: "Chiron", price: 350000, nation: "France", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Coupe", color: "Blue", img: getCarImage("Bugatti", "Chiron"), engine: "8.0L Quad Turbo W16", horsepower: 1500, transmission: "7-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 7, brand: "Buick", model: "Enclave", price: 45000, nation: "USA", category: "Car", condition: "Certified Pre-Owned", year: 2024, mileage: 25000, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "White", img: getCarImage("Buick", "Enclave"), engine: "3.6L V6", horsepower: 310, transmission: "9-Speed Auto", availability: "In Stock", warranty: "6 Years/70k Miles", rating: 4.3 },
    { id: 8, brand: "Cadillac", model: "Escalade", price: 105000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "SUV", color: "Black", img: getCarImage("Cadillac", "Escalade"), engine: "6.2L V8", horsepower: 420, transmission: "10-Speed Auto", availability: "In Stock", warranty: "6 Years/70k Miles", rating: 4.6 },
    { id: 9, brand: "Chevrolet", model: "Corvette Z06", price: 125000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Red", img: getCarImage("Chevrolet", "Corvette"), engine: "5.5L V8", horsepower: 670, transmission: "8-Speed DCT", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.9 },
    { id: 10, brand: "Chrysler", model: "Pacifica", price: 42000, nation: "USA", category: "Car", condition: "Used", year: 2023, mileage: 35000, fuel: "Hybrid", drivetrain: "FWD", bodyStyle: "Van", color: "Gray", img: getCarImage("Chrysler", "Pacifica"), engine: "3.6L V6 Hybrid", horsepower: 260, transmission: "eCVT", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.2 },
    { id: 11, brand: "Dodge", model: "Challenger SRT Hellcat", price: 78000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Dodge", "Challenger"), engine: "6.2L Supercharged V8", horsepower: 717, transmission: "6-Speed Manual", availability: "Low Stock", warranty: "3 Years/36k Miles", rating: 4.7 },
    { id: 12, brand: "Ferrari", model: "SF90 Stradale", price: 520000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Plug-in Hybrid", drivetrain: "AWD", bodyStyle: "Coupe", color: "Red", img: getCarImage("Ferrari", "SF90"), engine: "4.0L Twin Turbo V8 Hybrid", horsepower: 985, transmission: "8-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 13, brand: "Ford", model: "Mustang Dark Horse", price: 58000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Gray", img: getCarImage("Ford", "Mustang"), engine: "5.0L V8", horsepower: 500, transmission: "10-Speed Auto", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.6 },
    { id: 14, brand: "GMC", model: "Sierra Denali", price: 85000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "4WD", bodyStyle: "Truck", color: "Black", img: getCarImage("GMC", "Sierra"), engine: "6.6L Duramax Diesel", horsepower: 470, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.5 },
    { id: 15, brand: "Honda", model: "Civic Type R", price: 48000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Red", img: getCarImage("Honda", "Civic Type R"), engine: "2.0L Turbo", horsepower: 315, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.7 },
    { id: 16, brand: "Hyundai", model: "Ioniq 5", price: 52000, nation: "South Korea", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "SUV", color: "Silver", img: getCarImage("Hyundai", "Ioniq 5"), engine: "Dual Motor AWD", horsepower: 320, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 17, brand: "Infiniti", model: "QX80", price: 78000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "SUV", color: "Black", img: getCarImage("Infiniti", "QX80"), engine: "5.6L V8", horsepower: 400, transmission: "7-Speed Auto", availability: "Low Stock", warranty: "4 Years/60k Miles", rating: 4.4 },
    { id: 18, brand: "Jaguar", model: "F-PACE SVR", price: 95000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Blue", img: getCarImage("Jaguar", "F-PACE"), engine: "5.0L Supercharged V8", horsepower: 542, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 19, brand: "Jeep", model: "Wrangler Rubicon", price: 55000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "SUV", color: "Green", img: getCarImage("Jeep", "Wrangler"), engine: "3.6L V6", horsepower: 285, transmission: "8-Speed Auto", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.5 },
    { id: 20, brand: "Kia", model: "EV9", price: 65000, nation: "South Korea", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "SUV", color: "Silver", img: getCarImage("Kia", "EV9"), engine: "Dual Motor AWD", horsepower: 380, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 21, brand: "Koenigsegg", model: "Regera", price: 2500000, nation: "Sweden", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "RWD", bodyStyle: "Coupe", color: "Blue", img: getCarImage("Koenigsegg", "Regera"), engine: "5.0L Twin Turbo V8 Hybrid", horsepower: 1500, transmission: "9-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 22, brand: "Lamborghini", model: "Revuelto", price: 600000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Plug-in Hybrid", drivetrain: "AWD", bodyStyle: "Coupe", color: "Yellow", img: getCarImage("Lamborghini", "Revuelto"), engine: "6.5L V12 Hybrid", horsepower: 1001, transmission: "8-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 23, brand: "Land Rover", model: "Range Rover Sport", price: 95000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Land Rover", "Range Rover"), engine: "4.4L Twin Turbo V8", horsepower: 523, transmission: "8-Speed Auto", availability: "Low Stock", warranty: "4 Years/50k Miles", rating: 4.7 },
    { id: 24, brand: "Lexus", model: "LFA", price: 500000, nation: "Japan", category: "Car", condition: "Used", year: 2015, mileage: 15000, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "White", img: getCarImage("Lexus", "LFA"), engine: "4.8L V10", horsepower: 552, transmission: "6-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.9 },
    { id: 25, brand: "Lincoln", model: "Navigator", price: 82000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "SUV", color: "Black", img: getCarImage("Lincoln", "Navigator"), engine: "3.5L Twin Turbo V6", horsepower: 440, transmission: "10-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.5 },
    { id: 26, brand: "Lotus", model: "Emira", price: 95000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Yellow", img: getCarImage("Lotus", "Emira"), engine: "3.5L V6 Supercharged", horsepower: 400, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.8 },
    { id: 27, brand: "Maserati", model: "MC20", price: 215000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "White", img: getCarImage("Maserati", "MC20"), engine: "3.0L Twin Turbo V6", horsepower: 621, transmission: "8-Speed DCT", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 28, brand: "McLaren", model: "750S", price: 320000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Orange", img: getCarImage("McLaren", "750S"), engine: "4.0L Twin Turbo V8", horsepower: 740, transmission: "7-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 29, brand: "Mercedes-AMG", model: "GT Black Series", price: 325000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Mercedes", "AMG GT"), engine: "4.0L Twin Turbo V8", horsepower: 730, transmission: "7-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 30, brand: "Mini", model: "John Cooper Works GP", price: 45000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Red", img: getCarImage("Mini", "JCW"), engine: "2.0L Turbo", horsepower: 301, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.5 },
    { id: 31, brand: "Mitsubishi", model: "Lancer Evolution", price: 55000, nation: "Japan", category: "Car", condition: "Used", year: 2015, mileage: 45000, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Sedan", color: "Red", img: getCarImage("Mitsubishi", "Lancer Evolution"), engine: "2.0L Turbo", horsepower: 303, transmission: "5-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 32, brand: "Nissan", model: "GT-R R35", price: 115000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Coupe", color: "Silver", img: getCarImage("Nissan", "GT-R"), engine: "3.8L Twin Turbo V6", horsepower: 600, transmission: "6-Speed DCT", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.7 },
    { id: 33, brand: "Pagani", model: "Utopia", price: 2100000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Blue", img: getCarImage("Pagani", "Utopia"), engine: "6.0L Twin Turbo V12", horsepower: 852, transmission: "7-Speed Manual", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 34, brand: "Peugeot", model: "508 PSE", price: 68000, nation: "France", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Plug-in Hybrid", drivetrain: "AWD", bodyStyle: "Sedan", color: "Gray", img: getCarImage("Peugeot", "508"), engine: "2.0L Turbo Hybrid", horsepower: 360, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 35, brand: "Polestar", model: "Polestar 3", price: 85000, nation: "Sweden", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Polestar", "3"), engine: "Dual Motor AWD", horsepower: 489, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 36, brand: "Porsche", model: "911 Dakar", price: 165000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Coupe", color: "Orange", img: getCarImage("Porsche", "911 Dakar"), engine: "3.0L Twin Turbo", horsepower: 473, transmission: "8-Speed PDK", availability: "Low Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 37, brand: "Ram", model: "1500 TRX", price: 95000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "Green", img: getCarImage("Ram", "1500"), engine: "6.2L Supercharged V8", horsepower: 702, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.7 },
    { id: 38, brand: "Renault", model: "Megane RS", price: 48000, nation: "France", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Yellow", img: getCarImage("Renault", "Megane RS"), engine: "1.8L Turbo", horsepower: 295, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/60k Miles", rating: 4.5 },
    { id: 39, brand: "Rolls-Royce", model: "Spectre", price: 420000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Coupe", color: "White", img: getCarImage("Rolls Royce", "Spectre"), engine: "Dual Motor AWD", horsepower: 577, transmission: "1-Speed", availability: "Low Stock", warranty: "4 Years/Unlimited", rating: 5.0 },
    { id: 40, brand: "Subaru", model: "WRX STI", price: 50000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Sedan", color: "Blue", img: getCarImage("Subaru", "WRX STI"), engine: "2.5L Turbo", horsepower: 310, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.6 },
    { id: 41, brand: "Tesla", model: "Roadster", price: 45000, nation: "USA", category: "Car", condition: "Used", year: 2020, mileage: 25000, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Convertible", color: "Red", img: getCarImage("Tesla", "Roadster"), engine: "3 Motor RWD", horsepower: 292, transmission: "1-Speed", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.5 },
    { id: 42, brand: "Toyota", model: "GR Corolla", price: 42000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Hatchback", color: "White", img: getCarImage("Toyota", "GR Corolla"), engine: "1.6L Turbo", horsepower: 300, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.7 },
    { id: 43, brand: "Volkswagen", model: "Golf R", price: 52000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Hatchback", color: "Blue", img: getCarImage("Volkswagen", "Golf R"), engine: "2.0L Turbo", horsepower: 315, transmission: "7-Speed DCT", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.6 },
    { id: 44, brand: "Volvo", model: "XC90 Recharge", price: 78000, nation: "Sweden", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Plug-in Hybrid", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Volvo", "XC90"), engine: "2.0L Supercharged Hybrid", horsepower: 455, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.7 },
    { id: 45, brand: "Genesis", model: "GV80", price: 65000, nation: "South Korea", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "White", img: getCarImage("Genesis", "GV80"), engine: "2.5L Turbo", horsepower: 300, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 46, brand: "Lucid", model: "Air Sapphire", price: 249000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Sedan", color: "Blue", img: getCarImage("Lucid", "Air"), engine: "Tri Motor AWD", horsepower: 1234, transmission: "1-Speed", availability: "Pre-Order", warranty: "4 Years/50k Miles", rating: 4.9 },
    { id: 47, brand: "Rimac", model: "Nevera", price: 2200000, nation: "Croatia", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Rimac", "Nevera"), engine: "Quad Motor AWD", horsepower: 1914, transmission: "1-Speed", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 48, brand: "Pininfarina", model: "Battista", price: 2200000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Coupe", color: "Red", img: getCarImage("Pininfarina", "Battista"), engine: "Quad Motor AWD", horsepower: 1900, transmission: "1-Speed", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 49, brand: "Hennessey", model: "Venom F5", price: 1800000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Hennessey", "Venom"), engine: "6.6L Twin Turbo V8", horsepower: 1842, transmission: "6-Speed DCT", availability: "Pre-Order", warranty: "3 Years/36k Miles", rating: 5.0 },
    { id: 50, brand: "Ferrari", model: "Daytona SP3", price: 2200000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Red", img: getCarImage("Ferrari", "Daytona"), engine: "6.5L V12", horsepower: 840, transmission: "8-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    
    // ========== MOTORCYCLES ==========
    { id: 51, brand: "Ducati", model: "Panigale V4 R", price: 42000, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Red", img: getCarImage("Ducati", "Panigale"), engine: "999cc V4", horsepower: 234, transmission: "6-Speed", availability: "Low Stock", warranty: "2 Years/Unlimited", rating: 4.9 },
    { id: 52, brand: "Yamaha", model: "YZF-R1M", price: 28000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Blue", img: getCarImage("Yamaha", "YZF-R1"), engine: "998cc Inline-4", horsepower: 200, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.8 },
    { id: 53, brand: "Kawasaki", model: "Ninja ZX-10RR", price: 32000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Green", img: getCarImage("Kawasaki", "Ninja"), engine: "998cc Inline-4", horsepower: 204, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.7 },
    { id: 54, brand: "BMW", model: "M1000 RR", price: 35000, nation: "Germany", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Black", img: getCarImage("BMW", "M1000"), engine: "999cc Inline-4", horsepower: 205, transmission: "6-Speed", availability: "In Stock", warranty: "3 Years/Unlimited", rating: 4.8 },
    { id: 55, brand: "Suzuki", model: "GSX-R1000", price: 24000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Blue", img: getCarImage("Suzuki", "GSX-R"), engine: "999cc Inline-4", horsepower: 202, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.7 },
    { id: 56, brand: "Honda", model: "CBR1000RR-R Fireblade", price: 30000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Red", img: getCarImage("Honda", "CBR1000"), engine: "1000cc Inline-4", horsepower: 215, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.8 },
    { id: 57, brand: "Aprilia", model: "RS 125", price: 12000, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "White", img: getCarImage("Aprilia", "RS"), engine: "125cc Single", horsepower: 15, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.5 },
    { id: 58, brand: "Harley-Davidson", model: "Road Glide", price: 25000, nation: "USA", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Touring", color: "Black", img: getCarImage("Harley-Davidson", "Road Glide"), engine: "1868cc V-Twin", horsepower: 90, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.6 },
    { id: 59, brand: "Triumph", model: "Speed Triple 1200 RS", price: 22000, nation: "UK", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Black", img: getCarImage("Triumph", "Speed Triple"), engine: "1160cc Triple", horsepower: 180, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.8 },
    { id: 60, brand: "MV Agusta", model: "F4 RC", price: 45000, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Red", img: getCarImage("MV Agusta", "F4"), engine: "998cc Inline-4", horsepower: 212, transmission: "6-Speed", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 61, brand: "KTM", model: "1290 Super Duke R", price: 26000, nation: "Austria", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Orange", img: getCarImage("KTM", "Super Duke"), engine: "1301cc V-Twin", horsepower: 180, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.7 },
    { id: 62, brand: "Ducati", model: "Multistrada V4", price: 28000, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Adventure", color: "Red", img: getCarImage("Ducati", "Multistrada"), engine: "1260cc V4", horsepower: 170, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.8 },
    { id: 63, brand: "Royal Enfield", model: "Interceptor 650", price: 7000, nation: "India", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Standard", color: "Gray", img: getCarImage("Royal Enfield", "Interceptor"), engine: "648cc Parallel-Twin", horsepower: 47, transmission: "6-Speed", availability: "In Stock", warranty: "3 Years/30k Miles", rating: 4.4 },
    { id: 64, brand: "Piaggio", model: "Vespa GTS 300", price: 7500, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "White", img: getCarImage("Piaggio", "Vespa"), engine: "278cc Single", horsepower: 26, transmission: "CVT", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.3 },
    { id: 65, brand: "Zero Motorcycles", model: "SR/F", price: 23000, nation: "USA", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Standard", color: "Black", img: getCarImage("Zero", "SR-F"), engine: "Z-Force 75-10", horsepower: 110, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.6 },

    // ========== BUSES ==========
    { id: 66, brand: "Mercedes-Benz", model: "Citaro", price: 350000, nation: "Germany", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "City Bus", color: "White", img: getCarImage("Mercedes", "Citaro"), engine: "7.7L Diesel", horsepower: 354, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.5 },
    { id: 67, brand: "Volvo", model: "9700", price: 420000, nation: "Sweden", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Coach", color: "Blue", img: getCarImage("Volvo", "9700"), engine: "12.8L Diesel", horsepower: 460, transmission: "8-Speed Auto", availability: "In Stock", warranty: "3 Years/150k Miles", rating: 4.7 },
    { id: 68, brand: "Scania", model: "K series", price: 380000, nation: "Sweden", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Coach", color: "White", img: getCarImage("Scania", "K-series"), engine: "12.4L Diesel", horsepower: 410, transmission: "8-Speed Auto", availability: "Low Stock", warranty: "3 Years/100k Miles", rating: 4.6 },
    { id: 69, brand: "MAN", model: "Lion's Coach", price: 390000, nation: "Germany", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Coach", color: "Yellow", img: getCarImage("MAN", "Lion's Coach"), engine: "12.4L Diesel", horsepower: 420, transmission: "8-Speed Auto", availability: "In Stock", warranty: "3 Years/150k Miles", rating: 4.6 },
    { id: 70, brand: "Alexander Dennis", model: "Enviro500", price: 320000, nation: "UK", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Double Decker", color: "Red", img: getCarImage("Alexander Dennis", "Enviro500"), engine: "9.3L Diesel", horsepower: 340, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.4 },
    { id: 71, brand: "BYD", model: "K9", price: 280000, nation: "China", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "City Bus", color: "Blue", img: getCarImage("BYD", "K9"), engine: "Dual Motor Electric", horsepower: 300, transmission: "1-Speed", availability: "In Stock", warranty: "8 Years/500k Miles", rating: 4.5 },
    { id: 72, brand: "New Flyer", model: "Xcelsior", price: 350000, nation: "USA", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "City Bus", color: "Yellow", img: getCarImage("New Flyer", "Xcelsior"), engine: "8.9L Diesel", horsepower: 320, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.4 },
    { id: 73, brand: "Gillig", model: "Low Floor", price: 320000, nation: "USA", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "City Bus", color: "White", img: getCarImage("Gillig", "Low Floor"), engine: "8.9L Diesel", horsepower: 300, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.3 },
    { id: 74, brand: "Wrightbus", model: "Streetdeck", price: 300000, nation: "UK", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "RWD", bodyStyle: "Double Decker", color: "Red", img: getCarImage("Wrightbus", "Streetdeck"), engine: "4.5L Hybrid", horsepower: 220, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.5 },
    { id: 75, brand: "Yutong", model: "E12", price: 250000, nation: "China", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Coach", color: "Blue", img: getCarImage("Yutong", "E12"), engine: "Dual Motor Electric", horsepower: 280, transmission: "1-Speed", availability: "In Stock", warranty: "8 Years/500k Miles", rating: 4.3 },

    // ========== TRUCKS ==========
    { id: 76, brand: "Ford", model: "F-150 Raptor", price: 78000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "Black", img: getCarImage("Ford", "F-150"), engine: "3.0L EcoBoost V6", horsepower: 450, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.7 },
    { id: 77, brand: "Chevrolet", model: "Silverado ZR2", price: 72000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "White", img: getCarImage("Chevrolet", "Silverado"), engine: "6.2L V8", horsepower: 420, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 78, brand: "Ram", model: "2500 Power Wagon", price: 75000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "4WD", bodyStyle: "Truck", color: "Gray", img: getCarImage("Ram", "2500"), engine: "6.7L Diesel", horsepower: 410, transmission: "8-Speed Auto", availability: "Low Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 79, brand: "Toyota", model: "Tundra TRD Pro", price: 65000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "White", img: getCarImage("Toyota", "Tundra"), engine: "3.4L Twin Turbo V6", horsepower: 389, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 80, brand: "GMC", model: "Hummer EV", price: 110000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "4WD", bodyStyle: "Truck", color: "Green", img: getCarImage("GMC", "Hummer"), engine: "Tri Motor", horsepower: 1000, transmission: "1-Speed", availability: "In Stock", warranty: "8 Years/100k Miles", rating: 4.8 },
    { id: 81, brand: "Nissan", model: "Frontier Pro-4X", price: 42000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "Red", img: getCarImage("Nissan", "Frontier"), engine: "3.8L V6", horsepower: 310, transmission: "9-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 82, brand: "Rivian", model: "R1T", price: 73000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "4WD", bodyStyle: "Truck", color: "Black", img: getCarImage("Rivian", "R1T"), engine: "Quad Motor", horsepower: 800, transmission: "1-Speed", availability: "Low Stock", warranty: "6 Years/60k Miles", rating: 4.7 },

    // ========== VANS ==========
    { id: 83, brand: "Mercedes-Benz", model: "Sprinter", price: 55000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Mercedes", "Sprinter"), engine: "2.0L Diesel", horsepower: 188, transmission: "9-Speed Auto", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.5 },
    { id: 84, brand: "Ford", model: "Transit", price: 48000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Ford", "Transit"), engine: "3.5L V6", horsepower: 310, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 85, brand: "Ram", model: "ProMaster", price: 42000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Ram", "ProMaster"), engine: "3.6L V6", horsepower: 280, transmission: "6-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 86, brand: "Toyota", model: "Sienna", price: 52000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "AWD", bodyStyle: "Van", color: "Silver", img: getCarImage("Toyota", "Sienna"), engine: "2.5L Hybrid", horsepower: 245, transmission: "eCVT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 87, brand: "Honda", model: "Odyssey", price: 48000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Honda", "Odyssey"), engine: "3.5L V6", horsepower: 280, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 88, brand: "Chevrolet", model: "Express", price: 38000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Chevrolet", "Express"), engine: "4.3L V6", horsepower: 276, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.2 },
    { id: 89, brand: "Nissan", model: "NV3500", price: 45000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Nissan", "NV"), engine: "5.6L V8", horsepower: 375, transmission: "7-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 90, brand: " Kia", model: "Carnival", price: 42000, nation: "South Korea", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Kia", "Carnival"), engine: "3.5L V6", horsepower: 290, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },

    // ========== SCOOTERS ==========
    { id: 91, brand: "Honda", model: "PCX 150", price: 3600, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "White", img: getCarImage("Honda", "PCX"), engine: "149cc Single", horsepower: 15, transmission: "CVT", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.3 },
    { id: 92, brand: "Yamaha", model: "NMAX", price: 4000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "Blue", img: getCarImage("Yamaha", "NMAX"), engine: "155cc Single", horsepower: 16, transmission: "CVT", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.4 },
    { id: 93, brand: "Piaggio", model: "Medley 150", price: 4200, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "White", img: getCarImage("Piaggio", "Medley"), engine: "150cc Single", horsepower: 16, transmission: "CVT", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.3 },
    { id: 94, brand: "SYM", model: "Joymax", price: 3500, nation: "Taiwan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "Black", img: getCarImage("SYM", "Joymax"), engine: "125cc Single", horsepower: 12, transmission: "CVT", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.1 },
    { id: 95, brand: "BMW", model: "C 400 GT", price: 8000, nation: "Germany", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "Silver", img: getCarImage("BMW", "C400"), engine: "350cc Single", horsepower: 34, transmission: "CVT", availability: "In Stock", warranty: "3 Years/Unlimited", rating: 4.5 },
    { id: 96, brand: "TVS", model: "NTORQ", price: 2500, nation: "India", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "Red", img: getCarImage("TVS", "NTORQ"), engine: "124.8cc Single", horsepower: 9, transmission: "CVT", availability: "In Stock", warranty: "5 Years/50k Miles", rating: 4.2 }
];

let liveRates = { USD: 1 };
let compareList = [];
let currentCurrency = 'USD';
let wishlist = [];
let recentlyViewed = [];
let priceAlerts = [];
const ADMIN_PASS = "admin123";

// Load price alerts from localStorage
const savedAlerts = localStorage.getItem('dealership_priceAlerts');
if (savedAlerts) {
    priceAlerts = JSON.parse(savedAlerts);
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const id = Date.now();
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.id = id;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" onclick="dismissNotification(${id})">✕</button>
    `;
    container.appendChild(notification);
    setTimeout(() => dismissNotification(id), 5000);
}

function dismissNotification(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => el.remove(), 300);
    }
}

// Add price alert styles
const style = document.createElement('style');
style.textContent = `
@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.appendChild(style);

// ============================================
// PRICE ALERTS
// ============================================

function showPriceAlerts() {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    let html = `
        <h2>🔔 Price Alerts</h2>
        <p>Get notified when a vehicle drops to your target price.</p>
        
        <div class="finance-form">
            <div class="filter-group">
                <label>Select Vehicle</label>
                <select id="alertVehicle">
                    ${inventory.map(v => `<option value="${v.id}">${v.brand} ${v.model} - ${formatPrice(v.price)}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label>Target Price</label>
                <input type="number" id="alertTarget" placeholder="Your target price">
            </div>
            <div class="filter-group">
                <label>Your Email</label>
                <input type="email" id="alertEmail" placeholder="your@email.com">
            </div>
            <button onclick="addPriceAlert()" class="calc-btn">🔔 Create Alert</button>
        </div>
        
        <div class="trade-in-result" style="margin-top:20px;">
            <h3>Your Active Alerts</h3>
            ${priceAlerts.length === 0 ? '<p>No active alerts</p>' : priceAlerts.map(alert => {
                const v = inventory.find(x => x.id === alert.vehicleId);
                return v ? `
                    <div class="inventory-item">
                        <div class="info">
                            <strong>${v.brand} ${v.model}</strong><br>
                            <small>Target: ${formatPrice(alert.target)} | Current: ${formatPrice(v.price)}</small>
                        </div>
                        <button class="btn-delete" onclick="removePriceAlert(${alert.id})">Remove</button>
                    </div>
                ` : '';
            }).join('')}
        </div>
    `;
    
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function addPriceAlert() {
    const vehicleId = parseInt(document.getElementById('alertVehicle').value);
    const target = parseInt(document.getElementById('alertTarget').value);
    const email = document.getElementById('alertEmail').value;
    
    if (!target || !email) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    const vehicle = inventory.find(v => v.id === vehicleId);
    if (target >= vehicle.price) {
        showNotification('Target price must be lower than current price', 'warning');
        return;
    }
    
    const alert = {
        id: Date.now(),
        vehicleId,
        target,
        email,
        createdAt: new Date().toISOString()
    };
    
    priceAlerts.push(alert);
    localStorage.setItem('dealership_priceAlerts', JSON.stringify(priceAlerts));
    
    showNotification(`Alert created! We'll notify ${email} when price drops to ${formatPrice(target)}`, 'success');
    showPriceAlerts();
}

function removePriceAlert(id) {
    priceAlerts = priceAlerts.filter(a => a.id !== id);
    localStorage.setItem('dealership_priceAlerts', JSON.stringify(priceAlerts));
    showPriceAlerts();
}

// Check alerts (could be called on price changes or periodically)
function checkPriceAlerts() {
    priceAlerts.forEach(alert => {
        const vehicle = inventory.find(v => v.id === alert.vehicleId);
        if (vehicle && vehicle.price <= alert.target) {
            showNotification(`🔔 Price drop! ${vehicle.brand} ${vehicle.model} is now ${formatPrice(vehicle.price)}`, 'success');
            priceAlerts = priceAlerts.filter(a => a.id !== alert.id);
            localStorage.setItem('dealership_priceAlerts', JSON.stringify(priceAlerts));
        }
    });
}

// ============================================
// DEALERS NETWORK
// ============================================

const dealers = [
    { id: 1, name: "GlobalDrive Tokyo", address: "Tokyo, Japan", phone: "+81-3-1234-5678", email: "tokyo@globaldrive.com", lat: 35.6762, lng: 139.6503, hours: "9:00 AM - 6:00 PM" },
    { id: 2, name: "GlobalDrive Osaka", address: "Osaka, Japan", phone: "+81-6-1234-5678", email: "osaka@globaldrive.com", lat: 34.6937, lng: 135.5023, hours: "9:00 AM - 6:00 PM" },
    { id: 3, name: "GlobalDrive Frankfurt", address: "Frankfurt, Germany", phone: "+49-69-1234-5678", email: "frankfurt@globaldrive.com", lat: 50.1109, lng: 8.6821, hours: "9:00 AM - 6:00 PM" },
    { id: 4, name: "GlobalDrive Munich", address: "Munich, Germany", phone: "+49-89-1234-5678", email: "munich@globaldrive.com", lat: 48.1351, lng: 11.5820, hours: "9:00 AM - 6:00 PM" },
    { id: 5, name: "GlobalDrive New York", address: "New York, USA", phone: "+1-212-123-4567", email: "ny@globaldrive.com", lat: 40.7128, lng: -74.0060, hours: "9:00 AM - 6:00 PM" },
    { id: 6, name: "GlobalDrive Los Angeles", address: "Los Angeles, USA", phone: "+1-310-123-4567", email: "la@globaldrive.com", lat: 34.0522, lng: -118.2437, hours: "9:00 AM - 6:00 PM" },
    { id: 7, name: "GlobalDrive Miami", address: "Miami, USA", phone: "+1-305-123-4567", email: "miami@globaldrive.com", lat: 25.7617, lng: -80.1918, hours: "9:00 AM - 6:00 PM" },
    { id: 8, name: "GlobalDrive London", address: "London, UK", phone: "+44-20-1234-5678", email: "london@globaldrive.com", lat: 51.5074, lng: -0.1278, hours: "9:00 AM - 6:00 PM" },
    { id: 9, name: "GlobalDrive Paris", address: "Paris, France", phone: "+33-1-1234-5678", email: "paris@globaldrive.com", lat: 48.8566, lng: 2.3522, hours: "9:00 AM - 6:00 PM" },
    { id: 10, name: "GlobalDrive Dubai", address: "Dubai, UAE", phone: "+971-4-123-4567", email: "dubai@globaldrive.com", lat: 25.2048, lng: 55.2708, hours: "9:00 AM - 6:00 PM" },
    { id: 11, name: "GlobalDrive Singapore", address: "Singapore", phone: "+65-1234-5678", email: "singapore@globaldrive.com", lat: 1.3521, lng: 103.8198, hours: "9:00 AM - 6:00 PM" },
    { id: 12, name: "GlobalDrive Sydney", address: "Sydney, Australia", phone: "+61-2-1234-5678", email: "sydney@globaldrive.com", lat: -33.8688, lng: 151.2093, hours: "9:00 AM - 6:00 PM" },
    { id: 13, name: "GlobalDrive Toronto", address: "Toronto, Canada", phone: "+1-416-123-4567", email: "toronto@globaldrive.com", lat: 43.6532, lng: -79.3832, hours: "9:00 AM - 6:00 PM" },
    { id: 14, name: "GlobalDrive Shanghai", address: "Shanghai, China", phone: "+86-21-1234-5678", email: "shanghai@globaldrive.com", lat: 31.2304, lng: 121.4737, hours: "9:00 AM - 6:00 PM" },
    { id: 15, name: "GlobalDrive Mumbai", address: "Mumbai, India", phone: "+91-22-1234-5678", email: "mumbai@globaldrive.com", lat: 19.0760, lng: 72.8777, hours: "9:00 AM - 6:00 PM" },
    { id: 16, name: "GlobalDrive São Paulo", address: "São Paulo, Brazil", phone: "+55-11-1234-5678", email: "saopaulo@globaldrive.com", lat: -23.5505, lng: -46.6333, hours: "9:00 AM - 6:00 PM" },
    { id: 17, name: "GlobalDrive Rome", address: "Rome, Italy", phone: "+39-06-1234-5678", email: "rome@globaldrive.com", lat: 41.9028, lng: 12.4964, hours: "9:00 AM - 6:00 PM" },
    { id: 18, name: "GlobalDrive Seoul", address: "Seoul, South Korea", phone: "+82-2-1234-5678", email: "seoul@globaldrive.com", lat: 37.5665, lng: 126.9780, hours: "9:00 AM - 6:00 PM" },
    { id: 19, name: "GlobalDrive Bangkok", address: "Bangkok, Thailand", phone: "+66-2-123-4567", email: "bangkok@globaldrive.com", lat: 13.7563, lng: 100.5018, hours: "9:00 AM - 6:00 PM" },
    { id: 20, name: "GlobalDrive Johannesburg", address: "Johannesburg, South Africa", phone: "+27-11-123-4567", email: "johannesburg@globaldrive.com", lat: -26.2041, lng: 28.0473, hours: "9:00 AM - 6:00 PM" }
];

let userLocation = null;

// ============================================
// INITIALIZATION
// ============================================

const savedWishlist = localStorage.getItem('dealership_wishlist');
if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist);
}

const savedCompare = localStorage.getItem('dealership_compare');
if (savedCompare) {
    compareList = JSON.parse(savedCompare);
}

const savedRecent = localStorage.getItem('dealership_recent');
if (savedRecent) {
    recentlyViewed = JSON.parse(savedRecent);
}

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const fallbackRates = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, CNY: 7.24,
    CHF: 0.88, SEK: 10.42, NOK: 10.68, DKK: 6.87, PLN: 3.98,
    CZK: 22.65, HUF: 351.20, RON: 4.58, BGN: 1.80, HRK: 6.95,
    ISK: 137.50, CAD: 1.36, AUD: 1.53, MXN: 17.15, BRL: 4.97,
    ARS: 875.00, CLP: 925.00, COP: 3920.00, PEN: 3.72, VEB: 36.10,
    INR: 83.12, KRW: 1335.00, SGD: 1.34, HKD: 7.82, MYR: 4.72,
    THB: 36.25, IDR: 15650.00, PHP: 55.80, VND: 24350.00, PKR: 278.50,
    BDT: 110.00, TWD: 31.50, AED: 3.67, SAR: 3.75, ILS: 3.67,
    TRY: 32.15, EGP: 30.90, KWD: 0.31, QAR: 3.64, BHD: 0.38,
    OMR: 0.38, ZAR: 18.65, NGN: 1550.00, KES: 157.50, GHS: 12.35,
    MAD: 9.95, TND: 3.12, NZD: 1.64, FJD: 2.23, PGK: 3.75
};

let isLoading = true;

async function init() {
    showLoadingSpinner();
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        liveRates = { ...fallbackRates, ...data.rates };
    } catch (e) {
        console.log("Using fallback rates - " + e.message);
        liveRates = fallbackRates;
        showNotification('Using offline rates. Some features may be limited.', 'warning');
    }
    updateWishCount();
    renderRecentlyViewed();
    renderFeatured();
    render();
    hideLoadingSpinner();
}

function showLoadingSpinner() {
    const grid = document.getElementById('vehicleGrid');
    grid.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading vehicles...</p>
        </div>
    `;
}

function hideLoadingSpinner() {
    isLoading = false;
}

// Error handling for images
function handleImageError(img) {
    img.onerror = null;
    img.src = 'https://placehold.co/400x250/131921/febd69?text=Image+Not+Available';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatPrice(amount) {
    const convertedAmount = amount * (liveRates[currentCurrency] || 1);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(convertedAmount);
}

function calculateFreight(car) {
    let baseRate = 2000;
    const multipliers = { "Bike": 0.5, "Car": 1.0, "Bus": 3.5 };
    const multiplier = multipliers[car.category] || 1.0;
    let totalFreight = baseRate * multiplier;
    if (car.nation === "Japan" || car.nation === "China") {
        totalFreight += 1000;
    }
    return totalFreight;
}

function updateWishCount() {
    document.getElementById('wishCount').innerText = wishlist.length;
}

function getAvailabilityClass(status) {
    if (status === "In Stock") return "availability";
    if (status === "Low Stock") return "urgency";
    return "urgency";
}

// ============================================
// RENDERING
// ============================================

function getVehicleBadge(car) {
    const hotDeals = [32, 9, 42, 15, 13]; // GT-R, Corvette, GR Corolla, Civic Type R, Mustang
    const newArrivals = [52, 53, 54, 55, 56]; // Latest bikes
    const topRated = inventory.filter(v => v.rating >= 4.9).slice(0, 10).map(v => v.id);
    
    if (hotDeals.includes(car.id)) return '<span class="deal-badge">🔥 Hot Deal</span>';
    if (newArrivals.includes(car.id)) return '<span class="deal-badge badge-new-arrival">🆕 New Arrival</span>';
    if (topRated.includes(car.id)) return '<span class="deal-badge badge-top-rated">⭐ Top Rated</span>';
    if (car.price > 1000000) return '<span class="deal-badge badge-luxury">💎 Luxury</span>';
    if (car.fuel === 'Electric' && car.category !== 'Bus') return '<span class="deal-badge badge-electric">🔋 Electric</span>';
    return '';
}

function render(data = inventory) {
    const grid = document.getElementById('vehicleGrid');
    const emptyState = document.getElementById('emptyState');
    
    grid.innerHTML = '';
    
    if (data.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        document.getElementById('resultsCount').innerText = '0';
        return;
    }
    
    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    document.getElementById('resultsCount').innerText = data.length;

    data.forEach(car => {
        const isFavorited = wishlist.includes(car.id);
        const freight = calculateFreight(car);
        const availClass = getAvailabilityClass(car.availability);
        const stars = '★'.repeat(Math.floor(car.rating || 4)) + (car.rating % 1 >= 0.5 ? '½' : '');
        const badge = getVehicleBadge(car);

        grid.innerHTML += `
            <div class="car-card">
                <img src="${car.img || ''}" 
                     onerror="this.onerror=null; this.src='https://placehold.co/400x250/131921/febd69?text=${encodeURIComponent(car.brand + ' ' + car.model)}'" 
                     alt="${car.model}"
                     onclick="showDetailModal(${car.id})">
                <span class="heart-icon ${isFavorited ? 'active' : ''}" 
                      onclick="toggleWishlist(${car.id})">♥</span>
                ${badge}
                <span class="condition-badge ${car.condition === 'New' ? 'badge-new' : car.condition === 'Used' ? 'badge-used' : 'badge-cpo'}">${car.condition}</span>
                <h3 onclick="showDetailModal(${car.id})" style="cursor:pointer">${car.brand} ${car.model}</h3>
                <div class="rating-display">⭐ ${car.rating || 'N/A'} <span class="year-badge">${car.year}</span></div>
                <p class="specs-mini">${car.color} • ${car.fuel} • ${car.drivetrain} • ${car.bodyStyle}</p>
                <p class="origin">${car.nation} 🌏</p>
                <p class="price">${formatPrice(car.price)}</p>
                <p class="shipping-fee">+ ${formatPrice(freight)} Shipping</p>
                <div class="card-actions">
                    <button class="btn-view" onclick="showDetailModal(${car.id})">View Details</button>
                    <button class="btn-wish" onclick="toggleWishlist(${car.id})">${isFavorited ? '❤️' : '🤍'}</button>
                    <button class="btn-share" onclick="shareVehicle('${car.brand} ${car.model}', ${car.price})">📤</button>
                </div>
                <p class="${availClass}">${car.availability === 'Pre-Order' ? '📦 ' + car.availability : '✓ ' + car.availability}</p>
                <div class="car-card-buttons">
                    <button class="btn-primary" onclick="showDetailModal(${car.id})">View Details</button>
                    <button class="btn-compare" onclick="toggleCompare(${car.id})">
                        ${compareList.includes(car.id) ? '✓ Compare' : '+ Compare'}
                    </button>
                </div>
            </div>
        `;
    });
}

function renderRecentlyViewed() {
    const container = document.getElementById('recentList');
    container.innerHTML = '';
    
    if (recentlyViewed.length === 0) {
        container.innerHTML = '<p style="opacity:0.5;font-size:0.85rem">No recently viewed</p>';
        return;
    }
    
    recentlyViewed.slice(0, 5).forEach(id => {
        const car = inventory.find(c => c.id === id);
        if (car) {
            container.innerHTML += `
                <div class="recent-item" onclick="showDetailModal(${car.id})">
                    ${car.brand} ${car.model}
                </div>
            `;
        }
    });
}

// ============================================
// FILTERING & SEARCH
// ============================================

function applyFilters() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const condition = document.getElementById('conditionFilter').value;
    const nation = document.getElementById('nationFilter').value;
    const bodyStyle = document.getElementById('bodyStyleFilter').value;
    const fuel = document.getElementById('fuelFilter').value;
    const drivetrain = document.getElementById('drivetrainFilter').value;
    const color = document.getElementById('colorFilter').value;
    const maxP = parseInt(document.getElementById('priceRange').value);
    const sort = document.getElementById('sortFilter').value;
    
    document.getElementById('priceDisplay').innerText = `$${maxP.toLocaleString()}`;

    let filtered = inventory.filter(car => {
        const matchesSearch = car.brand.toLowerCase().includes(query) || car.model.toLowerCase().includes(query);
        const matchesCategory = category === 'all' || car.category === category;
        const matchesCondition = condition === 'all' || car.condition === condition;
        const matchesNation = nation === 'all' || car.nation === nation;
        const matchesBodyStyle = bodyStyle === 'all' || car.bodyStyle === bodyStyle;
        const matchesFuel = fuel === 'all' || car.fuel === fuel;
        const matchesDrivetrain = drivetrain === 'all' || car.drivetrain === drivetrain;
        const matchesColor = color === 'all' || car.color === color;
        const matchesPrice = car.price <= maxP;
        return matchesSearch && matchesCategory && matchesCondition && matchesNation && 
               matchesBodyStyle && matchesFuel && matchesDrivetrain && matchesColor && matchesPrice;
    });

    // Sort
    if (sort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
        filtered.sort((a, b) => a.brand.localeCompare(b.brand));
    } else if (sort === 'name-desc') {
        filtered.sort((a, b) => b.brand.localeCompare(a.brand));
    } else if (sort === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    render(filtered);
}

function clearFilters() {
    document.getElementById('searchBar').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('conditionFilter').value = 'all';
    document.getElementById('nationFilter').value = 'all';
    document.getElementById('bodyStyleFilter').value = 'all';
    document.getElementById('fuelFilter').value = 'all';
    document.getElementById('drivetrainFilter').value = 'all';
    document.getElementById('colorFilter').value = 'all';
    document.getElementById('priceRange').value = 3000000;
    document.getElementById('sortFilter').value = 'default';
    render();
}

function updateCurrency() {
    currentCurrency = document.getElementById('currencyPicker').value;
    render();
}

// ============================================
// COMPARISON
// ============================================

function toggleCompare(id) {
    const index = compareList.indexOf(id);
    if (index > -1) {
        compareList.splice(index, 1);
    } else if (compareList.length < 3) {
        compareList.push(id);
    }
    
    localStorage.setItem('dealership_compare', JSON.stringify(compareList));
    
    const tray = document.getElementById('compareTray');
    if (compareList.length > 0) {
        tray.classList.remove('hidden');
    } else {
        tray.classList.add('hidden');
    }
    document.getElementById('compareText').innerText = `${compareList.length} Vehicles Selected`;
    render();
}

function clearCompare() {
    compareList = [];
    localStorage.setItem('dealership_compare', JSON.stringify(compareList));
    document.getElementById('compareTray').classList.add('hidden');
    render();
}

function showComparison() {
    if (compareList.length === 0) return;
    
    const selected = inventory.filter(car => compareList.includes(car.id));
    const modal = document.getElementById('compareModal');
    const table = document.getElementById('compareTable');
    
    let html = '<table class="compare-table"><thead><tr><th>Feature</th>';
    selected.forEach(car => {
        html += `<th>${car.brand} ${car.model}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Image row
    html += '<tr><td><strong>Image</strong></td>';
    selected.forEach(car => {
        html += `<td><img src="${car.img}" alt="${car.model}"></td>`;
    });
    
    // Price row
    html += '<tr><td><strong>Price</strong></td>';
    selected.forEach(car => {
        html += `<td>${formatPrice(car.price)}</td>`;
    });
    
    // Origin row
    html += '<tr><td><strong>Origin</strong></td>';
    selected.forEach(car => {
        html += `<td>${car.nation}</td>`;
    });
    
    // Category row
    html += '<tr><td><strong>Category</strong></td>';
    selected.forEach(car => {
        html += `<td>${car.category}</td>`;
    });
    
    // Engine row
    html += '<tr><td><strong>Engine</strong></td>';
    selected.forEach(car => {
        html += `<td>${car.engine || 'N/A'}</td>`;
    });
    
    // Horsepower row
    html += '<tr><td><strong>Horsepower</strong></td>';
    selected.forEach(car => {
        html += `<td>${car.horsepower || 'N/A'} hp</td>`;
    });
    
    // Transmission row
    html += '<tr><td><strong>Transmission</strong></td>';
    selected.forEach(car => {
        html += `<td>${car.transmission || 'N/A'}</td>`;
    });
    
    // Availability row
    html += '<tr><td><strong>Availability</strong></td>';
    selected.forEach(car => {
        html += `<td>${car.availability}</td>`;
    });
    
    // Shipping row
    html += '<tr><td><strong>Shipping</strong></td>';
    selected.forEach(car => {
        html += `<td>${formatPrice(calculateFreight(car))}</td>`;
    });
    
    html += '</tbody></table>';
    
    table.innerHTML = html;
    modal.classList.remove('hidden');
}

function closeCompareModal() {
    document.getElementById('compareModal').classList.add('hidden');
}

// ============================================
// WISHLIST
// ============================================

function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(id);
    }
    localStorage.setItem('dealership_wishlist', JSON.stringify(wishlist));
    updateWishCount();
    render();
}

function showWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    const content = document.getElementById('wishlistContent');
    
    if (wishlist.length === 0) {
        content.innerHTML = '<p>Your wishlist is empty</p>';
    } else {
        const items = inventory.filter(car => wishlist.includes(car.id));
        let html = '';
        items.forEach(car => {
            html += `
                <div class="inventory-item">
                    <div class="info">
                        <strong>${car.brand} ${car.model}</strong><br>
                        <small>${car.nation} - ${formatPrice(car.price)}</small>
                    </div>
                    <div class="actions">
                        <button class="btn-edit" onclick="showDetailModal(${car.id}); closeWishlistModal();">View</button>
                        <button class="btn-delete" onclick="toggleWishlist(${car.id}); showWishlistModal();">Remove</button>
                    </div>
                </div>
            `;
        });
        content.innerHTML = html;
    }
    
    modal.classList.remove('hidden');
}

function closeWishlistModal() {
    document.getElementById('wishlistModal').classList.add('hidden');
}

// ============================================
// DETAIL MODAL
// ============================================

function showDetailModal(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    
    // Add to recently viewed
    recentlyViewed = recentlyViewed.filter(rid => rid !== id);
    recentlyViewed.unshift(id);
    recentlyViewed = recentlyViewed.slice(0, 10);
    localStorage.setItem('dealership_recent', JSON.stringify(recentlyViewed));
    renderRecentlyViewed();
    
    const freight = calculateFreight(car);
    const total = car.price + freight;
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    const carDescriptions = {
        "Nissan Skyline GT-R R34": "The legendary R34 GT-R represents the pinnacle of JDM performance engineering. With its iconic boxy design and advanced all-wheel drive system, it's a true sports car legend.",
        "Porsche 911 GT3": "Track-focused perfection! The 911 GT3 delivers pure driving joy with its naturally aspirated flat-six engine and PDK transmission.",
        "Tesla Model S Plaid": "The future of performance! Tri-motor AWD delivers insane acceleration, making it one of the fastest production cars ever made.",
        "Ford F-150 Lightning": "America's best-selling truck goes electric. Same rugged capability with zero emissions and instant torque.",
        "Mercedes Citaro": "Premium urban transportation. Mercedes-Benz quality meets modern bus engineering for comfortable city travel.",
        "Ducati Panigale V4": "Italian excellence on two wheels. The Panigale dominates the Superbike World Championship.",
        "Volvo 9700": "Scandinavian luxury on the road. Premium coach with superior comfort for long-distance travel.",
        "BYD K9": "Zero-emission public transport from China's EV leader. Quiet, efficient, and eco-friendly."
    };
    
    const desc = carDescriptions[car.brand + " " + car.model] || `The ${car.brand} ${car.model} is a premium ${car.category.toLowerCase()} from ${car.nation}, combining cutting-edge technology with exceptional performance.`;
    
    content.innerHTML = `
        <img src="${car.img}" class="detail-image" alt="${car.model}" onerror="this.onerror=null; this.src='https://placehold.co/800x400/131921/febd69?text=${encodeURIComponent(car.brand + ' ' + car.model)}'">
        <h2>${car.brand} ${car.model}</h2>
        <span class="category-badge">${car.category}</span>
        
        <div class="about-section">
            <h3>📝 About This Vehicle</h3>
            <p>${desc}</p>
            <div class="specs-grid">
                <div class="spec-item"><label>🔑 VIN</label><span>${car.id}GD2024</span></div>
                <div class="spec-item"><label>📅 Year</label><span>2024</span></div>
                <div class="spec-item"><label>🏭 Manufacturer</label><span>${car.brand} Motors</span></div>
                <div class="spec-item"><label>🌍 Country</label><span>${car.nation}</span></div>
            </div>
        </div>
        
        <div class="detail-info">
            <div class="info-item">
                <label>Origin</label>
                <span>${car.nation} 🌏</span>
            </div>
            <div class="info-item">
                <label>Engine</label>
                <span>${car.engine || 'N/A'}</span>
            </div>
            <div class="info-item">
                <label>Horsepower</label>
                <span>${car.horsepower || 'N/A'} hp</span>
            </div>
            <div class="info-item">
                <label>Transmission</label>
                <span>${car.transmission || 'N/A'}</span>
            </div>
            <div class="info-item">
                <label>0-60 mph</label>
                <span>${car.horsepower ? Math.max(2, (600 - car.horsepower/20)).toFixed(1) + ' sec' : 'N/A'}</span>
            </div>
            <div class="info-item">
                <label>Top Speed</label>
                <span>${car.horsepower ? Math.min(220, 150 + car.horsepower/20).toFixed(0) + ' mph' : 'N/A'}</span>
            </div>
            <div class="info-item">
                <label>Fuel Type</label>
                <span>${car.category === 'Bike' ? (car.horsepower < 50 ? 'Gasoline' : 'Gasoline') : (car.nation === 'China' || car.nation === 'USA' && car.brand === 'Tesla' ? 'Electric' : 'Gasoline/Diesel')}</span>
            </div>
            <div class="info-item">
                <label>Warranty</label>
                <span>${car.category === 'Car' ? '3 Years' : '2 Years'}</span>
            </div>
            <div class="info-item">
                <label>Category</label>
                <span>${car.category}</span>
            </div>
            <div class="info-item">
                <label>Availability</label>
                <span class="${getAvailabilityClass(car.availability)}">${car.availability}</span>
            </div>
        </div>
        
        <div class="shipping-info">
            <h4>🚢 Shipping & Import</h4>
            <div class="shipping-grid">
                <div class="ship-item"><label>Vehicle Price</label><span>${formatPrice(car.price)}</span></div>
                <div class="ship-item"><label>Freight Cost</label><span>${formatPrice(freight)}</span></div>
                <div class="ship-item"><label>Import Duty</label><span>${formatPrice(car.price * 0.025)}</span></div>
                <div class="ship-item total"><label>Total Cost</label><span>${formatPrice(total + car.price * 0.025)}</span></div>
            </div>
        </div>
        
        <div class="detail-buttons">
            <button class="btn-primary" onclick="toggleWishlist(${car.id}); closeDetailModal();">
                ${wishlist.includes(car.id) ? '♥ In Wishlist' : '♡ Add to Wishlist'}
            </button>
            <button class="btn-compare" onclick="toggleCompare(${car.id}); closeDetailModal();">
                ${compareList.includes(car.id) ? '✓ Added to Compare' : '+ Add to Compare'}
            </button>
            <button class="btn-contact" onclick="contactDealer('${car.brand} ${car.model}')">📞 Contact Dealer</button>
            <button class="btn-buy" onclick="showMpesaPayment(${car.id}, ${car.price + calculateFreight(car)})">💳 Buy with MPesa</button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function shareVehicle(name, price) {
    const url = window.location.href;
    const text = `Check out this ${name} for ${formatPrice(price)} on GlobalDrive!`;
    if (navigator.share) {
        navigator.share({ title: name, text: text, url: url });
    } else {
        navigator.clipboard.writeText(`${text} ${url}`);
        alert('Link copied to clipboard!');
    }
}

// ============================================
// REVIEWS
// ============================================

const reviews = [
    { vehicleId: 1, user: "John D.", rating: 5, comment: "Amazing car! Best purchase ever.", date: "2026-03-15" },
    { vehicleId: 1, user: "Sarah M.", rating: 4, comment: "Great performance, smooth ride.", date: "2026-02-28" },
    { vehicleId: 5, user: "Mike R.", rating: 5, comment: "The M5 is a beast!", date: "2026-03-10" },
    { vehicleId: 36, user: "Emma L.", rating: 5, comment: "Dream car. Worth every penny.", date: "2026-01-20" },
    { vehicleId: 12, user: "Alex K.", rating: 5, comment: "Ferrari quality is unmatched.", date: "2026-03-05" }
];

function getReviews(vehicleId) {
    return reviews.filter(r => r.vehicleId === vehicleId);
}

// ============================================
// FEATURED DEALS
// ============================================

const featuredDeals = inventory.filter(car => car.availability === "In Stock" && car.price < 100000).slice(0, 6);

function renderFeatured() {
    const section = document.getElementById('featuredSection');
    if (!section) return;
    let html = '<div class="featured-grid">';
    featuredDeals.forEach(car => {
        const savings = Math.floor(car.price * 0.15);
        html += `
            <div class="featured-card" onclick="showDetailModal(${car.id})">
                <span class="deal-badge">SAVE ${formatPrice(savings)}</span>
                <img src="${car.img}" alt="${car.model}">
                <h4>${car.brand} ${car.model}</h4>
                <p class="deal-price">${formatPrice(car.price - savings)} <span class="was-price">${formatPrice(car.price)}</span></p>
            </div>
        `;
    });
    html += '</div>';
    section.innerHTML = html;
}

// ============================================
// VIDEO GALLERY
// ============================================

const vehicleVideos = {
    5: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    9: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    36: "https://www.youtube.com/embed/dQw4w9WgXcQ"
};

function showVideoGallery(carId) {
    const modal = document.getElementById('videoModal');
    const content = document.getElementById('videoContent');
    const videoUrl = vehicleVideos[carId] || "https://www.youtube.com/embed/dQw4w9WgXcQ";
    content.innerHTML = `
        <div class="video-container">
            <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
        </div>
        <p class="video-note">🎥 Official vehicle walkaround and test drive footage</p>
    `;
    modal.classList.remove('hidden');
}

// ============================================
// LIVE CHAT
// ============================================

let chatMessages = [];
function toggleChat() {
    const chat = document.getElementById('chatWidget');
    chat.classList.toggle('hidden');
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    chatMessages.push({ from: 'user', text: msg, time: new Date() });
    renderChat();
    input.value = '';
    setTimeout(() => {
        chatMessages.push({ from: 'bot', text: "Thanks for your message! A dealer will contact you shortly. For immediate assistance, call +1-800-GLOBALDRIVE", time: new Date() });
        renderChat();
    }, 1000);
}

function renderChat() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = chatMessages.map(m => `<div class="chat-${m.from}">${m.text}</div>`).join('');
    container.scrollTop = container.scrollHeight;
}

// ============================================
// SERVICE APPOINTMENTS
// ============================================

function showServiceCenter() {
    const modal = document.getElementById('serviceModal');
    const content = document.getElementById('serviceContent');
    content.innerHTML = `
        <div class="service-form">
            <h3>📅 Schedule Service Appointment</h3>
            <div class="filter-group">
                <label>Select Service</label>
                <select id="serviceType">
                    <option>Oil Change</option>
                    <option>Tire Rotation</option>
                    <option>Brake Inspection</option>
                    <option>General Maintenance</option>
                    <option>Annual Inspection</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Preferred Date</label>
                <input type="date" id="serviceDate">
            </div>
            <div class="filter-group">
                <label>Select Dealer</label>
                <select id="serviceDealer">
                    ${dealers.slice(0, 5).map(d => `<option>${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label>Your Phone</label>
                <input type="tel" id="servicePhone" placeholder="+1 (555) 123-4567">
            </div>
            <button onclick="scheduleService()" class="schedule-btn">Schedule Appointment</button>
        </div>
    `;
    modal.classList.remove('hidden');
}

function scheduleService() {
    const type = document.getElementById('serviceType').value;
    const date = document.getElementById('serviceDate').value;
    const dealer = document.getElementById('serviceDealer').value;
    if (!date) return alert("Please select a date");
    alert(`✅ Service scheduled!\n\nService: ${type}\nDate: ${date}\nDealer: ${dealer}\n\nConfirmation sent to your email.`);
    closeModal('serviceModal');
}

// ============================================
// ACCESSORIES STORE
// ============================================

const accessories = [
    { id: 1, name: "All-Weather Floor Mats", price: 150, category: "Interior" },
    { id: 2, name: "Roof Box (Large)", price: 450, category: "Exterior" },
    { id: 3, name: "Dash Camera", price: 250, category: "Electronics" },
    { id: 4, name: "Tire Pressure Monitor", price: 120, category: "Safety" },
    { id: 5, name: "Wireless Charger", price: 80, category: "Electronics" },
    { id: 6, name: "Seat Covers (Leather)", price: 350, category: "Interior" },
    { id: 7, name: "Car Cover (Indoor)", price: 100, category: "Exterior" },
    { id: 8, name: "Jump Starter Kit", price: 90, category: "Safety" }
];

function showAccessories() {
    const modal = document.getElementById('accessoriesModal');
    const content = document.getElementById('accessoriesContent');
    let html = '<div class="accessories-grid">';
    accessories.forEach(item => {
        html += `
            <div class="accessory-card">
                <h4>${item.name}</h4>
                <p class="category">${item.category}</p>
                <p class="price">${formatPrice(item.price)}</p>
                <button onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
    });
    html += '</div>';
    html += '<div class="cart-summary"><button class="checkout-btn">🛒 View Cart</button></div>';
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function addToCart(id) {
    alert("✅ Added to cart!");
}

// ============================================
// MPESA PAYMENT
// ============================================

let cartTotal = 0;
let selectedVehicle = null;

function showMpesaPayment(vehicleId, totalAmount) {
    selectedVehicle = inventory.find(v => v.id === vehicleId);
    cartTotal = totalAmount || selectedVehicle.price;
    
    const modal = document.getElementById('mpesaModal');
    const content = document.getElementById('mpesaContent');
    
    content.innerHTML = `
        <div class="mpesa-form">
            <div class="mpesa-logo">📱</div>
            <h3>MPesa Payment</h3>
            <p class="mpesa-subtitle">Pay with MPesa - Fast & Secure</p>
            
            <div class="payment-summary">
                <p><strong>Vehicle:</strong> ${selectedVehicle.brand} ${selectedVehicle.model}</p>
                <p><strong>Amount:</strong> ${formatPrice(cartTotal)}</p>
            </div>
            
            <div class="filter-group">
                <label>MPesa Phone Number</label>
                <input type="tel" id="mpesaPhone" placeholder="2547XXXXXXXX (Kenya)">
            </div>
            
            <div class="filter-group">
                <label>Amount (KES)</label>
                <input type="number" id="mpesaAmount" value="${Math.round(cartTotal * liveRates.KES)}" readonly>
            </div>
            
            <button onclick="initiateMpesaPayment()" class="mpesa-btn">💳 Pay with MPesa</button>
            
            <div id="mpesaResult" class="mpesa-result"></div>
            
            <div class="mpesa-note">
                <p>💡 You'll receive an STK push on your phone</p>
                <p>Supported in Kenya, Tanzania, Mozambique, Ghana, DRC</p>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function initiateMpesaPayment() {
    const phone = document.getElementById('mpesaPhone').value.replace(/\D/g, '');
    const result = document.getElementById('mpesaResult');
    
    if (!phone || phone.length < 9) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1);
    } else if (phone.startsWith('+')) {
        phone = phone.substring(1);
    }
    
    result.innerHTML = '<div class="loading">Processing payment...</div>';
    
    // Simulate MPesa API call
    setTimeout(() => {
        // In production, this would call the MPesa Daraja API
        const transactionId = 'MP' + Date.now();
        
        result.innerHTML = `
            <div class="success-message">
                <h4>✅ Payment Initiated!</h4>
                <p>Transaction ID: ${transactionId}</p>
                <p>STK Push sent to your phone</p>
                <p>Enter PIN to confirm</p>
                <div class="pin-prompt">
                    <label>Enter MPesa PIN:</label>
                    <input type="password" id="mpesaPin" maxlength="4" placeholder="****">
                    <button onclick="confirmMpesaPayment('${transactionId}')">Confirm</button>
                </div>
            </div>
        `;
    }, 1500);
}

function confirmMpesaPayment(transactionId) {
    const pin = document.getElementById('mpesaPin').value;
    
    if (!pin || pin.length !== 4) {
        showNotification('Please enter your 4-digit PIN', 'error');
        return;
    }
    
    // Simulate payment confirmation
    const result = document.getElementById('mpesaResult');
    result.innerHTML = '<div class="loading">Confirming payment...</div>';
    
    setTimeout(() => {
        const confirmedId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        result.innerHTML = `
            <div class="success-message">
                <h4>🎉 Payment Successful!</h4>
                <p>Confirmed: ${confirmedId}</p>
                <p>Amount: ${formatPrice(cartTotal)}</p>
                <p>You'll receive an SMS confirmation</p>
                <button onclick="closeModal('mpesaModal')" class="calc-btn">Done</button>
            </div>
        `;
        
        showNotification(`Payment successful! Vehicle: ${selectedVehicle.brand} ${selectedVehicle.model}`, 'success');
    }, 2000);
}

// ============================================
// DEALER LOCATION SYSTEM
// ============================================

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(userLocation);
                },
                () => {
                    resolve(null);
                }
            );
        } else {
            resolve(null);
        }
    });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function findNearestDealers(userLat, userLng, limit = 5) {
    return dealers.map(dealer => ({
        ...dealer,
        distance: calculateDistance(userLat, userLng, dealer.lat, dealer.lng)
    })).sort((a, b) => a.distance - b.distance).slice(0, limit);
}

function showDealerLocator(vehicleName) {
    const modal = document.getElementById('dealerModal');
    const content = document.getElementById('dealerContent');
    
    content.innerHTML = `
        <div class="dealer-search">
            <button onclick="locateAndFindDealers('${vehicleName}')" class="locate-btn">
                📍 Find Nearest Dealers
            </button>
            <p class="dealer-note">Click to find dealers near your location</p>
        </div>
        <div id="dealerList"></div>
    `;
    
    modal.classList.remove('hidden');
}

async function locateAndFindDealers(vehicleName) {
    const listEl = document.getElementById('dealerList');
    listEl.innerHTML = '<p class="loading">🔍 Finding dealers near you...</p>';
    
    const userLoc = await getUserLocation();
    
    if (!userLoc) {
        listEl.innerHTML = `
            <p class="dealer-note">⚠️ Could not get your location. Showing all dealers:</p>
            <div class="dealer-grid">
                ${dealers.slice(0, 10).map(d => createDealerCard(d, vehicleName)).join('')}
            </div>
        `;
        return;
    }
    
    const nearest = findNearestDealers(userLoc.lat, userLoc.lng, 10);
    
    listEl.innerHTML = `
        <div class="nearest-header">
            <h4>📍 Dealers Near You</h4>
            <span class="distance-badge">Closest First</span>
        </div>
        <div class="dealer-grid">
            ${nearest.map(d => createDealerCard(d, vehicleName)).join('')}
        </div>
    `;
}

function createDealerCard(dealer, vehicleName) {
    const distanceText = dealer.distance ? `${dealer.distance.toFixed(1)} miles away` : '';
    const isNearest = dealer.distance < 50;
    
    return `
        <div class="dealer-card ${isNearest ? 'nearest' : ''}">
            <div class="dealer-header">
                <h4>${dealer.name}</h4>
                ${isNearest ? '<span class="nearest-tag"> Nearest</span>' : ''}
            </div>
            <p class="dealer-address">📍 ${dealer.address}</p>
            <p class="dealer-distance">${distanceText}</p>
            <p class="dealer-hours">🕐 ${dealer.hours}</p>
            <div class="dealer-contact">
                <a href="tel:${dealer.phone}" class="contact-btn">📞 ${dealer.phone}</a>
                <a href="mailto:${dealer.email}?subject=Inquiry: ${vehicleName}" class="contact-btn">✉️ Email</a>
            </div>
            <div class="dealer-actions">
                <button onclick="getDirections(${dealer.lat}, ${dealer.lng})" class="directions-btn">
                    🧭 Get Directions
                </button>
                <button onclick="scheduleTestDrive('${dealer.name}', '${vehicleName}')" class="test-drive-btn">
                    📅 Schedule Test Drive
                </button>
            </div>
        </div>
    `;
}

function getDirections(lat, lng) {
    const userLat = userLocation?.lat || 0;
    const userLng = userLocation?.lng || 0;
    window.open(`https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`, '_blank');
}

function scheduleTestDrive(dealerName, vehicleName) {
    const date = prompt(`Select date for test drive:\nVehicle: ${vehicleName}\nDealer: ${dealerName}\n\nEnter date (YYYY-MM-DD):`);
    if (date) {
        const subject = encodeURIComponent(`Schedule Test Drive: ${vehicleName}`);
        const body = encodeURIComponent(`I'd like to schedule a test drive for ${vehicleName}.\n\nPreferred Date: ${date}\nDealer: ${dealerName}`);
        window.open(`mailto:testdrive@globaldrive.com?subject=${subject}&body=${body}`, '_blank');
    }
}

function closeDealerModal() {
    document.getElementById('dealerModal').classList.add('hidden');
}

function contactDealer(vehicleName) {
    showDealerLocator(vehicleName);
}

// ============================================
// FINANCING CALCULATOR
// ============================================

function showFinancingCalc() {
    document.getElementById('financeModal').classList.remove('hidden');
}

function closeFinanceModal() {
    document.getElementById('financeModal').classList.add('hidden');
}

// ============================================
// TRADE-IN CALCULATOR
// ============================================

function showTradeInCalc() {
    const modal = document.getElementById('tradeInModal') || createModal('tradeInModal', 'tradeInContent', '🔄 Trade-In Value Calculator');
    const content = document.getElementById('tradeInContent');
    content.innerHTML = `
        <div class="calculator-form">
            <div class="filter-group">
                <label>Your Vehicle's Original Price ($)</label>
                <input type="number" id="tradeInOriginal" placeholder="e.g., 50000" oninput="calculateTradeIn()">
            </div>
            <div class="filter-group">
                <label>Current Mileage</label>
                <input type="number" id="tradeInMileage" placeholder="e.g., 30000" oninput="calculateTradeIn()">
            </div>
            <div class="filter-group">
                <label>Vehicle Condition</label>
                <select id="tradeInCondition" onchange="calculateTradeIn()">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Years Old</label>
                <input type="number" id="tradeInYears" placeholder="e.g., 3" oninput="calculateTradeIn()">
            </div>
            <div id="tradeInResult" class="trade-in-result"></div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function calculateTradeIn() {
    const original = parseFloat(document.getElementById('tradeInOriginal').value) || 0;
    const mileage = parseFloat(document.getElementById('tradeInMileage').value) || 0;
    const condition = document.getElementById('tradeInCondition').value;
    const years = parseFloat(document.getElementById('tradeInYears').value) || 0;
    const result = document.getElementById('tradeInResult');
    
    if (original <= 0) {
        result.innerHTML = '';
        return;
    }
    
    const depreciationRates = { excellent: 0.15, good: 0.20, fair: 0.30, poor: 0.45 };
    const mileageDeduction = Math.min(0.15, mileage / 100000 * 0.05);
    const yearDeduction = Math.min(0.40, years * 0.08);
    
    const totalDeduction = depreciationRates[condition] + mileageDeduction + yearDeduction;
    const tradeInValue = original * (1 - totalDeduction);
    const tradeInRange = `${formatPrice(tradeInValue * 0.9)} - ${formatPrice(tradeInValue * 1.1)}`;
    
    result.innerHTML = `
        <h4>Estimated Trade-In Value</h4>
        <div class="trade-value">${tradeInRange}</div>
        <p class="trade-note">Based on ${condition} condition with ${mileage.toLocaleString()} miles</p>
    `;
}

// ============================================
// INSURANCE CALCULATOR
// ============================================

function showInsuranceCalc() {
    const modal = document.getElementById('insuranceModal') || createModal('insuranceModal', 'insuranceContent', '🛡️ Insurance Quote');
    const content = document.getElementById('insuranceContent');
    content.innerHTML = `
        <div class="calculator-form">
            <div class="filter-group">
                <label>Vehicle Price ($)</label>
                <input type="number" id="insurePrice" placeholder="e.g., 50000" oninput="calculateInsurance()">
            </div>
            <div class="filter-group">
                <label>Driver Age</label>
                <input type="number" id="insureAge" placeholder="e.g., 30" oninput="calculateInsurance()">
            </div>
            <div class="filter-group">
                <label>Driving Experience (years)</label>
                <input type="number" id="insureExperience" placeholder="e.g., 5" oninput="calculateInsurance()">
            </div>
            <div class="filter-group">
                <label>Location</label>
                <select id="insureLocation" onchange="calculateInsurance()">
                    <option value="urban">Urban</option>
                    <option value="suburban">Suburban</option>
                    <option value="rural">Rural</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Coverage</label>
                <select id="insureCoverage" onchange="calculateInsurance()">
                    <option value="basic">Basic Liability</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                </select>
            </div>
            <div id="insuranceResult" class="insurance-result"></div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function calculateInsurance() {
    const price = parseFloat(document.getElementById('insurePrice').value) || 0;
    const age = parseFloat(document.getElementById('insureAge').value) || 30;
    const experience = parseFloat(document.getElementById('insureExperience').value) || 5;
    const location = document.getElementById('insureLocation').value;
    const coverage = document.getElementById('insureCoverage').value;
    const result = document.getElementById('insuranceResult');
    
    if (price <= 0) {
        result.innerHTML = '';
        return;
    }
    
    const baseRate = price * 0.01;
    const ageFactor = age < 25 ? 1.5 : age > 50 ? 0.9 : 1.0;
    const expFactor = experience < 2 ? 1.3 : experience < 5 ? 1.1 : 1.0;
    const locFactor = { urban: 1.3, suburban: 1.0, rural: 0.8 };
    const covFactor = { basic: 0.7, standard: 1.0, premium: 1.4 };
    
    const monthlyPremium = baseRate * ageFactor * expFactor * locFactor[location] * covFactor[coverage];
    const annualPremium = monthlyPremium * 12;
    
    result.innerHTML = `
        <h4>Estimated Insurance</h4>
        <div class="premium-monthly">${formatPrice(monthlyPremium)}<small>/month</small></div>
        <div class="premium-annual">${formatPrice(annualPremium)}<small>/year</small></div>
    `;
}

// ============================================
// IMPORT CALCULATOR
// ============================================

function showImportCalc() {
    const modal = document.getElementById('importModal') || createModal('importModal', 'importContent', '📦 Import Calculator');
    const content = document.getElementById('importContent');
    content.innerHTML = `
        <div class="calculator-form">
            <div class="filter-group">
                <label>Vehicle Price ($)</label>
                <input type="number" id="importPrice" placeholder="e.g., 50000" oninput="calculateImport()">
            </div>
            <div class="filter-group">
                <label>Destination Country</label>
                <select id="importCountry" onchange="calculateImport()">
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="EU">European Union</option>
                    <option value="AU">Australia</option>
                    <option value="CA">Canada</option>
                    <option value="JP">Japan</option>
                    <option value="SG">Singapore</option>
                    <option value="AE">UAE</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Shipping Method</label>
                <select id="importShipping" onchange="calculateImport()">
                    <option value="roauto">Roll-on/Roll-off</option>
                    <option value="container">Container</option>
                    <option value="air">Air Freight</option>
                </select>
            </div>
            <div id="importResult" class="import-result"></div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function calculateImport() {
    const price = parseFloat(document.getElementById('importPrice').value) || 0;
    const country = document.getElementById('importCountry').value;
    const shipping = document.getElementById('importShipping').value;
    const result = document.getElementById('importResult');
    
    if (price <= 0) {
        result.innerHTML = '';
        return;
    }
    
    const duties = { US: 0.025, UK: 0.10, EU: 0.10, AU: 0.05, CA: 0.065, JP: 0, SG: 0.20, AE: 0.05 };
    const shippingCosts = { roauto: 1500, container: 2500, air: 8000 };
    
    const duty = price * duties[country];
    const freight = shippingCosts[shipping];
    const clearance = 500;
    const total = price + duty + freight + clearance;
    
    result.innerHTML = `
        <h4>Import Cost Breakdown</h4>
        <div class="import-item"><span>Vehicle Price</span><span>${formatPrice(price)}</span></div>
        <div class="import-item"><span>Import Duty (${duties[country]*100}%)</span><span>${formatPrice(duty)}</span></div>
        <div class="import-item"><span>Freight</span><span>${formatPrice(freight)}</span></div>
        <div class="import-item"><span>Clearance</span><span>${formatPrice(clearance)}</span></div>
        <div class="import-total"><span>Total Cost</span><span>${formatPrice(total)}</span></div>
    `;
}

function createModal(id, contentId, title) {
    const div = document.createElement('div');
    div.id = id;
    div.className = 'modal hidden';
    div.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="back-btn" onclick="closeModal('${id}')">← Back</button>
                <button class="close-btn" onclick="closeModal('${id}')">✕ Exit</button>
            </div>
            <h2>${title}</h2>
            <div id="${contentId}"></div>
        </div>
    `;
    document.body.appendChild(div);
    return div;
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function calculateFinance() {
    const price = parseFloat(document.getElementById('financePrice').value) || 0;
    const down = parseFloat(document.getElementById('financeDown').value) || 0;
    const term = parseInt(document.getElementById('financeTerm').value) || 48;
    const rate = parseFloat(document.getElementById('financeRate').value) || 5.9;
    
    if (price <= 0) {
        alert("Please enter a vehicle price");
        return;
    }
    
    const principal = price - down;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPayment = (monthlyPayment * term) + down;
    const totalInterest = totalPayment - price;
    
    const result = document.getElementById('financeResult');
    result.innerHTML = `
        <div class="monthly">${formatPrice(monthlyPayment)} <small>/month</small></div>
        <div class="total">Total: ${formatPrice(totalPayment)} (Interest: ${formatPrice(totalInterest)})</div>
    `;
}

// ============================================
// THEME
// ============================================

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const target = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
}

// ============================================
// ADMIN
// ============================================

function addNewVehicle() {
    const brand = document.getElementById('newBrand').value;
    const model = document.getElementById('newModel').value;
    const price = document.getElementById('newPrice').value;
    const nation = document.getElementById('newNation').value;
    const category = document.getElementById('newCategory').value;
    const img = document.getElementById('newImage').value;
    const engine = document.getElementById('newEngine').value;
    const horsepower = document.getElementById('newHorsepower').value;
    const transmission = document.getElementById('newTransmission').value;

    if (!brand || !model || !price) {
        return alert("Please fill in required fields (Brand, Model, Price)");
    }

    const newCar = {
        id: Date.now(),
        brand,
        model,
        price: Number(price),
        nation,
        category,
        img: img || getCarImage(brand, model),
        engine: engine || 'N/A',
        horsepower: Number(horsepower) || 0,
        transmission: transmission || 'N/A',
        availability: "In Stock"
    };

    inventory.push(newCar);
    localStorage.setItem('dealership_db', JSON.stringify(inventory));
    render();
    renderAdminInventory();
    
    // Clear form
    document.getElementById('newBrand').value = '';
    document.getElementById('newModel').value = '';
    document.getElementById('newPrice').value = '';
    document.getElementById('newImage').value = '';
    document.getElementById('newEngine').value = '';
    document.getElementById('newHorsepower').value = '';
    document.getElementById('newTransmission').value = '';
    
    alert("Vehicle added successfully!");
}

function deleteVehicle(id) {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    
    inventory = inventory.filter(car => car.id !== id);
    localStorage.setItem('dealership_db', JSON.stringify(inventory));
    render();
    renderAdminInventory();
}

function editVehicle(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    
    const newPrice = prompt("Enter new price for " + car.brand + " " + car.model + ":", car.price);
    if (newPrice === null) return;
    
    car.price = Number(newPrice);
    localStorage.setItem('dealership_db', JSON.stringify(inventory));
    render();
    renderAdminInventory();
}

function showAdminTab(tab) {
    const addTab = document.getElementById('adminAddTab');
    const listTab = document.getElementById('adminListTab');
    const buttons = document.querySelectorAll('.tab-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'add') {
        addTab.classList.remove('hidden');
        listTab.classList.add('hidden');
        buttons[0].classList.add('active');
    } else {
        addTab.classList.add('hidden');
        listTab.classList.remove('hidden');
        buttons[1].classList.add('active');
        renderAdminInventory();
    }
}

function renderAdminInventory() {
    const list = document.getElementById('adminInventoryList');
    let html = '';
    
    inventory.forEach(car => {
        html += `
            <div class="inventory-item">
                <div class="info">
                    <strong>${car.brand} ${car.model}</strong><br>
                    <small>${car.nation} | ${car.category} | ${formatPrice(car.price)}</small>
                </div>
                <div class="actions">
                    <button class="btn-edit" onclick="editVehicle(${car.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteVehicle(${car.id})">Delete</button>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

function checkAdminAccess() {
    if (sessionStorage.getItem('isAdmin') === 'true') {
        showAdminModal();
        return;
    }

    const entry = prompt("Enter Administrator Password:");
    
    if (entry === ADMIN_PASS) {
        sessionStorage.setItem('isAdmin', 'true');
        showAdminModal();
    } else {
        alert("Access Denied: Incorrect Password.");
    }
}

function showAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
    showAdminTab('add');
}

function closeAdmin() {
    document.getElementById('adminModal').classList.add('hidden');
}

// ============================================
// EXPORT
// ============================================

function exportInventory() {
    const dataStr = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    URL.revokeObjectURL(url);
}

// ============================================
// BOOT
// ============================================

init();