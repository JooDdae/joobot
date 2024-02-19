const User = require('../models/User');

module.exports = async (userId) => {
    try {
        const user = await User.findOne({ userId });
        return user.bojId;
    } catch (error) {
        console.log(`There was an error in getBojIdbyUserId.js: ${error}`);
        return null;
    }
}