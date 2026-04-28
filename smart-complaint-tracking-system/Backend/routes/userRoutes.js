const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const path = require("path");
const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  const { name, email, password, role, district } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role, district });
  await user.save();
  res.json({ message: 'User registered' });
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password ,role } = req.body;
    console.log("Login attempt for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", passwordMatch);
    if (!passwordMatch) {
      console.log("Password incorrect");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, district: user.district },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Optional: Add token expiration
    );

    console.log("Login successful!");
    res.json({ 
      token,
      user: { id: user._id, role: user.role, district: user.district , token: token } 
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
