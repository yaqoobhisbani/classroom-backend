const express = require("express");
const fs = require("fs");
const path = require("path");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const {
  validateClassName,
  validateSubject,
  validateDescription
} = require("../validators/classrooms");
const { validationResult } = require("express-validator");
const Classroom = require("../models/Classroom");
const Material = require("../models/Material");
const Task = require("../models/Task");
const Message = require("../models/Message");
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

// @route   DELETE api/room/:code
// @desc    Delete a Classroom
// @access  PRIVATE / ROOM ADMIN
router.delete("/:code", auth, isAdmin, async (req, res) => {
  // Extracting Data From Request
  const code = req.params.code;
  const roomID = req.room._id;

  try {
    // Delete All Material From Database
    await Material.deleteMany({ classroom: roomID }, err => {
      if (err) throw err;
    });

    // Delete Room Folder in Data
    const roomFolderPath = path.join(__dirname, "..", "/data/", `${code}`);
    fs.rmdir(roomFolderPath, { recursive: true }, err => {
      if (err) throw err;
    });

    // Delete All Tasks
    await Task.deleteMany({ classroom: roomID }, err => {
      if (err) throw err;
    });

    // Delete All Messages
    await Message.deleteMany({ classroom: roomID }, err => {
      if (err) throw err;
    });

    // Delete Room
    await Classroom.findOneAndRemove({ _id: roomID }, (err, res) => {
      if (err) throw err;
    });

    res.json({ msg: "The classroom has been deleted!" });
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
