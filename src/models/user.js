const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        lowercase: true,
        enum: ['male', 'female', 'other'],

        //or

        // validate(value) {
        //     if (value !== 'male' && value !== 'female' && value !== 'other') {
        //         throw new Error('Invalid gender');
        //     }
        // }
    },
    photoUrl: {
        type: String,
        default: "https://www.strasys.uk/wp-content/uploads/2022/02/Depositphotos_484354208_S.jpg"
    },
    about: {
        type: String,
        default: "Hey there! It's a default value."
    },
    skills: {
        type: [String]
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);