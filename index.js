const io = require("socket.io-client");
const WebSocketServer = require("ws");

// Connect to AIS data server
const aisSocket = io("http://146.190.89.97:6767", {
  auth: { token: "labramsjosgandoss" },
  transports: ["websocket"],
});

aisSocket.on("connect", () => {
  console.log("Connected to AIS server.");
});

// Broadcast AIS data to frontend
aisSocket.on("messageFromServer", (data) => {
  console.log("Received AIS data:", data);

  // Send data to frontend
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocketServer.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

// WebSocket server for frontend
const wss = new WebSocketServer.Server({ port: 8080 });
console.log("WebSocket server running on ws://localhost:8080");
