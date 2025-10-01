import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './AddProductBase64.css';

const AddProductBase64Realtime = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImageFile, setEditImageFile] = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');
  const [contacts, setContacts] = useState(['']); // new
  const [editContacts, setEditContacts] = useState(['']); // new

  const user = auth.currentUser;

  // ----------------- LOGOUT -----------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; // redirect to public homepage
    } catch (error) {
      console.error('Error logging out:', error);
      setMessage('❌ Failed to logout.');
    }
  };
  // ------------------------------------------

  // Real-time listener for seller products
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'products'), where('vendorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('Realtime error:', error);
      setMessage('❌ Failed to load products in real-time.');
    });

    return () => unsubscribe();
  }, [user]);

  // Compress and convert file to base64
  const toBase64Compressed = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width *= scale;
          height *= scale;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('❌ Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Image must be less than 5MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage('');
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  // ----------------- CONTACT HANDLERS -----------------
  const addContactField = () => setContacts([...contacts, '']);
  const updateContact = (index, value) => {
    const newContacts = [...contacts];
    newContacts[index] = value;
    setContacts(newContacts);
  };
  const removeContactField = (index) => setContacts(contacts.filter((_, i) => i !== index));

  const addEditContactField = () => setEditContacts([...editContacts, '']);
  const updateEditContact = (index, value) => {
    const newContacts = [...editContacts];
    newContacts[index] = value;
    setEditContacts(newContacts);
  };
  const removeEditContactField = (index) => setEditContacts(editContacts.filter((_, i) => i !== index));
  // ------------------------------------------------------

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (!title || !price || !imageFile) {
      setMessage('❌ Please fill all required fields.');
      setIsSubmitting(false);
      return;
    }
    if (!user) {
      setMessage('❌ You must be logged in to add a product.');
      setIsSubmitting(false);
      return;
    }

    try {
      const base64Image = await toBase64Compressed(imageFile);
      await addDoc(collection(db, 'products'), {
        title,
        description,
        price: parseFloat(price),
        imageUrl: base64Image,
        createdAt: serverTimestamp(),
        vendorId: user.uid,
        status: 'active',
        contacts, // save dynamic contacts
      });

      setMessage('✅ Product added successfully!');
      setTitle(''); setDescription(''); setPrice('');
      setImageFile(null); setImagePreview('');
      setContacts(['']); // reset contacts
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage('❌ Failed to add product.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditTitle(product.title);
    setEditDescription(product.description);
    setEditPrice(product.price);
    setEditImagePreview(product.imageUrl);
    setEditImageFile('');
    setEditContacts(product.contacts || ['']); // load existing contacts
  };

  const handleSave = async (id) => {
    if (!editTitle || !editPrice) {
      setMessage('❌ Title and price are required.');
      return;
    }
    try {
      const docRef = doc(db, 'products', id);
      let imageUrl = editImagePreview;
      if (editImageFile) {
        imageUrl = await toBase64Compressed(editImageFile);
      }
      await updateDoc(docRef, {
        title: editTitle,
        description: editDescription,
        price: parseFloat(editPrice),
        imageUrl,
        contacts: editContacts
      });
      setMessage('✅ Product updated successfully!');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage('❌ Failed to update product.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setMessage('✅ Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('❌ Failed to delete product.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Seller Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {message && <div className={message.includes('✅') ? 'success' : 'error'}>{message}</div>}

      {/* Add Product */}
      <div className="add-product-form">
        <h3>Add New Product</h3>
        <form onSubmit={handleAdd}>
          <input type="text" placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows="3" />
          <input type="number" placeholder="Price *" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="100"/>
          <input type="file" accept="image/*" onChange={handleFileChange} required />
          {imagePreview && <img src={imagePreview} alt="Preview" className="preview-image" />}

          {/* CONTACTS */}
          <div className="contacts-section">
            <h4>Contacts (Email, Phone, or Facebook link)</h4>
            {contacts.map((contact, index) => (
              <div key={index} className="contact-input">
                <input
                  type="text"
                  placeholder="Enter contact"
                  value={contact}
                  onChange={(e) => updateContact(index, e.target.value)}
                  required
                />
                {contacts.length > 1 && (
                  <button type="button" onClick={() => removeContactField(index)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addContactField}>Add Contact</button>
          </div>

          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Product'}</button>
        </form>
      </div>

      {/* Manage Products */}
      <div className="manage-products">
        <h3>Your Products</h3>
        {products.map(p => (
          <div key={p.id} className="product-card">
            {editingId === p.id ? (
              <>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows="2" />
                <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                <input type="file" accept="image/*" onChange={handleEditFileChange} />
                {editImagePreview && <img src={editImagePreview} alt="Edit Preview" className="preview-image" />}

                {/* EDIT CONTACTS */}
                <div className="contacts-section">
                  <h4>Contacts</h4>
                  {editContacts.map((contact, index) => (
                    <div key={index} className="contact-input">
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => updateEditContact(index, e.target.value)}
                        required
                      />
                      {editContacts.length > 1 && (
                        <button type="button" onClick={() => removeEditContactField(index)}>Remove</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addEditContactField}>Add Contact</button>
                </div>

                <button onClick={() => handleSave(p.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <img src={p.imageUrl} alt={p.title} className="preview-image" />
                <h4>{p.title}</h4>
                <p>{p.description}</p>
                <p>Price: {p.price} MGA</p>
                <p>Contacts:</p>
                <ul>
                  {p.contacts && p.contacts.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProductBase64Realtime;
