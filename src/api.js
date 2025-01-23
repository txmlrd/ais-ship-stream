const express = require('express');
const cors = require('cors');
const RecordedValue = require('./schemas/recordedValue');
const { default: mongoose } = require('mongoose');
const { calculateCii } = require('./utils/cii');

const app = express();

app.use(cors());

app.use(express.json());

let ciiList = [{ mmsi: 566726000 }]; // {mmsi: 0, cii: 0, distance: 0, mass: 0}

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

app.post("/cii/:id/mass", async (req, res) => {
    const { mass } = req.body;
    const { id } = req.params;

    try {
        const record = await RecordedValue.findOne({ _id: id });

        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        const cii = calculateCii(mass, record.accumulated_distance);

        record.mass = mass;
        record.cii = cii;

        const existingItemIndex = ciiList.findIndex(item => item.mmsi == record.mmsi);

        if (!ciiList[existingItemIndex].last_change || ciiList[existingItemIndex].last_change < record.created_at) {
            ciiList[existingItemIndex].cii = cii;
            ciiList[existingItemIndex].mass = mass;
            ciiList[existingItemIndex].distance = record.accumulated_distance;
            ciiList[existingItemIndex].last_change = record.created_at
        }

        await record.save();

        return res.status(200).json({ message: "Record updated successfully", record });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Unhandled error", error });
    }
});

app.delete("/cii/:id/mass", async (req, res) => {
    const { id } = req.params;

    try {
        const record = await RecordedValue.deleteOne({ _id: id });

        return res.status(200).json({ message: "Record deleted successfully", record });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Unhandled error", error });
    }
});

app.get("/cii/recorded", async (req, res) => {
    const { cursor, limit, olderThan, newerThan, show, direction } = req.query;
    const showAll = show === "true";
    const isOlder = direction === "older"; // Determines pagination direction
    const isNewer = direction === "newer";

    try {
        const query = {};

        // Apply olderThan and newerThan filters
        if (olderThan) {
            query.created_at = { ...(query.created_at || {}), $lt: new Date(olderThan) };
        }
        if (newerThan) {
            query.created_at = { ...(query.created_at || {}), $gt: new Date(newerThan) };
        }

        if (cursor) {
            const cursorDate = new Date(cursor);

            // if (isOlder) {
            query.created_at = { ...(query.created_at || {}), $lt: cursorDate };
            // } else if (isNewer) {
            //     query.created_at = { ...(query.created_at || {}), $gt: cursorDate };
            // }
        }

        if (!showAll) {
            query.mass = { $exists: true, $ne: null };
        }

        // const sortDirection = isNewer ? 1 : -1; 
        const sortDirection = -1;

        const records = await RecordedValue.find(query)
            .sort({ created_at: sortDirection })
            .limit(Number(limit) || 50);

        const nextCursor =
            records.length > 0
                ? isNewer
                    ? records[0].created_at
                    : records[records.length - 1].created_at
                : null;

        res.json({
            data: records.map((item) => ({
                id: item._id,
                mmsi: item.mmsi,
                distance: item.distance,
                accumulated_distance: item.accumulated_distance,
                mass: item.mass,
                cii: item.cii,
                created_at: item.created_at,
            })),
            nextCursor,
        });
    } catch (error) {
        console.error("Error fetching records:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});


module.exports = { app, ciiList };