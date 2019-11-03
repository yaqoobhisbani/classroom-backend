const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const auth = require("../middlewares/auth");
const User = require("../models/User");
const {
  validateRegister,
  validateName,
  validateEmail,
  validateChangePass
} = require("../validators/users");
const { validationResult } = require("express-validator");

const router = express.Router();

// @route   POST api/users
// @desc    Register The User
// @access  PUBLIC
router.post("/", validateRegister, async (req, res) => {
  // Get Validation Errors From Express Validator
  const errors = validationResult(req);

  // Send Validation Errors If Any
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract Values From The Request
  const { name, email, password } = req.body;
  try {
    // Check if email is already registered
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ msg: "Email Address is already registered!" });

    // Create New User Instance
    user = new User({
      name,
      email,
      password
    });

    // Generate Salt & Hash Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save User To Database
    await user.save();

    // Prepare JWT Payload
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
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Multer Configuration
const upload = multer({
  limits: {
    fileSize: 10000000
  },
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(null, true);
    } else {
      return cb(new Error("Please upload an image!"));
    }
  }
});

// @route   POST api/users/me/avatar
// @desc    Upload The User Profile Picture
// @access  PRIVATE
router.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      // Search User in The Database
      const user = await User.getUser(req.user.id);

      // Converting & Resizing The Image
      const output = await sharp(req.file.buffer)
        .resize({
          width: 250,
          height: 250
        })
        .png()
        .toBuffer();

      // Saving The Image in Database
      user.avatar = output;
      user.hasAvatar = true;
      await user.save();

      res.send();
    } catch (err) {
      // Log & Send Internal Server Error
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  },
  (error, req, res, next) => {
    // Sending Errors From Multer
    res.status(400).json({ msg: error.message });
  }
);

// @route   GET api/users/:id/avatar
// @desc    Get The Profile Avatar
// @access  PUBLIC
router.get("/:id/avatar", async (req, res) => {
  try {
    // Search User in The Database
    const user = await User.getUser(req.params.id);

    // Default Avatar File Path
    const defaultAvatar = path.join(__dirname, "../assets/avatar.png");

    if (!user.avatar) {
      // Return Default Avatar if Avatar is Not Available
      res.type("png").sendFile(defaultAvatar);
    } else {
      // Send Avatar
      res.type("png").send(user.avatar);
    }
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   DELETE api/users/me/avatar
// @desc    Remove The Profile Avatar
// @access  PRIVATE
router.delete("/me/avatar", auth, async (req, res) => {
  try {
    // Search User in The Database
    const user = await User.getUser(req.user.id);

    // Removing Avatar
    user.avatar = undefined;
    user.hasAvatar = false;
    await user.save();

    res.send();
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PUT api/users/me/name
// @desc    Change The Profile Name
// @access  PRIVATE
router.put("/me/name", auth, validateName, async (req, res) => {
  // Get & Send Validation Errors If Any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract Data From The Request
  const newName = req.body.name;

  try {
    // Search User in The Database & Update It
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: newName },
      { new: true }
    ).select("-password -avatar");

    // Send New User Back
    res.json(user);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PUT api/users/me/email
// @desc    Change The Email Address
// @access  PRIVATE
router.put("/me/email", auth, validateEmail, async (req, res) => {
  // Get & Send Validation Errors If Any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract Data From The Request
  const newEmail = req.body.email;

  try {
    // Search User in The Database & Update It
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email: newEmail },
      { new: true }
    ).select("-password -avatar");

    // Send The New User Back
    res.json(user);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PUT api/users/me/password
// @desc    Change The Password
// @access  PRIVATE
router.put("/me/password", auth, validateChangePass, async (req, res) => {
  // Get & Send Validation Errors If Any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract Data From The Request
  const { oldpass, newpass } = req.body;
  try {
    // Search User in The Database
    const user = await User.findById(req.user.id);

    // Match If Old Password is Correct & Send Response
    const isMatch = await bcrypt.compare(oldpass, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Old Password Does Not Match!" });

    if (isMatch) {
      // Generate Salt & Hash New Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newpass, salt);

      // Save New Password In Database
      await user.save();

      // Send Response
      res.json({ msg: "The Password Has Been Changed!" });
    }
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
