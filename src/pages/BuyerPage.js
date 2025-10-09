import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

// Example list of products
const products = [
  { id: 1, name: 'Handmade Necklace', price: 25 },
  { id: 2, name: 'Wooden Carving', price: 40 },
  { id: 3, name: 'Textile Scarf', price: 15 },
];

const BuyerPage = () => {
  const navigate = useNavigate();

  const handleBuy = (productId) => {
    if (!auth.currentUser) {
      // Redirect to login, with optional redirect back to buyer page
      navigate('/login?redirect=/buyer');
    } else {
      alert(`Product ${productId} purchased successfully!`);
      // You can add actual purchase logic here
    }
  };

  return (
    <div>
      <h2>Available Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id} style={{ marginBottom: '10px' }}>
            {product.name} - ${product.price}
            <button 
              style={{ marginLeft: '10px' }}
              onClick={() => handleBuy(product.id)}
            >
              Buy
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BuyerPage;
