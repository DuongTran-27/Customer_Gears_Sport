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

class Products extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      filteredProducts: [],
      categories: [],
      catLookup: new Map(),
      selectedCategory: 'all',
      sortBy: 'default',
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
      const products = res.data;
      // Extract unique category entries
      const catMap = new Map();
      products.forEach((p) => {
        if (p.category) {
          const id = typeof p.category === 'object' ? p.category._id : p.category;
          const name = getCategoryName(p.category, catLookup);
          catMap.set(id, name);
        }
      });
      const categories = [...catMap.entries()];
      this.setState({
        products,
        filteredProducts: products,
        categories,
        catLookup,
        loading: false,
      });
    } catch (err) {
      console.error('Failed to fetch products', err);
      this.setState({ loading: false });
    }
  };

  handleCategoryFilter = (categoryId) => {
    const { products } = this.state;
    if (categoryId === 'all') {
      this.setState({ filteredProducts: products, selectedCategory: 'all' });
    } else {
      this.setState({
        filteredProducts: products.filter((p) => {
          const pCatId = typeof p.category === 'object' ? p.category._id : p.category;
          return pCatId === categoryId;
        }),
        selectedCategory: categoryId,
      });
    }
  };

  handleSort = (e) => {
    const sortBy = e.target.value;
    const { filteredProducts } = this.state;
    let sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    this.setState({ filteredProducts: sorted, sortBy });
  };

  render() {
    const { filteredProducts, categories, catLookup, selectedCategory, sortBy, loading } = this.state;

    return (
      <div className="products-page">
        <div className="products-container">
          {/* Page Header */}
          <div className="products-header">
            <h1 className="products-title">All Products</h1>
            <div className="products-controls">
              <div className="filter-chips">
                <button
                  className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => this.handleCategoryFilter('all')}
                >
                  All
                </button>
                {categories.map(([catId, catName]) => (
                  <button
                    key={catId}
                    className={`filter-chip ${selectedCategory === catId ? 'active' : ''}`}
                    onClick={() => this.handleCategoryFilter(catId)}
                  >
                    {catName}
                  </button>
                ))}
              </div>
              <select className="sort-select" value={sortBy} onChange={this.handleSort}>
                <option value="default">Sort by</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try changing the filters</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
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
                    <div className="product-card-hover">
                      <span>View Product</span>
                    </div>
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
      </div>
    );
  }
}

export default Products;
