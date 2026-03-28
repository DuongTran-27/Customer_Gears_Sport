import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// Helper to format VND currency
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Contact';
  return Number(price).toLocaleString('en-US') + '₫';
};

class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
    };
  }

  componentDidMount() {
    this.loadCart();
  }

  loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.setState({ cartItems: cart });
  };

  updateQuantity = (index, delta) => {
    const { cartItems } = this.state;
    const updated = [...cartItems];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    localStorage.setItem('cart', JSON.stringify(updated));
    this.setState({ cartItems: updated });
  };

  removeItem = (index) => {
    const { cartItems } = this.state;
    const updated = cartItems.filter((_, i) => i !== index);
    localStorage.setItem('cart', JSON.stringify(updated));
    this.setState({ cartItems: updated });
  };

  clearCart = () => {
    localStorage.setItem('cart', JSON.stringify([]));
    this.setState({ cartItems: [] });
  };

  getTotal = () => {
    return this.state.cartItems
      .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  render() {
    const { cartItems } = this.state;
    const total = this.getTotal();
    const shippingFee = total > 500000 ? 0 : 30000;

    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="empty-icon">
                <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any products yet.</p>
              <Link to="/products" className="btn btn-primary">Shop Now</Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={item.image || 'https://via.placeholder.com/150x150?text=Product'}
                        alt={item.name}
                      />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <p className="cart-item-category">
                          {typeof item.category === 'object' ? item.category?.name : (item.category?.length < 30 ? item.category : 'Gear')}
                        </p>
                        {item.size && <p className="cart-item-size">Size: {item.size}</p>}
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => this.updateQuantity(index, -1)}
                          >
                            −
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => this.updateQuantity(index, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => this.removeItem(index)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      {formatPrice((item.price || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <h2>Summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>{formatPrice(total + shippingFee)}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary btn-full">
                  Checkout
                </Link>
                <button className="btn btn-outline btn-full" onClick={this.clearCart}>
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Cart;
