const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    emailId: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email' + value);
            }
        }
        // immutable: true // This will make sure that the emailId field cannot be updated once set. As it will not throw any error and silently ignore the update operation user gets confused what went wrong that's why we will implement this in api level not this approach.
    },
    password: {
        type: String,
        required: true,
        // minLength: 8,
        // maxLength: 20,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error('Password is not strong enough');
            }
        }
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
        default: "https://www.strasys.uk/wp-content/uploads/2022/02/Depositphotos_484354208_S.jpg",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error('Invalid URL');
            }
        }
    },
    about: {
        type: String,
        default: "Hey there! It's a default value.",
        maxLength: 200
    },
    skills: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.length <= 5; // Limit to 5 elements
            },
            message: 'You can have a maximum of 5 skills.'
        }
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    membershipType: {
        type: String,
    },
}, { timestamps: true });

//Schema methods

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJwt = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_SECRET_EXPIRY });
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}

module.exports = mongoose.model('User', userSchema);