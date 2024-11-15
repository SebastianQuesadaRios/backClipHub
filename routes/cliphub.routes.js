const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const router = express.Router();
const { login, register } = require('./controllers/cliphubControllers');
const uploadMiddleware = require('../database/uploadMiddleware'); // Asegúrate de que esté apuntando correctamente
const videoController = require('./controllers/videoController'); // Controlador para gestionar la subida de videos

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
    uploadMiddleware.single('video'),
    videoController.uploadVideo
);


module.exports = router;


