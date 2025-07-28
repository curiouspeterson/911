-- AlterTable
ALTER TABLE "public"."employees" ADD COLUMN     "department_id" BIGINT;
ALTER TABLE "public"."employees" DROP COLUMN "department";

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
