-- CreateTable
CREATE TABLE "public"."reports" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSON NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" UUID NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
