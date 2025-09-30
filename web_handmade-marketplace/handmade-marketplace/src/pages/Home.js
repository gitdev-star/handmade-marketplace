// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import "./Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // 🧩 For modal

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchPrice = maxPrice ? parseFloat(p.price) <= parseFloat(maxPrice) : true;
    return matchSearch && matchPrice;
  });

  return (
    <div className="home-container">
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
                <div key={p.id} className="product-card">
                  {/* 🧩 Image clickable */}
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    onClick={() => setSelectedProduct(p)}
                    className="clickable"
                  />
                  <h3>{p.title}</h3>
                  <p className="price">{p.price} MGA</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 🧩 Modal for product details */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>
              ✕
            </button>
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.title}
              className="modal-image"
            />
            <h2>{selectedProduct.title}</h2>
            <p className="modal-price">{selectedProduct.price} MGA</p>
            <p>{selectedProduct.description}</p>

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
