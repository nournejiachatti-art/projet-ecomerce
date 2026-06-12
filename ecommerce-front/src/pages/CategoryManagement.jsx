import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert, Pagination } from 'react-bootstrap';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: ''
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
    
    loadCategories();
  }, [navigate]);

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getCategories(token);
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

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
      const categoryData = {
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId ? parseInt(formData.parentId) : null
      };
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData, token);
        setAlert({ type: 'success', message: 'Catégorie modifiée avec succès' });
      } else {
        await createCategory(categoryData, token);
        setAlert({ type: 'success', message: 'Catégorie ajoutée avec succès' });
      }
      
      await loadCategories();
      resetForm();
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.error || 'Erreur lors de l\'opération' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentCategory?.id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await deleteCategory(id, token);
        await loadCategories();
        setAlert({ type: 'success', message: 'Catégorie supprimée avec succès' });
      } catch (error) {
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
      parentId: ''
    });
    setEditingCategory(null);
    setShowModal(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Container fluid className="py-4" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>Gestion des Catégories</h1>
              <p style={{ color: '#4a5a5a' }}>Gérez l'arborescence de vos catégories</p>
            </div>
            <Button className="btn-teal" onClick={() => setShowModal(true)}>
              + Nouvelle catégorie
            </Button>
          </div>

          {alert && <Alert variant={alert.type} className="mb-4" style={{ borderRadius: '12px' }}>{alert.message}</Alert>}

          <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr style={{ color: '#4a5a5a', borderBottom: '2px solid #e0e0e0' }}>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Catégorie parente</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCategories.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4" style={{ color: '#4a5a5a' }}>
                          Aucune catégorie trouvée
                        </td>
                      </tr>
                    ) : (
                      currentCategories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td className="fw-bold">{category.name}</td>
                          <td>{category.description}</td>
                          <td>{category.parentCategory?.name || '-'}</td>
                          <td>
                            <span className={`badge ${category.enabled ? 'bg-success' : 'bg-secondary'}`}>
                              {category.enabled ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td>
                            <Button 
                              variant="warning" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEdit(category)}
                              style={{ borderRadius: '8px' }}
                            >
                              Modifier
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDelete(category.id)}
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
                      Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, categories.length)} sur {categories.length} catégories
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

          {/* Modal Ajout/Modification */}
          <Modal show={showModal} onHide={resetForm} size="lg" centered>
            <Modal.Header closeButton style={{ borderBottom: '1px solid #e0e0e0' }}>
              <Modal.Title style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>
                {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body style={{ padding: '1.5rem' }}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Nom de la catégorie *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                      placeholder="Ex: Électronique"
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                      placeholder="Description de la catégorie..."
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Catégorie parente</Form.Label>
                    <Form.Select
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    >
                      <option value="">Aucune (catégorie racine)</option>
                      {categories.filter(c => c.id !== editingCategory?.id).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Form.Select>
                    <small className="text-muted">Laissez vide pour une catégorie principale</small>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', padding: '1rem 1.5rem' }}>
                <Button variant="secondary" onClick={resetForm} style={{ borderRadius: '40px', padding: '8px 24px' }}>
                  Annuler
                </Button>
                <Button type="submit" className="btn-teal" style={{ borderRadius: '40px', padding: '8px 32px' }}>
                  {editingCategory ? 'Modifier' : 'Ajouter'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
    </>
  );
};

export default CategoryManagement;