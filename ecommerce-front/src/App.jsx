import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import SupplierManagement from './pages/SupplierManagement';
import SupplierInvoicePage from './pages/SupplierInvoicePage';
import CategoryManagement from './pages/CategoryManagement';
import UserManagement from './pages/UserManagement';
import AdminOrdersPage from './pages/AdminOrdersPage';
import MyOrdersPage from './pages/MyOrdersPage';
function App() {
  return (
    <Routes>
      {/* Routes admin sans navbar/footer */}
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/manage-users" element={<UserManagement />} />
      <Route path="/manage-categories" element={<CategoryManagement />} />
      <Route path="/manage-products" element={<ProductManagement />} />
      <Route path="/manage-suppliers" element={<SupplierManagement />} />
      <Route path="/supplier-invoice" element={<SupplierInvoicePage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      
      {/* Routes client avec navbar/footer */}
      <Route path="/" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <HomePage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/about" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <AboutPage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/contact" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <ContactPage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/products" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <ProductsPage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/product/:id" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <ProductDetailPage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/cart" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <CartPage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/checkout" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <CheckoutPage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/my-orders" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <MyOrdersPage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/login" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <LoginPage />
          </main>
          <Footer />
        </>
      } />
      <Route path="/signup" element={
        <>
          <Navbar />
          <main className="flex-grow-1">
            <SignupPage />
          </main>
          <Footer />
        </>
      } />
    </Routes>
  );
}

export default App;