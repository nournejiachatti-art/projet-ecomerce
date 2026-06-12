import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Modal, Form, Alert } from 'react-bootstrap';
import { getCart } from '../../services/api';

const NavigationBar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [cartCount, setCartCount] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  useEffect(() => {
    const updateFromStorage = () => {
      setToken(localStorage.getItem('token'));
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    
    window.addEventListener('storage', updateFromStorage);
    
    const loadCartCount = async () => {
      if (token) {
        try {
          const response = await getCart();
          const count = response.data.totalItems || 0;
          setCartCount(count);
        } catch (error) {
          console.error('Erreur chargement panier:', error);
        }
      }
    };
    
    loadCartCount();
    
    return () => window.removeEventListener('storage', updateFromStorage);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser({});
    navigate('/');
    setShowProfileModal(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        setShowAuthModal(false);
        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
        navigate('/');
      } else {
        setError(data.error || 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Inscription réussie! Un code de vérification a été envoyé à votre email.');
        setVerifyEmail(formData.email);
        setShowAuthModal(false);
        setShowVerifyModal(true);
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, code: verifyCode })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Compte vérifié avec succès! Vous pouvez maintenant vous connecter.');
        setTimeout(() => {
          setShowVerifyModal(false);
          setVerifyEmail('');
          setVerifyCode('');
          setIsLogin(true);
          setShowAuthModal(true);
        }, 2000);
      } else {
        setError(data.error || 'Code de vérification incorrect');
      }
    } catch (error) {
      setError('Erreur de vérification');
    }
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return 'U';
  };

  return (
    <>
      <Navbar className="navbar-custom py-2" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-2">
            ShopEase
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link as={Link} to="/products" className="mx-2">Boutique</Nav.Link>
              <Nav.Link as={Link} to="/" className="mx-2">Notre Marque</Nav.Link>
              <Nav.Link as={Link} to="/about" className="mx-2">Notre histoire</Nav.Link>
              <Nav.Link as={Link} to="/contact" className="mx-2">Contact</Nav.Link>
              
              {/* Admin Menu - Only shows for admins */}
              {user?.role === 'ROLE_ADMIN' && (
                <>
                  <Nav.Link as={Link} to="/dashboard" className="mx-2 fw-bold" style={{ color: '#d9534f' }}>Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/manage-products" className="mx-2">Produits</Nav.Link>
                  <Nav.Link as={Link} to="/admin/orders" className="mx-2">Commandes</Nav.Link>
                  <Nav.Link as={Link} to="/manage-categories" className="mx-2">Catégories</Nav.Link>
                  <Nav.Link as={Link} to="/manage-users" className="mx-2">Utilisateurs</Nav.Link>
                  <Nav.Link as={Link} to="/manage-suppliers" className="mx-2">Fournisseurs</Nav.Link>
                </>
              )}
            </Nav>
            <div className="d-flex align-items-center gap-2">
              <Nav.Link as={Link} to="/cart" className="position-relative">
                Panier
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge cart-badge">
                    {cartCount}
                  </span>
                )}
              </Nav.Link>
              
              {token ? (
                <button 
                  className="profile-btn"
                  onClick={() => setShowProfileModal(true)}
                >
                  <div className="profile-icon">
                    {getInitials()}
                  </div>
                  <span className="d-none d-md-block" style={{ color: 'var(--teal)' }}>{user.firstName}</span>
                </button>
              ) : (
                <Button 
                  className="btn-teal"
                  onClick={() => {
                    setIsLogin(true);
                    setShowAuthModal(true);
                  }}
                >
                  Connexion
                </Button>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title style={{ color: 'var(--teal)', fontFamily: 'Playfair Display' }}>Mon profil</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="profile-icon mx-auto mb-3" style={{ width: '70px', height: '70px', fontSize: '28px' }}>
            {getInitials()}
          </div>
          <h5 className="fw-bold" style={{ color: 'var(--teal)' }}>{user.firstName} {user.lastName}</h5>
          <p style={{ color: 'var(--sepia)' }}>{user.email}</p>
          <hr style={{ backgroundColor: 'var(--sage)' }} />
          <div className="d-flex flex-column gap-2">
            <Button 
              variant="outline-teal" 
              className="btn-outline-teal w-100"
              onClick={() => {
                setShowProfileModal(false);
                navigate('/my-orders');
              }}
            >
              Mes commandes
            </Button>
            <Button 
              className="btn-sepia w-100"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Auth Modal (Login/Signup) */}
      <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title style={{ color: 'var(--teal)', fontFamily: 'Playfair Display' }}>
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {error && <Alert variant="danger" className="small">{error}</Alert>}
          {success && <Alert variant="success" className="small">{success}</Alert>}
          
          <Form onSubmit={isLogin ? handleLogin : handleSignup}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'var(--teal)' }}>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{ borderRadius: '40px', borderColor: 'var(--sage)' }}
              />
            </Form.Group>
            
            {!isLogin && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--teal)' }}>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Votre prénom"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    style={{ borderRadius: '40px', borderColor: 'var(--sage)' }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--teal)' }}>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Votre nom"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    style={{ borderRadius: '40px', borderColor: 'var(--sage)' }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--teal)' }}>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="0612345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    style={{ borderRadius: '40px', borderColor: 'var(--sage)' }}
                  />
                </Form.Group>
              </>
            )}
            
            <Form.Group className="mb-4">
              <Form.Label style={{ color: 'var(--teal)' }}>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{ borderRadius: '40px', borderColor: 'var(--sage)' }}
              />
            </Form.Group>
            
            <Button type="submit" className="btn-teal w-100 py-2">
              {isLogin ? 'Se connecter' : 'S\'inscrire'}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            <button 
              className="btn btn-link text-decoration-none p-0"
              style={{ color: 'var(--sepia)' }}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
              }}
            >
              {isLogin ? 'Créer un nouveau compte' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Verify Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title style={{ color: 'var(--teal)', fontFamily: 'Playfair Display' }}>
            Vérification du compte
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {error && <Alert variant="danger" className="small">{error}</Alert>}
          {success && <Alert variant="success" className="small">{success}</Alert>}
          
          <p style={{ color: 'var(--sepia)' }}>Un code de vérification a été envoyé à <strong>{verifyEmail}</strong></p>
          
          <Form onSubmit={handleVerify}>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: 'var(--teal)' }}>Code de vérification</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le code à 6 chiffres"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                required
                style={{ borderRadius: '40px', borderColor: 'var(--sage)', textAlign: 'center', fontSize: '1.2rem' }}
                maxLength="6"
              />
            </Form.Group>
            
            <Button type="submit" className="btn-teal w-100 py-2">
              Vérifier mon compte
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NavigationBar;