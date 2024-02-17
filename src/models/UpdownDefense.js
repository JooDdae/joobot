const { Schema, model } = require('mongoose');

const updownDefenseSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    bojId: {
        type: String,
        required: true,
    },
    currentTier: {
        type: Number,
        default: 1,
    },
    numberOfSolvedProblems: {
        type: Number,
        default: 0,
    },
    timeLimit: {
        type: Number,
        default: 40 * 60 * 1000,
    },
    penalty: {
        type: Number,
        default: 0,
    },
});

module.exports = model('UpdownDefense', updownDefenseSchema);