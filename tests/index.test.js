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
  testMsg = "HelloWorld",
  client,
  client2;

const apiUrl = 'http://localhost:4001';

var chai = require("chai");
var request = require("request");
var { expect, assert } = chai;

describe("SocketIO Client", function() {
  beforeEach(function(done) {
    // don't mutate ioOptions
    let options = JSON.parse(JSON.stringify(ioOptions));
    options.transportOptions.polling.extraHeaders.Authorization = `Bearer ${
      testData.user.token
    }`;

    // connect two io clients
    client = io.connect(
      `${apiUrl}`,
      options
    );
    client2 = io.connect(
      `${apiUrl}`,
      options
    );

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

  describe("Client/Server simple test", function() {
    it("Clients should receive a message from server when the `message` event is emitted.", function(done) {
      client.emit("test", testMsg);
      client2.emit("test", testMsg);
      setTimeout(function() {
        client.emit("test", testMsg);
        client2.emit("test", testMsg);
      }, 5000);

      let counter = 0;
      client2.on("test-from-server", function(msg) {
        expect(msg).to.equal(testMsg);
        counter++;
        console.log("client2", counter);
        //if (counter === 4) done();
      });

      client.on("test-from-server", function(msg) {
        assert.isTrue(
          client.io.engine.transport.name === "websocket" ||
            client.io.engine.transport.name === "polling"
        );
        expect(msg).to.equal(testMsg);
        counter++;
        console.log("client", counter);
      });
      setTimeout(function() {
        if (counter === 8) done();
      }, 5200);
    });
  });
});

describe("SocketIO Client", function() {
  beforeEach(function(done) {
    let brokenOptions = JSON.parse(JSON.stringify(ioOptions));
    brokenOptions.transportOptions.polling.extraHeaders[
      "Authorization"
    ] = `Bearer ${testData.user.token}broken token`;

    // connect two io clients
    client = io.connect(
      `${apiUrl}`,
      brokenOptions
    );
    client2 = io.connect(
      `${apiUrl}`,
      brokenOptions
    );

    // finish beforeEach setup
    client.on("connect", function() {
      console.log("client attempted to connect");
    });
    client.on("disconnect", function() {
      console.log("client disconnected");
    });
    done();
  });
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

  describe("Client/Server simple test", function() {
    it("Clients should NOT receive a message from server when the `message` event is emitted.", function(done) {
      assert.isFalse(client.connected);
      assert.isFalse(client2.connected);
      done();
    });
  });
});

describe("SocketIO Client", function() {
  let message = null;
  let message2 = null;
  const bearer2 = "1c61d3c3aac3a1bbf55caf5fac12dae3614c06ab";
  let options = JSON.parse(JSON.stringify(ioOptions));
  options.transportOptions.polling.extraHeaders.Authorization = `Bearer ${
    testData.user.token
  }`;
  let options2 = JSON.parse(JSON.stringify(ioOptions));
  options2.transportOptions.polling.extraHeaders.Authorization = `Bearer ${bearer2}`;

  // Set up listeners in the testing `it` method as well as the `beforeEach`
  // in case the server can send the socket.io message before the http response
  beforeEach(function(done) {
    // connect two io clients
    client = io.connect(
      `${apiUrl}`,
      options
    );
    client2 = io.connect(
      `${apiUrl}`,
      options2
    );

    // finish beforeEach setup
    client.on("connect", function() {
      console.log("client connected");
    });
    // finish beforeEach setup
    client2.on("connect", function() {
      console.log("client2 connected");
    });

    // listen for all test events and assign to elevated variable for tests to test.
    client.on("messages", function(msg) {
      message = msg;
      console.log("client", msg);
    });

    client2.on("messages", function(msg) {
      message2 = msg;
      console.log("client2", msg);
    });

    client.on("disconnect", function() {
      console.log("client disconnected");
    });
    client2.on("disconnect2", function() {
      console.log("client2 disconnected");
    });

    done();
  });
  afterEach(function(done) {
    // disconnect io clients after each test
    message = null;
    message2 = null;
    if (client.connected) {
      console.log("disconnecting...");
      client.disconnect();
    } else {
      console.log("no connection to break...");
    }
    if (client2.connected) {
      console.log("disconnecting2...");
      client2.disconnect();
    } else {
      console.log("no connection to break2...");
    }

    done();
  });

  describe("POST /threads/{threadId}/message", function() {
    it("should receive payload from server", function(done) {
      request(
        {
          url: `${apiUrl}/threads/${threadId}/messages`,
          json: true,
          method: "POST",
          headers: config.headers.authDeviceHeader,
          body: {
            format: "text",
            message: `api unit test ${parseInt(Math.random() * 100000)}`
          }
        },
        function(error, res, body) {
          if (error) return done(error);
          assert.equal(res.statusCode, 200);

          // redundant listener in case http response is faster than websocket||poll
          client.on("messages", function(msg) {
            message = msg;
            console.log("client", msg);
          });
          client2.on("messages", function(msg) {
            message2 = msg;
            console.log("client2", msg);
          });
          setTimeout(function() {
            assert.equal(message.format, "text");
            assert.equal(message.threadId, threadId);
            assert.equal(message2.format, "text");
            assert.equal(message2.threadId, threadId);
            done();
          }, 500);
        }
      );
    });
  });
  describe("get", function() {
    it("should respond with 200 successful operation", function(done) {
      request(
        {
          url: `${apiUrl}/socketIOInfo`,
          json: true,
          method: "GET",
          headers: config.headers.authDeviceHeader
        },
        function(error, res, body) {
          if (error) return done(error);
          console.log(body);
          expect(res.statusCode).to.equal(200);
          done();
        }
      );
    });
    it("should respond with 401 unauthorized operation", function(done) {
      request(
        {
          url: `${apiUrl}/socketIOInfo`,
          json: true,
          method: "GET",
          headers: config.headers.brokenAuthDeviceHeader
        },
        function(error, res, body) {
          if (error) return done(error);
          expect(res.statusCode).to.equal(401);
          done();
        }
      );
    });
  });
});
