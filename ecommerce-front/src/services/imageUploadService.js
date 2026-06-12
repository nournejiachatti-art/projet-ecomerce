import api from './api';

// Service pour gérer l'upload des images
export const uploadImage = async (file) => {
  console.log('=== UPLOAD IMAGE ===');
  console.log('Fichier reçu:', file.name, 'Type:', file.type, 'Taille:', file.size);
  // Prefer backend upload; if it fails, fallback to client-side resize+store
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
    console.warn('Backend upload failed, using local fallback:', error?.message || error);

    // Fallback: resize/compress and save to localStorage
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            const MAX_DIM = 1024;
            let { width, height } = img;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((MAX_DIM / width) * height);
                width = MAX_DIM;
              } else {
                width = Math.round((MAX_DIM / height) * width);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const quality = mime === 'image/png' ? 0.9 : 0.8;
            const compressedDataUrl = canvas.toDataURL(mime, quality);

            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const imageUrl = `/uploads/${fileName}`;

            const storedImages = JSON.parse(localStorage.getItem('storedImages') || '{}');
            storedImages[fileName] = compressedDataUrl;
            localStorage.setItem('storedImages', JSON.stringify(storedImages));

            console.log('Image stockée dans localStorage avec le nom:', fileName);
            console.log('URL générée:', imageUrl);
            console.log('=== FIN UPLOAD (local) ===');

            resolve(imageUrl);
          } catch (err) {
            console.error('Erreur lors du traitement de l\'image:', err);
            reject(err);
          }
        };
        img.onerror = (err) => reject(err);
        img.src = reader.result;
      };

      reader.onerror = (error) => {
        console.error('Erreur lors de la lecture du fichier:', error);
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si l'URL est déjà une URL complète (http/https ou data:image)
  if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  // Try localStorage first (client-side fallback)
  const fileName = imagePath.split('/').pop();
  const storedImages = JSON.parse(localStorage.getItem('storedImages') || '{}');
  if (storedImages[fileName]) return storedImages[fileName];

  // Otherwise assume backend serves it
  return `http://localhost:8080${imagePath}`;
};

export const deleteImage = (imagePath) => {
  if (!imagePath) return;
  
  // Remove from localStorage if present
  const fileName = imagePath.split('/').pop();
  const storedImages = JSON.parse(localStorage.getItem('storedImages') || '{}');
  if (storedImages[fileName]) {
    delete storedImages[fileName];
    localStorage.setItem('storedImages', JSON.stringify(storedImages));
    console.log('Image supprimée du localStorage:', fileName);
    return;
  }

  // Otherwise, attempt backend delete if an API exists
  try {
    api.delete(`/upload/image?path=${encodeURIComponent(imagePath)}`)
      .then(() => console.log('Delete request sent to backend for', imagePath))
      .catch((err) => console.warn('Backend delete failed or not implemented:', err?.message || err));
  } catch (err) {
    console.warn('Delete image: backend delete not available', err?.message || err);
  }
};