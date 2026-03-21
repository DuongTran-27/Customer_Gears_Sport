import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// Helper to format VND currency
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ';
  return Number(price).toLocaleString('vi-VN') + 'đ';
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
  }

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
      this.setState({ error: 'Vui lòng điền đầy đủ thông tin giao hàng' });
      return;
    }

    if (cartItems.length === 0) {
      this.setState({ error: 'Giỏ hàng của bạn đang trống' });
      return;
    }

    this.setState({ loading: true, error: '' });

    const userId = this.props.userId || localStorage.getItem('_id');
    const token = localStorage.getItem('token');

    try {
      const orderData = {
        userId: userId,
        customer: userId,
        products: cartItems.map((item) => ({
          productId: item._id,
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || '',
        })),
        shippingInfo,
        shipping: shippingInfo,
        totalAmount: this.getSubtotal(),
        total: this.getSubtotal(),
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
    } catch (err) {
      console.error('Order error:', err);
      this.setState({
        error: err.response?.data?.message || err.response?.data?.msg || 'Đặt hàng thất bại. Vui lòng thử lại.',
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
            <h1>Đặt hàng thành công!</h1>
            <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tạo thành công.</p>
            <p className="order-id">Mã đơn hàng: <strong>{orderId}</strong></p>
            <div className="success-actions">
              <Link to="/" className="btn btn-primary">Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h1 className="checkout-title">Thanh toán</h1>

          {error && <div className="auth-error">{error}</div>}

          <div className="checkout-layout">
            {/* Shipping Form */}
            <div className="checkout-form-section">
              <h2>Thông tin giao hàng</h2>
              <form className="auth-form" onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={this.handleChange}
                    className="form-input"
                    placeholder="Nhập họ và tên"
                    id="checkout-fullname"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={this.handleChange}
                    className="form-input"
                    placeholder="Nhập địa chỉ"
                    id="checkout-address"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Thành phố</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Thành phố"
                      id="checkout-city"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Số điện thoại"
                      id="checkout-phone"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? 'Đang đặt hàng...' : `Đặt hàng — ${formatPrice(this.getSubtotal())}`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="checkout-summary">
              <h2>Đơn hàng</h2>
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
                    </div>
                    <span className="checkout-item-price">
                      {formatPrice((item.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(this.getSubtotal())}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{this.getSubtotal() > 500000 ? 'Miễn phí' : formatPrice(30000)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Tổng cộng</span>
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
