const WebSocket = require("ws");

module.exports = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        console.log("New WebSocket connection");

        ws.on("message", (message) => {
            console.log("Received from frontend:", message);
        });

        ws.send("Welcome to the WebSocket server");
    });

    wss.broadcast = (data) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    };

    return wss;
};
