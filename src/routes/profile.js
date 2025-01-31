const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const { validateEditProfileData } = require('../utils/validation');


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
    //todo
})

module.exports = profileRouter;