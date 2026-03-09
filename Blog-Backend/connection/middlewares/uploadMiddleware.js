const multer = require('multer');
const path = require('path');
const fs = require('fs');


const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../public/uploads/profiles');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'unknown';
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `profile_${userId}_${Date.now()}${ext}`);
    },
});

const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../public/uploads/posts');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'unknown';
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `post_${userId}_${Date.now()}${ext}`);
    },
});


const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid =
        allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
        allowedTypes.test(file.mimetype);

    if (isValid) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes: jpeg, jpg, png, gif, webp'), false);
    }
};

const uploadProfileImage = multer({
    storage: profileStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: imageFileFilter,
}).single('profileImage');

const uploadPostImage = multer({
    storage: postStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter,
}).single('post_image');

const handleUpload = (multerMiddleware) => (req, res, next) => {
    multerMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    status: 'error',
                    message: 'El archivo excede el tamaño máximo permitido.',
                });
            }
            return res.status(400).json({ status: 'error', message: err.message });
        }
        if (err) {
            return res.status(400).json({ status: 'error', message: err.message });
        }
        next();
    });
};

module.exports = {
    uploadProfileImage: handleUpload(uploadProfileImage),
    uploadPostImage: handleUpload(uploadPostImage),
};
