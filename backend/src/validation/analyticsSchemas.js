import { z } from 'zod';
import { objectIdSchema } from './commonSchemas.js';

export const analyticsExamParamsSchema = {
  params: z.object({
    examId: objectIdSchema,
  }),
};
