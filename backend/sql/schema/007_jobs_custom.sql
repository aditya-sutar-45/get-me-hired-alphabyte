-- +goose Up
ALTER TABLE jobs
ADD custom_interview BOOLEAN NOT NULL DEFAULT false;

-- +goose Down
ALTER TABLE users
DROP COLUMN custom_interview;
