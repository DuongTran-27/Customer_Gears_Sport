import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../utils/api';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKeyword: '',
      categories: [],
      mobileMenuOpen: false,
      redirectToSearch: false,
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories = async () => {
    try {
      const res = await api.get('/products');
      const products = res.data;
      // Extract unique categories with their names
      const catMap = new Map();
      products.forEach((p) => {
        if (p.category) {
          if (typeof p.category === 'object' && p.category.name) {
            // Category is populated object with name
            catMap.set(p.category._id, p.category.name);
          } else if (typeof p.category === 'string') {
            // Category is a string ID - try to find name from product's categoryName or use ID
            const catName = p.categoryName || p.category_name || null;
            if (catName) {
              catMap.set(p.category, catName);
            } else {
              catMap.set(p.category, p.category);
            }
          }
        }
      });
      const cats = [...catMap.entries()].slice(0, 5);
      this.setState({ categories: cats });
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  handleSearchChange = (e) => {
    this.setState({ searchKeyword: e.target.value });
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    if (this.state.searchKeyword.trim()) {
      this.setState({ redirectToSearch: true });
    }
  };

  toggleMobileMenu = () => {
    this.setState((prev) => ({ mobileMenuOpen: !prev.mobileMenuOpen }));
  };

  render() {
    const { isLoggedIn, showActivePage, currentPath } = this.props;
    const { searchKeyword, categories, mobileMenuOpen, redirectToSearch } = this.state;

    if (redirectToSearch) {
      this.setState({ redirectToSearch: false });
      return <Navigate to={`/search/${searchKeyword}`} />;
    }

    const isHomePage = currentPath === '/';

    return (
      <header className="header">
        {/* Top Bar */}
        <div className="header-top-bar">
          <div className="header-top-content">
            <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
            <div className="header-top-links">
              <Link to="/products">Tìm cửa hàng</Link>
              <span className="divider">|</span>
              <Link to="/">Trợ giúp</Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="header-main">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="header-logo">
              <svg viewBox="0 0 69 32" className="nike-logo">
                <path
                  d="M68.56 4L18.4 25.36Q12.16 28 7.92 28q-4.8 0-6.48-3.36-1.2-2.4.24-6.24t5.04-7.6l3.84 1.68Q4.32 19.92 4.32 22.8q0 3.6 5.28 1.2L66.8.56z"
                  fill="currentColor"
                />
              </svg>
            </Link>

            {/* Navigation - No Home link */}
            <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`}>
              <Link to="/products" className="nav-link" onClick={() => this.setState({ mobileMenuOpen: false })}>
                Sản phẩm
              </Link>
              {categories.map(([catId, catName]) => (
                <Link
                  key={catId}
                  to={`/category/${catId}`}
                  className="nav-link"
                  onClick={() => this.setState({ mobileMenuOpen: false })}
                >
                  {catName}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="header-actions">
              {/* Search - only on home page */}
              {isHomePage && (
                <form className="header-search" onSubmit={this.handleSearchSubmit}>
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm kiếm"
                    value={searchKeyword}
                    onChange={this.handleSearchChange}
                    className="search-input"
                  />
                </form>
              )}

              {/* Auth Links */}
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="header-action-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="action-icon">
                      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                  </Link>
                  <Link to="/signup" className="header-action-link signup-link">Đăng ký</Link>
                  {showActivePage && (
                    <Link to="/active" className="header-action-link active-link">Kích hoạt</Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/profile" className="header-action-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="action-icon">
                      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                  </Link>
                  <Link to="/wishlist" className="header-action-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="action-icon">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </Link>
                </>
              )}

              {/* Cart */}
              <Link to="/cart" className="header-action-link cart-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="action-icon">
                  <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </Link>

              {/* Mobile Menu Toggle */}
              <button className="mobile-menu-toggle" onClick={this.toggleMobileMenu}>
                <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
