import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// Helper to format VND currency
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Contact';
  return Number(price).toLocaleString('en-US') + '₫';
};

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
      shippingInfo: {
        fullName: '',
        address: '',
        city: '',
        phone: '',
      },
      loading: false,
      orderSuccess: false,
      orderId: '',
      error: '',
    };
  }

  componentDidMount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.setState({ cartItems: cart });
    this.loadProfileAddress();
  }

  loadProfileAddress = async () => {
    const userId = this.props.userId || localStorage.getItem('_id');
    if (!userId || userId === 'undefined' || userId === 'null') return;
    try {
      const res = await api.get(`/user/${userId}`);
      const user = res.data.data || res.data;
      if (user) {
        const addr = user.address || {};
        const addressParts = [addr.street, addr.ward, addr.district].filter(Boolean).join(', ');
        this.setState({
          shippingInfo: {
            fullName: user.full_name || user.fullName || user.name || '',
            address: addressParts,
            city: addr.city || '',
            phone: user.phone || user.phoneNumber || '',
          },
        });
      }
    } catch (err) {
      console.error('Could not load address from profile:', err);
    }
  };

  handleChange = (e) => {
    this.setState({
      shippingInfo: {
        ...this.state.shippingInfo,
        [e.target.name]: e.target.value,
      },
      error: '',
    });
  };

  getSubtotal = () => {
    return this.state.cartItems
      .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { cartItems, shippingInfo } = this.state;

    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      this.setState({ error: 'Please fill in all shipping information' });
      return;
    }

    if (cartItems.length === 0) {
      this.setState({ error: 'Your cart is empty' });
      return;
    }

    const userId = this.props.userId || localStorage.getItem('_id');
    if (!userId || userId === 'undefined' || userId === 'null') {
      this.setState({ error: 'Please log in again to place an order' });
      return;
    }

    this.setState({ loading: true, error: '' });

    const token = localStorage.getItem('token');

    try {
      const orderData = {
        userId: userId,
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || '',
          image: item.image || item.images?.[0] || '',
        })),
        shippingInfo: {
          fullName: shippingInfo.fullName,
          address: shippingInfo.address,
          city: shippingInfo.city,
          phone: shippingInfo.phone,
        },
        totalAmount: this.getSubtotal(),
        paymentMethod: 'COD',
        status: 'pending',
      };

      const res = await api.post('/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem('cart', JSON.stringify([]));
      this.setState({
        orderSuccess: true,
        orderId: res.data._id || res.data.orderId || res.data.order?._id || 'N/A',
        loading: false,
      });

      // Note: address sync skipped here; user can update profile manually
    } catch (err) {
      console.error('Order error:', err);
      console.error('Order error response:', err.response?.data);
      this.setState({
        error: err.response?.data?.message || err.response?.data?.msg || 'Order failed. Please try again.',
        loading: false,
      });
    }
  };

  render() {
    const { cartItems, shippingInfo, loading, orderSuccess, orderId, error } = this.state;

    if (orderSuccess) {
      return (
        <div className="checkout-page">
          <div className="checkout-success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1>Order Placed Successfully!</h1>
            <p>Thank you for your purchase. Your order has been created.</p>
            <p className="order-id">Order ID: <strong>{orderId}</strong></p>
            <div className="success-actions">
              <Link to="/" className="btn btn-primary">Continue Shopping</Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h1 className="checkout-title">Checkout</h1>

          {error && <div className="auth-error">{error}</div>}

          <div className="checkout-layout">
            {/* Shipping Form */}
            <div className="checkout-form-section">
              <h2>Shipping Information</h2>
              <form className="auth-form" onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={this.handleChange}
                    className="form-input"
                    placeholder="Enter full name"
                    id="checkout-fullname"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={this.handleChange}
                    className="form-input"
                    placeholder="Enter address"
                    id="checkout-address"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="City"
                      id="checkout-city"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Phone number"
                      id="checkout-phone"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? 'Placing order...' : `Place Order — ${formatPrice(this.getSubtotal())}`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="checkout-summary">
              <h2>Order Summary</h2>
              <div className="checkout-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="checkout-item">
                    <div className="checkout-item-image">
                      <img
                        src={item.image || 'https://via.placeholder.com/80x80?text=P'}
                        alt={item.name}
                      />
                      <span className="checkout-item-qty">{item.quantity}</span>
                    </div>
                    <div className="checkout-item-info">
                      <h4>{item.name}</h4>
                      <p>{typeof item.category === 'object' ? item.category?.name : item.category}</p>
                      {item.size && <p style={{ fontSize: '13px', color: '#707072', marginTop: '2px' }}>Size: {item.size}</p>}
                    </div>
                    <span className="checkout-item-price">
                      {formatPrice((item.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(this.getSubtotal())}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{this.getSubtotal() > 500000 ? 'Free' : formatPrice(30000)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>
                  {formatPrice(this.getSubtotal() + (this.getSubtotal() > 500000 ? 0 : 30000))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Checkout;
