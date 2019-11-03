const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const { validateLogin } = require("../validators/users");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const config = require("config");
const router = express.Router();

// @route   GET api/auth
// @desc    Get Logged in User
// @access  PRIVATE
router.get("/", auth, async (req, res) => {
  try {
    // Find User By ID & Send It
    const user = await User.findById(req.user.id).select("-password -avatar");
    res.json(user);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/auth
// @desc    Login The User
// @access  PUBLIC
router.post("/", validateLogin, async (req, res) => {
  // Get Errors & Send Them If Any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract Values From The Request
  const { email, password } = req.body;
  try {
    // Find User & Send Response If Doesn't Exist
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credientials!" });

    // Compare Password & Send Response If Doesn't Match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credientials!" });

    // Prepare JWT Token
    const payload = { user: { id: user.id } };

    // Generate & Send JWT Token
    jwt.sign(
      payload,
      config.get("jwtSecret"),
      {
        expiresIn: 360000
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
