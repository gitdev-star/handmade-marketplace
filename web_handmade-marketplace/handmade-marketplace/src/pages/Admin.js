// src/pages/Admin.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const sellerUID = 'eAfl6GzfCbMkZogUNfUCCJIkk4c2'; // your admin UID from Firebase Authentication

  useEffect(() => {
    // Only fetch products if logged in as admin
    const user = auth.currentUser;
    if (!user || user.uid !== sellerUID) return;

    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async () => {
    const user = auth.currentUser;
    if (!user || user.uid !== sellerUID) return alert('Not authorized');

    await addDoc(collection(db, 'products'), {
      title,
      price: parseFloat(price),
      createdAt: serverTimestamp(),
      vendorId: user.uid
    });
    setTitle('');
    setPrice('');
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Panel</h1>

      <div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Product Title" />
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" />
        <button onClick={addProduct}>Add Product</button>
      </div>

      <h2>Products</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.title} - {p.price} MGA
            <button onClick={() => deleteProduct(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
