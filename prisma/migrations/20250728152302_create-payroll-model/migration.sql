-- CreateTable
CREATE TABLE "public"."payrolls" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" UUID NOT NULL,
    "pay_rate" DOUBLE PRECISION NOT NULL,
    "pay_period" TEXT NOT NULL,
    "deductions" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."payrolls" ADD CONSTRAINT "payrolls_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
