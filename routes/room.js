const express = require("express");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const {
  validateClassName,
  validateSubject,
  validateDescription
} = require("../validators/classrooms");
const { validationResult } = require("express-validator");
const Classroom = require("../models/Classroom");
const router = express.Router();

// @route   PUT api/room/:code/classname
// @desc    Change The Class Name
// @access  PRIVATE / ROOM ADMIN
router.put(
  "/:code/classname",
  auth,
  isAdmin,
  validateClassName,
  async (req, res) => {
    // Get Errors & Send Them If Any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    }

    // Extract Values From The Request
    const code = req.params.code;
    const newClassName = req.body.classname;

    try {
      // Search Room in Database & Update It
      const room = await Classroom.findOneAndUpdate(
        { code },
        { classname: newClassName },
        { new: true }
      );

      // Send Updated Room Back
      res.json(room);
    } catch (err) {
      // Log & Send Internal Server Error
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route   PUT api/room/:code/subject
// @desc    Change The Subject of Class
// @access  PRIVATE / ROOM ADMIN
router.put(
  "/:code/subject",
  auth,
  isAdmin,
  validateSubject,
  async (req, res) => {
    // Get Errors & Send Them If Any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    }

    // Extract Values From The Request
    const code = req.params.code;
    const newSubject = req.body.subject;

    try {
      // Search Room in Database & Update It
      const room = await Classroom.findOneAndUpdate(
        { code },
        { subject: newSubject },
        { new: true }
      );

      // Send Updated Room Back
      res.json(room);
    } catch (err) {
      // Log & Send Internal Server Error
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route   PUT api/room/:code/description
// @desc    Change The Description of The Room
// @access  PRIVATE / ROOM ADMIN
router.put(
  "/:code/description",
  auth,
  isAdmin,
  validateDescription,
  async (req, res) => {
    // Get Errors & Send Them If Any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    }

    // Extract Values From The Request
    const code = req.params.code;
    const newDescription = req.body.description;

    try {
      // Search Room in Database & Update It
      const room = await Classroom.findOneAndUpdate(
        { code },
        { description: newDescription },
        { new: true }
      );

      // Send Updated Room Back
      res.json(room);
    } catch (err) {
      // Log & Send Internal Server Error
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

module.exports = router;
