const fs = require('fs/promises'); // Importa el módulo de archivos (opcional, dependiendo de tu lógica)
const path = require('path'); // Importa el módulo de rutas (opcional, dependiendo de tu lógica)
const CryptoJS = require('crypto-js');
const pool = require('../../database/mongo'); // Asegúrate de que la conexión a la base de datos está bien
const moment = require('moment-timezone'); // Importa moment-timezone una sola vez
const { ObjectId } = require('mongodb');
const { connectDb, getDb } = require('../../database/mongo'); 


const login = async (req, res) => {
    const { email, password } = req.body; // Extrae email y password del cuerpo de la solicitud
    
    if (!email || !password) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios" });
    }

    const hashedPassword = CryptoJS.SHA256(password, process.env.CODE_SECRET_DATA).toString();

    try {
        await connectDb(); // Conectar a la base de datos
        const db = getDb(); // Obtener la referencia a la base de datos

        const login = await db.collection('users').findOne({
            correo: email,
            password: hashedPassword
        });

        if (login) {
            res.json({ status: "Bienvenido", userId: login._id, role: login.role });
        } else {
            res.status(401).json({ status: "ErrorCredenciales", message: "Credenciales incorrectas" });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
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





    
// Exporta las funciones
module.exports = {
    login,
    register
};