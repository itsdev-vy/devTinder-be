const mogoose = require('mongoose');

const connectDB = async () => {
    await mogoose.connect(process.env.MONGO_URI);
};

module.exports = connectDB;