import { z } from 'zod';
import { objectIdSchema } from './commonSchemas.js';

const optionSchema = z.object({
  text: z.string().trim().min(1, 'Option text is required'),
});

export const createExamSchema = {
  body: z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters long').max(150, 'Title is too long'),
    description: z.string().trim().max(1000, 'Description is too long').optional().default(''),
    duration: z.number().int('Duration must be an integer').min(1, 'Duration must be at least 1 minute').max(600, 'Duration cannot exceed 600 minutes'),
  }),
};

export const examIdParamsSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

export const updateExamSchema = {
  body: z
    .object({
      title: z.string().trim().min(3, 'Title must be at least 3 characters long').max(150, 'Title is too long').optional(),
      description: z.string().trim().max(1000, 'Description is too long').optional(),
      duration: z.number().int('Duration must be an integer').min(1, 'Duration must be at least 1 minute').max(600, 'Duration cannot exceed 600 minutes').optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one exam field is required for update',
    }),
};

export const addQuestionSchema = {
  body: z.object({
    text: z.string().trim().min(1, 'Question text is required').max(1500, 'Question text is too long'),
    options: z.array(optionSchema).length(4, 'Exactly 4 options are required'),
    correctAnswer: z.number().int('Correct answer must be an integer').min(0).max(3),
    marks: z.number().min(0.5, 'Marks must be at least 0.5').max(100).optional(),
    negativeMarks: z.number().min(0, 'Negative marks cannot be negative').max(100).optional(),
  }),
};

export const questionIdParamsSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

export const updateQuestionSchema = {
  body: z
    .object({
      text: z.string().trim().min(1, 'Question text is required').max(1500, 'Question text is too long').optional(),
      options: z.array(optionSchema).length(4, 'Exactly 4 options are required').optional(),
      correctAnswer: z.number().int('Correct answer must be an integer').min(0).max(3).optional(),
      marks: z.number().min(0.5, 'Marks must be at least 0.5').max(100).optional(),
      negativeMarks: z.number().min(0, 'Negative marks cannot be negative').max(100).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one question field is required for update',
    }),
};
