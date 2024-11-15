const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const router = express.Router();
const { login, register } = require('./controllers/cliphubControllers'); // Importa tanto login como register
const uploadMiddleware = require('../database/uploadMiddleware'); // Asegúrate de que el middleware esté en el directorio correcto
const videoController = require('./controllers/videoController'); // Importa el controlador para la subida de videos

// Cargar las variables de entorno correctamente
dotenv.config({ path: './config.env' });

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
   .then(() => {
       console.log('Conexión exitosa a MongoDB');
   })
   .catch(err => {
       console.error('Error al conectar a MongoDB:', err);
   });

// Ruta para el login
router.post('/login', login);

// Ruta para el registro
router.post('/register', register);

// Ruta para subir video
router.post(
    '/upload-video',
    uploadMiddleware.single('video'), // Middleware de carga para el archivo de video
    videoController.uploadVideo // Controlador que gestiona la lógica de la carga de video
);

module.exports = router;

