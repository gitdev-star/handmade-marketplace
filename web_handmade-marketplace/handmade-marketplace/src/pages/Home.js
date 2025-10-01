// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import About from "./About";
import "./Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animatedDescription, setAnimatedDescription] = useState("");
  const [loadedImages, setLoadedImages] = useState({});
  const [activePage, setActivePage] = useState("home"); // 👈 Navigation state

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedProduct && selectedProduct.description) {
      setAnimatedDescription("");
      let index = 0;
      const words = selectedProduct.description.split(" ");
      const interval = setInterval(() => {
        if (index < words.length) {
          setAnimatedDescription((prev) => prev + (index > 0 ? " " : "") + words[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 120);
      return () => clearInterval(interval);
    }
  }, [selectedProduct]);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchPrice = maxPrice ? parseFloat(p.price) <= parseFloat(maxPrice) : true;
    return matchSearch && matchPrice;
  });

  const nextImage = () => {
    if (!selectedProduct?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
  };

  const prevImage = () => {
    if (!selectedProduct?.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
    setAnimatedDescription("");
  };

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="home-container">
      {/* 🔹 NAVIGATION BUTTONS */}
      <nav className="simple-nav">
        <button 
          onClick={() => setActivePage("home")} 
          className={activePage === "home" ? "nav-btn active" : "nav-btn"}
        >
          🏠 Home
        </button>
        <button 
          onClick={() => setActivePage("about")} 
          className={activePage === "about" ? "nav-btn active" : "nav-btn"}
        >
          📖 About Us
        </button>
      </nav>

      {/* 🔹 HOME PAGE CONTENT */}
      {activePage === "home" && (
        <>
          <header className="home-header">
            <h1>Our Handmade Products</h1>
            <p>Discover unique crafts and support local artisans in Madagascar!</p>

            <div className="filters">
              <input
                type="text"
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <input
                type="number"
                placeholder="Max price (MGA)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-input"
              />
            </div>
          </header>

          <main>
            <section className="products-section">
              {filteredProducts.length === 0 ? (
                <p>No products found.</p>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="product-card clickable"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <img
                        src={p.images?.[0] || p.imageUrl}
                        alt={p.title}
                        className={`product-image ${loadedImages[p.id] ? "loaded" : ""}`}
                        onLoad={() => handleImageLoad(p.id)}
                      />
                      <div className="product-info">
                        <h3>{p.title}</h3>
                        <p className="price">{p.price} MGA</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {/* 🔹 ABOUT PAGE CONTENT */}
      {activePage === "about" && <About />}

      {/* Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>✕</button>

            {selectedProduct.images && selectedProduct.images.length > 0 ? (
              <div className="modal-carousel">
                <button className="prev-btn" onClick={prevImage}>‹</button>
                <img
                  src={selectedProduct.images[currentImageIndex]}
                  alt={selectedProduct.title}
                  className="modal-image fade-in"
                />
                <button className="next-btn" onClick={nextImage}>›</button>
              </div>
            ) : (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="modal-image fade-in"
              />
            )}

            <h2>{selectedProduct.title}</h2>
            <p className="modal-price">{selectedProduct.price} MGA</p>

            <p className="modal-description">{animatedDescription}</p>

            {selectedProduct.contacts && selectedProduct.contacts.length > 0 ? (
              <div className="modal-contacts">
                <h4>Contacts:</h4>
                <ul>
                  {selectedProduct.contacts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="no-contact">No contact available</p>
            )}
          </div>
        </div>
      )}

      <footer className="home-footer">
        <p>© 2025 Handmade Marketplace - Support Local Artisans ❤️</p>
      </footer>
    </div>
  );
};

export default Home;