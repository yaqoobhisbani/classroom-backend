const { addUser, getUser, getRoomUsers, removeUser } = require("./user");
const { saveMessage, getHistory } = require("./message");

module.exports = function(io) {
  // Initial Socket IO Connection
  io.on("connection", socket => {
    // On Joining Room
    socket.on("join", async ({ room, user }) => {
      // Adding User To Track
      const newUser = addUser(room.code, user.name, user.id, socket.id);

      // User Joins Socket IO Room
      socket.join(newUser.room);

      // Get Room History
      const history = await getHistory(room.roomid);

      // Get Online Users In Room
      const onlineUsers = getRoomUsers(newUser.room);

      // Sending History & Online Users
      io.to(socket.id).emit("history", { history });
      io.to(newUser.room).emit("onlineusers", { onlineUsers });

      console.log(`${newUser.name} has joined ${newUser.room}!`);
    });

    // On Sending Message
    socket.on("sendMessage", async message => {
      // Get User
      const user = getUser(socket.id);

      // Save Message in Database
      const newMessage = await saveMessage(user, message);

      // Send Message To Everyone in Room
      io.to(user.room).emit("newMessage", newMessage);

      console.log(newMessage);
    });

    // On Disconnecting
    socket.on("disconnect", () => {
      // Removing User on Disconnect
      const user = removeUser(socket.id);

      // Get Online Users In Room & Send Them
      const onlineUsers = getRoomUsers(user.room);
      io.to(user.room).emit("onlineusers", { onlineUsers });

      console.log("Client Disconnected..");
    });
  });
};
