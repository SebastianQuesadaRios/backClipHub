const fs = require('fs/promises'); // Importa el módulo de archivos (opcional, dependiendo de tu lógica)
const path = require('path'); // Importa el módulo de rutas (opcional, dependiendo de tu lógica)
const CryptoJS = require('crypto-js');
const pool = require('../../database/mongo'); // Asegúrate de que la conexión a la base de datos está bien
const moment = require('moment-timezone'); // Importa moment-timezone una sola vez
const { ObjectId } = require('mongodb');
const { connectDb, getDb } = require('../../database/mongo'); 
const s3 = require('../../database/uploadMiddleware');

const login = async (req, res) => {
    const { email, password } = req.body; // Extrae email y password del cuerpo de la solicitud
    
    // Verificar si los campos están vacíos
    if (!email || !password) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios" });
    }

    // Hashear la contraseña con el mismo código secreto usado en el registro
    const hashedPassword = CryptoJS.SHA256(password, process.env.CODE_SECRET_DATA).toString();

    try {
        // Conectar a la base de datos
        await connectDb();
        const db = getDb();

        // Buscar al usuario por el correo electrónico y la contraseña hasheada
        const login = await db.collection('users').findOne({
            correo: email,
            password: hashedPassword
        });

        // Si el usuario existe, devolver el ID y el rol
        if (login) {
            return res.json({ status: "Bienvenido", userId: login._id, role: login.role });
        } else {
            // Si no se encuentra el usuario, devolver un error de credenciales incorrectas
            return res.status(401).json({ status: "ErrorCredenciales", message: "Credenciales incorrectas" });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        // Si ocurre un error en la conexión o la consulta, devolver un error interno
        return res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};


// Lógica de registro
const register = async (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios" });
    }

    // Encripta la contraseña recibida
    const hashedPassword = CryptoJS.SHA256(contraseña, process.env.CODE_SECRET_DATA).toString();

    try {
        await connectDb(); // Conectar a la base de datos
        const db = getDb(); // Obtener la referencia a la base de datos

        // Verifica si el correo ya está registrado
        const existingUser = await db.collection('users').findOne({ correo });
        if (existingUser) {
            return res.status(400).json({ status: "Error", message: "El correo ya está en uso" });
        }

        // Crea un nuevo usuario
        const newUser = {
            nombre,
            correo,
            password: hashedPassword,
            role: 'user'
        };

        // Inserta el nuevo usuario en la base de datos
        await db.collection('users').insertOne(newUser);
        res.status(201).json({ status: "Éxito", message: "Usuario registrado correctamente" });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};

const uploadVideo = async (req, res) => {
    const { title, description } = req.body; // Título y descripción del video
    const { userId } = req; // ID del usuario que sube el video (asegúrate de obtenerlo correctamente)
    
    // Verifica que el archivo y los campos obligatorios existan
    if (!req.file || !title || !description) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios o el archivo" });
    }

    try {
        const fileContent = await fs.readFile(req.file.path); // Lee el archivo temporal
        const fileName = `${userId}_${Date.now()}_${req.file.originalname}`; // Nombre único

        // Configuración de S3 para cargar el archivo
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileContent,
            ContentType: req.file.mimetype
        };

        // Cargar a S3
        const s3Response = await s3.upload(params).promise();

        // Guardar datos en MongoDB
        await connectDb();
        const db = getDb();

        const newVideo = {
            title,
            description,
            userId: ObjectId(userId),
            s3Url: s3Response.Location, // URL del archivo en S3
            uploadDate: moment().format() // Fecha y hora de carga
        };

        await db.collection('videos').insertOne(newVideo); // Insertar en la colección `videos`

        // Limpia el archivo temporal
        await fs.unlink(req.file.path);

        res.status(201).json({ status: "Éxito", message: "Video subido exitosamente", videoUrl: s3Response.Location });
    } catch (error) {
        console.error('Error al subir el video:', error);
        res.status(500).json({ status: "Error", message: "Error al cargar el video" });
    }
};





    
// Exporta las funciones
module.exports = {
    login,
    register,
    uploadVideo
};