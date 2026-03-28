import React, { Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Active from './pages/Active';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Products from './pages/Products';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Search from './pages/Search';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: !!localStorage.getItem('token'),
      userId: localStorage.getItem('_id') || '',
      showActivePage: false,
      currentPath: window.location.pathname,
    };
  }

  componentDidMount() {
    // Listen for route changes to update currentPath
    this._unlisten = null;
    const checkPath = () => {
      const path = window.location.pathname;
      if (path !== this.state.currentPath) {
        this.setState({ currentPath: path });
      }
    };
    // Poll for path changes (simple approach for class components)
    this._pathInterval = setInterval(checkPath, 200);
  }

  componentWillUnmount() {
    if (this._pathInterval) clearInterval(this._pathInterval);
  }

  handleLogin = (id, token) => {
    localStorage.setItem('_id', id);
    localStorage.setItem('token', token);
    this.setState({ isLoggedIn: true, userId: id });
  };

  handleLogout = () => {
    localStorage.removeItem('_id');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    this.setState({ isLoggedIn: false, userId: '' });
  };

  handleSignupSuccess = () => {
    this.setState({ showActivePage: true });
  };

  render() {
    const { isLoggedIn, userId, showActivePage, currentPath } = this.state;

    return (
      <div className="app">
        <Header
          isLoggedIn={isLoggedIn}
          showActivePage={showActivePage}
          onLogout={this.handleLogout}
          currentPath={currentPath}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/signup"
              element={<Signup onSignupSuccess={this.handleSignupSuccess} />}
            />
            <Route path="/active" element={<Active />} />
            <Route
              path="/login"
              element={<Login onLogin={this.handleLogin} />}
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Profile userId={userId} onLogout={this.handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route path="/products" element={<Products />} />
            <Route path="/category/:slug" element={<CategoryProducts />} />
            <Route
              path="/product/:slug"
              element={<ProductDetail isLoggedIn={isLoggedIn} />}
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Checkout userId={userId} />
                </ProtectedRoute>
              }
            />
            <Route path="/search/:keyword" element={<Search />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }
}

export default App;
