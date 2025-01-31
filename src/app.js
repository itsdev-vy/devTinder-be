const dotenv = require('dotenv');

const express = require('express');
const connectDB = require('./config/database');

const cookieParser = require('cookie-parser');
const { userAuth } = require('./middlewares/auth');

dotenv.config({ path: './.env' })

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes Import
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');


// Routes Declaration
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);


connectDB().then(() => {
    console.log('Database connected');
    app.listen(process.env.PORT, () => {
        console.log('Server started on port 8000');
    });
}).catch((err) => {
    console.log(err);
});