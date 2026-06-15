import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const body = await req.json();

  const updated = await prisma.plan.update({
    where: { id: planId },
    data: {
      nameSelf: body.nameSelf ?? null,
      nameSpouse: body.nameSpouse ?? null,
      nameChild1: body.nameChild1 ?? null,
      nameChild2: body.nameChild2 ?? null,
      salaryGrowthRateSelf: body.salaryGrowthRateSelf,
      salaryGrowthRateSpouse: body.salaryGrowthRateSpouse,
      livingCostGrowthRate: body.livingCostGrowthRate,
    },
  });

  return NextResponse.json(updated);
}
