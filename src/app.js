const dotenv = require('dotenv');

const express = require('express');
const connectDB = require('./config/database');

const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation');

const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

dotenv.config({ path: './.env' })

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());


//signup
app.post("/signup", async (req, res) => {
    const { firstName, lastName, emailId, password } = req.body;

    try {
        //validating user data
        validateSignUpData(req);

        //checking if user already exists
        const userExists = await User.findOne({ emailId: emailId });
        if (userExists) {
            return res.status(400).send({ error: "User already exists" });
        }

        //Encrypting password
        const passwordHash = await bcrypt.hash(password, 10);

        //creating new instance of user
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });

        await user.save();
        res.status(201).send({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).send({ error: "Error registering user", details: error.message });
    }
});

//login
app.post("/login", async (req, res) => {
    const { emailId, password } = req.body;

    if (!emailId && !password) {
        return res.status(400).send({ error: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ emailId: emailId });
        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

                res.cookie('token', token, { httpOnly: true });

                res.status(200).send({ message: "User logged in successfully!" });
            } else {
                res.status(401).send({ error: "Invalid credentials" });
            }
        } else {
            res.status(404).send({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ error: "Error logging in user", details: error.message });
    }
})

//profile
app.get("/profile", async (req, res) => {
    try {
        const cookies = req.cookies;

        const { token } = cookies;

        if (!token) {
            throw new Error("Invalid token");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { _id } = decoded;

        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        } else {
            return res.status(200).send(user);
        }
    } catch (error) {
        res.status(500).send({ error: "Error fetching profile", details: error.message });
    }
})


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