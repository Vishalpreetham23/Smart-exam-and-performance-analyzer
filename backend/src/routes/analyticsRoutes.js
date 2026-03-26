import express from 'express';
import {
  getGlobalAnalytics,
  getExamAnalytics
} from '../controllers/analyticsController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, teacher, getGlobalAnalytics);
router.route('/exam/:examId').get(protect, teacher, getExamAnalytics);

export default router;
