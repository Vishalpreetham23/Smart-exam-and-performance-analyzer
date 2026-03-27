import express from 'express';
import {
  submitExam,
  getMySubmissions,
  getExamSubmissions,
  getSubmissionById,
} from '../controllers/submissionController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  submitExamSchema,
  submissionIdParamsSchema,
  examSubmissionParamsSchema,
} from '../validation/submissionSchemas.js';

const router = express.Router();

router.route('/my').get(protect, getMySubmissions);
router.route('/:id').get(protect, validate(submissionIdParamsSchema), getSubmissionById);
router.route('/:examId').post(protect, validate(submitExamSchema), submitExam);
router.route('/exam/:examId').get(protect, teacher, validate(examSubmissionParamsSchema), getExamSubmissions);

export default router;
