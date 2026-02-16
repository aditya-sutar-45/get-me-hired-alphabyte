-- name: CreateInterviewSession :one
INSERT INTO interview_session(
  id,
  created_at,
  updated_at,
  user_id,
  job_id
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
