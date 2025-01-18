const express = require('express');
const cors = require('cors')

const app = express();

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://128.199.224.125:3000',
        'https://aismade.my.id'
    ]
}));

app.use(express.json());

let ciiList = [];

app.post("/cii", async (req, res) => {
    const { mmsi, cii } = req.body;

    if (!mmsi || !cii) {
        return res.status(400).json({ error: "id and name are required" });
    }

    const existingItemIndex = ciiList.findIndex(item => item.mmsi === mmsi);

    if (existingItemIndex === -1) {
        const newItem = { mmsi, cii };
        ciiList.push(newItem);
        return res.status(201).json({ message: "Item inserted", item: newItem });
    }

    ciiList[existingItemIndex].cii = cii;
    res.json({ message: "Item updated", item: ciiList[existingItemIndex] });
});

app.get("/cii", async (req, res) => {
    res.json(ciiList);
});

module.exports = { app, ciiList };