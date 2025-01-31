const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const { validateEditProfileData } = require('../utils/validation');
const bcrypt = require('bcrypt');


profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        } else {
            return res.status(200).send(user);
        }
    } catch (error) {
        res.status(500).send({ error: "Error fetching profile", details: error.message });
    }
})


profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            return res.status(400).send({ error: "Invalid updates" });
        }
        const loggedInUser = req.user;

        Object.keys(req.body).forEach(key => loggedInUser[key] = req.body[key]);

        if (!loggedInUser) {
            return res.status(404).send({ error: "User not found" });
        } else {
            const updatedUser = await loggedInUser.save();
            return res.status(200).send(updatedUser);
        }
    } catch (error) {
        res.status(500).send({ error: "Error updating profile", details: error.message });
    }
})


profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    const user = req.user;

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(400).send({ error: "Passwords do not match" });
    }

    if (!user) {
        return res.status(404).send({ error: "User not found" });
    }

    const isPasswordMatched = await user.validatePassword(currentPassword);

    if (isPasswordMatched) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        user.password = passwordHash;
        await user.save();
        return res.status(200).send({ message: "Password updated successfully" });
    } else {
        return res.status(401).send({ error: "Invalid password" });
    }
})

module.exports = profileRouter;