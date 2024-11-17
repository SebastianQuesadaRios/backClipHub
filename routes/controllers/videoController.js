const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { connectDb, getDb } = require('../../database/mongo');
const moment = require('moment-timezone');
const path = require('path');

// Configurar cliente de S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Función para generar y subir la miniatura
const generateThumbnail = async (videoUrl) => {
    return new Promise((resolve, reject) => {
        // Usamos ffmpeg para crear la miniatura
        const thumbnailPath = path.join(__dirname, 'thumbnail.jpg'); // Define el archivo de salida para la miniatura
        ffmpeg(videoUrl)
            .screenshots({
                timestamps: ['50%'], // Toma la miniatura en el punto medio del video
                filename: 'thumbnail.jpg',
                folder: __dirname, // Guarda la miniatura en el directorio actual
            })
            .on('end', () => {
                // Sube la miniatura a S3 después de generarla
                const thumbnailFile = fs.createReadStream(thumbnailPath);
                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: `thumbnails/${Date.now()}-thumbnail.jpg`, // Nombre único para la miniatura
                    Body: thumbnailFile,
                    ContentType: 'image/jpeg',
                    ACL: 'public-read', // Permite acceso público
                };

                s3Client.send(new PutObjectCommand(uploadParams))
                    .then((data) => {
                        fs.unlinkSync(thumbnailPath); // Elimina el archivo temporal
                        resolve(data); // Retorna la URL de la miniatura
                    })
                    .catch((err) => {
                        fs.unlinkSync(thumbnailPath);
                        reject(err);
                    });
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

// Función para subir video
const uploadVideo = async (req, res) => {
    const { title, description } = req.body;
    const { userId } = req; // El userId debe ser pasado desde el middleware de autenticación

    // Verifica que el archivo y los campos obligatorios estén presentes
    if (!req.file || !title || !description) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios o el archivo" });
    }

    try {
        const s3Url = req.file.location; // La URL del archivo subido a S3

        const userIdObjectId = new ObjectId(userId); // Asegúrate de usar 'new' para convertir el userId a ObjectId

        // Generar la miniatura
        const thumbnailUrl = await generateThumbnail(s3Url);

        const db = await connectDb(); // Conectar a la base de datos
        const newVideo = {
            title,
            description,
            userId: userIdObjectId,
            s3Url, // Usar la URL obtenida de S3
            thumbnailUrl: thumbnailUrl.Location, // URL de la miniatura en S3
            uploadDate: moment().format()
        };

        // Guardar el video y la miniatura en la base de datos
        await db.collection('videos').insertOne(newVideo);
        res.status(201).json({ status: "Éxito", message: "Video subido exitosamente", videoUrl: s3Url, thumbnailUrl: thumbnailUrl.Location });
    } catch (error) {
        console.error('Error al subir el video:', error);
        res.status(500).json({ status: "Error", message: "Error al cargar el video" });
    }
};

module.exports = {
    uploadVideo
};

