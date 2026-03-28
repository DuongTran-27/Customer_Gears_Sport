import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

import heroBanner1 from '../assets/hero_banner_1.png';
import heroBanner2 from '../assets/hero_banner_2.png';
import heroBanner3 from '../assets/hero_banner_3.png';

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

const heroSlides = [
  {
    image: heroBanner1,
    subtitle: 'NEW COLLECTION',
    title: 'JUST DO IT',
    description: 'Discover the latest collection of sportswear, footwear and accessories. Elevate your style.',
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)',
  },
  {
    image: heroBanner2,
    subtitle: 'TRAINING GEAR',
    title: 'BUILD YOUR STRENGTH',
    description: 'Equip yourself with authentic training gear to conquer every challenge on the field.',
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #2d1b69 30%, #11998e 100%)',
  },
  {
    image: heroBanner3,
    subtitle: 'OUTDOOR SPORTS',
    title: 'BREAK YOUR LIMITS',
    description: 'Passionate about outdoor sports? We have everything you need to break through.',
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #0f3460 30%, #e94560 100%)',
  },
];

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      featuredProducts: [],
      catLookup: new Map(),
      loading: true,
      currentSlide: 0,
    };
    this._autoPlay = null;
  }

  componentDidMount() {
    this.fetchProducts();
    this.startAutoPlay();
  }

  componentWillUnmount() {
    this.stopAutoPlay();
  }

  startAutoPlay = () => {
    this._autoPlay = setInterval(() => {
      this.setState((prev) => ({
        currentSlide: (prev.currentSlide + 1) % heroSlides.length,
      }));
    }, 5000);
  };

  stopAutoPlay = () => {
    if (this._autoPlay) clearInterval(this._autoPlay);
  };

  goToSlide = (index) => {
    this.stopAutoPlay();
    this.setState({ currentSlide: index });
    this.startAutoPlay();
  };

  prevSlide = () => {
    this.stopAutoPlay();
    this.setState((prev) => ({
      currentSlide: (prev.currentSlide - 1 + heroSlides.length) % heroSlides.length,
    }));
    this.startAutoPlay();
  };

  nextSlide = () => {
    this.stopAutoPlay();
    this.setState((prev) => ({
      currentSlide: (prev.currentSlide + 1) % heroSlides.length,
    }));
    this.startAutoPlay();
  };

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
      this.setState({ featuredProducts: res.data.slice(0, 8), catLookup, loading: false });
    } catch (err) {
      console.error('Failed to fetch products', err);
      this.setState({ loading: false });
    }
  };

  render() {
    const { featuredProducts, catLookup, loading, currentSlide } = this.state;

    return (
      <div className="home-page">
        {/* Hero Carousel */}
        <section className="hero-carousel">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ background: slide.gradient }}
            >
              <div className="hero-slide-image">
                <img src={slide.image} alt={slide.title} />
              </div>
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <span className="hero-subtitle">{slide.subtitle}</span>
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-description">{slide.description}</p>
                <div className="hero-buttons">
                  <Link to="/products" className="btn btn-primary">Shop Now</Link>
                  <Link to="/products" className="btn btn-outline">Explore</Link>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button className="hero-arrow hero-arrow-prev" onClick={this.prevSlide} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="hero-arrow hero-arrow-next" onClick={this.nextSlide} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => this.goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Feature Strip */}
        <section className="feature-strip">
          <div className="feature-strip-inner">
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
                <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <div>
                <h4>Free Shipping</h4>
                <p>On orders over 500,000₫</p>
              </div>
            </div>
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <div>
                <h4>New Arrivals Weekly</h4>
                <p>Fresh styles every week</p>
              </div>
            </div>
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
                <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div>
                <h4>30-Day Returns</h4>
                <p>Hassle-free guarantee</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="home-section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Featured Products</h2>
              <Link to="/products" className="section-link">View All →</Link>
            </div>
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="product-grid">
                {featuredProducts.map((product) => (
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
        </section>

        {/* Membership Banner */}
        <section className="membership-section">
          <div className="membership-content">
            <h2>BECOME A MEMBER</h2>
            <p>Sign up for free. Join the community to receive the latest products, inspiration and stories.</p>
            <Link to="/signup" className="btn btn-primary">Join Now</Link>
          </div>
        </section>
      </div>
    );
  }
}

export default Home;
