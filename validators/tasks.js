const { check } = require("express-validator");

exports.validateCreateTask = [
  check("title", "Please enter title of task")
    .not()
    .isEmpty(),
  check("description", "Please enter description of task")
    .not()
    .isEmpty(),
  check("taskType", "Please select a task type")
    .not()
    .isEmpty(),
  check("dueDate", "Please enter due date of task")
    .not()
    .isEmpty()
];
