const User = require("../models/User");
const Classroom = require("../models/Classroom");

module.exports = async (req, res, next) => {
  try {
    // Get User
    const user = await User.findById(req.user.id).select("-password -avatar");

    // Get Classroom
    const room = await Classroom.findOne({
      code: req.params.code,
      createdBy: req.user.id
    });

    // Sending Response If User is Not Admin
    if (!room)
      return res
        .status(403)
        .json({ msg: "Forbidden! You're not allowed to do that!" });

    // Continue Execution If User is Admin
    req.student = user;
    req.room = room;
    next();
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};
