import { NextResponse } from "next/server";
import type { z } from "zod";
import { AppError } from "./errors";
import { fieldErrors } from "./validation";

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      },
      { status: error.status },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong" } },
    { status: 500 },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError("VALIDATION", "The request body must be valid JSON");
  }
}

export function parse<Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(
      "VALIDATION",
      "Some fields are invalid",
      fieldErrors(result.error),
    );
  }
  return result.data;
}
