import { NextFunction, Request, Response } from 'express';
import { TypeOf, ZodError, ZodObject, ZodRawShape } from 'zod';

/**
 * Middleware to validate req.body against a Zod object schema
 * @param schema - Zod object schema
 */
export const validate =
  <T extends ZodRawShape>(schema: ZodObject<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and replace req.body with the validated type
      req.body = schema.parse(req.body) as TypeOf<typeof schema>;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: err.issues,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error during validation',
      });
    }
  };
