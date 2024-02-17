const UpdownDefense = require('../models/UpdownDefense');

module.exports = async () => {
    try {
        const users = await UpdownDefense.find();
        return users;
    } catch (error) {
        console.log(`There was an error trying to get all users: ${error}`);
    }
}