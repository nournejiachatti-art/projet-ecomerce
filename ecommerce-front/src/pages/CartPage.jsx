import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../services/api';
import { getImageUrl } from '../services/imageUploadService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await getCart();
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      setError('Erreur lors du chargement du panier');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(productId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      setError('Erreur lors de la mise à jour');
      setTimeout(() => setError(''), 3000);
    }
  };

  const removeItem = async (productId) => {
    try {
      await removeFromCart(productId);
      await loadCart();
    } catch (error) {
      console.error('Erreur suppression:', error);
      setError('Erreur lors de la suppression');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      await loadCart();
    } catch (error) {
      console.error('Erreur vidage panier:', error);
      setError('Erreur lors du vidage du panier');
      setTimeout(() => setError(''), 3000);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (loading) return <LoadingSpinner />;

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2 style={{ color: 'var(--navy)' }}>Votre panier est vide</h2>
        <p style={{ color: 'var(--warm-gray)' }}>Découvrez nos produits et ajoutez-les à votre panier</p>
        <Button className="btn-teal mt-3" onClick={() => navigate('/products')}>
          Continuer vos achats
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4" style={{ color: 'var(--navy)', fontFamily: 'Playfair Display' }}>Mon Panier</h1>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Row>
        <Col lg={8}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr style={{ color: 'var(--navy)' }}>
                  <th>Produit</th>
                  <th>Prix unitaire</th>
                  <th>Quantité</th>
                  <th>Total</th>
                  <th></th>
                 </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={getImageUrl(item.product.imageUrl) || 'https://placehold.co/60x60/e0e0e0/999?text=Image'} 
                          alt={item.product.name} 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }} 
                        />
                        <div>
                          <strong style={{ color: 'var(--navy)' }}>{item.product.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--soft-teal)' }}>{item.product.sellingPrice} €</td>
                    <td>
                      <Form.Control
                        type="number"
                        min="1"
                        max={item.product.quantity}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                        style={{ width: '80px', borderRadius: '40px', borderColor: 'var(--pale-teal)' }}
                      />
                    </td>
                    <td style={{ color: 'var(--soft-teal)' }}>{(item.product.sellingPrice * item.quantity).toFixed(2)} €</td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => removeItem(item.product.id)}
                        style={{ borderRadius: '40px' }}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="d-flex justify-content-between mt-3">
            <Button variant="secondary" onClick={() => navigate('/products')} style={{ borderRadius: '40px' }}>
              Continuer mes achats
            </Button>
            <Button variant="outline-danger" onClick={handleClearCart} style={{ borderRadius: '40px' }}>
              Vider le panier
            </Button>
          </div>
        </Col>
        
        <Col lg={4}>
          <div className="p-4 rounded-4" style={{ backgroundColor: 'var(--cream)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h4 className="mb-3" style={{ color: 'var(--navy)' }}>Récapitulatif</h4>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: 'var(--warm-gray)' }}>Sous-total:</span>
              <span style={{ color: 'var(--navy)' }}>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: 'var(--warm-gray)' }}>Livraison:</span>
              <span style={{ color: 'var(--navy)' }}>{shipping === 0 ? 'Gratuite' : `${shipping} €`}</span>
            </div>
            <hr style={{ borderColor: 'var(--pale-teal)' }} />
            <div className="d-flex justify-content-between mb-3">
              <strong style={{ color: 'var(--navy)' }}>Total:</strong>
              <strong className="fs-4" style={{ color: 'var(--soft-teal)' }}>{total.toFixed(2)} €</strong>
            </div>
            <Button 
              className="btn-teal w-100 py-2"
              onClick={() => navigate('/checkout')}
            >
              Procéder au paiement
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;