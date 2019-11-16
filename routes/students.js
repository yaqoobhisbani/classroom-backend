const express = require("express");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const { validateAddUser } = require("../validators/classrooms");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const router = express.Router();

// @route   POST api/room/:code/students
// @desc    Add User in Room by Email
// @access  PRIVATE / ROOM ADMIN
router.post(
  "/:code/students",
  auth,
  isAdmin,
  validateAddUser,
  async (req, res) => {
    // Get Errors & Send Them If Any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    }

    // Extract Data from The Request
    const newEmail = req.body.newemail;
    const code = req.params.code;

    try {
      // Check If User Exists
      const user = await User.findOne({ email: newEmail });

      // Send Response If User Doesn't Exist
      if (!user)
        return res
          .status(400)
          .json({ msg: "No Account Found with that Email!" });

      // Add New User in The Classroom
      const room = await Classroom.findOneAndUpdate(
        { code },
        { $addToSet: { students: { name: user.name, id: user._id } } },
        { new: true }
      );

      // Send Response If User Was Already Member
      if (req.room.students.length === room.students.length)
        return res.status(400).json({ msg: "The student is already member!" });

      // Sending Updated Room Back To User
      res.json(room);
    } catch (err) {
      // Log & Send Internal Server Error
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route   DELETE api/room/:code/student/:id
// @desc    Remove User from a Room
// @access  PRIVATE / ROOM ADMIN
router.delete("/:code/student/:id", auth, isAdmin, async (req, res) => {
  // Extracting Values From The Request
  const code = req.params.code;
  const id = req.params.id;

  try {
    // Check If User By That ID Exists
    const user = await User.findById(id);

    // Send Response If User Not Found By That ID
    if (!user)
      return res.status(400).json({ msg: "The given user doesn't exist!" });

    // Remove User From The Room
    const room = await Classroom.findOneAndUpdate(
      { code },
      { $pull: { students: { name: user.name, id: user._id } } },
      { new: true }
    );

    // Sending Updated Room Back To User
    res.json(room);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/room/:code/approve
// @desc    Approve Join Room Request
// @access  PRIVATE / ROOM ADMIN
router.post("/:code/approve", auth, isAdmin, async (req, res) => {
  // Extracting Values From The Request
  const code = req.params.code;
  const id = req.body.id;

  try {
    // Get User
    const user = await User.findById(id);

    // Send Response If User Doesn't Exist
    if (!user) return res.status(400).json({ msg: "The user doesn't exist!" });

    // Remove User From The Approval List
    const room = await Classroom.findOneAndUpdate(
      { code },
      { $pull: { approvals: { name: user.name, id: user._id } } },
      { new: true }
    );

    // Add User To The Students List
    const updatedRoom = await Classroom.findOneAndUpdate(
      { code },
      { $addToSet: { students: { name: user.name, id: user._id } } },
      { new: true }
    );

    // Send Updated Room Back
    res.json(updatedRoom);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   DELETE api/room/:code/deny
// @desc    Deny Join Room Request
// @access  PRIVATE / ROOM ADMIN
router.delete("/:code/deny/:id", auth, isAdmin, async (req, res) => {
  // Extracting Values From The Request
  const code = req.params.code;
  const id = req.params.id;

  try {
    // Get User
    const user = await User.findById(id);

    // Send Response If User Doesn't Exist
    if (!user) return res.status(400).json({ msg: "The user doesn't exist!" });

    // Remove User From The Approval List
    const room = await Classroom.findOneAndUpdate(
      { code },
      { $pull: { approvals: { name: user.name, id: user._id } } },
      { new: true }
    );

    // Send Updated Room Back
    res.json(room);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
