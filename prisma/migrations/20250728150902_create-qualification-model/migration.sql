-- CreateTable
CREATE TABLE "public"."qualifications" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qualifications_name_key" ON "public"."qualifications"("name");

-- AlterTable
ALTER TABLE "public"."shifts" ADD COLUMN     "required_qualification_id" BIGINT;
ALTER TABLE "public"."shifts" DROP COLUMN "required_qualification";

-- AddForeignKey
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_required_qualification_id_fkey" FOREIGN KEY ("required_qualification_id") REFERENCES "public"."qualifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
