const { S3Client } = require('@aws-sdk/client-s3'); // Importa el cliente S3
const { REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

// Crear una instancia del cliente S3
const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

module.exports = s3;

