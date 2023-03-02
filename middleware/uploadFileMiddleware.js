const multer = require('multer');
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
const upload = multer({ storage: storage });

module.exports = upload;