const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'OmniDrive API Documentation',
            version: '1.0.0',
            description: 'Kenya\'s premier online vehicle marketplace API. Comprehensive API for browsing vehicles, managing listings, processing payments via M-Pesa, and managing orders.',
            contact: {
                name: 'OmniDrive Support',
                email: 'info@omnidrive.co.ke',
            },
            license: {
                name: 'ISC',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                adminKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-admin-key',
                    description: 'Admin API Key for protected endpoints',
                },
            },
            schemas: {
                Listing: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        brand: { type: 'string', example: 'Toyota' },
                        model: { type: 'string', example: 'Corolla' },
                        price: { type: 'number', example: 1500000 },
                        nation: { type: 'string', example: 'Japan' },
                        category: { type: 'string', enum: ['Car', 'Bike', 'Bus', 'Truck', 'Van'] },
                        condition: { type: 'string', enum: ['New', 'Used'] },
                        body_style: { type: 'string' },
                        fuel_type: { type: 'string' },
                        drivetrain: { type: 'string' },
                        color: { type: 'string' },
                        city: { type: 'string' },
                        image: { type: 'string' },
                        badges: { type: 'array', items: { type: 'string' } },
                        specs: { type: 'object' },
                        rating: { type: 'number', minimum: 0, maximum: 5 },
                        reviewCount: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        isActive: { type: 'boolean' },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        checkout_id: { type: 'string' },
                        phone: { type: 'string' },
                        amount: { type: 'number' },
                        vehicle_id: { type: 'string' },
                        vehicle_name: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'paid', 'failed'] },
                        receipt: { type: 'string' },
                        customer_email: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        details: { type: 'array' },
                    },
                },
            },
        },
    },
    apis: ['./routes/*.js', './server.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
