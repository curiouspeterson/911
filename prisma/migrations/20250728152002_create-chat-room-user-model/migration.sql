-- CreateTable
CREATE TABLE "public"."chat_room_users" (
    "id" BIGSERIAL NOT NULL,
    "chat_room_id" BIGINT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "chat_room_users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."chat_room_users" ADD CONSTRAINT "chat_room_users_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."chat_room_users" ADD CONSTRAINT "chat_room_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
