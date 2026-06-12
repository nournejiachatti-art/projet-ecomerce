import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT du localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== PRODUITS PUBLICS ====================
export const getPublicProducts = () => api.get('/public/products');
export const getPublicProductById = (id) => api.get(`/public/products/${id}`);

// ==================== AUTH ====================
export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (userData) => api.post('/auth/signup', userData);
export const verifyAccount = (email, code) => api.post('/auth/verify', { email, code });
export const adminLogin = (email, password) => api.post('/auth/admin/login', { email, password });

// ==================== PANIER ====================
export const getCart = () => api.get('/cart/me');
export const addToCart = (productId, quantity) => api.post('/cart/add', { productId, quantity });
export const updateCartItem = (productId, quantity) => api.put('/cart/update', { productId, quantity });
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const clearCart = () => api.delete('/cart/clear');

// ==================== COMMANDES ====================
export const checkout = (shippingAddress, phoneNumber) => api.post('/cart/checkout', { shippingAddress, phoneNumber });
export const verifyOrder = (orderNumber, verificationCode) => api.post('/cart/verify-order', { orderNumber, verificationCode });
export const getMyOrders = () => api.get('/cart/my-orders');
export const getOrderDetail = (orderNumber) => api.get(`/cart/order/${orderNumber}`);

// ==================== ADMIN - CATEGORIES ====================
export const getCategories = (token) => 
  api.get('/admin/categories', { headers: { Authorization: `Bearer ${token}` } });

export const createCategory = (categoryData, token) => 
  api.post('/admin/categories', categoryData, { headers: { Authorization: `Bearer ${token}` } });

export const updateCategory = (id, categoryData, token) => 
  api.put(`/admin/categories/${id}`, categoryData, { headers: { Authorization: `Bearer ${token}` } });

export const deleteCategory = (id, token) => 
  api.delete(`/admin/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// ==================== ADMIN - PRODUITS ====================
export const getAdminProducts = (token) => 
  api.get('/admin/products', { headers: { Authorization: `Bearer ${token}` } });

export const createProduct = (productData, token) => 
  api.post('/admin/products', productData, { headers: { Authorization: `Bearer ${token}` } });

export const updateProduct = (id, productData, token) => 
  api.put(`/admin/products/${id}`, productData, { headers: { Authorization: `Bearer ${token}` } });

export const deleteProduct = (id, token) => 
  api.delete(`/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const increaseQuantity = (id, quantity, token) => 
  api.put(`/admin/products/${id}/increase-quantity`, { quantity }, { headers: { Authorization: `Bearer ${token}` } });

export const decreaseQuantity = (id, quantity, token) => 
  api.put(`/admin/products/${id}/decrease-quantity`, { quantity }, { headers: { Authorization: `Bearer ${token}` } });

// ==================== ADMIN - FOURNISSEURS ====================
export const getSuppliers = (token) => 
  api.get('/admin/suppliers', { headers: { Authorization: `Bearer ${token}` } });

export const createSupplier = (supplierData, token) => 
  api.post('/admin/suppliers', supplierData, { headers: { Authorization: `Bearer ${token}` } });

export const updateSupplier = (id, supplierData, token) => 
  api.put(`/admin/suppliers/${id}`, supplierData, { headers: { Authorization: `Bearer ${token}` } });

export const deleteSupplier = (id, token) => 
  api.delete(`/admin/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// ==================== ADMIN - FACTURES ====================
export const getInvoices = (token) => 
  api.get('/admin/invoices', { headers: { Authorization: `Bearer ${token}` } });

export const createInvoice = (invoiceData, token) => 
  api.post('/admin/invoices', invoiceData, { headers: { Authorization: `Bearer ${token}` } });

export const deleteInvoice = (id, token) => 
  api.delete(`/admin/invoices/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// ==================== ADMIN - COMMANDES ====================
export const getAllOrders = (token) => 
  api.get('/admin/orders', { headers: { Authorization: `Bearer ${token}` } });

export const getOrdersByStatus = (status, token) => 
  api.get(`/admin/orders/status/${status}`, { headers: { Authorization: `Bearer ${token}` } });

export const updateOrderStatus = (orderNumber, status, token) => 
  api.put(`/admin/orders/${orderNumber}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });

export const validateOrder = (orderNumber, token) => 
  api.put(`/admin/orders/${orderNumber}/validate`, {}, { headers: { Authorization: `Bearer ${token}` } });

// ==================== ADMIN - UTILISATEURS ====================
export const getAllUsers = (token) => 
  api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } });

export const toggleUserStatus = (id, token) => 
  api.put(`/admin/users/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const deleteUser = (id, token) => 
  api.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export default api;