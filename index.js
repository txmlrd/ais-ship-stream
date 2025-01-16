const http = require("http");
const { app, ciiList } = require('./src/api');
const setupWebSocket = require("./src/websocket");
const io = require("socket.io-client");

const server = http.createServer(app);

const wss = setupWebSocket(server);

const aisSocket = io("http://146.190.89.97:6767", {
    auth: { token: "labramsjosgandoss" },
    transports: ["websocket"],
});

aisSocket.on("connect", () => {
    console.log("Connected to AIS server.");
});

aisSocket.on("messageFromServer", (data) => {
    const dataJson = JSON.parse(JSON.stringify(data));
    const existingItemIndex = ciiList.findIndex(item => item.mmsi === dataJson.message.data.mmsi);
    dataJson.message.data.cii = ciiList[existingItemIndex]?.cii ?? 'null';
    wss.broadcast(dataJson);
    console.log("Sent AIS data:", dataJson);
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
