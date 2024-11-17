const { ObjectId } = require('mongodb');
const { connectDb, getDb } = require('../../database/mongo');
const moment = require('moment-timezone');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

// Configura ffmpeg y ffprobe con ffmpeg-static
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffmpegStatic);

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

        // Ruta temporal para guardar el thumbnail localmente
        const thumbnailPath = path.join(__dirname, '../../temp', `${Date.now()}-thumbnail.png`);

        // Generar el thumbnail
        ffmpeg(req.file.location)
            .on('end', async () => {
                console.log('Thumbnail generado exitosamente:', thumbnailPath);

                // Aquí debes subir el thumbnail a S3 para obtener su URL
                const thumbnailUrl = await uploadThumbnailToS3(thumbnailPath);

                // Conectar a la base de datos y guardar el video
                const db = await connectDb();
                const newVideo = {
                    title,
                    description,
                    userId: userIdObjectId,
                    s3Url, // Usar la URL obtenida de S3
                    thumbnailUrl, // Guardar la URL del thumbnail
                    uploadDate: moment().format()
                };

                // Eliminar el thumbnail temporal después de subirlo
                fs.unlinkSync(thumbnailPath);

                await db.collection('videos').insertOne(newVideo);
                res.status(201).json({
                    status: "Éxito",
                    message: "Video subido exitosamente",
                    videoUrl: s3Url,
                    thumbnailUrl
                });
            })
            .on('error', (err) => {
                console.error('Error al generar el thumbnail:', err);
                res.status(500).json({ status: "Error", message: "Error al generar el thumbnail" });
            })
            .screenshots({
                count: 1,
                folder: path.dirname(thumbnailPath),
                filename: path.basename(thumbnailPath),
                size: '320x240' // Tamaño del thumbnail
            });
    } catch (error) {
        console.error('Error al subir el video:', error);
        res.status(500).json({ status: "Error", message: "Error al cargar el video" });
    }
};

// Función para subir el thumbnail a S3
const uploadThumbnailToS3 = async (filePath) => {
    const { Upload } = require('@aws-sdk/lib-storage');
    const { S3Client } = require('@aws-sdk/client-s3');
    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });

    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `thumbnails/${fileName}`,
        Body: fileStream,
        ACL: 'public-read', // Permitir acceso público al thumbnail
        ContentType: 'image/png'
    };

    const upload = new Upload({
        client: s3Client,
        params: uploadParams,
    });

    const result = await upload.done();
    return result.Location; // Retorna la URL pública del thumbnail
};

module.exports = {
    uploadVideo
};

