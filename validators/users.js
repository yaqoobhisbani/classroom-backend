const { check, body } = require("express-validator");

exports.validateRegister = [
  check("name", "The name must be between 4 to 50 characters")
    .not()
    .isEmpty()
    .isLength({ min: 4, max: 50 }),
  check("email", "Please enter a valid email address")
    .isEmail()
    .normalizeEmail(),
  check("password", "Password must be at least 6 characters")
    .not()
    .isEmpty()
    .isLength({ min: 6, max: 512 }),
  body("password2").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The password does not match");
    }
    // Success: Confirm Password Matches
    return true;
  })
];

exports.validateLogin = [
  check("email", "Please enter a valid email address")
    .isEmail()
    .normalizeEmail(),
  check("password", "Password must be at least 6 characters")
    .not()
    .isEmpty()
    .isLength({ min: 6, max: 512 })
];

exports.validateName = [
  check("name", "The name must be between 4 to 50 characters")
    .not()
    .isEmpty()
    .isLength({ min: 4, max: 50 })
];

exports.validateEmail = [
  check("email", "Please enter a valid email address")
    .isEmail()
    .normalizeEmail()
];

exports.validateChangePass = [
  check("oldpass", "Password must be at least 6 characters")
    .not()
    .isEmpty()
    .isLength({ min: 6, max: 512 }),
  check("newpass", "Password must be at least 6 characters")
    .not()
    .isEmpty()
    .isLength({ min: 6, max: 512 }),
  body("confirmpass").custom((value, { req }) => {
    if (value !== req.body.newpass) {
      throw new Error("The password does not match");
    }
    // Success: Confirm Password Matches
    return true;
  })
];
