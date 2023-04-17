const fs = require('node:fs');

module.exports = {
    deleteFile: (file, callback) => {
        fs.stat(file, (error, stats) => {
            if (!error) {
                fs.unlink(file, (error) => {
                    if(error) callback(error)
                });
            }
        });
    }
};