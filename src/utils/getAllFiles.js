const fs = require('fs');
const path = require('path');

module.exports = (directory, foldersOnly = false) => {
    let filenames = [];

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if ((!foldersOnly && file.isFile()) || (foldersOnly && file.isDirectory())) {
            filenames.push(filePath);
        }
    }

    return filenames;
};