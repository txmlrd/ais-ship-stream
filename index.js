const http = require("http");
const { app, ciiList } = require('./src/api');
const setupWebSocket = require("./src/websocket");
const io = require("socket.io-client");
const { calculateDistance } = require('./src/utils/distance');
const RecordedValue = require("./src/schemas/recordedValue");
const connectDB = require("./src/config/database");

connectDB()
let cachedShips = []
const previousCoordinate = new Map();

const server = http.createServer(app);

const wss = setupWebSocket(server);

const aisSocket = io("http://146.190.89.97:6767", {
    auth: { token: "labramsjosgandoss" },
    transports: ["websocket"],
});

aisSocket.on("connect", () => {
    console.log("Connected to AIS server.");
});

aisSocket.on("messageFromServer", async (data) => {
    const dataJson = JSON.parse(JSON.stringify(data));
    const existingItemIndex = ciiList.findIndex(item => item.mmsi === dataJson.message.data.mmsi);
    dataJson.message.data.cii = ciiList[existingItemIndex]?.cii ?? 'null';
    wss.broadcast(dataJson);
    // 566127000
    // 525005355
    if (dataJson.message.data.immsi === 525005355) {
        const { lon, lat } = dataJson.message.data
        const previous = previousCoordinate.get(525005355)
        if (previous) {
            const distance = calculateDistance(previous.lat, previous.lon, lat, lon)
            if (!isNaN(distance) && distance > 0) {
                try {
                    RecordedValue.create({
                        mmsi: 525005355,
                        distance
                    })
                } catch (error) {

                }
            }
        }
        previousCoordinate.set(525005355, { lon, lat })
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
