/*
  Warnings:

  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_admin" BOOLEAN DEFAULT false,
ALTER COLUMN "username" SET NOT NULL;
