-- CreateTable
CREATE TABLE "public"."shift_requirements" (
    "id" BIGSERIAL NOT NULL,
    "shift_id" BIGINT NOT NULL,
    "qualification_id" BIGINT NOT NULL,

    CONSTRAINT "shift_requirements_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."shifts" DROP COLUMN "required_qualification_id";

-- AddForeignKey
ALTER TABLE "public"."shift_requirements" ADD CONSTRAINT "shift_requirements_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shift_requirements" ADD CONSTRAINT "shift_requirements_qualification_id_fkey" FOREIGN KEY ("qualification_id") REFERENCES "public"."qualifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
