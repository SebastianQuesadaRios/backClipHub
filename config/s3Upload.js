const { Upload } = require('@aws-sdk/lib-storage');
const s3 = require('./s3'); // Importa el cliente configurado

const uploadToS3 = async (file) => {
    try {
        const upload = new Upload({
            client: s3, // Cliente S3 configurado
            params: {
                Bucket: process.env.AWS_BUCKET_NAME, // Bucket desde .env
                Key: `videos/${Date.now()}-${file.originalname}`, // Nombre único
                Body: file.buffer, // Contenido del archivo
                ContentType: file.mimetype, // Tipo de archivo
                ACL: 'public-read', // Permisos públicos (opcional)
            },
        });

        // Escuchar progreso (opcional)
        upload.on('httpUploadProgress', (progress) => {
            console.log('Progreso de carga:', progress);
        });

        const result = await upload.done(); // Espera la carga
        return result; // Devuelve el resultado (URL y otros datos)
    } catch (error) {
        console.error('Error al cargar a S3:', error);
        throw error; // Lanza el error para manejarlo
    }
};

module.exports = { uploadToS3 };
