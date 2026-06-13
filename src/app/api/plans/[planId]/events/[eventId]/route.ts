import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ planId: string; eventId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { eventId } = await params;
  const body = await request.json();
  const event = await prisma.planEvent.update({ where: { id: eventId }, data: body });
  return NextResponse.json(event);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { eventId } = await params;
  await prisma.planEvent.delete({ where: { id: eventId } });
  return new NextResponse(null, { status: 204 });
}
