const AWS = require('aws-sdk');

// Configuración de AWS desde variables de entorno
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,       // Toma el Access Key del archivo .env
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Toma el Secret Key del archivo .env
    region: process.env.AWS_REGION,                    // La misma región donde creaste el bucket
});

// Crear una instancia de S3
const s3 = new AWS.S3();

module.exports = s3;
