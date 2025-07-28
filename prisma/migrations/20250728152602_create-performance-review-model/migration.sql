-- CreateTable
CREATE TABLE "public"."performance_reviews" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" UUID NOT NULL,
    "review_date" DATE NOT NULL,
    "reviewer" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
