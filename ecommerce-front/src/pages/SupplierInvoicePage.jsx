import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert, Pagination } from 'react-bootstrap';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getSuppliers, getPublicProducts, createInvoice, getInvoices, deleteInvoice } from '../services/api';

const SupplierInvoicePage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [productItems, setProductItems] = useState([]);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: '',
    invoiceDate: ''
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
    try {
      const token = localStorage.getItem('token');
      const [suppliersRes, productsRes, invoicesRes] = await Promise.all([
        getSuppliers(token),
        getPublicProducts(),
        getInvoices(token)
      ]);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(invoices.length / itemsPerPage);

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

  const addProductItem = () => {
    setProductItems([...productItems, {
      id: Date.now(),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0
    }]);
  };

  const removeProductItem = (id) => {
    setProductItems(productItems.filter(item => item.id !== id));
  };

  const updateProductItem = (id, field, value) => {
    setProductItems(productItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const product = products.find(p => p.id === parseInt(value));
          updated.productName = product?.name || '';
          updated.unitPrice = product?.purchasePrice || 0;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (productItems.length === 0) {
      setAlert({ type: 'danger', message: 'Ajoutez au moins un produit à la facture' });
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const invoiceData = {
        invoiceNumber: formData.invoiceNumber,
        supplierId: parseInt(formData.supplierId),
        invoiceDate: formData.invoiceDate,
        products: productItems.map(item => ({
          productName: item.productName,
          productDescription: '',
          purchasePrice: item.unitPrice,
          quantity: item.quantity,
          sellingPrice: 0,
          categoryName: '',
          subCategoryName: null,
          imageUrl: null
        }))
      };
      
      await createInvoice(invoiceData, token);
      await loadData();
      resetForm();
      setAlert({ type: 'success', message: 'Facture créée avec succès' });
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.error || 'Erreur lors de la création' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await deleteInvoice(id, token);
        await loadData();
        setAlert({ type: 'success', message: 'Facture supprimée avec succès' });
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
      invoiceNumber: '',
      supplierId: '',
      invoiceDate: ''
    });
    setProductItems([]);
    setShowModal(false);
  };

  const totalInvoices = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <Container fluid className="py-4" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>Factures Fournisseurs</h1>
              <p style={{ color: '#4a5a5a' }}>Gérez les factures de vos fournisseurs</p>
            </div>
            <Button className="btn-teal" onClick={() => setShowModal(true)}>
              + Nouvelle facture
            </Button>
          </div>

          {/* Statistiques */}
          <Row className="g-4 mb-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Body>
                  <h6 className="text-muted mb-2">Total des factures</h6>
                  <h2 className="mb-0" style={{ color: '#1a6b6b' }}>{totalInvoices.toLocaleString()} €</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Body>
                  <h6 className="text-muted mb-2">Nombre de factures</h6>
                  <h2 className="mb-0" style={{ color: '#1a6b6b' }}>{invoices.length}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {alert && <Alert variant={alert.type} className="mb-4">{alert.message}</Alert>}

          <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr style={{ color: '#4a5a5a', borderBottom: '2px solid #e0e0e0' }}>
                      <th>N° Facture</th>
                      <th>Fournisseur</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoices.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">Aucune facture enregistrée</td>
                      </tr>
                    ) : (
                      currentInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="fw-bold">{invoice.invoiceNumber}</td>
                          <td>{invoice.supplier?.companyName || invoice.supplierName}</td>
                          <td>{invoice.totalAmount} €</td>
                          <td>{invoice.invoiceDate}</td>
                          <td>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteInvoice(invoice.id)}
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
                      Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, invoices.length)} sur {invoices.length} factures
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

          {/* Modal Création Facture - inchangé */}
          <Modal show={showModal} onHide={resetForm} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: '#2c4a5e' }}>Créer une facture fournisseur</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Numéro de facture</Form.Label>
                    <Form.Control
                      type="text"
                      name="invoiceNumber"
                      required
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Fournisseur</Form.Label>
                    <Form.Select
                      name="supplierId"
                      required
                      value={formData.supplierId}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.companyName}</option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Date de facture</Form.Label>
                    <Form.Control
                      type="date"
                      name="invoiceDate"
                      required
                      value={formData.invoiceDate}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <hr />
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Produits</h6>
                  <Button type="button" variant="outline-primary" size="sm" onClick={addProductItem}>
                    + Ajouter un produit
                  </Button>
                </div>
                
                {productItems.map((item) => (
                  <div key={item.id} className="p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <Row>
                      <Col md={5} className="mb-2">
                        <Form.Label>Produit</Form.Label>
                        <Form.Select
                          value={item.productId}
                          onChange={(e) => updateProductItem(item.id, 'productId', e.target.value)}
                          required
                        >
                          <option value="">Sélectionner</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={3} className="mb-2">
                        <Form.Label>Quantité</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateProductItem(item.id, 'quantity', parseInt(e.target.value))}
                          required
                        />
                      </Col>
                      <Col md={3} className="mb-2">
                        <Form.Label>Prix unitaire (€)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateProductItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                          required
                        />
                      </Col>
                      <Col md={1} className="mb-2 d-flex align-items-end">
                        <Button variant="danger" size="sm" onClick={() => removeProductItem(item.id)}>
                          X
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
                
                {productItems.length === 0 && (
                  <p className="text-muted text-center py-3">Aucun produit ajouté. Cliquez sur "Ajouter un produit"</p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" className="btn-teal">
                  Créer la facture
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
    </>
  );
};

export default SupplierInvoicePage;