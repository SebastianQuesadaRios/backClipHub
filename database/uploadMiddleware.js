const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3'); // Asegúrate de que apunta a tu instancia configurada

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME, // Nombre del bucket desde el .env
        acl: 'public-read', // Permitir acceso público al archivo subido
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueKey = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueKey); // Nombre único para evitar colisiones
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de video.'));
        }
    },
});

module.exports = upload;
