const express = require('express');

const requestRouter = express.Router();

requestRouter.post('/sendConnectionRequest', async (req, res) => {
    const user = req.user;
    console.log("Sending connection request", user);

    res.status(200).send({ message: "Connection request sent" });
});

module.exports = requestRouter;