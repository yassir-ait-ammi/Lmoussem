import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import {
  cancelRegistration,
  getEvent,
  listParticipants,
  registerForEvent,
} from "@/lib/events";
import { requireAdmin, requireUser } from "@/lib/session";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    await getEvent(id);
    const participants = await listParticipants(id);
    return NextResponse.json({ participants });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(_request: Request, { params }: Context) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const event = await registerForEvent(id, user.id);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const event = await cancelRegistration(id, user.id);
    return NextResponse.json({ event });
  } catch (error) {
    return errorResponse(error);
  }
}
