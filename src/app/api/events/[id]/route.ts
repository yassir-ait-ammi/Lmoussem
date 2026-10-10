import { NextResponse } from "next/server";
import { errorResponse, parse, readJson } from "@/lib/api";
import { deleteEvent, getEvent, updateEvent } from "@/lib/events";
import { getCurrentUser, requireAdmin } from "@/lib/session";
import { eventSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const event = await getEvent(id, user?.id);
    return NextResponse.json({ event });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = parse(eventSchema, await readJson(request));
    const event = await updateEvent(id, input);
    return NextResponse.json({ event });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteEvent(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
