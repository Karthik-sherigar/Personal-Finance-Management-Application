const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const { category, amount, month } = req.body;
        const userId = req.userId;

        if (!category || !amount || !month) {
            return res.status(400).json({
                success: false,
                message: 'Category, amount, and month are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        const monthDate = new Date(month);
        if (isNaN(monthDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid month format. Use YYYY-MM-DD (e.g., 2025-12-01)'
            });
        }

        await pool.query(
            `INSERT INTO budgets (user_id, category, amount, month) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE amount = ?`,
            [userId, category, amount, month, amount]
        );

        res.status(201).json({
            success: true,
            message: 'Budget set successfully',
            budget: {
                category,
                amount,
                month
            }
        });
    } catch (error) {
        console.error('Set budget error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set budget',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        const { month } = req.query;

        const targetMonth = month || new Date().toISOString().slice(0, 7) + '-01';

        const [budgets] = await pool.query(
            `SELECT 
                b.id,
                b.category,
                b.amount as budget_amount,
                b.month,
                COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as spent,
                b.amount - COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as remaining,
                CASE 
                    WHEN COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) >= b.amount 
                    THEN 'exceeded'
                    WHEN COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) >= b.amount * 0.8 
                    THEN 'approaching'
                    ELSE 'safe'
                END as status
            FROM budgets b
            LEFT JOIN wallets w ON w.user_id = b.user_id
            LEFT JOIN transactions t ON t.wallet_id = w.id 
                AND t.category = b.category 
                AND t.type = 'expense'
                AND DATE_FORMAT(t.date, '%Y-%m-01') = b.month
            WHERE b.user_id = ? AND b.month = ?
            GROUP BY b.id, b.category, b.amount, b.month
            ORDER BY b.category`,
            [userId, targetMonth]
        );

        const budgetsWithNotifications = budgets.map(budget => ({
            ...budget,
            notification: budget.status === 'exceeded'
                ? `⚠️ Budget exceeded for ${budget.category}!`
                : budget.status === 'approaching'
                    ? `⚡ Approaching budget limit for ${budget.category}`
                    : null
        }));

        res.json({
            success: true,
            month: targetMonth,
            budgets: budgetsWithNotifications
        });
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve budgets',
            error: error.message
        });
    }
});

module.exports = router;
