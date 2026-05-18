import { ZodError } from 'zod';

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error.issues || [];

    const message =
      issues.length > 0
        ? `${issues[0].path.join('.')}: ${issues[0].message}`
        : 'Validation failed';

    return res.status(400).json({
      success: false,
      message,
    });
  }

  req.body = result.data;
  next();
};

export default validate;


