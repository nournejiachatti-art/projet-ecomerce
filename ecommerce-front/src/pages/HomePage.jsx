import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getPublicProducts } from '../services/api';
import { getImageUrl } from '../services/imageUploadService';

const themeGallery = [
  '/uploads/moist.jpg',
  '/uploads/moist1.jpg',
  '/uploads/hydronicAcid.jpg',
  '/uploads/ecran.jpg',
  '/uploads/B3.jpg',
  '/uploads/bha.jpg',
  '/uploads/VitamineC.jpg',
];



const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await getPublicProducts();
        const enabled = (res.data || []).filter((p) => p?.enabled);
        setProducts(enabled);
      } catch (e) {
        console.error('Erreur chargement produits (HomePage):', e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const getDisplayImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x300/e0e0e0/999?text=Image';
    if (imagePath.startsWith('data:image')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    return getImageUrl(imagePath) || imagePath;
  };

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-75 py-5">
            <Col lg={7} className="animate-fadeInUp">
              <div className="mb-4">
                <span
                  className="badge"
                  style={{ backgroundColor: 'var(--sage)', color: 'white', padding: '8px 16px', borderRadius: '40px' }}
                >
                  Skin care & makeup
                </span>
              </div>
              <h1 className="display-2 fw-bold mb-4" style={{ color: 'var(--teal)', fontFamily: 'Playfair Display' }}>
                Glow, douceur, confiance
              </h1>
              <p className="lead mb-4" style={{ color: 'var(--sepia)', fontSize: '1.2rem' }}>
                Une sélection de produits pensées pour sublimer votre peau et votre beauté au quotidien.
                Ajoutez au panier et laissez votre routine commencer.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button className="btn-teal px-5 py-3" onClick={() => navigate('/products')}>
                  Shop now
                </Button>
                <Button className="btn-outline-teal px-5 py-3" onClick={() => navigate('/about')}>
                  Notre histoire
                </Button>
              </div>
            </Col>
            <Col lg={5} className="text-center mt-5 mt-lg-0 animate-fadeInUp">
              <div
                className="rounded-4 p-4"
                style={{ background: 'linear-gradient(135deg, var(--beige) 0%, #e8e0d0 100%)', borderRadius: '60px' }}
              >
                <div
                  className="rounded-4"
                  style={{
                    height: '400px',
                    borderRadius: '40px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.15)), url("${themeGallery[0]}")`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundColor: '#faf7f0'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'radial-gradient(circle at 20% 20%, rgba(255,79,162,0.28), transparent 55%)',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  />
                </div>
              </div>

            </Col>
          </Row>
        </Container>
      </div>

      {/* Products first page (scrollable section) */}
      <Container className="py-5 my-2">
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold mb-3" style={{ color: 'var(--teal)', fontFamily: 'Playfair Display' }}>
            Nouveautés & best-sellers
          </h2>
          <p className="lead" style={{ color: 'var(--sepia)' }}>
            Faites défiler, choisissez vos favoris et ajoutez-les au panier.
          </p>
          <div className="mx-auto" style={{ width: '80px', height: '2px', backgroundColor: 'var(--sage)' }} />
        </div>

        {/* Best sellers (fallback to uploaded images when backend products are unavailable) */}
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" variant="teal" />
          </div>
        ) : products.length === 0 ? (
          <Row className="g-4 justify-content-center">
            {themeGallery.map((src, idx) => (
              <Col key={src + idx} md={6} lg={3}>
                <Card
                  className="product-card h-100 animate-fadeInUp"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div style={{ overflow: 'hidden', height: '125px', backgroundColor: '#f5f5f5' }}>
                    <Card.Img
                      variant="top"
                      src={src}
                      alt={`best-seller-${idx}`}
                      style={{ height: '125px', width: '100%', objectFit: 'contain', objectPosition: 'center', backgroundColor: '#f5f5f5' }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column" style={{ padding: '0.9rem' }}>
                    <Card.Title className="fw-bold" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {idx === 0
                        ? 'Moist Glow Cream'
                        : idx === 1
                        ? 'Moist Serum Vit C'
                        : idx === 2
                        ? 'Hydronic Acid Toner'
                        : 'Ecran Protection'
                      }
                    </Card.Title>
                    <Card.Text className="text-muted small" style={{ flexGrow: 1, marginBottom: '0.5rem' }}>
                      {idx === 0
                        ? 'Hydratation intense pour un glow immédiat.'
                        : idx === 1
                        ? 'Sérum éclat à la vitamine C pour une peau lumineuse.'
                        : idx === 2
                        ? 'Toner apaisant à l’acide hydronique pour équilibrer la peau.'
                        : 'Protection quotidienne légère pour une barrière renforcée.'
                      }
                    </Card.Text>
                    <div className="price mt-2 mb-3" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      {idx === 0
                        ? '19.90 €'
                        : idx === 1
                        ? '24.50 €'
                        : idx === 2
                        ? '17.90 €'
                        : '14.90 €'
                      }
                    </div>
                    <Button className="btn-primary-custom w-100" onClick={() => navigate('/products')}>
                      Voir details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row className="g-4">
            {products.slice(0, 12).map((product, idx) => (
              <Col key={product.id} md={6} lg={4}>
                <Card
                  className="product-card h-100 animate-fadeInUp"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  role="button"
                >
                  <div style={{ overflow: 'hidden', height: '220px', backgroundColor: '#f5f5f5' }}>
                    <Card.Img
                      variant="top"
                      src={getDisplayImageUrl(product.imageUrl || product.image)}
                      alt={product.name}
                      style={{ height: '220px', width: '100%', objectFit: 'contain', objectPosition: 'center', cursor: 'pointer', backgroundColor: '#f5f5f5' }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fw-bold">{product.name}</Card.Title>
                    <Card.Text className="text-muted small" style={{ flexGrow: 1 }}>
                      {product.description?.substring(0, 80) || '—'}...
                    </Card.Text>
                    <div className="price mt-2 mb-3">{product.sellingPrice} €</div>
                    <Button
                      className="btn-primary-custom w-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      Voir details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}


        <div className="text-center mt-5">
          <Button className="btn-teal px-5 py-3" onClick={() => navigate('/products')}>
            Voir toute la boutique
          </Button>
        </div>
      </Container>

      {/* Values Section (kept) */}
      <Container className="py-5 my-5">
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold mb-3" style={{ color: 'var(--teal)', fontFamily: 'Playfair Display' }}>
            Notre promesse beauté
          </h2>
          <p className="lead" style={{ color: 'var(--sepia)' }}>
            Des valeurs qui guident votre routine.
          </p>
          <div className="mx-auto" style={{ width: '80px', height: '2px', backgroundColor: 'var(--sage)' }} />
        </div>

        <Row className="g-4">
          <Col md={4}>
            <div className="feature-card animate-fadeInUp">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M20 12V8H4V12M20 12L12 18L4 12M20 12H4M12 18V9"
                    stroke="white"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h4 className="fw-bold mb-3" style={{ color: 'var(--teal)' }}>
                Ingrédients choisis
              </h4>
              <p style={{ color: 'var(--sepia)' }}>Formules pensées pour respecter votre peau et booster votre éclat.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="feature-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" stroke="white" />
                  <path d="M12 6v6l4 2" stroke="white" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="fw-bold mb-3" style={{ color: 'var(--teal)' }}>
                Résultats visibles
              </h4>
              <p style={{ color: 'var(--sepia)' }}>Hydratation, confort, glow — votre routine devient un plaisir.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="feature-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M17 9V7a5 5 0 0 0-10 0v2"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <rect x="4" y="9" width="16" height="12" rx="2" stroke="white" />
                  <path d="M8 13h8" stroke="white" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="fw-bold mb-3" style={{ color: 'var(--teal)' }}>
                Zéro compromis
              </h4>
              <p style={{ color: 'var(--sepia)' }}>Qualité & traçabilité pour une confiance totale.</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <div className="py-5 my-5" style={{ backgroundColor: 'var(--sage)' }}>
        <Container className="text-center py-5">
          <h2 className="display-4 fw-bold mb-4" style={{ color: 'white', fontFamily: 'Playfair Display' }}>
            Votre glow commence ici
          </h2>
          <p className="lead mb-4" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto' }}>
            Parcourez la boutique et trouvez le produit parfait pour vous.
          </p>
          <Button
            className="px-5 py-3 mt-3"
            style={{ backgroundColor: 'white', color: 'var(--sage)', borderRadius: '40px', fontWeight: '600', border: 'none' }}
            onClick={() => navigate('/products')}
          >
            Découvrir la boutique
          </Button>
        </Container>
      </div>
    </>
  );
};

export default HomePage;

