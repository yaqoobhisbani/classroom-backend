const express = require("express");
const auth = require("../middlewares/auth");
const {
  validateCreateRoom,
  validateRoomCode
} = require("../validators/classrooms");
const { validationResult } = require("express-validator");
const shortid = require("short-id");

const User = require("../models/User");
const Classroom = require("../models/Classroom");

const router = express.Router();

// @route   POST api/classrooms
// @desc    Create The Classroom
// @access  PRIVATE
router.post("/", auth, validateCreateRoom, async (req, res) => {
  // Get Errors & Send Them If Any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  // Extract Values From The Request
  const { classname, subject, description } = req.body;

  // Generating Unique Class Code
  const code = shortid.generate();

  try {
    // Getting User
    const user = await User.getUser(req.user.id);

    // Create New Classroom Instance
    const newClassroom = new Classroom({
      classname,
      subject,
      description,
      code,
      students: { name: user.name, id: user._id },
      createdBy: user._id
    });

    // Save To Database
    await newClassroom.save();

    res.status(201).json(newClassroom);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/classrooms
// @desc    Get The Joined Classrooms
// @access  PRIVATE
router.get("/", auth, async (req, res) => {
  try {
    // Getting User
    const user = await User.getUser(req.user.id);

    // Search For Rooms in Database
    const rooms = await Classroom.find({
      students: { name: user.name, id: user._id }
    }).sort({
      _id: -1
    });

    // Send Error If Nothing Found
    if (!rooms)
      return res.status(404).json({ msg: "No Classrooms Available!" });

    // Sending Rooms
    res.json(rooms);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PUT api/classrooms/:code
// @desc    Join The Classroom By Giving Code
// @access  PRIVATE
router.put("/:code", auth, validateRoomCode, async (req, res) => {
  // Get Errors & Send Them If Any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  // Extract Classroom Code From The Request
  const code = req.params.code;

  try {
    // Getting User
    const user = await User.getUser(req.user.id);

    // Getting Classroom
    const room = await Classroom.findOne({ code });

    // Send Error If Room Was Not Found
    if (!room) return res.status(404).json({ msg: "Classroom was not found!" });

    // Add User in Approval List
    const updatedRoom = await Classroom.findOneAndUpdate(
      { code },
      { $addToSet: { approvals: { name: user.name, id: user._id } } },
      { new: true }
    );

    // Check If Request was Already Sent
    if (room.approvals.length === updatedRoom.approvals.length)
      return res.status(400).json({ msg: "Your request is already received!" });

    // Send The Updated Room Back To User
    res.json({ msg: "Your request has been sent!" });
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
