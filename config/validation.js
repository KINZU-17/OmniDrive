const { z } = require('zod');

// MPesa Payment Validation
const mpesaPurchaseSchema = z.object({
    phone: z.string().regex(/^(?:\+?254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
    amount: z.number().min(1, 'Amount must be at least 1').max(999999, 'Amount too large'),
    vehicleName: z.string().min(1, 'Vehicle name required'),
    vehicleId: z.string().optional(),
    email: z.string().email('Invalid email').optional(),
});

const mpesaStatusSchema = z.object({
    checkoutRequestId: z.string().min(1, 'CheckoutRequestId required'),
});

// Listings Validation
const listingCreateSchema = z.object({
    brand: z.string().min(1, 'Brand required').max(50),
    model: z.string().min(1, 'Model required').max(100),
    price: z.number().min(0, 'Price must be non-negative'),
    nation: z.string().min(1, 'Nation required').max(50),
    category: z.enum(['Car', 'Bike', 'Bus', 'Truck', 'Van']).optional().default('Car'),
    condition: z.enum(['New', 'Used']).optional().default('Used'),
    body_style: z.string().optional(),
    fuel_type: z.string().optional(),
    drivetrain: z.string().optional(),
    color: z.string().optional(),
    city: z.string().optional().default('Nairobi'),
    image: z.any().optional(),
    badges: z.array(z.string()).optional(),
    specs: z.record(z.any()).optional(),
    rating: z.number().min(0).max(5).optional(),
});

const listingUpdateSchema = listingCreateSchema.extend({
    isActive: z.boolean().optional(),
});

const listingQuerySchema = z.object({
    brand: z.string().optional(),
    category: z.enum(['Car', 'Bike', 'Bus', 'Truck', 'Van']).optional(),
    nation: z.string().optional(),
    sort: z.enum(['price', 'rating', 'createdAt', 'brand', 'model']).optional().default('createdAt'),
    order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Dealer Registration Validation
const dealerRegisterSchema = z.object({
    name: z.string().min(2, 'Dealership name required').max(100),
    owner: z.string().min(2, 'Owner name required').max(100),
    phone: z.string().regex(/^(?:\+?254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
    email: z.string().email('Invalid email'),
    city: z.string().min(1, 'City required'),
    address: z.string().optional(),
    types: z.string().optional(),
    plan: z.enum(['starter', 'professional', 'enterprise']),
    about: z.string().optional(),
    payment: z.string().optional().default('mpesa'),
});

// Pending Listing Submission
const pendingListingSchema = z.object({
    listing_id: z.string().optional(),
    brand: z.string().min(1, 'Brand required'),
    model: z.string().min(1, 'Model required'),
    price: z.number().min(0, 'Price must be non-negative'),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    category: z.enum(['Car', 'Bike', 'Bus', 'Truck', 'Van']).optional(),
    condition: z.enum(['New', 'Used']).optional(),
    mileage: z.number().int().min(0).optional(),
    fuel: z.string().optional(),
    city: z.string().optional(),
    description: z.string().optional(),
    img: z.string().optional(),
    seller: z.object({
        name: z.string().min(1, 'Seller name required'),
        phone: z.string().regex(/^(?:\+?254|0)[17]\d{8}$/, 'Invalid phone number'),
        email: z.string().email('Invalid email').optional(),
    }),
});

// Admin Actions
const adminActionSchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
});

module.exports = {
    mpesaPurchaseSchema,
    mpesaStatusSchema,
    listingCreateSchema,
    listingUpdateSchema,
    listingQuerySchema,
    dealerRegisterSchema,
    pendingListingSchema,
    adminActionSchema,
};
