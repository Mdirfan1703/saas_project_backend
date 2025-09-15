// routes/tenants.js
import express from 'express';
import { upgradeTenant } from '../controllers/tenantController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/:slug/upgrade', authenticateToken, requireRole(['admin']), upgradeTenant);

export default router;
