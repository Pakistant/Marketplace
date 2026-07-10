import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';
import './App.css';

const CART_STORAGE_KEY = 'public-cart';

function mapApiProduct(row) {
  return {
    id: row.id,
    name: row.name,
    producer: row.producer_name,
    price: Number(row.price),
    description: row.description,
    category: row.category,
    stock: row.quantity,
  };
}

function readCart() {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(CART_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
}

function HomePage({ products, isLoading, errorMessage, searchTerm, onSearchChange, producerFilter, onProducerChange }) {
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProducer = producerFilter ? product.producer === producerFilter : true;
      return matchesSearch && matchesProducer;
    });
  }, [products, producerFilter, searchTerm]);

  const producers = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.producer)));
  }, [products]);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Produits du terroir</p>
          <h1>Nos produits</h1>
          <p>Découvrez les meilleurs produits locaux, sélectionnés pour votre table.</p>
        </div>
      </section>

      <div className="filters">
        <label className="field">
          <span>Recherche</span>
          <input
            type="text"
            value={searchTerm}
            placeholder="Rechercher un produit"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Producteur</span>
          <select value={producerFilter} onChange={(event) => onProducerChange(event.target.value)}>
            <option value="">Tous les producteurs</option>
            {producers.map((producer) => (
              <option key={producer} value={producer}>
                {producer}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <p className="empty-state">Chargement des produits...</p>}
      {errorMessage && <p className="empty-state">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <p className="product-card__producer">{product.producer}</p>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <div className="product-card__footer">
                <span>{product.price.toFixed(0)} FCFA</span>
                <Link to={`/products/${product.id}`} className="btn btn-secondary">
                  Voir le produit
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && !errorMessage && filteredProducts.length === 0 && (
        <p className="empty-state">Aucun produit ne correspond à votre recherche.</p>
      )}
    </div>
  );
}

function ProductDetailPage({ products, onAddToCart }) {
  const { productId } = useParams();
  const [feedback, setFeedback] = useState('');
  const product = products.find((item) => String(item.id) === productId);

  if (!product) {
    return (
      <div className="page">
        <Link to="/" className="back-link">
          ← Retour à la boutique
        </Link>
        <p className="empty-state">Ce produit n’existe pas.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(product);
    setFeedback('Produit ajouté au panier');
  };

  return (
    <div className="page detail-page">
      <Link to="/" className="back-link">
        ← Retour à la boutique
      </Link>
      <div className="detail-card">
        <div>
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="producer">{product.producer}</p>
          <p>{product.description}</p>
          <p className="price">{product.price.toFixed(0)} FCFA</p>
          <button type="button" className="btn" onClick={handleAddToCart}>
            Ajouter au panier
          </button>
          {feedback && <p className="feedback">{feedback}</p>}
        </div>
      </div>
    </div>
  );
}

function CartPage({ cart, setCart }) {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleQuantityChange = (productId, delta) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const nextQuantity = item.quantity + delta;
        return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
      })
      .filter(Boolean);

    setCart(updatedCart);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      setStatusMessage('Votre panier est vide.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formData.phone,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('La validation de la commande a échoué.');
      }

      setStatusMessage('Commande validée avec succès.');
      setCart([]);
      setFormData({ name: '', phone: '' });
    } catch (error) {
      setStatusMessage(error.message || 'Impossible de contacter le service de commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page cart-page">
      <h1>Votre panier</h1>

      {cart.length === 0 ? (
        <div className="empty-state">
          <p>Le panier est actuellement vide.</p>
          <Link to="/" className="btn btn-secondary">
            Voir les produits
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.producer}</p>
                  <p>{(item.price * item.quantity).toFixed(0)} FCFA</p>
                </div>
                <div className="cart-item__actions">
                  <button type="button" onClick={() => handleQuantityChange(item.id, -1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => handleQuantityChange(item.id, 1)}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-card">
            <h2>Récapitulatif</h2>
            <p>Total : {total.toFixed(0)} FCFA</p>
            <form onSubmit={handleSubmit} className="order-form">
              <label className="field">
                <span>Nom</span>
                <input
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Téléphone</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  required
                />
              </label>
              <button type="submit" className="btn" disabled={isSubmitting}>
                {isSubmitting ? 'Validation...' : 'Valider la commande'}
              </button>
            </form>
            {statusMessage && <p className="feedback">{statusMessage}</p>}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [producerFilter, setProducerFilter] = useState('');
  const [cart, setCart] = useState(() => readCart());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Impossible de charger les produits.');
        }

        const data = await response.json();
        setProducts(data.map(mapApiProduct));
      } catch (error) {
        setProducts([]);
        setLoadError(error.message || 'Impossible de charger les produits.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleAddToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      const updatedCart = existingItem
        ? currentCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...currentCart, { ...product, quantity: 1 }];

      return updatedCart;
    });
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="site-header">
          <Link to="/" className="brand">
            Marché local
          </Link>
          <nav className="site-nav">
            <Link to="/">Produits</Link>
            <Link to="/cart">Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})</Link>
          </nav>
        </header>

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  products={products}
                  isLoading={isLoading}
                  errorMessage={loadError}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  producerFilter={producerFilter}
                  onProducerChange={setProducerFilter}
                />
              }
            />
            <Route
              path="/products/:productId"
              element={<ProductDetailPage products={products} onAddToCart={handleAddToCart} />}
            />
            <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
