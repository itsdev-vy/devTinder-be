const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).send({ error: "Invalid token" });
        }

        const decoded = await jwt.verify(token, "Dev@Tinder$790");

        const { _id } = decoded;

        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        req.user = user;
        next();

    }
    catch (error) {
        res.status(500).send({ error: "Error fetching profile", details: error.message });
    }
}

module.exports = { userAuth };