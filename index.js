const express = require('express');
const { urlencoded, json } = require('express');
const router = require('./routes/cliphub.routes.js');
require('dotenv').config();

const app = express();

// Middleware para eliminar restricciones de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Permitir todos los orígenes
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    ); // Permitir todos los métodos
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    ); // Permitir estos encabezados

    // Manejar solicitudes preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next(); // Pasar al siguiente middleware
});

// Middleware para analizar datos codificados y JSON
app.use(urlencoded({ extended: true }));
app.use(json());

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Este es el backend');
});

// Usar las rutas de ClipHub
app.use('/v1/ClipHub', router);

// Puerto
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

