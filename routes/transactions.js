const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const { walletId, type, amount, category, description, date } = req.body;
        const userId = req.userId;

        if (!walletId || !type || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: 'walletId, type, amount, category, and date are required'
            });
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be either "income" or "expense"'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        const [wallets] = await pool.query(
            'SELECT id, balance FROM wallets WHERE id = ? AND user_id = ?',
            [walletId, userId]
        );

        if (wallets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found or access denied'
            });
        }

        if (type === 'expense' && wallets[0].balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient wallet balance'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO transactions (wallet_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
            [walletId, type, amount, category, description || null, date]
        );

        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            transaction: {
                id: result.insertId,
                walletId,
                type,
                amount,
                category,
                description,
                date
            }
        });
    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add transaction',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        const { walletId, startDate, endDate } = req.query;

        let query = `
            SELECT t.id, t.wallet_id, w.name as wallet_name, t.type, t.amount, 
                   t.category, t.description, t.date, t.created_at
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            WHERE w.user_id = ?
        `;
        const params = [userId];

        if (walletId) {
            query += ' AND t.wallet_id = ?';
            params.push(walletId);
        }

        if (startDate) {
            query += ' AND t.date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND t.date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY t.date DESC, t.created_at DESC';

        const [transactions] = await pool.query(query, params);

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve transactions',
            error: error.message
        });
    }
});

router.delete('/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.userId;

        const [transactions] = await pool.query(
            `SELECT t.id FROM transactions t
             JOIN wallets w ON t.wallet_id = w.id
             WHERE t.id = ? AND w.user_id = ?`,
            [transactionId, userId]
        );

        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or access denied'
            });
        }

        await pool.query('DELETE FROM transactions WHERE id = ?', [transactionId]);

        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete transaction',
            error: error.message
        });
    }
});

router.put('/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { amount, category, description, date } = req.body;
        const userId = req.userId;

        if (!amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: 'amount, category, and date are required'
            });
        }

        const [transactions] = await pool.query(
            `SELECT t.id FROM transactions t
             JOIN wallets w ON t.wallet_id = w.id
             WHERE t.id = ? AND w.user_id = ?`,
            [transactionId, userId]
        );

        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or access denied'
            });
        }

        await pool.query(
            'UPDATE transactions SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?',
            [amount, category, description, date, transactionId]
        );

        res.json({
            success: true,
            message: 'Transaction updated successfully'
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update transaction',
            error: error.message
        });
    }
});

module.exports = router;
