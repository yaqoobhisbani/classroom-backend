const User = require("../models/User");
const Classroom = require("../models/Classroom");

module.exports = async (req, res, next) => {
  try {
    // Get User
    const user = await User.findById(req.user.id).select("-password -avatar");

    // Check If User is Member of Class
    const room = await Classroom.findOne(
      { code: req.params.code },
      { students: { $elemMatch: { name: user.name, id: user._id } } }
    );

    // Send Error If No Room is Found
    if (!room) return res.status(400).json({ msg: "Invalid Room Code!" });

    // Send Error If Student is Not Member of Room
    if (room.students.length === 0)
      return res.status(403).json({ msg: "Forbidden!" });

    req.roomId = room._id;
    req.studentId = user._id;
    next();
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};
