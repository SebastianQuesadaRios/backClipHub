const mongoose = require('mongoose');
const Video = require('../models/Video'); // Asegúrate de tener el modelo de Video
const s3 = require('../../config/uploadToS3'); // El middleware que maneja la carga a S3

const uploadVideo = async (req, res) => {
    try {
        // Verificar si el usuario está autenticado
        const userId = req.user.id; // Asumiendo que ya agregamos el ID del usuario al token en el middleware de autenticación
        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar si se recibió un video y una imagen de preview
        const { title, description } = req.body;
        if (!req.file || !req.body.preview) {
            return res.status(400).json({ message: 'Se requieren un video y una imagen de preview.' });
        }

        // Subir el video y la imagen de preview a S3 (esto se asume que ya lo estás haciendo correctamente con multer-s3)
        const videoFile = req.file;
        const previewFile = req.body.preview;

        // Subir el video
        const videoData = await s3.uploadFile(videoFile);

        // Subir la imagen de preview
        const previewData = await s3.uploadFile(previewFile);

        // Crear un nuevo documento de video en MongoDB
        const newVideo = new Video({
            title,
            description,
            videoUrl: videoData.Location, // URL del video subido a S3
            previewUrl: previewData.Location, // URL de la imagen de preview subida a S3
            userId, // Guardamos el ID del usuario que subió el video
        });

        // Guardar en la base de datos
        await newVideo.save();

        res.status(201).json({ message: 'Video subido con éxito', video: newVideo });
    } catch (error) {
        console.error('Error al subir el video y la imagen de preview:', error);
        res.status(500).json({ message: 'Error interno del servidor al subir el video' });
    }
};

module.exports = {
    uploadVideo,
};



