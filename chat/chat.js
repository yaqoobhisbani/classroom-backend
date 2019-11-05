const Message = require("../models/Message");
const { addUser, getUser, getRoomUsers, removeUser } = require("./user");

module.exports = function(io) {
  // Initial Socket IO Connection
  io.on("connection", socket => {
    console.log("Client Connected..");

    socket.on("join", (room, user) => {
      // Adding User To Track
      const newUser = addUser(room, user.name, user.id, socket.id);

      // User Joins Socket IO Room
      socket.join(newUser.room);
    });

    // Disconnection
    socket.on("disconnect", () => {
      // Removing User on Disconnect
      const user = removeUser(socket.id);
      console.log(`${user.name} has left!`);
      console.log("Client Disconnected..");
    });
  });
};
