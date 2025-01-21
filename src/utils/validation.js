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

module.exports = { validateSignUpData };