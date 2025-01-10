const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/User');

// Middleware to parse JSON
app.use(express.json());


//signup
app.post("/signup", async (req, res) => {
    try {
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailId: req.body.emailId,
            password: req.body.password,
            age: req.body.age,
            gender: req.body.gender,
        });

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

connectDB().then(() => {
    console.log('Database connected');
    app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
}).catch((err) => {
    console.log(err);
});