const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// register
router.post("/register", async (req, res) => {
  try {
    const { name, studentID, email, password } = req.body;

    // 1. check if user already exists via student id
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // 2. hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. save the user
    const newUser = new User({ name, studentID, email, password: hashedPassword, role: "member"});
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// login
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    // 1. find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // 2. compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // 3. generate token  ("wristband")
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name

      },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1h" },
    );

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
