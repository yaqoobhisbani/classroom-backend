const express = require("express");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const isMember = require("../middlewares/isMember");
const { validateCreateTask } = require("../validators/tasks");
const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const router = express.Router();

// @route   POST api/room/:code/tasks
// @desc    Assign Tasks To Students in a Room
// @access  PRIVATE / ROOM ADMIN
router.post(
  "/:code/tasks",
  auth,
  isAdmin,
  validateCreateTask,
  async (req, res) => {
    console.log("INside ROUTE");
    // Get Errors & Send Them If Any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    }

    // Extract Data From The Request
    const { title, description, taskType, dueDate } = req.body;

    try {
      // Create New Task Instance
      const task = new Task({
        title,
        description,
        taskType,
        dueDate,
        classroom: req.room._id,
        createdBy: req.student._id
      });

      // Save To Database
      await task.save();

      // Send Response Back
      if (task) return res.status(201).json(task);
    } catch (err) {
      // Log & Send Internal Server Error
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route   GET api/room/:code/tasks
// @desc    Get All Tasks of a User
// @access  PRIVATE / MEMBER
router.get("/:code/tasks", auth, isMember, (req, res) => {});

module.exports = router;
