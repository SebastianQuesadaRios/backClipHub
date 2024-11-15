const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

// Configura AWS con las credenciales del .env
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3(); // Cliente S3 usando las credenciales de AWS

// Configuración de multer con S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read', // Permitir acceso público a los archivos
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueKey = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueKey); // Crear un nombre único para el archivo
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true); // Solo aceptar videos
        } else {
            cb(new Error('Solo se permiten archivos de video.'));
        }
    },
});

module.exports = upload;

