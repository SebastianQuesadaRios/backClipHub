import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/UploadVideo.css';
import Navbar from './Navbar';  // Importamos el componente Navbar

function UploadVideo() {
    const [videoFile, setVideoFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Función para manejar la carga del archivo de video
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.includes('video')) {
            setVideoFile(file);
        } else {
            setError('Por favor, selecciona un archivo de video válido.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validaciones
        if (!videoFile || !title || !description) {
            setError('Faltan campos obligatorios.');
            return;
        }

        // Crear un FormData para enviar el archivo
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);
        formData.append('description', description);

        // Obtener el token de autenticación desde el localStorage (si está disponible)
        const token = localStorage.getItem('token'); // Ajusta según cómo estés manejando la autenticación

        try {
            const response = await fetch('https://back-clip-hub.vercel.app/v1/ClipHub/upload-video', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '', // Incluir token si está disponible
                },
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess('Video subido con éxito');

                // Resetear campos
                setVideoFile(null);
                setTitle('');
                setDescription('');

                // Redirigir al home después de subir el video
                navigate('/');
            } else {
                setError(result.message || 'Error al subir el video');
            }
        } catch (error) {
            console.error('Error al intentar subir el video:', error);
            setError('Error al intentar subir el video. Intente de nuevo más tarde.');
        }
    };

    return (
        <div>
            <Navbar /> {/* Agregamos la barra de navegación en la parte superior */}
            <div className="upload-container">
                <h2 className="upload-title">Sube tu Video</h2>
                <p className="upload-subtitle">Comparte tu video con la comunidad</p>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="video">
                            <i className="fas fa-video icon"></i> Video
                        </label>
                        <input
                            type="file"
                            id="video"
                            accept="video/*"
                            onChange={handleVideoChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="title">
                            <i className="fas fa-heading icon"></i> Título
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ingresa el título del video"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">
                            <i className="fas fa-align-left icon"></i> Descripción
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Agrega una descripción para tu video"
                            required
                        />
                    </div>
                    <button className="upload-button" type="submit">Subir Video</button>
                </form>
            </div>
        </div>
    );
}

export default UploadVideo;



