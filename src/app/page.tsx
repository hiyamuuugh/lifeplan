import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/HomeClient";

export default async function Home() {
  const plans = await prisma.plan.findMany({ orderBy: { createdAt: "desc" } });
  return <HomeClient initialPlans={plans} />;
}
