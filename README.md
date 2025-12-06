# Personal Finance Management Backend

A Node.js backend API for managing personal finances with wallets, transactions, budgets, and financial reports.

## Setup Instructions

Follow these steps to run the project:

### Step 1: Install Node.js Dependencies

```bash
npm install
```

### Step 2: Install MySQL

**For Linux/Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

**For Windows:**
- Download MySQL from: https://dev.mysql.com/downloads/installer/
- Install and start MySQL service

### Step 3: Configure MySQL

Open MySQL:
```bash
sudo mysql
```

Run these commands:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Create Database

```bash
mysql -u root < database/schema.sql
```

If prompted for password, just press Enter.

### Step 5: Start the Server

```bash
npm start
```

Server will run on: `http://localhost:3000`

## Testing with Postman

1. Open Postman
2. Click **Import**
3. Select `Personal Finance API.postman_collection.json`
4. Test the endpoints in this order:
   - Register User
   - Login User
   - Create Wallet
   - Add Transaction
   - Set Budget
   - View Report

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Wallets
- `POST /api/wallets` - Create wallet
- `GET /api/wallets` - Get all wallets
- `DELETE /api/wallets/:id` - Delete wallet

### Transactions
- `POST /api/transactions` - Add transaction
- `GET /api/transactions` - Get transactions
- `PUT /api/transactions/:id` - Edit transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `POST /api/budgets` - Set budget
- `GET /api/budgets` - Get budgets

### Reports
- `GET /api/report` - Get financial report

## Project Structure

```
├── config/          # Database configuration
├── database/        # SQL schema
├── middleware/      # Authentication
├── routes/          # API endpoints
├── server.js        # Main application
└── .env.example     # Environment template
```

## Author

Karthik Sherigar

## Postman Collection Setup

After importing the Postman collection:

1. Click on the **"Personal Finance API"** collection
2. Go to **"Variables"** tab
3. Add this variable:
   - Variable: `base_url`
   - Initial Value: `http://localhost:3000/api`
   - Current Value: `http://localhost:3000/api`
4. Click **"Save"**

Now all requests will work!
