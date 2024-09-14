const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();

const serverConfig = require('./configs/server.config');
const dbConfig = require('./configs/db.config');
const UserModel = require('./models/user.model');

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE,PATCH,HEAD',
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
mongoose.connect(dbConfig.DB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
    init();
});

// Initialize the application and create an admin user if not present
async function init() {
    try {
        let user = await UserModel.findOne({ userId: 'admin' });
        if (user) {
            console.log('Admin is already present');
            return;
        }

        user = await UserModel.create({
            name: 'Vishwa',
            userId: 'admin',
            email: 'kaushl@gmail.com',
            password: bcrypt.hashSync('Welcome1', 8),
            userType: 'ADMIN',
            paymentMethod: 'creditCard',
            cardNumber: '1234 5678 9012 3456',
            expiryDate: '2024-12',
            cvv: '123',
            upiId: ''
        });

        console.log('Admin created: ', user);
    } catch (err) {
        console.error('Error while creating admin', err);
    }
}

// Attach routes to the server
const authRoutes = require('./routes/auth.routes');
app.use('/ecomm/api/v1/auth', authRoutes);

// Start the server
app.listen(serverConfig.PORT, () => {
    console.log(`Server started at port: ${serverConfig.PORT}`);
});
