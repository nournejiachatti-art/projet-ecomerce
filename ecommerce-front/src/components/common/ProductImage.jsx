import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../services/imageUploadService';

const ProductImage = ({ imagePath, alt, style }) => {
  const [imageSrc, setImageSrc] = useState('https://placehold.co/400x400/e0e0e0/999?text=Image');

  useEffect(() => {
    const loadImage = async () => {
      if (imagePath) {
        const url = getImageUrl(imagePath);
        setImageSrc(url);
      }
    };
    loadImage();
  }, [imagePath]);

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'contain', 
        objectPosition: 'center',
        ...style 
      }}
      onError={(e) => {
        e.target.src = 'https://placehold.co/400x400/e0e0e0/999?text=Image+non+trouvée';
      }}
    />
  );
};

export default ProductImage;