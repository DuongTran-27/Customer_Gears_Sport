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

class CategoryProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categoryName: '',
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchCategoryProducts();
  }

  componentDidUpdate(prevProps) {
    const prevId = this.getCategoryId(prevProps);
    const currentId = this.getCategoryId(this.props);
    if (prevId !== currentId) {
      this.fetchCategoryProducts();
    }
  }

  getCategoryId = () => {
    const path = window.location.pathname;
    return decodeURIComponent(path.split('/category/')[1] || '');
  };

  fetchCategoryProducts = async () => {
    const categoryId = this.getCategoryId();
    this.setState({ loading: true });

    try {
      const res = await api.get('/products');
      const products = res.data.filter((p) => {
        if (!p.category) return false;
        if (typeof p.category === 'object') {
          return p.category._id === categoryId || p.category.name === categoryId;
        }
        return p.category === categoryId || p.category.toLowerCase() === categoryId.toLowerCase();
      });
      // Get category display name
      let catName = categoryId;
      if (products.length > 0) {
        catName = getCategoryName(products[0].category);
      }
      this.setState({ products, categoryName: catName, loading: false });
    } catch (err) {
      console.error('Failed to fetch products', err);
      this.setState({ loading: false });
    }
  };

  render() {
    const { products, categoryName, loading } = this.state;

    return (
      <div className="products-page">
        <div className="products-container">
          <div className="products-header">
            <h1 className="products-title">{categoryName || 'Danh mục'}</h1>
            <p className="products-count">{products.length} sản phẩm</p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>Không có sản phẩm trong danh mục này</h3>
              <Link to="/products" className="btn btn-primary">Xem tất cả sản phẩm</Link>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
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

export default CategoryProducts;
