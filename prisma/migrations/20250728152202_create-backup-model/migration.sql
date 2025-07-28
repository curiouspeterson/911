-- CreateTable
CREATE TABLE "public"."backups" (
    "id" BIGSERIAL NOT NULL,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);
