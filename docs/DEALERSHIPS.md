# OmniDrive Multi-Dealership Architecture

## Overview

OmniDrive is designed as a multi-dealership marketplace where multiple independent dealerships can operate under one unified platform while maintaining their own branding, inventory, and administrative control.

## Multi-Dealership Model

### Dealership Structure

Each dealership on OmniDrive operates as an independent entity with:

- **Unique Dealership Name**: e.g., "Toyota Kenya", "Nissan Premium", "AutoWorld Kenya"
- **Custom Branding**: Logo, colors, and identity
- **Dedicated Admin**: Each dealership has its own admin who manages their inventory, staff, and customers
- **Separate Inventory**: Vehicles are tagged with the dealership_id
- **Independent Pricing**: Each dealership sets their own prices
- **Custom Domain Support**: Optional branded subdomains (e.g., toyota.omnidrive.co.ke)

### User Roles in Multi-Dealership Context

#### 1. **Super Admin** (Platform Owner)
- **Role**: Overall platform management
- **Access**: All dealerships, global analytics, platform settings
- **Features**:
  - Manage all dealerships
  - View global statistics
  - Set platform-wide policies
  - Handle billing and subscriptions

#### 2. **Dealership Admin** (Per Dealership)
- **Role**: Owner/manager of a specific dealership
- **Access**: Only their dealership's vehicles, staff, and customers
- **Features**:
  - Add/edit/delete vehicles for their dealership
  - Manage their sales team
  - View dealership-specific analytics
  - Handle customer inquiries for their vehicles
  - Customize dealership profile and branding

#### 3. **Dealership Staff**
- **Role**: Sales representatives working for a dealership
- **Access**: Limited to their dealership's inventory and assigned customers
- **Features**:
  - View and update assigned vehicles
  - Handle customer inquiries
  - Process sales and payments

#### 4. **Technical Liaison** (Per Dealership or Global)
- **Role**: Facilitator connecting buyers and sellers
- **Access**: Can work with multiple dealerships or be assigned to one
- **Features**:
  - View available inventory across partners
  - Facilitate transactions
  - Earn commission per sale

#### 5. **Clients** (Same as before)
- **Role**: Vehicle buyers
- **Access**: Browse all dealerships on the platform
- **Features**:
  - Filter by dealership
  - Compare vehicles across dealerships
  - Contact specific dealerships

## Database Schema (Multi-Dealership)

```sql
-- Dealerships table
CREATE TABLE dealerships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,        -- e.g., 'toyota-kenya'
    logo_url TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    admin_user_id INTEGER,            -- Link to user who is admin
    is_active BOOLEAN DEFAULT true,
    subscription_plan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table with dealership association
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL,               -- 'client', 'dealer_admin', 'staff', 'liaison', 'super_admin'
    dealership_id INTEGER,            -- NULL for clients and super_admin
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table with dealership tag
CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dealership_id INTEGER NOT NULL,   -- Which dealership owns this vehicle
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    price DECIMAL(10,2),
    condition TEXT,                   -- 'new', 'used', 'cpo'
    status TEXT DEFAULT 'available',    -- 'available', 'reserved', 'sold'
    -- ... other vehicle fields
);
```

## Dealership Access Patterns

### 1. **Direct Access**
- URL: `omnidrive.co.ke/dealerships/toyota-kenya`
- Shows only vehicles from Toyota Kenya
- Dealership admin login at: `omnidrive.co.ke/login?dealership=toyota-kenya`

### 2. **Super Admin Access**
- URL: `omnidrive.co.ke/super-admin`
- Shows all dealerships, global analytics
- Platform management tools

### 3. **Client Browser Access**
- URL: Main OmniDrive site
- Can filter by dealership
- "Shop by Dealer" section on homepage

## Implementation Plan

### Phase 1: Database & Backend
1. Add `dealership_id` to users and vehicles tables
2. Create dealerships table with CRUD endpoints
3. Update authentication to scope by dealership
4. Modify all queries to filter by dealership_id

### Phase 2: Frontend Updates
1. Dealership selection modal on login for dealers
2. "Shop by Dealer" section on homepage
3. Dealership-specific vehicle listings
4. Dealership profile pages

### Phase 3: Admin Dashboard
1. Dealership-scoped admin panel
2. Staff management within dealership
3. Dealership-specific analytics

### Phase 4: Branding & Customization
1. Custom logos/colors per dealership
2. Optional sub-domain support
3. Dealership-specific pricing rules

## API Endpoints

```
GET    /api/dealerships                    # List all active dealerships
GET    /api/dealerships/:slug              # Get dealership details
GET    /api/dealerships/:slug/vehicles     # Get vehicles for a dealership

# Dealership Admin (scoped by dealership_id from auth)
POST   /api/vehicles                       # Create vehicle for their dealership
PUT    /api/vehicles/:id                   # Update (only if owned by their dealership)
DELETE /api/vehicles/:id                   # Delete (only if owned by their dealership)

# Super Admin (platform-wide access)
GET    /api/super-admin/dealerships       # All dealerships
GET    /api/super-admin/stats             # Global statistics
```

## Benefits of Multi-Dealership Model

1. **Centralized Platform**: One marketplace for all dealerships
2. **Shared Infrastructure**: Lower costs for individual dealerships
3. **Increased Reach**: Dealerships benefit from platform visibility
4. **Consistent Experience**: Unified checkout, payment, and customer service
5. **Scalable**: Easy to add new dealerships
6. **Competition**: Dealerships can compete fairly within the platform

## Next Steps

1. Create DEALERSHIPS.md with detailed API documentation
2. Update database schema
3. Implement dealership middleware for request scoping
4. Create dealership admin dashboard
5. Add dealership filtering to frontend