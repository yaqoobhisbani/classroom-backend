const users = [];

// ADD USER
const addUser = (room, name, dbid, sid) => {
  // Check If User Exists
  const exists = users.find(user => {
    return user.room === room && user.dbid === dbid;
  });

  if (!exists) {
    // Add User To Array
    const user = { room, name, dbid, sid };
    users.push(user);
    return user;
  }
};

// GET USER
const getUser = sid => {
  return users.find(user => user.sid === sid);
};

// GET USERS IN ROOM
const getRoomUsers = room => {
  return users.filter(user => user.room === room);
};

// REMOVE USER
const removeUser = sid => {
  const index = users.findIndex(user => user.sid === sid);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

module.exports = {
  addUser,
  getUser,
  getRoomUsers,
  removeUser
};
