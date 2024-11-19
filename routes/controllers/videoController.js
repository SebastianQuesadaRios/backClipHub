const { ObjectId } = require('mongodb');
const { connectDb } = require('../../database/mongo');
const moment = require('moment-timezone');

const uploadVideo = async (req, res) => {
    const { title, description, username } = req.body; // Cambiado de userId a username

    // Verifica que los archivos y los campos obligatorios estén presentes
    if (!req.files || !req.files.video || !req.files.preview || !title || !description || !username) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios o los archivos" });
    }

    try {
        const videoUrl = req.files.video[0].location; // URL del video subido a S3
        const previewUrl = req.files.preview[0].location; // URL de la imagen de preview subida a S3

        const db = await connectDb(); // Conectar a la base de datos

        // Buscar el usuario en la base de datos usando el campo 'correo' (ya que 'username' es el correo en el frontend)
        const user = await db.collection('users').findOne({ correo: username });
        if (!user) {
            return res.status(404).json({ status: "Error", message: "Usuario no encontrado" });
        }

        const newVideo = {
            title,
            description,
            userId: user._id, // Asociar el _id del usuario
            videoUrl, // URL del video
            previewUrl, // URL de la imagen de preview
            uploadDate: moment().format(),
        };

        // Guardar el video en la base de datos
        await db.collection('videos').insertOne(newVideo);
        res.status(201).json({ 
            status: "Éxito", 
            message: "Video y preview subidos exitosamente", 
            videoUrl, 
            previewUrl 
        });
    } catch (error) {
        console.error('Error al subir el video y el preview:', error);
        res.status(500).json({ status: "Error", message: "Error al cargar el video y el preview" });
    }
};

const getVideos = async (req, res) => {
    try {
        const db = await connectDb(); // Conectar a la base de datos

        // Obtener todos los videos desde la base de datos
        const videos = await db.collection('videos').aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user', // Alias para acceder al usuario
                }
            },
            {
                $unwind: '$user' // Desestructurar el arreglo de usuarios
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    videoUrl: 1,
                    previewUrl: 1,
                    user: {
                        username: 1, // Suponiendo que el campo username está en la colección 'users'
                    },
                    uploadDate: 1,
                }
            }
        ]).toArray(); // Ejecutar la consulta y convertir los resultados a un arreglo

        if (!videos.length) {
            return res.status(404).json({ status: "Error", message: "No hay videos disponibles" });
        }

        // Devolver los videos encontrados
        res.status(200).json({ status: "Éxito", videos });
    } catch (error) {
        console.error('Error al obtener los videos:', error);
        res.status(500).json({ status: "Error", message: "Error al obtener los videos" });
    }
};

module.exports = {
    uploadVideo,
    getVideos
};



