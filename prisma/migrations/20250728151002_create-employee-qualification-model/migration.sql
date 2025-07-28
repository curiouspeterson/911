-- CreateTable
CREATE TABLE "public"."employee_qualifications" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" UUID NOT NULL,
    "qualification_id" BIGINT NOT NULL,

    CONSTRAINT "employee_qualifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."employee_qualifications" ADD CONSTRAINT "employee_qualifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."employee_qualifications" ADD CONSTRAINT "employee_qualifications_qualification_id_fkey" FOREIGN KEY ("qualification_id") REFERENCES "public"."qualifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
