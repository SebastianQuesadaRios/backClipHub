const express = require('express');
const { urlencoded, json } = require('express');
const router = require('./routes/cliphub.routes.js');
require('dotenv').config();

const app = express();
app.use=(cors())
// Middleware para eliminar restricciones de CORS


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

