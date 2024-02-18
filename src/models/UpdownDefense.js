const { Schema, model } = require('mongoose');

const updownDefenseSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    bojId: {
        type: String,
        required: true,
    },
    currentTier: {
        type: Number,
        default: 11,
    },
    additionalQuery: {
        type: String,
        default: 's#10..',
    },
    numberOfSolvedProblems: {
        type: Number,
        default: 0,
    },
});

module.exports = model('UpdownDefense', updownDefenseSchema);