import express from 'express';
import {
  getGlobalAnalytics,
  getExamAnalytics
} from '../controllers/analyticsController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { analyticsExamParamsSchema } from '../validation/analyticsSchemas.js';

const router = express.Router();

router.route('/').get(protect, teacher, getGlobalAnalytics);
router.route('/exam/:examId').get(protect, teacher, validate(analyticsExamParamsSchema), getExamAnalytics);

export default router;
