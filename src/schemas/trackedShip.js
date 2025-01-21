const mongoose = require('mongoose')

const { Schema } = mongoose

const trackedShipSchema = new Schema(
    {
        mmsi: { type: String, index: true, unique: true },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

const TrackedShip = mongoose.model('TrackedShip', trackedShipSchema);

module.exports = TrackedShip