import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// Helper to format VND currency
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ';
  return Number(price).toLocaleString('vi-VN') + 'đ';
};

// Helper to get category name using a lookup map
const getCategoryName = (category, catLookup) => {
  if (!category) return 'Gear';
  if (typeof category === 'object' && category.name) return category.name;
  if (typeof category === 'string' && catLookup && catLookup.has(category)) {
    return catLookup.get(category);
  }
  if (typeof category === 'string' && category.length < 30) return category;
  return 'Gear';
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      featuredProducts: [],
      catLookup: new Map(),
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchProducts();
  }

  fetchProducts = async () => {
    try {
      // Fetch categories for ID→name lookup
      let catLookup = new Map();
      try {
        const catRes = await api.get('/categories');
        if (Array.isArray(catRes.data)) {
          catRes.data.forEach((c) => catLookup.set(c._id, c.name));
        }
      } catch (e) { /* categories endpoint not available */ }

      const res = await api.get('/products');
      this.setState({ featuredProducts: res.data.slice(0, 8), catLookup, loading: false });
    } catch (err) {
      console.error('Failed to fetch products', err);
      this.setState({ loading: false });
    }
  };

  render() {
    const { featuredProducts, catLookup, loading } = this.state;

    return (
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <span className="hero-subtitle">GEARS SPORT</span>
            <h1 className="hero-title">JUST DO IT</h1>
            <p className="hero-description">
              Khám phá bộ sưu tập mới nhất về trang phục thể thao, giày dép và phụ kiện.
              Nâng tầm phong cách của bạn.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">Mua ngay</Link>
              <Link to="/products" className="btn btn-outline">Khám phá</Link>
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="home-section">
          <div className="section-container">
            <div className="category-cards">
              <div className="category-card">
                <div className="category-card-overlay"></div>
                <div className="category-card-content">
                  <h3>Chạy bộ</h3>
                  <Link to="/products" className="btn btn-small">Mua</Link>
                </div>
              </div>
              <div className="category-card">
                <div className="category-card-overlay"></div>
                <div className="category-card-content">
                  <h3>Tập luyện</h3>
                  <Link to="/products" className="btn btn-small">Mua</Link>
                </div>
              </div>
              <div className="category-card">
                <div className="category-card-overlay"></div>
                <div className="category-card-content">
                  <h3>Phong cách</h3>
                  <Link to="/products" className="btn btn-small">Mua</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="home-section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <Link to="/products" className="section-link">Xem tất cả →</Link>
            </div>
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="product-grid">
                {featuredProducts.map((product) => (
                  <Link
                    to={`/product/${product.slug || product._id}`}
                    key={product._id}
                    className="product-card"
                  >
                    <div className="product-card-image">
                      <img
                        src={product.image || 'https://via.placeholder.com/400x400?text=Product'}
                        alt={product.name}
                      />
                    </div>
                    <div className="product-card-info">
                      <span className="product-card-category">{getCategoryName(product.category, catLookup)}</span>
                      <h3 className="product-card-name">{product.name}</h3>
                      <p className="product-card-price">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Membership Banner */}
        <section className="membership-section">
          <div className="membership-content">
            <h2>TRỞ THÀNH THÀNH VIÊN</h2>
            <p>Đăng ký miễn phí. Tham gia cộng đồng để nhận sản phẩm mới nhất, cảm hứng và câu chuyện.</p>
            <Link to="/signup" className="btn btn-primary">Tham gia ngay</Link>
          </div>
        </section>
      </div>
    );
  }
}

export default Home;
