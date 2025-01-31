const validator = require('validator');

const validateSignUpData = (req) => {

    const { emailId, password, firstName, lastName } = req.body;

    if (!firstName || !lastName) {
        throw new Error('First Name and Last Name are required');
    }
    else if (!validator.isEmail(emailId)) {
        throw new Error('Invalid email');
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error('Password is not strong enough');
    }
};

const validateEditProfileData = (req) => {
    const allowedUpdates = ['firstName', 'lastName', 'emailId', 'photoUrl', 'gender', 'age', 'about', 'skills'];
    const isAllowedUpdate = Object.keys(req.body).every(update => allowedUpdates.includes(update));

    return isAllowedUpdate;
}

module.exports = { validateSignUpData, validateEditProfileData };