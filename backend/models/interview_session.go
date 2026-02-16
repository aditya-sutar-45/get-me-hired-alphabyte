package models

import (
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

func DatabaseCreateInterviewToCreateInterview(i database.InterviewSession) CreateInterview {
	return CreateInterview{
		ID:        i.ID,
		CreatedAt: i.CreatedAt,
		UpdatedAt: i.UpdatedAt,
		UserID:    i.UserID,
		JobID:     i.JobID,
	}
}
