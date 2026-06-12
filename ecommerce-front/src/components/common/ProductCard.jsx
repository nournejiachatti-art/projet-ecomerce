import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../services/imageUploadService';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const imageUrl = getImageUrl(product.imageUrl) || 'https://via.placeholder.com/300x200';

  return (
    <Card className="product-card h-100">
      <Card.Img 
        variant="top" 
        src={imageUrl} 
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <Card.Body>
        <Card.Title className="fw-bold">{product.name}</Card.Title>
        <Card.Text className="text-muted">{product.description?.substring(0, 80)}...</Card.Text>
        <Card.Text className="text-primary fs-4 fw-bold">{product.sellingPrice} €</Card.Text>
        <Button 
          variant="primary" 
          className="w-100"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          Voir détails
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;