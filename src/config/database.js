const mogoose = require('mongoose');

const connectDB = async () => {
    await mogoose.connect('mongodb+srv://Thala:tiger@cluster0.kqdqa.mongodb.net/dev-tinder'
    );
};

module.exports = connectDB;