import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Table, Alert, Badge } from 'react-bootstrap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getMyOrders } from '../services/api';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
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
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5">
      <h1 className="mb-4" style={{ color: 'var(--navy)', fontFamily: 'Playfair Display' }}>Mes Commandes</h1>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <p style={{ color: 'var(--warm-gray)' }}>Vous n'avez pas encore passé de commande</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Commande: {order.orderNumber}</strong>
                  <span className="ms-3 text-muted">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </Card.Header>
              <Card.Body>
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Prix</th>
                      <th>Quantité</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product.name}</td>
                        <td>{item.priceAtTime.toFixed(2)} €</td>
                        <td>{item.quantity}</td>
                        <td>{(item.priceAtTime * item.quantity).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="mt-3 text-end">
                  <strong>Total: {order.totalAmount.toFixed(2)} €</strong>
                </div>
                {order.shippingAddress && (
                  <div className="mt-2 text-muted small">
                    Livraison: {order.shippingAddress}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default MyOrdersPage;
