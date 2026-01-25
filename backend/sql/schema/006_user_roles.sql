-- +goose Up
ALTER TABLE users
ADD role TEXT NOT NULL DEFAULT 'user';

-- +goose Down
ALTER TABLE users
DROP COLUMN role;
