import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/items/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="relative pt-20"> {/* Added pt-20 for top padding */}
      <div className="max-w-7xl mx-auto px-8">
        <button
          onClick={handleBack}
          style={{
            backgroundColor: 'var(--scroll-btn-bg)',
            color: 'var(--scroll-btn-text)',
          }}
          className="absolute top-6 left-20 p-3 rounded-full 
                     transition-all duration-300 z-50
                     shadow-lg hover:shadow-xl
                     hover:opacity-90"
          aria-label="Go back"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-100 p-6 rounded-xl flex items-center justify-center">
            <img
              src={product.image ? `http://localhost:5000${product.image}` : "/placeholder.jpeg"}
              alt={product.name}
              className="w-full max-w-md h-auto object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-black font-semibold text-2xl">{product.details}</p>
            <p className="text-black text-sm leading-relaxed overflow-auto max-h-40">{product.moreDetails}</p>
            <p className="font-bold text-lg">Price: <span className="text-blue-600">${product.price}</span></p>
            <p className={`text-lg font-semibold ${product.quantity < 50 ? "text-red-600" : product.quantity < 200 ? "text-orange-500" : "text-green-600"}`}>
              Stock: {product.quantity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;