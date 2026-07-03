import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/authMiddleware.js';
import {
  createScan,
  getAllScans,
  getScanById,
  deleteScan,
  getDashboardStats,
} from '../controllers/scanController.js';

const router = Router();

// Strict rate limiter for scan creation (expensive AI calls)
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 scans per 15 minutes per IP
  message: {
    error: 'Too many scan requests. Please wait before creating more scans.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes protected
router.use(protect);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Create new scan (with strict rate limit)
router.post('/scan', scanLimiter, createScan);

// Get all scans for user
router.get('/scans', getAllScans);

// Get single scan + vulnerabilities
router.get('/scans/:id', getScanById);

// Delete scan
router.delete('/scans/:id', deleteScan);

export default router;
