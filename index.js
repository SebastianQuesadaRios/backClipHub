const express = require('express');
const { urlencoded, json } = require('express');
const router = require('./routes/cliphub.routes.js');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS
const corsOptions = {
    origin: ['http://localhost:5173', 'https://front-clip-hub.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middleware para analizar datos codificados y JSON
app.use(urlencoded({ extended: true }));
app.use(json());

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

