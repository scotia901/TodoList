require('dotenv').config();
const PROFILE_IMG_PATH = process.env.PROFILE_IMG_PATH;
const multer = require('multer');
const path = require('node:path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PROFILE_IMG_PATH);
    },
    filename: (req, file, cb) => {
        const randomFileName = Math.round(Math.random() * 1E15);
        const ext = path.extname(file.originalname);
        cb(null, randomFileName + ext)
    }
});
const upload = multer({
    storage: storage
});

module.exports = upload;