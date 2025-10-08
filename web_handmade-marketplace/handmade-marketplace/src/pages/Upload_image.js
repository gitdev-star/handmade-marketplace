import React, { useState, useEffect } from "react";
import "./Upload_image.css";

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal state
  const [modalProduct, setModalProduct] = useState(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [animatedText, setAnimatedText] = useState("");

  // Cleanup preview URL
  useEffect(() => {
    return () => previewUrl && URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // Animate description for modal
  useEffect(() => {
    if (modalProduct?.description) {
      setAnimatedText("");
      const words = modalProduct.description.split(" ");
      let i = 0;
      const timer = setInterval(() => {
        if (i < words.length) {
          setAnimatedText((prev) => (prev ? prev + " " : "") + words[i]);
          i++;
        } else clearInterval(timer);
      }, 120);
      return () => clearInterval(timer);
    }
  }, [modalProduct]);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setErrorMsg("❌ Please select an image file.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setSimilarProducts([]);
    setErrorMsg("");
  };

  const handleFindSimilar = async () => {
    if (!file) {
      setErrorMsg("⚠️ Please choose an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setErrorMsg("");
    setSimilarProducts([]);

    try {
      const response = await fetch("http://localhost:8000/find-similar-products", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Server error");

      setSimilarProducts(data.results || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Modal navigation
  const nextModalImage = () => {
    if (!modalProduct?.images) return;
    setModalIndex((prev) => (prev + 1) % modalProduct.images.length);
  };

  const prevModalImage = () => {
    if (!modalProduct?.images) return;
    setModalIndex((prev) => (prev === 0 ? modalProduct.images.length - 1 : prev - 1));
  };

  const closeModal = () => {
    setModalProduct(null);
    setModalIndex(0);
    setAnimatedText("");
  };

  return (
    <div className="upload-container">
      <h1>📸 Find Products Similar to Your Image</h1>

      <div className="upload-inputs">
        <label htmlFor="file-upload" className="file-btn">
          📂 Choisir un fichier
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="preview-img"
            onClick={() => document.getElementById("file-upload").click()}
          />
        )}

        <button onClick={handleFindSimilar} disabled={loading}>
          {loading ? "🔎 Searching..." : "📤 Upload & Find"}
        </button>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </div>

      {similarProducts.length > 0 && (
        <div className="similar-products">
          <h2>Similar Products</h2>
          <div className="products-grid">
            {similarProducts.map((p) => (
              <div key={p.id} className="product-card" onClick={() => setModalProduct(p)}>
                <img src={p.images?.[0] || p.imageUrl || "/placeholder.png"} alt={p.title} />
                <h3>{p.title}</h3>
                <p>{p.price} MGA</p>
                <p>Similarity: {(p.similarity * 100).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalProduct && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            {modalProduct.images?.length > 0 ? (
              <div className="modal-img-carousel">
                <button onClick={prevModalImage}>‹</button>
                <img src={modalProduct.images[modalIndex]} alt={modalProduct.title} />
                <button onClick={nextModalImage}>›</button>
              </div>
            ) : (
              <img src={modalProduct.imageUrl || "/placeholder.png"} alt={modalProduct.title} />
            )}
            <h2>{modalProduct.title}</h2>
            <p>{modalProduct.price} MGA</p>
            <p className="modal-description">{animatedText}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
