-- CreateTable
CREATE TABLE "public"."emergency_contacts" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."emergency_contacts" ADD CONSTRAINT "emergency_contacts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
