#!/usr/bin/env python3
"""
Demand Prediction using Linear Regression.
Fetches PurchaseHistory from MongoDB, aggregates by itemName and date,
trains Linear Regression (X=day number, Y=quantity), predicts next 30 days.
Outputs JSON to stdout.
"""
import os
import sys
import json
from datetime import datetime

import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.linear_model import LinearRegression


def get_mongo_uri():
    uri = os.environ.get("MONGO_URI", "").strip()
    if not uri:
        print(json.dumps({"error": "MONGO_URI not set"}), file=sys.stderr)
        sys.exit(1)
    return uri


def fetch_daily_sales(client):
    """Aggregate PurchaseHistory by itemName and date (purchaseDate), sum quantity."""
    from urllib.parse import urlparse
    uri = get_mongo_uri()
    parsed = urlparse(uri)
    db_name = (parsed.path or "/").strip("/") or "test"
    db = client[db_name]
    coll = db.get_collection("purchasehistories")
    pipeline = [
        {"$match": {"itemName": {"$exists": True, "$ne": None, "$ne": ""}}},
        {
            "$group": {
                "_id": {
                    "itemName": "$itemName",
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$purchaseDate"}},
                },
                "quantity": {"$sum": "$quantity"},
            }
        },
        {"$project": {"_id": 0, "itemName": "$_id.itemName", "date": "$_id.date", "quantity": 1}},
    ]
    cursor = coll.aggregate(pipeline)
    return list(cursor)


def predict_demand_for_item(df, min_days=2):
    """
    Train Linear Regression: X=day number, Y=quantity.
    Predict next 30 days and sum.
    """
    if len(df) < min_days:
        return None
    df = df.sort_values("date").reset_index(drop=True)
    df["day_num"] = np.arange(len(df))
    X = df[["day_num"]].values
    y = df["quantity"].values
    model = LinearRegression()
    model.fit(X, y)
    last_day = len(df) - 1
    future_days = np.array([[last_day + i + 1] for i in range(30)])
    preds = model.predict(future_days)
    preds = np.maximum(preds, 0)
    return int(round(preds.sum()))


def main():
    try:
        uri = get_mongo_uri()
        client = MongoClient(uri)
        records = fetch_daily_sales(client)
        client.close()
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

    if not records:
        print(json.dumps([]))
        return

    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"])
    df = df.groupby(["itemName", "date"])["quantity"].sum().reset_index()

    results = []
    for item_name in df["itemName"].unique():
        item_df = df[df["itemName"] == item_name].copy()
        pred = predict_demand_for_item(item_df)
        if pred is not None:
            results.append({"itemName": item_name, "predictedDemand": pred})

    results.sort(key=lambda x: x["predictedDemand"], reverse=True)
    print(json.dumps(results))


if __name__ == "__main__":
    main()
