const express = require('express');
const userRouter = express.Router();

const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";


userRouter.get('/user/requests/received', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const requests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate('fromUserId', USER_SAFE_DATA);

        res.status(200).send({ message: "Connection requests fetched successfully!", data: requests });
    } catch (error) {
        res.status(500).send({ error: "Error creating user", details: error.message });
    }
});


userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const requests = await ConnectionRequest.find({
            $or: [{ toUserId: loggedInUser._id, status: 'accepted' }, { fromUserId: loggedInUser._id, status: 'accepted' }],
        }).populate('fromUserId', USER_SAFE_DATA);

        const data = requests.map((row) => row.fromUserId);

        res.status(200).send({ message: "All connections fetched successfully!", data });
    } catch (error) {
        res.status(500).send({ error: "Error creating user", details: error.message });
    }
});


module.exports = userRouter;