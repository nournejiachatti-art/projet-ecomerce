import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getPublicProducts } from '../services/api';
import { getImageUrl } from '../services/imageUploadService';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getPublicProducts();
      setProducts(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x300/e0e0e0/999?text=Image';
    if (imagePath.startsWith('data:image')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    const storedImage = getImageUrl(imagePath);
    return storedImage || imagePath || 'https://placehold.co/400x300/e0e0e0/999?text=Image';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesPrice = true;
    if (priceRange === 'under100') matchesPrice = product.sellingPrice < 100;
    else if (priceRange === '100to500') matchesPrice = product.sellingPrice >= 100 && product.sellingPrice <= 500;
    else if (priceRange === 'over500') matchesPrice = product.sellingPrice > 500;
    
    return matchesSearch && matchesPrice && product.enabled;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalFilteredPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxPages = Math.min(totalFilteredPages, 5);
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalFilteredPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
          style={{ borderRadius: '50%' }}
        >
          {i}
        </Pagination.Item>
      );
    }
    return pages;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5 my-4">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3 section-title">Notre collection</h1>
        <p className="lead" style={{ color: 'var(--warm-gray)' }}>
          Des pièces uniques, sélectionnées avec soin
        </p>
        <div className="section-divider"></div>
      </div>
      
      {/* Filtres */}
      <Row className="mb-5 justify-content-center">
        <Col md={5} className="mb-3">
          <Form.Control
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="form-control-custom"
            style={{ borderRadius: '40px', padding: '12px 24px' }}
          />
        </Col>
        <Col md={3} className="mb-3">
          <Form.Select 
            value={priceRange} 
            onChange={(e) => {
              setPriceRange(e.target.value);
              setCurrentPage(1);
            }}
            className="form-control-custom"
            style={{ borderRadius: '40px', padding: '12px 24px' }}
          >
            <option value="all">Tous les prix</option>
            <option value="under100">Moins de 100 €</option>
            <option value="100to500">100 € - 500 €</option>
            <option value="over500">Plus de 500 €</option>
          </Form.Select>
        </Col>
        <Col md={2} className="mb-3">
          <Button 
            variant="outline-teal" 
            className="btn-outline-teal w-100"
            onClick={() => {
              setSearchTerm('');
              setPriceRange('all');
              setCurrentPage(1);
            }}
            style={{ padding: '12px 24px' }}
          >
            Réinitialiser
          </Button>
        </Col>
      </Row>

      {/* Résultats */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <p style={{ color: 'var(--warm-gray)' }}>Aucun produit trouvé</p>
        </div>
      ) : (
        <>
          <Row>
            {currentProducts.map((product, index) => (
              <Col md={6} lg={4} xl={3} key={product.id} className="mb-4">
                <Card className="product-card h-100 animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div style={{ overflow: 'hidden', height: '240px', backgroundColor: '#f5f5f5' }}>
                    <Card.Img 
                      variant="top" 
                      src={getDisplayImageUrl(product.imageUrl)} 
                      alt={product.name}
                      style={{ 
                        height: '100%', 
                        width: '100%',
                        objectFit: 'contain', 
                        objectPosition: 'center',
                        transition: 'transform 0.5s ease',
                        cursor: 'pointer'
                      }}
                      className="card-img-top"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x300/e0e0e0/999?text=Image+non+chargée';
                      }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fs-5 mb-2">{product.name}</Card.Title>
                    <Card.Text className="text-muted small mb-3">
                      {product.description?.substring(0, 80)}...
                    </Card.Text>
                    <div className="price mt-auto mb-3" style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--soft-teal)' }}>
                      {product.sellingPrice} €
                    </div>
                    <Button 
                      className="btn-primary-custom w-100"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      Découvrir
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalFilteredPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                  style={{ borderRadius: '50%' }}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  style={{ borderRadius: '50%' }}
                />
                {renderPagination()}
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalFilteredPages}
                  style={{ borderRadius: '50%' }}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalFilteredPages)} 
                  disabled={currentPage === totalFilteredPages}
                  style={{ borderRadius: '50%' }}
                />
              </Pagination>
            </div>
          )}
          
          {/* Informations pagination */}
          <div className="text-center mt-3">
            <small style={{ color: 'var(--warm-gray)' }}>
              Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredProducts.length)} sur {filteredProducts.length} produits
            </small>
          </div>
        </>
      )}
    </Container>
  );
};

export default ProductsPage;