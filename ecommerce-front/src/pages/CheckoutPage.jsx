import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { getCart, checkout, verifyOrder } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadCartData();
    // Pré-remplir avec les infos utilisateur
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.firstName) setFormData(prev => ({ ...prev, firstName: user.firstName, lastName: user.lastName, email: user.email }));
  }, []);

  const loadCartData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await getCart();
      if (response.data.items?.length === 0) {
        navigate('/cart');
      }
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const shippingAddress = `${formData.address}, ${formData.postalCode} ${formData.city}, ${formData.country}`;
      const response = await checkout(shippingAddress, '0612345678');
      
      setOrderNumber(response.data.orderNumber);
      setVerificationCode(''); // Don't auto-fill, let user get from email
      setShowVerification(true);
    } catch (error) {
      console.error('Erreur commande:', error);
      setError(error.response?.data?.error || 'Erreur lors de la validation de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOrder = async () => {
    setSubmitting(true);
    try {
      await verifyOrder(orderNumber, verificationCode);
      setOrderPlaced(true);
      setTimeout(() => {
        navigate('/my-orders');
      }, 3000);
    } catch (error) {
      console.error('Erreur vérification:', error);
      setError(error.response?.data?.error || 'Code de vérification incorrect');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (showVerification) {
    return (
      <Container className="py-5">
        <Row>
          <Col lg={6} className="mx-auto">
            <Card className="border-0 shadow-sm" style={{ borderRadius: '24px' }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="mx-auto mb-3" style={{ width: '60px', height: '60px', backgroundColor: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 12V8H4V12M20 12L12 18L4 12M20 12H4M12 18V9" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 style={{ color: 'var(--navy)', fontFamily: 'Playfair Display' }}>Vérification de la commande</h3>
                  <p style={{ color: 'var(--warm-gray)' }}>Un code de vérification a été envoyé à votre email</p>
                </div>
                
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: 'var(--navy)' }}>Code de vérification</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez le code à 6 chiffres"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    style={{ borderRadius: '40px', padding: '12px 20px', textAlign: 'center', fontSize: '1.2rem' }}
                  />
                </Form.Group>
                
                <Button 
                  className="btn-teal w-100 py-2"
                  onClick={handleVerifyOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Vérification...' : 'Vérifier ma commande'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (orderPlaced) {
    return (
      <Container className="py-5 text-center">
        <div className="mb-4">
          <div className="mx-auto mb-3" style={{ width: '80px', height: '80px', backgroundColor: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ color: 'var(--navy)', fontFamily: 'Playfair Display' }}>Commande confirmée !</h2>
          <p style={{ color: 'var(--warm-gray)' }}>Numéro de commande: <strong>{orderNumber}</strong></p>
          <p style={{ color: 'var(--warm-gray)' }}>Merci pour votre achat. Vous serez notifié de l'évolution de votre commande.</p>
          <Button className="btn-teal mt-3" onClick={() => navigate('/my-orders')}>
            Voir mes commandes
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4" style={{ color: 'var(--navy)', fontFamily: 'Playfair Display' }}>Validation de commande</h1>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Row>
        <Col lg={7}>
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <h4 className="mb-3" style={{ color: 'var(--navy)' }}>Informations de livraison</h4>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: 'var(--teal)' }}>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      style={{ borderRadius: '40px', padding: '10px 20px' }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: 'var(--teal)' }}>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      style={{ borderRadius: '40px', padding: '10px 20px' }}
                    />
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--teal)' }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    style={{ borderRadius: '40px', padding: '10px 20px' }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--teal)' }}>Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    style={{ borderRadius: '40px', padding: '10px 20px' }}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: 'var(--teal)' }}>Ville</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      style={{ borderRadius: '40px', padding: '10px 20px' }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: 'var(--teal)' }}>Code postal</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      style={{ borderRadius: '40px', padding: '10px 20px' }}
                    />
                  </Col>
                </Row>
                
                <Button 
                  type="submit" 
                  className="btn-teal w-100 py-2 mt-3"
                  disabled={submitting}
                >
                  {submitting ? 'Traitement...' : 'Confirmer la commande'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={5}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <h4 className="mb-3" style={{ color: 'var(--navy)' }}>Récapitulatif</h4>
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span style={{ color: 'var(--warm-gray)' }}>{item.product.name} x {item.quantity}</span>
                  <span style={{ color: 'var(--soft-teal)' }}>{(item.product.sellingPrice * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              <hr style={{ borderColor: 'var(--pale-teal)' }} />
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--warm-gray)' }}>Sous-total:</span>
                <span style={{ color: 'var(--navy)' }}>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--warm-gray)' }}>Livraison:</span>
                <span style={{ color: 'var(--navy)' }}>{shipping === 0 ? 'Gratuite' : `${shipping} €`}</span>
              </div>
              <hr style={{ borderColor: 'var(--pale-teal)' }} />
              <div className="d-flex justify-content-between">
                <strong style={{ color: 'var(--navy)' }}>Total:</strong>
                <strong className="fs-4" style={{ color: 'var(--soft-teal)' }}>{total.toFixed(2)} €</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;