import express from 'express';
import {
  createExam,
  getExams,
  getExamById,
  addQuestion,
} from '../controllers/examController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, teacher, createExam)
  .get(protect, getExams);

router.route('/:id')
  .get(protect, getExamById);

router.route('/:id/questions')
  .post(protect, teacher, addQuestion);

export default router;
