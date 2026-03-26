import express from 'express';
import {
  submitExam,
  getMySubmissions,
  getExamSubmissions,
} from '../controllers/submissionController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/my').get(protect, getMySubmissions);
router.route('/:examId').post(protect, submitExam);
router.route('/exam/:examId').get(protect, teacher, getExamSubmissions);

export default router;
