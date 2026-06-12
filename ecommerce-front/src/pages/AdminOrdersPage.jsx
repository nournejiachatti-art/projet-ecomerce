import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Modal, Form } from 'react-bootstrap';
import Sidebar from '../components/admin/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAllOrders, updateOrderStatus, validateOrder } from '../services/api';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'ROLE_ADMIN') {
      navigate('/admin-login');
      return;
    }
    
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getAllOrders(token);
      setOrders(response.data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setAlert({ type: 'danger', message: 'Erreur lors du chargement des commandes' });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOrder = async (orderNumber) => {
    try {
      const token = localStorage.getItem('token');
      await validateOrder(orderNumber, token);
      await loadOrders();
      setAlert({ type: 'success', message: 'Commande validée avec succès' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erreur lors de la validation' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      const token = localStorage.getItem('token');
      await updateOrderStatus(selectedOrder.orderNumber, newStatus, token);
      await loadOrders();
      setAlert({ type: 'success', message: 'Statut mis à jour avec succès' });
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erreur lors de la mise à jour' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': 'warning',
      'VERIFIED': 'info',
      'PROCESSING': 'primary',
      'SHIPPED': 'secondary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    const labels = {
      'PENDING': 'En attente',
      'VERIFIED': 'Vérifiée',
      'PROCESSING': 'En traitement',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return { variant: variants[status] || 'secondary', label: labels[status] || status };
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    verified: orders.filter(o => o.status === 'VERIFIED').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Container fluid className="py-4" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
          <div className="mb-4">
            <h1 style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>Gestion des commandes</h1>
            <p style={{ color: '#4a5a5a' }}>Consultez et gérez toutes les commandes clients</p>
          </div>

          {alert && (
            <Alert variant={alert.type} className="mb-4" style={{ borderRadius: '12px' }}>
              {alert.message}
            </Alert>
          )}

          {/* Statistiques */}
          <Row className="g-4 mb-4">
            <Col lg={2} md={4} sm={6}>
              <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '16px' }}>
                <Card.Body>
                  <h3 style={{ color: '#2c4a5e' }}>{stats.total}</h3>
                  <p className="mb-0 text-muted">Total</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={2} md={4} sm={6}>
              <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '16px', borderLeft: '4px solid #f0ad4e' }}>
                <Card.Body>
                  <h3 style={{ color: '#f0ad4e' }}>{stats.pending}</h3>
                  <p className="mb-0 text-muted">En attente</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={2} md={4} sm={6}>
              <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '16px', borderLeft: '4px solid #5bc0de' }}>
                <Card.Body>
                  <h3 style={{ color: '#5bc0de' }}>{stats.verified}</h3>
                  <p className="mb-0 text-muted">Vérifiées</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={2} md={4} sm={6}>
              <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '16px', borderLeft: '4px solid #0275d8' }}>
                <Card.Body>
                  <h3 style={{ color: '#0275d8' }}>{stats.processing}</h3>
                  <p className="mb-0 text-muted">En traitement</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={2} md={4} sm={6}>
              <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '16px', borderLeft: '4px solid #5cb85c' }}>
                <Card.Body>
                  <h3 style={{ color: '#5cb85c' }}>{stats.delivered}</h3>
                  <p className="mb-0 text-muted">Livrées</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filtres */}
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <Card.Body>
              <div className="d-flex gap-2 flex-wrap">
                <Button 
                  variant={filter === 'all' ? 'primary' : 'outline-secondary'}
                  style={{ borderRadius: '40px' }}
                  onClick={() => setFilter('all')}
                >
                  Toutes
                </Button>
                <Button 
                  variant={filter === 'PENDING' ? 'warning' : 'outline-secondary'}
                  style={{ borderRadius: '40px' }}
                  onClick={() => setFilter('PENDING')}
                >
                  En attente
                </Button>
                <Button 
                  variant={filter === 'VERIFIED' ? 'info' : 'outline-secondary'}
                  style={{ borderRadius: '40px' }}
                  onClick={() => setFilter('VERIFIED')}
                >
                  Vérifiées
                </Button>
                <Button 
                  variant={filter === 'PROCESSING' ? 'primary' : 'outline-secondary'}
                  style={{ borderRadius: '40px' }}
                  onClick={() => setFilter('PROCESSING')}
                >
                  En traitement
                </Button>
                <Button 
                  variant={filter === 'SHIPPED' ? 'secondary' : 'outline-secondary'}
                  style={{ borderRadius: '40px' }}
                  onClick={() => setFilter('SHIPPED')}
                >
                  Expédiées
                </Button>
                <Button 
                  variant={filter === 'DELIVERED' ? 'success' : 'outline-secondary'}
                  style={{ borderRadius: '40px' }}
                  onClick={() => setFilter('DELIVERED')}
                >
                  Livrées
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Liste des commandes */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr style={{ color: '#4a5a5a' }}>
                      <th>N° Commande</th>
                      <th>Client</th>
                      <th>Total</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          Aucune commande trouvée
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const { variant, label } = getStatusBadge(order.status);
                        return (
                          <tr key={order.id}>
                            <td className="fw-bold">{order.orderNumber}</td>
                            <td>{order.user?.email || 'N/A'}</td>
                            <td>{order.totalAmount} €</td>
                            <td>
                              <Badge bg={variant}>{label}</Badge>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline-primary"
                                  style={{ borderRadius: '40px' }}
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowDetailModal(true);
                                  }}
                                >
                                  Détail
                                </Button>
                                {order.status === 'PENDING' && (
                                  <Button 
                                    size="sm" 
                                    variant="success"
                                    style={{ borderRadius: '40px' }}
                                    onClick={() => handleValidateOrder(order.orderNumber)}
                                  >
                                    Valider
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline-secondary"
                                  style={{ borderRadius: '40px' }}
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus(order.status);
                                    setShowStatusModal(true);
                                  }}
                                >
                                  Changer statut
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Container>

      {/* Modal Détail Commande */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#2c4a5e' }}>
            Commande {selectedOrder?.orderNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6 style={{ color: '#2c4a5e' }}>Informations client</h6>
                  <p className="mb-1"><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p className="mb-1"><strong>Téléphone:</strong> {selectedOrder.phoneNumber || 'N/A'}</p>
                  <p className="mb-1"><strong>Adresse:</strong> {selectedOrder.shippingAddress}</p>
                </Col>
                <Col md={6}>
                  <h6 style={{ color: '#2c4a5e' }}>Informations commande</h6>
                  <p className="mb-1"><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p className="mb-1"><strong>Statut:</strong> <Badge bg={getStatusBadge(selectedOrder.status).variant}>{getStatusBadge(selectedOrder.status).label}</Badge></p>
                  <p className="mb-1"><strong>Total:</strong> {selectedOrder.totalAmount} €</p>
                </Col>
              </Row>
              <h6 style={{ color: '#2c4a5e' }}>Produits commandés</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Prix unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.product?.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.priceAtTime} €</td>
                        <td>{item.priceAtTime * item.quantity} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Changer Statut */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#2c4a5e' }}>Changer le statut</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nouveau statut</Form.Label>
            <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="PENDING">En attente</option>
              <option value="VERIFIED">Vérifiée</option>
              <option value="PROCESSING">En traitement</option>
              <option value="SHIPPED">Expédiée</option>
              <option value="DELIVERED">Livrée</option>
              <option value="CANCELLED">Annulée</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus}>
            Appliquer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminOrdersPage;