const http = require("http");
const { app, ciiList } = require('./src/api');
const setupWebSocket = require("./src/websocket");
const io = require("socket.io-client");
const { calculateDistance } = require('./src/utils/distance');
const RecordedValue = require("./src/schemas/recordedValue");
const connectDB = require("./src/config/database");

connectDB()

const previousCoordinate = new Map();

const trackedShip = 525005355 //525005355

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
    const existingItemIndex = ciiList.findIndex(item => item.mmsi == dataJson.message.data.mmsi);

    dataJson.message.data.cii = ciiList[existingItemIndex]?.cii ?? 'null';
    dataJson.message.data.distance = ciiList[existingItemIndex]?.distance ?? 'null';
    dataJson.message.data.mass = ciiList[existingItemIndex]?.mass ?? 'null';

    wss.broadcast(dataJson);
    if (dataJson.message.data.immsi === trackedShip) {
        const { lon, lat } = dataJson.message.data

        const previous = previousCoordinate.get(trackedShip)

        let accDistance = 0

        if (previous) {
            const distance = calculateDistance(previous.lat, previous.lon, lat, lon)

            accDistance = distance + (previous.accDistance ?? 0)

            if (!isNaN(distance) && distance > 0) {
                try {
                    RecordedValue.create({
                        mmsi: trackedShip,
                        distance,
                        accumulated_distance: accDistance
                    })
                    if (existingItemIndex !== -1) {
                        ciiList[existingItemIndex].distance = accDistance
                    }
                } catch (error) {

                }
            }
        }
        previousCoordinate.set(trackedShip, { lon, lat, accDistance })
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
