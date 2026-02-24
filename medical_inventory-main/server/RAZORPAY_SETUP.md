# Razorpay Payment Integration

## Setup

1. Create an account at [Razorpay](https://razorpay.com/) and get your **Test/Live** keys from [Dashboard → API Keys](https://dashboard.razorpay.com/app/keys).

2. In the server `.env` file, set:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   ```

3. Restart the server after updating `.env`.

## Flow

- **Card / UPI**: On "Complete Purchase", a Razorpay checkout opens. After successful payment, the invoice is generated and the cart is cleared.
- **Cash**: Same as before — invoice is generated and checkout completes without Razorpay.

## API Endpoints

- `POST /api/cart/create-order` — Creates a Razorpay order (body: `{ amount }` in rupees).
- `POST /api/cart/verify-payment` — Verifies payment signature and completes checkout (body: Razorpay response + `buyerName`, `buyerPhone`, `paymentMode`).
