-- CreateTable
CREATE TABLE "public"."surveys" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "responses" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
