const http = require("http");
const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const { generateMessage, generateLocation } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
// we create our own server
const server = http.createServer(app);
// we create new instance of socket.io to configure websocket to work with our server
const io = socketio(server); // Now our server supports websockets

// Define paths for Express config
// Public dir contains all the static file (js | css | html)
const publicDirPath = path.join(__dirname, "../public");
app.use(express.static(publicDirPath));

const port = process.env.PORT || 3000;

// test our websocket
io.on("connection", (socket) => {
  console.log("New websocket connection ");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room); // this let's us join the given room

    socket.emit("message", generateMessage("Admin", "Welcome !"));
    // broadcast this message to all the clients but the new client
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined !`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  // recieves an event "sendMessage" from the client
  socket.on("sendMessage", (message) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(user.username, message));
  });

  // sendLocation
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocation(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  // message when disconnected
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left !`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// make our server to listen
server.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});
