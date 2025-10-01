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
            Welcome to <strong>Handmade Marketplace</strong> — an e-commerce platform dedicated 
            to showcasing unique products crafted by talented artisans from Madagascar. 
            Our mission is to connect buyers with exceptional handmade items that reflect 
            creativity, quality, and originality.
          </p>
        </div>

        <div className="about-section">
          <h2>Who We Are</h2>
          <p>
            We are an online marketplace where buyers can explore a wide range of handmade 
            products. From jewelry to textiles, woodcraft, and other crafts, each product 
            on our platform is carefully presented to highlight its design, quality, and 
            artistic value.
          </p>
        </div>

        <div className="about-section">
          <h2>Why Choose Us</h2>
          <ul>
            <li>🎨 <strong>Unique Products:</strong> Every item is one-of-a-kind</li>
            <li>🌍 <strong>Wide Selection:</strong> Explore various categories and styles</li>
            <li>💎 <strong>High Quality:</strong> Products crafted with attention to detail</li>
            <li>🛒 <strong>Easy Shopping:</strong> Browse, filter, and purchase with ease</li>
            <li>📦 <strong>Reliable Delivery:</strong> Receive your products safely at your doorstep</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Our Vision</h2>
          <p>
            We aim to create a seamless online experience for buyers to discover and 
            purchase authentic handmade products, while giving artisans a platform to 
            display their creations to a global audience.
          </p>
        </div>

        <div className="about-section highlight">
          <h2>Explore and Shop</h2>
          <p>
            Browse our curated collection of handmade products and find items that suit 
            your style. Whether it’s for yourself or as a gift, our platform makes it 
            easy to shop for unique, high-quality artisan goods. ❤️
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
