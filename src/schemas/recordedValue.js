const mongoose = require('mongoose')

const { Schema } = mongoose

const recordedValueSchema = new Schema(
    {
        mmsi: { type: String },
        cii: { type: Number },
        mass: { type: Number },
        distance: { type: Number },
        accumulated_distance: { type: Number }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: false
        }
    }
)

recordedValueSchema.index({ created_at: 1, mmsi: 1 }, { unique: true });

const RecordedValue = mongoose.model('RecordedValue', recordedValueSchema);

module.exports = RecordedValue