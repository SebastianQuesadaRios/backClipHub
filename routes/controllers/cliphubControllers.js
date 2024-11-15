const CryptoJS = require('crypto-js');
const { connectDb, getDb } = require('../../database/mongo');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ status: "Error", message: "Token requerido" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ status: "Error", message: "Token inválido" });
        }

        req.user = user; // Guarda la información del usuario en la request
        next();
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: "Error", message: "Faltan campos obligatorios" });
    }

    const hashedPassword = CryptoJS.SHA256(password, process.env.CODE_SECRET_DATA).toString();

    try {
        await connectDb();
        const db = getDb();
        const login = await db.collection('users').findOne({ correo: email, password: hashedPassword });

        if (login) {
            const token = jwt.sign({ userId: login._id, role: login.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ status: "Bienvenido", token });
        } else {
            return res.status(401).json({ status: "ErrorCredenciales", message: "Credenciales incorrectas" });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};

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

module.exports = { login, register, authenticateToken };
