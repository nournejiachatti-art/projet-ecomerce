import api from './api';

// Service pour gérer l'upload des images
export const uploadImage = async (file) => {
  console.log('=== UPLOAD IMAGE ===');
  console.log('Fichier reçu:', file.name, 'Type:', file.type, 'Taille:', file.size);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Réponse backend:', response.data);
    console.log('=== FIN UPLOAD ===');
    
    return response.data.imageUrl;
  } catch (error) {
    console.error('Erreur upload image:', error);
    throw error;
  }
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si l'URL est déjà une URL complète (http/https ou data:image)
  if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  return `http://localhost:8080${imagePath}`;
};

export const deleteImage = (imagePath) => {
  if (!imagePath) return;
  
  console.log('Delete image - à implémenter sur le backend si nécessaire');
};