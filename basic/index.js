var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});


//#region socket.io stuff
/** don't listen for events or emit anything 
until we have a connection */
io.on("connection", function(socket) {

  /** sends to all other connected sockets in 
   this namespace(go over that later) except self*/
  socket.broadcast.emit("hi");


  /** any time a user connects, we should see a log */
  console.log("a user connected");

  /** any time a user _disconnects_, we should see a log */
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
  
  
  /** any time a user sends a "chat message", we should see a log */
  socket.on("chat message", function(msg) {
    console.log("message: " + msg);
    // let's emit that message back to ALL connected clients
    io.emit("chat message", msg);
  });
});
//#endregion socket.io stuff


// start the server
http.listen(3030, function() {
  console.log("listening on *:3030");
});
