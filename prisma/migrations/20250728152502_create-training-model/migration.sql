-- CreateTable
CREATE TABLE "public"."trainings" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hours" INTEGER NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."trainings" ADD CONSTRAINT "trainings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
