const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

//#region express stuff
// our localhost port
const port = process.env.PORT || 4001;

const app = express();
app.use(express.static(path.resolve(__dirname, "client/build")));
app.get("/", function(req, res) {
  res.sendFile(path.resolve(__dirname, "client/build", "index.html"));
});

// our server instance
const server = http.createServer(app);
//#endregion


//#region socket.io stuff

// Hard code some events/'channels' that we'll communicate on in our app
const channels = {
  chat: "chat",
  userEntered: "userEntered",
  userLeft: "userLeft",
  userTyping: "userTypeing",
  img: "img",
  test: "test",
  unitTest: "unit-test",
  testFromServer: "test-from-server"
};

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

  socket.on(channels.test, msg => {
    console.log("unit unitTest msg:", msg)
    io.sockets.emit(channels.testFromServer, msg);
  })

  // disconnect is fired when a client leaves the server
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
//#endregion

server.listen(port, () => console.log(`Listening on port ${port}`));
