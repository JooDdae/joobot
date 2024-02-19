const { Schema, model } = require('mongoose');

const makgoraHistorySchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    targetUserId: {
        type: String,
        required: true,
    },
    problemId: {
        type: Number,
        required: true,
    },
    query: {
        type: String,
        required: true,
    },
    timeLimit: {
        type: Number,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    result: {
        type: String,
        required: true,
    },
    rated: {
        type: Boolean,
        default: true,
    }
});

module.exports = model('MakgoraHistory', makgoraHistorySchema);