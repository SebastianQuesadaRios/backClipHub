const express = require('express');
const { urlencoded, json } = require('express');
const pool = require('./database/mongo');
const router = require('./routes/cliphub.routes.js');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS
const corsOptions = {
    origin: ['http://localhost:5173', 'https://front-clip-hub.vercel.app/'], // Cambia 'https://tudominio.com' por tu dominio en producción
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Aplicar CORS con las opciones configuradas
app.use(cors(corsOptions));

// Middleware para analizar datos codificados y JSON
app.use(urlencoded({ extended: true }));
app.use(json());

// Manejador para la ruta raíz
app.get('/', (req, res) => {
    res.send('Este es el backend');
});

// Manejador para la ruta GET que imprime un mensaje
app.get('/v1/signos', (req, res, next) => {
    console.log('Estas usando el backend');
    next();
});

// Usar las rutas de ClipHub
app.use('/v1/ClipHub', router);

// Iniciar el servidor
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

