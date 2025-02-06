const { mongoose, Schema } = require('mongoose');

const connectionRequestSchema = new Schema({
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['ignored', 'interested', 'accepted', 'rejected'],
            message: '{VALUE} is not supported'
        },
    }
}, { timestamps: true });

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;

    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("You cannot send connection request to yourself");
    }
    next();
})

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);