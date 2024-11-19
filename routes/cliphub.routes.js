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
router.post('/login', async (req, res) => {
    try {
        await login(req, res); // Llamar al controlador de login
    } catch (error) {
        console.error('Error al procesar login:', error);
        res.status(500).json({ status: "Error", message: "Error interno al procesar el login" });
    }
});

// Ruta para el registro
router.post('/register', async (req, res) => {
    try {
        await register(req, res); // Llamar al controlador de registro
    } catch (error) {
        console.error('Error al procesar registro:', error);
        res.status(500).json({ status: "Error", message: "Error interno al procesar el registro" });
    }
});

// Ruta para subir video
router.post(
    '/upload-video',
    uploadMiddleware,  // Middleware para manejar múltiples archivos
    async (req, res) => {
        try {
            await videoController.uploadVideo(req, res); // Llamar al controlador de subida de video
        } catch (error) {
            console.error('Error al procesar la subida del video:', error);
            res.status(500).json({ status: "Error", message: "Error interno al procesar la subida del video" });
        }
    }
);


module.exports = router;



