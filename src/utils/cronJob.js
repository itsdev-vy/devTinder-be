const cron = require('node-cron');
const ConnectionRequestModel = require('../models/connectionRequest');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const { run } = require('./sendEmail');

cron.schedule('0 08 * * *', async () => {
    try {
        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        const pendingRequests = await ConnectionRequestModel.find({
            status: 'interested',
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd
            }
        }).populate('fromUserId toUserId');

        const listOfEmails = [...new Set(pendingRequests.map((req) => req.toUserId.emailId))];

        for (const email of listOfEmails) {
            try {
                await run('New Friend Requests Pending' + email, 'You have a new friend request pending.');
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error)
    }
});