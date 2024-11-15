const moment = require('moment-timezone');
const { connectDb, getDb } = require('../../database/mongo');
const { ObjectId } = require('mongodb');

/**
 * Controlador para subir un video.
 * @param {Object} req - Solicitud HTTP.
 * @param {Object} res - Respuesta HTTP.
 */
const uploadVideo = async (req, res) => {
    const { title, description } = req.body; // Extrae el título y descripción del cuerpo de la solicitud.
    const { file } = req; // Extrae el archivo cargado del middleware.
    const userId = req.userId || 'user'; // Aquí debes asegurarte de obtener el ID del usuario.

    // Validar los datos recibidos
    if (!file || !title || !description) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios o el archivo de video." });
    }

    try {
        // Conectar a la base de datos
        await connectDb();
        const db = getDb();

        // Crear objeto del video para guardar en la base de datos
        const newVideo = {
            title,
            description,
            userId: ObjectId(userId), // Asegúrate de que el ID de usuario sea válido.
            s3Url: file.location, // La URL pública del archivo subida a S3
            uploadDate: moment().toISOString(), // Fecha de carga en formato ISO
        };

        // Insertar en la colección `videos`
        await db.collection('videos').insertOne(newVideo);

        // Responder con éxito
        res.status(201).json({
            status: "Éxito",
            message: "Video subido exitosamente.",
            videoUrl: file.location,
        });
    } catch (error) {
        console.error('Error al subir el video:', error);
        res.status(500).json({ status: "Error", message: "Error al guardar el video en la base de datos." });
    }
};

module.exports = { uploadVideo };
