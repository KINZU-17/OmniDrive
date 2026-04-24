const { z } = require('zod');

// MPesa Payment Schema
const MpesaPaymentSchema = z.object({
    phone: z.string().regex(/^254\d{9}$/, 'Invalid Kenya phone number format'),
    amount: z.number().positive('Amount must be positive'),
    checkout_id: z.string().min(1, 'Checkout ID required'),
    vehicle_id: z.string().min(1, 'Vehicle ID required'),
    customer_email: z.string().email('Invalid email address').optional(),
});

// MPesa Callback Schema
const MpesaCallbackSchema = z.object({
    Body: z.object({
        stkCallback: z.object({
            MerchantRequestID: z.string(),
            CheckoutRequestID: z.string(),
            ResultCode: z.number(),
            ResultDesc: z.string(),
            CallbackMetadata: z.object({
                Item: z.array(z.object({
                    Name: z.string(),
                    Value: z.union([z.string(), z.number()]),
                })).optional(),
            }).optional(),
        }),
    }),
});

// Vehicle Listing Schema
const VehicleListingSchema = z.object({
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    price: z.number().positive('Price must be positive'),
    nation: z.string().min(1, 'Nation/origin is required'),
    category: z.enum(['Car', 'Bike', 'Bus', 'Truck', 'Van']).default('Car'),
    condition: z.enum(['New', 'Used', 'Certified']).default('Used'),
    body_style: z.string().optional(),
    fuel_type: z.enum(['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG']).optional(),
    drivetrain: z.enum(['FWD', 'RWD', 'AWD', '4WD']).optional(),
    color: z.string().optional(),
    city: z.string().default('Nairobi'),
    image: z.string().url('Invalid image URL').optional(),
    badges: z.array(z.string()).default([]),
    specs: z.record(z.string(), z.any()).default({}),
    rating: z.number().min(0).max(5).default(4.5),
});

// Order Schema
const OrderSchema = z.object({
    phone: z.string().regex(/^254\d{9}$/, 'Invalid Kenya phone number'),
    amount: z.number().positive(),
    vehicle_id: z.string().min(1),
    vehicle_name: z.string().min(1),
    customer_email: z.string().email().optional(),
});

// Dealer Registration Schema
const DealerRegistrationSchema = z.object({
    dealerName: z.string().min(2, 'Dealer name must be at least 2 characters'),
    businessType: z.enum(['Individual', 'Partnership', 'Company', 'Corporation']),
    registrationNumber: z.string().min(1, 'Registration number required'),
    phone: z.string().regex(/^254\d{9}$/, 'Invalid Kenya phone number'),
    email: z.string().email('Invalid email'),
    city: z.string().min(1, 'City required'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    website: z.string().url('Invalid website URL').optional(),
});

// Pagination Schema
const PaginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// Filter Schema
const VehicleFilterSchema = z.object({
    brand: z.string().optional(),
    model: z.string().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    condition: z.enum(['New', 'Used', 'Certified']).optional(),
    category: z.enum(['Car', 'Bike', 'Bus', 'Truck', 'Van']).optional(),
    fuelType: z.string().optional(),
    city: z.string().optional(),
    ...PaginationSchema.shape,
});

module.exports = {
    MpesaPaymentSchema,
    MpesaCallbackSchema,
    VehicleListingSchema,
    OrderSchema,
    DealerRegistrationSchema,
    PaginationSchema,
    VehicleFilterSchema,
};
