// src/components/AddProduct.js
import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 1MB recommended for Firestore)
    if (file.size > 1024 * 1024) {
      setMessage('❌ Image must be less than 1MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage('❌ Please select an image file');
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result); // base64 string for Firestore
      setImagePreview(reader.result); // for preview
      setMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (!title || !price || !imageBase64) {
      setMessage('❌ Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setMessage('❌ You must be logged in to add a product.');
      setIsSubmitting(false);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'products'), {
        title,
        description: description || '',
        price: parseFloat(price),
        imageUrl: imageBase64, // save base64 image directly
        createdAt: serverTimestamp(),
        vendorId: user.uid,
        vendorEmail: user.email,
        status: 'active'
      });

      setMessage('✅ Product added successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setImageBase64('');
      setImagePreview('');
      setIsSubmitting(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Firestore error:', error);
      let errorMsg = 'Failed to save product: ';
      if (error.code === 'permission-denied') {
        errorMsg += 'Permission denied. Check Firestore rules.';
      } else {
        errorMsg += error.message;
      }
      setMessage('❌ ' + errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Add New Product</h2>

      {auth.currentUser ? (
        <p style={styles.userInfo}>Logged in as: {auth.currentUser.email}</p>
      ) : (
        <p style={styles.warning}>⚠️ You must be logged in first</p>
      )}

      {message && (
        <div style={message.includes('✅') ? styles.success : styles.error}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Product Title *</label>
          <input
            type="text"
            placeholder="e.g. Handmade Vanilla Necklace"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            placeholder="Describe your product..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            rows="4"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Price (MGA) *</label>
          <input
            type="number"
            placeholder="e.g. 25000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="100"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Product Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            style={styles.fileInput}
          />
          <small style={styles.hint}>Max 1MB, JPG/PNG</small>
        </div>

        {imagePreview && (
          <div style={styles.previewContainer}>
            <img src={imagePreview} alt="Preview" style={styles.previewImage} />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !auth.currentUser}
          style={isSubmitting ? {...styles.button, ...styles.buttonDisabled} : styles.button}
        >
          {isSubmitting ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px'
  },
  userInfo: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px'
  },
  warning: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#ff9800',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  success: {
    padding: '12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  error: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555',
    fontSize: '14px'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical'
  },
  fileInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  hint: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px'
  },
  previewContainer: {
    textAlign: 'center',
    marginTop: '-10px'
  },
  previewImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #ddd'
  },
  button: {
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  }
};

export default AddProduct;
