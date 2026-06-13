-- CreateTable
CREATE TABLE "LifePlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeEvent" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "income" INTEGER NOT NULL DEFAULT 0,
    "expense" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LifeEvent" ADD CONSTRAINT "LifeEvent_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LifePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
