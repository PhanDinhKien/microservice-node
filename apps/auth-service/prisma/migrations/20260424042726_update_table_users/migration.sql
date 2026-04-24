-- AlterTable
ALTER TABLE "users" 
  ADD COLUMN     "last_password_change" TIMESTAMP(3),
  ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;
