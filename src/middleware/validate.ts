// The validate middleware ensures that the incoming data matches the defined Zod schema. 
// If the data is invalid, it stops the request and sends an error response.

import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import APIResponse from "../utils/api";

const validate =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      APIResponse.error(error.issues[0].message, 400).send(res);
    }
  };

export default validate;
