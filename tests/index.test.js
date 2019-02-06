"use strict";

var io = require("socket.io-client");
var ioOptions = {
    forceNew: true,
    reconnection: false,
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: ""
        }
      }
    }
  },
  testMsg = {
    name: "test",
    message: "Hello World",
    timestamp: new Date().toDateString()
  },
  client,
  client2;

const apiUrl = "http://localhost:4001";

var chai = require("chai");
var { expect, assert } = chai;

describe("SocketIO Client", function() {

  // Before each test hook
  beforeEach(function(done) {
    // don't mutate ioOptions
    let options = JSON.parse(JSON.stringify(ioOptions));
    
    // options.transportOptions.polling.extraHeaders.Authorization = `Bearer ${
    //   testData.user.token
    // }`;

    // connect two io clients
    client = io.connect(`${apiUrl}`, options);
    client2 = io.connect(`${apiUrl}`, options);

    // finish beforeEach setup
    client.on("connect", function() {
      console.log("authenticated client connected");
      client.io.opts.transports = ["polling", "websocket"];
      done();
    });
    client.on("disconnect", function() {
      console.log("client disconnected");
    });
  });



  // after each test hook
  afterEach(function(done) {
    // disconnect io clients after each test
    if (client.connected) {
      console.log("disconnecting...");
      client.disconnect();
    } else {
      // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
      console.log("no connection to break...");
    }
    client2.close();

    done();
  });


  // actual tests
  describe("Client/Server simple test", function() {

    it("Clients should receive a message from server when the `test` event is emitted.", function(done) {
      // lets have a variable to hold the count of events being received
      let counter = 0;
      
      // emit from both clients: 1,..2,..
      client.emit("test", {...testMsg, name: 'client1'});
      client2.emit("test", {...testMsg, name: 'client2'});
      
      setTimeout(function() {
        // wait, and emit again! 3,..4,..
        client.emit("test", {...testMsg, name: 'client1'});
        client2.emit("test", {...testMsg, name: 'client2'});
      }, 500);

      // expect server sending back a test on EACH `test` it receives.
      client2.on("test-from-server", function(msg) {
        expect(msg.message).to.equal(testMsg.message);
        counter++;
        console.log("client2", counter);
      });

      // let's check our transports we set up at connection
      assert.isTrue(
        client.io.engine.transport.name === "websocket" ||
          client.io.engine.transport.name === "polling"
      );

      // that means from the 4 events, 1 counter, we should expect the counter to be 8 at the end
      client.on("test-from-server", function(msg) {
        // We expect the server to not mutate the message sent in any way
        expect(msg.message).to.equal(testMsg.message);
        counter++;
        console.log("client", counter);
      });
      setTimeout(function() {
        if (counter === 8) done(); // if it's 8, the test should time out (it needs done() invoked to finish)
      }, 520);
    });
  });
});
