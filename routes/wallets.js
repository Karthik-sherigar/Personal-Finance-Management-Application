const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Wallet name is required'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO wallets (user_id, name, balance) VALUES (?, ?, 0.00)',
            [userId, name]
        );

        res.status(201).json({
            success: true,
            message: 'Wallet created successfully',
            wallet: {
                id: result.insertId,
                name,
                balance: 0.00
            }
        });
    } catch (error) {
        console.error('Create wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create wallet',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const userId = req.userId;

        const [wallets] = await pool.query(
            'SELECT id, name, balance, created_at FROM wallets WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            wallets
        });
    } catch (error) {
        console.error('Get wallets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve wallets',
            error: error.message
        });
    }
});

router.delete('/:walletId', async (req, res) => {
    try {
        const { walletId } = req.params;
        const userId = req.userId;

        const [wallets] = await pool.query(
            'SELECT id FROM wallets WHERE id = ? AND user_id = ?',
            [walletId, userId]
        );

        if (wallets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found or access denied'
            });
        }

        await pool.query('DELETE FROM wallets WHERE id = ?', [walletId]);

        res.json({
            success: true,
            message: 'Wallet deleted successfully'
        });
    } catch (error) {
        console.error('Delete wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete wallet',
            error: error.message
        });
    }
});

module.exports = router;
