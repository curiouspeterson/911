-- CreateTable
CREATE TABLE "public"."departments" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "public"."departments"("name");

-- AlterTable
ALTER TABLE "public"."shifts" ADD COLUMN     "department_id" BIGINT;
ALTER TABLE "public"."shifts" DROP COLUMN "department";

-- AddForeignKey
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
