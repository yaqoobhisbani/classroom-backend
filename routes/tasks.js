const express = require("express");
const router = express.Router();

// @route   POST api/room/:code/tasks
// @desc    Assign Tasks To Students in a Room
// @access  PRIVATE / ROOM ADMIN
router.post("/:code/tasks", auth, isAdmin, (req, res) => {});

// @route   GET api/room/:code/tasks
// @desc    Get All Tasks of a User
// @access  PRIVATE / MEMBER
router.get("/:code/tasks", auth, isMember, (req, res) => {});

module.exports = router;
