# Demand Prediction ML Service

Python script for medicine demand prediction using Linear Regression.

## Setup

1. Install Python 3.8+
2. Install dependencies:
   ```bash
   cd server/ml
   pip install -r requirements.txt
   ```

## How it works

- Connects to MongoDB using `MONGO_URI` from environment
- Aggregates `PurchaseHistory` by itemName and date (purchaseDate)
- For each medicine: trains Linear Regression (X=day number, Y=quantity sold)
- Predicts next 30 days and sums for total predicted demand
- Outputs JSON to stdout

## Usage

The script is invoked by the Node.js API (`GET /api/ml/predictions`). Ensure `MONGO_URI` is set in your `.env`.
