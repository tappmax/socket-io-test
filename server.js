const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const channels = {
  chat: "chat",
  userEntered: "userEntered",
  userLeft: "userLeft",
  userTyping: "userTypeing",
  img: "img"
};

// our localhost port
const port = process.env.PORT || 4001;

const app = express();

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server);

// This is how to listen for events in socket.io
io.on("connection", socket => { // must be connected first
  console.log("New client connected");

  // just like on the client side, we have a socket.on method that takes a callback function
  socket.on(channels.chat, msg => {
    console.log("new msg: ", msg);
    io.sockets.emit(channels.chat, msg);
  });

  // disconnect is fired when a client leaves the server
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
