const Message = require("../models/Message");

// Get Room Chat History
const getHistory = async roomid => {
  try {
    // Get Room History from Database
    const history = await Message.find({ classroom: roomid });

    return history;
  } catch (error) {
    console.log(error);
  }
};

// Saving New Message in Database
const saveMessage = async (user, message) => {
  try {
    // Create Message Instance
    const newMessage = new Message({
      text: message.text,
      user: {
        name: user.name,
        id: user.dbid
      },
      classroom: message.classroom
    });

    // Save in Database
    await newMessage.save();

    return newMessage;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  saveMessage,
  getHistory
};
