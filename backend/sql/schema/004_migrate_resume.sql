-- +goose Up
INSERT INTO user_profiles (user_id, resume_path, parsed_resume)
SELECT id, resume_path, parsed_resume FROM users;

-- +goose Down
INSERT INTO users (id, resume_path, parsed_resume)
SELECT user_id, resume_path, parsed_resume FROM user_profiles
ON CONFLICT (id) DO UPDATE
SET 
  resume_path = EXCLUDED.resume_path,
  parsed_resume = EXCLUDED.parsed_resume;

