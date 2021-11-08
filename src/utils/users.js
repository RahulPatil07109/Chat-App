const users = [];

// addUser, removeUser , getUsers , getUsersInRoom

// Add users

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: " Username and room are required !",
    };
  }

  // Existing users
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  if (existingUser) {
    return {
      error: "Username is already in use !",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

// Remove

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Get user

const getUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  return users[index];
};

// Get users in room

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
