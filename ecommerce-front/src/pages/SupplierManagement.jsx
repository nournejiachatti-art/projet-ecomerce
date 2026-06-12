import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert, Pagination } from 'react-bootstrap';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';

const SupplierManagement = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: ''
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
    
    loadSuppliers();
  }, [navigate]);

  const loadSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getSuppliers(token);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = suppliers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(suppliers.length / itemsPerPage);

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
      
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData, token);
        setAlert({ type: 'success', message: 'Fournisseur modifié avec succès' });
      } else {
        await createSupplier(formData, token);
        setAlert({ type: 'success', message: 'Fournisseur ajouté avec succès' });
      }
      
      await loadSuppliers();
      resetForm();
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.error || 'Erreur lors de l\'opération' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address || '',
      taxNumber: supplier.taxNumber || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await deleteSupplier(id, token);
        await loadSuppliers();
        setAlert({ type: 'success', message: 'Fournisseur supprimé avec succès' });
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
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      taxNumber: ''
    });
    setEditingSupplier(null);
    setShowModal(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <Container fluid className="py-4" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>Gestion des Fournisseurs</h1>
              <p style={{ color: '#4a5a5a' }}>Gérez vos fournisseurs et leurs informations</p>
            </div>
            <Button className="btn-teal" onClick={() => setShowModal(true)}>
              + Ajouter un fournisseur
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
                      <th>Nom société</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Adresse</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4" style={{ color: '#4a5a5a' }}>
                          Aucun fournisseur trouvé
                        </td>
                      </tr>
                    ) : (
                      currentSuppliers.map((supplier) => (
                        <tr key={supplier.id}>
                          <td>{supplier.id}</td>
                          <td className="fw-bold">{supplier.companyName}</td>
                          <td>{supplier.contactPerson}</td>
                          <td>{supplier.email}</td>
                          <td>{supplier.phone}</td>
                          <td>{supplier.address}</td>
                          <td>
                            <Button 
                              variant="warning" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEdit(supplier)}
                              style={{ borderRadius: '8px' }}
                            >
                              Modifier
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDelete(supplier.id)}
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
                      Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, suppliers.length)} sur {suppliers.length} fournisseurs
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
                {editingSupplier ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body style={{ padding: '1.5rem' }}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Nom de la société *</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Personne de contact *</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Téléphone *</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Adresse</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Numéro TVA</Form.Label>
                    <Form.Control
                      type="text"
                      name="taxNumber"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#2c4a5e', fontWeight: '500' }}>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Laissez vide pour ne pas modifier"
                    onChange={handleChange}
                    style={{ borderRadius: '10px', padding: '10px 15px' }}
                  />
                  <small className="text-muted">Requis uniquement pour la création</small>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', padding: '1rem 1.5rem' }}>
                <Button variant="secondary" onClick={resetForm} style={{ borderRadius: '40px', padding: '8px 24px' }}>
                  Annuler
                </Button>
                <Button type="submit" className="btn-teal" style={{ borderRadius: '40px', padding: '8px 32px' }}>
                  {editingSupplier ? 'Modifier' : 'Ajouter'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
    </>
  );
};

export default SupplierManagement;