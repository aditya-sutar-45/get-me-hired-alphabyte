-- name: CreateUser :one
INSERT INTO users (
  id,
  created_at,
  updated_at,
  username,
  password,
  email,
  role
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: CreateUserProfile :one
INSERT INTO user_profiles (
  user_id,
  resume_path,
  parsed_resume
)
VALUES ($1, $2, $3)
RETURNING *;

-- name: CreateCompanyProfile :one
INSERT INTO company_profiles (
  user_id,
  company_name,
  company_website,
  company_description
)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: GetUserProfileByID :one
SELECT * FROM user_profiles WHERE user_id = $1;

-- name: GetCompanyProfileByID :one
SELECT * FROM company_profiles WHERE user_id = $1;

