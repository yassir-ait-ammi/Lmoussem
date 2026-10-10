import { NextResponse } from "next/server";
import { errorResponse, parse, readJson } from "@/lib/api";
import { createUser } from "@/lib/users";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = parse(signUpSchema, await readJson(request));
    const user = await createUser(input);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
