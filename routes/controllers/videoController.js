const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

// Configuración de S3
const s3 = new AWS.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'your-bucket-name', // Reemplaza con tu nombre de bucket
    acl: 'public-read', // Cambia a 'private' si no deseas acceso público
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + file.originalname); // Nombra el archivo con el timestamp
    },
  }),
  limits: { fileSize: 100000000 }, // Asegúrate de poner un límite si es necesario (en bytes)
}).single('file'); // 'file' es el nombre del campo en tu formulario

module.exports = upload;

// Controlador para subir el video
const uploadVideo = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error('Error al subir el video', err);
      return res.status(500).json({ status: 'Error', message: 'Error al subir el video' });
    }
    res.status(200).json({ status: 'Success', message: 'Video subido correctamente' });
  });
};

// Exportar el controlador
module.exports = { uploadVideo };

