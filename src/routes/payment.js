const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { razorpay } = require('../utils/razorpay');
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/memberShipAmount");
const { validateWebhookSignature, } = require("razorpay/dist/utils/razorpay-utils");
const User = require('../models/user');

const paymentRouter = express.Router();

paymentRouter.post('/payment/create', userAuth, async (req, res) => {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    try {
        const order = await razorpay.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName,
                lastName,
                emailId,
                membershipType: membershipType,
            }
        })

        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
        });

        const savedPayment = await payment.save();
        res.status(200).send({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID, message: "Payment created successfully" });
    } catch (error) {
        res.status(500).send({ error: "Error processing payment", details: error.message });
    }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
    try {
        const webhookSignature = req.get("X-Razorpay-Signature");

        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if (!isWebhookValid) {
            return res.status(400).json({ msg: "Webhook signature is invalid" });
        }

        const paymentDetails = req.body.payload.payment.entity;

        const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
        payment.status = paymentDetails.status;
        await payment.save();

        const user = await User.findOne({ _id: payment.userId });
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;

        await user.save();

        return res.status(200).json({ msg: "Webhook received successfully" });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
    const user = req.user.toJSON();
    if (user.isPremium) {
        return res.json({ ...user });
    }
    return res.json({ ...user });
});

module.exports = paymentRouter;