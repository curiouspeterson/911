-- CreateTable
CREATE TABLE "public"."assets" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" UUID,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "assigned_at" TIMESTAMPTZ(6),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_serialNumber_key" ON "public"."assets"("serialNumber");

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
