import express from 'express';
import {
  createExam,
  getExams,
  getExamById,
  addQuestion,
  updateExam,
  deleteExam,
  updateQuestion,
  deleteQuestion,
} from '../controllers/examController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  createExamSchema,
  examIdParamsSchema,
  updateExamSchema,
  addQuestionSchema,
  questionIdParamsSchema,
  updateQuestionSchema,
} from '../validation/examSchemas.js';

const router = express.Router();

router.route('/')
  .post(protect, teacher, validate(createExamSchema), createExam)
  .get(protect, getExams);

router.route('/:id')
  .get(protect, validate(examIdParamsSchema), getExamById)
  .put(protect, teacher, validate(examIdParamsSchema), validate(updateExamSchema), updateExam)
  .delete(protect, teacher, validate(examIdParamsSchema), deleteExam);

router.route('/:id/questions')
  .post(protect, teacher, validate(examIdParamsSchema), validate(addQuestionSchema), addQuestion);

router.route('/questions/:id')
  .put(protect, teacher, validate(questionIdParamsSchema), validate(updateQuestionSchema), updateQuestion)
  .delete(protect, teacher, validate(questionIdParamsSchema), deleteQuestion);

export default router;
