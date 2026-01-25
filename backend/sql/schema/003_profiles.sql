-- +goose Up
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_path TEXT,
  parsed_resume TEXT
);

CREATE TABLE company_profiles (
  user_id UUID PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT NOT NULL,
  company_description TEXT NOT NULL
);



-- +goose Down
DROP TABLE user_profiles;
DROP TABLE company_profiles;
