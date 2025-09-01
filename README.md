# Zenya

**A wallet and payment platform**

---

## Project Overview

Zenya is a modern wallet and payment platform that allows users to:  
- Create digital wallets  
- Deposit funds  
- Withdraw money  
- Transfer between wallets  
- Track all transactions  

The platform is designed to be **secure, scalable, and easy to use**, making it ideal for personal finance management or fintech applications.

---

## Features

- **User Wallets**: Each user has one or more wallets in different currencies.  
- **Transactions**: Full transaction history for deposits, withdrawals, and transfers.  
- **Wallet Management**: Freeze/unfreeze wallets for security or administrative purposes.  
- **Secure Operations**: All balance updates are tracked in transaction logs.  

---

## Tech Stack

- Node.js & Express.js  
- MongoDB & Mongoose  
- TypeScript  
- RESTful API  

---

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/your-username/zenya.git
cd zenya
```

2. **Install dependencies**
```bash
npm install
```

3. **Create a `.env` file**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```


4. **Start the server**
 ```bash
npm run dev
```

## API Endpoints

**Wallet Routes**  
- `POST /wallets` → Create a wallet  
- `GET /wallets/:walletId` → Get wallet by ID  
- `GET /wallets/user/:userId` → Get all wallets for a user  
- `PUT /wallets/:walletId` → Update wallet  
- `PATCH /wallets/:walletId/freeze` → Freeze a wallet  
- `PATCH /wallets/:walletId/unfreeze` → Unfreeze a wallet  
- `DELETE /wallets/:walletId` → Delete a wallet  

**Transaction Routes**  
- `POST /transactions/deposit` → Deposit to wallet  
- `POST /transactions/withdraw` → Withdraw from wallet  
- `POST /transactions/transfer` → Transfer between wallets  
- `GET /transactions/:transactionId` → Get transaction by ID  
- `GET /transactions/user/:userId` → Get all transactions for a user  

## Contributing
Contributions are welcome! Please fork the repository and create a pull request.

## License
This project is licensed under the MIT License.




