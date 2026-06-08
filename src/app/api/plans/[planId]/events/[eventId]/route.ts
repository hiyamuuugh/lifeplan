import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ planId: string; eventId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { eventId } = await params;
  const body = await request.json();
  const event = await prisma.lifeEvent.update({
    where: { id: eventId },
    data: {
      age: body.age,
      title: body.title,
      description: body.description ?? null,
      income: body.income ?? 0,
      expense: body.expense ?? 0,
      category: body.category,
    },
  });
  return NextResponse.json(event);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { eventId } = await params;
  await prisma.lifeEvent.delete({ where: { id: eventId } });
  return new NextResponse(null, { status: 204 });
}
