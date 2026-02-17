package models

import (
	"encoding/json"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/google/uuid"
)

type CreateInterview struct {
	ID        uuid.UUID `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	UserID    uuid.UUID `json:"user_id"`
	JobID     uuid.UUID `json:"job_id"`
}

type InterviewSession struct {
	ID            uuid.UUID                `json:"id"`
	Status        database.InterviewStatus `json:"status"`
	CreatedAt     time.Time                `json:"created_at"`
	UpdatedAt     time.Time                `json:"updated_at"`
	UserID        uuid.UUID                `json:"user_id"`
	JobID         uuid.UUID                `json:"job_id"`
	Transcript    json.RawMessage          `json:"transcript"`
	UserFeedbacks json.RawMessage          `json:"user_feedbacks"`
	HintsUsed     json.RawMessage          `json:"hints_used"`
	SubmittedCode json.RawMessage          `json:"Submitted_code"`
}

func DatabaseCreateInterviewToCreateInterview(i database.InterviewSession) CreateInterview {
	return CreateInterview{
		ID:        i.ID,
		CreatedAt: i.CreatedAt,
		UpdatedAt: i.UpdatedAt,
		UserID:    i.UserID,
		JobID:     i.JobID,
	}
}

func DatabaseInterviewSessionToInterviewSession(s database.InterviewSession) InterviewSession {
	return InterviewSession{
		ID:        s.ID,
		Status:    s.Status,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
		UserID:    s.UserID,
		JobID:     s.JobID,

		Transcript: func() json.RawMessage {
			if s.Transcript.Valid {
				return s.Transcript.RawMessage
			}
			return nil
		}(),

		UserFeedbacks: func() json.RawMessage {
			if s.UserFeedbacks.Valid {
				return s.UserFeedbacks.RawMessage
			}
			return nil
		}(),

		HintsUsed: func() json.RawMessage {
			if s.HintsUsed.Valid {
				return s.HintsUsed.RawMessage
			}
			return nil
		}(),

		SubmittedCode: nil,
	}
}

func DatabaseSessionsToSessions(sessions []database.InterviewSession) []InterviewSession {
	result := []InterviewSession{}
	for _, s := range sessions {
		result = append(result, DatabaseInterviewSessionToInterviewSession(s))
	}
	return result
}
