/*
  Warnings:

  - You are about to drop the column `is_admin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_member` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_admin",
DROP COLUMN "is_member",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
