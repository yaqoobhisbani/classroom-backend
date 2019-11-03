const { check } = require("express-validator");

exports.validateCreateRoom = [
  check("classname", "Please enter name of classroom")
    .not()
    .isEmpty()
    .isLength({ min: 3, max: 50 }),
  check("subject", "Please enter subject of classroom")
    .not()
    .isEmpty()
    .isLength({ min: 3, max: 50 }),
  check("description").optional()
];

exports.validateRoomCode = [
  check("code", "Invalid Classroom Code!")
    .not()
    .isEmpty()
    .isLength({ min: 6, max: 6 })
];

exports.validateAddUser = [
  check("newemail", "Please Enter Email Address of New Member")
    .isEmail()
    .normalizeEmail()
];

exports.validateClassName = [
  check("classname", "Please enter name of classroom")
    .not()
    .isEmpty()
    .isLength({ min: 3, max: 50 })
];

exports.validateSubject = [
  check("subject", "Please enter subject of classroom")
    .not()
    .isEmpty()
    .isLength({ min: 3, max: 50 })
];

exports.validateDescription = [
  check("description", "Please enter description of classroom")
    .not()
    .isEmpty()
    .isLength({ min: 5 })
];
