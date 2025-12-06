# Personal Finance Management Backend

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. MySQL Setup

Install MySQL:

```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

Configure MySQL:

```bash
sudo mysql
```

Run these commands:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

Create database:

```bash
mysql -u root < database/schema.sql
```

### 3. Run Application

```bash
npm start
```

Server runs on `http://localhost:3000`
