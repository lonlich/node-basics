/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "sessions" RENAME CONSTRAINT "session_pkey" TO "sessions_pkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- RenameForeignKey
ALTER TABLE "games_genres" RENAME CONSTRAINT "fk_games_genres_game" TO "games_genres_game_id_fkey";

-- AddForeignKey
ALTER TABLE "games_genres" ADD CONSTRAINT "games_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
