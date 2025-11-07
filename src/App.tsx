import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { MatrixRainingLetters } from "react-mdr";

const HOST = "localhost";
const PORT = 8000;

type MessageData = {
  username: string;
  message: string;
  timestamp: string;
};

export default function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const socket = useRef(io(`ws://${HOST}:${PORT}`));
  const connectionStatus = connected ? "Connected" : "Disconnected";

  useEffect(() => {
    socket.current.on("connect", () => {
      setConnected(true);
    });

    socket.current.on("disconnect", () => {
      setConnected(false);
    });

    socket.current.on(room, (data) => {
      try {
        const parsedData = JSON.parse(data);
        setMessages((oldMessages) => [...oldMessages, parsedData]);
      } catch {
        console.log("Message with wrong format " + data);
      }
    });

    return () => void socket.current.removeAllListeners();
  }, [room]);

  function sendMessage() {
    if (!username || !message) {
      alert("Please fill all fields");
      return;
    }

    const timestamp = new Date().toISOString();

    const allData: MessageData = {
      username,
      message,
      timestamp,
    };

    setMessages((oldMessages) => [...oldMessages, allData]);
    socket.current.emit(room, JSON.stringify(allData));
    setMessage("");
  }

  return (
    <>
      {connected && (
        <MatrixRainingLetters key="matrix-bar" custom_class="matrix-bg" />
      )}
      <div id="main">
        <div id="inputs">
          <h1>Chatrix</h1>
          <h2 style={{ color: connected ? "#00ac00" : "red" }}>
            {connectionStatus}
          </h2>

          <input
            value={room}
            placeholder="Room"
            onChange={(e) => setRoom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          ></input>
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
          {messages
            .slice()
            .reverse()
            .map((message, index) => {
              const date = new Date(message.timestamp);
              const timestamp = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              return (
                <div id="messageCard" key={index}>
                  <h4>{`${message.username} (${timestamp})`}</h4>
                  <p>{message.message}</p>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
