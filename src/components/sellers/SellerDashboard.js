// src/pages/AddProductBase64Realtime.js
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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Track existing Base64 images
  const [contacts, setContacts] = useState(['']);
  const [editContacts, setEditContacts] = useState(['']);

  const user = auth.currentUser;

  // ----------------- CLEANUP OBJECT URLS -----------------
  useEffect(() => {
    // Cleanup preview URLs when component unmounts or previews change
    return () => {
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      editImagePreviews.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews, editImagePreviews]);

  // ----------------- LOGOUT -----------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      setMessage('❌ Failed to logout.');
    }
  };

  // ----------------- REALTIME PRODUCTS -----------------
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'products'), where('vendorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, error => {
      console.error('Realtime error:', error);
      setMessage('❌ Failed to load products in real-time.');
    });
    return () => unsubscribe();
  }, [user]);

  // ----------------- IMAGE TO BASE64 -----------------
  const toBase64Compressed = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
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
          const base64 = canvas.toDataURL('image/jpeg', quality);
          
          // Check if Base64 is too large (Firestore has 1MB limit per field)
          if (base64.length > 1000000) {
            reject(new Error('Compressed image is still too large. Try reducing quality or size.'));
          } else {
            resolve(base64);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });

  // ----------------- FILE HANDLERS -----------------
  const handleFileChange = e => {
    // Cleanup old previews
    imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    
    if (files.length !== e.target.files.length) {
      setMessage('⚠️ Some files were filtered (must be images under 5MB)');
      setTimeout(() => setMessage(''), 3000);
    }

    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    // Cleanup the URL
    if (imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleEditFileChange = e => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    
    if (files.length !== e.target.files.length) {
      setMessage('⚠️ Some files were filtered (must be images under 5MB)');
      setTimeout(() => setMessage(''), 3000);
    }

    // Add new files to existing ones
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setEditImageFiles([...editImageFiles, ...files]);
    setEditImagePreviews([...editImagePreviews, ...newPreviews]);
  };

  const removeEditImage = (index) => {
    const preview = editImagePreviews[index];
    
    // Cleanup the URL if it's a blob
    if (preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
      // Find the corresponding file index (accounting for existing images)
      const fileIndex = editImagePreviews.slice(0, index).filter(p => p.startsWith('blob:')).length;
      setEditImageFiles(editImageFiles.filter((_, i) => i !== fileIndex));
    } else {
      // It's an existing Base64 image
      const existingIndex = editImagePreviews.slice(0, index).filter(p => !p.startsWith('blob:')).length;
      setExistingImages(existingImages.filter((_, i) => i !== existingIndex));
    }
    
    setEditImagePreviews(editImagePreviews.filter((_, i) => i !== index));
  };

  // ----------------- CONTACT HANDLERS -----------------
  const addContactField = () => setContacts([...contacts, '']);
  const updateContact = (index, value) => {
    const newContacts = [...contacts];
    newContacts[index] = value;
    setContacts(newContacts);
  };
  const removeContactField = index => setContacts(contacts.filter((_, i) => i !== index));

  const addEditContactField = () => setEditContacts([...editContacts, '']);
  const updateEditContact = (index, value) => {
    const newContacts = [...editContacts];
    newContacts[index] = value;
    setEditContacts(newContacts);
  };
  const removeEditContactField = index => setEditContacts(editContacts.filter((_, i) => i !== index));

  // ----------------- ADD PRODUCT -----------------
  const handleAdd = async e => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (!title || !price || imageFiles.length === 0) {
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
      const base64Images = await Promise.all(
        imageFiles.map(async (file) => {
          try {
            return await toBase64Compressed(file);
          } catch (err) {
            console.error('Error compressing image:', err);
            throw new Error(`Failed to compress ${file.name}: ${err.message}`);
          }
        })
      );

      await addDoc(collection(db, 'products'), {
        title,
        description,
        price: parseFloat(price),
        images: base64Images,
        createdAt: serverTimestamp(),
        vendorId: user.uid,
        status: 'active',
        contacts: contacts.filter(c => c.trim() !== '') // Remove empty contacts
      });

      setMessage('✅ Product added successfully!');
      
      // Cleanup
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      
      setTitle(''); 
      setDescription(''); 
      setPrice('');
      setImageFiles([]); 
      setImagePreviews([]);
      setContacts(['']);
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage(`❌ Failed to add product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // ----------------- EDIT PRODUCT -----------------
  const startEdit = product => {
    setEditingId(product.id);
    setEditTitle(product.title);
    setEditDescription(product.description);
    setEditPrice(product.price);
    // Store existing Base64 images separately
    setExistingImages(product.images || []);
    setEditImagePreviews(product.images || []);
    setEditImageFiles([]);
    setEditContacts(product.contacts && product.contacts.length > 0 ? product.contacts : ['']);
  };

  const cancelEdit = () => {
    // Cleanup blob URLs
    editImagePreviews.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditPrice('');
    setEditImagePreviews([]);
    setEditImageFiles([]);
    setExistingImages([]);
    setEditContacts(['']);
  };

  const handleSave = async id => {
    if (!editTitle || !editPrice) {
      setMessage('❌ Title and price are required.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (editImagePreviews.length === 0) {
      setMessage('❌ At least one image is required.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const docRef = doc(db, 'products', id);
      let images = [];

      // Add existing Base64 images that weren't removed
      images = [...existingImages];

      // Add new compressed images
      if (editImageFiles.length > 0) {
        const newImages = await Promise.all(
          editImageFiles.map(async (file) => {
            try {
              return await toBase64Compressed(file);
            } catch (err) {
              console.error('Error compressing image:', err);
              throw new Error(`Failed to compress ${file.name}: ${err.message}`);
            }
          })
        );
        images = [...images, ...newImages];
      }

      await updateDoc(docRef, {
        title: editTitle,
        description: editDescription,
        price: parseFloat(editPrice),
        images,
        contacts: editContacts.filter(c => c.trim() !== '') // Remove empty contacts
      });

      setMessage('✅ Product updated successfully!');
      cancelEdit(); // Use cancelEdit to cleanup properly
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage(`❌ Failed to update product: ${error.message}`);
    } finally {
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = async id => {
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
          <input type="file" accept="image/*" multiple onChange={handleFileChange} required />
          <div className="image-previews">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="preview-container">
                <img src={src} alt={`Preview ${idx}`} className="preview-image" />
                <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)}>×</button>
              </div>
            ))}
          </div>

          {/* CONTACTS */}
          <div className="contacts-section">
            <h4>Contacts (Email, Phone, or Facebook link)</h4>
            {contacts.map((contact, index) => (
              <div key={index} className="contact-input">
                <input
                  type="text"
                  placeholder="Enter contact"
                  value={contact}
                  onChange={e => updateContact(index, e.target.value)}
                />
                {contacts.length > 1 && <button type="button" onClick={() => removeContactField(index)}>Remove</button>}
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
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" />
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows="2" placeholder="Description" />
                <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="Price" />
                
                <div className="image-previews">
                  {editImagePreviews.map((src, idx) => (
                    <div key={idx} className="preview-container">
                      <img src={src} alt={`Edit Preview ${idx}`} className="preview-image" />
                      <button type="button" className="remove-image-btn" onClick={() => removeEditImage(idx)}>×</button>
                    </div>
                  ))}
                </div>
                
                <label>
                  Add more images (optional)
                  <input type="file" accept="image/*" multiple onChange={handleEditFileChange} />
                </label>

                {/* EDIT CONTACTS */}
                <div className="contacts-section">
                  <h4>Contacts</h4>
                  {editContacts.map((contact, index) => (
                    <div key={index} className="contact-input">
                      <input type="text" value={contact} onChange={e => updateEditContact(index, e.target.value)} placeholder="Contact" />
                      {editContacts.length > 1 && <button type="button" onClick={() => removeEditContactField(index)}>Remove</button>}
                    </div>
                  ))}
                  <button type="button" onClick={addEditContactField}>Add Contact</button>
                </div>

                <button onClick={() => handleSave(p.id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <div className="image-previews">
                  {p.images && p.images.map((img, idx) => <img key={idx} src={img} alt={p.title} className="preview-image" />)}
                </div>
                <h4>{p.title}</h4>
                <p>{p.description}</p>
                <p>Price: {p.price} MGA</p>
                {p.contacts && p.contacts.length > 0 && (
                  <>
                    <p>Contacts:</p>
                    <ul>
                      {p.contacts.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </>
                )}
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