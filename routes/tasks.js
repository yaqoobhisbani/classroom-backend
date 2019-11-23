const express = require("express");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const isMember = require("../middlewares/isMember");
const { validateCreateTask } = require("../validators/tasks");
const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const router = express.Router();

// @route   POST api/room/:code/tasks
// @desc    Create Task in A Room
// @access  PRIVATE / ROOM ADMIN
router.post(
  "/:code/tasks",
  auth,
  isAdmin,
  validateCreateTask,
  async (req, res) => {
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
// @desc    Get All Tasks of A Room
// @access  PRIVATE / MEMBER
router.get("/:code/tasks", auth, isMember, async (req, res) => {
  try {
    // Get Tasks of Room
    const tasks = await Task.find({ classroom: req.roomId }).sort({
      _id: -1
    });

    // Send Reponse If There are No Tasks
    if (!tasks) return res.json({ msg: "No Tasks Available!" });

    // Send Tasks
    res.json(tasks);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   DELETE api/room/:code/task/:id
// @desc    Delete a Task From Room
// @access  PRIVATE / ADMIN
router.put(
  "/:code/task/:id",
  auth,
  isAdmin,
  validateCreateTask,
  async (req, res) => {
    // Get Errors & Send Them If Any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    }

    // Extract Data From The Request
    const { title, description, taskType, dueDate } = req.body;
    const id = req.params.id;
    try {
      // Find Task & Update It
      const task = await Task.findByIdAndUpdate(
        id,
        {
          title,
          description,
          taskType,
          dueDate
        },
        { new: true }
      );

      // Send Response If Task is Not Found
      if (!task)
        return res.status(401).json({ msg: "The task was not found!" });

      // Send Task Back
      res.json(task);
    } catch (err) {
      // Log & Send Internal Server Error
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route   DELETE api/room/:code/task/:id
// @desc    Delete a Task From Room
// @access  PRIVATE / ADMIN
router.delete("/:code/task/:id", auth, isAdmin, async (req, res) => {
  try {
    // Extract Data
    const id = req.params.id;

    // Find Task & Delete it in Database
    await Task.findByIdAndDelete(id);

    res.json();
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
