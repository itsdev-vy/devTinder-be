const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
dotenv.config({ path: './.env' })

// Middleware to parse JSON
app.use(express.json());


//signup
app.post("/signup", async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).send({ error: "Error registering user", details: error.message });
    }
});


//get user by email
app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;

    try {
        const user = await User.findOne({ emailId: userEmail });
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ error: "Error fetching user", details: error.message });
    }
})


//get all users
app.get("/feed", async (req, res) => {
    try {
        const user = await User.find({});
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send({ error: "No user found" });
        }
    } catch (error) {
        res.status(500).send({ error: "Error fetching users", details: error.message });
    }
})

//delete user

app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete({ _id: userId });
        if (user) {
            res.status(200).send({ message: "User deleted successfully!" });
        } else {
            res.status(404).send({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ error: "Error deleting user", details: error.message });
    }
})

//update user

app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;

    try {
        const ALLOWED_UPDATES = ['age', 'gender', 'photoUrl', 'about', 'skills'];

        const isUpdateAllowed = Object.keys(data).every((update) => {
            return ALLOWED_UPDATES.includes(update);
        });

        if (!isUpdateAllowed) {
            throw new Error("Update not allowed!");
        }

        if (data?.skills.length > 10) {
            throw new Error("You can have a maximum of 10 skills.");
        }

        const user = await User.findByIdAndUpdate({ _id: userId }, data, { returnDocument: "after", runValidators: true });
        if (user) {
            res.status(200).send({ message: "User updated successfully!" });
        } else {
            res.status(404).send({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ error: "Error updating user", details: error.message });
    }
})


connectDB().then(() => {
    console.log('Database connected');
    app.listen(process.env.PORT, () => {
        console.log('Server started on port 8000');
    });
}).catch((err) => {
    console.log(err);
});