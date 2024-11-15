const moment = require('moment-timezone');
const { connectDb, getDb } = require('../../database/mongo');
const { ObjectId } = require('mongodb');
const fs = require('fs');


/**
 * Controlador para subir un video.
 * @param {Object} req - Solicitud HTTP.
 * @param {Object} res - Respuesta HTTP.
 */
const uploadVideo = async (req, res) => {
    const { title, description } = req.body;
    const { userId } = req;

    if (!req.file || !title || !description) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios o el archivo" });
    }

    try {
        const fileContent = await fs.readFile(req.file.path);
        const fileName = `${userId}_${Date.now()}_${req.file.originalname}`;

        const userIdObjectId = new ObjectId(userId); // Asegúrate de usar 'new'

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileContent,
            ContentType: req.file.mimetype
        };

        const s3Response = await s3.upload(params).promise();

        // Intentamos conectar a MongoDB y guardar el video
        const db = await connectDb();
        const newVideo = {
            title,
            description,
            userId: userIdObjectId,
            s3Url: s3Response.Location,
            uploadDate: moment().format()
        };

        try {
            await db.collection('videos').insertOne(newVideo); // Intentar insertar el video
            await fs.unlink(req.file.path); // Eliminar archivo temporal
            res.status(201).json({ status: "Éxito", message: "Video subido exitosamente", videoUrl: s3Response.Location });
        } catch (dbError) {
            console.error('Error al guardar el video en la base de datos:', dbError);
            res.status(500).json({ status: "Error", message: "Error al guardar el video en la base de datos" });
        }
    } catch (error) {
        console.error('Error al subir el video:', error);
        res.status(500).json({ status: "Error", message: "Error al cargar el video" });
    }
};

module.exports = { uploadVideo };
