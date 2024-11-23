const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

// Configura AWS con las credenciales del .env
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Configuración de multer con S3
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueKey = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueKey);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (
            (file.fieldname === 'video' && file.mimetype.startsWith('video/')) ||
            (file.fieldname === 'preview' && file.mimetype.startsWith('image/'))
        ) {
            cb(null, true); // Aceptar archivos de video e imagen
        } else {
            cb(new Error('Solo se permiten archivos de video e imagen.'));
        }
    },
    limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB
    },
});

const uploadMiddleware = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'preview', maxCount: 1 }
]);

module.exports = uploadMiddleware;


