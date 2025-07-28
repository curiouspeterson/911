-- CreateTable
CREATE TABLE "public"."help_tickets" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "help_tickets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."help_tickets" ADD CONSTRAINT "help_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
