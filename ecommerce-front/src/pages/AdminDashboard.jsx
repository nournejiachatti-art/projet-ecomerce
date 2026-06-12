import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  ResponsiveContainer
} from 'recharts';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getPublicProducts, getSuppliers, getInvoices, getAllOrders, getCategories } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    suppliers: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'ROLE_ADMIN') {
      navigate('/admin-login');
      return;
    }
    
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [productsRes, suppliersRes, invoicesRes, ordersRes, categoriesRes] = await Promise.all([
        getPublicProducts(),
        getSuppliers(token),
        getInvoices(token),
        getAllOrders(token),
        getCategories(token)
      ]);
      
      const products = productsRes.data;
      const lowStockCount = products.filter(p => p.quantity < 10).length;
      const totalRevenue = invoicesRes.data.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const pendingOrders = ordersRes.data.filter(o => o.status === 'PENDING').length;
      
      // Produits par catégorie
      const catMap = new Map();
      products.forEach(p => {
        const catName = p.category?.name || 'Sans catégorie';
        catMap.set(catName, (catMap.get(catName) || 0) + 1);
      });
      const catData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));
      setProductsByCategory(catData);
      
      // Chiffre d'affaires mensuel
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const revenueData = {};
      invoicesRes.data.forEach(inv => {
        const month = new Date(inv.createdAt).getMonth();
        revenueData[months[month]] = (revenueData[months[month]] || 0) + inv.totalAmount;
      });
      const monthlyData = months.map(m => ({ month: m, revenue: revenueData[m] || 0 }));
      setMonthlyRevenue(monthlyData);
      
      // Statut des commandes
      const statusCount = {
        PENDING: 0,
        VERIFIED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0
      };
      ordersRes.data.forEach(o => {
        statusCount[o.status] = (statusCount[o.status] || 0) + 1;
      });
      const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));
      setOrderStatusData(statusData);
      
      // Stock par catégorie
      const stockData = [];
      categoriesRes.data.forEach(cat => {
        const catProducts = products.filter(p => p.category?.id === cat.id);
        const totalStock = catProducts.reduce((sum, p) => sum + p.quantity, 0);
        if (totalStock > 0) {
          stockData.push({ name: cat.name, stock: totalStock });
        }
      });
      setStockStatus(stockData.slice(0, 6));
      
      setStats({
        products: products.length,
        suppliers: suppliersRes.data.length,
        orders: ordersRes.data.length,
        revenue: totalRevenue,
        pendingOrders: pendingOrders,
        lowStock: lowStockCount
      });
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#1a6b6b', '#2d8c8c', '#4aa3a3', '#7d9d8c', '#9cae8c', '#b8d4d4'];

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <Container fluid className="py-4" style={{ marginLeft: '240px' }}>
          {/* Header */}
          <div className="mb-4">
            <h1 style={{ color: '#2c4a5e', fontFamily: 'Playfair Display' }}>Tableau de bord</h1>
            <p style={{ color: '#4a5a5a' }}>Bienvenue dans votre espace d'administration</p>
          </div>
          
          {/* Cartes KPI */}
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1a6b6b, #2d8c8c)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-2 opacity-75">Total Produits</h6>
                      <h2 className="mb-0 fw-bold">{stats.products}</h2>
                    </div>
                    <div style={{ fontSize: '2rem', opacity: 0.8 }}>📦</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #2d8c8c, #4aa3a3)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-2 opacity-75">Fournisseurs</h6>
                      <h2 className="mb-0 fw-bold">{stats.suppliers}</h2>
                    </div>
                    <div style={{ fontSize: '2rem', opacity: 0.8 }}>🤝</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #7d9d8c, #9cae8c)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-2 opacity-75">Commandes</h6>
                      <h2 className="mb-0 fw-bold">{stats.orders}</h2>
                      <small className="opacity-75">En attente: {stats.pendingOrders}</small>
                    </div>
                    <div style={{ fontSize: '2rem', opacity: 0.8 }}>📋</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #b8d4d4, #2d8c8c)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-2 opacity-75">Chiffre d'affaires</h6>
                      <h2 className="mb-0 fw-bold">{stats.revenue.toLocaleString()} €</h2>
                    </div>
                    <div style={{ fontSize: '2rem', opacity: 0.8 }}>💰</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Graphiques */}
          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Header style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', borderRadius: '16px 16px 0 0' }}>
                  <h6 className="mb-0" style={{ color: '#2c4a5e' }}>Chiffre d'affaires mensuel</h6>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#4a5a5a" />
                      <YAxis stroke="#4a5a5a" />
                      <Tooltip 
                        formatter={(value) => `${value.toLocaleString()} €`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        name="CA (€)"
                        stroke="#2d8c8c" 
                        fill="#2d8c8c" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Header style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', borderRadius: '16px 16px 0 0' }}>
                  <h6 className="mb-0" style={{ color: '#2c4a5e' }}>Produits par catégorie</h6>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productsByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {productsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Header style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', borderRadius: '16px 16px 0 0' }}>
                  <h6 className="mb-0" style={{ color: '#2c4a5e' }}>Statut des commandes</h6>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={orderStatusData.filter(d => d.value > 0)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis type="number" stroke="#4a5a5a" />
                      <YAxis type="category" dataKey="name" stroke="#4a5a5a" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" name="Nombre de commandes" fill="#2d8c8c" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Header style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', borderRadius: '16px 16px 0 0' }}>
                  <h6 className="mb-0" style={{ color: '#2c4a5e' }}>Stock par catégorie</h6>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stockStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#4a5a5a" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#4a5a5a" />
                      <Tooltip />
                      <Bar dataKey="stock" name="Unités en stock" fill="#7d9d8c" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Alertes */}
          {(stats.lowStock > 0 || stats.pendingOrders > 0) && (
            <Row className="mb-4">
              <Col>
                <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <Card.Body>
                    <h6 className="mb-3" style={{ color: '#2c4a5e' }}>Alertes</h6>
                    {stats.lowStock > 0 && (
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f0ad4e' }}></div>
                        <span style={{ color: '#4a5a5a' }}>{stats.lowStock} produits avec stock bas (&lt; 10 unités)</span>
                      </div>
                    )}
                    {stats.pendingOrders > 0 && (
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d9534f' }}></div>
                        <span style={{ color: '#4a5a5a' }}>{stats.pendingOrders} commandes en attente de validation</span>
                        <Button 
                          size="sm" 
                          className="ms-auto"
                          style={{ backgroundColor: '#2d8c8c', border: 'none', borderRadius: '40px' }}
                          onClick={() => navigate('/admin/orders')}
                        >
                          Voir les commandes
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Commandes récentes */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Header style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', borderRadius: '16px 16px 0 0' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0" style={{ color: '#2c4a5e' }}>Commandes récentes</h6>
                    <Button 
                      size="sm" 
                      style={{ backgroundColor: '#2d8c8c', border: 'none', borderRadius: '40px' }}
                      onClick={() => navigate('/admin/orders')}
                    >
                      Voir toutes
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {recentOrders.length === 0 ? (
                    <p className="text-center text-muted py-4">Aucune commande récente</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr style={{ color: '#4a5a5a' }}>
                            <th>N° Commande</th>
                            <th>Client</th>
                            <th>Total</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id}>
                              <td className="fw-bold">{order.orderNumber}</td>
                              <td>{order.user?.email || 'N/A'}</td>
                              <td>{order.totalAmount} €</td>
                              <td>
                                <span className={`badge ${order.status === 'VERIFIED' ? 'bg-success' : order.status === 'PENDING' ? 'bg-warning' : 'bg-secondary'}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td>
                                <Button 
                                  size="sm" 
                                  variant="outline-primary"
                                  style={{ borderRadius: '40px' }}
                                  onClick={() => navigate(`/admin/orders/${order.orderNumber}`)}
                                >
                                  Détail
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
    </>
  );
};

export default AdminDashboard;