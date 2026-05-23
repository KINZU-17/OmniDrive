const sessionKey = 'omnidrive_session';
const session = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
const summaryGrid = document.getElementById('summaryGrid');
const panelContent = document.getElementById('panelContent');
const dashboardTitle = document.getElementById('dashboardTitle');
const dashboardSubtitle = document.getElementById('dashboardSubtitle');
const userPill = document.getElementById('userPill');
const logoutBtn = document.getElementById('logoutBtn');

if (!session || !session.userType) {
    window.location.href = 'login.html';
} else {
    initializeDashboard();
}

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(sessionKey);
    window.location.href = 'login.html';
});

function initializeDashboard() {
    const userLabel = `${session.username || session.email} • ${capitalize(session.userType)}`;
    dashboardTitle.textContent = `${capitalize(session.userType)} Dashboard`;
    dashboardSubtitle.textContent = `Welcome back, ${session.username || session.email}. Here is your OmniDrive command center.`;
    userPill.innerHTML = `<span class="dot"></span>${userLabel}`;

    fetchDashboardSummary();
}

function getRequestHeaders() {
    const headers = {
        'x-user-role': session.userType,
        'x-user-email': session.email || session.username || '',
    };
    if (session.userType === 'admin' && session.adminKey) {
        headers['x-admin-key'] = session.adminKey;
    }
    return headers;
}

async function fetchDashboardSummary() {
    const headers = getRequestHeaders();
    try {
        const response = await fetch('/api/dashboard/summary', { headers });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Unable to load dashboard summary');
        }

        renderDashboard(payload.data);
    } catch (err) {
        renderFallbackDashboard(err.message);
    }
}

function renderDashboard(data) {
    renderTopCards(data);

    if (session.userType === 'client') {
        renderClientPanel(data);
    } else if (session.userType === 'dealer') {
        renderDealerPanel(data);
    } else if (session.userType === 'liaison') {
        renderLiaisonPanel(data);
    } else if (session.userType === 'admin') {
        renderAdminPanel(data);
    }
}

function renderFallbackDashboard(errorMessage) {
    summaryGrid.innerHTML = '';
    panelContent.innerHTML = `
        <div class="action-box">
            <h3>Dashboard offline</h3>
            <p>We could not retrieve live dashboard data. Please ensure the backend is running and refresh the page.</p>
            <div class="button-group">
                <button onclick="window.location.reload()">Retry</button>
                <button onclick="window.location.href='index.html'">Back to showroom</button>
            </div>
        </div>
        <p style="margin-top:18px;color:var(--text-muted);">Error: ${escapeHtml(errorMessage)}</p>
    `;
}

function renderTopCards(data) {
    const cards = [];

    if (session.userType === 'client') {
        cards.push({ title: 'Orders', value: data.orderCount || 0 });
        cards.push({ title: 'Total Spent', value: formatCurrency(data.totalSpent || 0) });
        cards.push({ title: 'Recommendations', value: data.recommendations?.length || 0 });
        cards.push({ title: 'Last Synced', value: formatDateTime(data.currentTime) });
    } else if (session.userType === 'dealer') {
        cards.push({ title: 'Active Inventory', value: data.activeListingsCount || 0 });
        cards.push({ title: 'Pending Approvals', value: data.pendingApplicationCount || 0 });
        cards.push({ title: 'Revenue', value: formatCurrency(data.totalRevenue || 0) });
        cards.push({ title: 'Latest Orders', value: data.activeOrders?.length || 0 });
    } else if (session.userType === 'liaison') {
        cards.push({ title: 'Active Leads', value: data.leads?.length || 0 });
        cards.push({ title: 'Successful Deals', value: data.successfulDeals || 0 });
        cards.push({ title: 'Commission Estimate', value: formatCurrency(data.commissionEstimate || 0) });
        cards.push({ title: 'Updated', value: formatDateTime(data.currentTime) });
    } else if (session.userType === 'admin') {
        cards.push({ title: 'Total Listings', value: data.stats?.listings || 0 });
        cards.push({ title: 'Total Orders', value: data.stats?.orders || 0 });
        cards.push({ title: 'Total Revenue', value: formatCurrency(data.stats?.totalRevenue || 0) });
        cards.push({ title: 'Pending Deals', value: data.pendingDeals || 0 });
    }

    summaryGrid.innerHTML = cards.map(card => `
        <article class="stat-card">
            <h3>${card.title}</h3>
            <p class="value">${card.value}</p>
        </article>
    `).join('');
}

function renderClientPanel(data) {
    panelContent.innerHTML = `
        <div class="action-panel">
            <div class="action-box">
                <h3>Your Recent Orders</h3>
                ${renderOrderTable(data.recentOrders)}
            </div>
            <div class="action-box">
                <h3>Top Recommended Vehicles</h3>
                ${renderRecommendations(data.recommendations)}
            </div>
            <div class="action-box">
                <h3>Quick Actions</h3>
                <p>Continue browsing the showroom or save favorites for later.</p>
                <div class="button-group">
                    <button onclick="window.location.href='index.html'">Browse Showroom</button>
                    <button onclick="openWishlist()">View Wishlist</button>
                </div>
            </div>
        </div>
    `;
}

function renderDealerPanel(data) {
    panelContent.innerHTML = `
        <div class="action-panel">
            <div class="action-box">
                <h3>Inventory Snapshot</h3>
                ${renderListingTable(data.recentListings)}
            </div>
            <div class="action-box">
                <h3>Latest Orders</h3>
                ${renderOrderTable(data.activeOrders)}
            </div>
            <div class="action-box">
                <h3>List a New Vehicle</h3>
                <form id="listingForm" class="form-row">
                    <input name="brand" placeholder="Brand" required />
                    <input name="model" placeholder="Model" required />
                    <input type="number" name="price" placeholder="Price (KES)" required />
                    <input name="nation" placeholder="Nation" value="Kenya" required />
                    <input name="category" placeholder="Category" value="Car" required />
                    <input name="condition" placeholder="Condition" value="Used" required />
                    <input name="city" placeholder="City" value="Nairobi" required />
                    <input name="color" placeholder="Color" />
                    <input name="fuel_type" placeholder="Fuel type" />
                    <input name="drivetrain" placeholder="Drivetrain" />
                    <input name="image" placeholder="Image URL" />
                    <textarea name="specs" placeholder="Specs JSON (optional)"></textarea>
                    <button type="submit">Create Listing</button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('listingForm').addEventListener('submit', handleDealerListingSubmit);
}

function renderLiaisonPanel(data) {
    panelContent.innerHTML = `
        <div class="action-panel">
            <div class="action-box">
                <h3>Your Active Leads</h3>
                ${renderLeadList(data.leads)}
            </div>
            <div class="action-box">
                <h3>Commission Summary</h3>
                <p class="form-footer">Your estimated earnings are based on live deals assigned to your liaison account.</p>
                <div class="metric-pill">${formatCurrency(data.commissionEstimate || 0)}</div>
                <div class="metric-pill">${data.successfulDeals || 0} completed deals</div>
            </div>
            <div class="action-box">
                <h3>Support Actions</h3>
                <p>Use your liaison dashboard to track buyer requests, broker interactions, and lead follow-ups.</p>
                <div class="button-group">
                    <button onclick="window.location.href='index.html'">Browse Vehicles</button>
                    <button onclick="window.location.reload()">Refresh Leads</button>
                </div>
            </div>
        </div>
    `;
}

function renderAdminPanel(data) {
    panelContent.innerHTML = `
        <div class="action-panel">
            <div class="action-box">
                <h3>Platform Summary</h3>
                <div class="metric-pill">Total dealers: ${data.stats.dealers || 0}</div>
                <div class="metric-pill">Pending applications: ${data.applications || 0}</div>
                <div class="metric-pill">Pending deals: ${data.pendingDeals || 0}</div>
            </div>
            <div class="action-box">
                <h3>Latest Orders</h3>
                ${renderOrderTable(data.latestOrders)}
            </div>
            <div class="action-box">
                <h3>Recent Listings</h3>
                ${renderListingTable(data.latestListings)}
            </div>
        </div>
    `;
}

function renderOrderTable(orders = []) {
    if (!orders.length) {
        return '<p class="form-footer">No orders found yet.</p>';
    }

    return `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Vehicle</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${escapeHtml(order.vehicle_name || 'n/a')}</td>
                            <td>${formatCurrency(order.amount || 0)}</td>
                            <td>${renderStatus(order.status)}</td>
                            <td>${formatDateTime(order.created_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderListingTable(listings = []) {
    if (!listings.length) {
        return '<p class="form-footer">No listings to show yet.</p>';
    }

    return `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Vehicle</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${listings.map(listing => `
                        <tr>
                            <td>#${listing.id}</td>
                            <td>${escapeHtml(listing.brand)} ${escapeHtml(listing.model)}</td>
                            <td>${formatCurrency(listing.price || 0)}</td>
                            <td>${escapeHtml(listing.city || listing.nation || 'N/A')}</td>
                            <td>${listing.isActive ? '<span class="status-pill success">Active</span>' : '<span class="status-pill failed">Inactive</span>'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderRecommendations(listings = []) {
    if (!listings.length) {
        return '<p class="form-footer">No recommendations available right now.</p>';
    }

    return `
        <div class="grid-list">
            ${listings.map(listing => `
                <div class="action-box">
                    <strong>${escapeHtml(listing.brand)} ${escapeHtml(listing.model)}</strong>
                    <p class="form-footer">${formatCurrency(listing.price || 0)} • ${escapeHtml(listing.nation || listing.city || 'Kenya')}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderLeadList(leads = []) {
    if (!leads.length) {
        return '<p class="form-footer">No leads available at the moment.</p>';
    }

    return `
        <div class="grid-list">
            ${leads.map(lead => `
                <div class="action-box">
                    <strong>${escapeHtml(lead.name)}</strong>
                    <p class="form-footer">${escapeHtml(lead.email)}</p>
                    <span class="status-pill pending">${escapeHtml(lead.role)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

async function handleDealerListingSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
        brand: formData.get('brand'),
        model: formData.get('model'),
        price: Number(formData.get('price')),
        nation: formData.get('nation'),
        category: formData.get('category'),
        condition: formData.get('condition'),
        body_style: formData.get('body_style') || '',
        fuel_type: formData.get('fuel_type') || '',
        drivetrain: formData.get('drivetrain') || '',
        color: formData.get('color') || '',
        city: formData.get('city') || '',
        image: formData.get('image') || '',
        badges: [],
        specs: parseSpecs(formData.get('specs')),
        rating: 4.5,
    };

    try {
        const response = await fetch('/api/dealer/listings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getRequestHeaders(),
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Unable to create listing');
        }
        alert('Listing created successfully!');
        form.reset();
        fetchDashboardSummary();
    } catch (err) {
        alert(`Failed to create listing: ${err.message}`);
    }
}

function parseSpecs(value) {
    if (!value) return {};
    try {
        return JSON.parse(value);
    } catch {
        return { notes: value };
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value || 0);
}

function formatDateTime(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.valueOf())) return value;
    return d.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
}

function renderStatus(status) {
    if (!status) return '<span class="status-pill pending">Pending</span>';
    const label = status.toLowerCase();
    if (label === 'paid' || label === 'completed') {
        return '<span class="status-pill success">Paid</span>';
    }
    if (label === 'failed') {
        return '<span class="status-pill failed">Failed</span>';
    }
    return `<span class="status-pill pending">${escapeHtml(status)}</span>`;
}

function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function escapeHtml(value) {
    if (typeof value !== 'string') return value;
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}

function openWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('omnidrive_wishlist') || '[]');
    if (!wishlist.length) {
        alert('Your wishlist is currently empty. Add favourites from the showroom.');
        return;
    }
    const list = wishlist.map(item => `- ${item.brand} ${item.model} (${formatCurrency(item.price)})`).join('\n');
    alert(`Saved Vehicles:\n\n${list}`);
}
