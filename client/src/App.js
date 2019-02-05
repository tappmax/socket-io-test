// import packages
import React, { Component } from "react";
import socketIOClient from "socket.io-client";

const channels = {
  connect: "connect",
  disconnect: "disconnect",
  chat: "chat",
  userEntered: "userEntered",
  userLeft: "userLeft",
  userTyping: "userTypeing",
  img: "img"
};

const socket = socketIOClient("http://localhost:4001");

// Making the App component
class App extends Component {
  constructor() {
    super();
    this.state = {
      namespace: "/",
      room: null,
      message: "",
      username: "",
      messages: [],
      usernameEntered: false
    };
  }

  componentDidMount() {
    socket.on(channels.chat, msg => {
      console.log("new msg client");
      this.setState({
        messages: [msg, ...this.state.messages]
      });
    });
  }

  sendMessage = channel => {
    console.log("send msg", channel);
    socket.emit(channel, {
      name: this.state.username,
      message: this.state.message,
      timestamp: new Date()
    });
    this.setState({
      ...this.state,
      message: ""
    });
  };

  formatDate = (date) => {
    if(!date) return;

    let dt = new Date(date);
    let t = `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds().toFixed(2)}`;

    return `${t}`;
  }

  updateState = (stateKey, value) => {
    this.setState({
      ...this.state,
      [stateKey]: value
    });
  };

  setUsername = () => {
    this.setState({
      usernameEntered: true
    });
  };

  render() {
    const { message, messages, username, usernameEntered } = this.state;

    return (
      <>
        <form>
          {!usernameEntered ? (
            <>
              <div id="username">
                <h3>Please enter your name</h3>
                <input
                  name="username"
                  type="text"
                  placeholder="Guest"
                  value={username}
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      this.setUsername();
                    }
                  }}
                  onChange={({ target }) => {
                    this.updateState("username", target.value);
                  }}
                />
                <button onClick={() => this.setUsername()}>OK</button>
              </div>
            </>
          ) : (
            <>
              <div id="chat">
                <ul>
                  {messages
                    ? messages.map((m, i) => (
                        <>
                          <li style={{alignSelf: m.name === username ? 'flex-end' : 'end'}} key={m.timestamp + i}>
                            {/* <span style={{textDecoration: "underline"}}>{m.name}</span> */}
                            {m.message}
                            <span>{m.name} - {this.formatDate(m.timestamp)}</span>
                          </li>
                        </>
                      ))
                    : null}
                </ul>
                <div id="messages">
                  <input
                    name="message"
                    value={message}
                    onKeyPress={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        this.sendMessage(channels.chat);
                      }
                    }}
                    onChange={({ target }) => {
                      this.updateState("message", target.value);
                    }}
                  />
                  <button onClick={() => this.sendMessage(channels.chat)}>
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </>
    );
  }
}

export default App;
