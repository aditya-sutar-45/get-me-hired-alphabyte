-- +goose Up
ALTER TABLE users
DROP COLUMN resume_path,
DROP COLUMN parsed_resume;

-- +goose Down
ALTER TABLE users
ADD resume_path TEXT,
ADD parsed_resume TEXT;
