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

// Size constants
const SHOE_SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Helper to determine size type from category name (fallback)
const getSizeTypeFromCategory = (categoryName) => {
  if (!categoryName) return null;
  const name = categoryName.toLowerCase();
  const shoeKeywords = ['giày', 'giay', 'shoe', 'sneaker', 'boot', 'sandal', 'dép', 'dep'];
  const clothingKeywords = ['áo', 'ao', 'quần', 'quan', 'shirt', 'jersey', 'top', 'pants', 'shorts', 'jacket', 'hoodie'];
  if (shoeKeywords.some(k => name.includes(k))) return 'shoe';
  if (clothingKeywords.some(k => name.includes(k))) return 'clothing';
  return null;
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
      sizeError: false,
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

  // Determine what sizes to show for this product
  getAvailableSizes = () => {
    const { product, catLookup } = this.state;
    if (!product) return null;

    // Debug: log sizeType to console
    console.log('[ProductDetail] sizeType:', product.sizeType, '| product:', product.name);

    // Priority 1: use sizeType field from DB
    if (product.sizeType === 'shoe') return { type: 'shoe', sizes: SHOE_SIZES };
    if (product.sizeType === 'clothing') return { type: 'clothing', sizes: CLOTHING_SIZES };
    if (product.sizeType === 'none') return null;

    // Priority 2: fallback — guess from category name
    const categoryName = getCategoryName(product.category, catLookup);
    const guessedType = getSizeTypeFromCategory(categoryName);
    if (guessedType === 'shoe') return { type: 'shoe', sizes: SHOE_SIZES };
    if (guessedType === 'clothing') return { type: 'clothing', sizes: CLOTHING_SIZES };

    return null;
  };

  handleAddToCart = () => {
    if (!this.props.isLoggedIn) {
      alert('Please login to add products to cart');
      return;
    }

    const { product, quantity, selectedSize } = this.state;
    const sizeInfo = this.getAvailableSizes();

    // Validate: must select size if available
    if (sizeInfo && !selectedSize) {
      this.setState({ sizeError: true });
      return;
    }

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
    this.setState({ addedToCart: true, sizeError: false });
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
    const { product, selectedSize, quantity, catLookup, loading, addedToCart, addedToWishlist, activeTab, sizeError } = this.state;
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
    const sizeInfo = this.getAvailableSizes();

    // Parse details: có thể là string hoặc object
    const detailsText = product.details
      ? (typeof product.details === 'string'
          ? product.details
          : JSON.stringify(product.details, null, 2))
      : null;

    // Label loại size để hiển thị trong tab Details
    const sizeTypeLabel =
      product.sizeType === 'shoe' ? 'Giày (35 – 45)' :
      product.sizeType === 'clothing' ? 'Áo/Quần (S, M, L, XL, XXL)' :
      product.sizeType === 'none' ? 'Không có size' :
      'Chưa phân loại';

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

              {/* Size Selector */}
              {sizeInfo && (
                <div className="size-selector">
                  <div className="size-selector-header">
                    <label>
                      {sizeInfo.type === 'shoe' ? 'Chọn cỡ giày' : 'Chọn size'}
                    </label>
                    <span className="size-guide">Hướng dẫn chọn size</span>
                  </div>
                  <div className="size-options">
                    {sizeInfo.sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-option ${selectedSize === String(size) ? 'active' : ''}`}
                        onClick={() => this.setState({ selectedSize: String(size), sizeError: false })}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {sizeError && (
                    <div className="size-required-error">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Vui lòng chọn size trước khi thêm vào giỏ hàng
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div className="product-quantity">
                <label>Số lượng</label>
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
                  {addedToCart
                    ? '✓ Đã thêm vào giỏ'
                    : (sizeInfo && selectedSize
                      ? `Thêm vào giỏ — Size ${selectedSize}`
                      : 'Thêm vào giỏ hàng')}
                </button>
                <button
                  className={`btn btn-outline btn-full ${addedToWishlist ? 'btn-success-outline' : ''}`}
                  onClick={this.handleAddToWishlist}
                >
                  {addedToWishlist ? '♥ Đã lưu' : '♡ Yêu thích'}
                </button>
              </div>

              {!isLoggedIn && (
                <p className="login-prompt">
                  <Link to="/login">Đăng nhập</Link> để thêm sản phẩm vào giỏ hoặc danh sách yêu thích
                </p>
              )}

              {/* Product Tabs */}
              <div className="product-tabs">
                <div className="product-tab-headers">
                  <button
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => this.setState({ activeTab: 'description' })}
                  >
                    Mô tả
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => this.setState({ activeTab: 'details' })}
                  >
                    Chi tiết
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                    onClick={() => this.setState({ activeTab: 'shipping' })}
                  >
                    Vận chuyển
                  </button>
                </div>
                <div className="product-tab-content">
                  {activeTab === 'description' && (
                    <p style={{ whiteSpace: 'pre-line' }}>
                      {product.description || 'Sản phẩm chất lượng cao, được thiết kế cho hiệu suất và phong cách.'}
                    </p>
                  )}

                  {activeTab === 'details' && (
                    <div className="product-details-tab">
                      <table className="product-info-table">
                        <tbody>
                          <tr>
                            <td className="info-label">Danh mục</td>
                            <td className="info-value">{categoryName}</td>
                          </tr>
                          <tr>
                            <td className="info-label">Loại size</td>
                            <td className="info-value">{sizeTypeLabel}</td>
                          </tr>
                          {sizeInfo && (
                            <tr>
                              <td className="info-label">Size có sẵn</td>
                              <td className="info-value">{sizeInfo.sizes.join(', ')}</td>
                            </tr>
                          )}
                          {product.cdate && (
                            <tr>
                              <td className="info-label">Ngày thêm</td>
                              <td className="info-value">{new Date(product.cdate).toLocaleDateString('vi-VN')}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {detailsText && (
                        <div className="product-details-text">
                          <h4>Thông số kỹ thuật</h4>
                          <p style={{ whiteSpace: 'pre-line' }}>{detailsText}</p>
                        </div>
                      )}

                      {!detailsText && (
                        <p style={{ color: 'var(--gray-500)', marginTop: '12px', fontSize: '14px' }}>
                          Chưa có thông tin chi tiết cho sản phẩm này.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div>
                      <p>✅ Miễn phí vận chuyển cho đơn hàng trên 500,000₫</p>
                      <p>🚀 Giao hàng nhanh có sẵn khi thanh toán</p>
                      <p>🔄 Miễn phí đổi trả trong vòng 30 ngày</p>
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
