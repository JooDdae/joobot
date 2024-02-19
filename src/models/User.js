const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    bojId: {
        type: String,
        required: true,
    }
});

module.exports = model('User', userSchema);