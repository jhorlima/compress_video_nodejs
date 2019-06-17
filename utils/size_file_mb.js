const fs = require("fs");

module.exports = (path) => {
    const stats = fs.statSync(path);
    const fileSizeInBytes = stats.size;
    return (fileSizeInBytes / 1000000.0).toFixed(2);
};