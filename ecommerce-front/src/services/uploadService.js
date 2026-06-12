// Sauvegarder l'image localement et retourner le chemin
export const saveImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
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
          const compressed = canvas.toDataURL(mime, quality);

          const fileName = `${Date.now()}_${file.name}`;
          const imagePath = `/uploads/${fileName}`;

          // Sauvegarder dans localStorage pour simulation
          const images = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
          images[fileName] = compressed;
          localStorage.setItem('uploadedImages', JSON.stringify(images));

          resolve(imagePath);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Récupérer l'image
export const getImage = (imagePath) => {
  if (!imagePath) return null;
  const fileName = imagePath.split('/').pop();
  const images = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
  return images[fileName] || null;
};