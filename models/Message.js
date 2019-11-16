const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  user: {
    name: {
      type: String
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: Object,
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);
