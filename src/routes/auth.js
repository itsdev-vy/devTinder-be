const express = require('express');
const bcrypt = require('bcrypt');
const { validateSignUpData } = require('../utils/validation');
const User = require('../models/user');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    const { firstName, lastName, emailId, password } = req.body;

    try {
        //validating user data
        validateSignUpData(req);

        //checking if user already exists
        const userExists = await User.findOne({ emailId: emailId });
        if (userExists) {
            return res.status(400).send({ error: "User already exists" });
        }

        //Encrypting password
        const passwordHash = await bcrypt.hash(password, 10);

        //creating new instance of user
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });

        await user.save();
        res.status(201).send({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).send({ error: "Error registering user", details: error.message });
    }
});

authRouter.post("/login", async (req, res) => {
    const { emailId, password } = req.body;

    if (!emailId && !password) {
        return res.status(400).send({ error: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ emailId: emailId });
        if (user) {
            const isPasswordValid = await user.validatePassword(password);

            if (isPasswordValid) {
                const token = await user.getJwt();
                res.cookie('token', token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), httpOnly: true });
                const userWithoutPassword = await User.findOne({ emailId: emailId }).select("-password");
                res.status(200).send({ message: "User logged in successfully!", data: userWithoutPassword });
            } else {
                res.status(401).send({ error: "Invalid credentials" });
            }
        } else {
            res.status(404).send({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ error: "Error logging in user", details: error.message });
    }
})

authRouter.post("/logout", async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    res.status(200).send({ message: "User logged out successfully!" });
})

module.exports = authRouter;