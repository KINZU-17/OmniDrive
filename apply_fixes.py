#!/usr/bin/env python3
import re

# ── Read files ──────────────────────────────────────────────────────────────
with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()

errors = []

def replace(content, old, new, label, filename='script.js'):
    if old in content:
        return content.replace(old, new, 1)
    errors.append(f'NOT FOUND [{filename}]: {label}')
    return content

# ════════════════════════════════════════════════════════════════════════════
# SCRIPT.JS FIXES
# ════════════════════════════════════════════════════════════════════════════

# 1. Fix detail modal wishlist/compare buttons — they close the modal on tap
js = replace(js,
    'onclick="toggleWishlist(${car.id}); closeDetailModal();">',
    'onclick="toggleWishlist(${car.id}); this.textContent=wishlist.includes(${car.id})?\'♥ In Wishlist\':\'♡ Add to Wishlist\'">',
    'detail wishlist button closes modal')

js = replace(js,
    'onclick="toggleCompare(${car.id}); closeDetailModal();">',
    'onclick="toggleCompare(${car.id}); this.textContent=compareList.includes(${car.id})?\'✓ In Compare\':\'+ Add to Compare\'">',
    'detail compare button closes modal')

# 2. Fix detail modal hardcoded year 2024 and wrong fuel/warranty
js = replace(js,
    '<div class="spec-item"><label>📅 Year</label><span>2024</span></div>',
    '<div class="spec-item"><label>📅 Year</label><span>${car.year}</span></div>',
    'detail modal hardcoded year')

js = replace(js,
    "<span>${car.category === 'Bike' ? (car.horsepower < 50 ? 'Gasoline' : 'Gasoline') : (car.nation === 'China' || car.nation === 'USA' && car.brand === 'Tesla' ? 'Electric' : 'Gasoline/Diesel')}</span>",
    '<span>${sanitize(car.fuel)}</span>',
    'detail modal wrong fuel logic')

js = replace(js,
    "<span>${car.category === 'Car' ? '3 Years' : '2 Years'}</span>",
    "<span>${sanitize(car.warranty || (car.category === 'Car' ? '3 Years' : '2 Years'))}</span>",
    'detail modal wrong warranty')

# 3. Fix doRegister — broken notification type string had embedded newline in original
# (already fixed in current file, but ensure it's clean)
js = replace(js,
    "showNotification('Please fill all fields', 'e\nrror');",
    "showNotification('Please fill all required fields', 'error');",
    'doRegister broken error string') if "showNotification('Please fill all fields', 'e\nrror');" in js else js

# 4. Fix clearFilters — doesn't clear mobile search input
js = replace(js,
    "function clearFilters() {\n    document.getElementById('searchBar').value = '';",
    "function clearFilters() {\n    document.getElementById('searchBar').value = '';\n    const _ms = document.getElementById('mobileSearchInput'); if (_ms) _ms.value = '';",
    'clearFilters missing mobile input clear')

# 5. Fix toggleCompare — calls render() on every toggle (expensive, resets scroll)
js = replace(js,
    "    document.getElementById('compareText').innerText = `${compareList.length} Vehicles Selected`;\n    render();",
    "    document.getElementById('compareText').innerText = `${compareList.length} Vehicles Selected`;",
    'toggleCompare calls render()')

# 6. Fix body kit diffuser id with leading space
js = replace(js,
    "{ id: ' diffuser', name: 'Rear Diffuser', price: 1200 }",
    "{ id: 'diffuser', name: 'Rear Diffuser', price: 1200 }",
    'diffuser id leading space')

# 7. Fix duplicate closeModal — first one has no null check
js = replace(js,
    "function closeModal(id) {\n    document.getElementById(id).classList.add('hidden');\n}",
    "function closeModal(id) {\n    const _el = document.getElementById(id);\n    if (_el) _el.classList.add('hidden');\n}",
    'closeModal no null check')

# 8. Fix second duplicate closeModal definition
js = replace(js,
    "// ============================================\n// CLOSE MODAL HELPER\n// ============================================\nfunction closeModal(id) {\n    const el = document.getElementById(id);\n    if (el) el.classList.add('hidden');\n}",
    "// closeModal defined above",
    'duplicate closeModal')

# 9. Fix VIN display — uses car.id not actual VIN format
js = replace(js,
    '<div class="spec-item"><label>🔑 VIN</label><span>${car.id}GD2024</span></div>',
    '<div class="spec-item"><label>🔑 VIN</label><span>${car.id}GD${car.year}</span></div>',
    'VIN hardcoded year')

print("script.js fixes applied")
print("Errors:", errors if errors else "None")

# ════════════════════════════════════════════════════════════════════════════
# CSS FIXES
# ════════════════════════════════════════════════════════════════════════════
css_errors = []

def css_replace(content, old, new, label):
    if old in content:
        return content.replace(old, new, 1)
    css_errors.append(f'NOT FOUND [css]: {label}')
    return content

# 1. Mobile nav menu — needs scroll for 12+ buttons
css = css_replace(css,
    ".nav-tools.mobile-open {\n    display: flex !important;\n    flex-direction: column;\n    width: 100%;\n    background: #0d1117;\n    padding: 10px 0;\n    gap: 8px;\n}",
    ".nav-tools.mobile-open {\n    display: flex !important;\n    flex-direction: column;\n    width: 100%;\n    background: #0d1117;\n    padding: 10px 0;\n    gap: 8px;\n    max-height: 70vh;\n    overflow-y: auto;\n    -webkit-overflow-scrolling: touch;\n}",
    'mobile nav not scrollable')

# 2. Filter bar sticky top on mobile — overlaps mobile search bar
css = css_replace(css,
    "    /* ── Filter bar ── */\n    .filter-bar {\n        margin: 0 0 12px;\n        padding: 8px 12px;\n        top: 56px;\n    }",
    "    /* ── Filter bar ── */\n    .filter-bar {\n        margin: 0 0 12px;\n        padding: 8px 12px;\n        top: 106px;\n    }",
    'filter bar top overlaps mobile search')

# 3. Compare tray overlaps bottom-nav on mobile
css = css_replace(css,
    "@media (max-width: 600px) {\n    /* Minimum 44px tap targets */",
    "@media (max-width: 600px) {\n    .compare-tray { bottom: 60px; }\n\n    /* Minimum 44px tap targets */",
    'compare tray overlaps bottom nav')

print("styles.css fixes applied")
print("CSS Errors:", css_errors if css_errors else "None")

# ════════════════════════════════════════════════════════════════════════════
# Write fixed files
# ════════════════════════════════════════════════════════════════════════════
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("\nAll files written successfully.")
