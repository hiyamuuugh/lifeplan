/*
  Warnings:

  - You are about to drop the `LifeEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LifePlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LifeEvent" DROP CONSTRAINT "LifeEvent_planId_fkey";

-- DropTable
DROP TABLE "LifeEvent";

-- DropTable
DROP TABLE "LifePlan";

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "birthYearSelf" INTEGER NOT NULL,
    "birthYearSpouse" INTEGER NOT NULL,
    "birthYearChild1" INTEGER,
    "birthYearChild2" INTEGER,
    "initialCash" INTEGER NOT NULL DEFAULT 0,
    "initialInvestment" INTEGER NOT NULL DEFAULT 0,
    "baseSalaryself" INTEGER NOT NULL DEFAULT 0,
    "baseSalarySpouse" INTEGER NOT NULL DEFAULT 0,
    "pensionSelf" INTEGER NOT NULL DEFAULT 0,
    "pensionSpouse" INTEGER NOT NULL DEFAULT 0,
    "pensionAgeSelf" INTEGER NOT NULL DEFAULT 65,
    "pensionAgeSpouse" INTEGER NOT NULL DEFAULT 65,
    "retirementAgeSelf" INTEGER NOT NULL DEFAULT 65,
    "retirementAgeSpouse" INTEGER NOT NULL DEFAULT 65,
    "annualLivingCost" INTEGER NOT NULL DEFAULT 0,
    "annualHousingCost" INTEGER NOT NULL DEFAULT 0,
    "annualInsurance" INTEGER NOT NULL DEFAULT 0,
    "investmentRate" DOUBLE PRECISION NOT NULL DEFAULT 3.0,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEvent" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "ageSelf" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "salaryChangeSelf" INTEGER NOT NULL DEFAULT 0,
    "salaryChangeSpouse" INTEGER NOT NULL DEFAULT 0,
    "temporaryIncome" INTEGER NOT NULL DEFAULT 0,
    "eventExpense" INTEGER NOT NULL DEFAULT 0,
    "nisaChange" INTEGER NOT NULL DEFAULT 0,
    "carCostChange" INTEGER NOT NULL DEFAULT 0,
    "mortgageDeduction" INTEGER NOT NULL DEFAULT 0,
    "childAllowanceChange" INTEGER NOT NULL DEFAULT 0,
    "educationCostChange" INTEGER NOT NULL DEFAULT 0,
    "loanRepaymentChange" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlanEvent" ADD CONSTRAINT "PlanEvent_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
