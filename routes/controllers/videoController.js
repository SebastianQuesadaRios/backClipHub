const { ObjectId } = require('mongodb');
const { connectDb } = require('../../database/mongo');
const moment = require('moment-timezone');

const uploadVideo = async (req, res) => {
    const { title, description, username } = req.body; // Cambiado de userId a username

    if (!req.files || !req.files.video || !req.files.preview || !title || !description || !username) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios o los archivos" });
    }

    try {
        const videoUrl = req.files.video[0].location; 
        const previewUrl = req.files.preview[0].location; 

        const db = await connectDb();

        const user = await db.collection('users').findOne({ correo: username });
        if (!user) {
            return res.status(404).json({ status: "Error", message: "Usuario no encontrado" });
        }

        const newVideo = {
            title,
            description,
            userId: user._id, 
            videoUrl, 
            previewUrl, 
            uploadDate: moment().format(),
        };

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
        const db = await connectDb();
        const videos = await db.collection('videos').find().toArray();

        const videosWithUsernames = await Promise.all(
            videos.map(async (video) => {
                const user = await db.collection('users').findOne({ _id: video.userId });
                return {
                    ...video,
                    _id: video._id.toString(),
                    userId: video.userId.toString(),
                    username: user ? user.nombre : "Usuario desconocido",
                };
            })
        );

        res.status(200).json(videosWithUsernames);
    } catch (error) {
        console.error('Error al obtener los videos:', error);
        res.status(500).json({ status: 'Error', message: 'No se pudieron obtener los videos' });
    }
};

// Nueva función para obtener un video específico
const getVideosByCorreo = async (req, res) => {
    const { correo } = req.params;

    try {
        const db = await connectDb();

        // Encuentra el usuario por correo
        const user = await db.collection('users').findOne({ correo });
        if (!user) {
            return res.status(404).json({ status: 'Error', message: 'Usuario no encontrado' });
        }

        // Encuentra los videos asociados al ID del usuario
        const videos = await db.collection('videos').find({ userId: user._id }).toArray();

        const videosWithUsernames = videos.map((video) => ({
            ...video,
            _id: video._id.toString(),
            userId: video.userId.toString(),
            username: user.nombre, // Incluye el nombre del usuario
        }));

        res.status(200).json(videosWithUsernames);
    } catch (error) {
        console.error('Error al obtener los videos por correo:', error);
        res.status(500).json({ status: 'Error', message: 'No se pudieron obtener los videos' });
    }
};

module.exports = {
    uploadVideo,
    getVideos,
    getVideosByCorreo, // Exporta la nueva función
};




