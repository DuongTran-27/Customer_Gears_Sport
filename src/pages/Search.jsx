import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// Helper to format VND currency
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ';
  return Number(price).toLocaleString('vi-VN') + 'đ';
};

// Helper to get category name
const getCategoryName = (category) => {
  if (!category) return 'Gear';
  if (typeof category === 'object' && category.name) return category.name;
  if (typeof category === 'string' && category.length < 30) return category;
  return 'Gear';
};

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      loading: true,
      keyword: '',
    };
  }

  componentDidMount() {
    this.performSearch();
  }

  componentDidUpdate() {
    const newKeyword = this.getKeyword();
    if (newKeyword !== this.state.keyword) {
      this.performSearch();
    }
  }

  getKeyword = () => {
    const path = window.location.pathname;
    return decodeURIComponent(path.split('/search/')[1] || '');
  };

  performSearch = async () => {
    const keyword = this.getKeyword();
    this.setState({ loading: true, keyword });

    try {
      const res = await api.get(`/products/search/${keyword}`);
      this.setState({ results: res.data, loading: false });
    } catch (err) {
      console.error('Search failed', err);
      // Fallback: search from all products
      try {
        const res = await api.get('/products');
        const filtered = res.data.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(keyword.toLowerCase())) ||
            (p.category && typeof p.category === 'string' && p.category.toLowerCase().includes(keyword.toLowerCase())) ||
            (p.category && typeof p.category === 'object' && p.category.name && p.category.name.toLowerCase().includes(keyword.toLowerCase()))
        );
        this.setState({ results: filtered, loading: false });
      } catch (e) {
        this.setState({ results: [], loading: false });
      }
    }
  };

  render() {
    const { results, loading, keyword } = this.state;

    return (
      <div className="products-page">
        <div className="products-container">
          <div className="products-header">
            <h1 className="products-title">
              Kết quả tìm kiếm cho "<span className="highlight">{keyword}</span>"
            </h1>
            <p className="products-count">{results.length} kết quả</p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <h3>Không tìm thấy kết quả</h3>
              <p>Thử tìm kiếm với từ khóa khác</p>
              <Link to="/products" className="btn btn-primary">Xem tất cả sản phẩm</Link>
            </div>
          ) : (
            <div className="product-grid">
              {results.map((product) => (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  className="product-card"
                >
                  <div className="product-card-image">
                    <img
                      src={product.image || 'https://via.placeholder.com/400x400?text=Product'}
                      alt={product.name}
                    />
                    <div className="product-card-hover">
                      <span>Xem sản phẩm</span>
                    </div>
                  </div>
                  <div className="product-card-info">
                    <span className="product-card-category">{getCategoryName(product.category)}</span>
                    <h3 className="product-card-name">{product.name}</h3>
                    <p className="product-card-price">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Search;
