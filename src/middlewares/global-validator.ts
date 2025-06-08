import { Context, Next } from "hono";
import { z } from "zod/v4";
import { BadRequestError } from "@/utils/custom-error";
type ValidationTarget = "json" | "query" | "param" | "header";

interface ValidationError {
  success: false;
  error: {
    message: string;
    issues: any[];
  };
}

export const validator = <T extends z.ZodSchema>(
  target: ValidationTarget,
  schema: T,
) => {
  return async (c: Context, next: Next) => {
    try {
      let data: unknown;

      switch (target) {
        case "json":
          data = await c.req.json();
          break;
        case "query":
          data = c.req.query();
          break;
        case "param":
          data = c.req.param();
          break;
        case "header":
          data = Object.fromEntries(c.req.raw.headers.entries());
          break;
        default:
          throw new BadRequestError("Invalid validation target");
      }

      const result = schema.safeParse(data);

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: {
              message: "Validation failed",
              issues: result.error.issues || [],
            },
          } as ValidationError,
          400,
        );
      }

      c.set(`validated_${target}`, result.data);
      await next();
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            message: "Invalid request format",
            issues: [],
          },
        } as ValidationError,
        400,
      );
    }
  };
};

// Convenience functions for common use cases
export const validateJson = <T extends z.ZodSchema>(schema: T) =>
  validator("json", schema);

export const validateQuery = <T extends z.ZodSchema>(schema: T) =>
  validator("query", schema);

export const validateParam = <T extends z.ZodSchema>(schema: T) =>
  validator("param", schema);

export const validateHeader = <T extends z.ZodSchema>(schema: T) =>
  validator("header", schema);

// Helper to get validated data from context
export const getValidatedData = <T>(
  c: Context,
  target: ValidationTarget,
): T => {
  return c.get(`validated_${target}`) as T;
};
