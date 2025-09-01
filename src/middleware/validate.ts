import { ZodTypeAny } from "zod"; // 👈 changed from AnyZodObject
import { Request, Response, NextFunction } from "express";
import APIResponse from "../utils/api";

const validate =
  (schema: ZodTypeAny) => // 👈 this now accepts any Zod schema (including ZodEffects)
  (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      console.log(req.params)

      next();
    } catch (error: any) {
      if (error.issues && error.issues.length > 0) {
        const firstError = error.issues[0];
        const fieldPath = firstError.path.join(".");
        const message = `${fieldPath}: ${firstError.message}`;
        return APIResponse.error(message, 400).send(res);
      }

      return APIResponse.error("Validation failed", 400).send(res);
    }
  };

export default validate;
