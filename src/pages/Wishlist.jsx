import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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

class Wishlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wishlistItems: [],
    };
  }

  componentDidMount() {
    this.loadWishlist();
  }

  loadWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    this.setState({ wishlistItems: wishlist });
  };

  removeItem = (id) => {
    const { wishlistItems } = this.state;
    const updated = wishlistItems.filter((item) => item._id !== id);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    this.setState({ wishlistItems: updated });
  };

  addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((c) => c._id === item._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1, size: '' });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.removeItem(item._id);
  };

  render() {
    const { wishlistItems } = this.state;

    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">Yêu thích</h1>
          <p className="wishlist-count">{wishlistItems.length} sản phẩm</p>

          {wishlistItems.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="empty-icon">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <h3>Danh sách yêu thích trống</h3>
              <p>Lưu lại những sản phẩm bạn yêu thích để mua sau.</p>
              <Link to="/products" className="btn btn-primary">Khám phá sản phẩm</Link>
            </div>
          ) : (
            <div className="wishlist-list">
              {wishlistItems.map((item) => (
                <div key={item._id} className="wishlist-item">
                  <Link to={`/product/${item.slug || item._id}`} className="wishlist-item-image">
                    <img
                      src={item.image || 'https://via.placeholder.com/120x120?text=Product'}
                      alt={item.name}
                    />
                  </Link>
                  <div className="wishlist-item-details">
                    <Link to={`/product/${item.slug || item._id}`} className="wishlist-item-name">
                      {item.name}
                    </Link>
                    <span className="wishlist-item-category">{getCategoryName(item.category)}</span>
                    <p className="wishlist-item-price">{formatPrice(item.price)}</p>
                  </div>
                  <div className="wishlist-item-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => this.addToCart(item)}
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => this.removeItem(item._id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Wishlist;
