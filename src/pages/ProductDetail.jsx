import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// Helper to format VND currency
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Contact';
  return Number(price).toLocaleString('en-US') + '₫';
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

class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      selectedSize: '',
      quantity: 1,
      catLookup: new Map(),
      loading: true,
      addedToCart: false,
      addedToWishlist: false,
      activeTab: 'description',
    };
  }

  componentDidMount() {
    this.fetchProduct();
  }

  getProductSlug = () => {
    const path = window.location.pathname;
    return path.split('/product/')[1] || '';
  };

  fetchProduct = async () => {
    const slug = this.getProductSlug();
    // Fetch categories for ID→name lookup
    let catLookup = new Map();
    try {
      const catRes = await api.get('/categories');
      if (Array.isArray(catRes.data)) {
        catRes.data.forEach((c) => catLookup.set(c._id, c.name));
      }
    } catch (e) { /* categories endpoint not available */ }

    try {
      const res = await api.get(`/products/${slug}`);
      this.setState({ product: res.data, catLookup, loading: false });
    } catch (err) {
      // Try fetching all products and finding by Slug or ID
      try {
        const res = await api.get('/products');
        const product = res.data.find((p) => p.slug === slug || p._id === slug);
        this.setState({ product: product || null, catLookup, loading: false });
      } catch (e) {
        console.error('Failed to fetch product', e);
        this.setState({ loading: false });
      }
    }
  };

  handleAddToCart = () => {
    if (!this.props.isLoggedIn) {
      alert('Please login to add products to cart');
      return;
    }

    const { product, quantity, selectedSize } = this.state;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingIndex = cart.findIndex(
      (item) => item._id === product._id && item.size === selectedSize
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        size: selectedSize,
        quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.setState({ addedToCart: true });
    setTimeout(() => this.setState({ addedToCart: false }), 2000);
  };

  handleAddToWishlist = () => {
    if (!this.props.isLoggedIn) {
      alert('Please login to add products to wishlist');
      return;
    }

    const { product } = this.state;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

    if (wishlist.find((item) => item._id === product._id)) {
      alert('This product is already in your wishlist');
      return;
    }

    wishlist.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    this.setState({ addedToWishlist: true });
    setTimeout(() => this.setState({ addedToWishlist: false }), 2000);
  };

  render() {
    const { product, quantity, catLookup, loading, addedToCart, addedToWishlist, activeTab } = this.state;
    const { isLoggedIn } = this.props;

    if (loading) {
      return (
        <div className="page-container">
          <div className="loading-spinner"><div className="spinner"></div></div>
        </div>
      );
    }

    if (!product) {
      return (
        <div className="page-container">
          <div className="empty-state">
            <h3>Product not found</h3>
            <Link to="/products" className="btn btn-primary">View Products</Link>
          </div>
        </div>
      );
    }

    const categoryName = getCategoryName(product.category, catLookup);

    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          <div className="product-detail-grid">
            {/* Product Images */}
            <div className="product-detail-images">
              <div className="product-main-image">
                <img
                  src={product.image || 'https://via.placeholder.com/600x600?text=Product'}
                  alt={product.name}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="product-detail-info">
              <span className="product-detail-category">{categoryName}</span>
              <h1 className="product-detail-name">{product.name}</h1>
              <p className="product-detail-price">
                {formatPrice(product.price)}
              </p>

              {/* Quantity */}
              <div className="product-quantity">
                <label>Quantity</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => this.setState((s) => ({ quantity: Math.max(1, s.quantity - 1) }))}
                    className="quantity-btn"
                  >
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={() => this.setState((s) => ({ quantity: s.quantity + 1 }))}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="product-actions">
                <button
                  className={`btn btn-primary btn-full ${addedToCart ? 'btn-success' : ''}`}
                  onClick={this.handleAddToCart}
                >
                  {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <button
                  className={`btn btn-outline btn-full ${addedToWishlist ? 'btn-success-outline' : ''}`}
                  onClick={this.handleAddToWishlist}
                >
                  {addedToWishlist ? '♥ Saved' : '♡ Wishlist'}
                </button>
              </div>

              {!isLoggedIn && (
                <p className="login-prompt">
                  <Link to="/login">Login</Link> to add products to cart or wishlist
                </p>
              )}

              {/* Product Tabs */}
              <div className="product-tabs">
                <div className="product-tab-headers">
                  <button
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => this.setState({ activeTab: 'description' })}
                  >
                    Description
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => this.setState({ activeTab: 'details' })}
                  >
                    Details
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                    onClick={() => this.setState({ activeTab: 'shipping' })}
                  >
                    Shipping
                  </button>
                </div>
                <div className="product-tab-content">
                  {activeTab === 'description' && (
                    <p>{product.description || 'High-quality product designed for performance and style.'}</p>
                  )}
                  {activeTab === 'details' && (
                    <ul>
                      <li>Category: {categoryName}</li>
                      <li>Premium materials</li>
                      <li>Durable design</li>
                    </ul>
                  )}
                  {activeTab === 'shipping' && (
                    <div>
                      <p>Free shipping on orders over 500,000₫</p>
                      <p>Express shipping available at checkout</p>
                      <p>Free returns within 30 days</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductDetail;
