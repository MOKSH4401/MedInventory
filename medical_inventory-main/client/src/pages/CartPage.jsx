import { useState, useEffect, useRef } from "react";
import useCart from "../store/cartStore";
import { generatePDF } from '../utils/generatePDF';
import BillTemplate from '../components/BillTemplate';
import { useSettings } from "../store/SettingsStore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createRoot } from 'react-dom/client';
import axios from "axios";

const CartPage = () => {
  const { cart, fetchCart, removeFromCart, checkout } = useCart();
  const { settings } = useSettings();
  const [buyerInfo, setBuyerInfo] = useState({
    buyerName: "",
    buyerPhone: "",
    buyerEmail: "",
    paymentMode: "cash"
  });
  const billTemplateRef = useRef();
  const [purchaseData, setPurchaseData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  // Normalize cart so items is always an array (handles API response shape)
  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const cartTotal = Number(cart?.totalAmount) || 0;

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    setFinalAmount(cartTotal);
    setDiscountAmount(0);
    setCouponCode("");
  }, [cartTotal]);

  useEffect(() => {
    setPurchaseData({
      ...buyerInfo,
      items: cartItems,
      totalAmount: finalAmount || cartTotal,
      purchaseDate: new Date(),
      _id: Date.now().toString()
    });
  }, [cart, buyerInfo, finalAmount, cartTotal, cartItems]);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      const { data } = await axios.post("http://localhost:5000/api/coupons/validate", {
        code: couponCode,
        cartAmount: cartTotal,
      });
      if (!data.valid) {
        setDiscountAmount(0);
        setFinalAmount(cartTotal);
        toast.error(data.message || "Invalid coupon");
        return;
      }
      setDiscountAmount(data.discountAmount);
      setFinalAmount(data.finalAmount);
      toast.success(`Coupon applied! You save ₹${data.discountAmount}`);
    } catch (error) {
      console.error("Apply coupon error:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      if (!buyerInfo.buyerName || !buyerInfo.buyerPhone) {
        toast.error("Please fill in Name and Phone");
        return;
      }

      const effectiveFinal = discountAmount > 0 ? finalAmount : cartTotal;
      const purchaseForBill = {
        ...buyerInfo,
        purchaseDate: new Date(),
        _id: Date.now().toString(),
        items: cartItems.map(item => ({
          ...item,
          amount: item.price * item.quantity
        })),
        totalAmount: cartTotal,
        discountAmount: discountAmount > 0 ? discountAmount : 0,
        finalAmount: effectiveFinal,
        couponCode: discountAmount > 0 ? couponCode : undefined,
      };

      const isOnlinePayment = buyerInfo.paymentMode === "card" || buyerInfo.paymentMode === "upi";

      if (isOnlinePayment) {
        // Create Razorpay order and open payment page
        const { data } = await axios.post("http://localhost:5000/api/cart/create-order", {
          amount: effectiveFinal
        });
        if (!data.orderId || !data.key) {
          toast.error("Could not start payment");
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          order_id: data.orderId,
          name: "MedInventory",
          description: "Medicine Purchase",
          prefill: {
            name: buyerInfo.buyerName,
            contact: buyerInfo.buyerPhone
          },
          handler: async function (response) {
            try {
              await axios.post("http://localhost:5000/api/cart/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                buyerName: buyerInfo.buyerName,
                buyerPhone: buyerInfo.buyerPhone,
                buyerEmail: buyerInfo.buyerEmail,
                paymentMode: buyerInfo.paymentMode,
                couponCode: couponCode || undefined,
              });
              await generateBill(purchaseForBill);
              await fetchCart();
              toast.success("Payment successful! Invoice generated.");
            } catch (err) {
              console.error("Verify/generate error:", err);
              toast.error(err.response?.data?.message || "Payment verification or invoice failed");
            }
          },
          modal: { ondismiss: () => toast.info("Payment cancelled") }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Cash: direct checkout and invoice
        try {
          await generateBill(purchaseForBill);
          await checkout({ ...buyerInfo, couponCode: couponCode || undefined });
          toast.success("Purchase completed and bill generated successfully!");
        } catch (error) {
          console.error("Error during checkout/bill generation:", error);
          toast.error("Failed to complete purchase");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to complete purchase");
    }
  };

  const generateBill = async (purchaseData) => {
    try {
      // Create a temporary container
      const billElement = document.createElement('div');
      billElement.style.position = 'absolute';
      billElement.style.left = '-9999px';
      document.body.appendChild(billElement);

      // Create root and render
      const root = createRoot(billElement);
      root.render(
        <BillTemplate
          ref={billTemplateRef}
          purchaseData={purchaseData}
          settings={settings}
        />
      );

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate PDF
      await generatePDF(
        billTemplateRef.current,
        `invoice-${purchaseData.buyerName}-${Date.now()}.pdf`
      );

      // Cleanup
      root.unmount();
      document.body.removeChild(billElement);
    } catch (error) {
      console.error("Bill generation failed:", error);
      throw error;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>
      
      {cartItems.length > 0 ? (
        <>
          {cartItems.map((item) => (
            <div key={item.itemId} className="flex justify-between items-center border-b py-2">
              <div className="flex items-center gap-4">
                <img 
                  src={item.image ? `http://localhost:5000${item.image}` : "/placeholder.jpeg"} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded" 
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p>₹{item.price * item.quantity}</p>
                <button
                  onClick={() => removeFromCart(item.itemId)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Checkout</h2>
            <form onSubmit={handleCheckout} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={buyerInfo.buyerName}
                onChange={(e) => setBuyerInfo({...buyerInfo, buyerName: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={buyerInfo.buyerPhone}
                onChange={(e) => setBuyerInfo({...buyerInfo, buyerPhone: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email (optional - for receipt)"
                value={buyerInfo.buyerEmail}
                onChange={(e) => setBuyerInfo({...buyerInfo, buyerEmail: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Apply
                </button>
              </div>
              <select
                value={buyerInfo.paymentMode}
                onChange={(e) => setBuyerInfo({...buyerInfo, paymentMode: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
              
              <div className="space-y-1 text-right">
                <p className="text-sm text-gray-600">Total Amount: ₹{cartTotal}</p>
                <p className="text-sm text-green-700">
                  Discount: -₹{discountAmount.toFixed ? discountAmount.toFixed(2) : discountAmount}
                </p>
                <p className="text-lg font-bold">
                  Final Amount: ₹{(discountAmount > 0 ? finalAmount : cartTotal).toFixed
                    ? (discountAmount > 0 ? finalAmount : cartTotal).toFixed(2)
                    : discountAmount > 0 ? finalAmount : cartTotal}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  Complete Purchase
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
      <div style={{ display: 'none' }}>
        {purchaseData && (
          <BillTemplate 
            ref={billTemplateRef} 
            purchaseData={purchaseData} 
            settings={settings} 
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;
