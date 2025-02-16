const dotenv = require('dotenv');

const express = require('express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config({ path: './.env' })

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes Import
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');


// Routes Declaration
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);


connectDB().then(() => {
    console.log('Database connected');
    app.listen(7777, () => {
        console.log('Server started on port 8000');
    });
}).catch((err) => {
    console.log(err);
});