-- +goose Up
CREATE TYPE interview_status AS ENUM ('ongoing', 'completed', 'incomplete');

CREATE TABLE interview_session (
  id UUID PRIMARY KEY,
  status interview_status NOT NULL DEFAULT 'ongoing',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  transcript JSONB,
  user_feedbacks JSONB,
  hints_used JSONB,
  submitted_code JSONB
);


-- +goose Down

DROP TABLE interview_session;

DROP TYPE interview_status;
