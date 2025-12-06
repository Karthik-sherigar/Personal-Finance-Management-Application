# Personal Finance Management Backend

A Node.js backend API for managing personal finances with wallets, transactions, budgets, and financial reports.

## Setup Instructions

Follow these steps to run the project:

### Step 1: Install Node.js Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then edit the `.env` file if needed:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Leave empty if no password, or add your MySQL password
DB_NAME=personal_finance

JWT_SECRET=your_jwt_secret_key_here    # Change this to a secure random string
JWT_EXPIRES_IN=24h
```

**Important:** If you set a MySQL password, update `DB_PASSWORD` in the `.env` file.

### Step 3: Install MySQL

**For Linux/Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

**For Windows:**
- Download MySQL from: https://dev.mysql.com/downloads/installer/
- Install and start MySQL service

### Step 4: Configure MySQL

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

### Step 5: Create Database

```bash
mysql -u root < database/schema.sql
```

If prompted for password, just press Enter (if you didn't set one).

### Step 6: Start the Server

```bash
npm start
```

Server will run on: `http://localhost:3000`

You should see:
```
✅ Database connected successfully
🚀 Server running on http://localhost:3000
```

## Testing with Postman

1. Open Postman
2. Click **Import**
3. Select `Personal Finance API.postman_collection.json`
4. The collection will have `base_url` pre-configured
5. Test the endpoints in this order:
   - Register User
   - Login User (token auto-saves)
   - Create Wallet
   - Add Transaction
   - Set Budget
   - View Report

## Postman Collection Setup

After importing the Postman collection:

1. Click on the **"Personal Finance API"** collection
2. Go to **"Variables"** tab
3. Verify `base_url` is set to: `http://localhost:3000/api`
4. Click **"Save"**

Now all requests will work!

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
├── .env             # Environment variables (create from .env.example)
└── .env.example     # Environment template
```

## Troubleshooting

**Database connection error:**
- Make sure MySQL is running: `sudo systemctl start mysql`
- Check `.env` file has correct database credentials

**Port 3000 already in use:**
```bash
sudo lsof -ti:3000 | xargs kill -9
```

**404 Route not found in Postman:**
- Make sure server is running
- Check `base_url` variable in Postman collection
- Don't add trailing slashes to URLs

## Author

Karthik Sherigar
