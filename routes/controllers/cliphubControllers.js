const CryptoJS = require('crypto-js');
const { connectDb, getDb } = require('../../database/mongo');
const { ObjectId } = require('mongodb');


// Función para iniciar sesión
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios" });
    }

    const hashedPassword = CryptoJS.SHA256(password, process.env.CODE_SECRET_DATA).toString();

    try {
        await connectDb();
        const db = getDb();
        const user = await db.collection('users').findOne({ correo: email, password: hashedPassword });

        if (user) {
            // Crear un token simple usando el correo electrónico y el nombre de usuario
            const token = CryptoJS.SHA256(user.correo + user.nombre, process.env.CODE_SECRET_DATA).toString();

            // Enviar el token y el nombre de usuario en la respuesta
            return res.json({
                status: "Bienvenido",
                token, // El token que será utilizado en el frontend
                username: user.correo // Usamos el correo o el nombre del usuario como username
            });
        } else {
            return res.status(401).json({ status: "ErrorCredenciales", message: "Credenciales incorrectas" });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};

// Función para registrar un nuevo usuario
const register = async (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios" });
    }

    const hashedPassword = CryptoJS.SHA256(contraseña, process.env.CODE_SECRET_DATA).toString();

    try {
        await connectDb();
        const db = getDb();
        const existingUser = await db.collection('users').findOne({ correo });
        if (existingUser) {
            return res.status(400).json({ status: "Error", message: "El correo ya está en uso" });
        }

        const newUser = { nombre, correo, password: hashedPassword, role: 'user' };
        await db.collection('users').insertOne(newUser);
        res.status(201).json({ status: "Éxito", message: "Usuario registrado correctamente" });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};

module.exports = { login, register };

