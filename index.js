const express = require('express');
const { urlencoded, json } = require('express');
const router = require('./routes/cliphub.routes.js');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS
const corsOptions = {
    origin: ['https://front-clip-hub.vercel.app'], // Solo permite este dominio
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware para analizar datos codificados y JSON con límites más altos
app.use(json({ limit: '1gb' })); // Aumenta el límite del cuerpo JSON a 1 GB
app.use(urlencoded({ limit: '1gb', extended: true })); // Aumenta el límite para datos de formularios

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Este es el backend');
});

// Usar las rutas de ClipHub
app.use('/v1/ClipHub', router);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});


