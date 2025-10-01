// src/pages/About.js
import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <h1>📖 About Us</h1>
      
      <section className="about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            Welcome to <strong>Handmade Marketplace</strong> — a platform dedicated to 
            connecting talented artisans from Madagascar with buyers around the world. 
            Our mission is to empower local creators, preserve cultural heritage, and 
            promote sustainable commerce through authentic handmade products.
          </p>
        </div>

        <div className="about-section">
          <h2>Who We Are</h2>
          <p>
            We are a community-driven marketplace that celebrates the art of handcrafted 
            goods. Each product listed on our platform tells a unique story of Malagasy 
            culture, tradition, and craftsmanship. From intricate textiles to beautiful 
            woodwork, every item is made with passion and dedication.
          </p>
        </div>

        <div className="about-section">
          <h2>Why Choose Us</h2>
          <ul>
            <li>🎨 <strong>Authentic Craftsmanship:</strong> Every product is genuinely handmade by local artisans</li>
            <li>🌍 <strong>Support Local Communities:</strong> Your purchase directly supports Malagasy families</li>
            <li>♻️ <strong>Sustainable & Eco-friendly:</strong> We promote environmentally conscious practices</li>
            <li>💎 <strong>Unique Products:</strong> Each piece is one-of-a-kind, made with care and tradition</li>
            <li>🤝 <strong>Fair Trade:</strong> We ensure artisans receive fair compensation for their work</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Our Vision</h2>
          <p>
            We envision a world where traditional craftsmanship thrives in the digital age, 
            where artisans have direct access to global markets, and where buyers can discover 
            and purchase authentic, meaningful products that connect cultures and support 
            sustainable livelihoods.
          </p>
        </div>

        <div className="about-section highlight">
          <h2>Join Our Journey</h2>
          <p>
            Every purchase you make helps preserve centuries-old traditions and provides 
            sustainable income to talented artisans. Together, we're building a better 
            future for handmade crafts in Madagascar. Thank you for being part of our story! ❤️
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;