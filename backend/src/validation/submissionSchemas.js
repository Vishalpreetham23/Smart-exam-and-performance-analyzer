import { z } from 'zod';
import { objectIdSchema } from './commonSchemas.js';

const answerSchema = z.object({
  questionId: objectIdSchema,
  selectedOption: z.number().int('Selected option must be an integer').min(0).max(3).nullable(),
});

export const submitExamSchema = {
  params: z.object({
    examId: objectIdSchema,
  }),
  body: z.object({
    answers: z.array(answerSchema),
    timeTaken: z.number().int('Time taken must be an integer').min(1).max(1440).optional(),
  }),
};

export const submissionIdParamsSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

export const examSubmissionParamsSchema = {
  params: z.object({
    examId: objectIdSchema,
  }),
};
