-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");

-- CreateIndex
CREATE INDEX "games_genres_game_id_idx" ON "games_genres"("game_id");

-- CreateIndex
CREATE INDEX "games_genres_genre_id_idx" ON "games_genres"("genre_id");
