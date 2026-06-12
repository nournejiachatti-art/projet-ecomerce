import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x200';

  return (
    <Card className="product-card h-100">
      <div style={{ overflow: 'hidden', height: '200px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card.Img 
          variant="top" 
          src={imageUrl} 
          style={{ height: '100%', width: '100%', objectFit: 'contain', objectPosition: 'center' }}
        />
      </div>
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