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

-- name: UpdateInterviewSession :one
UPDATE interview_session
SET
  status = $2,
  transcript = $3,
  user_feedbacks = $4,
  hints_used = $5,
  submitted_code = $6,
  updated_at = NOW()
WHERE id = $1
RETURNING *;
