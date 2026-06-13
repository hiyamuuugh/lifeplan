import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ planId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { planId } = await params;
  const body = await request.json();
  const event = await prisma.planEvent.create({ data: { planId, ...body } });
  return NextResponse.json(event, { status: 201 });
}
