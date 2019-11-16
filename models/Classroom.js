const mongoose = require("mongoose");

const classroomSchema = mongoose.Schema({
  classname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  subject: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  approvals: [
    {
      name: {
        type: String
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      type: Object
    }
  ],
  students: [
    {
      name: {
        type: String
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      type: Object
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Classroom", classroomSchema);
