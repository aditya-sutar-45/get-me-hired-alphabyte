// Package models
package models

import (
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Role         string    `json:"role"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	ResumePath   string    `json:"resume_path"`
	ParsedResume string    `json:"parsed_resume"`
}

func DatabaseUserToUser(dbUser database.User, dbUserProfile database.UserProfile) User {
	resumePathStr := ""
	if dbUserProfile.ResumePath.Valid {
		resumePathStr = dbUserProfile.ResumePath.String
	}

	parsedResumeStr := ""
	if dbUserProfile.ParsedResume.Valid {
		parsedResumeStr = dbUserProfile.ParsedResume.String
	}

	return User{
		ID:           dbUser.ID,
		CreatedAt:    dbUser.CreatedAt,
		UpdatedAt:    dbUser.UpdatedAt,
		Role:         dbUser.Role,
		Username:     dbUser.Username,
		Email:        dbUser.Email,
		ResumePath:   resumePathStr,
		ParsedResume: parsedResumeStr,
	}
}
