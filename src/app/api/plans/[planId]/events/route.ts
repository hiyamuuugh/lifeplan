import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ planId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { planId } = await params;
  const body = await request.json();
  const event = await prisma.lifeEvent.create({
    data: {
      planId,
      age: body.age,
      title: body.title,
      description: body.description ?? null,
      income: body.income ?? 0,
      expense: body.expense ?? 0,
      category: body.category,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
