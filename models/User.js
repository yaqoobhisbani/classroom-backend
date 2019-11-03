const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024
  },
  avatar: {
    type: Buffer,
    default: undefined
  },
  hasAvatar: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.statics.getUser = async id => {
  const user = await User.findById(id);
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
