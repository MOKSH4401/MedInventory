# 🏥 MedInventory

MedInventory is a full-stack **MERN-based Medical Pharmacy Inventory Management System** designed to manage medicines, suppliers, sales, and analytics efficiently. It also includes advanced features like demand prediction and online payment integration.

---

## 🚀 Features

### 📊 Dashboard
- Total medicines overview
- Low stock alerts
- Expiring soon notifications
- Restock suggestions
- Sales & restock trend graphs
- Export data to CSV

---

### 💊 Inventory Management
- Add, update, delete medicines
- View expired medicines
- Track stock levels

---

### 🚚 Supplier Management
- Add and manage suppliers
- View supplier details

---

### 🧾 Supplier Purchase
- Record purchases (medicine, company, quantity, expiry, date)
- View purchase history
- Track total purchases

---

### 🎟️ Coupons
- Create discount coupons
- Apply coupons during checkout

---

### 📈 Analytics
- Sales today & monthly sales
- Total orders
- Low stock count
- Top 5 most sold medicines
- Last 7 days sales graph

---

### 📑 Reports
- Sales report
- Profit & Loss report
- Payment report
- Stock report
- Purchase history report

---

### 📊 Sales Analysis
- Most sold medicines
- Least sold medicines
- Top revenue medicines
- Monthly & weekly trends

---

### 🤖 Demand Prediction
- Predicts future medicine demand using Machine Learning
- Helps in smart restocking

---

### 🛒 Product & Checkout
- Add medicines to cart
- Enter user details
- Apply coupons
- Secure payment via Razorpay

---

### 💳 Payment Integration
- Razorpay (Card & UPI)
- Payment verification system

---

### 📩 Notifications
- SMS confirmation (Fast2SMS)
- Email confirmation (Nodemailer)

---

### ⚙️ Settings
- Currency selection
- Light/Dark mode toggle
- View purchase history

---

## 🛠️ Tech Stack

**Frontend:**
- React.js

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB

**Other Integrations:**
- Razorpay (Payments)
- Fast2SMS (SMS)
- Nodemailer (Email)
- Python (Machine Learning for prediction)

---

## 📁 Project Structure
MedInventory/
│
├── client/ # React frontend
├── server/ # Node.js backend
├── ml-module/ # Python prediction module
└── README.md


---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/MedInventory.git
cd MedInventory

2️⃣ Install Dependencies
Backend
cd server
npm install
Frontend
cd client
npm install

3️⃣ Environment Variables
Create a .env file in server/ and add:

MONGO_URI=your_mongodb_connection
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
SMS_API_KEY=your_sms_api_key

4️⃣ Run the Project
Start Backend
cd server
npm start
Start Frontend
cd client
npm start
