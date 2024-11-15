const fs = require('fs/promises');
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');
const { connectDb, getDb } = require('../../database/mongo');
const s3 = require('../../database/uploadMiddleware'); // Asegúrate de que se está usando el middleware correctamente

const uploadVideo = async (req, res) => {
    const { title, description } = req.body;
    const { userId } = req;

    // Verifica que el archivo y los campos obligatorios estén presentes
    if (!req.file || !title || !description) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios o el archivo" });
    }

    try {
        const s3Url = req.file.location; // La URL del archivo subido a S3

        const userIdObjectId = new ObjectId(userId); // Asegúrate de usar 'new'

        const db = await connectDb(); // Conectar a la base de datos
        const newVideo = {
            title,
            description,
            userId: userIdObjectId,
            s3Url, // Usar la URL obtenida de S3
            uploadDate: moment().format()
        };

        // Guardar el video en la base de datos
        await db.collection('videos').insertOne(newVideo);
        res.status(201).json({ status: "Éxito", message: "Video subido exitosamente", videoUrl: s3Url });
    } catch (error) {
        console.error('Error al subir el video:', error);
        res.status(500).json({ status: "Error", message: "Error al cargar el video" });
    }
};

module.exports = {
    uploadVideo
};

