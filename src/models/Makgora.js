const { Schema, model, default: mongoose } = require('mongoose');

const makgoraSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    bojId: {
        type: String,
        required: true,
    },
    rating: {
        type: mongoose.Types.Decimal128,
        default: 1500,
    },
    rd: {
        type: mongoose.Types.Decimal128,
        default: 350,
    },
    vol: {
        type: mongoose.Types.Decimal128,
        default: 0.06,
    },
});

module.exports = model('Makgora', makgoraSchema);