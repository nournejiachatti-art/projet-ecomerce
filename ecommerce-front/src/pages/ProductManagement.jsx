import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert, Pagination } from 'react-bootstrap';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getPublicProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../services/api';
import { uploadImage, getImageUrl, deleteImage } from '../services/imageUploadService';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchasePrice: '',
    sellingPrice: '',
    categoryId: '',
    imageUrl: '',
    stock: ''
  });
  const [alert, setAlert] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'ROLE_ADMIN') {
      navigate('/admin-login');
      return;
    }
    
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [productsRes, categoriesRes] = await Promise.all([
        getPublicProducts(),
        getCategories(token)
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setAlert({ type: 'danger', message: 'Erreur lors du chargement des données' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pages = [];
    const maxPages = Math.min(totalPages, 5);
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      try {
        const imageUrl = await uploadImage(file);
        setFormData({ ...formData, imageUrl: imageUrl });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erreur upload image:', error);
        setAlert({ type: 'danger', message: 'Erreur lors de l\'upload de l\'image' });
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const productData = {
        name: formData.name,
        description: formData.description,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        imageUrl: formData.imageUrl || null,
        stock: formData.stock ? parseInt(formData.stock) : 0
      };
      
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData, token);
        setAlert({ type: 'success', message: 'Produit modifié avec succès' });
      } else {
        await createProduct(productData, token);
        setAlert({ type: 'success', message: 'Produit ajouté avec succès' });
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ type: 'danger', message: error.response?.data?.error || 'Erreur lors de l\'opération' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      categoryId: product.category?.id || '',
      imageUrl: product.imageUrl || '',
      stock: product.stock || ''
    });
    setImagePreview(product.imageUrl);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const productToDelete = products.find(p => p.id === id);
        if (productToDelete?.imageUrl) {
          deleteImage(productToDelete.imageUrl);
        }
        await deleteProduct(id, token);
        await loadData();
        setAlert({ type: 'success', message: 'Produit supprimé avec succès' });
      } catch (error) {
        console.error('Erreur suppression:', error);
        setAlert({ type: 'danger', message: 'Erreur lors de la suppression' });
      } finally {
        setLoading(false);
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      purchasePrice: '',
      sellingPrice: '',
      categoryId: '',
      imageUrl: '',
      stock: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingProduct(null);
    setShowModal(false);
  };

  const getDisplayImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('data:image')) return imageUrl;
    const storedImage = getImageUrl(imageUrl);
    return storedImage || imageUrl;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <Container fluid className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>Gestion des Produits</h1>
              <p style={{ color: '#4a5a5a' }}>Gérez votre catalogue de produits</p>
            </div>
            <Button className="btn-teal" onClick={() => setShowModal(true)}>
              + Ajouter un produit
            </Button>
          </div>

          {alert && (
            <Alert variant={alert.type} className="mb-4" style={{ borderRadius: '12px' }}>
              {alert.message}
            </Alert>
          )}

          <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr style={{ color: '#4a5a5a', borderBottom: '2px solid #e0e0e0' }}>
                      <th>Image</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Prix d'achat</th>
                      <th>Prix de vente</th>
                      <th>Stock</th>
                      <th>Catégorie</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4" style={{ color: '#4a5a5a' }}>
                          Aucun produit trouvé
                        </td>
                      </tr>
                    ) : (
                      currentProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.imageUrl ? (
                              <img 
                                src={getDisplayImageUrl(product.imageUrl)} 
                                alt={product.name} 
                                style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px',
                                  backgroundColor: '#f5f5f5'
                                }} 
                              />
                            ) : (
                              <div style={{ 
                                width: '50px', 
                                height: '50px', 
                                backgroundColor: '#e0e0e0', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999',
                                fontSize: '10px',
                                textAlign: 'center'
                              }}>
                                Image
                              </div>
                            )}
                          </td>
                          <td className="fw-bold">{product.name}</td>
                          <td style={{ maxWidth: '200px' }}>
                            {product.description?.substring(0, 50)}...
                          </td>
                          <td>{product.purchasePrice} €</td>
                          <td>{product.sellingPrice} €</td>
                          <td>
                            <span className={product.quantity < 10 ? 'text-danger fw-bold' : ''}>
                              {product.quantity}
                            </span>
                          </td>
                          <td>{product.category?.name || '-'}</td>
                          <td>
                            <Button 
                              variant="warning" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEdit(product)}
                              style={{ borderRadius: '8px' }}
                            >
                              Modifier
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              style={{ borderRadius: '8px' }}
                            >
                              Supprimer
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <small style={{ color: '#4a5a5a' }}>
                      Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, products.length)} sur {products.length} produits
                    </small>
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.First 
                      onClick={() => handlePageChange(1)} 
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />
                    {renderPagination()}
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPages)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Modal Ajout/Modification - inchangé */}
          <Modal show={showModal} onHide={resetForm} size="lg" centered>
            {/* ... contenu du modal inchangé ... */}
            <Modal.Header closeButton style={{ borderBottom: '1px solid #e0e0e0' }}>
              <Modal.Title style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body style={{ padding: '1.5rem' }}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Nom du produit *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Smartphone Galaxy S23"
                        style={{ borderRadius: '10px', padding: '10px 15px' }}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Description détaillée du produit..."
                        style={{ borderRadius: '10px', padding: '10px 15px' }}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Prix d'achat (€) *</Form.Label>
                        <Form.Control
                          type="number"
                          name="purchasePrice"
                          step="0.01"
                          required
                          value={formData.purchasePrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          style={{ borderRadius: '10px', padding: '10px 15px' }}
                        />
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Prix de vente (€) *</Form.Label>
                        <Form.Control
                          type="number"
                          name="sellingPrice"
                          step="0.01"
                          required
                          value={formData.sellingPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          style={{ borderRadius: '10px', padding: '10px 15px' }}
                        />
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Stock (nombre d'unités) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="0"
                        style={{ borderRadius: '10px', padding: '10px 15px' }}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Catégorie</Form.Label>
                      <Form.Select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        style={{ borderRadius: '10px', padding: '10px 15px' }}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Image du produit</Form.Label>
                      <div style={{ 
                        border: '2px dashed #b8d4d4', 
                        borderRadius: '12px', 
                        padding: '1rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#faf7f0'
                      }}>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'block' }}>
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              style={{ 
                                width: '100%', 
                                maxHeight: '150px', 
                                objectFit: 'cover', 
                                borderRadius: '8px' 
                              }}
                            />
                          ) : (
                            <div style={{ padding: '1rem' }}>
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4aa3a3" strokeWidth="1.5">
                                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="2.5"/>
                                <path d="M21 15l-5-5-6 6-3-3-4 4"/>
                              </svg>
                              <p style={{ color: '#4aa3a3', marginTop: '8px', fontSize: '12px' }}>
                                Cliquez pour uploader
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                      <small className="text-muted d-block mt-2">
                        Formats acceptés: JPG, PNG, GIF
                      </small>
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', padding: '1rem 1.5rem' }}>
                <Button 
                  variant="secondary" 
                  onClick={resetForm}
                  style={{ borderRadius: '40px', padding: '8px 24px' }}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="btn-teal"
                  style={{ borderRadius: '40px', padding: '8px 32px' }}
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : (editingProduct ? 'Modifier' : 'Ajouter')}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
    </>
  );
};

export default ProductManagement;