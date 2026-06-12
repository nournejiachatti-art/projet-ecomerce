import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Badge } from 'react-bootstrap';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAllUsers, toggleUserStatus, deleteUser } from '../services/api';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'ROLE_ADMIN') {
      navigate('/admin-login');
      return;
    }
    
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getAllUsers(token);
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await toggleUserStatus(id, token);
      await loadUsers();
      setAlert({ type: 'success', message: `Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès` });
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erreur lors de l\'opération' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await deleteUser(id, token);
        await loadUsers();
        setAlert({ type: 'success', message: 'Utilisateur supprimé avec succès' });
      } catch (error) {
        setAlert({ type: 'danger', message: 'Erreur lors de la suppression' });
      } finally {
        setLoading(false);
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'ROLE_ADMIN': return 'danger';
      case 'ROLE_CLIENT': return 'primary';
      case 'ROLE_SUPPLIER': return 'warning';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'ROLE_ADMIN': return 'Administrateur';
      case 'ROLE_CLIENT': return 'Client';
      case 'ROLE_SUPPLIER': return 'Fournisseur';
      default: return role;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Container fluid className="py-4" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
          <div className="mb-4">
            <h1 style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>Gestion des Utilisateurs</h1>
            <p style={{ color: '#4a5a5a' }}>Gérez les comptes clients, fournisseurs et administrateurs</p>
          </div>

          {alert && <Alert variant={alert.type} className="mb-4">{alert.message}</Alert>}

          <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr style={{ color: '#4a5a5a' }}>
                      <th>ID</th>
                      <th>Nom complet</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Date d'inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td className="fw-bold">{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || '-'}</td>
                        <td>
                          <Badge bg={getRoleBadgeColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={user.enabled ? 'success' : 'secondary'}>
                            {user.enabled ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant={user.enabled ? 'warning' : 'success'} 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleToggleStatus(user.id, user.enabled)}
                          >
                            {user.enabled ? 'Désactiver' : 'Activer'}
                          </Button>
                          {user.role !== 'ROLE_ADMIN' && (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Supprimer
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Container>
    </>
  );
};

export default UserManagement;