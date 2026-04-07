let inventory = [
    { id: 1, brand: "Nissan", model: "GT-R", price: 120000, nation: "Japan" },
    { id: 2, brand: "Porsche", model: "911", price: 115000, nation: "Germany" },
    { id: 3, brand: "Ford", model: "Mustang", price: 55000, nation: "USA" }
];

let liveRates = { USD: 1 };
let compareList = [];
let currentCurrency = 'USD';

// Initialize App: Get live rates and render
async function init() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        liveRates = data.rates;
    } catch (e) { console.log("Using default rates"); }
    render();
}

function render(data = inventory) {
    const grid = document.getElementById('vehicleGrid');
    grid.innerHTML = '';

    data.forEach(car => {
        const convertedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency', currency: currentCurrency
        }).format(car.price * liveRates[currentCurrency]);

        grid.innerHTML += `
            <div class="car-card">
                <h3>${car.brand} ${car.model}</h3>
                <p>Origin: ${car.nation} 🌏</p>
                <p class="price">${convertedPrice}</p>
                <button onclick="toggleCompare(${car.id})">
                    ${compareList.includes(car.id) ? 'Remove' : 'Add to Compare'}
                </button>
            </div>
        `;
    });
}

function applyFilters() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const nation = document.getElementById('nationFilter').value;
    const maxP = document.getElementById('priceRange').value;
    
    document.getElementById('priceDisplay').innerText = `$${Number(maxP).toLocaleString()}`;

    const filtered = inventory.filter(car => {
        return (car.brand.toLowerCase().includes(query)) &&
               (nation === 'all' || car.nation === nation) &&
               (car.price <= maxP);
    });
    render(filtered);
}

function updateCurrency() {
    currentCurrency = document.getElementById('currencyPicker').value;
    render();
}

function toggleCompare(id) {
    const index = compareList.indexOf(id);
    if (index > -1) compareList.splice(index, 1);
    else if (compareList.length < 3) compareList.push(id);
    
    document.getElementById('compareTray').className = compareList.length > 0 ? 'compare-tray' : 'compare-tray hidden';
    document.getElementById('compareText').innerText = `${compareList.length} Vehicles Selected`;
    render();
}

init();

function addNewVehicle() {
    const brand = document.getElementById('newBrand').value;
    const model = document.getElementById('newModel').value;
    const price = document.getElementById('newPrice').value;
    const nation = document.getElementById('newNation').value;

    if(!brand || !model || !price) return alert("Fill all fields!");

    const newCar = {
        id: Date.now(), // Unique ID
        brand,
        model,
        price: Number(price),
        nation,
        reviews: 5.0
    };

    inventory.push(newCar);
    localStorage.setItem('dealership_db', JSON.stringify(inventory));
    render(); // Update the shop immediately!
    
    // Clear the form
    document.getElementById('newBrand').value = '';
    document.getElementById('newModel').value = '';
    document.getElementById('newPrice').value = '';
}

const ADMIN_PASS = "admin123";

function checkAdminAccess() {
    // Check if already logged in for this session
    if (sessionStorage.getItem('isAdmin') === 'true') {
        showAdminPanel();
        return;
    }

    const entry = prompt("Enter Administrator Password:");
    
    if (entry === ADMIN_PASS) {
        sessionStorage.setItem('isAdmin', 'true');
        showAdminPanel();
    } else {
        alert("Access Denied: Incorrect Password.");
    }
}

function showAdminPanel() {
    document.getElementById('adminPanel').classList.remove('hidden');
}

function closeAdmin() {
    document.getElementById('adminPanel').classList.add('hidden');
}