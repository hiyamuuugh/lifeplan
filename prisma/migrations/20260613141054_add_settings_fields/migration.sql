-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "livingCostGrowthRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "nameChild1" TEXT,
ADD COLUMN     "nameChild2" TEXT,
ADD COLUMN     "nameSelf" TEXT,
ADD COLUMN     "nameSpouse" TEXT,
ADD COLUMN     "salaryGrowthRateSelf" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "salaryGrowthRateSpouse" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
