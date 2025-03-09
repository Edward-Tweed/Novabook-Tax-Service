# **Novabook Tax Service**

## **📌 Overview**

Novabook Tax Service is a lightweight, in-memory API with a frontend interface designed to:

- **Record sales transactions and tax payments**
- **Compute the tax position at any given date**
- **Handle sales amendments, even if the original transaction is missing**
- **Operate fully offline with no external dependencies or databases**

This project follows **strict validation, clear logging, and structured API design** to meet the Novabook technical task requirements.

---

## **⚡️ Getting Started**

### **🔧 Setup Instructions**

1. **Clone the Repository**

   ```sh
   git clone [<repository-url>](https://github.com/Edward-Tweed/Novabook-Tax-Service)
   cd novabook-tax-service
   ```

2. **Install Dependencies**

   ```sh
   npm install
   ```

3. **Run the Development Server**

   ```sh
   npm run dev
   ```

   The app will be available at: **`http://localhost:3000`**

---

## **🛠 API Endpoints**

### **1. Record a Transaction**

#### **`POST /api/transactions`**

- Records **sales transactions** and **tax payments**.

**Example Request (Sales Transaction):**

```json
{
  "eventType": "SALES",
  "date": "2024-02-01T12:00:00Z",
  "invoiceId": "INV100",
  "items": [{ "itemId": "A1", "cost": 100, "taxRate": 0.2 }]
}
```

**Example Request (Tax Payment):**

```json
{
  "eventType": "TAX_PAYMENT",
  "date": "2024-02-05T12:00:00Z",
  "paymentAmount": 5000
}
```

**Response:**

```json
{
  "message": "Transaction received"
}
```

---

### **2. Retrieve Tax Position**

#### **`GET /api/tax-position?date=YYYY-MM-DDTHH:mm:ssZ`**

- Returns **total sales tax collected minus tax payments** up to the given date.

**Example Request:**

```sh
curl -X GET "http://localhost:3000/api/tax-position?date=2024-02-06T23:59:59Z"
```

**Example Response:**

```json
{
  "date": "2024-02-06T23:59:59Z",
  "taxPosition": 120
}
```

---

### **3. Amend a Sales Transaction**

#### **`PATCH /api/sale`**

- Updates an **existing sale** or **stores an amendment if the sale does not exist yet**.

**Example Request:**

```json
{
  "eventType": "SALES",
  "date": "2024-02-01T12:00:00Z",
  "invoiceId": "INV100",
  "items": [{ "itemId": "A1", "cost": 200, "taxRate": 0.15 }]
}
```

**Response:**

```json
{
  "message": "Sale amendment received"
}
```

---

## **📜 Assumptions & Design Choices**

✔ **Transactions & amendments are stored in memory** (No database required).\
✔ **Sales tax is calculated as:** `cost * taxRate`.\
✔ **Tax position is the net of sales tax collected minus tax payments.**\
✔ **Sales amendments can be applied before the original transaction exists.**\
✔ **Validation enforces correct data formats (ISO date, numeric values, etc.).**\
✔ **No authentication or user management is required.**

---

## **📌 Error Handling**

| **Scenario**                | **Error Message**                       | **Status Code** |
| --------------------------- | --------------------------------------- | --------------- |
| **Invalid HTTP Method**     | `"Method Not Allowed"`                  | `405`           |
| **Missing Required Fields** | `"Missing invoiceId in sale amendment"` | `400`           |
| **Invalid Event Type**      | `"Unknown event type"`                  | `400`           |
| **Invalid Date Format**     | `"Invalid date format"`                 | `400`           |

---

## **🚀 Frontend Instructions**

The project includes a frontend for interacting with the API. To start the UI:

1. **Run the frontend:**

   ```sh
   npm run dev
   ```

2. **Functionality Overview:**

   - Record new sales transactions.
   - Amend existing sales transactions.
   - Pay tax and update tax position.
   - Query tax position on a specific date.

---
