const express = require('express');
const { urlencoded, json } = require('express');
const router = require('./routes/cliphub.routes.js');
const cors = require('cors');
const app = express();
require('dotenv').config();

const whiteList = ['https://front-clip-hub.vercel.app']

app.use(json({ limit: '1gb' })); // Aumenta el límite del cuerpo JSON a 1 GB
app.use(urlencoded({ limit: '1gb', extended: true })); // Aumenta el límite para datos de formularios
app.use(cors({
    origin: whiteList
}));




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


