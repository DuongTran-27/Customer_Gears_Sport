import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return null; }
};

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      editMode: false,
      full_name: '',
      email: '',
      phone: '',
      address: { street: '', ward: '', district: '', city: '' },
      error: '',
      success: '',
      loading: true,
      saving: false,
      loggedOut: false,
      // Optional Password change fields in main form
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      // Orders
      orders: [],
      loadingOrders: true,
      selectedOrder: null,
      loadingOrderDetails: false,
    };
  }

  componentDidMount() {
    this.fetchProfile();
    this.fetchOrders();
  }

  fetchOrders = async () => {
    const userId = this.props.userId || localStorage.getItem('_id');
    if (!userId || userId === 'undefined' || userId === 'null' || userId === 'mock_id_for_now') {
      this.setState({ loadingOrders: false });
      return;
    }
    try {
      const res = await api.get(`/orders/customer/${userId}`);
      this.setState({
        orders: res.data.data || res.data || [],
        loadingOrders: false,
      });
    } catch (err) {
      console.error('Error loading orders:', err);
      this.setState({ loadingOrders: false });
    }
  };

  handleViewOrder = async (order) => {
    this.setState({ loadingOrderDetails: true, selectedOrder: null });
    try {
      // Fetch fresh product data for each item to get the latest image
      const enhancedItems = await Promise.all(
        order.items.map(async (item) => {
          try {
            // Using item.product or item.productId depending on how Checkout.jsx saved it
            const productId = item.productId || item.product;
            if (!productId) return item;

            const res = await api.get(`/products/${productId}`);
            console.log(res.data);

            const productData = res.data.data || res.data;
            return {
              ...item,
              // Use the fetched image if available, else fallback to item.image
              image: productData?.images?.[0] || productData?.image || item.image || '',
              name: productData?.name || item.name, // optionally update name too
            };
          } catch (err) {
            console.error(`Error loading product image ${item.name}:`, err);
            return item; // Fallback to original item if fetch fails
          }
        })
      );

      this.setState({
        selectedOrder: { ...order, items: enhancedItems },
        loadingOrderDetails: false
      });
    } catch (err) {
      console.error('Error loading order details:', err);
      // Fallback: show order without fresh images if batch fetch fails
      this.setState({ selectedOrder: order, loadingOrderDetails: false });
    }
  };

  closeOrderModal = () => {
    this.setState({ selectedOrder: null });
  };

  fetchProfile = async () => {
    const userId = this.props.userId || localStorage.getItem('_id');
    if (!userId || userId === 'undefined' || userId === 'null' || userId === 'mock_id_for_now') {
      this.setState({
        error: 'Invalid session. Please log out and log in again.',
        loading: false,
      });
      return;
    }
    try {
      const res = await api.get(`/user/${userId}`);
      // Handle nested response: res.data.customer, res.data.user, or res.data directly
      const user = res.data.data;
      this.setState({
        user,
        full_name: user.full_name || user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        address: user.address || { street: '', ward: '', district: '', city: '' },
        loading: false,
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      const status = err.response?.status;
      let errorMsg = err.response?.data?.message || 'Could not load profile';
      if (status === 500 || status === 404) {
        errorMsg = 'User information not found. Please log out and log in again.';
      }
      this.setState({
        error: errorMsg,
        loading: false,
      });
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '', success: '' });
  };

  handleAddressChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      address: { ...prev.address, [name]: value },
      error: '',
      success: '',
    }));
  };

  handleEdit = () => {
    this.setState({ editMode: true, success: '' });
  };

  handleCancel = () => {
    const { user } = this.state;
    this.setState({
      editMode: false,
      full_name: user.full_name || user.fullName || user.name || '',
      email: user.email || '',
      phone: user.phone || user.phoneNumber || '',
      address: user.address || { street: '', ward: '', district: '', city: '' },
      error: '',
    });
  };

  handleSave = async (e) => {
    e.preventDefault();
    const {
      full_name, email, phone, address,
      currentPassword, newPassword, confirmPassword
    } = this.state;

    // Validate password fields if any of them is filled
    const isChangingPassword = currentPassword || newPassword || confirmPassword;
    if (isChangingPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        this.setState({ error: 'Please fill in all password fields if you want to change your password' });
        return;
      }
      if (newPassword.length < 6) {
        this.setState({ error: 'New password must be at least 6 characters' });
        return;
      }
      if (newPassword !== confirmPassword) {
        this.setState({ error: 'Confirm password does not match' });
        return;
      }
    }

    const userId = this.props.userId || localStorage.getItem('_id');
    this.setState({ saving: true, error: '', success: '' });

    try {
      const payload = {
        full_name,
        email,
        phone,
        address,
      };

      // Only include password fields if user wants to change them
      if (isChangingPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put(`/user/${userId}`, payload);
      const user = res.data.data;
      this.setState({
        user,
        full_name: user.full_name || user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        address: user.address || { street: '', ward: '', district: '', city: '' },
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        editMode: false,
        saving: false,
        success: 'Profile updated successfully!',
      });
    } catch (err) {
      this.setState({
        error: err.response?.data?.message || 'Update failed',
        saving: false,
      });
    }
  };

  handleLogout = () => {
    this.props.onLogout();
    this.setState({ loggedOut: true });
  };

  render() {
    const {
      user, editMode, full_name, email, phone, address,
      error, success, loading, saving, loggedOut,
      currentPassword, newPassword, confirmPassword,
      orders, loadingOrders, selectedOrder, loadingOrderDetails
    } = this.state;

    if (loggedOut) {
      return <Navigate to="/" />;
    }

    if (loading) {
      return (
        <div className="page-container">
          <div className="loading-spinner"><div className="spinner"></div></div>
        </div>
      );
    }



    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="profile-name">{user?.full_name || user?.fullName || user?.name || 'Member'}</h2>
            <p className="profile-email-sidebar">{user?.email || ''}</p>
            <p className="profile-member">Gears Sport Member</p>
            {user?.createdAt && (
              <p className="profile-joined">Joined: {formatDate(user.createdAt)}</p>
            )}
            <button className="btn btn-danger btn-full" onClick={this.handleLogout}>
              Log Out
            </button>
          </div>

          <div className="profile-main">
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>Personal Information</h2>
                {!editMode && (
                  <button className="btn btn-outline btn-small" onClick={this.handleEdit}>
                    Edit
                  </button>
                )}
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              {editMode ? (
                <form className="auth-form" onSubmit={this.handleSave}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={full_name}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="street"
                      value={address.street || ''}
                      onChange={this.handleAddressChange}
                      className="form-input"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Ward</label>
                      <input
                        type="text"
                        name="ward"
                        value={address.ward || ''}
                        onChange={this.handleAddressChange}
                        className="form-input"
                        placeholder="Ward"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">District</label>
                      <input
                        type="text"
                        name="district"
                        value={address.district || ''}
                        onChange={this.handleAddressChange}
                        className="form-input"
                        placeholder="District"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city || ''}
                      onChange={this.handleAddressChange}
                      className="form-input"
                      placeholder="City"
                    />
                  </div>

                  <hr style={{ margin: '24px 0', borderColor: 'var(--gray-200)' }} />
                  <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Change Password (optional)</h3>

                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={currentPassword}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={newPassword}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Enter new password (at least 6 characters)"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={this.handleChange}
                      className="form-input"
                      placeholder="Re-enter new password"
                    />
                  </div>

                  <div className="profile-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={this.handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="profile-info-row">
                    <span className="profile-info-label">Full Name</span>
                    <span className="profile-info-value">{user?.full_name || user?.fullName || user?.name || '—'}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Email</span>
                    <span className="profile-info-value">{user?.email || '—'}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Phone Number</span>
                    <span className="profile-info-value">{user?.phone || user?.phoneNumber || '—'}</span>
                  </div>

                  <div className="profile-info-row">
                    <span className="profile-info-label">Address</span>
                    <span className="profile-info-value">
                      {user?.address
                        ? [user.address.street, user.address.ward, user.address.district, user.address.city].filter(Boolean).join(', ')
                        : '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Orders Card */}
            <div className="profile-card" style={{ marginTop: '24px' }}>
              <div className="profile-card-header">
                <h2>My Orders</h2>
              </div>

              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-500)' }}>
                  You don't have any orders yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Order ID</th>
                        <th style={{ padding: '12px 8px' }}>Date</th>
                        <th style={{ padding: '12px 8px' }}>Total</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '500' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                          <td style={{ padding: '12px 8px' }}>{order.cdate ? new Date(order.cdate).toLocaleDateString('vi-VN') : '—'}</td>
                          <td style={{ padding: '12px 8px' }}>{order.totalAmount?.toLocaleString('en-US')} ₫</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor:
                                ['completed'].includes((order.status||'').toLowerCase()) ? '#d1fae5' :
                                ['cancelled'].includes((order.status||'').toLowerCase()) ? '#fee2e2' :
                                ['processing'].includes((order.status||'').toLowerCase()) ? '#dbeafe' :
                                '#fef3c7',
                              color:
                                ['completed'].includes((order.status||'').toLowerCase()) ? '#065f46' :
                                ['cancelled'].includes((order.status||'').toLowerCase()) ? '#991b1b' :
                                ['processing'].includes((order.status||'').toLowerCase()) ? '#1e40af' :
                                '#92400e'
                            }}>
                              {(order.status||'').toLowerCase() === 'completed' ? 'Hoàn thành'
                                : (order.status||'').toLowerCase() === 'cancelled' ? 'Đã huỷ'
                                  : (order.status||'').toLowerCase() === 'processing' ? 'Đang xử lý'
                                    : (order.status||'').toLowerCase() === 'pending' ? 'Chờ xử lý'
                                      : order.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <button
                              onClick={() => this.handleViewOrder(order)}
                              disabled={loadingOrderDetails}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--primary-color)',
                                color: 'var(--primary-color)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: loadingOrderDetails ? 'wait' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                opacity: loadingOrderDetails ? 0.5 : 1
                              }}
                            >
                              {loadingOrderDetails ? '...' : 'Details'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: '#fff', borderRadius: '8px',
              width: '100%', maxWidth: '600px', maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  Order Details #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
                </h3>
                <button
                  onClick={this.closeOrderModal}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--gray-500)' }}
                >
                  &times;
                </button>
              </div>

              <div style={{ padding: '20px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--gray-500)' }}>Order Date</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>{selectedOrder.cdate ? new Date(selectedOrder.cdate).toLocaleDateString('vi-VN') : '—'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--gray-500)' }}>Status</p>
                    <p style={{ margin: 0, fontWeight: '500', color:
                      ['completed'].includes((selectedOrder.status||'').toLowerCase()) ? '#059669' :
                      ['cancelled'].includes((selectedOrder.status||'').toLowerCase()) ? '#dc2626' : 'inherit'
                    }}>
                      {(selectedOrder.status||'').toLowerCase() === 'completed' ? 'Hoàn thành'
                        : (selectedOrder.status||'').toLowerCase() === 'cancelled' ? 'Đã huỷ'
                          : (selectedOrder.status||'').toLowerCase() === 'processing' ? 'Đang xử lý'
                            : (selectedOrder.status||'').toLowerCase() === 'pending' ? 'Chờ xử lý'
                              : selectedOrder.status}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Shipping Information</h4>
                  <div style={{ background: 'var(--gray-100)', padding: '12px', borderRadius: '6px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{selectedOrder.shippingInfo?.fullName || '—'}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{selectedOrder.shippingInfo?.phone || '—'}</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      {[
                        selectedOrder.shippingInfo?.address,
                        selectedOrder.shippingInfo?.ward,
                        selectedOrder.shippingInfo?.district,
                        selectedOrder.shippingInfo?.city
                      ].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Products ({selectedOrder.items?.length || 0})</h4>
                  <div style={{ border: '1px solid var(--gray-200)', borderRadius: '6px', overflow: 'hidden' }}>
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} style={{
                        padding: '12px',
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-start',
                        borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--gray-200)' : 'none'
                      }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--gray-100)', flexShrink: 0 }}>
                          <img
                            src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:3000${item.image}`) : 'https://via.placeholder.com/60'}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
                          />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-500)' }}>
                            {item.size ? `Size: ${item.size} | ` : ''}SL: {item.quantity}
                          </p>
                        </div>
                        <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                          {(item.price * item.quantity).toLocaleString('en-US')} ₫
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', borderTop: '1px solid var(--gray-200)', background: 'var(--gray-50)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>Total:</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-color)' }}>
                    {selectedOrder.totalAmount?.toLocaleString('en-US')} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
}

export default Profile;
