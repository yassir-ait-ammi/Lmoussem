import { NextResponse } from "next/server";
import { errorResponse, parse, readJson } from "@/lib/api";
import { createEvent, listEvents } from "@/lib/events";
import { getCurrentUser, requireAdmin } from "@/lib/session";
import { eventFiltersSchema, eventSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const filters = parse(eventFiltersSchema, params);
    const user = await getCurrentUser();
    const events = await listEvents(filters, user?.id);
    return NextResponse.json({ events });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = parse(eventSchema, await readJson(request));
    const event = await createEvent(input);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
