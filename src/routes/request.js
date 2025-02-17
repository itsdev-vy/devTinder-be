const express = require('express');
const requestRouter = express.Router();

const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const { run } = require('../utils/sendEmail');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ['ignored', 'interested'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status" + status });
        }
        const toUserExists = await User.findById(toUserId);

        if (!toUserExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({ message: "Connection request already exists" });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();
        await run("iamsupremetrader@gmail.com", "itsvinayadav@gmail.com", "AWS SES Testing!", 'Hello Its a test mail from AWS');
        res.status(200).json({ message: "Connection request sent successfully", data });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const { status, requestId } = req.params;

        const allowedStatus = ['accepted', 'rejected'];

        if (!allowedStatus.includes(req.params.status)) {
            return res.status(400).json({ message: "Invalid status" + status });
        }

        const request = await ConnectionRequest.findOne({ _id: requestId, status: 'interested', toUserId: loggedInUserId });

        if (!request) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        request.status = status;

        const data = await request.save();

        res.status(200).json({ message: "Connection request updated successfully", data });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = requestRouter;