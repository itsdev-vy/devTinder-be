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
        res.status(500).send({ error: "Error fetching connection requests", details: error.message });
    }
});


userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const requests = await ConnectionRequest.find({
            $or: [{ toUserId: loggedInUser._id, status: 'accepted' }, { fromUserId: loggedInUser._id, status: 'accepted' }],
        }).populate('fromUserId', USER_SAFE_DATA).populate('toUserId', USER_SAFE_DATA);

        const data = requests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            } else {
                return row.fromUserId;
            }
        });

        res.status(200).send({ message: "All connections fetched successfully!", data });
    } catch (error) {
        res.status(500).send({ error: "Error fetching connections", details: error.message });
    }
});


userRouter.get('/user/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;

        const requests = await ConnectionRequest.find({
            $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
        }).select('fromUserId toUserId');

        const hideUsersFromFeed = new Set();
        requests.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        const data = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select(USER_SAFE_DATA).skip((page - 1) * limit).limit(limit);

        res.status(200).send({ message: "User feed fetched successfully!", data });
    } catch (error) {
        res.status(400).send({ error: "Error fetching user feed", details: error.message });
    }
});


module.exports = userRouter;