-- AlterTable
ALTER TABLE "public"."employee_roles" DROP CONSTRAINT "employee_roles_pkey";
ALTER TABLE "public"."employee_roles" ADD COLUMN     "id" BIGSERIAL NOT NULL;
ALTER TABLE "public"."employee_roles" ADD CONSTRAINT "employee_roles_pkey" PRIMARY KEY ("id");
