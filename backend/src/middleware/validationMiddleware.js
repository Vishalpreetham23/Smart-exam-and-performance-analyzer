export const validate = (schemas) => {
  return (req, res, next) => {
    const targets = ['params', 'query', 'body'];

    for (const target of targets) {
      const schema = schemas?.[target];
      if (!schema) continue;

      const parsed = schema.safeParse(req[target]);
      if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400);
        return next(new Error(`Validation failed: ${details[0]?.message || 'Invalid request payload'}`));
      }

      req[target] = parsed.data;
    }

    next();
  };
};
