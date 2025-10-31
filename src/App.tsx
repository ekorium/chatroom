import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const HOST = "localhost";
const PORT = 8000;
const ROOM = "project1";

const socket = io(`ws://localhost:8000`);

type MessageData = {
  username: string;
  message: string;
  timestamp: {
    hours: string;
    minutes: string;
  };
};

export default function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const connectionStatus = connected ? "Connected" : "Disconnected";

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on(ROOM, (data) => {
      try {
        const parsedData = JSON.parse(data);
        setMessages((oldMessages) => [...oldMessages, parsedData]);
      } catch {
        console.log("Message with wrong format " + data);
      }
    });

    return () => void socket.removeAllListeners();
  }, []);

  function sendMessage() {
    if (!username || !message) {
      alert("Please fill all fields");
      return;
    }

    const time = new Date();

    const allData: MessageData = {
      username,
      message,
      timestamp: {
        hours: time.getHours().toString().padStart(2, "0"),
        minutes: time.getMinutes().toString().padStart(2, "0"),
      },
    };

    setMessages((oldMessages) => [...oldMessages, allData]);
    socket.emit(ROOM, JSON.stringify(allData));
    setMessage("")
  }

  return (
    <div id="main">
    <div id="inputs">
      <h1>Chat Room</h1>
      <h1>{connectionStatus}</h1>
      <input
        value={username}
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      ></input>
      <input
        value={message}
        placeholder="Message"
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      ></input>
      <button onClick={sendMessage}>SEND</button>
      </div>
      <div id="messagebox">
      {messages.map((message, index) => (
        <div id="messageCard" key={index}>
          <h4>{`${message.username} (${message.timestamp.hours}:${message.timestamp.minutes})`}</h4>
          <p>{message.message}</p>
        </div>
      ))}
      </div>
    </div>
  );
}
