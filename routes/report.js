const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        const { month } = req.query;

        const now = new Date();
        const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const startDate = `${targetMonth}-01`;
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

        const [summary] = await pool.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses,
                COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as net_savings
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            WHERE w.user_id = ? 
                AND t.date >= ? 
                AND t.date <= ?`,
            [userId, startDate, endDate]
        );

        const [categoryBreakdown] = await pool.query(
            `SELECT 
                category,
                SUM(amount) as total,
                COUNT(*) as transaction_count
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            WHERE w.user_id = ? 
                AND t.type = 'expense'
                AND t.date >= ? 
                AND t.date <= ?
            GROUP BY category
            ORDER BY total DESC`,
            [userId, startDate, endDate]
        );

        res.json({
            success: true,
            month: targetMonth,
            period: {
                start: startDate,
                end: endDate
            },
            summary: {
                total_income: parseFloat(summary[0].total_income),
                total_expenses: parseFloat(summary[0].total_expenses),
                net_savings: parseFloat(summary[0].net_savings),
                savings_rate: summary[0].total_income > 0
                    ? ((summary[0].net_savings / summary[0].total_income) * 100).toFixed(2) + '%'
                    : '0%'
            },
            expense_breakdown: categoryBreakdown.map(cat => ({
                category: cat.category,
                total: parseFloat(cat.total),
                transaction_count: cat.transaction_count
            }))
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
});

module.exports = router;
