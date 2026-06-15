-- AlterTable
ALTER TABLE "PlanEvent" ADD COLUMN     "housingCostChange" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "insuranceChange" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "livingCostChange" INTEGER NOT NULL DEFAULT 0;
